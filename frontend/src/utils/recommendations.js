/**
 * AI-Driven Recommendation Engine for KrishiAI
 * Translates geospatial data & environmental metrics into actionable farming advice.
 */

const recommendationsMap = {
  HEALTHY: {
    irrigation: "Maintain current moisture levels. Soil moisture looks optimal for active growth.",
    fertilizer: "No immediate fertilization required. Top-dressing scheduled for the next growth stage.",
    protection: "Maintain preventive monitoring. Low risk of systemic disease.",
    general: "Crop is in excellent health. Ensure timely harvesting planning."
  },
  MODERATE: {
    irrigation: "Light supplemental irrigation recommended to prevent moisture stress.",
    fertilizer: "Apply Nitrogen-rich top dressing (e.g., Urea) to boost photosynthetic activity.",
    protection: "Check for early signs of yellowing or pest infestation (Leaf hoppers/Borers).",
    general: "Signs of mild growth deceleration. Targeted nutrition needed."
  },
  STRESSED: {
    irrigation: "IMMEDIATE ATTENTION: Significant moisture deficiency detected. Increase irrigation frequency.",
    fertilizer: "Apply balanced NPK (19:19:19) via fertigation for rapid nutrient uptake.",
    protection: "High risk of pest vulnerability due to weakened state. Apply prophylactic Organic Neem oil.",
    general: "Critical growth lag detected. Comprehensive inspection recommended."
  },
  POOR: {
    irrigation: "CRITICAL: Severe wilting risk. Ensure consistent hydration immediately.",
    fertilizer: "Deficiency detected. Consult local agricultural officer for micro-nutrient mix (Zinc/Iron).",
    protection: "Emergency pest control intervention likely required. High vulnerability.",
    general: "Vegetation cover below threshold. Consider re-seeding or intensive recovery protocol."
  }
};

/**
 * Generates actionable advice based on NDVI data
 * @param {number} ndvi - Normalized Difference Vegetation Index (0-1)
 * @returns {Object} Actionable recommendations
 */
export const getRecommendations = (ndvi) => {
  let category = 'POOR';
  if (ndvi > 0.6) category = 'HEALTHY';
  else if (ndvi > 0.4) category = 'MODERATE';
  else if (ndvi > 0.2) category = 'STRESSED';

  return {
    ...recommendationsMap[category],
    category,
    confidence: (Math.random() * 0.1 + 0.85).toFixed(2) // Simulated AI confidence
  };
};

/**
 * Multilingual support for recommendations
 */
export const getMultilingualRecommendation = (rec, lang) => {
  // Simple mapping for demonstration - could be expanded to a full i18n file
  if (lang === 'en') return rec;
  
  // Example Hindi translations
  if (lang === 'hi') {
    return {
       irrigation: "सिंचाई: " + rec.irrigation.replace("Maintain", "बनाए रखें").replace("recommended", "अनुशंसित"),
       fertilizer: "उर्वरक: " + rec.fertilizer,
       protection: "सुरक्षा: " + rec.protection,
       general: "सामान्य: " + rec.general
    };
  }

  // Example Odia translations
  if (lang === 'or') {
    return {
       irrigation: "ଜଳସେଚନ: " + rec.irrigation,
       fertilizer: "ସାର: " + rec.fertilizer,
       protection: "ସୁରକ୍ଷା: " + rec.protection,
       general: "ସାଧାରଣ: " + rec.general
    };
  }

  return rec;
};
