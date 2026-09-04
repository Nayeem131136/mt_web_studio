import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import OnboardingWizard from "./pages/OnboardingWizard";
import AdminDashboard from "./pages/AdminDashboard";
import TrackStatus from "./pages/TrackStatus";
import { LanguageProvider } from "./lib/LanguageContext";

export default function App() {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/start" element={<OnboardingWizard />} />
          <Route path="/track" element={<TrackStatus />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
      </BrowserRouter>
    </LanguageProvider>
  );
}
