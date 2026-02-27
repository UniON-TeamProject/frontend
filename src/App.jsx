import { Routes, Route, BrowserRouter } from 'react-router-dom';
import { React } from 'react'
import Notes from './pages/Notes';
import Login from './pages/Login';
import Home from './pages/Home';
import Logout from './pages/Logout';
import Register from './pages/Register';
import TextEditor from './pages/TextEditor';
import ForgotPassword from './pages/ForgotPassword';
import { GlobalStyle } from './styles/globalStyle';
import WelcomePage from './pages/WelcomePage';
import { Navigate } from 'react-router-dom';
import { getToken } from './token';

import FlashcardsPage from './pages/FlashcardsPage';
import FastLearningPage from './pages/FastLearningPage';
import FSRSLearningPage from './pages/FSRSLearningPage';

const ProtectedRoute = ({ children }) => {
  return getToken() ? children : <Navigate to="/" replace />;
};

function App() {
  return (
    <>
      <BrowserRouter>
        <GlobalStyle />
        <Routes>
          <Route path="/" element={<WelcomePage />} />
          <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/notes/*" element={<ProtectedRoute><Notes /></ProtectedRoute>} />
          <Route path="/login" element={<Login />} />
          <Route path="/logout" element={<Logout />} />
          <Route path="/register" element={<Register />} />
          <Route path="/reset-password" element={<ForgotPassword />} />
          <Route path="/note/:id" element={<ProtectedRoute><TextEditor /></ProtectedRoute>} />

          <Route path="/nauka" element={<FlashcardsPage />} />
          <Route path="/nauka/zestaw/:setId" element={<FlashcardsPage />} />
          <Route path="/nauka/szybka/:setId" element={<FastLearningPage />} />
          <Route path="/nauka/trwala/:setId" element={<FSRSLearningPage />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
