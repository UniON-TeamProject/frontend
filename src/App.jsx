import { Routes, Route, BrowserRouter } from "react-router-dom";
import { React, useEffect } from "react";
import { useDispatch } from "react-redux";
import { setThemeColor } from "./store/themeSlice";
import { getProfile } from "./api";
import Notes from "./pages/Notes";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Logout from "./pages/Logout";
import Register from "./pages/Register";
import TextEditor from "./pages/TextEditor";
import ForgotPassword from "./pages/ForgotPassword";
import { GlobalStyle } from "./styles/globalStyle";
import WelcomePage from "./pages/WelcomePage";
import { Navigate } from "react-router-dom";
import { getToken } from "./token";

import FlashcardsPage from "./pages/FlashcardsPage";
import FastLearningPage from "./pages/FastLearningPage";
import FSRSLearningPage from "./pages/FSRSLearningPage";
import Calendar from "./pages/Calendar";
import UsosCallback from "./pages/UsosCallback";
import Profile from "./pages/Profile";

import SocialGroups from "./pages/SocialGroups";
import SocialGroupDetails from "./pages/SocialGroupDetails";
import Friends from "./pages/Friends";
import JoinGroup from "./pages/JoinGroup";

const ProtectedRoute = ({ children }) => {
  if (getToken()) return children;
  sessionStorage.setItem("logout_reason", "session_expired");
  return <Navigate to="/" replace />;
};

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    if (getToken()) {
      getProfile().then((res) => {
        if (!res.errorCode && res.themeColor) {
          dispatch(setThemeColor(res.themeColor));
        }
      });
    }
  }, [dispatch]);

  return (
    <>
      <BrowserRouter>
        <GlobalStyle />
        <Routes>
          <Route path="/" element={<WelcomePage />} />
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route
            path="/notes/*"
            element={
              <ProtectedRoute>
                <Notes />
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<Login />} />
          <Route path="/logout" element={<Logout />} />
          <Route path="/register" element={<Register />} />
          <Route path="/reset-password" element={<ForgotPassword />} />
          <Route
            path="/note/:id"
            element={
              <ProtectedRoute>
                <TextEditor />
              </ProtectedRoute>
            }
          />

          <Route
            path="/user"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/calendar"
            element={
              <ProtectedRoute>
                <Calendar />
              </ProtectedRoute>
            }
          />
          <Route
            path="/usos-callback"
            element={
              <ProtectedRoute>
                <UsosCallback />
              </ProtectedRoute>
            }
          />
          <Route
            path="/learning"
            element={
              <ProtectedRoute>
                <FlashcardsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/learning/set/:setId"
            element={
              <ProtectedRoute>
                <FlashcardsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/learning/fast/:setId"
            element={
              <ProtectedRoute>
                <FastLearningPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/learning/fsrs/:setId"
            element={
              <ProtectedRoute>
                <FSRSLearningPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/learning/trash"
            element={
              <ProtectedRoute>
                <FlashcardsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/social"
            element={
              <ProtectedRoute>
                <SocialGroups />
              </ProtectedRoute>
            }
          />
          <Route
            path="/social/:id"
            element={
              <ProtectedRoute>
                <SocialGroupDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/social/friends"
            element={
              <ProtectedRoute>
                <Friends />
              </ProtectedRoute>
            }
          />
          <Route
            path="/validateInvitation"
            element={
              <ProtectedRoute>
                <JoinGroup />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
