export function MathBackground() {
  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none opacity-[0.035] dark:opacity-[0.045] transition-opacity"
      aria-hidden="true"
    >
      {/* Subtle floating math glyphs across the viewport */}
      <div className="absolute top-[8%] left-[6%] font-serif text-6xl rotate-[-12deg]">∫</div>
      <div className="absolute top-[18%] right-[8%] font-serif text-5xl rotate-[15deg]">∑</div>
      <div className="absolute top-[38%] left-[12%] font-serif text-4xl rotate-[-8deg]">π</div>
      <div className="absolute top-[48%] right-[14%] font-serif text-5xl rotate-[10deg]">√x</div>
      <div className="absolute top-[65%] left-[8%] font-serif text-4xl rotate-[6deg]">∂/∂x</div>
      <div className="absolute top-[78%] right-[10%] font-serif text-6xl rotate-[-15deg]">∞</div>
      <div className="absolute top-[28%] left-[45%] font-serif text-3xl rotate-[4deg]">e^{'{i\\pi}'}</div>
      <div className="absolute top-[82%] left-[42%] font-serif text-4xl rotate-[-6deg]">lim_{'{x\\to 0}'}</div>
      <div className="absolute top-[12%] left-[75%] font-serif text-3xl rotate-[12deg]">θ</div>
      <div className="absolute top-[55%] left-[50%] font-serif text-5xl rotate-[-10deg]">∆</div>
      <div className="absolute top-[88%] left-[18%] font-serif text-4xl rotate-[8deg]">dx</div>
      <div className="absolute top-[42%] right-[32%] font-serif text-4xl rotate-[-14deg]">f(x)</div>
      <div className="absolute top-[70%] right-[38%] font-serif text-3xl rotate-[18deg]">λ</div>
      <div className="absolute top-[22%] left-[28%] font-serif text-3xl rotate-[-5deg]">±</div>
      <div className="absolute top-[62%] right-[5%] font-serif text-4xl rotate-[9deg]">∇</div>
    </div>
  );
}
