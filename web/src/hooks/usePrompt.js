import { useState } from "react";

export default function usePrompt() {
  const [promptPromise, setPromptPromise] = useState(null);

  function prompt() {
    return new Promise((resolve, reject) => {
      setPromptPromise({ resolve, reject });
    });
  }

  function submitPrompt(value) {
    promptPromise.resolve(value);
    setPromptPromise(null);
  }

  function cancelPrompt() {
    promptPromise.reject("cancelled");
    setPromptPromise(null);
  }

  return {
    prompt,
    submitPrompt,
    cancelPrompt,
    isPrompting: !!promptPromise,
  };
}
