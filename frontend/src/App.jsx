import { Navigate, Route, Routes, useLocation } from "react-router-dom";

import { ProtectedRoute } from "./auth/ProtectedRoute";
import { ClaudeCodeChat } from "./components/ClaudeCodeChat";
import { DashboardPage } from "./pages/DashboardPage";
import { HomePage } from "./pages/HomePage";
import { LoginPage } from "./pages/LoginPage";

export default function App() {
  const { pathname } = useLocation();

  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {pathname === "/" ? null : <ClaudeCodeChat />}
    </>
  );
}
