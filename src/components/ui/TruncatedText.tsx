/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState } from 'react';

interface TruncatedTextProps {
  text: string;
  maxLength: number;
}

export function TruncatedText({ text, maxLength }: TruncatedTextProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  if (!text) return null;
  
  if (text.length <= maxLength) {
    return <p className="whitespace-pre-wrap break-words">{text}</p>;
  }
  
  const truncatedText = text.slice(0, maxLength);
  const remainingText = text.slice(maxLength);
  
  return (
    <div className="whitespace-pre-wrap break-words">
      {isExpanded ? (
        <>
          {text}
          <button
            onClick={() => setIsExpanded(false)}
            className="ml-2 text-blue-600 hover:text-blue-800 font-medium text-sm"
          >
            Show less
          </button>
        </>
      ) : (
        <>
          {truncatedText}...
          <button
            onClick={() => setIsExpanded(true)}
            className="ml-2 text-blue-600 hover:text-blue-800 font-medium text-sm"
          >
            Show more
          </button>
        </>
      )}
    </div>
  );
}