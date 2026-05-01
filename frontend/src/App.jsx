import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Characters from './pages/Characters';
import CharacterForm from './pages/CharacterForm';
import Chat from './pages/Chat';
import ChatStart from './pages/ChatStart';
import ChatHistory from './pages/ChatHistory';
import Settings from './pages/Settings';
import './styles/global.css';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/characters" element={
        <ProtectedRoute>
          <Characters />
        </ProtectedRoute>
      } />
      <Route path="/characters/create" element={
        <ProtectedRoute>
          <CharacterForm />
        </ProtectedRoute>
      } />
      <Route path="/characters/:id/edit" element={
        <ProtectedRoute>
          <CharacterForm />
        </ProtectedRoute>
      } />
      <Route path="/chat/start/:characterId" element={
        <ProtectedRoute>
          <ChatStart />
        </ProtectedRoute>
      } />
      <Route path="/chat/:id" element={
        <ProtectedRoute>
          <Chat />
        </ProtectedRoute>
      } />
      <Route path="/chats" element={
        <ProtectedRoute>
          <ChatHistory />
        </ProtectedRoute>
      } />
      <Route path="/settings" element={
        <ProtectedRoute>
          <Settings />
        </ProtectedRoute>
      } />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Navbar />
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}