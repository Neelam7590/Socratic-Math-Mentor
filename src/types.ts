export type Subject = 'algebra' | 'calculus';

export interface MathProblem {
  id: string;
  rawInput: string;
  latex: string;
  subject: Subject;
  topic: string;
  difficulty?: 'introductory' | 'intermediate' | 'advanced';
  isReadable?: boolean;
  unreadableReason?: string;
  suggestedStepsCount?: number;
}

export interface TutorMessage {
  id: string;
  sender: 'tutor' | 'student' | 'system';
  type: 
    | 'intro'
    | 'step_prompt'
    | 'feedback'
    | 'explanation_why'
    | 'hint'
    | 'stuck_breakdown'
    | 'answer'
    | 'completion'
    | 'recap';
  content: string;
  mathExpression?: string;
  isCorrect?: boolean;
  hintLevel?: number;
  stepNumber?: number;
  timestamp: number;
}

export interface SocraticStep {
  stepNumber: number;
  totalStepsEstimated: number;
  title: string;
  objective: string;
  question: string;
  mathSnippet?: string;
  expectedConcept: string;
  isFinalStep?: boolean;
}

export interface StepAttempt {
  stepNumber: number;
  studentAnswer: string;
  isCorrect: boolean;
  tutorFeedback: string;
  timestamp: number;
}

export interface TutorSession {
  id: string;
  problem: MathProblem;
  status: 'active' | 'completed';
  currentStep: SocraticStep;
  messages: TutorMessage[];
  attempts: StepAttempt[];
  hintsUsedCount: number;
  whyAskedCount: number;
  stuckUsedCount: number;
  practicedConcepts: string[];
  learningNote?: string;
  startTime: number;
  completedTime?: number;
}

export interface UserProgressData {
  problemsSolved: number;
  algebraCount: number;
  calculusCount: number;
  topicsPracticed: Record<string, number>;
  conceptsNeedingPractice: {
    concept: string;
    mistakeCount: number;
    subject: Subject;
    lastDetected: number;
  }[];
  recentSessions: {
    id: string;
    latex: string;
    topic: string;
    subject: Subject;
    date: number;
    stepsCount: number;
  }[];
}

export interface UserSettings {
  learningLevel: 'high_school' | 'intro_college' | 'advanced';
  theme: 'light' | 'dark';
  language: 'en';
  soundEnabled: boolean;
}

export interface FormulaItem {
  id: string;
  name: string;
  category: 'algebra' | 'derivatives' | 'integrals' | 'limits' | 'trigonometry';
  formulaLatex: string;
  description: string;
  conditions?: string;
  exampleProblem?: {
    latex: string;
    raw: string;
    subject: Subject;
    topic: string;
  };
}

export interface FormulaExplanation {
  name: string;
  formulaLatex: string;
  category: string;
  intuitiveExplanation: string;
  whenToUse: string;
  keyStepsOrRules: string[];
  commonMistakes: string;
  example?: {
    problemLatex: string;
    rawInput: string;
    subject: Subject;
    topic: string;
    quickWalkthrough: string;
  };
}
