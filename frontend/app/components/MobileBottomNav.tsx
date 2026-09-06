"use client";

import {
  RiDashboardLine,
  RiPlantLine,
  RiLightbulbLine,
  RiSettings3Line,
  RiFlaskLine,
} from "react-icons/ri";

interface MobileBottomNavProps {
  activeView: string;
  onNavigate: (view: string) => void;
}

export default function MobileBottomNav({
  activeView,
  onNavigate,
}: MobileBottomNavProps) {
  const navItems = [
    { id: "dashboard-view", label: "Dashboard", icon: RiDashboardLine },
    { id: "crops-view", label: "Crops", icon: RiPlantLine },
    { id: "recommend-view", label: "Recommend", icon: RiFlaskLine },
    { id: "advisory-view", label: "Advisory", icon: RiLightbulbLine },
    { id: "settings-view", label: "Profile", icon: RiSettings3Line },
  ];

  return (
    <nav className="mobile-bottom-nav">
      {navItems.map((item) => (
        <button
          key={item.id}
          data-target={item.id}
          className={`mobile-nav-btn ${activeView === item.id ? "active" : ""}`}
          onClick={() => onNavigate(item.id)}
        >
          <item.icon />
          <span>{item.label}</span>
        </button>
      ))}
    </nav>
  );
}
