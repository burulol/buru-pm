export default function AuthSubmitErrBtn({ text, disabled, error }) {
  return (
    <button
      type="submit"
      disabled={disabled}
      className={`w-full py-2 rounded-lg bg-fuchsia-700 text-black font-medium
                                ${disabled ? "opacity-70" : "hover:bg-fuchsia-600 transition "}
                                ${error ? "bg-red-500" : ""}`}
    >
      {error ? error : text}
    </button>
  );
}
