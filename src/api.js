import { API_HOST } from "./config";

export async function loginRequest(login, password) {
  try {
    const resp = await fetch(`${API_HOST}/studyUp/signIn`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ login, password }),
    });

    const { errorCode, message, token } = await resp.json();

    if (resp.ok) return { errorCode: null, token };

    return { errorCode, message };
  } catch {
    return {
      errorCode: "CONNECTION_ERROR",
      message: "Nie udało się połączyć z serwerem. Spróbuj ponownie",
    };
  }
}

export async function usernameVerificationRequest(username) {
  try {
    const resp = await fetch(`${API_HOST}/studyUp/checkUsername`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: username,
    });
    const { errorCode, message } = await resp.json();

    if (resp.ok) return { errorCode, message };

    return { errorCode, message };
  } catch {
    return {
      errorCode: "CONNECTION_ERROR",
      message: "Nie udało się połączyć z serwerem. Spróbuj ponownie",
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

    const { errorCode, message } = await resp.json();
    return { errorCode, message };
  } catch {
    return {
      errorCode: "CONNECTION_ERROR",
      message: "Nie udało się połączyć z serwerem. Spróbuj ponownie",
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
    const { attemptsLeft, errorCode, message } = await resp.json();

    if (resp.ok) return { errorCode, message };

    return { attemptsLeft, errorCode, message };
  } catch {
    return {
      errorCode: "CONNECTION_ERROR",
      message: "Nie udało się połączyć z serwerem. Spróbuj ponownie",
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

    const { errorCode, message } = await resp.json();
    if (resp.ok) return { errorCode, message };
    return { errorCode, message };
  } catch {
    return {
      errorCode: "CONNECTION_ERROR",
      message: "Nie udało się połączyć z serwerem. Spróbuj ponownie",
    };
  }
}

export async function resendVerificationCode(email) {
  try {
    const resp = await fetch(`${API_HOST}/studyUp/resendVerificationCode`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: email,
    });

    const { attemptsLeft, errorCode, message } = await resp.json();
    if (resp.ok) return { errorCode, message };

    return { attemptsLeft, errorCode, message };
  } catch {
    return {
      errorCode: "CONNECTION_ERROR",
      message: "Nie udało się połączyć z serwerem. Spróbuj ponownie",
    };
  }
}

export async function sendResetPasswordCode(email) {
  try {
    const resp = await fetch(`${API_HOST}/studyUp/forgotPassword`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const { errorCode, message } = await resp.json();
    if (resp.ok) return { errorCode, message };

    return { errorCode, message };
  } catch {
    return {
      errorCode: "CONNECTION_ERROR",
      message: "Nie udało się połączyć z serwerem. Spróbuj ponownie",
    };
  }
}

export async function resetPassword(email, verificationCode, password) {
  try {
    const resp = await fetch(`${API_HOST}/studyUp/resetPassword`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        token: verificationCode,
        newPassword: password,
      }),
    });

    const { errorCode, message } = await resp.json();
    if (resp.ok) return { errorCode, message };

    return { errorCode, message };
  } catch {
    return {
      errorCode: "CONNECTION_ERROR",
      message: "Nie udało się połączyć z serwerem. Spróbuj ponownie",
    };
  }
}

export async function getDocumentDetails(id, token) {
  try {
    const resp = await fetch(`${API_HOST}/studyUp/getDocument`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id,
        token,
      }),
    });

    const { name, content } = await resp.json();
    if (resp.ok) return { name, content };

    return { errorCode, message };
  } catch {
    return {
      errorCode: "CONNECTION_ERROR",
      message: "Nie udało się połączyć z serwerem. Spróbuj ponownie",
    };
  }
}
