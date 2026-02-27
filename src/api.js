import { API_HOST } from "./config";
import { getToken, removeToken } from "./token";

function checkUnauthorized(resp) {
  if (resp.status === 401 || resp.status === 403) {
    removeToken();
    return {
      errorCode: "TOKEN_UNDEFINED",
      message: "Sesja wygasła, zaloguj się ponownie",
    };
  }
  return null;
}

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

export async function getNoteDetails(id) {
  const token = getToken();
  if (!token)
    return {
      name: "",
      content: "",
      errorCode: "TOKEN_UNDEFINED",
      message: "Brak tokena, zaloguj się ponownie",
    };
  try {
    const resp = await fetch(`${API_HOST}/notes/readNote/${id}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
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

export async function editNote(id, content) {
  const token = getToken();
  if (!token)
    return {
      errorCode: "TOKEN_UNDEFINED",
      message: "Brak tokena, zaloguj się ponownie",
    };

  try {
    const resp = await fetch(`${API_HOST}/notes/editNote`, {
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

export async function getNoteTags(id) {
  const token = getToken();
  if (!token)
    return {
      name: "",
      content: "",
      errorCode: "TOKEN_UNDEFINED",
      message: "Brak tokena, zaloguj się ponownie",
    };
  try {
    const resp = await fetch(`${API_HOST}/notes/getNoteTags/${id}`, {
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

export async function addNote(name, path = "/") {
  const token = getToken();
  if (!token)
    return {
      id: undefined,
      errorCode: "TOKEN_UNDEFINED",
      message: "Brak tokena, zaloguj się ponownie",
    };

  try {
    const resp = await fetch(`${API_HOST}/notes/addNote`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        path,
        content: "",
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

export async function addNoteTag(id, name) {
  const token = getToken();
  if (!token)
    return {
      errorCode: "TOKEN_UNDEFINED",
      message: "Brak tokena, zaloguj się ponownie",
    };

  try {
    const resp = await fetch(`${API_HOST}/notes/addNoteTag`, {
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

export async function removeNoteTag(id, name) {
  const token = getToken();
  if (!token)
    return {
      errorCode: "TOKEN_UNDEFINED",
      message: "Brak tokena, zaloguj się ponownie",
    };

  try {
    const resp = await fetch(`${API_HOST}/notes/removeNoteTag`, {
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

export async function renameNote(id, name) {
  const token = getToken();
  if (!token)
    return {
      newName: "",
      errorCode: "TOKEN_UNDEFINED",
      message: "Brak tokena, zaloguj się ponownie",
    };

  try {
    const resp = await fetch(`${API_HOST}/notes/renameNote`, {
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

export async function deleteNote(id) {
  const token = getToken();
  if (!token)
    return {
      errorCode: "TOKEN_UNDEFINED",
      message: "Brak tokena, zaloguj się ponownie",
    };

  try {
    const resp = await fetch(`${API_HOST}/notes/deleteNote/${id}`, {
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

export async function getRootFolder() {
  const token = getToken();
  if (!token)
    return {
      errorCode: "TOKEN_UNDEFINED",
      message: "Brak tokena",
    };
  try {
    const resp = await fetch(`${API_HOST}/folders/getRootFolder`, {
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
        errorCode: "FETCH_ERROR",
        message: "Błąd",
      };
    const data = await resp.json();
    return { ...data, errorCode: "", message: "" };
  } catch {
    return {
      errorCode: "CONNECTION_ERROR",
      message: "Nie udało się połączyć",
    };
  }
}

export async function getFolderContent(id, isDeleted = false) {
  const token = getToken();
  if (!token)
    return {
      subFolders: [],
      notes: [],
      errorCode: "TOKEN_UNDEFINED",
      message: "Brak tokena",
    };
  try {
    const resp = await fetch(
      `${API_HOST}/folders/getFolderContent/${id}/${isDeleted}`,
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
        subFolders: [],
        notes: [],
        errorCode: "FETCH_ERROR",
        message: "Błąd",
      };
    const data = await resp.json();
    return { ...data, errorCode: "", message: "" };
  } catch {
    return {
      subFolders: [],
      notes: [],
      errorCode: "CONNECTION_ERROR",
      message: "Nie udało się połączyć",
    };
  }
}

export async function resolveFolderByPath(pathSegments, isDeleted = false) {
  const root = await getRootFolder();
  if (root.errorCode) return root;

  if (pathSegments.length === 0) {
    if (isDeleted) {
      const res = await getDeletedRootContent();
      if (res.errorCode) return res;
      return {
        currentFolder: null,
        breadcrumbs: [],
        subFolders: res.subFolders || [],
        notes: res.notes || [],
        errorCode: "",
        message: "",
      };
    } else {
      const res = await getFolderContent(root.id, false);
      if (res.errorCode) return res;
      return {
        currentFolder: null,
        breadcrumbs: [],
        subFolders: res.subFolders || [],
        notes: res.notes || [],
        errorCode: "",
        message: "",
      };
    }
  }

  let currentId = root.id;
  const breadcrumbs = [];

  for (let i = 0; i < pathSegments.length; i++) {
    const segmentName = decodeURIComponent(pathSegments[i]);
    const isLastSegment = i === pathSegments.length - 1;
    let content;
    if (i === 0 && isDeleted) {
      content = await getDeletedRootContent();
    } else {
      content = await getFolderContent(currentId, isDeleted);
    }
    if (content.errorCode) return content;

    const folders = content.subFolders || [];
    const match = folders.find((f) => f.name === segmentName);
    if (!match) {
      return {
        errorCode: "PATH_NOT_FOUND",
        message: `Nie znaleziono folderu: ${segmentName}`,
      };
    }

    breadcrumbs.push(match);
    currentId = match.id;

    if (isLastSegment) {
      const finalContent = await getFolderContent(match.id, isDeleted);
      if (finalContent.errorCode) return finalContent;
      return {
        currentFolder: match,
        breadcrumbs,
        subFolders: finalContent.subFolders || [],
        notes: finalContent.notes || [],
        errorCode: "",
        message: "",
      };
    }
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

//
//
// FISZKI I ZESTAWY FISZEK
//
//
export async function addCard(
  question,
  answer,
  setId,
  tags = [],
  isForced = false
) {
  const token = getToken();
  if (!token)
    return {
      id: undefined,
      errorCode: "TOKEN_UNDEFINED",
      message: "Brak tokena",
    };

  try {
    const resp = await fetch(`${API_HOST}/addCard`, {
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

export async function addFlashcardSet(name, tags = []) {
  const token = getToken();
  if (!token)
    return {
      id: undefined,
      errorCode: "TOKEN_UNDEFINED",
      message: "Brak tokena",
    };

  try {
    const resp = await fetch(`${API_HOST}/addCardSet`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: name,
        tags: tags,
        cards: [],
      }),
    });
    const authErr = checkUnauthorized(resp);
    if (authErr) return authErr;

    if (resp.ok) {
      const responseBody = await resp.json();
      return { id: responseBody.name, errorCode: "", message: "" };
    }

    const errorData = await resp.json().catch(() => ({}));
    return {
      id: undefined,
      errorCode: "API_ERROR",
      message: errorData.message || "Błąd tworzenia zestawu",
    };
  } catch {
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

export async function editFlashcardSet(setId, name, tags = []) {
  const token = getToken();
  if (!token) return { errorCode: "TOKEN_UNDEFINED", message: "Brak tokena" };
  try {
    const resp = await fetch(`${API_HOST}/editCardSet/${setId}`, {
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

export async function getDeletedRootContent() {
  const token = getToken();
  if (!token)
    return {
      errorCode: "TOKEN_UNDEFINED",
      message: "Brak tokena, zaloguj się ponownie",
    };
  try {
    const resp = await fetch(`${API_HOST}/folders/getDeletedRootContent`, {
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
        errorCode: "FETCH_ERROR",
        message: "Nie udało się pobrać usuniętych elementów",
      };
    }
    const data = await resp.json();
    return {
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

export async function deleteFlashcardSet(setId) {
  const token = getToken();
  if (!token)
    return {
      errorCode: "TOKEN_UNDEFINED",
      message: "Brak tokena, zaloguj się ponownie",
    };
  try {
    const resp = await fetch(`${API_HOST}/deleteCardSet/${setId}`, {
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
  if (!token) return false;
  try {
    const resp = await fetch(`${API_HOST}/resetCards/${setId}`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
    });
    const authErr = checkUnauthorized(resp);
    if (authErr) return authErr;

    return resp.ok;
  } catch (err) {
    return false;
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
