import PasswordCard from "../components/PasswordCard";
import { useState, useEffect } from "react";
import useAuth from "../hooks/useAuth";
import { getAllPasswords } from "../services/vault";
import Layout from "../components/Layout";
import { Plus, Search } from "lucide-react";

export default function Vault() {
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
  }, []);

  return (
    <Layout header={<Header />}>
      {passwords.length > 0 ? (
        passwords.map((entry) => (
          <PasswordCard key={entry.id} {...entry} refresh={fetchPasswords} />
        ))
      ) : (
        <h2 className="font-semibold text-2xl text-white">
          No passwords found.
        </h2>
      )}
    </Layout>
  );
}

function Header() {
  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="font-semibold text-3xl text-white inline-block">
          Password Vault
        </h1>
        <button className="bg-fuchsia-600 text-black font-semibold px-2 py-2 rounded-md hover:bg-fuchsia-700">
          <Plus className="w-5 h-5 inline-block mr-1 mb-1" />
          <span>Add Password</span>
        </button>
      </div>
      <div className="relative mt-6">
        <input
          placeholder="Search passwords..."
          className="w-full pl-10 pr-4 py-2 bg-fuchsia-950/30
            border border-fuchsia-800/30 rounded-lg text-white placeholder-gray-400 focus:outline-none
            focus:border-fuchsia-600 transition-colors"
        />
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
      </div>
    </>
  );
}
