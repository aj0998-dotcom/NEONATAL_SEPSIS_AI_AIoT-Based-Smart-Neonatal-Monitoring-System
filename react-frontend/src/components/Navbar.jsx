import { NavLink } from "react-router-dom";
import { Activity, BarChart3, BookOpen, Cpu, Gauge, Home, LineChart, Microscope, Sparkles } from "lucide-react";
import Logo from "./Logo.jsx";

const nav = [
  { to: "/", label: "Home", icon: Home },
  { to: "/about", label: "About", icon: BookOpen },
  { to: "/vision-mission", label: "Vision", icon: Sparkles },
  { to: "/features", label: "Features", icon: Activity },
  { to: "/how-it-works", label: "How It Works", icon: Gauge },
  { to: "/dashboard", label: "Dashboard", icon: BarChart3 },
  { to: "/predict", label: "Predict", icon: Microscope },
  { to: "/insights", label: "Insights", icon: LineChart },
  { to: "/performance", label: "Performance", icon: Cpu },
  { to: "/dataset", label: "Dataset", icon: BookOpen },
  { to: "/history", label: "History", icon: Activity },
  { to: "/stack", label: "Tech Stack", icon: Cpu }
];

export default function Navbar() {
  return (
    <header className="sticky top-0 z-20 border-b border-blush-200/60 bg-white/70 backdrop-blur-md">
      <div className="container-app flex items-center justify-between gap-4 py-3">
        <NavLink to="/" className="flex items-center gap-3">
          <Logo />
          <div className="leading-tight">
            <div className="text-sm font-extrabold tracking-wide text-ink">NeoCare AI</div>
            <div className="text-xs font-semibold text-muted">AIoT Neonatal Monitoring</div>
          </div>
        </NavLink>

        <nav className="hidden flex-wrap items-center justify-end gap-1 lg:flex">
          {nav.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `${isActive ? "nav-link nav-link-active" : "nav-link"}`}
              >
                <span className="inline-flex items-center gap-2">
                  <Icon size={16} />
                  {item.label}
                </span>
              </NavLink>
            );
          })}
        </nav>

        <div className="lg:hidden">
          <a href="/predict" className="btn-primary">
            Predict Now
          </a>
        </div>
      </div>
    </header>
  );
}

