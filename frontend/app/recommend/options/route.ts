import { NextResponse } from "next/server";

// Static fallback in case the backend is briefly unreachable - mirrors the
// categories the fertilizer model was actually trained on.
const FALLBACK_OPTIONS = {
  crop_features: ["N", "P", "K", "temperature", "humidity", "ph", "rainfall"],
  fertilizer_features: [
    "Soil_Type", "Soil_pH", "Soil_Moisture", "Organic_Carbon",
    "Nitrogen_Level", "Phosphorus_Level", "Potassium_Level",
    "Temperature", "Humidity", "Rainfall",
    "Crop_Type", "Crop_Growth_Stage", "Season", "Irrigation_Type",
  ],
  fertilizer_options: {
    Soil_Type: ["Clay", "Loamy", "Sandy", "Silt"],
    Crop_Type: ["Cotton", "Maize", "Potato", "Rice", "Sugarcane", "Tomato", "Wheat"],
    Crop_Growth_Stage: ["Flowering", "Harvest", "Sowing", "Vegetative"],
    Season: ["Kharif", "Rabi", "Zaid"],
    Irrigation_Type: ["Canal", "Drip", "Rainfed", "Sprinkler"],
  },
  possible_crops: [],
};

export async function GET() {
  try {
    const backendUrl = process.env.BACKEND_API_URL || "http://127.0.0.1:8000";
    const res = await fetch(`${backendUrl}/api/predict/options/`, { cache: "no-store" });

    if (!res.ok) throw new Error(`Backend returned ${res.status}`);

    const data = await res.json();
    return NextResponse.json({ success: true, ...data });
  } catch (error) {
    console.warn("Options proxy falling back to static options:", error);
    return NextResponse.json({ success: false, ...FALLBACK_OPTIONS });
  }
}
