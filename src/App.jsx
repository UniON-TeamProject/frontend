import { Routes, Route, BrowserRouter } from 'react-router-dom';
import { React } from 'react'
import Home from './pages/Home';
import Login from './pages/Login';
import Logout from './pages/Logout';
import Register from './pages/Register';
import TextEditor from './pages/TextEditor';
import ForgotPassword from './pages/ForgotPassword';
import { GlobalStyle } from './styles/globalStyle';
import WelcomePage from './pages/WelcomePage';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const token = sessionStorage.getItem("token");
  return token ? children : <Navigate to="/" replace />;
};

function App() {
  return (
    <>
      <BrowserRouter>
        <GlobalStyle />
        <Routes>
          <Route path="/" element={<WelcomePage />} />
          <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/logowanie" element={<Login />} />
          <Route path="/wyloguj" element={<Logout />} />
          <Route path="/rejestracja" element={<Register />} />
          <Route path="/resetowanie-hasla" element={<ForgotPassword />} />
          <Route path="/dokument/:id" element={<ProtectedRoute><TextEditor /></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
