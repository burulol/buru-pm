import {
  deriveEncryptionKey,
  encrypt,
  decrypt,
  getFullAccessToken,
} from "./crypto";

export async function savePassword(entry, fullToken, masterPassword) {
  const encryptionKey = await deriveEncryptionKey(masterPassword);
  if (entry.password) {
    const { ciphertext, iv } = await encrypt(entry.password, encryptionKey);
    entry.password = ciphertext;
    entry.iv = iv;
  }

  const response = await fetch("/api/passwords", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${fullToken}`,
    },
    body: JSON.stringify(entry),
  });

  if (!response.ok) {
    throw new Error(response.status);
  }
}

export async function getPassword(
  { platform, username },
  fullToken,
  masterPassword,
) {
  const response = await fetch(`/api/passwords/${platform}/${username}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${fullToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(response.status);
  }

  const encryptionKey = await deriveEncryptionKey(masterPassword);
  const data = await response.json();
  const decrypted = await decrypt(
    { iv: data.iv, ciphertext: data.password },
    encryptionKey,
  );

  return decrypted;
}

export async function updatePassword(entry, fullToken, masterPassword) {
  const encryptionKey = await deriveEncryptionKey(masterPassword);
  if (entry.password) {
    const { ciphertext, iv } = await encrypt(entry.password, encryptionKey);
    entry.password = ciphertext;
    entry.iv = iv;
  }
  const response = await fetch("/api/passwords", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${fullToken}`,
    },
    body: JSON.stringify(entry),
  });

  if (!response.ok) {
    throw new Error(response.status);
  }
}

export async function deletePassword({ platform, username }, fullToken) {
  const response = await fetch(`/api/passwords/${platform}/${username}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${fullToken}`,
    },
    body: JSON.stringify({
      platform,
      username,
    }),
  });

  if (!response.ok) {
    throw new Error(response.status);
  }
}

export async function getAllPasswords(limitedToken) {
  const response = await fetch("/api/platforms", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${limitedToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(response.status);
  }

  const data = await response.json();
  return data.platforms;
}

export async function validateMasterPassword(masterPassword) {
  return await getFullAccessToken(masterPassword);
}
