import type { FormulaExplanation } from '../src/types.js';

export const FALLBACK_FORMULAS: Record<string, FormulaExplanation> = {
  'integration by parts': {
    name: 'Integration by Parts (IBP)',
    formulaLatex: '\\int u \\, dv = u v - \\int v \\, du',
    category: 'integrals',
    intuitiveExplanation: 'Integration by Parts is the integral counterpart to the Product Rule of differentiation. When you have an integrand that is a product of two distinct types of functions, you differentiate one (u) to simplify it and integrate the other (dv) to reconstruct the original product relationship.',
    whenToUse: 'Use when the integrand is a product of two functions from different families (e.g. algebraic × trigonometric, algebraic × exponential, or logarithmic/inverse trigonometric by itself with dv = dx).',
    keyStepsOrRules: [
      'Choose u and dv using the LIATE mnemonic priority: Logarithmic, Inverse trigonometric, Algebraic, Trigonometric, Exponential.',
      'Differentiate u to find du, and integrate dv to find v.',
      'Substitute into the formula: u*v - ∫(v du).',
      'Evaluate the remaining simpler integral and add + C.'
    ],
    commonMistakes: 'Forgetting the minus sign before ∫(v du), choosing the wrong u (e.g. differentiating exponential instead of polynomial), or missing the constant of integration.',
    example: {
      problemLatex: '\\int x \\cos(x) \\, dx',
      rawInput: 'int x*cos(x) dx',
      subject: 'calculus',
      topic: 'Integration by Parts',
      quickWalkthrough: 'Let u = x (Algebraic) -> du = dx. Let dv = cos(x)dx (Trig) -> v = sin(x). Then: ∫x cos(x)dx = x sin(x) - ∫sin(x)dx = x sin(x) + cos(x) + C.'
    }
  },
  'quadratic formula': {
    name: 'Quadratic Formula',
    formulaLatex: 'x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}',
    category: 'algebra',
    intuitiveExplanation: 'The quadratic formula derives from completing the square on the general quadratic equation ax² + bx + c = 0. The discriminant Δ = b² - 4ac determines whether there are two real roots (Δ > 0), one repeated real root (Δ = 0), or two complex conjugate roots (Δ < 0).',
    whenToUse: 'Use on any quadratic equation ax² + bx + c = 0 where a ≠ 0, especially when factoring by inspection is difficult or when non-integer/complex roots exist.',
    keyStepsOrRules: [
      'Ensure the equation is arranged in standard form: ax² + bx + c = 0.',
      'Identify the coefficients a, b, and c with their proper signs.',
      'Compute the discriminant Δ = b² - 4ac first.',
      'Apply the formula and simplify the fraction and radical.'
    ],
    commonMistakes: 'Sign errors when b is negative (remember -(-b) is +b), squaring negative numbers ((-3)² = 9, not -9), or forgetting to divide the entire numerator by 2a.',
    example: {
      problemLatex: '2x^2 + 5x - 3 = 0',
      rawInput: '2x^2 + 5x - 3 = 0',
      subject: 'algebra',
      topic: 'Quadratic Equations',
      quickWalkthrough: 'Here a = 2, b = 5, c = -3. Discriminant Δ = 5² - 4(2)(-3) = 25 + 24 = 49. Then x = (-5 ± √49) / (2·2) = (-5 ± 7) / 4. Roots are x = 1/2 and x = -3.'
    }
  },
  'chain rule': {
    name: 'Chain Rule for Differentiation',
    formulaLatex: '\\frac{d}{dx}\\left[ f(g(x)) \\right] = f\'(g(x)) \\cdot g\'(x)',
    category: 'derivatives',
    intuitiveExplanation: 'The Chain Rule computes the derivative of composite (nested) functions. Intuitively, it multiplies the instantaneous rate of change of the outer function with respect to the inner by the rate of change of the inner function with respect to x.',
    whenToUse: 'Use whenever a function is inside another function (e.g. sin(3x²), (2x + 1)⁵, ln(cos(x)), e^(x²)).',
    keyStepsOrRules: [
      'Identify the outer function f(u) and the inner function u = g(x).',
      'Take the derivative of the outer function while keeping the inner function unchanged: f\'(g(x)).',
      'Multiply by the derivative of the inner function: g\'(x).'
    ],
    commonMistakes: 'Forgetting to multiply by the inner derivative g\'(x), or differentiating the inside while differentiating the outside simultaneously.',
    example: {
      problemLatex: '\\frac{d}{dx}\\left[ (3x^2 + 2)^4 \\right]',
      rawInput: 'd/dx (3x^2 + 2)^4',
      subject: 'calculus',
      topic: 'Chain Rule Derivatives',
      quickWalkthrough: 'Outer function is u⁴ (derivative is 4u³). Inner is 3x² + 2 (derivative is 6x). Result: 4(3x² + 2)³ · (6x) = 24x(3x² + 2)³.'
    }
  },
  'quotient rule': {
    name: 'Quotient Rule for Differentiation',
    formulaLatex: '\\frac{d}{dx}\\left[ \\frac{u}{v} \\right] = \\frac{u\' v - u v\'}{v^2}',
    category: 'derivatives',
    intuitiveExplanation: 'Calculates the rate of change of a fraction of two functions. Remember the classic mnemonic: "Low d-High minus High d-Low, over the square of what\'s below."',
    whenToUse: 'Use when differentiating a rational fraction where both numerator and denominator contain the variable x.',
    keyStepsOrRules: [
      'Identify numerator u(x) and denominator v(x).',
      'Compute derivatives u\'(x) and v\'(x).',
      'Assemble: (v · u\' - u · v\') / v².',
      'Simplify the numerator without unnecessarily expanding the denominator v².'
    ],
    commonMistakes: 'Reversing the order in the numerator (it MUST be Low d-High minus High d-Low due to the subtraction sign), or trying to cancel terms from the denominator before simplifying.',
    example: {
      problemLatex: '\\frac{d}{dx}\\left[ \\frac{x^2 + 1}{x - 3} \\right]',
      rawInput: 'd/dx (x^2 + 1)/(x - 3)',
      subject: 'calculus',
      topic: 'Quotient Rule Derivatives',
      quickWalkthrough: 'u = x²+1, v = x-3. u\' = 2x, v\' = 1. Derivative = [(x-3)(2x) - (x²+1)(1)] / (x-3)² = (2x² - 6x - x² - 1)/(x-3)² = (x² - 6x - 1)/(x-3)².'
    }
  },
  'product rule': {
    name: 'Product Rule for Differentiation',
    formulaLatex: '\\frac{d}{dx}\\left[ u \\cdot v \\right] = u\' v + u v\'',
    category: 'derivatives',
    intuitiveExplanation: 'When two functions are multiplied together, both contribute to the overall rate of change: the change in the first times the second, plus the first times the change in the second.',
    whenToUse: 'Use when differentiating the product of two functions of x that cannot easily be multiplied out beforehand.',
    keyStepsOrRules: [
      'Identify the two factors u(x) and v(x).',
      'Differentiate each: u\'(x) and v\'(x).',
      'Apply formula: u\'v + uv\'.',
      'Factor out common terms if simplification is needed.'
    ],
    commonMistakes: 'Incorrectly multiplying the individual derivatives (d/dx[uv] ≠ u\'·v\').',
    example: {
      problemLatex: '\\frac{d}{dx}\\left[ x^3 e^x \\right]',
      rawInput: 'd/dx [x^3 * e^x]',
      subject: 'calculus',
      topic: 'Product Rule Derivatives',
      quickWalkthrough: 'u = x³, v = e^x. u\' = 3x², v\' = e^x. Derivative = (3x²)(e^x) + (x³)(e^x) = x²e^x(3 + x).'
    }
  },
  'lhopital': {
    name: "L'Hôpital's Rule",
    formulaLatex: '\\lim_{x \\to c} \\frac{f(x)}{g(x)} = \\lim_{x \\to c} \\frac{f\'(x)}{g\'(x)} \\quad \\left(\\text{for } \\frac{0}{0} \\text{ or } \\frac{\\pm\\infty}{\\pm\\infty}\\right)',
    category: 'limits',
    intuitiveExplanation: "L'Hôpital's Rule allows you to evaluate indeterminate limits of quotients by comparing the rates at which the numerator and denominator are changing near the target point.",
    whenToUse: 'ONLY when direct substitution yields the indeterminate forms 0/0 or ±∞/±∞.',
    keyStepsOrRules: [
      'Verify that direct substitution gives 0/0 or ∞/∞.',
      'Differentiate the numerator f(x) independently -> f\'(x).',
      'Differentiate the denominator g(x) independently -> g\'(x) (Do NOT use quotient rule!).',
      'Re-evaluate the limit of f\'(x)/g\'(x).'
    ],
    commonMistakes: 'Applying the rule when the limit is NOT indeterminate (e.g. 0/5 is 0, 5/0 is undefined/infinite), or mistakenly using the quotient rule formula.',
    example: {
      problemLatex: '\\lim_{x \\to 0} \\frac{\\sin(3x)}{x}',
      rawInput: 'lim_{x->0} sin(3x)/x',
      subject: 'calculus',
      topic: "Limits & L'Hôpital",
      quickWalkthrough: 'Direct substitution gives sin(0)/0 = 0/0 (indeterminate). Differentiate top: 3cos(3x). Differentiate bottom: 1. Limit is 3cos(0)/1 = 3.'
    }
  },
  'u substitution': {
    name: 'Integration by Substitution (u-Substitution)',
    formulaLatex: '\\int f(g(x)) g\'(x) \\, dx = \\int f(u) \\, du \\quad (\\text{where } u = g(x))',
    category: 'integrals',
    intuitiveExplanation: 'u-Substitution is the anti-chain rule. It transforms a complicated integral in terms of x into a simpler standard integral in terms of a new variable u by pairing an inner function with its derivative.',
    whenToUse: 'Use when you spot an inner function g(x) whose derivative g\'(x) (or a constant multiple of it) appears as a factor in the integrand.',
    keyStepsOrRules: [
      'Choose u = g(x) (usually the expression inside parentheses, radicals, or denominators).',
      'Compute du = g\'(x) dx, and solve for dx = du / g\'(x).',
      'Substitute into the integral so all x variables cancel out completely.',
      'Integrate with respect to u, then back-substitute u = g(x).'
    ],
    commonMistakes: 'Leaving residual x terms in the integral after substitution, or forgetting to adjust the integration bounds for definite integrals.',
    example: {
      problemLatex: '\\int 2x (x^2 + 5)^4 \\, dx',
      rawInput: 'int 2x (x^2 + 5)^4 dx',
      subject: 'calculus',
      topic: 'u-Substitution',
      quickWalkthrough: 'Let u = x² + 5 -> du = 2x dx. The integral becomes ∫ u⁴ du = u⁵/5 + C = (x² + 5)⁵/5 + C.'
    }
  },
  'power rule': {
    name: 'Power Rule for Derivatives & Integrals',
    formulaLatex: '\\frac{d}{dx}[x^n] = n x^{n-1}, \\quad \\int x^n dx = \\frac{x^{n+1}}{n+1} + C \\; (n \\neq -1)',
    category: 'derivatives',
    intuitiveExplanation: 'The fundamental polynomial rule. For derivatives, bring the exponent to the front and decrease power by 1. For integrals, do the reverse: increase power by 1 and divide by the new exponent.',
    whenToUse: 'Applicable to any variable raised to a constant real exponent, including negative exponents (1/x²) and fractional exponents (√x = x^(1/2)).',
    keyStepsOrRules: [
      'Rewrite radicals as fractional powers (e.g. ∛x = x^(1/3)).',
      'Rewrite denominators as negative powers (e.g. 1/x³ = x^(-3)).',
      'Apply the power formula.',
      'Remember: ∫(1/x) dx = ln|x| + C when n = -1.'
    ],
    commonMistakes: 'Trying to apply power rule to exponential functions like 2^x (which is 2^x ln(2), not x·2^(x-1)), or applying derivative rule when integrating.',
    example: {
      problemLatex: '\\frac{d}{dx}\\left[ 5x^3 - 4\\sqrt{x} + \\frac{2}{x} \\right]',
      rawInput: 'd/dx [5x^3 - 4sqrt(x) + 2/x]',
      subject: 'calculus',
      topic: 'Power Rule Derivatives',
      quickWalkthrough: 'Rewrite: 5x³ - 4x^(1/2) + 2x^(-1). Derivative: 15x² - 2x^(-1/2) - 2x^(-2) = 15x² - 2/√x - 2/x².'
    }
  },
  'trigonometric derivatives': {
    name: 'Standard Trigonometric Derivatives',
    formulaLatex: '\\frac{d}{dx}[\\sin x] = \\cos x, \\quad \\frac{d}{dx}[\\cos x] = -\\sin x, \\quad \\frac{d}{dx}[\\tan x] = \\sec^2 x',
    category: 'trigonometry',
    intuitiveExplanation: 'The derivative of a trig function reflects its cyclical slope on the unit circle. Remember that every co-function (cos, cot, csc) has a negative sign in its derivative.',
    whenToUse: 'Use whenever differentiating expressions involving sin(x), cos(x), tan(x), sec(x), csc(x), or cot(x).',
    keyStepsOrRules: [
      'Identify if it is a basic trig term or composite function needing the Chain Rule (e.g. sin(3x) -> 3cos(3x)).',
      'All "co-" function derivatives carry a minus sign: d/dx[cos] = -sin, d/dx[cot] = -csc², d/dx[csc] = -csc·cot.',
      'Remember: d/dx[tan x] = sec²(x).'
    ],
    commonMistakes: 'Forgetting the negative sign when differentiating cosine, or forgetting to apply chain rule when the argument is not just x.',
    example: {
      problemLatex: '\\frac{d}{dx}\\left[ \\sin(4x) + \\cos(x^2) \\right]',
      rawInput: 'd/dx [sin(4x) + cos(x^2)]',
      subject: 'calculus',
      topic: 'Trigonometric Derivatives',
      quickWalkthrough: 'Apply chain rule to each: d/dx[sin(4x)] = 4cos(4x). d/dx[cos(x²)] = -2x sin(x²). Result: 4cos(4x) - 2x sin(x²).'
    }
  },
  'logarithm rules': {
    name: 'Logarithm Laws & Properties',
    formulaLatex: '\\log_b(xy) = \\log_b x + \\log_b y, \\quad \\log_b\\left(\\frac{x}{y}\\right) = \\log_b x - \\log_b y, \\quad \\log_b(x^k) = k \\log_b x',
    category: 'algebra',
    intuitiveExplanation: 'Logarithms represent exponents. Because multiplying powers adds exponents (b^u · b^v = b^(u+v)), logs turn products into sums, quotients into differences, and powers into multipliers.',
    whenToUse: 'Use when solving exponential or logarithmic equations, or simplifying complex expressions before differentiation/integration.',
    keyStepsOrRules: [
      'Product Rule: log(xy) = log(x) + log(y).',
      'Quotient Rule: log(x/y) = log(x) - log(y).',
      'Power Rule: log(x^k) = k · log(x).',
      'Change of Base: log_b(x) = ln(x) / ln(b).'
    ],
    commonMistakes: 'Distributing log across addition (log(x + y) ≠ log x + log y) or confusing log(x)/log(y) with log(x - y).',
    example: {
      problemLatex: '\\ln(x^2 - 4) = 0',
      rawInput: 'ln(x^2 - 4) = 0',
      subject: 'algebra',
      topic: 'Logarithmic Equations',
      quickWalkthrough: 'Exponentiate both sides with base e: e^(ln(x²-4)) = e^0 -> x² - 4 = 1 -> x² = 5 -> x = ±√5.'
    }
  },
  'fundamental theorem of calculus': {
    name: 'Fundamental Theorem of Calculus (FTC)',
    formulaLatex: '\\int_{a}^{b} f(x) \\, dx = F(b) - F(a) \\quad (\\text{where } F\'(x) = f(x))',
    category: 'integrals',
    intuitiveExplanation: 'FTC connects differentiation and integration. It states that the exact accumulated area under a rate of change curve from a to b equals the net change in its antiderivative F(x).',
    whenToUse: 'Use to evaluate any definite integral with bounds a and b.',
    keyStepsOrRules: [
      'Find the antiderivative F(x) such that F\'(x) = f(x).',
      'Evaluate F at the upper limit: F(b).',
      'Evaluate F at the lower limit: F(a).',
      'Compute the difference: F(b) - F(a).'
    ],
    commonMistakes: 'Subtracting in the wrong order (it MUST be F(upper) - F(lower)), or arithmetic sign errors when the lower bound evaluation is negative.',
    example: {
      problemLatex: '\\int_{1}^{3} (3x^2 - 2x) \\, dx',
      rawInput: 'int_1^3 (3x^2 - 2x) dx',
      subject: 'calculus',
      topic: 'Definite Integrals',
      quickWalkthrough: 'Antiderivative F(x) = x³ - x². Upper: F(3) = 27 - 9 = 18. Lower: F(1) = 1 - 1 = 0. Result = 18 - 0 = 18.'
    }
  }
};

export function findFallbackFormula(query: string): FormulaExplanation {
  const clean = query.toLowerCase().trim();
  
  if (clean.includes('part') || clean.includes('ibp') || clean.includes('liate')) {
    return FALLBACK_FORMULAS['integration by parts'];
  }
  if (clean.includes('quadratic') || clean.includes('discriminant') || clean.includes('b^2 - 4ac') || clean.includes('ax^2') || clean.includes('x^2+')) {
    return FALLBACK_FORMULAS['quadratic formula'];
  }
  if (clean.includes('chain')) {
    return FALLBACK_FORMULAS['chain rule'];
  }
  if (clean.includes('quotient') || clean.includes('fraction derivative') || clean.includes('low d high')) {
    return FALLBACK_FORMULAS['quotient rule'];
  }
  if (clean.includes('product rule') || clean.includes('uv')) {
    return FALLBACK_FORMULAS['product rule'];
  }
  if (clean.includes('hopital') || clean.includes("l'hopital") || clean.includes('0/0') || clean.includes('indeterminate')) {
    return FALLBACK_FORMULAS['lhopital'];
  }
  if (clean.includes('substitut') || clean.includes('u-sub') || clean.includes('usub')) {
    return FALLBACK_FORMULAS['u substitution'];
  }
  if (clean.includes('trig') || clean.includes('sin') || clean.includes('cos') || clean.includes('tan')) {
    return FALLBACK_FORMULAS['trigonometric derivatives'];
  }
  if (clean.includes('log') || clean.includes('ln') || clean.includes('exponent')) {
    return FALLBACK_FORMULAS['logarithm rules'];
  }
  if (clean.includes('fundamental') || clean.includes('ftc') || clean.includes('definite')) {
    return FALLBACK_FORMULAS['fundamental theorem of calculus'];
  }
  if (clean.includes('power rule') || clean.includes('x^n') || clean.includes('power')) {
    return FALLBACK_FORMULAS['power rule'];
  }

  // Check any keys
  for (const [key, formula] of Object.entries(FALLBACK_FORMULAS)) {
    if (clean.includes(key) || formula.name.toLowerCase().includes(clean)) {
      return formula;
    }
  }

  // Default fallback for any query if upstream service is experiencing a 503 burst
  return {
    name: query.length > 30 ? 'Mathematical Formula & Method' : query,
    formulaLatex: 'f(x) \\implies \\text{Step-by-Step Mathematical Method}',
    category: clean.includes('int') || clean.includes('integral') ? 'integrals' : 'algebra',
    intuitiveExplanation: `This concept addresses "${query}". Mathematical methods in Algebra and Calculus break complex operations into standard transformation steps so they can be simplified systematically.`,
    whenToUse: `Apply when encountering algebraic expressions or calculus operations matching "${query}".`,
    keyStepsOrRules: [
      'Identify the structure of the equation or expression.',
      'Apply the corresponding standard algebraic or calculus operation.',
      'Simplify terms systematically step-by-step.',
      'Check boundary conditions and verify your final result.'
    ],
    commonMistakes: 'Skipping intermediate simplification steps or making algebraic sign errors.',
    example: {
      problemLatex: 'x^2 + 3 = 0',
      rawInput: 'x^2 + 3 = 0',
      subject: 'algebra',
      topic: 'Solving Equations',
      quickWalkthrough: 'Subtract 3 from both sides: x² = -3. Take the square root: x = ±√(-3) = ±i√3.'
    }
  };
}
