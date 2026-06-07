import {
  Lock,
  SquarePen,
  Trash,
  Eye,
  EyeOff,
  Check,
  Copy,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { getPassword, updatePassword, deletePassword } from "../services/vault";
import VariableSizeInput from "./VariableSizeInput";
import CopyButton from "./CopyButton";
import { formatDistanceToNow } from "date-fns";
import usePrompt from "../hooks/usePrompt";
import MasterPasswordPrompt from "./MasterPasswordPrompt";
import { generatePassword } from "../services/crypto";

export default function PasswordCard({ refresh, ...initial_entry }) {
  const [entry, setEntry] = useState({
    ...initial_entry,
    tag: initial_entry.tag || "",
    url: initial_entry.url || "",
  });
  const [snapshot, setSnapshot] = useState(initial_entry);
  const [editing, setEditing] = useState(false);
  const [key, setKey] = useState(null);
  const { prompt, submitPrompt, cancelPrompt, isPrompting } = usePrompt();

  useEffect(() => {
    const refresh = async () => {
      setEntry({
        ...initial_entry,
        tag: initial_entry.tag || "",
        url: initial_entry.url || "",
      });
      setSnapshot({
        ...initial_entry,
        tag: initial_entry.tag || "",
        url: initial_entry.url || "",
      });
    };

    refresh();
  }, [initial_entry.modified_at]);

  const cleanUp = () => {
    setEntry((prev) => ({ ...prev, password: null }));
    setSnapshot(null);
    setKey(null);
  };

  const revertChanges = () => {
    setEntry({ ...snapshot, password: null });
    setSnapshot({ ...snapshot, password: null });
    setKey(null);
  };

  const handleEditToggle = async (e) => {
    if (e) e.preventDefault();

    if (!editing) {
      try {
        console.log(key === null);
        const { fullToken, masterPassword } =
          key === null ? await prompt() : key;
        const password = await getPassword(entry, fullToken, masterPassword);
        setEntry((prev) => ({ ...prev, password: password }));
        setSnapshot({ ...entry, password: password });
        setEditing(true);
        setKey({ fullToken, masterPassword });
      } catch {
        return;
      }
      return;
    }
    setEditing(false);
    if (
      snapshot.platform === entry.platform &&
      snapshot.tag === entry.tag &&
      snapshot.username === entry.username &&
      snapshot.password === entry.password &&
      snapshot.url === entry.url
    ) {
      cleanUp();
      return;
    }
    try {
      const { fullToken, masterPassword } = key;
      await updatePassword(entry, fullToken, masterPassword);
      cleanUp();
      refresh();
    } catch {
      revertChanges();
    }
  };

  const handleDelete = async () => {
    try {
      const { fullToken } = await prompt();
      await deletePassword(entry, fullToken);
      refresh();
    } catch {
      return;
    }
  };

  return (
    <>
      <MasterPasswordPrompt
        isPrompting={isPrompting}
        onSubmit={submitPrompt}
        onCancel={cancelPrompt}
      />
      <form
        className={`flex justify-between border transition-colors h-fit py-4 rounded-lg
          ${editing ? "bg-amber-950/20 border-amber-800/30 hover:border-amber-600/50" : "bg-fuchsia-950/20 border-fuchsia-800/30  hover:border-fuchsia-600/50"} `}
        onSubmit={handleEditToggle}
      >
        <div className="h-full w-1/16 min-w-2">
          <Lock size={22} className="text-fuchsia-500 mx-auto mt-0.75" />
        </div>
        <div className="h-full w-full flex flex-col space-y-2">
          <div className="flex items-center space-x-2">
            <PlatformField
              value={entry.platform}
              editing={editing}
              setValue={(value) => setEntry({ ...entry, platform: value })}
            />
            {(editing || entry.tag) && (
              <TagField
                value={entry.tag}
                editing={editing}
                setValue={(value) => setEntry({ ...entry, tag: value })}
              />
            )}
          </div>
          <div className="h-full flex flex-col space-y-2">
            <UsernameField
              value={entry.username}
              editing={editing}
              setValue={(value) => setEntry({ ...entry, username: value })}
            />
            <PasswordField
              value={entry.password}
              editing={editing}
              setValue={(value) => setEntry({ ...entry, password: value })}
              id={entry.id}
              setKey={setKey}
              prompt={prompt}
            />
            <URLField
              value={entry.url}
              editing={editing}
              setValue={(value) => setEntry({ ...entry, url: value })}
            />
            <div className="flex items-center w-full">
              <span className="text-xs text-gray-400 w-24">Modified:</span>
              <span className="text-xs text-gray-500">
                {formatDistanceToNow(new Date(entry.modified_at), {
                  addSuffix: true,
                })}
              </span>
            </div>
          </div>
        </div>
        <div className="h-full flex justify-between pr-4 space-x-6">
          <button
            type={editing ? "submit" : "button"}
            onClick={!editing ? handleEditToggle : undefined}
            className="flex flex-col items-center text-sm text-gray-400 hover:text-gray-200 transition-colors h-fit outline-none"
          >
            {editing ? (
              <Check
                size={20}
                className="text-green-500 hover:text-green-300"
              />
            ) : (
              <SquarePen size={20} />
            )}
          </button>
          {editing && (
            <button className="flex flex-col items-center text-sm text-red-500 hover:text-red-300 transition-colors h-fit outline-none">
              <X
                size={20}
                onClick={() => {
                  setEditing(false);
                  revertChanges();
                }}
              />
            </button>
          )}
          <button
            type="button"
            className="flex flex-col items-center text-sm text-gray-400 hover:text-gray-200 transition-colors h-fit outline-none"
          >
            <Trash size={20} onClick={handleDelete} />
          </button>
        </div>
      </form>
    </>
  );
}

function PlatformField({ value, editing, setValue }) {
  return (
    <h2 className="text-xl font-semibold text-white inline-block w-fit">
      <VariableSizeInput
        className={`focus:outline-none text-gray-200 bg-transparent border-b px-0
          ${editing ? "cursor-text border-fuchsia-800 focus:border-fuchsia-500 hover:border-fuchsia-500" : "border-fuchsia-950/0 cursor-default"}`}
        value={value}
        readOnly={!editing}
        onChange={(e) => setValue(e.target.value)}
      />
    </h2>
  );
}

function TagField({ value, editing, setValue }) {
  return (
    <VariableSizeInput
      value={value ? value : ""}
      placeholder="Tag"
      readOnly={!editing}
      onChange={(e) => setValue(e.target.value)}
      className={`px-2 py-1 bg-fuchsia-900/30 text-fuchsia-400 text-xs rounded w-fit inline-block focus:outline-none
        ${editing ? "cursor-text border-b border-fuchsia-800 focus:border-fuchsia-500 hover:border-fuchsia-500" : "border-transparent cursor-default"}`}
    />
  );
}

function UsernameField({ value, editing, setValue }) {
  return (
    <div className="flex items-center w-full">
      <span className="text-xs text-gray-400 w-24">Username:</span>
      <VariableSizeInput
        type="text"
        className={`text-sm w-fit focus:outline-none text-gray-200 bg-transparent border-b
          ${editing ? "cursor-text border-fuchsia-800 focus:border-fuchsia-500 hover:border-fuchsia-500" : "border-transparent cursor-default"}`}
        value={value}
        readOnly={!editing}
        onChange={editing ? (e) => setValue(e.target.value) : undefined}
      />
      <CopyButton value={value} />
    </div>
  );
}

function PasswordField({ value, editing, setValue, id, setKey, prompt }) {
  const placeholder = "placeholder";

  const [isShowingPassword, setShowingPassword] = useState(false);
  const [ref, setRef] = useState(null);
  const [copied, setCopied] = useState(false);
  const [passwordLength, setPasswordLength] = useState(8);
  const [includeSpecialChars, setIncludeSpecialChars] = useState(true);

  const fillInGeneratedPassword = (length, chars) => {
    const generated = generatePassword(length, chars);
    setValue(generated);
  };

  const handleShowPasswordToggle = async () => {
    if (!isShowingPassword) {
      if (editing) {
        setShowingPassword(true);
      } else {
        try {
          const { masterPassword, fullToken } = await prompt();
          const password = await getPassword(
            { id: id },
            fullToken,
            masterPassword,
          );
          setShowingPassword(true);
          setValue(password);
          setKey({ masterPassword, fullToken });
          if (ref.current) ref.current.focus();
        } catch {
          return;
        }
      }
      return;
    }
    setShowingPassword(false);
    if (!editing) {
      setValue(null);
      setKey(null);
    }
  };

  const handleCopy = async () => {
    try {
      if (editing || isShowingPassword) {
        navigator.clipboard.writeText(value);
      } else {
        const { masterPassword, fullToken } = await prompt();
        const password = await getPassword(
          { id: id },
          fullToken,
          masterPassword,
        );
        navigator.clipboard.writeText(password);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 1000);
    } catch {
      return;
    }
  };

  return (
    <>
      <div className="flex items-center w-full">
        <span className="text-xs text-gray-400 w-24">Password:</span>
        <VariableSizeInput
          setRef={setRef}
          type={isShowingPassword ? "text" : "password"}
          className={`text-sm w-fit focus:outline-none text-gray-200 bg-transparent border-b
          ${editing ? "cursor-text border-fuchsia-800 focus:border-fuchsia-500 hover:border-fuchsia-500" : "border-transparent cursor-default"}`}
          value={!value || value === null ? placeholder : value}
          readOnly={!editing}
          onChange={(e) => setValue(e.target.value)}
        />
        <button
          type="button"
          className="ml-4 text-fuchsia-500 hover:text-fuchsia-400 focus:outline-none"
          onClick={handleShowPasswordToggle}
        >
          {isShowingPassword ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
        <button
          type="button"
          className={`ml-4 ${copied ? "text-green-500" : "text-fuchsia-500 hover:text-fuchsia-400"} focus:outline-none transition-all`}
          onClick={handleCopy}
        >
          {copied ? <Check size={16} /> : <Copy size={16} />}
        </button>
      </div>
      {editing && (
        <div className="flex items-center w-full space-x-4">
          <span className="text-xs text-gray-400 w-24">Generate password</span>
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
            className="w-28 h-1 appearance-none rounded-full outline-none cursor-pointer accent-gray-400 bg-fuchsia-500/80 -ml-4"
          />
          <span className="text-xs text-gray-500 w-2">{passwordLength}</span>
          <div className="flex items-center space-x-1.5">
            <div
              onClick={() => {
                setIncludeSpecialChars(!includeSpecialChars);
                fillInGeneratedPassword(passwordLength, !includeSpecialChars);
              }}
              className={`w-3.5 h-3.5 rounded-sm border flex items-center justify-center cursor-pointer transition-colors shrink-0
                    ${includeSpecialChars ? "bg-fuchsia-600 border-fuchsia-500" : "bg-transparent border-fuchsia-800 hover:border-fuchsia-600"}`}
            >
              {includeSpecialChars && (
                <Check size={12} className="text-black" strokeWidth={3} />
              )}
            </div>
            <span className="text-xs text-gray-400">Characters</span>
          </div>
        </div>
      )}
    </>
  );
}

function URLField({ value, editing, setValue }) {
  return (
    <div className="flex items-center w-full">
      <span className="text-xs text-gray-400 w-24">URL:</span>
      {!editing && (
        <a
          className="text-sm text-fuchsia-500 hover:text-fuchsia-300 transition-colors border-b border-transparent"
          href={value ? value : ""}
          target="_blank"
          rel="noopener noreferrer"
        >
          {value ? value : ""}
        </a>
      )}
      {editing && (
        <VariableSizeInput
          type="text"
          className={`text-sm w-fit focus:outline-none text-gray-200 bg-transparent border-b
            ${editing ? "cursor-text border-fuchsia-800 focus:border-fuchsia-500 hover:border-fuchsia-500" : "border-transparent cursor-default"}`}
          value={value ? value : ""}
          readOnly={!editing}
          onChange={(e) => setValue(e.target.value)}
          placeholder="URL"
        />
      )}
    </div>
  );
}
