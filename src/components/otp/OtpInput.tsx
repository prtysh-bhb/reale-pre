/* eslint-disable react-hooks/rules-of-hooks */
import { useRef } from "react";

type Props = {
  length?: number;
  value: string;
  onChange: (next: string) => void;
};

export default function OtpInput({ length = 6, value, onChange }: Props) {
  const refs = Array.from({ length }, () => useRef<HTMLInputElement>(null));

  const setAt = (i: number, char: string) => {
    const chars = value.split("");
    chars[i] = char;
    const v = chars.join("").slice(0, length);
    onChange(v);
  };

  const handleChange = (i: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value.replace(/\D/g, "").slice(-1); // last digit only
    setAt(i, v);
    if (v && refs[i + 1]) refs[i + 1].current?.focus();
  };

  const handleKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !value[i] && refs[i - 1]) {
      e.preventDefault();
      refs[i - 1].current?.focus();
      setAt(i - 1, "");
    }
  };

  return (
    <div className="flex gap-2 justify-center">
      {Array.from({ length }).map((_, i) => (
        <input
          key={i}
          ref={refs[i]}
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          value={value[i] ?? ""}
          onChange={(e) => handleChange(i, e)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          className="w-12 h-12 rounded-md border text-center text-lg tracking-widest
                     focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      ))}
    </div>
  );
}
