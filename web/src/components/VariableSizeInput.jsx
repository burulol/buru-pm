import { useEffect, useRef } from "react";

export default function VariableSizeInput({ setRef, ...props }) {
  const spanRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (spanRef.current && inputRef.current) {
      inputRef.current.style.width =
        Math.max(spanRef.current.offsetWidth, 4) + "px";
    }
  }, [props.value]);

  useEffect(() => {
    if (setRef) {
      setRef(inputRef.current);
    }
  }, [setRef]);

  return (
    <>
      <span
        ref={spanRef}
        className={"absolute invisible whitespace-pre " + props.className}
      >
        {props.value ? props.value : props.placeholder ? props.placeholder : ""}
      </span>
      <input ref={inputRef} {...props} />
    </>
  );
}
