import React from 'react';

export const RollingText: React.FC<{ text: string }> = ({ text }) => {
  return (
    <span className="relative overflow-hidden inline-flex">
      <span className="inline-flex">
        {text.split("").map((c, i) => (
          <span
            key={i}
            className="relative inline-block transition-transform duration-500 ease-[0.16,1,0.3,1] group-hover:-translate-y-full"
            style={{ transitionDelay: `${i * 12}ms` }}
          >
            {c === " " ? "\u00A0" : c}
          </span>
        ))}
      </span>
      <span className="absolute inset-0 inline-flex">
        {text.split("").map((c, i) => (
          <span
            key={i}
            className="relative inline-block transition-transform duration-500 ease-[0.16,1,0.3,1] translate-y-full group-hover:translate-y-0"
            style={{ transitionDelay: `${i * 12}ms` }}
          >
            {c === " " ? "\u00A0" : c}
          </span>
        ))}
      </span>
    </span>
  );
};
