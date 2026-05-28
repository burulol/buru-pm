import useAuth from "../hooks/useAuth";

export default function Test() {
  const { clearAuth } = useAuth();

  return (
    <div className="flex justify-center items-center h-screen">
      <div className="max-w-sm w-full border border-white">
        <h1 className="text-white">Hello</h1>
        <button onClick={clearAuth} className="bg-white text-black">
          Reset auth
        </button>
      </div>
    </div>
  );
}
