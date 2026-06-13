import "@/App.css";
import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { Layout } from "./components/Layout";

// Route-level code splitting keeps the initial bundle small.
const Landing = lazy(() => import("./pages/Landing"));
const AuthPage = lazy(() => import("./pages/AuthPage"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Calculator = lazy(() => import("./pages/Calculator"));
const Achievements = lazy(() => import("./pages/Achievements"));

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-[#F9F8F6]" role="status" aria-label="Loading">
    <div className="w-8 h-8 rounded-full border-2 border-[#1A2E20] border-t-transparent animate-spin" />
  </div>
);

function Protected({ children }) {
  const { user } = useAuth();
  if (user === null) return <PageLoader />;
  if (user === false) return <Navigate to="/auth" replace />;
  return <Layout>{children}</Layout>;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/dashboard" element={<Protected><Dashboard /></Protected>} />
            <Route path="/log" element={<Protected><Calculator /></Protected>} />
            <Route path="/achievements" element={<Protected><Achievements /></Protected>} />
          </Routes>
        </Suspense>
      </BrowserRouter>
      <Toaster position="top-right" richColors />
    </AuthProvider>
  );
}

export default App;
