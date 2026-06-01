import PasswordCard from "../components/PasswordCard";
import { useState, useEffect } from "react";
import useAuth from "../hooks/useAuth";
import { getAllPasswords } from "../services/vault";

export default function Test() {
  const [passwords, setPasswords] = useState([]);
  const { limitedToken } = useAuth();

  async function fetchPasswords() {
    if (!limitedToken) return;
    const result = await getAllPasswords(limitedToken);
    setPasswords(result);
  }

  useEffect(() => {
    async function fetch() {
      if (!limitedToken) return;
      const result = await getAllPasswords(limitedToken);
      setPasswords(result);
    }

    fetch();
  }, [limitedToken]);

  return (
    <div className="flex justify-center items-center h-screen">
      <div className="max-w-6xl w-full border border-white space-y-3 p-4 rounded-lg justify-center h-3/4">
        <div className="flex flex-col space-y-2 p-4">
          {passwords.length > 0 ? (
            passwords.map((entry) => (
              <PasswordCard
                key={entry.id}
                {...entry}
                refresh={fetchPasswords}
              />
            ))
          ) : (
            <h2 className="font-semibold text-2xl text-white">
              No passwords found.
            </h2>
          )}
        </div>
      </div>
    </div>
  );
}
