"use client";

import { useState, useEffect } from "react";
import {
  RiSeedlingLine,
  RiFlaskLine,
  RiCheckboxCircleLine,
  RiErrorWarningLine,
  RiCloudLine,
} from "react-icons/ri";

interface FertilizerOptions {
  Soil_Type: string[];
  Crop_Type: string[];
  Crop_Growth_Stage: string[];
  Season: string[];
  Irrigation_Type: string[];
}

const CROP_FIELDS: { key: string; label: string; placeholder: string }[] = [
  { key: "N", label: "Nitrogen (N)", placeholder: "e.g. 90" },
  { key: "P", label: "Phosphorus (P)", placeholder: "e.g. 42" },
  { key: "K", label: "Potassium (K)", placeholder: "e.g. 43" },
  { key: "temperature", label: "Temperature (°C)", placeholder: "e.g. 21" },
  { key: "humidity", label: "Humidity (%)", placeholder: "e.g. 82" },
  { key: "ph", label: "Soil pH", placeholder: "e.g. 6.5" },
  { key: "rainfall", label: "Rainfall (mm)", placeholder: "e.g. 200" },
];

const FERT_NUMERIC_FIELDS: { key: string; label: string; placeholder: string }[] = [
  { key: "Soil_pH", label: "Soil pH", placeholder: "e.g. 6.5" },
  { key: "Soil_Moisture", label: "Soil Moisture (%)", placeholder: "e.g. 30" },
  { key: "Organic_Carbon", label: "Organic Carbon (%)", placeholder: "e.g. 1.2" },
  { key: "Nitrogen_Level", label: "Nitrogen Level", placeholder: "e.g. 80" },
  { key: "Phosphorus_Level", label: "Phosphorus Level", placeholder: "e.g. 40" },
  { key: "Potassium_Level", label: "Potassium Level", placeholder: "e.g. 45" },
  { key: "Temperature", label: "Temperature (°C)", placeholder: "e.g. 28" },
  { key: "Humidity", label: "Humidity (%)", placeholder: "e.g. 60" },
  { key: "Rainfall", label: "Rainfall (mm)", placeholder: "e.g. 120" },
];

export default function RecommendView() {
  const [tab, setTab] = useState<"crop" | "fertilizer">("crop");
  const [options, setOptions] = useState<FertilizerOptions | null>(null);

  // Crop form state
  const [cropForm, setCropForm] = useState<Record<string, string>>({});
  const [cropResult, setCropResult] = useState<{ crop: string; confidence: number } | null>(null);
  const [cropError, setCropError] = useState<string | null>(null);
  const [cropLoading, setCropLoading] = useState(false);

  // Fertilizer form state
  const [fertForm, setFertForm] = useState<Record<string, string>>({
    Soil_Type: "Loamy",
    Crop_Type: "Wheat",
    Crop_Growth_Stage: "Vegetative",
    Season: "Rabi",
    Irrigation_Type: "Drip",
  });
  const [fertResult, setFertResult] = useState<{ fertilizer: string; confidence: number } | null>(null);
  const [fertError, setFertError] = useState<string | null>(null);
  const [fertLoading, setFertLoading] = useState(false);
  const [weatherLoading, setWeatherLoading] = useState(false);

  useEffect(() => {
    async function loadOptions() {
      try {
        const res = await fetch("/recommend/options");
        const data = await res.json();
        if (data.fertilizer_options) setOptions(data.fertilizer_options);
      } catch (err) {
        console.error("Could not load recommendation options:", err);
      }
    }
    loadOptions();
  }, []);

  const fillFromWeather = async (target: "crop" | "fertilizer") => {
    setWeatherLoading(true);
    try {
      let lat = "32.1109";
      let lon = "76.5363";
      const saved = typeof window !== "undefined" ? localStorage.getItem("userLocation") : null;
      if (saved) {
        const parsed = JSON.parse(saved);
        lat = parsed.lat || lat;
        lon = parsed.lon || lon;
      }
      const res = await fetch(`/api/advisory?lat=${lat}&lon=${lon}`);
      const data = await res.json();
      if (data.success && data.weather) {
        if (target === "crop") {
          setCropForm((prev) => ({
            ...prev,
            temperature: String(data.weather.temp ?? prev.temperature ?? ""),
            humidity: String(data.weather.humidity ?? prev.humidity ?? ""),
            rainfall: String(data.weather.precip24h ?? prev.rainfall ?? ""),
          }));
        } else {
          setFertForm((prev) => ({
            ...prev,
            Temperature: String(data.weather.temp ?? prev.Temperature ?? ""),
            Humidity: String(data.weather.humidity ?? prev.Humidity ?? ""),
            Rainfall: String(data.weather.precip24h ?? prev.Rainfall ?? ""),
          }));
        }
      }
    } catch (err) {
      console.error("Could not fetch live weather:", err);
    } finally {
      setWeatherLoading(false);
    }
  };

  const handleCropSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCropError(null);
    setCropResult(null);

    const missing = CROP_FIELDS.filter((f) => !cropForm[f.key]);
    if (missing.length > 0) {
      setCropError(`Please fill in: ${missing.map((f) => f.label).join(", ")}`);
      return;
    }

    setCropLoading(true);
    try {
      const res = await fetch("/recommend/crop", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cropForm),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Prediction failed.");
      }
      setCropResult({ crop: data.recommended_crop, confidence: data.confidence });
    } catch (err: any) {
      setCropError(err.message || "Something went wrong. Is the backend running?");
    } finally {
      setCropLoading(false);
    }
  };

  const handleFertSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFertError(null);
    setFertResult(null);

    const missing = FERT_NUMERIC_FIELDS.filter((f) => !fertForm[f.key]);
    if (missing.length > 0) {
      setFertError(`Please fill in: ${missing.map((f) => f.label).join(", ")}`);
      return;
    }

    setFertLoading(true);
    try {
      const res = await fetch("/recommend/fertilizer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fertForm),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Prediction failed.");
      }
      setFertResult({ fertilizer: data.recommended_fertilizer, confidence: data.confidence });
    } catch (err: any) {
      setFertError(err.message || "Something went wrong. Is the backend running?");
    } finally {
      setFertLoading(false);
    }
  };

  const opts = options || {
    Soil_Type: ["Clay", "Loamy", "Sandy", "Silt"],
    Crop_Type: ["Cotton", "Maize", "Potato", "Rice", "Sugarcane", "Tomato", "Wheat"],
    Crop_Growth_Stage: ["Flowering", "Harvest", "Sowing", "Vegetative"],
    Season: ["Kharif", "Rabi", "Zaid"],
    Irrigation_Type: ["Canal", "Drip", "Rainfed", "Sprinkler"],
  };

  return (
    <div id="recommend-view" className="view-section">
      <header className="header">
        <h1>Crop &amp; Fertilizer Recommendation</h1>
        <p>Get an ML-based recommendation from your soil and weather readings.</p>
      </header>

      {/* Tabs */}
      <div className="recommend-tabs">
        <button
          className={`recommend-tab-btn ${tab === "crop" ? "active" : ""}`}
          onClick={() => setTab("crop")}
          type="button"
        >
          <RiSeedlingLine /> Crop Recommendation
        </button>
        <button
          className={`recommend-tab-btn ${tab === "fertilizer" ? "active" : ""}`}
          onClick={() => setTab("fertilizer")}
          type="button"
        >
          <RiFlaskLine /> Fertilizer Recommendation
        </button>
      </div>

      {tab === "crop" && (
        <section className="card" style={{ marginTop: "16px", padding: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--text-muted)" }}>
              Enter your soil (N-P-K, pH) and local weather readings.
            </p>
            <button
              type="button"
              className="recommend-weather-btn"
              onClick={() => fillFromWeather("crop")}
              disabled={weatherLoading}
            >
              <RiCloudLine /> {weatherLoading ? "Fetching..." : "Use live weather"}
            </button>
          </div>

          <form onSubmit={handleCropSubmit} className="recommend-form-grid">
            {CROP_FIELDS.map((field) => (
              <div key={field.key} className="recommend-field">
                <label>{field.label}</label>
                <input
                  type="number"
                  step="any"
                  placeholder={field.placeholder}
                  value={cropForm[field.key] || ""}
                  onChange={(e) => setCropForm({ ...cropForm, [field.key]: e.target.value })}
                />
              </div>
            ))}

            <button type="submit" className="recommend-submit-btn" disabled={cropLoading}>
              {cropLoading ? "Analyzing..." : "Get Crop Recommendation"}
            </button>
          </form>

          {cropError && (
            <div className="recommend-alert danger">
              <RiErrorWarningLine /> {cropError}
            </div>
          )}

          {cropResult && (
            <div className="recommend-result">
              <RiCheckboxCircleLine className="recommend-result-icon" />
              <div>
                <p className="recommend-result-label">Recommended Crop</p>
                <h2 className="recommend-result-value" style={{ textTransform: "capitalize" }}>
                  {cropResult.crop}
                </h2>
                <p className="recommend-result-confidence">
                  Model confidence: {(cropResult.confidence * 100).toFixed(1)}%
                </p>
              </div>
            </div>
          )}
        </section>
      )}

      {tab === "fertilizer" && (
        <section className="card" style={{ marginTop: "16px", padding: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--text-muted)" }}>
              Enter your soil, crop, and local weather details.
            </p>
            <button
              type="button"
              className="recommend-weather-btn"
              onClick={() => fillFromWeather("fertilizer")}
              disabled={weatherLoading}
            >
              <RiCloudLine /> {weatherLoading ? "Fetching..." : "Use live weather"}
            </button>
          </div>

          <form onSubmit={handleFertSubmit} className="recommend-form-grid">
            <div className="recommend-field">
              <label>Soil Type</label>
              <select
                value={fertForm.Soil_Type}
                onChange={(e) => setFertForm({ ...fertForm, Soil_Type: e.target.value })}
              >
                {opts.Soil_Type.map((v) => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
            <div className="recommend-field">
              <label>Crop Type</label>
              <select
                value={fertForm.Crop_Type}
                onChange={(e) => setFertForm({ ...fertForm, Crop_Type: e.target.value })}
              >
                {opts.Crop_Type.map((v) => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
            <div className="recommend-field">
              <label>Growth Stage</label>
              <select
                value={fertForm.Crop_Growth_Stage}
                onChange={(e) => setFertForm({ ...fertForm, Crop_Growth_Stage: e.target.value })}
              >
                {opts.Crop_Growth_Stage.map((v) => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
            <div className="recommend-field">
              <label>Season</label>
              <select
                value={fertForm.Season}
                onChange={(e) => setFertForm({ ...fertForm, Season: e.target.value })}
              >
                {opts.Season.map((v) => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
            <div className="recommend-field">
              <label>Irrigation Type</label>
              <select
                value={fertForm.Irrigation_Type}
                onChange={(e) => setFertForm({ ...fertForm, Irrigation_Type: e.target.value })}
              >
                {opts.Irrigation_Type.map((v) => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>

            {FERT_NUMERIC_FIELDS.map((field) => (
              <div key={field.key} className="recommend-field">
                <label>{field.label}</label>
                <input
                  type="number"
                  step="any"
                  placeholder={field.placeholder}
                  value={fertForm[field.key] || ""}
                  onChange={(e) => setFertForm({ ...fertForm, [field.key]: e.target.value })}
                />
              </div>
            ))}

            <button type="submit" className="recommend-submit-btn" disabled={fertLoading}>
              {fertLoading ? "Analyzing..." : "Get Fertilizer Recommendation"}
            </button>
          </form>

          {fertError && (
            <div className="recommend-alert danger">
              <RiErrorWarningLine /> {fertError}
            </div>
          )}

          {fertResult && (
            <div className="recommend-result">
              <RiCheckboxCircleLine className="recommend-result-icon" />
              <div>
                <p className="recommend-result-label">Recommended Fertilizer</p>
                <h2 className="recommend-result-value">{fertResult.fertilizer}</h2>
                <p className="recommend-result-confidence">
                  Model confidence: {(fertResult.confidence * 100).toFixed(1)}%
                </p>
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
