"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import { GeometryFigure } from "./geometry-figure";
import { UnitCircle } from "./unit-circle";

type MathTextProps = {
  content: string;
  className?: string;
};

/** Достаёт сырой текст из детей fenced-блока react-markdown. */
function rawText(node: ReactNode): string {
  if (typeof node === "string") {
    return node;
  }
  if (Array.isArray(node)) {
    return node.map(rawText).join("");
  }
  if (node && typeof node === "object" && "props" in node) {
    return rawText((node as { props: { children?: ReactNode } }).props.children);
  }
  return "";
}

function GeoBlock({ source }: { source: string }) {
  try {
    return <GeometryFigure spec={JSON.parse(source)} />;
  } catch {
    return (
      <pre className="not-prose my-4 overflow-x-auto rounded-xl border border-danger/30 bg-danger/5 p-3 text-xs text-danger">
        Не удалось разобрать чертёж (проверьте JSON в блоке ```geo).
      </pre>
    );
  }
}

function CircleBlock({ source }: { source: string }) {
  try {
    return <UnitCircle spec={JSON.parse(source)} />;
  } catch {
    return (
      <pre className="not-prose my-4 overflow-x-auto rounded-xl border border-danger/30 bg-danger/5 p-3 text-xs text-danger">
        Не удалось разобрать окружность (проверьте JSON в блоке ```circle).
      </pre>
    );
  }
}

export function MathText({ content, className = "" }: MathTextProps) {
  return (
    <div className={`prose prose-slate max-w-none ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          pre: ({ children }) => {
            const child = Array.isArray(children) ? children[0] : children;
            const cls =
              child && typeof child === "object" && "props" in child
                ? ((child as { props: { className?: string } }).props.className ?? "")
                : "";
            if (cls.includes("language-geo")) {
              return (
                <GeoBlock
                  source={rawText(
                    (child as { props: { children?: ReactNode } }).props.children,
                  )}
                />
              );
            }
            if (cls.includes("language-circle")) {
              return (
                <CircleBlock
                  source={rawText(
                    (child as { props: { children?: ReactNode } }).props.children,
                  )}
                />
              );
            }
            return (
              <pre className="not-prose my-4 overflow-x-auto rounded-xl border border-line bg-panel p-3 text-sm">
                {children}
              </pre>
            );
          },
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
          p: ({ children }) => {
            const isAnalogs = rawText(children).startsWith("Аналоги:");

            return (
              <p
                className={
                  isAnalogs
                    ? "mb-4 text-[13px] leading-5 text-muted"
                    : "mb-4 leading-7"
                }
              >
                {children}
              </p>
            );
          },
          a: ({ href, children }) => (
            <a
              className="font-semibold text-brand no-underline transition hover:underline"
              href={href}
            >
              {children}
            </a>
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
