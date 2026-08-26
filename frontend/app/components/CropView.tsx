"use client";

import { useState, useEffect } from "react";
import { 
  RiPlantLine, 
  RiWaterPercentLine, 
  RiTempHotLine, 
  RiMapPinLine, 
  RiCalendarLine, 
  RiCoinsLine, 
  RiShieldCrossLine,
  RiInformationLine,
  RiCloseLine
} from "react-icons/ri";

interface VernacularNames {
  hindi?: string;
  tamil?: string;
  telugu?: string;
  punjabi?: string;
  marathi?: string;
}

interface Crop {
  _id: any;
  crop_id: string;
  common_name: string;
  scientific_name: string;
  category: string;
  season: string[];
  vernacular_names: VernacularNames;
  agronomic_requirements: {
    water_requirement_mm: {
      min: number;
      max: number;
      iw_cpe_ratio?: number;
    };
    temperature_celsius: {
      min_optimal: number;
      max_optimal: number;
      base_temperature?: number;
    };
    soil_profile: {
      optimal_ph: {
        min: number;
        max: number;
      };
      preferred_textures: string[];
      drainage_requirement?: string;
    };
    growth_duration_days: {
      min_days: number;
      max_days: number;
    };
    calendar_windows: {
      sowing_months: string[];
      harvesting_months: string[];
    };
    fertilizer_dosage_kg_per_ha: {
      nitrogen: number;
      phosphorus: number;
      potassium: number;
      sulphur?: number;
      micronutrient_recommendations?: string;
    };
  };
  financial_metrics: {
    msp_records: Array<{
      year: string;
      msp_rupees_per_quintal: number;
    }>;
    cost_of_cultivation_a2_fl_per_ha: number;
    cost_of_cultivation_c2_per_ha: number;
    average_yield_quintal_per_ha: number;
  };
  phytosanitary_precautions: {
    major_pests: Array<{
      name: string;
      symptoms: string;
      chemical_control: string;
      biological_control?: string;
    }>;
    major_diseases: Array<{
      name: string;
      symptoms: string;
      fungicide_treatment: string;
    }>;
    cultural_precautions: string[];
  };
}

export default function CropsView() {
  const [crops, setCrops] = useState<Crop[]>([]);
  const [selectedCrop, setSelectedCrop] = useState<Crop | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCrops() {
      try {
        const response = await fetch("/api/crops");
        const data = await response.json();
        if (data.crops) {
          setCrops(data.crops);
        } else {
          setError("Failed to parse crop data.");
        }
      } catch (err) {
        console.error(err);
        setError("Error connecting to the crop service.");
      } finally {
        setLoading(false);
      }
    }
    fetchCrops();
  }, []);

  return (
    <div id="crops-view" className="view-section" style={{ position: "relative" }}>
      <header className="header">
        <h1>My Crops Catalog</h1>
        <p>Comprehensive scientific, financial, and agronomic guidelines for optimal yield.</p>
      </header>

      {loading && (
        <div style={{ display: "flex", justifyContent: "center", padding: "3rem" }}>
          <div className="w-10 h-10 border-4 border-green-700 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {error && !loading && (
        <div className="card" style={{ borderColor: "#fecaca", backgroundColor: "#fef2f2", color: "#b91c1c" }}>
          <RiInformationLine /> {error}
        </div>
      )}

      {!loading && !error && (
        <div 
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "20px",
            marginTop: "10px"
          }}
        >
          {crops.map((crop) => (
            <div 
              key={crop.crop_id} 
              className="card"
              style={{
                cursor: "pointer",
                transition: "transform 0.2s, box-shadow 0.2s",
                border: "1px solid var(--border-light)",
                position: "relative",
                overflow: "hidden"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow = "0 8px 16px rgba(0,0,0,0.06)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
              onClick={() => setSelectedCrop(crop)}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                <span 
                  style={{
                    backgroundColor: "var(--color-primary-soft)",
                    color: "var(--color-primary)",
                    padding: "4px 10px",
                    borderRadius: "12px",
                    fontSize: "0.8rem",
                    fontWeight: "bold"
                  }}
                >
                  {crop.category}
                </span>
                <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: "500" }}>
                  {crop.season.join(" / ")}
                </span>
              </div>
              
              <h2 style={{ fontSize: "1.35rem", color: "var(--color-text-green)", marginBottom: "4px" }}>
                {crop.common_name}
              </h2>
              <p style={{ fontSize: "0.9rem", fontStyle: "italic", color: "var(--text-muted)", marginBottom: "12px" }}>
                {crop.scientific_name}
              </p>

              <div style={{ borderTop: "1px solid var(--border-light)", paddingTop: "12px" }}>
                <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "6px" }}>
                  <RiPlantLine /> Growth duration: {crop.agronomic_requirements.growth_duration_days.min_days}-{crop.agronomic_requirements.growth_duration_days.max_days} days
                </p>
                <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "6px", marginTop: "4px" }}>
                  <RiWaterPercentLine /> Water req: {crop.agronomic_requirements.water_requirement_mm.min}-{crop.agronomic_requirements.water_requirement_mm.max} mm
                </p>
              </div>

              <div 
                style={{
                  position: "absolute",
                  bottom: "0",
                  right: "0",
                  width: "40px",
                  height: "40px",
                  background: "linear-gradient(135deg, transparent 50%, var(--color-primary-soft) 50%)",
                  display: "flex",
                  alignItems: "flex-end",
                  justifyContent: "flex-end",
                  padding: "4px"
                }}
              >
                <RiInformationLine style={{ color: "var(--color-primary)", fontSize: "0.9rem" }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Slide-out details panel / modal */}
      {selectedCrop && (
        <div 
          style={{
            position: "fixed",
            top: 0,
            right: 0,
            height: "100vh",
            width: "100%",
            maxWidth: "680px",
            backgroundColor: "#ffffff",
            boxShadow: "-10px 0 30px rgba(0,0,0,0.15)",
            zIndex: 1000,
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            borderLeft: "4px solid var(--color-primary)",
            animation: "slideIn 0.3s ease"
          }}
        >
          {/* Header */}
          <div 
            style={{
              padding: "24px",
              borderBottom: "1px solid var(--border-light)",
              backgroundColor: "var(--color-primary-soft)",
              position: "sticky",
              top: 0,
              zIndex: 10,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}
          >
            <div>
              <span style={{ fontSize: "0.85rem", textTransform: "uppercase", fontWeight: "bold", color: "var(--color-primary)", letterSpacing: "1px" }}>
                {selectedCrop.category} • {selectedCrop.season.join(" / ")}
              </span>
              <h2 style={{ fontSize: "1.8rem", color: "var(--color-primary-dark)", margin: "4px 0" }}>
                {selectedCrop.common_name}
              </h2>
              <p style={{ fontStyle: "italic", margin: 0, color: "var(--color-text-muted)", fontSize: "1rem" }}>
                {selectedCrop.scientific_name}
              </p>
            </div>
            <button 
              onClick={() => setSelectedCrop(null)} 
              style={{
                background: "transparent",
                border: "none",
                fontSize: "1.8rem",
                color: "var(--color-primary-dark)",
                cursor: "pointer",
                padding: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "50%"
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(0,0,0,0.05)"}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
            >
              <RiCloseLine />
            </button>
          </div>

          {/* Body */}
          <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "24px" }}>
            {/* Vernacular Names */}
            <div>
              <h3 style={{ fontSize: "1.1rem", borderBottom: "2px solid var(--color-primary-soft)", paddingBottom: "6px", display: "flex", alignItems: "center", gap: "8px", color: "var(--color-primary-dark)" }}>
                <RiMapPinLine /> Regional (Vernacular) Names
              </h3>
              <div 
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))",
                  gap: "10px",
                  marginTop: "10px"
                }}
              >
                {Object.entries(selectedCrop.vernacular_names).map(([lang, name]) => (
                  <div key={lang} style={{ padding: "8px 12px", border: "1px dashed var(--color-border-input)", borderRadius: "8px", backgroundColor: "#fafdfa" }}>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", display: "block" }}>{lang}</span>
                    <strong style={{ fontSize: "0.95rem", color: "var(--text-dark)" }}>{name}</strong>
                  </div>
                ))}
              </div>
            </div>

            {/* Agronomic Requirements */}
            <div>
              <h3 style={{ fontSize: "1.1rem", borderBottom: "2px solid var(--color-primary-soft)", paddingBottom: "6px", display: "flex", alignItems: "center", gap: "8px", color: "var(--color-primary-dark)" }}>
                <RiPlantLine /> Agronomic & Soil Requirements
              </h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginTop: "12px" }}>
                <div>
                  <h4 style={{ fontSize: "0.9rem", color: "var(--color-primary)" }}>Water Requirement</h4>
                  <p style={{ fontSize: "0.95rem", margin: "4px 0" }}>
                    <strong>{selectedCrop.agronomic_requirements.water_requirement_mm.min} - {selectedCrop.agronomic_requirements.water_requirement_mm.max} mm</strong>
                  </p>
                  {selectedCrop.agronomic_requirements.water_requirement_mm.iw_cpe_ratio && (
                    <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>IW/CPE Ratio: {selectedCrop.agronomic_requirements.water_requirement_mm.iw_cpe_ratio}</span>
                  )}
                </div>
                <div>
                  <h4 style={{ fontSize: "0.9rem", color: "var(--color-primary)" }}>Optimal Temperature</h4>
                  <p style={{ fontSize: "0.95rem", margin: "4px 0" }}>
                    <strong>{selectedCrop.agronomic_requirements.temperature_celsius.min_optimal}°C - {selectedCrop.agronomic_requirements.temperature_celsius.max_optimal}°C</strong>
                  </p>
                  {selectedCrop.agronomic_requirements.temperature_celsius.base_temperature && (
                    <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Base Temp: {selectedCrop.agronomic_requirements.temperature_celsius.base_temperature}°C</span>
                  )}
                </div>
              </div>

              <div style={{ marginTop: "16px", padding: "12px", backgroundColor: "#f8faf8", borderRadius: "10px", border: "1px solid var(--color-border-input)" }}>
                <h4 style={{ fontSize: "0.9rem", color: "var(--color-primary-dark)", display: "flex", alignItems: "center", gap: "6px" }}>
                  Soil Profile
                </h4>
                <p style={{ fontSize: "0.9rem", margin: "4px 0" }}>
                  <strong>Optimal pH Range:</strong> {selectedCrop.agronomic_requirements.soil_profile.optimal_ph.min} - {selectedCrop.agronomic_requirements.soil_profile.optimal_ph.max}
                </p>
                <p style={{ fontSize: "0.9rem", margin: "4px 0" }}>
                  <strong>Preferred Textures:</strong> {selectedCrop.agronomic_requirements.soil_profile.preferred_textures.join(", ")}
                </p>
                {selectedCrop.agronomic_requirements.soil_profile.drainage_requirement && (
                  <p style={{ fontSize: "0.85rem", fontStyle: "italic", margin: "6px 0 0 0", color: "var(--color-text-muted)" }}>
                    <strong>Drainage:</strong> {selectedCrop.agronomic_requirements.soil_profile.drainage_requirement}
                  </p>
                )}
              </div>
            </div>

            {/* Calendar & Fertilizers */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
              <div>
                <h3 style={{ fontSize: "1.1rem", borderBottom: "2px solid var(--color-primary-soft)", paddingBottom: "6px", display: "flex", alignItems: "center", gap: "8px", color: "var(--color-primary-dark)" }}>
                  <RiCalendarLine /> Season Windows
                </h3>
                <div style={{ marginTop: "10px" }}>
                  <p style={{ fontSize: "0.9rem", margin: "4px 0" }}>
                    <strong>Sowing:</strong> {selectedCrop.agronomic_requirements.calendar_windows.sowing_months.join(", ")}
                  </p>
                  <p style={{ fontSize: "0.9rem", margin: "4px 0" }}>
                    <strong>Harvesting:</strong> {selectedCrop.agronomic_requirements.calendar_windows.harvesting_months.join(", ")}
                  </p>
                  <p style={{ fontSize: "0.9rem", margin: "4px 0" }}>
                    <strong>Duration:</strong> {selectedCrop.agronomic_requirements.growth_duration_days.min_days} - {selectedCrop.agronomic_requirements.growth_duration_days.max_days} Days
                  </p>
                </div>
              </div>
              <div>
                <h3 style={{ fontSize: "1.1rem", borderBottom: "2px solid var(--color-primary-soft)", paddingBottom: "6px", display: "flex", alignItems: "center", gap: "8px", color: "var(--color-primary-dark)" }}>
                  <RiPlantLine /> N-P-K-S Dosage (kg/ha)
                </h3>
                <div style={{ marginTop: "10px" }}>
                  <p style={{ fontSize: "0.9rem", margin: "4px 0", display: "flex", justifyContent: "space-between" }}>
                    <span>Nitrogen (N):</span> <strong>{selectedCrop.agronomic_requirements.fertilizer_dosage_kg_per_ha.nitrogen} kg</strong>
                  </p>
                  <p style={{ fontSize: "0.9rem", margin: "4px 0", display: "flex", justifyContent: "space-between" }}>
                    <span>Phosphorus (P):</span> <strong>{selectedCrop.agronomic_requirements.fertilizer_dosage_kg_per_ha.phosphorus} kg</strong>
                  </p>
                  <p style={{ fontSize: "0.9rem", margin: "4px 0", display: "flex", justifyContent: "space-between" }}>
                    <span>Potassium (K):</span> <strong>{selectedCrop.agronomic_requirements.fertilizer_dosage_kg_per_ha.potassium} kg</strong>
                  </p>
                  {selectedCrop.agronomic_requirements.fertilizer_dosage_kg_per_ha.sulphur && (
                    <p style={{ fontSize: "0.9rem", margin: "4px 0", display: "flex", justifyContent: "space-between" }}>
                      <span>Sulphur (S):</span> <strong>{selectedCrop.agronomic_requirements.fertilizer_dosage_kg_per_ha.sulphur} kg</strong>
                    </p>
                  )}
                </div>
              </div>
            </div>

            {selectedCrop.agronomic_requirements.fertilizer_dosage_kg_per_ha.micronutrient_recommendations && (
              <div style={{ padding: "12px", backgroundColor: "#fffbeb", border: "1px solid #fef3c7", borderRadius: "8px", fontSize: "0.85rem", color: "#92400e" }}>
                <strong>Micronutrients:</strong> {selectedCrop.agronomic_requirements.fertilizer_dosage_kg_per_ha.micronutrient_recommendations}
              </div>
            )}

            {/* Financial Metrics */}
            <div>
              <h3 style={{ fontSize: "1.1rem", borderBottom: "2px solid var(--color-primary-soft)", paddingBottom: "6px", display: "flex", alignItems: "center", gap: "8px", color: "var(--color-primary-dark)" }}>
                <RiCoinsLine /> Financial Metrics & MSP Records
              </h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginTop: "12px" }}>
                <div style={{ border: "1px solid var(--border-light)", borderRadius: "10px", padding: "12px" }}>
                  <h4 style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Cultivation Cost (per Ha)</h4>
                  <p style={{ fontSize: "1.1rem", margin: "4px 0", color: "var(--color-primary-dark)" }}>
                    <strong>A2 + FL: ₹{selectedCrop.financial_metrics.cost_of_cultivation_a2_fl_per_ha.toLocaleString()}</strong>
                  </p>
                  <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", margin: 0 }}>
                    C2 Cost: ₹{selectedCrop.financial_metrics.cost_of_cultivation_c2_per_ha.toLocaleString()}
                  </p>
                </div>
                <div style={{ border: "1px solid var(--border-light)", borderRadius: "10px", padding: "12px" }}>
                  <h4 style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Average Yield</h4>
                  <p style={{ fontSize: "1.1rem", margin: "4px 0", color: "var(--color-primary-dark)" }}>
                    <strong>{selectedCrop.financial_metrics.average_yield_quintal_per_ha} Quintal/ha</strong>
                  </p>
                  <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", margin: 0 }}>
                    Estimated output per acre: {(selectedCrop.financial_metrics.average_yield_quintal_per_ha * 0.4047).toFixed(1)} q
                  </p>
                </div>
              </div>

              {/* MSP Table */}
              <div style={{ marginTop: "16px" }}>
                <h4 style={{ fontSize: "0.9rem", marginBottom: "8px", color: "var(--color-primary-dark)" }}>Minimum Support Price (MSP) History</h4>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
                  <thead>
                    <tr style={{ backgroundColor: "var(--color-primary-soft)", borderBottom: "1px solid var(--color-primary)" }}>
                      <th style={{ padding: "8px", textAlign: "left", color: "var(--color-primary-dark)" }}>Year</th>
                      <th style={{ padding: "8px", textAlign: "right", color: "var(--color-primary-dark)" }}>MSP (Rupees / Quintal)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedCrop.financial_metrics.msp_records.map((record) => (
                      <tr key={record.year} style={{ borderBottom: "1px solid var(--border-light)" }}>
                        <td style={{ padding: "8px" }}>{record.year}</td>
                        <td style={{ padding: "8px", textAlign: "right", fontWeight: "bold" }}>₹{record.msp_rupees_per_quintal}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Phytosanitary Precautions */}
            <div>
              <h3 style={{ fontSize: "1.1rem", borderBottom: "2px solid var(--color-primary-soft)", paddingBottom: "6px", display: "flex", alignItems: "center", gap: "8px", color: "var(--color-primary-dark)" }}>
                <RiShieldCrossLine /> Phytosanitary Precautions & Controls
              </h3>

              {/* Pests */}
              <div style={{ marginTop: "12px" }}>
                <h4 style={{ fontSize: "0.95rem", color: "#b91c1c", marginBottom: "8px" }}>Major Pests</h4>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {selectedCrop.phytosanitary_precautions.major_pests.map((pest) => (
                    <div key={pest.name} style={{ padding: "12px", border: "1px solid #fee2e2", borderRadius: "10px", backgroundColor: "#fff5f5" }}>
                      <strong style={{ color: "#991b1b" }}>{pest.name}</strong>
                      <p style={{ fontSize: "0.85rem", margin: "4px 0", color: "var(--text-dark)" }}><strong>Symptoms:</strong> {pest.symptoms}</p>
                      <p style={{ fontSize: "0.85rem", margin: "4px 0", color: "#92400e" }}><strong>Chemical control:</strong> {pest.chemical_control}</p>
                      {pest.biological_control && (
                        <p style={{ fontSize: "0.85rem", margin: "4px 0", color: "var(--color-primary)" }}><strong>Biological control:</strong> {pest.biological_control}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Diseases */}
              <div style={{ marginTop: "16px" }}>
                <h4 style={{ fontSize: "0.95rem", color: "#9a3412", marginBottom: "8px" }}>Major Diseases</h4>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {selectedCrop.phytosanitary_precautions.major_diseases.map((disease) => (
                    <div key={disease.name} style={{ padding: "12px", border: "1px solid #ffedd5", borderRadius: "10px", backgroundColor: "#fffaf0" }}>
                      <strong style={{ color: "#c2410c" }}>{disease.name}</strong>
                      <p style={{ fontSize: "0.85rem", margin: "4px 0", color: "var(--text-dark)" }}><strong>Symptoms:</strong> {disease.symptoms}</p>
                      <p style={{ fontSize: "0.85rem", margin: "4px 0", color: "#b45309" }}><strong>Treatment:</strong> {disease.fungicide_treatment}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cultural Precautions */}
              <div style={{ marginTop: "16px" }}>
                <h4 style={{ fontSize: "0.95rem", color: "var(--color-primary-dark)", marginBottom: "8px" }}>Cultural Precautions</h4>
                <ul style={{ paddingLeft: "20px", fontSize: "0.85rem", lineHeight: "1.5" }}>
                  {selectedCrop.phytosanitary_precautions.cultural_precautions.map((precaution, idx) => (
                    <li key={idx} style={{ marginBottom: "6px", color: "var(--color-text-muted)" }}>
                      {precaution}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
