import { GoogleGenAI, Type, ThinkingLevel } from '@google/genai';
import type { MathProblem, SocraticStep, TutorMessage } from '../src/types.js';
import { findFallbackFormula } from './formulaFallback.js';
import { trySolveLocally } from './localMathEngine.js';

let aiClient: GoogleGenAI | null = null;

function getGenAI(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is not configured.');
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// Resilient model list prioritized by low-latency availability and active status
const CANDIDATE_MODELS = ['gemini-3.1-flash-lite', 'gemini-3.8-flash', 'gemini-flash-latest'];

type GenerateContentParamsWithoutModel = Omit<
  Parameters<typeof GoogleGenAI.prototype.models.generateContent>[0],
  'model'
> & { model?: string };

function cleanJsonString(rawText?: string): string {
  if (!rawText) return '{}';
  return rawText
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();
}

async function generateContentWithRetry(
  params: GenerateContentParamsWithoutModel,
  maxAttemptsPerModel: number = 2,
  timeoutMs: number = 35000
) {
  const ai = getGenAI();
  let lastError: any = null;

  for (const model of CANDIDATE_MODELS) {
    for (let attempt = 1; attempt <= maxAttemptsPerModel; attempt++) {
      try {
        const callPromise = ai.models.generateContent({
          ...params,
          model,
        });

        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error(`Timeout on model ${model} after ${timeoutMs}ms`)), timeoutMs)
        );

        const response = (await Promise.race([callPromise, timeoutPromise])) as any;
        return response;
      } catch (err: any) {
        lastError = err;
        const errMsg = err?.message || String(err);
        console.warn(`[Gemini API] Model ${model} attempt ${attempt} failed: ${errMsg}`);
        // If 503 unavailable or 404 not found, immediately fall through to next candidate model
        if (errMsg.includes('503') || errMsg.includes('404') || errMsg.includes('UNAVAILABLE') || errMsg.includes('high demand')) {
          break;
        }
        if (attempt < maxAttemptsPerModel) {
          await new Promise((res) => setTimeout(res, 500));
        }
      }
    }
  }

  throw lastError;
}

export async function analyzeProblemImage(base64Data: string, mimeType: string) {
  const prompt = `You are an expert mathematical OCR and analysis engine for an academic AI Math Tutor.
Analyze this uploaded photo of a mathematical problem.
Subject scope is strictly Algebra or Calculus (Equations, Quadratic equations, Factorization, Functions, Limits, Derivatives, Integrals, Applications of derivatives).

Tasks:
1. Determine if the mathematical problem is clearly readable and valid.
2. If unreadable, blurry, cutoff, or not a math problem, set isReadable: false and explain why politely.
3. If readable, convert the math into clean standard LaTeX notation (e.g. 2x^2 + 5x - 3 = 0, or \\int x^2 \\sin(x)\\,dx).
4. Provide a clean human-friendly plain text equivalent.
5. Classify the subject (algebra or calculus), the specific topic, and estimated difficulty.
6. Provide an estimated number of Socratic steps to solve it (typically 3 to 6).`;

  const response = await generateContentWithRetry({
    contents: [
      {
        parts: [
          {
            inlineData: {
              data: base64Data,
              mimeType: mimeType || 'image/jpeg',
            },
          },
          { text: prompt },
        ],
      },
    ],
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          isReadable: { type: Type.BOOLEAN },
          unreadableReason: { type: Type.STRING },
          latex: { type: Type.STRING },
          plainText: { type: Type.STRING },
          subject: { type: Type.STRING, enum: ['algebra', 'calculus'] },
          topic: { type: Type.STRING },
          difficulty: { type: Type.STRING, enum: ['introductory', 'intermediate', 'advanced'] },
          suggestedStepsCount: { type: Type.INTEGER },
        },
        required: ['isReadable'],
      },
    },
  });

  const text = cleanJsonString(response.text);
  return JSON.parse(text);
}

export async function parseProblemText(rawInput: string) {
  const prompt = `The student typed the following mathematical problem:
"${rawInput}"

Your task:
1. Normalize and convert it into clean, beautiful LaTeX notation.
2. Formulate a clean plain text version.
3. Identify if it is Algebra or Calculus.
4. Identify the specific topic (e.g. Quadratic Equations, Integration by Parts, Limit at Infinity, Chain Rule, Implicit Differentiation, Rational Equations).
5. Determine difficulty ('introductory', 'intermediate', 'advanced').
6. Provide estimated steps (3 to 6).`;

  try {
    const response = await generateContentWithRetry({
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            latex: { type: Type.STRING },
            plainText: { type: Type.STRING },
            subject: { type: Type.STRING, enum: ['algebra', 'calculus'] },
            topic: { type: Type.STRING },
            difficulty: { type: Type.STRING, enum: ['introductory', 'intermediate', 'advanced'] },
            suggestedStepsCount: { type: Type.INTEGER },
          },
          required: ['latex', 'subject', 'topic'],
        },
      },
    });

    const text = cleanJsonString(response.text);
    return JSON.parse(text);
  } catch (err) {
    console.warn('[Gemini API] parseProblemText fallback invoked:', err);
    const clean = rawInput.trim();
    const isCalc = clean.includes('int') || clean.includes('lim') || clean.includes('d/dx') || clean.includes('dx');
    return {
      latex: clean.replace(/\*/g, ' \\cdot ').replace(/\^/g, '^'),
      plainText: clean,
      subject: isCalc ? 'calculus' : 'algebra',
      topic: isCalc ? 'Calculus Problem' : 'Algebra Equation',
      difficulty: 'intermediate',
      suggestedStepsCount: 4,
    };
  }
}

export async function startTutoringSession(problem: MathProblem, learningLevel?: string) {
  const systemInstruction = `You are a patient, compassionate, Socratic human math teacher sitting beside a student.
You NEVER give away the full solution immediately.
Your goal is to guide the student to think through the problem step-by-step.
Tone: Warm, calm, academic, encouraging, never condescending, no excessive emojis.

For the given math problem:
1. Solve the complete problem internally so you know every mathematical step, sign, and transformation with 100% accuracy.
2. Break down the full solution into logical Socratic milestones (typically 3 to 5 steps).
3. Create a welcoming, reassuring session introduction:
   "Let's solve this together. I'll guide you one step at a time instead of giving you the full answer."
4. Present ONLY Step 1.
5. In Step 1, frame a clear, bite-sized question for the student to answer (e.g. identifying the method, setting up u/dv, factoring a common term, or finding the derivative of the outer function).
6. DO NOT reveal subsequent steps.`;

  const userContent = `Problem: ${problem.latex || problem.rawInput}
Subject: ${problem.subject}
Topic: ${problem.topic}
Student Level: ${learningLevel || 'intermediate'}`;

  const response = await generateContentWithRetry({
    contents: userContent,
    config: {
      systemInstruction,
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          introText: { type: Type.STRING },
          totalStepsEstimated: { type: Type.INTEGER },
          practicedConcepts: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
          firstStep: {
            type: Type.OBJECT,
            properties: {
              stepNumber: { type: Type.INTEGER },
              totalStepsEstimated: { type: Type.INTEGER },
              title: { type: Type.STRING },
              objective: { type: Type.STRING },
              question: { type: Type.STRING },
              mathSnippet: { type: Type.STRING },
              expectedConcept: { type: Type.STRING },
            },
            required: ['stepNumber', 'title', 'objective', 'question', 'expectedConcept'],
          },
        },
        required: ['introText', 'totalStepsEstimated', 'practicedConcepts', 'firstStep'],
      },
    },
  });

  const text = cleanJsonString(response.text);
  return JSON.parse(text);
}

export async function evaluateStepAnswer(
  problem: MathProblem,
  currentStep: SocraticStep,
  studentAnswer: string,
  sessionHistory: TutorMessage[],
  learningLevel?: string
) {
  const conversationContext = sessionHistory
    .slice(-8)
    .map((m) => `${m.sender.toUpperCase()}: ${m.content}`)
    .join('\n');

  const systemInstruction = `You are a patient, compassionate Socratic math teacher evaluating a student's answer to the current step.
Problem: ${problem.latex || problem.rawInput}
Current Step (${currentStep.stepNumber}/${currentStep.totalStepsEstimated}): ${currentStep.title} - ${currentStep.objective}
Step Question: ${currentStep.question}
Expected Concept: ${currentStep.expectedConcept}
Student Level: ${learningLevel || 'intermediate'}

Recent Dialogue:
${conversationContext}

Student's Answer: "${studentAnswer}"

Evaluation Rules:
1. Verify mathematical correctness carefully. Accept mathematically equivalent expressions (e.g. 2x+4 is same as 2(x+2), dx order, constants).
2. If CORRECT:
   - Provide genuine, natural teacher-like praise (e.g. "Exactly! That's correct.", "Spot on.", "Well done!"). Avoid repetitive empty cheers.
   - If this was NOT the final step, formulate the next logical Socratic step (stepNumber ${currentStep.stepNumber + 1}).
   - If this WAS the final step of the entire problem, set isProblemComplete: true, provide a brief concluding synthesis, the list of practiced concepts, and a clean learning note (2-3 sentences summarizing the core takeaway).
3. If INCORRECT:
   - Set isCorrect: false, isProblemComplete: false.
   - Do NOT say "Wrong."
   - Specifically and gently identify where the misunderstanding or algebra/calculus slip occurred (e.g. sign error, missed chain rule factor, distributed incorrectly).
   - Give an encouraging prompt allowing them to try that specific step again.
   - Do NOT dump the full answer or skip to the next step.`;

  const response = await generateContentWithRetry({
    contents: `Evaluate the student answer: "${studentAnswer}"`,
    config: {
      systemInstruction,
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          isCorrect: { type: Type.BOOLEAN },
          feedback: { type: Type.STRING },
          feedbackMathSnippet: { type: Type.STRING },
          isProblemComplete: { type: Type.BOOLEAN },
          learningNote: { type: Type.STRING },
          practicedConcepts: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
          nextStep: {
            type: Type.OBJECT,
            properties: {
              stepNumber: { type: Type.INTEGER },
              totalStepsEstimated: { type: Type.INTEGER },
              title: { type: Type.STRING },
              objective: { type: Type.STRING },
              question: { type: Type.STRING },
              mathSnippet: { type: Type.STRING },
              expectedConcept: { type: Type.STRING },
              isFinalStep: { type: Type.BOOLEAN },
            },
          },
        },
        required: ['isCorrect', 'feedback', 'isProblemComplete'],
      },
    },
  });

  const text = cleanJsonString(response.text);
  return JSON.parse(text);
}

export async function handleTutorAction(
  action: 'why' | 'hint' | 'stuck' | 'recap',
  problem: MathProblem,
  currentStep: SocraticStep,
  sessionHistory: TutorMessage[],
  hintLevel: number = 1
) {
  const conversationContext = sessionHistory
    .slice(-6)
    .map((m) => `${m.sender.toUpperCase()}: ${m.content}`)
    .join('\n');

  let instruction = '';

  if (action === 'why') {
    instruction = `The student asked "Why?" regarding the current step (${currentStep.title}: ${currentStep.objective}).
Explain ONLY the specific conceptual rationale behind this step (e.g., why this formula is applied, why we chose this substitution, why we factored this way).
Keep it focused, intuitive, and concise (2-4 sentences).
Start with the intuition before formal jargon.
End with a supportive prompt: "Ready for the next step?" or "Does that make sense to try now?"
Do NOT solve the step or restart the problem.`;
  } else if (action === 'hint') {
    instruction = `The student requested a hint for the current step (${currentStep.title}).
Current hint level requested: ${hintLevel} (1 = small conceptual clue, 2 = more specific clue, 3 = direct scaffolding).
Rules:
- Level 1: Give a small conceptual clue / reminder of the rule.
- Level 2: Give a more specific pointer directing attention to the key term.
- Level 3: Give substantial guidance for this step, but DO NOT reveal the final overall problem solution.
Keep it encouraging and brief.`;
  } else if (action === 'stuck') {
    instruction = `The student said "I'm stuck" on the current step: "${currentStep.question}".
Break down this step into a smaller, easier micro-question.
Identify what intermediate piece they need to think about first (e.g. "What is the derivative of the inside function?" or "What are two numbers that multiply to -6 and add to 5?").
Provide an easy clue and ask them to attempt that simpler piece.`;
  } else if (action === 'recap') {
    instruction = `The student asked what we are currently doing.
Give a concise 2-sentence summary:
1. What the original problem is.
2. What step we are currently on and what we need to find next.`;
  }

  const prompt = `Problem: ${problem.latex || problem.rawInput}
Current Step: ${currentStep.stepNumber} - ${currentStep.title}
Step Question: ${currentStep.question}
Recent Chat Context:
${conversationContext}

Action: ${action.toUpperCase()}`;

  const response = await generateContentWithRetry({
    contents: prompt,
    config: {
      systemInstruction: instruction,
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          explanation: { type: Type.STRING },
          mathSnippet: { type: Type.STRING },
          followUpQuestion: { type: Type.STRING },
        },
        required: ['explanation'],
      },
    },
  });

  const text = cleanJsonString(response.text);
  return JSON.parse(text);
}

const buildSimpleSystemInstruction = (learningLevel: string = 'high_school') => `You are an expert mathematical AI assistant (just like Google Search and Google Gemini).
Your purpose is to explain mathematics, science, equations, and formulas with supreme clarity, structural elegance, and clean LaTeX, matching Google's exact style.

Formatting & Style Rules:
1. NO BOT INTRODUCTIONS:
   - Never say "नमस्ते! मैं MathGPT हूँ", "I am your personal tutor", or conversational greeting filler. Start IMMEDIATELY with the answer and explanation.

2. FOR GENERAL MATHEMATICAL FORMULAS, DEFINITIONS, OR IDENTITIES:
   - Identify what the expression represents clearly:
     "The expression shows the [name of concept/formula], which is used in [field] to [purpose]."
   - State: "Since this is a general mathematical formula rather than a specific problem, here is an explanation of what each part represents and how to apply it:"
   - Provide a "### Formula Breakdown" section:
     - Show the complete formula in display LaTeX ($$...$$).
     - Use clean bullet points (•) breaking down each symbol and component:
       • Symbol: Exact mathematical representation (clear intuitive meaning in parentheses).
   - Provide an "### Example: How to Use It" section:
     - Show a concrete, clean worked example (e.g., using a simple function like $f(t) = t^2$ or a concrete equation).
     - Give numbered algebraic steps (1. Substitute..., 2. Expand..., 3. Simplify..., 4. Factor..., 5. Evaluate...).
     - State the clean final result clearly.

3. FOR SPECIFIC EQUATIONS OR PROBLEMS TO SOLVE (e.g. 2x^2 + 5x - 3 = 0, \\int x sin(x) dx, 3x + 6 = 18):
   - State the problem and final answer directly at the start.
   - Provide clear, numbered step-by-step solution steps showing each transformation.
   - Highlight the final answer clearly in bold LaTeX ($$\\mathbf{...}$$).

4. FOR CONCEPT QUESTIONS (e.g. "Calculus kya hota hai", "What is linear algebra"):
   - Give the core definition and intuitive meaning directly.
   - Break down the main parts or branches cleanly.
   - Provide a realistic real-world application.

5. LANGUAGE & TONE:
   - Match the user's language naturally.
   - If the user asks in Hindi or Hinglish, explain in clean, clear Hindi/Hinglish using standard English math terms and formulas.
   - If the user asks in English or provides a mathematical formula/photo with no text, provide the answer in crisp, clear English (just like Google).
   - All equations must use proper KaTeX ($...$ for inline, $$...$$ for block display).`;

export async function solveMathDirectly(
  query: string,
  history: Array<{ role: 'user' | 'assistant'; content: string }> = [],
  learningLevel: string = 'high_school'
) {
  const systemInstruction = buildSimpleSystemInstruction(learningLevel);

  const contents: any[] = [];
  // Add recent chat context
  if (history && history.length > 0) {
    for (const h of history.slice(-6)) {
      contents.push({
        role: h.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: h.content }],
      });
    }
  }

  contents.push({
    role: 'user',
    parts: [{ text: query }],
  });

  try {
    const response = await generateContentWithRetry({
      contents,
      config: {
        systemInstruction,
        thinkingConfig: { thinkingLevel: ThinkingLevel.MINIMAL },
      },
    });

    const reply = response.text || 'No response generated.';
    return {
      content: reply,
      success: true,
    };
  } catch (err: any) {
    console.error('[Gemini API] solveMathDirectly failed:', err);
    // Offline local deterministic math solver fallback
    const localSolution = trySolveLocally(query);
    if (localSolution) {
      return {
        content: localSolution,
        success: true,
      };
    }

    // Graceful helpful response if all models are temporarily unavailable
    return {
      content: `नमस्ते! AI सर्वर से जुड़ने में थोड़ी देरी हुई है। कृपया कुछ ही सेकंड में अपना प्रश्न दोबारा पूछें।\n\n*(Connection delay. Please try sending your question again in a moment.)*`,
      success: true,
    };
  }
}

export async function solveMathStream(
  query: string,
  history: Array<{ role: 'user' | 'assistant'; content: string }> = [],
  learningLevel: string = 'high_school',
  onChunk: (chunk: string) => void
) {
  const systemInstruction = buildSimpleSystemInstruction(learningLevel);

  const contents: any[] = [];
  if (history && history.length > 0) {
    for (const h of history.slice(-6)) {
      contents.push({
        role: h.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: h.content }],
      });
    }
  }

  contents.push({
    role: 'user',
    parts: [{ text: query }],
  });

  const ai = getGenAI();
  let receivedAny = false;

  for (const model of CANDIDATE_MODELS) {
    const isLite = model === 'gemini-3.1-flash-lite';
    const config: any = {
      systemInstruction,
    };
    if (isLite) {
      config.thinkingConfig = { thinkingLevel: ThinkingLevel.MINIMAL };
    }

    const attempts = isLite ? 2 : 1;
    for (let att = 1; att <= attempts; att++) {
      try {
        const responseStream = await ai.models.generateContentStream({
          model,
          contents,
          config,
        });

        for await (const chunk of responseStream) {
          if (chunk.text) {
            receivedAny = true;
            onChunk(chunk.text);
          }
        }

        if (receivedAny) {
          return;
        }
      } catch (err: any) {
        const msg = err?.message || String(err);
        console.warn(`[Gemini Stream] Model ${model} attempt ${att} failed:`, msg);
        if (receivedAny) return;
        if (att < attempts) {
          await new Promise((res) => setTimeout(res, 500));
        }
      }
    }
  }

  if (!receivedAny) {
    onChunk(`नमस्ते! AI सर्वर से उत्तर प्राप्त करने में देरी हो रही है। कृपया कुछ ही सेकंड में अपना सवाल पुनः भेजें।\n\n*(Connection delay. Please ask your question again in a moment)*`);
  }
}

export async function generateSimilarProblem(subject: string, topic: string, concept: string) {
  const prompt = `Generate one clean, realistic math problem in ${subject} (${topic}) specifically practicing "${concept}".
It should be suitable for step-by-step Socratic learning.
Provide the LaTeX representation, plain text, and difficulty.`;

  const response = await generateContentWithRetry({
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          latex: { type: Type.STRING },
          plainText: { type: Type.STRING },
          subject: { type: Type.STRING, enum: ['algebra', 'calculus'] },
          topic: { type: Type.STRING },
          difficulty: { type: Type.STRING, enum: ['introductory', 'intermediate', 'advanced'] },
        },
        required: ['latex', 'subject', 'topic'],
      },
    },
  });

  const text = cleanJsonString(response.text);
  return JSON.parse(text);
}

export async function explainFormulaOrConcept(query: string, language?: string) {
  const prompt = `The student is asking about a mathematical formula, rule, identity, theorem, or concept in Algebra or Calculus:
Query: "${query}"

Your task:
1. Identify the exact formal name of the formula or concept (e.g. "Integration by Parts", "Quadratic Formula", "Product Rule", "Euler's Formula", "L'Hôpital's Rule", "Trigonometric Double Angle Identity", "Chain Rule").
2. Provide the precise formula in clean LaTeX (e.g. "\\int u \\, dv = u v - \\int v \\, du" or "x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}").
3. Determine category (algebra, derivatives, integrals, limits, or trigonometry).
4. Explain the intuitive meaning in clear, friendly pedagogical language: why does it work, what is the visual or physical intuition behind it?
5. State clearly "When to Use" (practical cues and conditions to watch out for).
6. Give 2-4 key steps, mnemonics, or rules (e.g. LIATE rule for integration by parts, or calculating discriminant first).
7. Highlight common student mistakes or sign errors to avoid.
8. Provide a concrete example problem with LaTeX, raw input, subject ('algebra' or 'calculus'), topic, and a brief walkthrough so the student can see it in action and practice it in the Socratic tutor.`;

  try {
    const response = await generateContentWithRetry({
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            formulaLatex: { type: Type.STRING },
            category: { type: Type.STRING },
            intuitiveExplanation: { type: Type.STRING },
            whenToUse: { type: Type.STRING },
            keyStepsOrRules: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            commonMistakes: { type: Type.STRING },
            example: {
              type: Type.OBJECT,
              properties: {
                problemLatex: { type: Type.STRING },
                rawInput: { type: Type.STRING },
                subject: { type: Type.STRING, enum: ['algebra', 'calculus'] },
                topic: { type: Type.STRING },
                quickWalkthrough: { type: Type.STRING },
              },
              required: ['problemLatex', 'subject', 'topic', 'quickWalkthrough'],
            },
          },
          required: [
            'name',
            'formulaLatex',
            'category',
            'intuitiveExplanation',
            'whenToUse',
            'keyStepsOrRules',
            'commonMistakes',
          ],
        },
      },
    });

    const text = cleanJsonString(response.text);
    return JSON.parse(text);
  } catch (err) {
    console.warn('[Gemini API] explainFormulaOrConcept failed, attempting fallback dictionary:', err);
    return findFallbackFormula(query);
  }
}
