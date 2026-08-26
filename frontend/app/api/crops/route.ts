import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

const seedCrops = [
  {
    crop_id: "CROP_RICE_001",
    common_name: "Paddy (Rice)",
    vernacular_names: {
      hindi: "Dhan (धान)",
      tamil: "Nellu (நெல்)",
      telugu: "Vari (వరి)",
      punjabi: "Chawal (ਚਾਵਲ)",
      marathi: "Bhat (भात)"
    },
    scientific_name: "Oryza sativa",
    category: "Cereal",
    season: ["Kharif", "Summer"],
    agronomic_requirements: {
      water_requirement_mm: {
        min: 1100,
        max: 1500,
        iw_cpe_ratio: 1.2
      },
      temperature_celsius: {
        min_optimal: 22,
        max_optimal: 37,
        base_temperature: 10
      },
      soil_profile: {
        optimal_ph: {
          min: 5.5,
          max: 6.5
        },
        preferred_textures: [
          "Clay Loam",
          "Silty Clay Loam",
          "Heavy Alluvial"
        ],
        drainage_requirement: "Tolerates poor drainage; requires standing water during tillering"
      },
      growth_duration_days: {
        min_days: 115,
        max_days: 145
      },
      calendar_windows: {
        sowing_months: ["June", "July"],
        harvesting_months: ["October", "November"]
      },
      fertilizer_dosage_kg_per_ha: {
        nitrogen: 120,
        phosphorus: 60,
        potassium: 60,
        sulphur: 20,
        micronutrient_recommendations: "Apply Zinc Sulphate @ 25 kg/ha basally in zinc-deficient soils."
      }
    },
    financial_metrics: {
      msp_records: [
        {
          year: "2024-25",
          msp_rupees_per_quintal: 2300
        },
        {
          year: "2025-26",
          msp_rupees_per_quintal: 2369
        },
        {
          year: "2026-27",
          msp_rupees_per_quintal: 2441
        }
      ],
      cost_of_cultivation_a2_fl_per_ha: 39475,
      cost_of_cultivation_c2_per_ha: 62100,
      average_yield_quintal_per_ha: 42.5
    },
    phytosanitary_precautions: {
      major_pests: [
        {
          name: "Yellow Stem Borer (Scirpophaga incertulas)",
          symptoms: "Dead hearts at vegetative stage and white heads at panicle stage",
          chemical_control: "Apply Cartap Hydrochloride 4G @ 18.75 kg/ha or Chlorantraniliprole 0.4% GR @ 10 kg/ha",
          biological_control: "Release Trichogramma japonicum egg parasitoid @ 100,000/ha"
        },
        {
          name: "Brown Plant Hopper (Nilaparvata lugens)",
          symptoms: "Hopper burn drying of leaves in circular patches at leaf sheath base",
          chemical_control: "Spray Pymetrozine 50% WG @ 300 g/ha or Dinotefuran 20% SG @ 200 g/ha",
          biological_control: "Conserve spiders (Lycosa pseudoannulata) and Cyrtorhinus lividipennis bugs"
        }
      ],
      major_diseases: [
        {
          name: "Rice Blast (Magnaporthe oryzae)",
          symptoms: "Spindle-shaped lesions on leaves with grey centers and brown margins",
          fungicide_treatment: "Spray Tricyclazole 75% WP @ 0.6 g/L or Azoxystrobin 25% SC @ 1 mL/L"
        },
        {
          name: "Bacterial Leaf Blight (Xanthomonas oryzae)",
          symptoms: "Water-soaked lesions turning yellow-white along leaf margins",
          fungicide_treatment: "Spray Streptocycline @ 6 g/100 L water mixed with Copper Oxychloride @ 500 g/ha"
        }
      ],
      cultural_precautions: [
        "Avoid excess nitrogenous fertilizer application which aggravates BPH infestation",
        "Maintain Alternate Wetting and Drying (AWD) to control BPH and conserve water",
        "Adopt System of Rice Intensification (SRI) spacing (25cm x 25cm) for higher tiller viability"
      ]
    }
  },
  {
    crop_id: "CROP_WHEAT_001",
    common_name: "Wheat",
    vernacular_names: {
      hindi: "Gehun (गेहूं)",
      tamil: "Godhumai (கோதுமை)",
      telugu: "Godhumalu (గోధుమలు)",
      punjabi: "Kanak (ਕਣਕ)",
      marathi: "Gahu (गहू)"
    },
    scientific_name: "Triticum aestivum",
    category: "Cereal",
    season: ["Rabi"],
    agronomic_requirements: {
      water_requirement_mm: {
        min: 350,
        max: 550,
        iw_cpe_ratio: 0.8
      },
      temperature_celsius: {
        min_optimal: 15,
        max_optimal: 25,
        base_temperature: 4
      },
      soil_profile: {
        optimal_ph: {
          min: 6.0,
          max: 7.5
        },
        preferred_textures: [
          "Clay Loam",
          "Silt Loam",
          "Sandy Loam"
        ],
        drainage_requirement: "Requires well-drained loamy soils; highly susceptible to waterlogging"
      },
      growth_duration_days: {
        min_days: 120,
        max_days: 150
      },
      calendar_windows: {
        sowing_months: ["November", "December"],
        harvesting_months: ["March", "April"]
      },
      fertilizer_dosage_kg_per_ha: {
        nitrogen: 120,
        phosphorus: 50,
        potassium: 40,
        sulphur: 15,
        micronutrient_recommendations: "Apply Zinc Sulphate @ 25 kg/ha if soil test shows deficiency."
      }
    },
    financial_metrics: {
      msp_records: [
        {
          year: "2024-25",
          msp_rupees_per_quintal: 2275
        },
        {
          year: "2025-26",
          msp_rupees_per_quintal: 2425
        }
      ],
      cost_of_cultivation_a2_fl_per_ha: 32000,
      cost_of_cultivation_c2_per_ha: 54000,
      average_yield_quintal_per_ha: 38.0
    },
    phytosanitary_precautions: {
      major_pests: [
        {
          name: "Wheat Aphids (Macrosiphum miscanthi)",
          symptoms: "Yellowing of leaves, leaf curling, sootish appearance from honeydew",
          chemical_control: "Spray Imidacloprid 17.8% SL @ 100 mL/ha or Thiamethoxam 25% WG @ 100 g/ha",
          biological_control: "Encourage ladybird beetles and syrphid fly predators"
        }
      ],
      major_diseases: [
        {
          name: "Yellow Rust (Puccinia striiformis)",
          symptoms: "Bright yellow pustules forming stripes on leaf blades",
          fungicide_treatment: "Spray Propiconazole 25% EC @ 500 mL in 500 L of water per hectare"
        }
      ],
      cultural_precautions: [
        "Avoid late sowing to prevent maximum aphid population window",
        "Adopt recommended row spacing (22.5 cm) for optimal ventilation",
        "Use rust-resistant cultivars like HD 2967, HD 3086"
      ]
    }
  }
];

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("crop_db");
    const collection = db.collection("crops");

    // Check count and seed if empty
    const count = await collection.countDocuments();
    if (count === 0) {
      await collection.insertMany(seedCrops);
    }

    const crops = await collection.find({}).toArray();
    return NextResponse.json({ success: true, crops });
  } catch (error) {
    console.error("MongoDB error in crops GET route. Using static fallback.", error);
    // Return static seedCrops as fallback to ensure the UI operates
    return NextResponse.json({ 
      success: false, 
      error: "Could not fetch from MongoDB, using local fallback data.", 
      crops: seedCrops 
    });
  }
}
