"use client";

import { useState, useEffect } from "react";
import { 
  RiWaterPercentLine, 
  RiTempHotLine, 
  RiWindyLine, 
  RiRainyLine,
  RiMapPinLine,
  RiSunLine,
  RiCloudyLine,
  RiCheckboxCircleLine,
  RiErrorWarningLine,
  RiCloseCircleLine,
  RiRefreshLine
} from "react-icons/ri";

interface AdvisoryItem {
  action: string;
  status: string; // success, warning, danger
  message: string;
}

interface WeatherData {
  success: boolean;
  location: string;
  coordinates: { lat: string; lon: string };
  weather: {
    temp: number;
    humidity: number;
    windSpeed: number;
    weatherText: string;
    weatherIcon: string;
    rainProb24h: number;
    precip24h: number;
  };
  advisories: {
    watering: AdvisoryItem;
    spraying: AdvisoryItem;
    harvesting: AdvisoryItem;
  };
}

export default function AdvisoryView() {
  const [data, setData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [coords, setCoords] = useState<{ lat: string; lon: string; name: string }>({
    lat: "32.1109",
    lon: "76.5363",
    name: "Palampur, Kangra District"
  });

  const fetchAdvisory = async (latitude: string, longitude: string, locationName: string) => {
    setLoading(true);
    setError(null);
    try {
      const url = `/api/advisory?lat=${latitude}&lon=${longitude}&locationName=${encodeURIComponent(locationName)}`;
      const res = await fetch(url);
      const json = await res.json();
      if (json.success) {
        setData(json);
      } else {
        setError(json.error || "Failed to load advisory.");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to connect to the weather advisory service.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdvisory(coords.lat, coords.lon, coords.name);
  }, [coords.lat, coords.lon]);

  const handleUseGeolocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latitude = position.coords.latitude.toFixed(4);
        const longitude = position.coords.longitude.toFixed(4);
        setCoords({
          lat: latitude,
          lon: longitude,
          name: `My GPS Coordinates (${latitude}, ${longitude})`
        });
      },
      (error) => {
        console.error(error);
        alert("Unable to retrieve your location. Falling back to default.");
        setLoading(false);
      }
    );
  };

  const getWeatherIconComponent = (icon: string) => {
    switch (icon) {
      case "sunny":
        return <RiSunLine style={{ color: "#eab308", fontSize: "3rem" }} />;
      case "rainy":
      case "showers":
      case "drizzle":
        return <RiRainyLine style={{ color: "#3b82f6", fontSize: "3rem" }} />;
      default:
        return <RiCloudyLine style={{ color: "#64748b", fontSize: "3rem" }} />;
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "success":
        return {
          bgColor: "#f0fdf4",
          borderColor: "#bbf7d0",
          textColor: "#15803d",
          badgeColor: "#dcfce7",
          icon: <RiCheckboxCircleLine style={{ color: "#16a34a", fontSize: "1.4rem" }} />
        };
      case "warning":
        return {
          bgColor: "#fffbeb",
          borderColor: "#fde68a",
          textColor: "#b45309",
          badgeColor: "#fef3c7",
          icon: <RiErrorWarningLine style={{ color: "#d97706", fontSize: "1.4rem" }} />
        };
      case "danger":
        return {
          bgColor: "#fef2f2",
          borderColor: "#fecaca",
          textColor: "#b91c1c",
          badgeColor: "#fee2e2",
          icon: <RiCloseCircleLine style={{ color: "#dc2626", fontSize: "1.4rem" }} />
        };
      default:
        return {
          bgColor: "#f8fafc",
          borderColor: "#e2e8f0",
          textColor: "#475569",
          badgeColor: "#f1f5f9",
          icon: <RiCheckboxCircleLine style={{ color: "#64748b", fontSize: "1.4rem" }} />
        };
    }
  };

  return (
    <div id="advisory-view" className="view-section">
      <header className="header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1>Smart Advisory Panel</h1>
          <p>Real-time agricultural actions calculated from microclimate conditions.</p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button 
            className="btn btn-outline" 
            style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer", fontSize: "0.9rem" }}
            onClick={handleUseGeolocation}
            disabled={loading}
          >
            <RiMapPinLine /> Use GPS Location
          </button>
          <button 
            className="btn btn-outline"
            style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer", fontSize: "0.9rem" }}
            onClick={() => fetchAdvisory(coords.lat, coords.lon, coords.name)}
            disabled={loading}
            title="Refresh weather data"
          >
            <RiRefreshLine className={loading ? "animate-spin" : ""} /> Refresh
          </button>
        </div>
      </header>

      {loading && (
        <div style={{ display: "flex", justifyContent: "center", padding: "3rem" }}>
          <div className="w-10 h-10 border-4 border-green-700 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {error && !loading && (
        <div className="card" style={{ borderColor: "#fecaca", backgroundColor: "#fef2f2", color: "#b91c1c" }}>
          <p>{error}</p>
        </div>
      )}

      {!loading && data && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          
          {/* Weather Widget */}
          <section className="card" style={{ border: "1px solid var(--border-light)", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "20px", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              {getWeatherIconComponent(data.weather.weatherIcon)}
              <div>
                <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "4px" }}>
                  <RiMapPinLine style={{ color: "var(--color-primary)" }} /> {data.location}
                </span>
                <h2 style={{ fontSize: "2rem", margin: "2px 0", color: "var(--color-primary-dark)" }}>
                  {data.weather.temp}°C
                </h2>
                <p style={{ margin: 0, fontWeight: "600", color: "var(--text-dark)", fontSize: "0.95rem" }}>
                  {data.weather.weatherText}
                </p>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px", borderLeft: "1px solid var(--border-light)", paddingLeft: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem" }}>
                <span style={{ color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "6px" }}>
                  <RiWaterPercentLine /> Humidity
                </span>
                <strong style={{ color: "var(--text-dark)" }}>{data.weather.humidity}%</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem" }}>
                <span style={{ color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "6px" }}>
                  <RiWindyLine /> Wind Speed
                </span>
                <strong style={{ color: "var(--text-dark)" }}>{data.weather.windSpeed} km/h</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem" }}>
                <span style={{ color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "6px" }}>
                  <RiRainyLine /> Rain Risk (24h)
                </span>
                <strong style={{ color: "var(--text-dark)" }}>{data.weather.rainProb24h}% ({data.weather.precip24h.toFixed(1)}mm)</strong>
              </div>
            </div>
          </section>

          {/* Expert Advisories */}
          <section style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            
            {/* Watering Advisory */}
            <div 
              style={{
                border: `1.5px solid ${getStatusStyle(data.advisories.watering.status).borderColor}`,
                backgroundColor: getStatusStyle(data.advisories.watering.status).bgColor,
                borderRadius: "12px",
                padding: "20px",
                display: "flex",
                gap: "16px",
                alignItems: "flex-start"
              }}
            >
              <div style={{ padding: "6px" }}>{getStatusStyle(data.advisories.watering.status).icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px" }}>
                  <h3 style={{ fontSize: "1.1rem", margin: 0, color: "var(--text-dark)" }}>Irrigation Advisory</h3>
                  <span 
                    style={{
                      padding: "4px 10px",
                      borderRadius: "12px",
                      fontSize: "0.8rem",
                      fontWeight: "bold",
                      backgroundColor: getStatusStyle(data.advisories.watering.status).badgeColor,
                      color: getStatusStyle(data.advisories.watering.status).textColor
                    }}
                  >
                    {data.advisories.watering.action}
                  </span>
                </div>
                <p style={{ margin: "8px 0 0 0", fontSize: "0.95rem", color: "var(--color-text-muted)" }}>
                  {data.advisories.watering.message}
                </p>
              </div>
            </div>

            {/* Spraying Advisory */}
            <div 
              style={{
                border: `1.5px solid ${getStatusStyle(data.advisories.spraying.status).borderColor}`,
                backgroundColor: getStatusStyle(data.advisories.spraying.status).bgColor,
                borderRadius: "12px",
                padding: "20px",
                display: "flex",
                gap: "16px",
                alignItems: "flex-start"
              }}
            >
              <div style={{ padding: "6px" }}>{getStatusStyle(data.advisories.spraying.status).icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px" }}>
                  <h3 style={{ fontSize: "1.1rem", margin: 0, color: "var(--text-dark)" }}>Fertilizer & Pesticide Spraying</h3>
                  <span 
                    style={{
                      padding: "4px 10px",
                      borderRadius: "12px",
                      fontSize: "0.8rem",
                      fontWeight: "bold",
                      backgroundColor: getStatusStyle(data.advisories.spraying.status).badgeColor,
                      color: getStatusStyle(data.advisories.spraying.status).textColor
                    }}
                  >
                    {data.advisories.spraying.action}
                  </span>
                </div>
                <p style={{ margin: "8px 0 0 0", fontSize: "0.95rem", color: "var(--color-text-muted)" }}>
                  {data.advisories.spraying.message}
                </p>
              </div>
            </div>

            {/* Harvesting Advisory */}
            <div 
              style={{
                border: `1.5px solid ${getStatusStyle(data.advisories.harvesting.status).borderColor}`,
                backgroundColor: getStatusStyle(data.advisories.harvesting.status).bgColor,
                borderRadius: "12px",
                padding: "20px",
                display: "flex",
                gap: "16px",
                alignItems: "flex-start"
              }}
            >
              <div style={{ padding: "6px" }}>{getStatusStyle(data.advisories.harvesting.status).icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px" }}>
                  <h3 style={{ fontSize: "1.1rem", margin: 0, color: "var(--text-dark)" }}>Sowing & Harvesting</h3>
                  <span 
                    style={{
                      padding: "4px 10px",
                      borderRadius: "12px",
                      fontSize: "0.8rem",
                      fontWeight: "bold",
                      backgroundColor: getStatusStyle(data.advisories.harvesting.status).badgeColor,
                      color: getStatusStyle(data.advisories.harvesting.status).textColor
                    }}
                  >
                    {data.advisories.harvesting.action}
                  </span>
                </div>
                <p style={{ margin: "8px 0 0 0", fontSize: "0.95rem", color: "var(--color-text-muted)" }}>
                  {data.advisories.harvesting.message}
                </p>
              </div>
            </div>

          </section>
        </div>
      )}
    </div>
  );
}
