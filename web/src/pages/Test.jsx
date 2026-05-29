import { useState } from "react";
import { deriveEncryptionKey, encrypt } from "../services/crypto";

export default function Test() {
  const [mpassword, setMPassword] = useState("");
  const [password, setPassword] = useState("");
  const [ciphertext, setCiphertext] = useState("");

  async function getEncrypted() {
    let result = await encrypt(password, await deriveEncryptionKey(mpassword));

    console.log(result);

    return result.ciphertext.toString();
    // return mpassword + " " + password;
  }

  function handleClick() {
    setCiphertext(getEncrypted());
  }

  return (
    <div className="flex justify-center items-center h-screen">
      <div className="max-w-sm w-full border border-white space-y-3 p-4 rounded-lg flex flex-col justify-center">
        <h1 className="text-white">Vault test</h1>
        <label className="block text-sm font-medium text-white">
          Master Password:
          <input
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-500 focus:border-blue-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        <label className="block text-sm font-medium text-white">
          Master Password:
          <input
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-500 focus:border-blue-500"
            value={mpassword}
            onChange={(e) => setMPassword(e.target.value)}
          />
        </label>
        <button
          className="w-full py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          onClick={handleClick}
        >
          Encrypt
        </button>
        <p className="text-sm text-gray-300">{ciphertext}</p>
      </div>
    </div>
  );
}
