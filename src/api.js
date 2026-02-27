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
  const token = sessionStorage.getItem("token");
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
  const token = sessionStorage.getItem("token");
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
  const token = sessionStorage.getItem("token");
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
  const token = sessionStorage.getItem("token");
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


//
//
// FISZKI I ZESTAWY FISZEK
//
//
export async function addCard(question, answer, setId, tags = [], isForced = false) {
  const token = sessionStorage.getItem("token");
  if (!token) return { id: undefined, errorCode: "TOKEN_UNDEFINED", message: "Brak tokena" };

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
          isForced: isForced
      }), 
    });

    if (resp.ok) {
      const { id } = await resp.json();
      return { id, errorCode: "", message: "" };
    }


    const errorData = await resp.json().catch(() => ({})); 
    return { id: undefined, errorCode: "API_ERROR", message: errorData.message || "Błąd dodawania fiszki" };
  } catch {
    return { id: undefined, errorCode: "CONNECTION_ERROR", message: "Błąd połączenia z serwerem" };
  }
}

export async function editCard(id, question, answer, setId, tags = []) {
  const token = sessionStorage.getItem("token");
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
          isForced: false
      }),
    });

    if (resp.ok) return { errorCode: "", message: "" };
    const errorData = await resp.json().catch(() => ({})); 
    return { errorCode: "API_ERROR", message: errorData.message || "Błąd edycji fiszki" };
  } catch {
    return { errorCode: "CONNECTION_ERROR", message: "Błąd serwera" };
  }
}

export async function deleteCard(id) {
  const token = sessionStorage.getItem("token");
  if (!token) return { errorCode: "TOKEN_UNDEFINED", message: "Brak tokena" };

  try {
    const resp = await fetch(`${API_HOST}/deleteCard/${id}`, {
      method: "PATCH", 
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (resp.ok) return { errorCode: "", message: "" };
    const errorData = await resp.json().catch(() => ({})); 
    return { errorCode: "API_ERROR", message: errorData.message || "Błąd usuwania fiszki" };
  } catch {
    return { errorCode: "CONNECTION_ERROR", message: "Błąd serwera" };
  }
}

export async function addFlashcardSet(name, tags = []) {
  const token = sessionStorage.getItem("token");
  if (!token) return { id: undefined, errorCode: "TOKEN_UNDEFINED", message: "Brak tokena" };

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
          cards: [] 
      }), 
    });

    if (resp.ok) {
      const responseBody = await resp.json();
      return { id: responseBody.name, errorCode: "", message: "" }; 
    }

    const errorData = await resp.json().catch(() => ({})); 
    return { id: undefined, errorCode: "API_ERROR", message: errorData.message || "Błąd tworzenia zestawu" };
  } catch {
    return { id: undefined, errorCode: "CONNECTION_ERROR", message: "Błąd serwera" };
  }
}

export async function editFlashcardSet(setId, name, tags = []) {
  const token = sessionStorage.getItem("token");
  try {
    const resp = await fetch(`${API_HOST}/editCardSet/${setId}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: name, tags: tags }),
    });
    if (resp.ok) return { errorCode: "", message: "" };
    const errorData = await resp.json().catch(() => ({}));
    return { errorCode: "API_ERROR", message: errorData.message || "Błąd edycji zestawu" };
  } catch {
    return { errorCode: "CONNECTION_ERROR", message: "Błąd serwera" };
  }
}


export async function deleteFlashcardSet(setId) {
  const token = sessionStorage.getItem("token");
  try {
    const resp = await fetch(`${API_HOST}/deleteCardSet/${setId}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (resp.ok) return { errorCode: "", message: "" };
    return { errorCode: "API_ERROR", message: "Błąd usuwania zestawu" };
  } catch {
    return { errorCode: "CONNECTION_ERROR", message: "Błąd serwera" };
  }
}




export async function getAllFlashcardSets() {
  const token = sessionStorage.getItem("token");
  if (!token) return { sets: [], errorCode: "TOKEN_UNDEFINED", message: "Brak tokena" };

  try {
    const resp = await fetch(`${API_HOST}/allCardSets`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
    });

    if (!resp.ok) return { sets: [], errorCode: "FETCH_ERROR", message: "Nie udało się pobrać zestawów" };
    
    const sets = await resp.json();
    return { sets, errorCode: "", message: "" };
  } catch {
    return { sets: [], errorCode: "CONNECTION_ERROR", message: "Błąd serwera" };
  }
}

export async function getFastLearningCards(setId) {
  const token = sessionStorage.getItem("token");
  try {
    const resp = await fetch(`${API_HOST}/getCardsToLearn/${setId}`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!resp.ok) throw new Error("Błąd pobierania");
    return await resp.json();
  } catch (err) {
    return null;
  }
}

export async function sendFastLearningAnswer(cardId, answerCode) {
  const token = sessionStorage.getItem("token");
  try {
    const resp = await fetch(`${API_HOST}/fastLearningModeAnswer`, {
      method: "PATCH",
      headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
      },
      body: JSON.stringify({ 
          cardId: cardId, 
          answer: answerCode 
      })
    });
    return resp.ok;
  } catch (err) {
    return false;
  }
}


// resetowanie postepu nauki (umiem = 0)
export async function resetFlashcardSetProgress(setId) {
  const token = sessionStorage.getItem("token");
  try {
    const resp = await fetch(`${API_HOST}/resetCards/${setId}`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` }
    });
    return resp.ok;
  } catch (err) {
    return false;
  }
}

//
// FSRS
//
export async function getFsrsCards(setId) {
  const token = sessionStorage.getItem("token");
  try {
    const resp = await fetch(`${API_HOST}/getCardsToLearnFsrs/${setId}`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!resp.ok) throw new Error("Błąd pobierania");
    return await resp.json();
  } catch (err) {
    return null;
  }
}

export async function sendFsrsAnswer(cardId, ratingValue) {
  const token = sessionStorage.getItem("token");
  try {
    const resp = await fetch(`${API_HOST}/rateCard`, {
      method: "POST", 
      headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
      },
      body: JSON.stringify({ 
          cardId: cardId,
          rating: rating
      })
    });
    return resp.ok;
  } catch (err) {
    return false;
  }
}