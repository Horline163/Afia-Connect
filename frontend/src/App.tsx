import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import WelcomePage from "./pages/WelcomePage";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import PatientsPage from "./pages/PatientsPage";
import ReferralsPage from "./pages/ReferralsPage";
import ConsultationsPage from "./pages/ConsultationsPage";
import MaternalHealthPage from "./pages/MaternalHealthPage";
import RecordsPage from "./pages/RecordsPage";
import AppLayout from "./components/AppLayout";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<WelcomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/patients" element={<PatientsPage />} />
            <Route path="/records" element={<RecordsPage />} />
            <Route path="/consultations" element={<ConsultationsPage />} />
            <Route path="/referrals" element={<ReferralsPage />} />
            <Route path="/maternal-health" element={<MaternalHealthPage />} />
            <Route path="/notifications" element={<DashboardPage />} />
            <Route path="/settings" element={<DashboardPage />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
