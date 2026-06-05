import { argon2id } from "hash-wasm";

async function deriveKey(password, salt, purpose) {
  const result = await argon2id({
    password: password + purpose,
    salt,
    parallelism: 1,
    iterations: 3,
    memorySize: 65536,
    hashLength: 32,
    outputType: "binary",
  });

  return result;
}

async function importEncryptionKey(keyBytes) {
  return crypto.subtle.importKey("raw", keyBytes, { name: "AES-GCM" }, false, [
    "encrypt",
    "decrypt",
  ]);
}

function toHex(bytes) {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function hexToBytes(hex) {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.slice(i, i + 2), 16);
  }
  return bytes;
}

function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  const chunkSize = 8192;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
}

function base64ToArrayBuffer(base64) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

function getSalt() {
  const salt = sessionStorage.getItem("salt");
  if (!salt) throw new Error("Salt not found in session storage");
  return hexToBytes(salt);
}

export async function deriveAuthKey(email, password) {
  const response = await fetch("/api/auth/salt", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email }),
  });
  const data = await response.json();
  const keyBytes = await deriveKey(password, hexToBytes(data.salt), "auth");
  return toHex(keyBytes);
}

export async function deriveEncryptionKey(password) {
  const salt = getSalt();
  const keyBytes = await deriveKey(password, salt, "vault");
  return importEncryptionKey(keyBytes);
}

export async function encrypt(text, encryptionKey) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    encryptionKey,
    new TextEncoder().encode(text),
  );

  return {
    iv: arrayBufferToBase64(iv),
    ciphertext: arrayBufferToBase64(ciphertext),
  };
}

export async function decrypt({ iv, ciphertext }, encryptionKey) {
  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: base64ToArrayBuffer(iv) },
    encryptionKey,
    base64ToArrayBuffer(ciphertext),
  );
  return new TextDecoder().decode(decrypted);
}

export async function getFullAccessToken(masterPassword) {
  const encryptedToken = sessionStorage.getItem("full_access_token");
  const [iv, ciphertext] = encryptedToken.split(":");
  const encryptionKey = await deriveEncryptionKey(masterPassword);
  const decryptedToken = await decrypt({ iv, ciphertext }, encryptionKey);
  return decryptedToken;
}
