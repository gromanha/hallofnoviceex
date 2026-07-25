import React, { Suspense, useState } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
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
  const location = useLocation();
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  const handleLogin = async (username: string, password: string) => {
    await onLogin(username, password);
    setIsLoginOpen(false);
    navigate('/admin');
  };

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:bg-[var(--color-primary)] focus:text-white focus:px-4 focus:py-2 focus:rounded-xl focus:text-sm focus:font-bold focus:shadow-lg"
      >
        Pular para o conteúdo principal
      </a>
      <Navbar onOpenLogin={() => setIsLoginOpen(true)} />

      <main id="main-content" className="flex-1" tabIndex={-1}>
        <Suspense fallback={<PageLoader />}>
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            >
              <Routes location={location}>
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
            </motion.div>
          </AnimatePresence>
        </Suspense>
      </main>

      <Footer />

      <AnimatePresence>
        {isLoginOpen && !admin && (
          <LoginGate
            key="login-gate"
            onLogin={handleLogin}
            onClose={() => setIsLoginOpen(false)}
          />
        )}
      </AnimatePresence>
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
