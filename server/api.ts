import { Router, Request, Response } from 'express';
import {
  analyzeProblemImage,
  parseProblemText,
  startTutoringSession,
  evaluateStepAnswer,
  handleTutorAction,
  generateSimilarProblem,
  explainFormulaOrConcept,
  solveMathDirectly,
} from './geminiService.js';

export const apiRouter = Router();

// 0. Direct Math Solver & Conversation Endpoint (ChatGPT Style)
apiRouter.post('/solve', async (req: Request, res: Response) => {
  try {
    const { query, history, learningLevel } = req.body;
    if (!query || typeof query !== 'string') {
      res.status(400).json({ error: 'Query is required.' });
      return;
    }
    const result = await solveMathDirectly(query, history || [], learningLevel || 'intro_college');
    res.json(result);
  } catch (error: any) {
    console.error('Error solving math query:', error);
    res.status(500).json({ error: error.message || 'Failed to solve math query.' });
  }
});

// 1. Analyze Photo/Image of Math Problem
apiRouter.post('/analyze-image', async (req: Request, res: Response) => {
  try {
    const { imageBase64, mimeType } = req.body;
    if (!imageBase64) {
      res.status(400).json({ error: 'Image data is required.' });
      return;
    }
    const result = await analyzeProblemImage(imageBase64, mimeType || 'image/jpeg');
    res.json(result);
  } catch (error: any) {
    console.error('Error analyzing problem image:', error);
    res.status(500).json({ error: error.message || 'Failed to analyze image.' });
  }
});

// 2. Parse and normalize typed text
apiRouter.post('/parse-text', async (req: Request, res: Response) => {
  try {
    const { text } = req.body;
    if (!text || typeof text !== 'string') {
      res.status(400).json({ error: 'Problem text is required.' });
      return;
    }
    const result = await parseProblemText(text);
    res.json(result);
  } catch (error: any) {
    console.error('Error parsing problem text:', error);
    res.status(500).json({ error: error.message || 'Failed to parse problem text.' });
  }
});

// 3. Start Socratic Tutoring Session
apiRouter.post('/tutor/start', async (req: Request, res: Response) => {
  try {
    const { problem, learningLevel } = req.body;
    if (!problem) {
      res.status(400).json({ error: 'Problem definition is required.' });
      return;
    }
    const result = await startTutoringSession(problem, learningLevel);
    res.json(result);
  } catch (error: any) {
    console.error('Error starting tutoring session:', error);
    res.status(500).json({ error: error.message || 'Failed to start tutoring session.' });
  }
});

// 4. Evaluate Step Answer
apiRouter.post('/tutor/evaluate', async (req: Request, res: Response) => {
  try {
    const { problem, currentStep, studentAnswer, sessionHistory, learningLevel } = req.body;
    if (!problem || !currentStep || studentAnswer === undefined) {
      res.status(400).json({ error: 'Missing required parameters for step evaluation.' });
      return;
    }
    const result = await evaluateStepAnswer(
      problem,
      currentStep,
      studentAnswer,
      sessionHistory || [],
      learningLevel
    );
    res.json(result);
  } catch (error: any) {
    console.error('Error evaluating step answer:', error);
    res.status(500).json({ error: error.message || 'Failed to evaluate answer.' });
  }
});

// 5. Handle Tutor Actions ("Why", "Hint", "I'm Stuck", "Recap")
apiRouter.post('/tutor/action', async (req: Request, res: Response) => {
  try {
    const { action, problem, currentStep, sessionHistory, hintLevel } = req.body;
    if (!action || !problem || !currentStep) {
      res.status(400).json({ error: 'Missing action or step data.' });
      return;
    }
    const result = await handleTutorAction(
      action,
      problem,
      currentStep,
      sessionHistory || [],
      hintLevel || 1
    );
    res.json(result);
  } catch (error: any) {
    console.error('Error executing tutor action:', error);
    res.status(500).json({ error: error.message || 'Failed to perform tutor action.' });
  }
});

// 6. Generate Similar Problem for practice
apiRouter.post('/tutor/similar-problem', async (req: Request, res: Response) => {
  try {
    const { subject, topic, concept } = req.body;
    const result = await generateSimilarProblem(
      subject || 'calculus',
      topic || 'integration',
      concept || 'integration by parts'
    );
    res.json(result);
  } catch (error: any) {
    console.error('Error generating similar problem:', error);
    res.status(500).json({ error: error.message || 'Failed to generate practice problem.' });
  }
});

// 7. Explain Formula, Theorem, Rule, or Concept
apiRouter.post('/formulas/explain', async (req: Request, res: Response) => {
  try {
    const { query, language } = req.body;
    if (!query || typeof query !== 'string') {
      res.status(400).json({ error: 'Formula query is required.' });
      return;
    }
    const result = await explainFormulaOrConcept(query, language);
    res.json(result);
  } catch (error: any) {
    console.error('Error explaining formula:', error);
    res.status(500).json({ error: error.message || 'Failed to explain formula.' });
  }
});
