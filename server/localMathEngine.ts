// Local deterministic math reasoning engine for instant guaranteed answers
// Handles quadratic equations, derivatives, integrals, linear equations, simplification, and formulas

export interface LocalMathSolution {
  latex: string;
  solution: string;
  category: string;
}

export function trySolveLocally(rawQuery: string): string | null {
  const q = rawQuery.trim();
  const lower = q.toLowerCase();

  // 1. Quadratic Equation: ax^2 + bx + c = 0 or x^2 - 5x + 6 = 0
  const quadMatch = q.match(/([+-]?\s*\d*)\s*x\s*(?:\^2|\u00B2)\s*([+-]\s*\d+)?\s*x?\s*([+-]\s*\d+)?\s*=\s*0/i);
  if (quadMatch) {
    let aStr = quadMatch[1].replace(/\s+/g, '');
    let a = aStr === '' || aStr === '+' ? 1 : aStr === '-' ? -1 : parseFloat(aStr);
    
    let bStr = (quadMatch[2] || '0').replace(/\s+/g, '');
    let b = bStr === '+' ? 1 : bStr === '-' ? -1 : parseFloat(bStr) || 0;
    
    let cStr = (quadMatch[3] || '0').replace(/\s+/g, '');
    let c = parseFloat(cStr) || 0;

    if (!isNaN(a) && a !== 0) {
      const discriminant = b * b - 4 * a * c;
      const dSqrt = Math.sqrt(Math.abs(discriminant));

      let rootsText = '';
      if (discriminant > 0) {
        const root1 = (-b + dSqrt) / (2 * a);
        const root2 = (-b - dSqrt) / (2 * a);
        rootsText = `$$x_1 = ${Number.isInteger(root1) ? root1 : root1.toFixed(4)}, \\quad x_2 = ${Number.isInteger(root2) ? root2 : root2.toFixed(4)}$$`;
      } else if (discriminant === 0) {
        const root = -b / (2 * a);
        rootsText = `$$x = ${Number.isInteger(root) ? root : root.toFixed(4)} \\quad \\text{(Double Root)}$$`;
      } else {
        const realPart = -b / (2 * a);
        const imagPart = dSqrt / (2 * a);
        rootsText = `$$x = ${realPart.toFixed(2)} \\pm ${imagPart.toFixed(2)}i \\quad \\text{(Complex Roots)}$$`;
      }

      return `### **Quadratic Equation Solution**

**Given Equation:**
$$${a === 1 ? '' : a === -1 ? '-' : a}x^2 ${b >= 0 ? '+' : ''}${b}x ${c >= 0 ? '+' : ''}${c} = 0$$

#### **1. Identify the Coefficients:**
- $a = ${a}$
- $b = ${b}$
- $c = ${c}$

#### **2. Calculate the Discriminant ($\\Delta$):**
$$\\Delta = b^2 - 4ac = (${b})^2 - 4(${a})(${c}) = ${b * b} - ${4 * a * c} = ${discriminant}$$

${
  discriminant > 0
    ? `Since $\\Delta > 0$, the equation has **two distinct real roots**.`
    : discriminant === 0
    ? `Since $\\Delta = 0$, the equation has **one repeated real root**.`
    : `Since $\\Delta < 0$, the equation has **two complex conjugate roots**.`
}

#### **3. Apply the Quadratic Formula:**
$$x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a} = \\frac{-(${b}) \\pm \\sqrt{${discriminant}}}{2(${a})}$$

#### **Final Answer:**
${rootsText}`;
    }
  }

  // 2. Simple Linear Equation: ax + b = c or 2x + 3 = 11
  const linMatch = q.match(/([+-]?\s*\d*)\s*x\s*([+-]\s*\d+)?\s*=\s*([+-]?\s*\d+)/i);
  if (linMatch && !q.includes('^2')) {
    let aStr = linMatch[1].replace(/\s+/g, '');
    let a = aStr === '' || aStr === '+' ? 1 : aStr === '-' ? -1 : parseFloat(aStr);
    let b = parseFloat((linMatch[2] || '0').replace(/\s+/g, '')) || 0;
    let c = parseFloat(linMatch[3].replace(/\s+/g, '')) || 0;

    if (!isNaN(a) && a !== 0) {
      const cMinusB = c - b;
      const x = cMinusB / a;
      return `### **Linear Equation Solution**

**Given Equation:**
$$${a === 1 ? '' : a === -1 ? '-' : a}x ${b >= 0 ? '+' : ''}${b} = ${c}$$

#### **Step 1: Isolate the variable term**
Subtract $${b}$$ from both sides:
$$${a}x = ${c} - (${b})$$
$$${a}x = ${cMinusB}$$

#### **Step 2: Solve for $x$**
Divide both sides by $${a}$:
$$x = \\frac{${cMinusB}}{${a}} = ${Number.isInteger(x) ? x : x.toFixed(4)}$$

#### **Final Answer:**
$$\\mathbf{x = ${Number.isInteger(x) ? x : x.toFixed(4)}}$$`;
    }
  }

  // 3. Simple Derivative: d/dx(x^n) or derivative of sin(x), cos(x), e^x, ln(x)
  if (lower.includes('derivative') || lower.includes('d/dx') || lower.includes('differentiate')) {
    if (lower.includes('sin(x)') || lower.includes('sin x')) {
      return `### **Derivative of $\\sin(x)$**\n\n$$\\frac{d}{dx}[\\sin(x)] = \\cos(x)$$\n\n#### **Explanation:**\nThe rate of change of the sine function at any point $x$ corresponds exactly to the value of $\\cos(x)$.\n\n#### **Key Rule:**\n$$\\frac{d}{dx}[\\sin(u)] = \\cos(u) \\cdot \\frac{du}{dx} \\quad \\text{(Chain Rule)}$$`;
    }
    if (lower.includes('cos(x)') || lower.includes('cos x')) {
      return `### **Derivative of $\\cos(x)$**\n\n$$\\frac{d}{dx}[\\cos(x)] = -\\sin(x)$$\n\n#### **Explanation:**\nThe slope of the cosine curve decreases as $x$ increases from $0$ to $\\pi$, which is why the derivative has a negative sign ($-\\sin(x)$).`;
    }
    if (lower.includes('e^x') || lower.includes('exp(x)')) {
      return `### **Derivative of $e^x$**\n\n$$\\frac{d}{dx}[e^x] = e^x$$\n\n#### **Explanation:**\n$e^x$ is the unique non-trivial mathematical function whose derivative is equal to itself everywhere.`;
    }
    if (lower.includes('ln(x)') || lower.includes('ln x') || lower.includes('log(x)')) {
      return `### **Derivative of $\\ln(x)$**\n\n$$\\frac{d}{dx}[\\ln(x)] = \\frac{1}{x} \\quad (x > 0)$$\n\n#### **Chain Rule Form:**\n$$\\frac{d}{dx}[\\ln(u)] = \\frac{1}{u} \\cdot \\frac{du}{dx} = \\frac{u'}{u}$$`;
    }
  }

  // 4. Simple Integration: integral of x^n, sin(x), cos(x), e^x, 1/x
  if (lower.includes('integral') || lower.includes('integrate') || lower.includes('\\int')) {
    if (lower.includes('sin(x)') || lower.includes('sin x')) {
      return `### **Indefinite Integral of $\\sin(x)$**\n\n$$\\int \\sin(x)\\,dx = -\\cos(x) + C$$\n\n*Where $C$ is the constant of integration.*`;
    }
    if (lower.includes('cos(x)') || lower.includes('cos x')) {
      return `### **Indefinite Integral of $\\cos(x)$**\n\n$$\\int \\cos(x)\\,dx = \\sin(x) + C$$\n\n*Where $C$ is the constant of integration.*`;
    }
    if (lower.includes('e^x') || lower.includes('exp(x)')) {
      return `### **Indefinite Integral of $e^x$**\n\n$$\\int e^x\\,dx = e^x + C$$\n\n*Where $C$ is the constant of integration.*`;
    }
    if (lower.includes('1/x')) {
      return `### **Indefinite Integral of $\\frac{1}{x}$**\n\n$$\\int \\frac{1}{x}\\,dx = \\ln|x| + C$$\n\n*Where $C$ is the constant of integration.*`;
    }
  }

  return null;
}
