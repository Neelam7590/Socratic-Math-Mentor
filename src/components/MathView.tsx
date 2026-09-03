import { useEffect, useRef } from 'react';
import katex from 'katex';
import Markdown from 'react-markdown';

interface MathViewProps {
  key?: string | number;
  math: string;
  block?: boolean;
  className?: string;
}

export function MathView({ math, block = false, className = '' }: MathViewProps) {
  const containerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    if (!math || typeof math !== 'string') {
      containerRef.current.textContent = '';
      return;
    }

    // Clean any surrounding dollar signs if passed
    let cleanMath = math.trim();
    if (cleanMath.startsWith('$$') && cleanMath.endsWith('$$')) {
      cleanMath = cleanMath.slice(2, -2).trim();
    } else if (cleanMath.startsWith('$') && cleanMath.endsWith('$')) {
      cleanMath = cleanMath.slice(1, -1).trim();
    }

    try {
      katex.render(cleanMath, containerRef.current, {
        displayMode: block,
        throwOnError: false,
        output: 'htmlAndMathml',
      });
    } catch {
      containerRef.current.textContent = cleanMath;
    }
  }, [math, block]);

  return <span ref={containerRef} className={`math-render select-text ${className}`} />;
}

interface FormattedMathTextProps {
  text: string;
  className?: string;
}

/**
 * Parses inline math ($...$) within normal text nodes
 */
function InlineMathRenderer({ content }: { content: string }) {
  if (!content) return null;
  const parts = content.split(/(\$[^\$\n]+?\$)/g);
  return (
    <>
      {parts.map((part, index) => {
        if (part.startsWith('$') && part.endsWith('$') && part.length > 2) {
          const math = part.slice(1, -1);
          return (
            <MathView
              key={index}
              math={math}
              block={false}
              className="px-1 text-emerald-900 dark:text-emerald-300 font-medium"
            />
          );
        }
        return <span key={index}>{part}</span>;
      })}
    </>
  );
}

/**
 * Parses markdown with headings, bold text, lists, dividers, and LaTeX math blocks ($$ and $)
 */
export function FormattedMathText({ text, className = '' }: FormattedMathTextProps) {
  if (!text) return null;

  // Split text by display math delimiters: $$...$$
  const blockParts = text.split(/(\$\$[\s\S]*?\$\$)/g);

  return (
    <div className={`space-y-2.5 text-sm leading-relaxed ${className}`}>
      {blockParts.map((blockPart, index) => {
        if (blockPart.startsWith('$$') && blockPart.endsWith('$$')) {
          const math = blockPart.slice(2, -2).trim();
          return (
            <div
              key={index}
              className="my-3 py-3 px-4 bg-white/90 dark:bg-stone-950/90 rounded-xl border border-stone-200/80 dark:border-stone-800 text-center overflow-x-auto shadow-2xs"
            >
              <MathView math={math} block={true} className="text-base sm:text-lg" />
            </div>
          );
        }

        if (!blockPart.trim()) return null;

        return (
          <div key={index} className="markdown-content space-y-2">
            <Markdown
              components={{
                h1: ({ children }) => (
                  <h1 className="text-lg font-bold text-stone-900 dark:text-stone-100 mt-4 mb-2 pb-1 border-b border-stone-200 dark:border-stone-800">
                    {children}
                  </h1>
                ),
                h2: ({ children }) => (
                  <h2 className="text-base font-bold text-stone-900 dark:text-stone-100 mt-3 mb-1.5 pb-1 border-b border-stone-200/60 dark:border-stone-800/60">
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-sm sm:text-base font-semibold text-stone-900 dark:text-stone-100 mt-3 mb-1">
                    {children}
                  </h3>
                ),
                h4: ({ children }) => (
                  <h4 className="text-xs sm:text-sm font-semibold text-stone-800 dark:text-stone-200 mt-2 mb-1 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
                    {children}
                  </h4>
                ),
                p: ({ children }) => {
                  if (typeof children === 'string') {
                    return <p className="leading-relaxed"><InlineMathRenderer content={children} /></p>;
                  }
                  return <p className="leading-relaxed">{children}</p>;
                },
                li: ({ children }) => {
                  if (typeof children === 'string') {
                    return <li><InlineMathRenderer content={children} /></li>;
                  }
                  return <li>{children}</li>;
                },
                ul: ({ children }) => (
                  <ul className="list-disc pl-5 space-y-1 text-stone-700 dark:text-stone-300">
                    {children}
                  </ul>
                ),
                ol: ({ children }) => (
                  <ol className="list-decimal pl-5 space-y-1 text-stone-700 dark:text-stone-300">
                    {children}
                  </ol>
                ),
                strong: ({ children }) => (
                  <strong className="font-semibold text-stone-900 dark:text-stone-100">
                    {children}
                  </strong>
                ),
                hr: () => <hr className="my-3 border-stone-200 dark:border-stone-800" />,
                blockquote: ({ children }) => (
                  <blockquote className="border-l-3 border-emerald-500 pl-3 py-1 my-2 bg-emerald-50/40 dark:bg-emerald-950/20 text-stone-700 dark:text-stone-300 rounded-r-lg text-xs sm:text-sm">
                    {children}
                  </blockquote>
                ),
                code: ({ children }) => (
                  <code className="px-1.5 py-0.5 rounded-md bg-stone-200/70 dark:bg-stone-800 text-stone-900 dark:text-stone-100 font-mono text-xs">
                    {children}
                  </code>
                ),
              }}
            >
              {blockPart}
            </Markdown>
          </div>
        );
      })}
    </div>
  );
}
