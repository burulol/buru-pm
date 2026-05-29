import argon2 from "argon2-browser";

async function deriveKey(password, salt, purpose) {
  const result = await argon2.hash({
    pass: password + purpose,
    salt: salt,
    type: argon2.ArgonType.Argon2id,
    mem: 65536,
    time: 3,
    parallelism: 1,
    hashLen: 32,
  });

  return result.hash;
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

function getSalt() {
  const salt = sessionStorage.getItem("salt");
  if (!salt) throw new Error("Salt not found in session storage");
  return hexToBytes(salt);
}

export async function deriveAuthKey(password) {
  const salt = getSalt();
  const keyBytes = await deriveKey(password, salt, "auth");
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
  return { iv, ciphertext };
}

export async function decrypt({ iv, ciphertext }, encryptionKey) {
  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    encryptionKey,
    ciphertext,
  );
  return new TextDecoder().decode(decrypted);
}
