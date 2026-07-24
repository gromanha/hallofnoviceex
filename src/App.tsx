import React, { Suspense, useState } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { LoginGate } from './components/LoginGate';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ProtectedRoute } from './components/ProtectedRoute';
import { PageLoader } from './components/PageLoader';
import { NotFoundPage } from './pages/NotFoundPage';
import { AuthProvider, useAuth } from './lib/AuthContext';

const HomePage = React.lazy(() => import('./pages/HomePage').then(m => ({ default: m.HomePage })));
const AcademiaPage = React.lazy(() => import('./pages/AcademiaPage').then(m => ({ default: m.AcademiaPage })));
const PostDetailPage = React.lazy(() => import('./pages/PostDetailPage').then(m => ({ default: m.PostDetailPage })));
const CalendarPage = React.lazy(() => import('./pages/CalendarPage').then(m => ({ default: m.CalendarPage })));
const AdminPage = React.lazy(() => import('./pages/AdminPage').then(m => ({ default: m.AdminPage })));

function AppRoutes() {
  const { admin, onLogin, onLogout } = useAuth();
  const navigate = useNavigate();
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  const handleLogin = async (username: string, password: string) => {
    await onLogin(username, password);
    setIsLoginOpen(false);
    navigate('/admin');
  };

  return (
    <>
      <Navbar onOpenLogin={() => setIsLoginOpen(true)} />

      <main className="flex-1">
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/academia" element={<AcademiaPage />} />
            <Route path="/post/:slug" element={<PostDetailPage />} />
            <Route path="/calendario" element={<CalendarPage />} />
            <Route
              path="/admin"
              element={
                <ProtectedRoute admin={admin}>
                  <AdminPage />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </main>

      <Footer />

      {isLoginOpen && !admin && (
        <LoginGate
          onLogin={handleLogin}
          onClose={() => setIsLoginOpen(false)}
        />
      )}
    </>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ErrorBoundary>
          <div className="min-h-screen flex flex-col bg-[var(--color-background)] text-[var(--color-on-background)] font-sans antialiased">
            <AppRoutes />
          </div>
        </ErrorBoundary>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
