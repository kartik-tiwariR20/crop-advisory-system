import { NextResponse } from "next/server";

// WMO Weather interpretation codes
function interpretWeatherCode(code: number): { text: string; icon: string } {
  if (code === 0) return { text: "Clear Sky", icon: "sunny" };
  if (code >= 1 && code <= 3) return { text: "Mainly Clear / Partly Cloudy", icon: "cloudy" };
  if (code === 45 || code === 48) return { text: "Foggy", icon: "fog" };
  if (code >= 51 && code <= 57) return { text: "Drizzle", icon: "drizzle" };
  if (code >= 61 && code <= 67) return { text: "Rainy", icon: "rainy" };
  if (code >= 71 && code <= 77) return { text: "Snowy", icon: "snowy" };
  if (code >= 80 && code <= 82) return { text: "Rain Showers", icon: "showers" };
  if (code >= 85 && code <= 86) return { text: "Snow Showers", icon: "snowy" };
  if (code === 95 || code >= 96) return { text: "Thunderstorm", icon: "thunderstorm" };
  return { text: "Overcast", icon: "cloudy" };
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = searchParams.get("lat") || "32.1109";
    const lon = searchParams.get("lon") || "76.5363";
    const locationName = searchParams.get("locationName") || "Palampur, Kangra District";

    // Call Open-Meteo API
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m&hourly=precipitation_probability,precipitation&forecast_days=1&timezone=auto`;
    const res = await fetch(weatherUrl);
    
    if (!res.ok) {
      throw new Error(`Open-Meteo returned status ${res.status}`);
    }

    const data = await res.json();
    const current = data.current;
    const hourly = data.hourly;

    if (!current || !hourly) {
      throw new Error("Missing weather data fields in Open-Meteo response.");
    }

    const temp = current.temperature_2m;
    const humidity = current.relative_humidity_2m;
    const windSpeed = current.wind_speed_10m;
    const currentPrecipitation = current.precipitation;
    const weatherInfo = interpretWeatherCode(current.weather_code);

    // Analyze next 24 hours precipitation
    const next24HoursPrecipitation = hourly.precipitation || [];
    const total24hPrecipitation = next24HoursPrecipitation.reduce((a: number, b: number) => a + b, 0);
    
    const next24HoursRainProb = hourly.precipitation_probability || [];
    const max24hRainProb = Math.max(...next24HoursRainProb, 0);

    // Compute Advisory Decisions
    // 1. Watering / Irrigation Advisory
    let wateringAdvisory = {
      action: "Water Crops",
      status: "success", // success=green, warning=amber, danger=red
      message: "Conditions are dry and clear. Maintain your standard watering schedule."
    };

    if (currentPrecipitation > 0 || total24hPrecipitation > 2.0 || max24hRainProb > 60) {
      wateringAdvisory = {
        action: "Postpone Watering",
        status: "warning",
        message: `Rain is expected over the next 24 hours (Probability: ${max24hRainProb}%, Expected rain: ${total24hPrecipitation.toFixed(1)} mm). Let nature irrigate your field.`
      };
    } else if (temp > 35) {
      wateringAdvisory = {
        action: "Irrigate Early/Late",
        status: "warning",
        message: `High temperature (${temp}°C) detected. Irrigate in the early morning or evening to minimize water evaporation.`
      };
    } else if (humidity > 80 && temp < 20) {
      wateringAdvisory = {
        action: "Reduce Watering",
        status: "warning",
        message: "High relative humidity and cool temperatures detected. Keep soil moist but avoid over-saturation."
      };
    }

    // 2. Fertilizer / Pesticide Spraying Advisory
    let sprayingAdvisory = {
      action: "Safe to Spray",
      status: "success",
      message: `Ideal weather conditions. Winds are gentle (${windSpeed} km/h) and no rainfall is predicted.`
    };

    if (windSpeed > 15) {
      sprayingAdvisory = {
        action: "Do Not Spray",
        status: "danger",
        message: `Wind speed is too high (${windSpeed} km/h). Spraying now will cause chemical drift and reduce efficacy.`
      };
    } else if (currentPrecipitation > 0 || total24hPrecipitation > 0.5 || max24hRainProb > 40) {
      sprayingAdvisory = {
        action: "Do Not Spray",
        status: "danger",
        message: `Rain is likely. Pesticides/fertilizers will wash off, rendering the application ineffective.`
      };
    }

    // 3. Harvesting Advisory
    let harvestingAdvisory = {
      action: "Safe to Harvest",
      status: "success",
      message: "Excellent dry window. Clear skies are perfect for cutting and drying grains."
    };

    if (currentPrecipitation > 1.0 || total24hPrecipitation > 8.0) {
      harvestingAdvisory = {
        action: "Delay Harvesting",
        status: "danger",
        message: `Significant precipitation (${total24hPrecipitation.toFixed(1)} mm) forecast. Delay harvest to prevent grain damage and waterlogging.`
      };
    } else if (total24hPrecipitation > 2.0) {
      harvestingAdvisory = {
        action: "Proceed with Caution",
        status: "warning",
        message: `Light rain forecast (${total24hPrecipitation.toFixed(1)} mm). Secure harvested grains immediately in dry shelter.`
      };
    }

    return NextResponse.json({
      success: true,
      location: locationName,
      coordinates: { lat, lon },
      weather: {
        temp,
        humidity,
        windSpeed,
        weatherText: weatherInfo.text,
        weatherIcon: weatherInfo.icon,
        rainProb24h: max24hRainProb,
        precip24h: total24hPrecipitation
      },
      advisories: {
        watering: wateringAdvisory,
        spraying: sprayingAdvisory,
        harvesting: harvestingAdvisory
      }
    });

  } catch (error: any) {
    console.error("Advisory API Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch advisory weather data." },
      { status: 500 }
    );
  }
}
