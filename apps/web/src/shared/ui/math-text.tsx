"use client";

import Image from "next/image";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";

type MathTextProps = {
  content: string;
  className?: string;
};

export function MathText({ content, className = "" }: MathTextProps) {
  return (
    <div className={`prose prose-slate max-w-none ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          img: ({ src, alt }) => {
            if (!src || typeof src !== "string") {
              return null;
            }
            
            return (
              <Image
                src={src}
                alt={alt || ""}
                width={400}
                height={300}
                className="mx-auto my-6 rounded-xl border border-line shadow-sm"
                priority={false}
              />
            );
          },
          p: ({ children }) => (
            <p className="mb-4 leading-7">{children}</p>
          ),
          strong: ({ children }) => (
            <strong className="font-bold text-ink">{children}</strong>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
