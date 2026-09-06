"use client";

import { useState, useCallback, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Sidebar from "../components/Sidebar";
import MobileHeader from "../components/MobileHeader";
import MobileBottomNav from "../components/MobileBottomNav";
import DashboardView from "../components/DashboardView";
import CropsView from "../components/CropView";
import AdvisoryView from "../components/AdvisoryView";
import SettingsView from "../components/SettingsView";
import RecommendView from "../components/RecommendView";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeView, setActiveView] = useState<string>("dashboard-view");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  const handleNavigate = useCallback((view: string) => {
    console.log("Navigating to:", view);
    setActiveView(view);
  }, []);

  const renderView = () => {
    console.log("Rendering view:", activeView);
    switch (activeView) {
      case "dashboard-view":
        return <DashboardView />;
      case "crops-view":
        return <CropsView />;
      case "advisory-view":
        return <AdvisoryView />;
      case "recommend-view":
        return <RecommendView />;
      case "settings-view":
        return <SettingsView />;
      default:
        return <DashboardView />;
    }
  };

  if (status === "loading" || status === "unauthenticated") {
    return (
      <div 
        style={{ 
          display: "flex", 
          flexDirection: "column",
          justifyContent: "center", 
          alignItems: "center", 
          minHeight: "100vh", 
          backgroundColor: "var(--bg-main)",
          gap: "1rem"
        }}
      >
        <div className="w-12 h-12 border-4 border-green-700 border-t-transparent rounded-full animate-spin" />
        <p style={{ color: "var(--color-primary-dark)", fontWeight: "600" }}>Securing session...</p>
      </div>
    );
  }

  return (
    <>
      {/* Mobile Header - only visible on mobile */}
      <MobileHeader />

      {/* Desktop Sidebar - only visible on desktop */}
      <Sidebar activeView={activeView} onNavigate={handleNavigate} />

      <div className="app-layout">
        <main className="main-content" id="mainContent">
          {renderView()}
        </main>
      </div>

      {/* Mobile Bottom Navigation - only visible on mobile */}
      <MobileBottomNav activeView={activeView} onNavigate={handleNavigate} />
    </>
  );
}
