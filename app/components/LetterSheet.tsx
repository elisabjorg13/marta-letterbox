import type { ReactNode } from "react";

export function LetterSheet({
  children,
  tilt = false,
}: {
  children: ReactNode;
  tilt?: boolean;
}) {
  return (
    <div
      className={`relative bg-white border-2 border-gray-300 shadow-lg overflow-hidden ${
        tilt ? "transform rotate-1 hover:rotate-0 transition-transform duration-300" : ""
      }`}
    >
      <div className="relative z-10 p-8">{children}</div>
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(100)].map((_, i) => (
          <div
            key={i}
            className="absolute left-0 right-0 h-px bg-red-400 opacity-60"
            style={{ top: `${(i + 1) * 20}px` }}
          />
        ))}
      </div>
    </div>
  );
}
