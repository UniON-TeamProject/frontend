import { API_HOST } from "./config";

export async function loginRequest(login, password) {
  try {
    const resp = await fetch(`${API_HOST}/studyUp/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ login, password }),
    });
    const { errorCode } = await resp.json();

    if (resp.ok) return { errorCode };
    return { errorCode };
  } catch {
    return {
      errorCode: "CONNECTION_ERROR",
    };
  }
}

export async function checkUsernameRequest(username) {
  try {
    const resp = await fetch(`${API_HOST}/studyUp/checkUsername`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: username,
    });
    //const { errorCode } = await resp.json();
    const text = await resp.text();
    if (resp.ok) return { errorCode: null, valid: text === "true" };

    return { errorCode };
  } catch {
    return {
      valid: false,
      errorCode: "CONNECTION_ERROR",
    };
  }
}

export async function registerRequest(
  email,
  username,
  password,
  confirmPassword
) {
  try {
    const resp = await fetch(`${API_HOST}/studyUp/signUp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, username, password, confirmPassword }),
    });
    if (resp.ok) return { errorCode: null };

    const { errorCode } = await resp.json();
    return { errorCode };
  } catch {
    return {
      errorCode: "CONNECTION_ERROR",
    };
  }
}

export async function verificationRequest(email, verificationCode) {
  try {
    const resp = await fetch(`${API_HOST}/studyUp/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, token: verificationCode }),
    });

    if (resp.ok) return { errorCode: null };

    const { attemptsLeft, errorCode } = await resp.json();
    return { attemptsLeft, errorCode };
  } catch {
    return {
      errorCode: "CONNECTION_ERROR",
    };
  }
}

export async function emailVerificationRequest(email) {
  try {
    const resp = await fetch(`${API_HOST}/studyUp/checkEmail`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: email,
    });
    const text = await resp.text();
    if (resp.ok) return { errorCode: null, valid: text === "true" };

    const { errorCode } = await resp.json();
    return { errorCode };
  } catch {
    return {
      valid: false,
      errorCode: "CONNECTION_ERROR",
    };
  }
}

export async function resendVerificationToken(email) {
  try {
    const resp = await fetch(`${API_HOST}/studyUp/resendVerificationCode`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: email,
    });
    if (resp.ok) return { errorCode: null };

    const { attemptsLeft, errorCode } = await resp.json();
    return { attemptsLeft, errorCode };
  } catch {
    return {
      valid: false,
      errorCode: "CONNECTION_ERROR",
    };
  }
}
