import type { FormulaItem } from '../types.js';

export const FORMULA_CATALOG: FormulaItem[] = [
  // ALGEBRA
  {
    id: 'quadratic-formula',
    name: 'Quadratic Formula',
    category: 'algebra',
    formulaLatex: 'x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}',
    description: 'Finds the exact roots of any quadratic equation in standard form ax² + bx + c = 0.',
    conditions: 'Valid for a ≠ 0. Discriminant Δ = b² - 4ac indicates nature of roots.',
    exampleProblem: {
      latex: '2x^2 + 5x - 3 = 0',
      raw: '2x^2 + 5x - 3 = 0',
      subject: 'algebra',
      topic: 'Quadratic Equations',
    },
  },
  {
    id: 'difference-of-squares',
    name: 'Difference of Squares',
    category: 'algebra',
    formulaLatex: 'a^2 - b^2 = (a - b)(a + b)',
    description: 'Factoring formula for subtracting two perfect squares.',
    exampleProblem: {
      latex: '4x^2 - 9 = 0',
      raw: '4x^2 - 9 = 0',
      subject: 'algebra',
      topic: 'Factoring Polynomials',
    },
  },
  {
    id: 'logarithm-rules',
    name: 'Logarithm Product & Power Rules',
    category: 'algebra',
    formulaLatex: '\\log_b(xy) = \\log_b x + \\log_b y, \\quad \\log_b(x^k) = k \\log_b x',
    description: 'Decomposes products into sums and converts exponents to multipliers.',
    exampleProblem: {
      latex: '\\ln(x^2 - 4) = 0',
      raw: 'ln(x^2 - 4) = 0',
      subject: 'algebra',
      topic: 'Logarithmic Equations',
    },
  },
  {
    id: 'exponent-rules',
    name: 'Laws of Exponents',
    category: 'algebra',
    formulaLatex: 'x^a \\cdot x^b = x^{a+b}, \\quad \\frac{x^a}{x^b} = x^{a-b}, \\quad (x^a)^b = x^{ab}',
    description: 'Rules for multiplying, dividing, and exponentiating algebraic powers.',
  },
  {
    id: 'binomial-theorem',
    name: 'Binomial Theorem',
    category: 'algebra',
    formulaLatex: '(a + b)^n = \\sum_{k=0}^{n} \\binom{n}{k} a^{n-k} b^k',
    description: 'Algebraic expansion of powers of a binomial sum.',
  },

  // DERIVATIVES
  {
    id: 'power-rule-derivative',
    name: 'Power Rule for Derivatives',
    category: 'derivatives',
    formulaLatex: '\\frac{d}{dx}\\left[ x^n \\right] = n x^{n-1}',
    description: 'Fundamental derivative rule for any polynomial or power term.',
    exampleProblem: {
      latex: '\\frac{d}{dx}\\left[ 3x^4 - 5x^2 + 7 \\right]',
      raw: 'd/dx [3x^4 - 5x^2 + 7]',
      subject: 'calculus',
      topic: 'Power Rule Derivatives',
    },
  },
  {
    id: 'product-rule',
    name: 'Product Rule',
    category: 'derivatives',
    formulaLatex: '\\frac{d}{dx}\\left[ u \\cdot v \\right] = u\' v + u v\'',
    description: 'Derivative of a product of two differentiable functions.',
    exampleProblem: {
      latex: '\\frac{d}{dx}\\left[ x^2 e^x \\right]',
      raw: 'd/dx [x^2 * e^x]',
      subject: 'calculus',
      topic: 'Product Rule Derivatives',
    },
  },
  {
    id: 'quotient-rule',
    name: 'Quotient Rule',
    category: 'derivatives',
    formulaLatex: '\\frac{d}{dx}\\left[ \\frac{u}{v} \\right] = \\frac{u\' v - u v\'}{v^2}',
    description: 'Derivative of a quotient/fraction of two functions (Low d-High minus High d-Low over Low squared).',
    exampleProblem: {
      latex: '\\frac{d}{dx}\\left[ \\frac{\\sin(x)}{x^2 + 1} \\right]',
      raw: 'd/dx [sin(x)/(x^2 + 1)]',
      subject: 'calculus',
      topic: 'Quotient Rule Derivatives',
    },
  },
  {
    id: 'chain-rule',
    name: 'Chain Rule (Composite Functions)',
    category: 'derivatives',
    formulaLatex: '\\frac{d}{dx}\\left[ f(g(x)) \\right] = f\'(g(x)) \\cdot g\'(x)',
    description: 'Derivative of nested composite functions (derivative of outside evaluated at inside times derivative of inside).',
    exampleProblem: {
      latex: '\\frac{d}{dx}\\left[ \\ln(\\sin(x)) \\right]',
      raw: 'd/dx [ln(sin(x))]',
      subject: 'calculus',
      topic: 'Chain Rule Derivatives',
    },
  },
  {
    id: 'trig-derivatives',
    name: 'Standard Trigonometric Derivatives',
    category: 'trigonometry',
    formulaLatex: '\\frac{d}{dx}[\\sin x] = \\cos x, \\quad \\frac{d}{dx}[\\cos x] = -\\sin x, \\quad \\frac{d}{dx}[\\tan x] = \\sec^2 x',
    description: 'Derivatives of basic trigonometric functions.',
  },
  {
    id: 'exp-log-derivatives',
    name: 'Exponential & Log Derivatives',
    category: 'derivatives',
    formulaLatex: '\\frac{d}{dx}[e^x] = e^x, \\quad \\frac{d}{dx}[\\ln x] = \\frac{1}{x}, \\quad \\frac{d}{dx}[a^x] = a^x \\ln a',
    description: 'Rate of change for natural and general base exponential and logarithmic functions.',
  },

  // INTEGRALS
  {
    id: 'power-rule-integral',
    name: 'Power Rule for Integrals',
    category: 'integrals',
    formulaLatex: '\\int x^n \\, dx = \\frac{x^{n+1}}{n+1} + C \\quad (n \\neq -1)',
    description: 'Standard indefinite antiderivative formula for power terms.',
    exampleProblem: {
      latex: '\\int (4x^3 - 6x + 1) \\, dx',
      raw: 'int (4x^3 - 6x + 1) dx',
      subject: 'calculus',
      topic: 'Indefinite Integrals',
    },
  },
  {
    id: 'u-substitution',
    name: 'Integration by Substitution (u-sub)',
    category: 'integrals',
    formulaLatex: '\\int f(g(x)) g\'(x) \\, dx = \\int f(u) \\, du \\quad (\\text{where } u = g(x))',
    description: 'Reverses the chain rule by substituting an inner function u.',
    exampleProblem: {
      latex: '\\int 2x \\cos(x^2) \\, dx',
      raw: 'int 2x cos(x^2) dx',
      subject: 'calculus',
      topic: 'u-Substitution',
    },
  },
  {
    id: 'integration-by-parts',
    name: 'Integration by Parts (IBP)',
    category: 'integrals',
    formulaLatex: '\\int u \\, dv = u v - \\int v \\, du',
    description: 'Reverses the product rule. Choose u using the LIATE mnemonic (Logarithmic, Inverse trig, Algebraic, Trigonometric, Exponential).',
    exampleProblem: {
      latex: '\\int x^2 \\sin(x) \\, dx',
      raw: 'int x^2 * sin(x) dx',
      subject: 'calculus',
      topic: 'Integration by Parts',
    },
  },
  {
    id: 'fundamental-theorem-calculus',
    name: 'Fundamental Theorem of Calculus',
    category: 'integrals',
    formulaLatex: '\\int_{a}^{b} f(x) \\, dx = F(b) - F(a) \\quad (\\text{where } F\'(x) = f(x))',
    description: 'Connects differentiation and integration to compute exact area under curves.',
    exampleProblem: {
      latex: '\\int_{0}^{2} (3x^2 - 2x) \\, dx',
      raw: 'int_0^2 (3x^2 - 2x) dx',
      subject: 'calculus',
      topic: 'Definite Integrals',
    },
  },

  // LIMITS
  {
    id: 'lhopital-rule',
    name: "L'Hôpital's Rule",
    category: 'limits',
    formulaLatex: '\\lim_{x \\to c} \\frac{f(x)}{g(x)} = \\lim_{x \\to c} \\frac{f\'(x)}{g\'(x)} \\quad \\left(\\text{if form is } \\frac{0}{0} \\text{ or } \\frac{\\pm\\infty}{\\pm\\infty}\\right)',
    description: 'Evaluates indeterminate limit quotients by taking the ratio of derivatives.',
    exampleProblem: {
      latex: '\\lim_{x \\to 0} \\frac{\\sin(3x)}{x}',
      raw: 'lim_{x->0} sin(3x)/x',
      subject: 'calculus',
      topic: "Limits & L'Hôpital",
    },
  },
  {
    id: 'definition-of-derivative',
    name: 'Limit Definition of Derivative',
    category: 'limits',
    formulaLatex: 'f\'(x) = \\lim_{h \\to 0} \\frac{f(x+h) - f(x)}{h}',
    description: 'The fundamental mathematical definition of instantaneous rate of change and tangent slope.',
  },
];
