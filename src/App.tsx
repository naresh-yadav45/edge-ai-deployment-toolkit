import { Navigate, Route, Routes } from "react-router-dom";
import AppLayout from "./layouts/AppLayout";
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import ModelAnalyzer from "./pages/ModelAnalyzer";
import DeviceSimulator from "./pages/DeviceSimulator";
import OptimizationLab from "./pages/OptimizationLab";
import EnergyPredictor from "./pages/EnergyPredictor";
import Recommendation from "./pages/Recommendation";
import Benchmark from "./pages/Benchmark";
import ResearchHub from "./pages/ResearchHub";
import Reports from "./pages/Reports";
import SettingsPage from "./pages/SettingsPage";

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/analyzer" element={<ModelAnalyzer />} />
        <Route path="/simulator" element={<DeviceSimulator />} />
        <Route path="/optimization" element={<OptimizationLab />} />
        <Route path="/energy" element={<EnergyPredictor />} />
        <Route path="/recommend" element={<Recommendation />} />
        <Route path="/benchmark" element={<Benchmark />} />
        <Route path="/research" element={<ResearchHub />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Route>
    </Routes>
  );
}
