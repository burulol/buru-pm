import { Mail, Lock, Repeat2, Eye, EyeOff } from "lucide-react";
import { useState } from "react";

function validateEmail(value) {
  if (value.length === 0) return true;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function validatePassword(value) {
  if (value.length === 0) return true; // Allow empty password for better UX, actual validation will be done on submit
  return value.length >= 8;
}

export default function TextField({
  type,
  value,
  onChange,
  placeholder,
  isInvalid,
  onValidityChange,
  ref,
}) {
  let validationFunc = () => true;
  if (type === "email") validationFunc = validateEmail;
  else if (type === "password") validationFunc = validatePassword;

  const [showPassword, setShowPassword] = useState(false);

  const invalid = isInvalid !== undefined ? isInvalid : !validationFunc(value);

  const htmlType = type === "repeat_password" ? "password" : type;

  return (
    <div className="relative">
      {type === "email" && (
        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-fuchsia-700/60 w-4 h-4" />
      )}
      {type === "password" && (
        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-fuchsia-700/60 w-4 h-4" />
      )}
      {type === "repeat_password" && (
        <Repeat2 className="absolute left-3 top-1/2 -translate-y-1/2 text-fuchsia-700/60 w-4 h-4" />
      )}
      <input
        ref={ref}
        type={htmlType === "password" && showPassword ? "text" : htmlType}
        placeholder={placeholder}
        value={value}
        onChange={(e) => {
          onChange(e);
          if (onValidityChange) onValidityChange;
        }}
        className={`w-full pl-10 pr-4 py-2 rounded-lg bg-white/5 text-white placeholder-gray-500 focus:outline-none
                         ${invalid ? "ring-1 ring-red-500" : "ring-0 focus:ring-1 focus:ring-fuchsia-700/60 transition"}`}
      />
      {(type === "password" || type === "repeat_password") && (
        <button
          type="button"
          className="absolute right-3 top-1/2 -translate-y-1/2 text-fuchsia-700/60 w-4 h-4 outline-none"
          onMouseDown={() => setShowPassword(true)}
          onMouseUp={() => setShowPassword(false)}
          onMouseLeave={() => setShowPassword(false)}
        >
          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      )}
    </div>
  );
}
