import { API_HOST } from "./config";
import { getToken, removeToken, saveToken } from "./token";

function checkUnauthorized(resp) {
  if (resp.status === 401 || resp.status === 403) {
    removeToken();
    sessionStorage.setItem("logout_reason", "session_expired");
    return {
      errorCode: "TOKEN_UNDEFINED",
      message: "Sesja wygasła, zaloguj się ponownie",
    };
  }
  return null;
}

export async function loginRequest(login, password) {
  try {
    const resp = await fetch(`${API_HOST}/signIn`, {
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
    const resp = await fetch(`${API_HOST}/checkUsername`, {
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
    const resp = await fetch(`${API_HOST}/signUp`, {
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
    const resp = await fetch(`${API_HOST}/verify`, {
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
    const resp = await fetch(`${API_HOST}/checkEmail`, {
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
    const resp = await fetch(`${API_HOST}/resendVerificationCode`, {
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
    const resp = await fetch(`${API_HOST}/forgotPassword`, {
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
    const resp = await fetch(`${API_HOST}/resetPassword`, {
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
  const token = getToken();
  if (!token)
    return {
      notes: [],
      errorCode: "TOKEN_UNDEFINED",
      message: "Brak tokena, zaloguj się ponownie",
    };
  try {
    const resp = await fetch(`${API_HOST}/notes/getAllNotes`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    const authErr = checkUnauthorized(resp);
    if (authErr) return authErr;

    if (!resp.ok) {
      return {
        notes: [],
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

      folderId: note.folderId,
      tags: note.tags || [],
    }));

    return {
      notes: result,
      errorCode: "",
      message: "",
    };
  } catch {
    return {
      notes: [],
      errorCode: "CONNECTION_ERROR",
      message: "Nie udało się połączyć z serwerem. Spróbuj ponownie",
    };
  }
}

export async function getAllDeletedNotes() {
  const token = getToken();
  if (!token)
    return {
      notes: [],
      errorCode: "TOKEN_UNDEFINED",
      message: "Brak tokena, zaloguj się ponownie",
    };
  try {
    const resp = await fetch(`${API_HOST}/notes/getAllDeletedNotes`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    const authErr = checkUnauthorized(resp);
    if (authErr) return authErr;

    if (!resp.ok) {
      return {
        notes: [],
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
      tags: note.tags || [],
    }));

    return {
      notes: result,
      errorCode: "",
      message: "",
    };
  } catch {
    return {
      notes: [],
      errorCode: "CONNECTION_ERROR",
      message: "Nie udało się połączyć z serwerem. Spróbuj ponownie",
    };
  }
}

export async function getNoteDetails(id, socialId = null) {
  const token = getToken();
  if (!token)
    return {
      name: "",
      content: "",
      errorCode: "TOKEN_UNDEFINED",
      message: "Brak tokena, zaloguj się ponownie",
    };
  try {
    const url = socialId
      ? `${API_HOST}/notes/readNote/${id}?socialId=${socialId}`
      : `${API_HOST}/notes/readNote/${id}`;

    const resp = await fetch(url, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });
    const authErr = checkUnauthorized(resp);
    if (authErr) return authErr;

    const { name, content, folderId, errorCode, message } = await resp.json();
    if (resp.ok) return { name, content, folderId, errorCode: "", message: "" };

    return { name: "", content: "", folderId: null, errorCode, message };
  } catch {
    return {
      name: "",
      content: "",
      errorCode: "CONNECTION_ERROR",
      message: "Nie udało się połączyć z serwerem. Spróbuj ponownie",
    };
  }
}

export async function editNote(id, content, socialId = null) {
  const token = getToken();
  if (!token)
    return {
      errorCode: "TOKEN_UNDEFINED",
      message: "Brak tokena, zaloguj się ponownie",
    };

  try {
    const url = socialId
      ? `${API_HOST}/notes/editNote?socialId=${socialId}`
      : `${API_HOST}/notes/editNote`;

    const resp = await fetch(url, {
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
    const authErr = checkUnauthorized(resp);
    if (authErr) return authErr;

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

export async function getNoteSuggestedTags(folderId) {
  const token = getToken();
  if (!token)
    return {
      tags: [],
      errorCode: "TOKEN_UNDEFINED",
      message: "Brak tokena, zaloguj się ponownie",
    };
  try {
    const resp = await fetch(`${API_HOST}/notes/getSuggestedTags/${folderId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    const authErr = checkUnauthorized(resp);
    if (authErr) return authErr;

    if (!resp.ok) {
      return {
        tags: [],
        errorCode: "FETCH_ERROR",
        message: "Nie udało się pobrać tagów",
      };
    }

    const tags = await resp.json();

    return {
      tags,
      errorCode: "",
      message: "",
    };
  } catch {
    return {
      tags: [],
      errorCode: "CONNECTION_ERROR",
      message: "Nie udało się połączyć z serwerem. Spróbuj ponownie",
    };
  }
}

export async function getNoteTags(id, socialId = null) {
  const token = getToken();
  if (!token)
    return {
      name: "",
      content: "",
      errorCode: "TOKEN_UNDEFINED",
      message: "Brak tokena, zaloguj się ponownie",
    };
  try {
    const url = socialId
      ? `${API_HOST}/notes/getNoteTags/${id}?socialId=${socialId}`
      : `${API_HOST}/notes/getNoteTags/${id}`;

    const resp = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    const authErr = checkUnauthorized(resp);
    if (authErr) return authErr;

    if (!resp.ok) {
      return {
        tags: [],
        errorCode: "FETCH_ERROR",
        message: "Nie udało się pobrać tagów",
      };
    }

    const tags = await resp.json();
    return {
      tags: tags,
      errorCode: "",
      message: "",
    };
  } catch {
    return {
      name: "",
      content: "",
      errorCode: "CONNECTION_ERROR",
      message: "Nie udało się połączyć z serwerem. Spróbuj ponownie",
    };
  }
}

export async function addNote(name, path = "/", tags = [], socialId = null) {
  const token = getToken();
  if (!token)
    return {
      id: undefined,
      errorCode: "TOKEN_UNDEFINED",
      message: "Brak tokena, zaloguj się ponownie",
    };

  try {
    const url = socialId
      ? `${API_HOST}/notes/addNote?socialId=${socialId}`
      : `${API_HOST}/notes/addNote`;

    const resp = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        path,
        content: "",
        tagNames: tags,
      }),
    });
    const authErr = checkUnauthorized(resp);
    if (authErr) return authErr;
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

export async function addNoteTag(id, name, socialId = null) {
  const token = getToken();
  if (!token)
    return {
      errorCode: "TOKEN_UNDEFINED",
      message: "Brak tokena, zaloguj się ponownie",
    };

  try {
    const url = socialId
      ? `${API_HOST}/notes/addNoteTag?socialId=${socialId}`
      : `${API_HOST}/notes/addNoteTag`;

    const resp = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: id,
        tagName: name,
      }),
    });
    const authErr = checkUnauthorized(resp);
    if (authErr) return authErr;
    if (resp.ok) return { errorCode: "", message: "" };

    const { errorCode, message } = await resp.json();

    return { errorCode, message };
  } catch {
    return {
      errorCode: "CONNECTION_ERROR",
      message: "Nie udało się połączyć z serwerem. Spróbuj ponownie",
    };
  }
}

export async function removeNoteTag(id, name, socialId = null) {
  const token = getToken();
  if (!token)
    return {
      errorCode: "TOKEN_UNDEFINED",
      message: "Brak tokena, zaloguj się ponownie",
    };

  try {
    const url = socialId
      ? `${API_HOST}/notes/removeNoteTag?socialId=${socialId}`
      : `${API_HOST}/notes/removeNoteTag`;

    const resp = await fetch(url, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: id,
        tagName: name,
      }),
    });
    const authErr = checkUnauthorized(resp);
    if (authErr) return authErr;

    if (resp.ok) return { errorCode: "", message: "" };

    const { errorCode, message } = await resp.json();

    return { errorCode, message };
  } catch {
    return {
      errorCode: "CONNECTION_ERROR",
      message: "Nie udało się połączyć z serwerem. Spróbuj ponownie",
    };
  }
}

export async function renameFolder(id, name) {
  const token = getToken();
  if (!token)
    return {
      newName: "",
      errorCode: "TOKEN_UNDEFINED",
      message: "Brak tokena, zaloguj się ponownie",
    };

  try {
    const resp = await fetch(`${API_HOST}/folders/renameFolder`, {
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
    const authErr = checkUnauthorized(resp);
    if (authErr) return authErr;
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

export async function renameNote(id, name, socialId = null) {
  const token = getToken();
  if (!token)
    return {
      newName: "",
      errorCode: "TOKEN_UNDEFINED",
      message: "Brak tokena, zaloguj się ponownie",
    };

  try {
    const url = socialId
      ? `${API_HOST}/notes/renameNote?socialId=${socialId}`
      : `${API_HOST}/notes/renameNote`;

    const resp = await fetch(url, {
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
    const authErr = checkUnauthorized(resp);
    if (authErr) return authErr;
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

export async function deleteNote(id, socialId = null) {
  const token = getToken();
  if (!token)
    return {
      errorCode: "TOKEN_UNDEFINED",
      message: "Brak tokena, zaloguj się ponownie",
    };

  try {
    const url = socialId
      ? `${API_HOST}/notes/deleteNote/${id}?socialId=${socialId}`
      : `${API_HOST}/notes/deleteNote/${id}`;

    const resp = await fetch(url, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    const authErr = checkUnauthorized(resp);
    if (authErr) return authErr;

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

export async function clearTrash() {
  const token = getToken();
  if (!token)
    return {
      errorCode: "TOKEN_UNDEFINED",
      message: "Brak tokena, zaloguj się ponownie",
    };

  try {
    const resp = await fetch(`${API_HOST}/notes/hardDeleteNotes`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    const authErr = checkUnauthorized(resp);
    if (authErr) return authErr;

    if (resp.status === 204) {
      return { errorCode: "", message: "" };
    }

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

export async function restoreNote(id) {
  const token = getToken();
  if (!token)
    return {
      errorCode: "TOKEN_UNDEFINED",
      message: "Brak tokena, zaloguj się ponownie",
    };
  try {
    const resp = await fetch(`${API_HOST}/notes/restoreNote/${id}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    const authErr = checkUnauthorized(resp);
    if (authErr) return authErr;

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

export async function getAllFolders() {
  const token = getToken();
  if (!token)
    return {
      folder: [],
      errorCode: "TOKEN_UNDEFINED",
      message: "Brak tokena",
    };
  try {
    const resp = await fetch(`${API_HOST}/folders/getAllFolders`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    const authErr = checkUnauthorized(resp);
    if (authErr) return authErr;
    if (!resp.ok)
      return {
        folders: [],
        errorCode: "FETCH_ERROR",
        message: "Nie udało się pobrać folderów",
      };
    const folders = await resp.json();
    return { folders, errorCode: "", message: "" };
  } catch {
    return {
      folders: [],
      errorCode: "CONNECTION_ERROR",
      message: "Nie udało się połączyć z serwerem",
    };
  }
}

export async function resolveFolderByPath(pathSegments, isDeleted = false) {
  const token = getToken();
  if (!token) return { errorCode: "TOKEN_UNDEFINED", message: "Brak tokena" };

  const path =
    pathSegments.length === 0
      ? "/"
      : "/" + pathSegments.map((s) => decodeURIComponent(s)).join("/");

  try {
    const resp = await fetch(
      `${API_HOST}/folders/getFolderContentByPath?path=${encodeURIComponent(
        path
      )}&isDeleted=${isDeleted}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    const authErr = checkUnauthorized(resp);
    if (authErr) return authErr;
    if (resp.status === 404) {
      const data = await resp.json();
      return { errorCode: "PATH_NOT_FOUND", message: data.message };
    }
    if (!resp.ok) return { errorCode: "FETCH_ERROR", message: "Błąd" };
    const data = await resp.json();
    return {
      currentFolder: data.folder || null,
      subFolders: data.subFolders || [],
      notes: data.notes || [],
      errorCode: "",
      message: "",
    };
  } catch {
    return {
      errorCode: "CONNECTION_ERROR",
      message: "Nie udało się połączyć z serwerem. Spróbuj ponownie",
    };
  }
}

export async function addFolder(name, path, tagNames = []) {
  const token = getToken();
  if (!token) return { errorCode: "TOKEN_UNDEFINED", message: "Brak tokena" };
  try {
    const resp = await fetch(`${API_HOST}/folders/addFolder`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, path, tagNames }),
    });
    const authErr = checkUnauthorized(resp);
    if (authErr) return authErr;
    const data = await resp.json();
    if (resp.ok) return { ...data, errorCode: "", message: "" };
    return { errorCode: data.errorCode, message: data.message };
  } catch {
    return { errorCode: "CONNECTION_ERROR", message: "Nie udało się połączyć" };
  }
}

export async function getFolderTags(id) {
  const token = getToken();
  if (!token)
    return {
      tags: [],
      errorCode: "TOKEN_UNDEFINED",
      message: "Brak tokena, zaloguj się ponownie",
    };
  try {
    const resp = await fetch(`${API_HOST}/folders/getFolderTags/${id}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    const authErr = checkUnauthorized(resp);
    if (authErr) return authErr;

    if (!resp.ok) {
      return {
        tags: [],
        errorCode: "FETCH_ERROR",
        message: "Nie udało się pobrać tagów",
      };
    }

    const tags = await resp.json();
    return {
      tags,
      errorCode: "",
      message: "",
    };
  } catch {
    return {
      tags: [],
      errorCode: "CONNECTION_ERROR",
      message: "Nie udało się połączyć z serwerem. Spróbuj ponownie",
    };
  }
}

export async function addCard(
  question,
  answer,
  setId,
  tags = [],
  isForced = false,
  noteId = null,
  socialId = null
) {
  const token = getToken();
  if (!token)
    return {
      id: undefined,
      errorCode: "TOKEN_UNDEFINED",
      message: "Brak tokena",
    };

  try {
    const params = new URLSearchParams();
    if (noteId) params.append("noteId", noteId);
    if (socialId) params.append("socialId", socialId);
    const queryString = params.toString() ? `?${params.toString()}` : "";

    const resp = await fetch(`${API_HOST}/addCard${queryString}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        contentFirstSide: question,
        contentFlipSide: answer,
        setId: setId,
        cardTags: tags,
        isForced: isForced,
      }),
    });

    const authErr = checkUnauthorized(resp);
    if (authErr) return authErr;

    if (resp.ok) {
      const { id } = await resp.json();
      return { id, errorCode: "", message: "" };
    }

    const errorData = await resp.json().catch(() => ({}));
    return {
      id: undefined,
      errorCode: "API_ERROR",
      message: errorData.message || "Błąd dodawania fiszki",
    };
  } catch {
    return {
      id: undefined,
      errorCode: "CONNECTION_ERROR",
      message: "Błąd połączenia z serwerem",
    };
  }
}

export async function deleteCard(id) {
  const token = getToken();
  if (!token) return { errorCode: "TOKEN_UNDEFINED", message: "Brak tokena" };

  try {
    const resp = await fetch(`${API_HOST}/deleteCard/${id}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    const authErr = checkUnauthorized(resp);
    if (authErr) return authErr;

    if (resp.ok) return { errorCode: "", message: "" };
    const errorData = await resp.json().catch(() => ({}));
    return {
      errorCode: "API_ERROR",
      message: errorData.message || "Błąd usuwania fiszki",
    };
  } catch {
    return { errorCode: "CONNECTION_ERROR", message: "Błąd serwera" };
  }
}

export async function addFolderTag(id, name) {
  const token = getToken();
  if (!token)
    return {
      errorCode: "TOKEN_UNDEFINED",
      message: "Brak tokena, zaloguj się ponownie",
    };

  try {
    const resp = await fetch(`${API_HOST}/folders/addFolderTag`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: id,
        tagName: name,
      }),
    });
    const authErr = checkUnauthorized(resp);
    if (authErr) return authErr;
    if (resp.ok) return { errorCode: "", message: "" };

    const { errorCode, message } = await resp.json();

    return { errorCode, message };
  } catch {
    return {
      errorCode: "CONNECTION_ERROR",
      message: "Nie udało się połączyć z serwerem. Spróbuj ponownie",
    };
  }
}

export async function removeFolderTag(id, name) {
  const token = getToken();
  if (!token)
    return {
      errorCode: "TOKEN_UNDEFINED",
      message: "Brak tokena, zaloguj się ponownie",
    };

  try {
    const resp = await fetch(`${API_HOST}/folders/removeFolderTag`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: id,
        tagName: name,
      }),
    });
    const authErr = checkUnauthorized(resp);
    if (authErr) return authErr;

    if (resp.ok) return { errorCode: "", message: "" };

    const { errorCode, message } = await resp.json();

    return { errorCode, message };
  } catch {
    return {
      errorCode: "CONNECTION_ERROR",
      message: "Nie udało się połączyć z serwerem. Spróbuj ponownie",
    };
  }
}

export async function addFlashcardSet(
  name,
  tags = [],
  socialId = null,
  noteId = null
) {
  const token = getToken();
  if (!token)
    return {
      id: undefined,
      errorCode: "TOKEN_UNDEFINED",
      message: "Brak tokena",
    };

  try {
    let url = `${API_HOST}/addCardSet`;
    const params = [];
    if (socialId) params.push(`socialId=${socialId}`);
    if (noteId) params.push(`noteId=${noteId}`);

    if (params.length > 0) {
      url += `?${params.join("&")}`;
    }

    const bodyPayload = {
      name: name,
      tags: tags,
      cards: [],
    };

    const resp = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(bodyPayload),
    });

    const authErr = checkUnauthorized(resp);
    if (authErr) return authErr;

    if (resp.ok) {
      const responseBody = await resp.json();
      return { id: responseBody.id, errorCode: "", message: "" };
    }

    const errorData = await resp.json().catch(() => ({}));
    return {
      id: undefined,
      errorCode: "API_ERROR",
      message: errorData.message || "Błąd tworzenia zestawu",
    };
  } catch (error) {
    return {
      id: undefined,
      errorCode: "CONNECTION_ERROR",
      message: "Błąd serwera",
    };
  }
}

export async function editCard(id, question, answer, setId, tags = []) {
  const token = getToken();
  if (!token) return { errorCode: "TOKEN_UNDEFINED", message: "Brak tokena" };

  try {
    const resp = await fetch(`${API_HOST}/editCard/${id}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contentFirstSide: question,
        contentFlipSide: answer,
        setId: setId,
        cardTags: tags,
        isForced: false,
      }),
    });
    const authErr = checkUnauthorized(resp);
    if (authErr) return authErr;

    if (resp.ok) return { errorCode: "", message: "" };
    const errorData = await resp.json().catch(() => ({}));
    return {
      errorCode: "API_ERROR",
      message: errorData.message || "Błąd edycji fiszki",
    };
  } catch {
    return { errorCode: "CONNECTION_ERROR", message: "Błąd serwera" };
  }
}

export async function editFlashcardSet(
  setId,
  name,
  tags = [],
  socialId = null
) {
  const token = getToken();
  if (!token) return { errorCode: "TOKEN_UNDEFINED", message: "Brak tokena" };
  try {
    const url = socialId
      ? `${API_HOST}/editCardSet/${setId}?socialId=${socialId}`
      : `${API_HOST}/editCardSet/${setId}`;

    const resp = await fetch(url, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: name, tags: tags }),
    });
    const authErr = checkUnauthorized(resp);
    if (authErr) return authErr;
    if (resp.ok) return { errorCode: "", message: "" };
    const errorData = await resp.json().catch(() => ({}));
    return {
      errorCode: "API_ERROR",
      message: errorData.message || "Błąd edycji zestawu",
    };
  } catch {
    return { errorCode: "CONNECTION_ERROR", message: "Błąd serwera" };
  }
}

export async function getFolderSuggestedTags(folderId) {
  const token = getToken();
  if (!token)
    return {
      tags: [],
      errorCode: "TOKEN_UNDEFINED",
      message: "Brak tokena, zaloguj się ponownie",
    };
  try {
    const resp = await fetch(
      `${API_HOST}/folders/getSuggestedTags/${folderId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    const authErr = checkUnauthorized(resp);
    if (authErr) return authErr;

    if (!resp.ok) {
      return {
        tags: [],
        errorCode: "FETCH_ERROR",
        message: "Nie udało się pobrać tagów",
      };
    }

    const tags = await resp.json();

    return {
      tags,
      errorCode: "",
      message: "",
    };
  } catch {
    return {
      tags: [],
      errorCode: "CONNECTION_ERROR",
      message: "Nie udało się połączyć z serwerem. Spróbuj ponownie",
    };
  }
}

export async function getAllDeletedFolders() {
  const token = getToken();
  if (!token)
    return {
      folders: [],
      errorCode: "TOKEN_UNDEFINED",
      message: "Brak tokena, zaloguj się ponownie",
    };
  try {
    const resp = await fetch(`${API_HOST}/folders/getAllDeletedFolders`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    const authErr = checkUnauthorized(resp);
    if (authErr) return authErr;

    if (!resp.ok) {
      return {
        folders: [],
        errorCode: "FETCH_ERROR",
        message: "Nie udało się pobrać folderów",
      };
    }
    const folders = await resp.json();

    return {
      folders,
      errorCode: "",
      message: "",
    };
  } catch {
    return {
      folders: [],
      errorCode: "CONNECTION_ERROR",
      message: "Nie udało się połączyć z serwerem. Spróbuj ponownie",
    };
  }
}

export async function deleteFolder(id) {
  const token = getToken();
  if (!token)
    return {
      errorCode: "TOKEN_UNDEFINED",
      message: "Brak tokena, zaloguj się ponownie",
    };
  try {
    const resp = await fetch(`${API_HOST}/folders/deleteFolder/${id}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    const authErr = checkUnauthorized(resp);
    if (authErr) return authErr;

    if (resp.ok) return { errorCode: "", message: "" };

    const { errorCode, message } = await resp.json();
    return { errorCode, message };
  } catch {
    return {
      errorCode: "CONNECTION_ERROR",
      message: "Nie udało się połączyć z serwerem. Spróbuj ponownie",
    };
  }
}

export async function restoreFolder(id) {
  const token = getToken();
  if (!token)
    return {
      errorCode: "TOKEN_UNDEFINED",
      message: "Brak tokena, zaloguj się ponownie",
    };
  try {
    const resp = await fetch(`${API_HOST}/folders/restoreFolder/${id}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    const authErr = checkUnauthorized(resp);
    if (authErr) return authErr;

    if (resp.ok) return { errorCode: "", message: "" };

    const { errorCode, message } = await resp.json();
    return { errorCode, message };
  } catch {
    return {
      errorCode: "CONNECTION_ERROR",
      message: "Nie udało się połączyć z serwerem. Spróbuj ponownie",
    };
  }
}

export async function moveNote(id, destinationPath) {
  const token = getToken();
  if (!token)
    return {
      errorCode: "TOKEN_UNDEFINED",
      message: "Brak tokena, zaloguj się ponownie",
    };
  try {
    const resp = await fetch(`${API_HOST}/notes/moveNote`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id, destinationPath }),
    });
    const authErr = checkUnauthorized(resp);
    if (authErr) return authErr;

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

export async function moveFolder(id, destinationPath) {
  const token = getToken();
  if (!token)
    return {
      errorCode: "TOKEN_UNDEFINED",
      message: "Brak tokena, zaloguj się ponownie",
    };
  try {
    const resp = await fetch(`${API_HOST}/folders/moveFolder`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id, destinationPath }),
    });
    const authErr = checkUnauthorized(resp);
    if (authErr) return authErr;

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

export async function clearFolderTrash() {
  const token = getToken();
  if (!token)
    return {
      errorCode: "TOKEN_UNDEFINED",
      message: "Brak tokena, zaloguj się ponownie",
    };
  try {
    const resp = await fetch(`${API_HOST}/folders/hardDeleteFolders`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    const authErr = checkUnauthorized(resp);
    if (authErr) return authErr;

    if (resp.status === 204) return { errorCode: "", message: "" };
    if (resp.ok) return { errorCode: "", message: "" };

    const { errorCode, message } = await resp.json();
    return { errorCode, message };
  } catch {
    return {
      errorCode: "CONNECTION_ERROR",
      message: "Nie udało się połączyć z serwerem. Spróbuj ponownie",
    };
  }
}

export async function deleteFlashcardSet(setId, socialId = null) {
  const token = getToken();
  if (!token)
    return {
      errorCode: "TOKEN_UNDEFINED",
      message: "Brak tokena, zaloguj się ponownie",
    };
  try {
    const url = socialId
      ? `${API_HOST}/deleteCardSet/${setId}?socialId=${socialId}`
      : `${API_HOST}/deleteCardSet/${setId}`;

    const resp = await fetch(url, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
    });
    const authErr = checkUnauthorized(resp);
    if (authErr) return authErr;

    if (resp.ok) return { errorCode: "", message: "" };
    return { errorCode: "API_ERROR", message: "Błąd usuwania zestawu" };
  } catch {
    return { errorCode: "CONNECTION_ERROR", message: "Błąd serwera" };
  }
}

export async function getAllFlashcardSets() {
  const token = getToken();
  if (!token)
    return { sets: [], errorCode: "TOKEN_UNDEFINED", message: "Brak tokena" };

  try {
    const resp = await fetch(`${API_HOST}/allCardSets`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    const authErr = checkUnauthorized(resp);
    if (authErr) return authErr;

    if (!resp.ok)
      return {
        sets: [],
        errorCode: "FETCH_ERROR",
        message: "Nie udało się pobrać zestawów",
      };

    const sets = await resp.json();
    return { sets, errorCode: "", message: "" };
  } catch {
    return { sets: [], errorCode: "CONNECTION_ERROR", message: "Błąd serwera" };
  }
}

export async function getFlashcardSetsBySocialId(socialId) {
  const token = getToken();
  if (!token)
    return { sets: [], errorCode: "TOKEN_UNDEFINED", message: "Brak tokena" };

  try {
    const resp = await fetch(`${API_HOST}/getCardSets/${socialId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    const authErr = checkUnauthorized(resp);
    if (authErr) return authErr;

    if (!resp.ok)
      return {
        sets: [],
        errorCode: "FETCH_ERROR",
        message: "Nie udało się pobrać zestawów społeczności",
      };

    const sets = await resp.json();
    return { sets, errorCode: "", message: "" };
  } catch {
    return { sets: [], errorCode: "CONNECTION_ERROR", message: "Błąd serwera" };
  }
}

export async function getFastLearningCards(setId) {
  const token = getToken();
  if (!token) return null;
  try {
    const resp = await fetch(`${API_HOST}/getCardsToLearn/${setId}`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });
    const authErr = checkUnauthorized(resp);
    if (authErr) return authErr;

    if (!resp.ok) throw new Error("Błąd pobierania");
    return await resp.json();
  } catch (err) {
    return null;
  }
}

export async function sendFastLearningAnswer(cardId, answerCode) {
  const token = getToken();
  if (!token) return false;
  try {
    const resp = await fetch(`${API_HOST}/fastLearningModeAnswer`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        cardId: cardId,
        answer: answerCode,
      }),
    });
    const authErr = checkUnauthorized(resp);
    if (authErr) return authErr;

    return resp.ok;
  } catch (err) {
    return false;
  }
}

// resetowanie postepu nauki (umiem = 0)
export async function resetFlashcardSetProgress(setId) {
  const token = getToken();
  if (!token) return { errorCode: "TOKEN_UNDEFINED", message: "Brak tokena" };

  try {
    const resp = await fetch(`${API_HOST}/resetCards/${setId}`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
    });

    const authErr = checkUnauthorized(resp);
    if (authErr) return authErr;

    if (resp.ok) {
      return { errorCode: "", message: "" };
    }

    const data = await resp.json().catch(() => ({}));
    return {
      errorCode: data.errorCode || "ERROR",
      message: data.message || "Nie udało się zresetować postępu nauki",
    };
  } catch (err) {
    return {
      errorCode: "CONNECTION_ERROR",
      message: "Błąd połączenia z serwerem",
    };
  }
}

//
// FSRS
//
export async function getFsrsCards(setId) {
  const token = getToken();
  if (!token) return null;
  try {
    const resp = await fetch(`${API_HOST}/getCardsToLearnFsrs/${setId}`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });
    const authErr = checkUnauthorized(resp);
    if (authErr) return authErr;

    if (!resp.ok) throw new Error("Błąd pobierania");
    return await resp.json();
  } catch (err) {
    return null;
  }
}

export async function sendFsrsAnswer(cardId, ratingValue) {
  const token = getToken();
  if (!token) return false;
  try {
    const resp = await fetch(`${API_HOST}/rateCard`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        cardId: cardId,
        rating: ratingValue,
      }),
    });
    const authErr = checkUnauthorized(resp);
    if (authErr) return authErr;

    return resp.ok;
  } catch (err) {
    return false;
  }
}

export async function generateCardsFromNote(noteId) {
  const token = getToken();
  if (!token) return { errorCode: "TOKEN_UNDEFINED", message: "Brak tokena" };
  try {
    const resp = await fetch(`${API_HOST}/generateCards/${noteId}`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (resp.status === 402) {
      return {
        errorCode: "RATE_LIMIT_EXCEEDED",
        message:
          "Przekroczono limit zapytań do AI. Spróbuj ponownie za chwilę.",
      };
    }
    const authErr = checkUnauthorized(resp);
    if (authErr) return authErr;
    if (resp.ok) {
      const cards = await resp.json();
      return { cards, errorCode: "", message: "" };
    }
    const data = await resp.json().catch(() => ({}));
    return {
      errorCode: data.errorCode || "ERROR",
      message: data.message || "Błąd generowania fiszek",
    };
  } catch {
    return {
      errorCode: "CONNECTION_ERROR",
      message: "Nie udało się połączyć z serwerem.",
    };
  }
}

export async function moveListOfCards(cardSetId, cardIds) {
  const token = getToken();
  if (!token) return { errorCode: "TOKEN_UNDEFINED", message: "Brak tokena" };
  try {
    const resp = await fetch(
      `${API_HOST}/moveListOfCardsToTheCardSet/${cardSetId}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(cardIds),
      }
    );
    const authErr = checkUnauthorized(resp);
    if (authErr) return authErr;
    if (resp.ok) {
      const saved = await resp.json();
      return { cards: saved, errorCode: "", message: "" };
    }
    const data = await resp.json().catch(() => ({}));
    return {
      errorCode: data.errorCode || "ERROR",
      message: data.message || "Błąd przenoszenia fiszek",
    };
  } catch {
    return {
      errorCode: "CONNECTION_ERROR",
      message: "Nie udało się połączyć z serwerem.",
    };
  }
}

export async function addListOfCardsToSet(
  cardSetId,
  cards,
  noteId = null,
  socialId = null
) {
  const token = getToken();
  if (!token) return { errorCode: "TOKEN_UNDEFINED", message: "Brak tokena" };

  try {
    const params = new URLSearchParams();
    if (noteId) params.append("noteId", noteId);
    if (socialId) params.append("socialId", socialId);
    const queryString = params.toString() ? `?${params.toString()}` : "";

    const resp = await fetch(
      `${API_HOST}/addListOfCardsToTheCardSet/${cardSetId}${queryString}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(cards),
      }
    );
    const authErr = checkUnauthorized(resp);
    if (authErr) return authErr;

    if (resp.ok) {
      const saved = await resp.json();
      return { cards: saved, errorCode: "", message: "" };
    }
    const data = await resp.json().catch(() => ({}));
    return {
      errorCode: data.errorCode || "ERROR",
      message: data.message || "Błąd zapisywania fiszek",
    };
  } catch {
    return {
      errorCode: "CONNECTION_ERROR",
      message: "Nie udało się połączyć z serwerem.",
    };
  }
}

export async function getUsosAuthUrl() {
  const token = getToken();
  if (!token)
    return {
      authUrl: null,
      errorCode: "TOKEN_UNDEFINED",
      message: "Brak tokena, zaloguj się ponownie",
    };
  try {
    const resp = await fetch(`${API_HOST}/oauth/request`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    const authErr = checkUnauthorized(resp);
    if (authErr) return authErr;

    if (!resp.ok)
      return {
        authUrl: null,
        errorCode: "FETCH_ERROR",
        message: "Nie udało się uzyskać URL autoryzacji USOS",
      };

    const text = await resp.text();
    const url = text.replace("Redirect user to: ", "").trim();
    return { authUrl: url, errorCode: "", message: "" };
  } catch {
    return {
      authUrl: null,
      errorCode: "CONNECTION_ERROR",
      message: "Nie udało się połączyć z serwerem",
    };
  }
}

export async function submitUsosVerifier(oauthVerifier) {
  const token = getToken();
  if (!token)
    return {
      errorCode: "TOKEN_UNDEFINED",
      message: "Brak tokena, zaloguj się ponownie",
    };
  try {
    const resp = await fetch(
      `${API_HOST}/oauth/access?oauth_verifier=${encodeURIComponent(
        oauthVerifier
      )}&override=true`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    const authErr = checkUnauthorized(resp);
    if (authErr) return authErr;

    if (resp.ok) return { errorCode: "", message: "" };
    return {
      errorCode: "VERIFY_ERROR",
      message: "Nieprawidłowy kod weryfikacyjny",
    };
  } catch {
    return {
      errorCode: "CONNECTION_ERROR",
      message: "Nie udało się połączyć z serwerem",
    };
  }
}

// EVENT TAG API

export async function getEventTags(eventId) {
  const token = getToken();
  if (!token)
    return {
      predefined: [],
      custom: [],
      errorCode: "TOKEN_UNDEFINED",
      message: "Brak tokena",
    };
  try {
    const resp = await fetch(`${API_HOST}/getEventTags/${eventId}`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });
    const authErr = checkUnauthorized(resp);
    if (authErr) return authErr;
    if (!resp.ok)
      return {
        predefined: [],
        custom: [],
        errorCode: "FETCH_ERROR",
        message: "Nie udało się pobrać tagów",
      };
    const data = await resp.json();
    return { ...data, errorCode: "", message: "" };
  } catch {
    return {
      predefined: [],
      custom: [],
      errorCode: "CONNECTION_ERROR",
      message: "Nie udało się połączyć z serwerem",
    };
  }
}

export async function getPredefinedEventTags() {
  const token = getToken();
  if (!token)
    return { tags: [], errorCode: "TOKEN_UNDEFINED", message: "Brak tokena" };
  try {
    const resp = await fetch(`${API_HOST}/getPredefinedEventTags`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });
    const authErr = checkUnauthorized(resp);
    if (authErr) return authErr;
    if (!resp.ok)
      return {
        tags: [],
        errorCode: "FETCH_ERROR",
        message: "Nie udało się pobrać tagów",
      };
    const tags = await resp.json();
    return { tags, errorCode: "", message: "" };
  } catch {
    return {
      tags: [],
      errorCode: "CONNECTION_ERROR",
      message: "Nie udało się połączyć z serwerem",
    };
  }
}

export async function getContentByTag(tagName) {
  const token = getToken();
  if (!token)
    return {
      notes: [],
      cardSets: [],
      folders: [],
      cards: [],
      errorCode: "TOKEN_UNDEFINED",
      message: "Brak tokena",
    };
  try {
    const resp = await fetch(
      `${API_HOST}/getContentByTag?tagName=${encodeURIComponent(tagName)}`,
      {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    const authErr = checkUnauthorized(resp);
    if (authErr)
      return { notes: [], cardSets: [], folders: [], cards: [], ...authErr };
    const data = await resp.json();
    if (resp.ok)
      return {
        notes: data.notes || [],
        cardSets: data.cardSets || [],
        folders: data.folders || [],
        cards: data.cards || [],
        errorCode: "",
        message: "",
      };
    return {
      notes: [],
      cardSets: [],
      folders: [],
      cards: [],
      errorCode: data.errorCode || "ERROR",
      message: data.message || "Nie znaleziono treści",
    };
  } catch {
    return {
      notes: [],
      cardSets: [],
      folders: [],
      cards: [],
      errorCode: "CONNECTION_ERROR",
      message: "Nie udało się połączyć z serwerem",
    };
  }
}

export async function addRegularTagToEvent(eventId, tagName) {
  const token = getToken();
  if (!token) return { errorCode: "TOKEN_UNDEFINED", message: "Brak tokena" };
  try {
    const resp = await fetch(
      `${API_HOST}/addRegularTag/${eventId}?tagName=${encodeURIComponent(
        tagName
      )}`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    const authErr = checkUnauthorized(resp);
    if (authErr) return authErr;
    if (resp.ok) return { errorCode: "", message: "" };
    return { errorCode: "ERROR", message: "Nie udało się dodać tagu" };
  } catch {
    return {
      errorCode: "CONNECTION_ERROR",
      message: "Nie udało się połączyć z serwerem",
    };
  }
}

export async function removeRegularTagFromEvent(eventId, tagName) {
  const token = getToken();
  if (!token) return { errorCode: "TOKEN_UNDEFINED", message: "Brak tokena" };
  try {
    const resp = await fetch(
      `${API_HOST}/removeRegularTag/${eventId}?tagName=${encodeURIComponent(
        tagName
      )}`,
      {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    const authErr = checkUnauthorized(resp);
    if (authErr) return authErr;
    if (resp.ok) return { errorCode: "", message: "" };
    return { errorCode: "ERROR", message: "Nie udało się usunąć tagu" };
  } catch {
    return {
      errorCode: "CONNECTION_ERROR",
      message: "Nie udało się połączyć z serwerem",
    };
  }
}

export async function addEvent(
  title,
  description,
  eventTags,
  regularTags,
  start,
  end,
  color,
  isDeadline,
  recurrenceRule = null,
  recurringEventTags = null
) {
  const token = getToken();
  if (!token)
    return {
      event: null,
      errorCode: "TOKEN_UNDEFINED",
      message: "Brak tokena, zaloguj się ponownie",
    };
  try {
    const resp = await fetch(`${API_HOST}/addEvent`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title,
        description,
        eventTags,
        regularTags,
        start,
        end,
        color,
        isDeadline,
        recurringEventTags,
        recurrenceRule,
      }),
    });
    const authErr = checkUnauthorized(resp);
    if (authErr) return authErr;
    const data = await resp.json();
    if (resp.ok)
      return { event: data.event || data, errorCode: "", message: "" };
    return {
      event: null,
      errorCode: data.errorCode || "ERROR",
      message: data.message || "Nie udało się dodać eventu",
    };
  } catch {
    return {
      event: null,
      errorCode: "CONNECTION_ERROR",
      message: "Nie udało się połączyć z serwerem",
    };
  }
}

export async function editEventApi(
  id,
  title,
  description,
  eventTags,
  regularTags,
  start,
  end,
  color,
  isDeadline
) {
  const token = getToken();
  if (!token)
    return {
      event: null,
      errorCode: "TOKEN_UNDEFINED",
      message: "Brak tokena, zaloguj się ponownie",
    };
  try {
    const resp = await fetch(`${API_HOST}/editEvent/${id}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title,
        description,
        eventTags,
        regularTags,
        start,
        end,
        color,
        isDeadline,
      }),
    });
    const authErr = checkUnauthorized(resp);
    if (authErr) return authErr;
    const data = await resp.json();
    if (resp.ok)
      return { event: data.event || data, errorCode: "", message: "" };
    return {
      event: null,
      errorCode: data.errorCode || "ERROR",
      message: data.message || "Nie udało się edytować eventu",
    };
  } catch {
    return {
      event: null,
      errorCode: "CONNECTION_ERROR",
      message: "Nie udało się połączyć z serwerem",
    };
  }
}

export async function deleteEventApi(id) {
  const token = getToken();
  if (!token)
    return {
      errorCode: "TOKEN_UNDEFINED",
      message: "Brak tokena, zaloguj się ponownie",
    };
  try {
    const resp = await fetch(`${API_HOST}/deleteEvent/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const authErr = checkUnauthorized(resp);
    if (authErr) return authErr;
    if (resp.ok) return { errorCode: "", message: "" };
    const data = await resp.json().catch(() => ({}));
    return {
      errorCode: data.errorCode || "ERROR",
      message: data.message || "Nie udało się usunąć eventu",
    };
  } catch {
    return {
      errorCode: "CONNECTION_ERROR",
      message: "Nie udało się połączyć z serwerem",
    };
  }
}

export async function editThisAndFollowingApi(
  eventId,
  title,
  description,
  eventTags,
  regularTags,
  start,
  end,
  color,
  isDeadline,
  recurrenceRule
) {
  const token = getToken();
  if (!token)
    return {
      events: [],
      errorCode: "TOKEN_UNDEFINED",
      message: "Brak tokena, zaloguj się ponownie",
    };
  try {
    const body = {
      title,
      description,
      eventTags,
      recurringEventTags: eventTags,
      regularTags,
      start,
      end,
      color,
      isDeadline,
      recurrenceRule,
    };
    const resp = await fetch(`${API_HOST}/editThisAndFollowing/${eventId}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    const authErr = checkUnauthorized(resp);
    if (authErr) return authErr;
    if (resp.ok) {
      const events = await resp.json();
      return { events, errorCode: "", message: "" };
    }
    const data = await resp.json().catch(() => ({}));
    return {
      events: [],
      errorCode: data.errorCode || "ERROR",
      message: data.message || "Nie udało się edytować serii",
    };
  } catch {
    return {
      events: [],
      errorCode: "CONNECTION_ERROR",
      message: "Nie udało się połączyć z serwerem",
    };
  }
}

export async function editAllInSeriesApi(
  eventId,
  title,
  description,
  eventTags,
  regularTags,
  start,
  end,
  color,
  isDeadline
) {
  const token = getToken();
  if (!token)
    return {
      errorCode: "TOKEN_UNDEFINED",
      message: "Brak tokena, zaloguj się ponownie",
    };
  try {
    const resp = await fetch(`${API_HOST}/editAllInSeries/${eventId}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title,
        description,
        eventTags,
        regularTags,
        start,
        end,
        color,
        isDeadline,
      }),
    });
    const authErr = checkUnauthorized(resp);
    if (authErr) return authErr;
    if (resp.ok) return { errorCode: "", message: "" };
    const data = await resp.json().catch(() => ({}));
    return {
      errorCode: data.errorCode || "ERROR",
      message: data.message || "Nie udało się edytować serii",
    };
  } catch {
    return {
      errorCode: "CONNECTION_ERROR",
      message: "Nie udało się połączyć z serwerem",
    };
  }
}

export async function deleteAllInSeriesApi(eventId) {
  const token = getToken();
  if (!token)
    return {
      errorCode: "TOKEN_UNDEFINED",
      message: "Brak tokena, zaloguj się ponownie",
    };
  try {
    const resp = await fetch(`${API_HOST}/deleteAllInSeries/${eventId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const authErr = checkUnauthorized(resp);
    if (authErr) return authErr;
    if (resp.ok) return { errorCode: "", message: "" };
    const data = await resp.json().catch(() => ({}));
    return {
      errorCode: data.errorCode || "ERROR",
      message: data.message || "Nie udało się usunąć serii",
    };
  } catch {
    return {
      errorCode: "CONNECTION_ERROR",
      message: "Nie udało się połączyć z serwerem",
    };
  }
}

export async function getEventsBetween(startDate, endDate) {
  const token = getToken();
  if (!token)
    return {
      events: [],
      errorCode: "TOKEN_UNDEFINED",
      message: "Brak tokena, zaloguj się ponownie",
    };
  try {
    const resp = await fetch(
      `${API_HOST}/getEventsBetween/${encodeURIComponent(
        startDate
      )}/${encodeURIComponent(endDate)}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    const authErr = checkUnauthorized(resp);
    if (authErr) return authErr;
    if (!resp.ok)
      return {
        events: [],
        errorCode: "FETCH_ERROR",
        message: "Nie udało się pobrać eventów",
      };
    const events = await resp.json();
    return { events, errorCode: "", message: "" };
  } catch {
    return {
      events: [],
      errorCode: "CONNECTION_ERROR",
      message: "Nie udało się połączyć z serwerem",
    };
  }
}

export async function getUsosEvents() {
  const token = getToken();
  if (!token)
    return {
      events: [],
      errorCode: "TOKEN_UNDEFINED",
      message: "Brak tokena, zaloguj się ponownie",
    };
  try {
    const resp = await fetch(`${API_HOST}/getEventsByTags?tags=usos`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    const authErr = checkUnauthorized(resp);
    if (authErr) return authErr;

    if (!resp.ok)
      return {
        events: [],
        errorCode: "FETCH_ERROR",
        message: "Nie udało się pobrać eventów USOS",
      };

    const events = await resp.json();
    return { events, errorCode: "", message: "" };
  } catch {
    return {
      events: [],
      errorCode: "CONNECTION_ERROR",
      message: "Nie udało się połączyć z serwerem",
    };
  }
}

export async function addFlashcardTag(id, tagName) {
  const token = getToken();
  if (!token) return { errorCode: "TOKEN_UNDEFINED", message: "Brak tokena" };

  try {
    const resp = await fetch(`${API_HOST}/addCardTag`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id, tagName }),
    });

    const authErr = checkUnauthorized(resp);
    if (authErr) return authErr;

    if (resp.ok) return { errorCode: "", message: "" };

    const data = await resp.json().catch(() => ({}));
    return {
      errorCode: data.errorCode || "ERROR",
      message: data.message || "Nie udało się dodać tagu",
    };
  } catch {
    return {
      errorCode: "CONNECTION_ERROR",
      message: "Nie udało się połączyć z serwerem",
    };
  }
}

export async function removeFlashcardTag(id, tagName) {
  const token = getToken();
  if (!token) return { errorCode: "TOKEN_UNDEFINED", message: "Brak tokena" };

  try {
    const resp = await fetch(`${API_HOST}/deleteCardTag`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id, tagName }),
    });

    const authErr = checkUnauthorized(resp);
    if (authErr) return authErr;

    if (resp.ok) return { errorCode: "", message: "" };

    const data = await resp.json().catch(() => ({}));
    return {
      errorCode: data.errorCode || "ERROR",
      message: data.message || "Nie udało się usunąć tagu",
    };
  } catch {
    return {
      errorCode: "CONNECTION_ERROR",
      message: "Nie udało się połączyć z serwerem",
    };
  }
}

export async function getAllDeletedFlashcardSets() {
  const token = getToken();
  if (!token)
    return { sets: [], errorCode: "TOKEN_UNDEFINED", message: "Brak tokena" };

  try {
    const resp = await fetch(`${API_HOST}/deletedSets`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });
    const authErr = checkUnauthorized(resp);
    if (authErr) return { sets: [], ...authErr };

    if (resp.ok) {
      const sets = await resp.json();
      return { sets, errorCode: "", message: "" };
    }
    const data = await resp.json().catch(() => ({}));
    return {
      sets: [],
      errorCode: data.errorCode || "ERROR",
      message: data.message || "Błąd pobierania kosza",
    };
  } catch {
    return { sets: [], errorCode: "CONNECTION_ERROR", message: "Błąd serwera" };
  }
}

export async function restoreFlashcardSet(setId) {
  const token = getToken();
  if (!token) return { errorCode: "TOKEN_UNDEFINED", message: "Brak tokena" };

  try {
    const resp = await fetch(`${API_HOST}/restoreSet/${setId}`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
    });
    const authErr = checkUnauthorized(resp);
    if (authErr) return authErr;

    if (resp.ok) return { errorCode: "", message: "" };
    const data = await resp.json().catch(() => ({}));
    return {
      errorCode: data.errorCode || "ERROR",
      message: data.message || "Błąd przywracania zestawu",
    };
  } catch {
    return { errorCode: "CONNECTION_ERROR", message: "Błąd serwera" };
  }
}

export async function hardDeleteFlashcardSet(setId) {
  const token = getToken();
  if (!token) return { errorCode: "TOKEN_UNDEFINED", message: "Brak tokena" };

  try {
    const resp = await fetch(`${API_HOST}/hardDelete/${setId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    const authErr = checkUnauthorized(resp);
    if (authErr) return authErr;

    if (resp.ok) return { errorCode: "", message: "" };
    const data = await resp.json().catch(() => ({}));
    return {
      errorCode: data.errorCode || "ERROR",
      message: data.message || "Błąd trwałego usuwania",
    };
  } catch {
    return { errorCode: "CONNECTION_ERROR", message: "Błąd serwera" };
  }
}

export async function clearFlashcardSetsTrash(setIdsArray) {
  const promises = setIdsArray.map((id) => hardDeleteFlashcardSet(id));
  const results = await Promise.all(promises);

  const errorResult = results.find((r) => r.errorCode);
  if (errorResult) return errorResult;

  return { errorCode: "", message: "" };
}

export async function getRecentFlashcardSets() {
  const token = getToken();
  if (!token)
    return { sets: [], errorCode: "TOKEN_UNDEFINED", message: "Brak tokena" };

  try {
    const resp = await fetch(`${API_HOST}/getLastActivity`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });
    const authErr = checkUnauthorized(resp);
    if (authErr) return authErr;

    if (resp.ok) {
      const data = await resp.json();
      return { sets: data, errorCode: "", message: "" };
    }
    return { sets: [], errorCode: "FETCH_ERROR", message: "Błąd pobierania" };
  } catch {
    return { sets: [], errorCode: "CONNECTION_ERROR", message: "Błąd serwera" };
  }
}

export async function getFlashcardSetStats(setId) {
  const token = getToken();
  if (!token) return { stats: 0, errorCode: "TOKEN_UNDEFINED" };

  try {
    const resp = await fetch(`${API_HOST}/stats/${setId}`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });
    const authErr = checkUnauthorized(resp);
    if (authErr) return { stats: 0, ...authErr };
    if (resp.ok) {
      const data = await resp.json();
      return { stats: data, errorCode: "" };
    }
    return { stats: 0, errorCode: "FETCH_ERROR" };
  } catch {
    return { stats: 0, errorCode: "CONNECTION_ERROR" };
  }
}

export async function getCardDues(cardId) {
  const token = getToken();
  if (!token) return { data: null, errorCode: "TOKEN_UNDEFINED" };

  try {
    const resp = await fetch(`${API_HOST}/getCardsDues/${cardId}`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });
    const authErr = checkUnauthorized(resp);
    if (authErr) return { data: null, ...authErr };

    if (resp.ok) {
      const data = await resp.json();
      return { data, errorCode: "" };
    }
    return { data: null, errorCode: "FETCH_ERROR" };
  } catch {
    return { data: null, errorCode: "CONNECTION_ERROR" };
  }
}

export async function getFolderItemsCount(folderId) {
  const token = getToken();
  if (!token) return { count: 0, errorCode: "TOKEN_UNDEFINED" };

  try {
    const resp = await fetch(`${API_HOST}/folders/countFiles/${folderId}`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });
    const authErr = checkUnauthorized(resp);
    if (authErr) return { count: 0, ...authErr };

    if (resp.ok) {
      const count = await resp.json();
      return { count, errorCode: "" };
    }
    return { count: 0, errorCode: "FETCH_ERROR" };
  } catch {
    return { count: 0, errorCode: "CONNECTION_ERROR" };
  }
}

async function parseErrorBody(resp) {
  try {
    const data = await resp.json();
    return {
      errorCode: data.errorCode || "ERROR",
      message: data.message || "",
    };
  } catch {
    return { errorCode: "ERROR", message: "" };
  }
}

export async function getProfile() {
  const token = getToken();
  if (!token)
    return {
      username: "",
      email: "",
      avatarId: 0,
      errorCode: "TOKEN_UNDEFINED",
      message: "Brak tokena, zaloguj się ponownie",
    };
  try {
    const resp = await fetch(`${API_HOST}/profile`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    const authErr = checkUnauthorized(resp);
    if (authErr) return { username: "", email: "", avatarId: 0, ...authErr };

    if (resp.ok) {
      const data = await resp.json();
      return {
        username: data.username,
        email: data.email,
        avatarId: data.avatarId ?? 0,
        themeColor: data.themeColor || "GREEN",
        universityName: data.university || null,
        errorCode: "",
        message: "",
      };
    }
    const err = await parseErrorBody(resp);
    return {
      username: "",
      email: "",
      avatarId: 0,
      errorCode: err.errorCode,
      message: err.message || "Nie udało się pobrać profilu",
    };
  } catch {
    return {
      username: "",
      email: "",
      avatarId: 0,
      errorCode: "CONNECTION_ERROR",
      message: "Nie udało się połączyć z serwerem. Spróbuj ponownie",
    };
  }
}

export async function changeUsername(newUsername) {
  const token = getToken();
  if (!token)
    return {
      errorCode: "TOKEN_UNDEFINED",
      message: "Brak tokena, zaloguj się ponownie",
    };
  try {
    const resp = await fetch(`${API_HOST}/changeUsername`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ newUsername }),
    });
    const authErr = checkUnauthorized(resp);
    if (authErr) return authErr;

    if (resp.ok) {
      const data = await resp.json();
      if (data.newToken) {
        const isPersistent = !!localStorage.getItem("token");
        saveToken(data.newToken, isPersistent);
      }
      return {
        username: data.username,
        errorCode: "",
        message: "Nazwa użytkownika została zaktualizowana.",
      };
    }
    const err = await parseErrorBody(resp);
    return {
      errorCode: err.errorCode,
      message: err.message || "Nie udało się zmienić nazwy użytkownika",
    };
  } catch {
    return {
      errorCode: "CONNECTION_ERROR",
      message: "Nie udało się połączyć z serwerem. Spróbuj ponownie",
    };
  }
}

export async function changeEmail(newEmail) {
  const token = getToken();
  if (!token)
    return {
      errorCode: "TOKEN_UNDEFINED",
      message: "Brak tokena, zaloguj się ponownie",
    };
  try {
    const resp = await fetch(`${API_HOST}/changeEmail`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ newEmail }),
    });
    const authErr = checkUnauthorized(resp);
    if (authErr) return authErr;

    if (resp.ok) {
      return {
        errorCode: "",
        message: "Wysłaliśmy kod weryfikacyjny na nowy adres e-mail.",
      };
    }
    const err = await parseErrorBody(resp);
    return {
      errorCode: err.errorCode,
      message: err.message || "Nie udało się zmienić adresu e-mail",
    };
  } catch {
    return {
      errorCode: "CONNECTION_ERROR",
      message: "Nie udało się połączyć z serwerem. Spróbuj ponownie",
    };
  }
}

export async function confirmEmailChange(email, verificationCode) {
  const token = getToken();
  if (!token)
    return {
      errorCode: "TOKEN_UNDEFINED",
      message: "Brak tokena, zaloguj się ponownie",
    };
  try {
    const resp = await fetch(`${API_HOST}/confirmEmailChange`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, token: verificationCode }),
    });
    const authErr = checkUnauthorized(resp);
    if (authErr) return authErr;

    if (resp.ok) {
      return { errorCode: "", message: "Adres e-mail został zaktualizowany." };
    }
    const err = await parseErrorBody(resp);
    return {
      errorCode: err.errorCode,
      message: err.message || "Nie udało się potwierdzić zmiany adresu e-mail",
    };
  } catch {
    return {
      errorCode: "CONNECTION_ERROR",
      message: "Nie udało się połączyć z serwerem. Spróbuj ponownie",
    };
  }
}

export async function changePassword(oldPassword, newPassword) {
  const token = getToken();
  if (!token)
    return {
      errorCode: "TOKEN_UNDEFINED",
      message: "Brak tokena, zaloguj się ponownie",
    };
  try {
    const resp = await fetch(`${API_HOST}/changePassword`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ oldPassword, newPassword }),
    });
    const authErr = checkUnauthorized(resp);
    if (authErr) return authErr;

    if (resp.ok) {
      return { errorCode: "", message: "Hasło zostało zmienione." };
    }
    const err = await parseErrorBody(resp);
    return {
      errorCode: err.errorCode,
      message: err.message || "Nie udało się zmienić hasła",
    };
  } catch {
    return {
      errorCode: "CONNECTION_ERROR",
      message: "Nie udało się połączyć z serwerem. Spróbuj ponownie",
    };
  }
}

export async function changeAvatar(avatarId) {
  const token = getToken();
  if (!token)
    return {
      errorCode: "TOKEN_UNDEFINED",
      message: "Brak tokena, zaloguj się ponownie",
    };
  try {
    const resp = await fetch(`${API_HOST}/changeAvatar`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ avatarId }),
    });
    const authErr = checkUnauthorized(resp);
    if (authErr) return authErr;

    if (resp.ok) {
      return { errorCode: "", message: "Awatar został zaktualizowany." };
    }
    const err = await parseErrorBody(resp);
    return {
      errorCode: err.errorCode,
      message: err.message || "Nie udało się zmienić awatara",
    };
  } catch {
    return {
      errorCode: "CONNECTION_ERROR",
      message: "Nie udało się połączyć z serwerem. Spróbuj ponownie",
    };
  }
}

export async function changeTheme(themeColor) {
  const token = getToken();
  if (!token)
    return {
      errorCode: "TOKEN_UNDEFINED",
      message: "Brak tokena, zaloguj się ponownie",
    };
  try {
    const resp = await fetch(`${API_HOST}/changeTheme`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ themeColor }),
    });
    const authErr = checkUnauthorized(resp);
    if (authErr) return authErr;

    if (resp.ok) {
      return { errorCode: "", message: "Motyw został zmieniony." };
    }
    const err = await parseErrorBody(resp);
    return {
      errorCode: err.errorCode,
      message: err.message || "Nie udało się zmienić motywu",
    };
  } catch {
    return {
      errorCode: "CONNECTION_ERROR",
      message: "Nie udało się połączyć z serwerem. Spróbuj ponownie",
    };
  }
}

export async function deleteAccount(password) {
  const token = getToken();
  if (!token)
    return {
      errorCode: "TOKEN_UNDEFINED",
      message: "Brak tokena, zaloguj się ponownie",
    };
  try {
    const resp = await fetch(`${API_HOST}/deleteAccount`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ password }),
    });
    const authErr = checkUnauthorized(resp);
    if (authErr) return authErr;

    if (resp.ok) {
      return { errorCode: "", message: "Konto zostało usunięte." };
    }
    const err = await parseErrorBody(resp);
    return {
      errorCode: err.errorCode,
      message: err.message || "Nie udało się usunąć konta",
    };
  } catch {
    return {
      errorCode: "CONNECTION_ERROR",
      message: "Nie udało się połączyć z serwerem. Spróbuj ponownie",
    };
  }
}

export async function getAllUsersCards() {
  const token = getToken();
  if (!token)
    return {
      cards: [],
      errorCode: "TOKEN_UNDEFINED",
      message: "Brak tokena",
    };

  try {
    const resp = await fetch(`${API_HOST}/getAllUsersCards`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    const authErr = checkUnauthorized(resp);
    if (authErr) return authErr;

    if (!resp.ok)
      return {
        cards: [],
        errorCode: "FETCH_ERROR",
        message: "Nie udało się pobrać fiszek",
      };

    const cards = await resp.json();
    return { cards, errorCode: "", message: "" };
  } catch {
    return {
      cards: [],
      errorCode: "CONNECTION_ERROR",
      message: "Błąd serwera",
    };
  }
}

export async function getUniversities() {
  const token = getToken();
  if (!token)
    return {
      universities: [],
      errorCode: "TOKEN_UNDEFINED",
      message: "Brak tokena, zaloguj się ponownie",
    };
  try {
    const resp = await fetch(`${API_HOST}/universities`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    const authErr = checkUnauthorized(resp);
    if (authErr) return { universities: [], ...authErr };
    if (resp.ok) {
      const data = await resp.json();
      return { universities: data, errorCode: "", message: "" };
    }
    return {
      universities: [],
      errorCode: "FETCH_ERROR",
      message: "Nie udało się pobrać listy uczelni",
    };
  } catch {
    return {
      universities: [],
      errorCode: "CONNECTION_ERROR",
      message: "Nie udało się połączyć z serwerem",
    };
  }
}

export async function setUniversity(universityName) {
  const token = getToken();
  if (!token)
    return {
      errorCode: "TOKEN_UNDEFINED",
      message: "Brak tokena, zaloguj się ponownie",
    };
  try {
    const resp = await fetch(
      `${API_HOST}/addUniversity?universityName=${encodeURIComponent(
        universityName
      )}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    const authErr = checkUnauthorized(resp);
    if (authErr) return authErr;
    if (resp.ok)
      return { errorCode: "", message: "Uczelnia została zapisana." };
    const err = await parseErrorBody(resp);
    return {
      errorCode: err.errorCode,
      message: err.message || "Nie udało się zapisać uczelni",
    };
  } catch {
    return {
      errorCode: "CONNECTION_ERROR",
      message: "Nie udało się połączyć z serwerem",
    };
  }
}

export async function getCardsByTags(tags) {
  const token = getToken();
  if (!token)
    return {
      cards: [],
      errorCode: "TOKEN_UNDEFINED",
      message: "Brak tokena",
    };

  try {
    const resp = await fetch(`${API_HOST}/getCardsByTags`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ tags }),
    });
    const authErr = checkUnauthorized(resp);
    if (authErr) return authErr;

    if (!resp.ok)
      return {
        cards: [],
        errorCode: "FETCH_ERROR",
        message: "Nie udało się pobrać fiszek",
      };

    const cards = await resp.json();
    return { cards, errorCode: "", message: "" };
  } catch {
    return {
      cards: [],
      errorCode: "CONNECTION_ERROR",
      message: "Błąd serwera",
    };
  }
}

export const getUserSocialGroups = async () => {
  const token = getToken();
  if (!token) return { errorCode: "TOKEN_UNDEFINED" };
  try {
    const response = await fetch(`${API_HOST}/social`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const authErr = checkUnauthorized(response);
    if (authErr) return authErr;
    const data = await response.json();
    return response.ok
      ? data
      : { errorCode: data.errorCode || "ERROR", message: data.message };
  } catch (error) {
    return { errorCode: "NETWORK_ERROR", message: "Błąd sieci" };
  }
};

export const createSocialGroup = async (name, description) => {
  const token = getToken();
  if (!token) return { errorCode: "TOKEN_UNDEFINED" };
  try {
    const response = await fetch(`${API_HOST}/createSocial`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name, description }),
    });
    const authErr = checkUnauthorized(response);
    if (authErr) return authErr;
    const data = await response.json();
    return response.ok
      ? data
      : { errorCode: data.errorCode || "ERROR", message: data.message };
  } catch (error) {
    return { errorCode: "NETWORK_ERROR", message: "Błąd sieci" };
  }
};

export const getSocialGroup = async (id) => {
  const token = getToken();
  if (!token) return { errorCode: "TOKEN_UNDEFINED" };
  try {
    const response = await fetch(`${API_HOST}/social/${id}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const authErr = checkUnauthorized(response);
    if (authErr) return authErr;
    const data = await response.json();
    return response.ok
      ? data
      : { errorCode: data.errorCode || "ERROR", message: data.message };
  } catch (error) {
    return { errorCode: "NETWORK_ERROR", message: "Błąd sieci" };
  }
};

export const editSocialGroup = async (id, name, description) => {
  const token = getToken();
  if (!token) return { errorCode: "TOKEN_UNDEFINED" };
  try {
    const response = await fetch(`${API_HOST}/social/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name, description }),
    });
    const authErr = checkUnauthorized(response);
    if (authErr) return authErr;
    const data = await response.json();
    return response.ok
      ? data
      : { errorCode: data.errorCode || "ERROR", message: data.message };
  } catch (error) {
    return { errorCode: "NETWORK_ERROR", message: "Błąd sieci" };
  }
};

export const deleteSocialGroup = async (id) => {
  const token = getToken();
  if (!token) return { errorCode: "TOKEN_UNDEFINED" };
  try {
    const response = await fetch(`${API_HOST}/social/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const authErr = checkUnauthorized(response);
    if (authErr) return authErr;
    if (response.ok) {
      const data = await response.json().catch(() => true);
      return { success: data, errorCode: "" };
    } else {
      const errData = await response.json().catch(() => ({}));
      return {
        errorCode: errData.errorCode || "ERROR",
        message: errData.message || "Błąd usuwania.",
      };
    }
  } catch (error) {
    return { errorCode: "NETWORK_ERROR", message: "Błąd sieci" };
  }
};

export const getFriends = async () => {
  const token = getToken();
  if (!token) return { errorCode: "TOKEN_UNDEFINED" };
  try {
    const response = await fetch(`${API_HOST}/getFriends`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });
    const authErr = checkUnauthorized(response);
    if (authErr) return authErr;
    const data = await response.json();
    return response.ok
      ? data
      : { errorCode: data.errorCode || "ERROR", message: data.message };
  } catch (error) {
    return { errorCode: "NETWORK_ERROR", message: "Błąd sieci" };
  }
};

export const getPendingInvites = async () => {
  const token = getToken();
  if (!token) return { errorCode: "TOKEN_UNDEFINED" };
  try {
    const response = await fetch(`${API_HOST}/getPendingInvites`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });
    const authErr = checkUnauthorized(response);
    if (authErr) return authErr;
    const data = await response.json();
    return response.ok
      ? data
      : { errorCode: data.errorCode || "ERROR", message: data.message };
  } catch (error) {
    return { errorCode: "NETWORK_ERROR", message: "Błąd sieci" };
  }
};

export const addFriend = async (receiverUsername) => {
  const token = getToken();
  if (!token) return { errorCode: "TOKEN_UNDEFINED" };
  try {
    const payloadStr = String(receiverUsername).trim();

    const response = await fetch(`${API_HOST}/addFriend`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ receiverUsername: payloadStr }),
    });
    const authErr = checkUnauthorized(response);
    if (authErr) return authErr;
    const data = await response.json();
    return response.ok
      ? data
      : { errorCode: data.errorCode || "ERROR", message: data.message };
  } catch (error) {
    return { errorCode: "NETWORK_ERROR", message: "Błąd sieci" };
  }
};

export const removeFriend = async (friendId) => {
  const token = getToken();
  if (!token) return { errorCode: "TOKEN_UNDEFINED" };
  try {
    const response = await fetch(`${API_HOST}/removeFriend/${friendId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    const authErr = checkUnauthorized(response);
    if (authErr) return authErr;
    return response.ok
      ? { success: true }
      : { errorCode: "ERROR", message: "Błąd usuwania" };
  } catch (error) {
    return { errorCode: "NETWORK_ERROR", message: "Błąd sieci" };
  }
};

export const rejectFriend = async (senderId) => {
  const token = getToken();
  if (!token) return { errorCode: "TOKEN_UNDEFINED" };
  try {
    const response = await fetch(`${API_HOST}/rejectFriend/${senderId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    const authErr = checkUnauthorized(response);
    if (authErr) return authErr;
    return response.ok
      ? { success: true }
      : { errorCode: "ERROR", message: "Nie udało się odrzucić" };
  } catch (error) {
    return { errorCode: "NETWORK_ERROR", message: "Błąd sieci" };
  }
};

export const getNotifications = async () => {
  const token = getToken();
  if (!token) return { notifications: [], errorCode: "TOKEN_UNDEFINED" };

  try {
    const resp = await fetch(`${API_HOST}/notifications`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });
    const authErr = checkUnauthorized(resp);
    if (authErr) return { notifications: [], ...authErr };

    if (resp.ok) {
      const data = await resp.json();
      return { notifications: data, errorCode: "" };
    }
    return { notifications: [], errorCode: "FETCH_ERROR" };
  } catch {
    return { notifications: [], errorCode: "CONNECTION_ERROR" };
  }
};

export const markNotificationAsRead = async (id) => {
  const token = getToken();
  if (!token) return { errorCode: "TOKEN_UNDEFINED" };

  try {
    const resp = await fetch(`${API_HOST}/markAsRead/${id}`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
    });
    const authErr = checkUnauthorized(resp);
    if (authErr) return authErr;

    if (resp.ok) return { errorCode: "" };
    return { errorCode: "ERROR" };
  } catch {
    return { errorCode: "CONNECTION_ERROR" };
  }
};

export const markAllNotificationsAsRead = async () => {
  const token = getToken();
  if (!token) return { errorCode: "TOKEN_UNDEFINED" };

  try {
    const resp = await fetch(`${API_HOST}/markAllAsRead`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
    });
    const authErr = checkUnauthorized(resp);
    if (authErr) return authErr;

    if (resp.ok) return { errorCode: "" };
    return { errorCode: "ERROR" };
  } catch {
    return { errorCode: "CONNECTION_ERROR" };
  }
};

export const clearAllNotifications = async () => {
  const token = getToken();
  if (!token) return { errorCode: "TOKEN_UNDEFINED" };

  try {
    const resp = await fetch(`${API_HOST}/clearNotifications`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    const authErr = checkUnauthorized(resp);
    if (authErr) return authErr;

    if (resp.ok) return { errorCode: "" };
    return { errorCode: "ERROR" };
  } catch {
    return { errorCode: "CONNECTION_ERROR" };
  }
};

export const createInvitationLink = async (socialId, role = "MEMBER") => {
  const token = getToken();
  if (!token) return { errorCode: "TOKEN_UNDEFINED" };

  try {
    const resp = await fetch(`${API_HOST}/createInvitationLink`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ socialId, role }),
    });
    const authErr = checkUnauthorized(resp);
    if (authErr) return authErr;

    if (resp.ok) {
      const link = await resp.text();
      return { link, errorCode: "" };
    }
    const data = await resp.json().catch(() => ({}));
    return {
      errorCode: "ERROR",
      message: data.message || "Błąd generowania linku",
    };
  } catch {
    return { errorCode: "CONNECTION_ERROR" };
  }
};

export const validateInvitation = async (invitationToken) => {
  const token = getToken();
  if (!token) return { errorCode: "TOKEN_UNDEFINED" };

  try {
    const resp = await fetch(
      `${API_HOST}/validateInvitation?token=${encodeURIComponent(
        invitationToken
      )}`,
      {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    const authErr = checkUnauthorized(resp);
    if (authErr) return authErr;

    const data = await resp.json();
    if (resp.ok) return { ...data, errorCode: "" };

    return {
      errorCode: "ERROR",
      message: data.message || "Błąd walidacji zaproszenia",
    };
  } catch {
    return { errorCode: "CONNECTION_ERROR" };
  }
};

export const acceptInvitation = async (invitationToken) => {
  const token = getToken();
  if (!token) return { errorCode: "TOKEN_UNDEFINED" };

  try {
    const resp = await fetch(
      `${API_HOST}/acceptInvitation?token=${encodeURIComponent(
        invitationToken
      )}`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    const authErr = checkUnauthorized(resp);
    if (authErr) return authErr;

    const data = await resp.json();
    if (resp.ok) return { success: data, errorCode: "" };

    return {
      errorCode: "ERROR",
      message: data.message || "Błąd akceptacji zaproszenia",
    };
  } catch {
    return { errorCode: "CONNECTION_ERROR" };
  }
};

export async function copyNoteToGroup(noteId, socialId, newName) {
  const token = getToken();
  if (!token) return { errorCode: "TOKEN_UNDEFINED" };

  try {
    const resp = await fetch(
      `${API_HOST}/notes/copyNote/${noteId}?socialId=${socialId}&newName=${encodeURIComponent(
        newName
      )}`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    const authErr = checkUnauthorized(resp);
    if (authErr) return authErr;

    if (resp.ok) return { errorCode: "" };
    const data = await resp.json().catch(() => ({}));
    return {
      errorCode: "ERROR",
      message: data.message || "Błąd klonowania notatki",
    };
  } catch {
    return { errorCode: "CONNECTION_ERROR" };
  }
}

export async function copyFlashcardSetToGroup(setId, socialId, newName) {
  const token = getToken();
  if (!token) return { errorCode: "TOKEN_UNDEFINED" };

  try {
    const resp = await fetch(
      `${API_HOST}/copyCardSet/${setId}?socialId=${socialId}&newName=${encodeURIComponent(
        newName
      )}`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    const authErr = checkUnauthorized(resp);
    if (authErr) return authErr;

    if (resp.ok) return { errorCode: "" };
    const data = await resp.json().catch(() => ({}));
    return {
      errorCode: "ERROR",
      message: data.message || "Błąd klonowania zestawu",
    };
  } catch {
    return { errorCode: "CONNECTION_ERROR" };
  }
}

export const getSocialGroupUsers = async (id) => {
  const token = getToken();
  if (!token) return { errorCode: "TOKEN_UNDEFINED" };

  try {
    const response = await fetch(`${API_HOST}/social/${id}/users`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });
    const authErr = checkUnauthorized(response);
    if (authErr) return authErr;
    const data = await response.json();
    return response.ok
      ? data
      : { errorCode: data.errorCode || "ERROR", message: data.message };
  } catch (error) {
    return { errorCode: "NETWORK_ERROR", message: "Błąd sieci" };
  }
};

export async function getFlashcardSet(id, socialId = null) {
  const token = getToken();
  if (!token) return { errorCode: "TOKEN_UNDEFINED" };

  try {
    const url = socialId
      ? `${API_HOST}/getCardSet/${id}?socialId=${socialId}`
      : `${API_HOST}/getCardSet/${id}`;

    const resp = await fetch(url, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });

    const authErr = checkUnauthorized(resp);
    if (authErr) return authErr;

    if (resp.ok) {
      const data = await resp.json();
      return { ...data, errorCode: "" };
    }

    const errData = await resp.json().catch(() => ({}));
    return {
      errorCode: "API_ERROR",
      message: errData.message || "Nie udało się pobrać zestawu",
    };
  } catch {
    return { errorCode: "CONNECTION_ERROR", message: "Błąd serwera" };
  }
}

export const changeSocialGroupRole = async (socialId, userId, role) => {
  const token = getToken();
  if (!token) return { errorCode: "TOKEN_UNDEFINED" };

  try {
    const resp = await fetch(`${API_HOST}/change/role`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ socialId, userId, role }),
    });

    const authErr = checkUnauthorized(resp);
    if (authErr) return authErr;

    if (resp.ok) return { errorCode: "" };

    const data = await resp.json().catch(() => ({}));
    return {
      errorCode: data.errorCode || "ERROR",
      message: data.message || "Błąd zmiany roli",
    };
  } catch {
    return { errorCode: "CONNECTION_ERROR", message: "Błąd serwera" };
  }
};

export const removeUserFromSocialGroup = async (socialId, userId) => {
  const token = getToken();
  if (!token) return { errorCode: "TOKEN_UNDEFINED" };

  try {
    const resp = await fetch(
      `${API_HOST}/social/${socialId}/deleteUser/${userId}`,
      {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    const authErr = checkUnauthorized(resp);
    if (authErr) return authErr;

    if (resp.ok) return { errorCode: "" };

    const data = await resp.json().catch(() => ({}));
    return {
      errorCode: data.errorCode || "ERROR",
      message: data.message || "Błąd usuwania użytkownika.",
    };
  } catch {
    return { errorCode: "CONNECTION_ERROR", message: "Błąd serwera." };
  }
};

export const leaveSocialGroup = async (socialId) => {
  const token = getToken();
  if (!token) return { errorCode: "TOKEN_UNDEFINED" };

  try {
    const resp = await fetch(`${API_HOST}/leaveSocial/${socialId}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
    });
    const authErr = checkUnauthorized(resp);
    if (authErr) return authErr;

    if (resp.ok) return { errorCode: "" };

    const data = await resp.json().catch(() => ({}));
    return {
      errorCode: data.errorCode || "ERROR",
      message: data.message || "Błąd podczas opuszczania grupy.",
    };
  } catch {
    return { errorCode: "CONNECTION_ERROR", message: "Błąd serwera." };
  }
};

export const inviteFriendToSocialGroup = async (
  socialId,
  friendUsername,
  role
) => {
  const token = getToken();
  if (!token) return { errorCode: "TOKEN_UNDEFINED" };

  try {
    const resp = await fetch(
      `${API_HOST}/inviteFriendToGroup?socialId=${socialId}&friendUsername=${encodeURIComponent(
        friendUsername
      )}&role=${role}`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    const authErr = checkUnauthorized(resp);
    if (authErr) return authErr;

    if (resp.ok) return { errorCode: "" };
    const data = await resp.json().catch(() => ({}));
    return {
      errorCode: data.errorCode || "ERROR",
      message: data.message || "Błąd wysyłania zaproszenia.",
    };
  } catch {
    return { errorCode: "CONNECTION_ERROR", message: "Błąd serwera." };
  }
};

export const acceptDirectGroupInvitation = async (invitationId) => {
  const token = getToken();
  if (!token) return { errorCode: "TOKEN_UNDEFINED" };
  try {
    const resp = await fetch(
      `${API_HOST}/acceptGroupInvitation/${invitationId}`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    const authErr = checkUnauthorized(resp);
    if (authErr) return authErr;

    if (resp.ok) return { errorCode: "" };
    const data = await resp.json().catch(() => ({}));
    return {
      errorCode: data.errorCode || "ERROR",
      message: data.message || "Błąd akceptacji.",
    };
  } catch {
    return { errorCode: "CONNECTION_ERROR", message: "Błąd serwera." };
  }
};

export const declineDirectGroupInvitation = async (invitationId) => {
  const token = getToken();
  if (!token) return { errorCode: "TOKEN_UNDEFINED" };
  try {
    const resp = await fetch(
      `${API_HOST}/declineGroupInvitation/${invitationId}`,
      {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    const authErr = checkUnauthorized(resp);
    if (authErr) return authErr;

    if (resp.ok) return { errorCode: "" };
    return { errorCode: "ERROR", message: "Błąd odrzucania." };
  } catch {
    return { errorCode: "CONNECTION_ERROR", message: "Błąd serwera." };
  }
};
