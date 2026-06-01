import { deriveAuthKey } from "./crypto";

function getDevice() {
  let device = localStorage.getItem("device_name");

  if (!device) {
    device = crypto.randomUUID();
    localStorage.setItem("device_name", device);
  }

  return device;
}

export async function register(email, password) {
  const registerResponse = await fetch(`/api/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      auth_key: await deriveAuthKey(email, password),
    }),
  });

  if (!registerResponse.ok) {
    if (registerResponse.status === 409) {
      return { success: false, error: "Email already registered" };
    }
  }

  const loginResponse = await fetch(`/api/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      auth_key: await deriveAuthKey(email, password),
      device: getDevice(),
    }),
  });

  return { success: true, ...(await loginResponse.json()) };
}

export async function login(email, password) {
  const loginResponse = await fetch(`/api/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      auth_key: await deriveAuthKey(email, password),
      device: getDevice(),
    }),
  });

  if (!loginResponse.ok) {
    if (loginResponse.status === 401) {
      return { success: false, error: "Invalid email or password" };
    }
  }

  return { success: true, ...(await loginResponse.json()) };
}

export async function pingServer(token) {
  try {
    const response = await fetch(`/api/auth/validate`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.ok;
  } catch {
    return false;
  }
}
