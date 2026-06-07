import PasswordCard from "../components/PasswordCard";
import MasterPasswordPrompt from "../components/MasterPasswordPrompt";
import { useState, useEffect } from "react";
import useAuth from "../hooks/useAuth";
import usePrompt from "../hooks/usePrompt";
import { getAllPasswords, savePassword } from "../services/vault";
import Layout from "../components/Layout";
import VariableSizeInput from "../components/VariableSizeInput";
import { Lock, Plus, Search, Check, X, Eye, EyeOff } from "lucide-react";
import { generatePassword } from "../services/crypto";

export default function Vault() {
  const [passwords, setPasswords] = useState([]);
  const { limitedToken } = useAuth();
  const [addPassword, setAddPassword] = useState(false);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  async function fetchPasswords() {
    if (!limitedToken) return;
    setLoading(true);
    const result = await getAllPasswords(limitedToken);
    result.sort((a, b) => new Date(b.modified_at) - new Date(a.modified_at));
    setPasswords(result);
    setLoading(false);
  }

  useEffect(() => {
    async function fetch() {
      fetchPasswords();
    }

    fetch();
  }, []);

  async function handleAdd() {
    setAddPassword(!addPassword);
  }

  const filtered = passwords.filter(
    (entry) =>
      entry.platform.toLowerCase().includes(search.toLowerCase()) ||
      entry.username.toLowerCase().includes(search.toLowerCase()) ||
      (entry.tag && entry.tag.toLowerCase().includes(search.toLowerCase())) ||
      (entry.url && entry.url.toLowerCase().includes(search.toLowerCase())),
  );

  return (
    <Layout
      header={
        <Header
          addPassword={addPassword}
          handleAdd={handleAdd}
          search={search}
          setSearch={setSearch}
        />
      }
    >
      {addPassword && (
        <NewPassword
          setFormActive={setAddPassword}
          refresh={fetchPasswords}
          passwords={passwords}
        />
      )}
      {filtered.length > 0 ? (
        filtered.map((entry) => (
          <PasswordCard key={entry.id} {...entry} refresh={fetchPasswords} />
        ))
      ) : !loading && !addPassword ? (
        <h2 className="font-semibold text-2xl text-white">
          No passwords found.
        </h2>
      ) : null}
    </Layout>
  );
}

function Header({ addPassword, handleAdd, search, setSearch }) {
  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="font-semibold text-3xl text-white inline-block">
          Password Vault
        </h1>
        <button
          className="bg-fuchsia-600 text-black font-semibold px-2 py-2 rounded-md hover:bg-fuchsia-700"
          onClick={handleAdd}
        >
          {addPassword ? (
            <X className="w-5 h-5 inline-block mr-1 mb-1 outline-none focus:outline-none" />
          ) : (
            <Plus className="w-5 h-5 inline-block mr-1 mb-1 outline-none focus:outline-none" />
          )}
          <span>{addPassword ? "Cancel" : "Add Password"}</span>
        </button>
      </div>
      <div className="relative mt-6">
        <input
          placeholder="Search passwords..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-fuchsia-950/30
            border border-fuchsia-800/30 rounded-lg text-white placeholder-gray-400 focus:outline-none
            focus:border-fuchsia-600 transition-colors"
        />
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
      </div>
    </>
  );
}

function NewPassword({ setFormActive, refresh, passwords }) {
  const { prompt, submitPrompt, cancelPrompt, isPrompting } = usePrompt();
  const [entry, setEntry] = useState({
    platform: "",
    username: "",
    password: generatePassword(8, true),
    tag: "",
    url: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [passwordLength, setPasswordLength] = useState(8);
  const [includeSpecialChars, setIncludeSpecialChars] = useState(true);

  const fillInGeneratedPassword = (length, chars) => {
    const generated = generatePassword(length, chars);
    setEntry({ ...entry, password: generated });
  };

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === "Escape") {
        setError("");
        setFormActive(false);
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!entry.platform || !entry.username || !entry.password) {
      setError("Platform, username, and password are required.");
      return;
    }

    const submitPass = async () => {
      const pass = entry.password;

      let exists = false;
      for (let pw of passwords || []) {
        if (pw.platform === entry.platform && pw.username === entry.username) {
          exists = true;
          break;
        }
      }

      if (exists) {
        setError("Platform - Username combination already exists.");
        return;
      }

      try {
        const { fullToken, masterPassword } = await prompt();
        await savePassword(entry, fullToken, masterPassword);
        setFormActive(false);
        refresh();
      } catch (err) {
        if (err.message == "400") {
          setError("Platform - Username combination already exists.");
          setEntry({ ...entry, password: pass });
        }
      }
    };

    submitPass();
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => setError(""), 2000);
    return () => clearTimeout(timeoutId);
  }, [error]);

  return (
    <>
      <MasterPasswordPrompt
        isPrompting={isPrompting}
        onSubmit={submitPrompt}
        onCancel={cancelPrompt}
      />
      <form
        onSubmit={(e) => handleSubmit(e)}
        className="flex justify-between border transition-colors h-fit py-4
        rounded-lg bg-green-950/20 border-green-800/30  hover:border-green-600/50"
      >
        <div className="h-full w-1/16 min-w-2">
          <Lock size={22} className="text-white mx-auto mt-0.75" />
        </div>
        <div className="h-full w-full flex flex-col space-y-2">
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-semibold text-white inline-block w-fit">
              <VariableSizeInput
                className="focus:outline-none text-gray-200 bg-transparent border-b px-0
                      cursor-text border-green-800 focus:border-green-500 hover:border-green-500"
                value={entry.platform}
                placeholder="Platform"
                onChange={(e) =>
                  setEntry({ ...entry, platform: e.target.value })
                }
              />
            </h2>
            <VariableSizeInput
              value={entry.tag}
              placeholder="Tag"
              onChange={(e) => setEntry({ ...entry, tag: e.target.value })}
              className="px-2 py-1 bg-green-900/30 text-green-400 text-xs rounded w-fit inline-block focus:outline-none
                    cursor-text border-b border-green-800 focus:border-green-500 hover:border-green-500"
            />
            {error && (
              <span className="ml-4 text-red-500 text-sm">{error}</span>
            )}
          </div>
          <div className="h-full flex flex-col space-y-2">
            <div className="flex items-center w-full">
              <span className="text-xs text-gray-400 w-24">Username:</span>
              <VariableSizeInput
                type="text"
                className="text-sm w-fit focus:outline-none text-gray-200 bg-transparent border-b
                      cursor-text border-green-800 focus:border-green-500 hover:border-green-500"
                value={entry.username}
                placeholder="Username"
                onChange={(e) =>
                  setEntry({ ...entry, username: e.target.value })
                }
              />
            </div>
            <div className="flex items-center w-full">
              <span className="text-xs text-gray-400 w-24">Password:</span>
              <VariableSizeInput
                type={showPassword ? "text" : "password"}
                className="text-sm w-fit focus:outline-none text-gray-200 bg-transparent border-b
                      cursor-text border-green-800 focus:border-green-500 hover:border-green-500"
                value={entry.password}
                placeholder="Password"
                onChange={(e) =>
                  setEntry({ ...entry, password: e.target.value })
                }
              />
              <button
                type="button"
                className="ml-4 text-white hover:text-gray-300 focus:outline-none"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <div className="flex items-center w-full space-x-4">
              <span className="text-xs text-gray-400 w-24">
                Generate password
              </span>
              <input
                type="range"
                min={8}
                max={32}
                value={passwordLength}
                onChange={(e) => {
                  setPasswordLength(Number(e.target.value));
                  fillInGeneratedPassword(
                    Number(e.target.value),
                    includeSpecialChars,
                  );
                }}
                className="w-28 h-1 appearance-none rounded-full outline-none cursor-pointer accent-gray-400 bg-green-500/80 -ml-4"
              />
              <span className="text-xs text-gray-500 w-2">
                {passwordLength}
              </span>
              <div className="flex items-center space-x-1.5">
                <div
                  onClick={() => {
                    setIncludeSpecialChars(!includeSpecialChars);
                    fillInGeneratedPassword(
                      passwordLength,
                      !includeSpecialChars,
                    );
                  }}
                  className={`w-3.5 h-3.5 rounded-sm border flex items-center justify-center cursor-pointer transition-colors shrink-0
                    ${includeSpecialChars ? "bg-green-600 border-green-500" : "bg-transparent border-green-800 hover:border-green-600"}`}
                >
                  {includeSpecialChars && (
                    <Check size={12} className="text-black" strokeWidth={3} />
                  )}
                </div>
                <span className="text-xs text-gray-400">Characters</span>
              </div>
            </div>
            <div className="flex items-center w-full">
              <span className="text-xs text-gray-400 w-24">URL:</span>
              <VariableSizeInput
                type="text"
                className="text-sm w-fit focus:outline-none text-gray-200 bg-transparent border-b
                        cursor-text border-green-800 focus:border-green-500 hover:border-green-500"
                value={entry.url}
                placeholder="URL"
                onChange={(e) => setEntry({ ...entry, url: e.target.value })}
              />
            </div>
          </div>
        </div>
        <div className="h-full w-24 flex justify-between pr-4">
          <button
            type="submit"
            className="flex flex-col items-center text-sm text-green-500 hover:text-green-300 transition-colors h-fit outline-none"
          >
            <Check size={20} />
          </button>
          <button className="flex flex-col items-center text-sm text-red-500 hover:text-red-300 transition-colors h-fit outline-none">
            <X size={20} onClick={() => setFormActive(false)} />
          </button>
        </div>
      </form>
    </>
  );
}
