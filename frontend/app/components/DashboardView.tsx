"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  RiCheckboxCircleLine,
  RiDropLine,
  RiThermometerLine,
  RiCloudLine,
  RiCheckLine,
  RiMicLine,
  RiPlantLine,
} from "react-icons/ri";

interface WeatherStats {
  temp: number;
  humidity: number;
  windSpeed: number;
  rainProb24h: number;
  precip24h: number;
  weatherText: string;
}

export default function DashboardView() {
  const { data: session } = useSession();
  const firstName = session?.user?.name ? session.user.name.split(" ")[0] : "Ramesh";

  const [activeCrop, setActiveCrop] = useState<string>("Wheat");
  const [weather, setWeather] = useState<WeatherStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isApplied, setIsApplied] = useState<boolean>(false);

  // Load selected crop from localStorage on mount
  useEffect(() => {
    const savedCrop = localStorage.getItem("activeCrop");
    if (savedCrop) {
      setActiveCrop(savedCrop);
    }

    // Fetch weather data for live metrics
    async function fetchWeather() {
      try {
        const res = await fetch("/api/advisory");
        const json = await res.json();
        if (json.success && json.weather) {
          setWeather(json.weather);
        }
      } catch (err) {
        console.error("Error fetching weather for dashboard:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchWeather();
  }, []);

  const handleCropChange = (crop: string) => {
    setActiveCrop(crop);
    localStorage.setItem("activeCrop", crop);
    setIsApplied(false); // Reset action applied status for new crop
  };

  // Generate dynamic recommendation details
  const getRecommendation = () => {
    const isRainy = weather ? (weather.precip24h > 1.5 || weather.rainProb24h > 50) : false;
    const isHot = weather ? weather.temp > 32 : false;

    switch (activeCrop) {
      case "Paddy (Rice)":
        if (isRainy) {
          return {
            title: "Inspect field drainage for Paddy",
            desc: `Precipitation of ${weather?.precip24h.toFixed(1) || "2.5"}mm expected. Maintain clear drainage channels to prevent water heights exceeding optimal tillering levels.`,
            confidence: "High Confidence"
          };
        } else if (isHot) {
          return {
            title: "Increase water level for Paddy",
            desc: `High temperatures (${weather?.temp || "33"}°C) detected. Keep standing water at 3-5 cm depth to prevent soil cracking and heat stress.`,
            confidence: "High Confidence"
          };
        } else {
          return {
            title: "Monitor shallow ponding in Paddy",
            desc: "Active tillering phase. Maintain standard 2-3 cm shallow standing water for uniform growth.",
            confidence: "Moderate Confidence"
          };
        }

      case "Maize":
        if (isRainy) {
          return {
            title: "Postpone sowing / spray for Maize",
            desc: "Incoming rains will waterlog the whorls. Postpone insecticide spraying or sowing until the skies clear.",
            confidence: "High Confidence"
          };
        } else {
          return {
            title: "Scout Maize for Stem Borer",
            desc: "Optimal dry conditions for crop monitoring. Inspect whorls for early signs of borer infestation (pinholes).",
            confidence: "Moderate Confidence"
          };
        }

      case "Cotton":
        if (isRainy) {
          return {
            title: "Prevent water accumulation in Cotton",
            desc: "Cotton is sensitive to waterlogging. Ensure excess rainwater drains out immediately to prevent root rot.",
            confidence: "High Confidence"
          };
        } else {
          return {
            title: "Monitor sucking pests in Cotton",
            desc: "Warm, dry conditions favor aphid/whitefly activity. Scout leaves and keep bio-pesticides ready.",
            confidence: "Moderate Confidence"
          };
        }

      case "Wheat":
      default:
        if (isRainy) {
          return {
            title: "Postpone fertilizer top-dressing",
            desc: `Rain is expected (Probability: ${weather?.rainProb24h || "60"}%). Postpone urea application to prevent nitrogen loss through run-off.`,
            confidence: "High Confidence"
          };
        } else if (isHot) {
          return {
            title: "Irrigate early morning to prevent wilt",
            desc: `Unusually warm weather (${weather?.temp || "29"}°C) detected. Irrigate in early morning to maintain crown root moisture.`,
            confidence: "High Confidence"
          };
        } else {
          return {
            title: "Apply urea top-dressing to Wheat",
            desc: "Current moderate temperature and dry soil conditions are perfect for active nitrogen absorption.",
            confidence: "High Confidence"
          };
        }
    }
  };

  const recommendation = getRecommendation();

  // Calculate simulated crop-dependent metrics
  const getSoilMoisture = () => {
    if (!weather) return "65%";
    // Simulating crop specific moisture needs
    let base = 60;
    if (activeCrop === "Paddy (Rice)") base = 85;
    if (activeCrop === "Cotton") base = 50;
    
    // adjust slightly by weather humidity/precip
    const modifier = Math.floor(weather.humidity * 0.1 + weather.precip24h * 3);
    return `${Math.min(98, base + modifier)}%`;
  };

  return (
    <div id="dashboard-view" className="view-section">
      <header className="header">
        <h1>Welcome back, {firstName}</h1>
        <p>Here is your crop status for today.</p>
      </header>

      {/* Crop Selector Card */}
      <section 
        className="card" 
        style={{ 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "space-between", 
          gap: "16px", 
          padding: "16px 24px", 
          marginBottom: "20px", 
          border: "1px solid var(--border-light)" 
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <RiPlantLine style={{ color: "var(--color-primary)", fontSize: "1.6rem" }} />
          <div>
            <h3 style={{ margin: 0, fontSize: "1.05rem", color: "var(--text-dark)" }}>Active Crop</h3>
            <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--text-muted)" }}>What crop are you currently growing?</p>
          </div>
        </div>
        <select 
          value={activeCrop} 
          onChange={(e) => handleCropChange(e.target.value)}
          style={{
            padding: "8px 16px",
            borderRadius: "8px",
            border: "1.5px solid var(--color-border-input)",
            backgroundColor: "#ffffff",
            color: "var(--color-text-green)",
            fontWeight: "bold",
            fontSize: "0.95rem",
            outline: "none",
            cursor: "pointer"
          }}
        >
          <option value="Wheat">Wheat (Gehun)</option>
          <option value="Paddy (Rice)">Paddy (Rice / Dhan)</option>
          <option value="Maize">Maize (Makka)</option>
          <option value="Cotton">Cotton (Kapas)</option>
        </select>
      </section>

      {/* Recommendation Card */}
      <section className="card recommendation-card">
        <div className="card-header">
          <span className="card-title">
            {"Today's"}
            <br />
            recommendation
          </span>
          <span className={`badge ${recommendation.confidence.includes("High") ? "green-badge" : "orange-badge"}`}>
            <RiCheckboxCircleLine /> {recommendation.confidence}
          </span>
        </div>
        <h2 className="recommendation-text">{recommendation.title}</h2>
        <p className="recommendation-desc">
          {recommendation.desc}
        </p>
        <button 
          className="btn-outline-action" 
          id="markDoneBtn"
          onClick={() => setIsApplied(!isApplied)}
          style={{
            backgroundColor: isApplied ? "var(--color-primary-soft)" : "transparent",
            color: isApplied ? "var(--color-primary-dark)" : "inherit",
            borderColor: isApplied ? "var(--color-primary)" : "inherit",
            cursor: "pointer"
          }}
        >
          <RiCheckLine /> {isApplied ? "Applied to Field" : "Mark as applied"}
        </button>
      </section>

      {/* Metrics Grid */}
      <section className="metrics-grid">
        <div className="card metric-card">
          <div className="icon-box blue">
            <RiDropLine />
          </div>
          <div className="metric-info">
            <span className="metric-label">Soil moisture</span>
            <span className="metric-value">{getSoilMoisture()}</span>
          </div>
        </div>
        <div className="card metric-card">
          <div className="icon-box orange">
            <RiThermometerLine />
          </div>
          <div className="metric-info">
            <span className="metric-label">Temperature</span>
            <span className="metric-value">{weather ? `${weather.temp}°C` : "24°C"}</span>
          </div>
        </div>
        <div className="card metric-card">
          <div className="icon-box grey">
            <RiCloudLine />
          </div>
          <div className="metric-info">
            <span className="metric-label">Rain Risk</span>
            <span className="metric-value">
              {weather ? (weather.rainProb24h > 50 ? "High" : weather.rainProb24h > 20 ? "Moderate" : "Low") : "Low"}
            </span>
          </div>
        </div>
      </section>

      {/* Question Input Card */}
      <section className="card question-card">
        <h3>Have a question?</h3>
        <div className="input-wrapper">
          <input
            type="text"
            id="questionInput"
            placeholder={`Ask a question about your ${activeCrop} crop`}
          />
          <button className="mic-btn" id="micBtn" title="Speak to ask">
            <RiMicLine />
          </button>
        </div>
      </section>
    </div>
  );
}
