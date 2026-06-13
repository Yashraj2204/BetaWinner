import "@/App.css";
import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import { Layout } from "./components/Layout";

const Landing    = lazy(() => import("./pages/Landing"));
const Dashboard  = lazy(() => import("./pages/Dashboard"));
const Calculator = lazy(() => import("./pages/Calculator"));
const Achievements = lazy(() => import("./pages/Achievements"));

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-[#F9F8F6]" role="status" aria-label="Loading">
    <div className="w-8 h-8 rounded-full border-2 border-[#1A2E20] border-t-transparent animate-spin" />
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
          <Route path="/log" element={<Layout><Calculator /></Layout>} />
          <Route path="/achievements" element={<Layout><Achievements /></Layout>} />
          {/* catch-all */}
          <Route path="*" element={<Landing />} />
        </Routes>
      </Suspense>
      <Toaster position="top-right" richColors />
    </BrowserRouter>
  );
}

export default App;
