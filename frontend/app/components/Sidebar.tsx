"use client";

import {
  RiDashboardLine,
  RiPlantLine,
  RiLightbulbLine,
  RiSettings3Line,
} from "react-icons/ri";

import { useSession } from "next-auth/react";

interface SidebarProps {
  activeView: string;
  onNavigate: (view: string) => void;
}

export default function Sidebar({ activeView, onNavigate }: SidebarProps) {
  const { data: session } = useSession();
  const name = session?.user?.name || "Ramesh Kumar";
  
  const avatarText = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const navItems = [
    { id: "dashboard-view", label: "Dashboard", icon: RiDashboardLine },
    { id: "crops-view", label: "Crops", icon: RiPlantLine },
    { id: "advisory-view", label: "Advisory", icon: RiLightbulbLine },
    { id: "settings-view", label: "Settings", icon: RiSettings3Line },
  ];

  return (
    <aside className="sidebar" id="sidebar">
      {/* Brand */}
      <div className="brand">
        <h2>Fasal Sathi</h2>
        <p>Crop Advisory</p>
      </div>

      {/* Navigation Menu */}
      <nav className="nav-menu">
        {navItems.map((item) => (
          <button
            key={item.id}
            data-target={item.id}
            className={`nav-btn ${activeView === item.id ? "active" : ""}`}
            onClick={() => onNavigate(item.id)}
          >
            <item.icon />
            {item.label}
          </button>
        ))}
      </nav>

      {/* User Profile */}
      <div className="user-profile">
        {session?.user?.image ? (
          <img 
            src={session.user.image} 
            alt={name} 
            style={{ width: "36px", height: "36px", borderRadius: "50%", marginRight: "10px", objectFit: "cover" }} 
          />
        ) : (
          <div className="avatar">{avatarText}</div>
        )}
        <span className="user-name" style={{ marginLeft: session?.user?.image ? "0" : "10px" }}>{name}</span>
      </div>
    </aside>
  );
}
