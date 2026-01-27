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
    if (resp.ok) return { attemptsLeft, errorCode, message };

    return { attemptsLeft: 0, errorCode, message };
  } catch {
    return {
      attemptsLeft: 0,
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

export async function getAllNotes() {
  const token = sessionStorage.getItem("token");
  if (!token) return { errorCode: "", message: "", notes: "" };

  try {
    const resp = await fetch(`${API_HOST}/notes/getAllNotes`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!resp.ok) {
      return {
        errorCode: "FETCH_ERROR",
        message: "Nie udało się pobrać dokumentów",
      };
    }
    const notes = await resp.json();

    const result = notes.map((note) => ({
      id: note.id,
      name: note.name,
      content: note.content,
      lastEdited: note.editTime,
      createdAt: note.createdAt,
    }));

    return {
      errorCode: "",
      message: "",
      notes: result,
    };
  } catch {
    return {
      errorCode: "CONNECTION_ERROR",
      message: "Nie udało się połączyć z serwerem. Spróbuj ponownie",
      notes: "",
    };
  }
}

export async function getNoteDetails(id) {
  const token = sessionStorage.getItem("token");
  if (!token) return { name: "", content: "", errorCode: "", message: "" };

  try {
    const resp = await fetch(`${API_HOST}/notes/readDocument/${id}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const { name, content, errorCode, message } = await resp.json();
    if (resp.ok) return { name, content, errorCode: "", message: "" };

    return { name: "", content: "", errorCode, message };
  } catch {
    return {
      name: "",
      content: "",
      errorCode: "CONNECTION_ERROR",
      message: "Nie udało się połączyć z serwerem. Spróbuj ponownie",
    };
  }
}

export async function editNote(id, content) {
  const token = sessionStorage.getItem("token");
  if (!token) return { errorCode: "", message: "" };

  try {
    const resp = await fetch(`${API_HOST}/notes/editDocument`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id,
        content,
      }),
    });

    const { errorCode, message } = await resp.json();
    if (resp.ok) return { errorCode: "", message: "" };

    return { errorCode, message };
  } catch {
    return {
      errorCode: "CONNECTION_ERROR",
      message: "Nie udało się połączyć z serwerem. Spróbuj ponownie",
    };
  }
}

export async function addNote(name) {
  const token = sessionStorage.getItem("token");
  if (!token) return { id: undefined, errorCode: "", message: "" };

  try {
    const resp = await fetch(`${API_HOST}/notes/addDocument`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        path: "/",
        content: "",
      }),
    });
    const { id, errorCode, message } = await resp.json();

    if (resp.ok) return { id: id, errorCode: "", message: "" };

    return { id: undefined, errorCode, message };
  } catch {
    return {
      id: undefined,
      errorCode: "CONNECTION_ERROR",
      message: "Nie udało się połączyć z serwerem. Spróbuj ponownie",
    };
  }
}

export async function renameNote(id, name) {
  const token = sessionStorage.getItem("token");
  if (!token) return { newName: "", errorCode: "", message: "" };

  try {
    const resp = await fetch(`${API_HOST}/notes/renameDocument`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id,
        newName: name,
      }),
    });
    const { newName, errorCode, message } = await resp.json();

    if (resp.ok) return { newName, errorCode: "", message: "" };

    return { newName: "", errorCode, message };
  } catch {
    return {
      newName: "",
      errorCode: "CONNECTION_ERROR",
      message: "Nie udało się połączyć z serwerem. Spróbuj ponownie",
    };
  }
}

export async function deleteNote(id) {
  const token = sessionStorage.getItem("token");
  if (!token) return { errorCode: "", message: "" };

  try {
    const resp = await fetch(`${API_HOST}/notes/deleteDocument/${id}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    const { errorCode, message } = await resp.json();

    if (resp.ok) return { errorCode: "", message: "" };

    return { errorCode, message };
  } catch {
    return {
      errorCode: "CONNECTION_ERROR",
      message: "Nie udało się połączyć z serwerem. Spróbuj ponownie",
    };
  }
}
