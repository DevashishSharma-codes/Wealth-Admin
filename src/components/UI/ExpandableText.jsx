import React, { useState } from "react";

export default function ExpandableText({ text, maxLength = 80 }) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!text) return null;
  if (text.length <= maxLength) {
    return <span className="text-zinc-550 leading-relaxed font-medium">{text}</span>;
  }

  return (
    <div className="text-zinc-550 leading-relaxed font-medium">
      <span>{isExpanded ? text : `${text.slice(0, maxLength)}...`}</span>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsExpanded(!isExpanded);
        }}
        className="ml-1.5 text-[10px] text-[#2B7FFF] hover:text-[#2B7FFF]/80 font-bold hover:underline cursor-pointer focus:outline-none"
      >
        {isExpanded ? "Show less" : "Read more"}
      </button>
    </div>
  );
}
