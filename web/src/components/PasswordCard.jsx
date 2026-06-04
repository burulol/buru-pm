import {
  Lock,
  SquarePen,
  Trash,
  PenOff,
  Eye,
  EyeOff,
  Check,
  Copy,
} from "lucide-react";
import { useEffect, useState } from "react";
import { getPassword, updatePassword, deletePassword } from "../services/vault";
import VariableSizeInput from "./VariableSizeInput";
import CopyButton from "./CopyButton";
import { formatDistanceToNow } from "date-fns";
import usePrompt from "../hooks/usePrompt";
import MasterPasswordPrompt from "./MasterPasswordPrompt";

export default function PasswordCard({ refresh, ...initial_entry }) {
  const [entry, setEntry] = useState({
    ...initial_entry,
    tag: initial_entry.tag || "",
    url: initial_entry.url || "",
  });
  const [snapshot, setSnapshot] = useState(initial_entry);
  const [editing, setEditing] = useState(false);
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

  const handleEditToggle = async (e) => {
    if (e) e.preventDefault();

    if (!editing) {
      setSnapshot({ ...entry });
      setEditing(true);
      return;
    }
    setEditing(false);
    if (
      snapshot.platform === entry.platform &&
      snapshot.username === entry.username &&
      snapshot.tag === entry.tag &&
      snapshot.url === entry.url
    )
      return;
    try {
      const { masterPassword, fullToken } = await prompt();
      await updatePassword(entry, fullToken, masterPassword);
      refresh();
    } catch {
      setEntry(snapshot);
      return;
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
        className={`flex justify-between border transition-colors h-fit py-4  rounded-lg
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
            <PasswordField editing={editing} entry={entry} prompt={prompt} />
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
        <div className="h-full w-24 flex justify-between pr-4">
          <button
            type={editing ? "submit" : "button"}
            onClick={!editing ? handleEditToggle : undefined}
            className="flex flex-col items-center text-sm text-gray-400 hover:text-gray-200 transition-colors h-fit outline-none"
          >
            {editing ? <PenOff size={20} /> : <SquarePen size={20} />}
          </button>
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

function PasswordField({ editing, entry, prompt }) {
  const placeholder = "placeholder";

  const [showPassword, setShowPassword] = useState(false);
  const [value, setValue] = useState(placeholder);
  const [fetchedPassword, setFetchedPassword] = useState(placeholder);
  const [key, setKey] = useState(null);
  const [ref, setRef] = useState(null);
  const [copied, setCopied] = useState(false);

  const hidePassword = async () => {
    setShowPassword(false);
    if (value === fetchedPassword || key === null) {
      setFetchedPassword("");
      setValue(placeholder);
      setShowPassword(false);
      return;
    }
    const newEntry = { password: value, ...entry };
    try {
      const { masterPassword, fullToken } = key;
      setKey(null);
      await updatePassword(newEntry, fullToken, masterPassword);
    } catch {
      return;
    } finally {
      setFetchedPassword("");
      setValue(placeholder);
      setShowPassword(false);
    }
  };

  useEffect(() => {
    if (!editing) {
      const cleanUp = async () => {
        hidePassword();
      };
      cleanUp();
    }
  }, [editing]);

  async function handleShowPasswordToggle() {
    if (!showPassword) {
      try {
        const { masterPassword, fullToken } = await prompt();
        const password = await getPassword(
          { platform: entry.platform, username: entry.username },
          fullToken,
          masterPassword,
        );
        setKey({ masterPassword, fullToken });
        setFetchedPassword(password);
        setValue(password);
        setShowPassword(true);
        if (ref) {
          ref.focus();
        }
      } catch {
        return;
      }
    } else {
      hidePassword();
    }
  }

  const handleCopy = async () => {
    try {
      const { masterPassword, fullToken } = await prompt();
      const password = await getPassword(
        { platform: entry.platform, username: entry.username },
        fullToken,
        masterPassword,
      );
      navigator.clipboard.writeText(password);
      setCopied(true);
      setTimeout(() => setCopied(false), 1000);
    } catch {
      return;
    }
  };

  return (
    <div className="flex items-center w-full">
      <span className="text-xs text-gray-400 w-24">Password:</span>
      <VariableSizeInput
        setRef={setRef}
        type={showPassword ? "text" : "password"}
        className={`text-sm w-fit focus:outline-none text-gray-200 bg-transparent border-b
          ${editing && showPassword ? "cursor-text border-fuchsia-800 focus:border-fuchsia-500 hover:border-fuchsia-500" : "border-transparent cursor-default"}`}
        value={showPassword ? value : "placeholder"}
        readOnly={!(editing && showPassword)}
        onChange={(e) => setValue(e.target.value)}
      />
      <button
        type="button"
        className="ml-4 text-fuchsia-500 hover:text-fuchsia-400 focus:outline-none"
        onClick={handleShowPasswordToggle}
      >
        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
      {!editing && (
        <button
          type="button"
          className={`ml-4 ${copied ? "text-green-500" : "text-fuchsia-500 hover:text-fuchsia-400"} focus:outline-none transition-all`}
          onClick={handleCopy}
        >
          {copied ? <Check size={16} /> : <Copy size={16} />}
        </button>
      )}
    </div>
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
