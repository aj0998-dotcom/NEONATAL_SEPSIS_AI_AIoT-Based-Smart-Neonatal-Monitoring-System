import { Navigate, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";

import Home from "./pages/Home.jsx";
import About from "./pages/About.jsx";
import VisionMission from "./pages/VisionMission.jsx";
import Features from "./pages/Features.jsx";
import HowItWorks from "./pages/HowItWorks.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Predict from "./pages/Predict.jsx";
import Insights from "./pages/Insights.jsx";
import Performance from "./pages/Performance.jsx";
import Dataset from "./pages/Dataset.jsx";
import History from "./pages/History.jsx";
import TechStack from "./pages/TechStack.jsx";

export default function App() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="container-app py-8">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/vision-mission" element={<VisionMission />} />
          <Route path="/features" element={<Features />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/predict" element={<Predict />} />
          <Route path="/insights" element={<Insights />} />
          <Route path="/performance" element={<Performance />} />
          <Route path="/dataset" element={<Dataset />} />
          <Route path="/history" element={<History />} />
          <Route path="/stack" element={<TechStack />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

