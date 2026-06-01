import { useState } from "react";
import { Copy, Check } from "lucide-react";

export default function CopyButton({ value, size = 16 }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1000);
  };

  return (
    <button
      type="button"
      className={`ml-4 ${copied ? "text-green-500" : "text-fuchsia-500 hover:text-fuchsia-400"} focus:outline-none transition-all`}
      onClick={handleCopy}
    >
      {copied ? <Check size={size} /> : <Copy size={size} />}
    </button>
  );
}
