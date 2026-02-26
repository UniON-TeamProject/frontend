import { Routes, Route, BrowserRouter } from 'react-router-dom';
import { React } from 'react'
import Notes from './pages/Notes';
import Login from './pages/Login';
import Logout from './pages/Logout';
import Register from './pages/Register';
import TextEditor from './pages/TextEditor';
import ForgotPassword from './pages/ForgotPassword';
import { GlobalStyle } from './styles/globalStyle';
import WelcomePage from './pages/WelcomePage';
import { Navigate } from 'react-router-dom';
import { getToken } from './token';

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
          <Route path="/notes/*" element={<ProtectedRoute><Notes /></ProtectedRoute>} />
          <Route path="/login" element={<Login />} />
          <Route path="/logout" element={<Logout />} />
          <Route path="/register" element={<Register />} />
          <Route path="/reset-password" element={<ForgotPassword />} />
          <Route path="/note/:id" element={<ProtectedRoute><TextEditor /></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
