import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Agricultural assistant chat function
export async function getAIChatResponse(
  messages: { role: "user" | "assistant" | "system"; content: string }[],
  farmerId: number
): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: 
            "You are AgriGPT, an expert agricultural assistant for farmers. " +
            "Provide helpful, practical farming advice tailored to the local context. " +
            "Focus on sustainable farming practices, crop management, pest control, " +
            "weather adaptation, and agricultural economics. " +
            "Keep responses concise, practical and farmer-friendly. " +
            "Always consider the specific challenges of small-scale farmers in India."
        },
        ...messages
      ],
      max_tokens: 500,
    });

    return response.choices[0].message.content || "I'm sorry, I couldn't generate a response.";
  } catch (error) {
    console.error("Error with OpenAI API:", error);
    throw new Error("Failed to get AI response. Please try again later.");
  }
}

// Crop recommendation system
export async function getCropRecommendations(
  soilType: string,
  location: string,
  seasonality: string,
  waterAvailability: string,
  previousCrops: string
): Promise<{
  recommendedCrops: { crop: string; confidence: number; reasoning: string }[];
  generalAdvice: string;
}> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: 
            "You are an agricultural expert system specializing in crop recommendations for Indian farmers. " +
            "Based on the provided field conditions, recommend suitable crops with confidence levels and reasoning. " +
            "Focus on crops that are well-suited for the specific conditions and economically viable."
        },
        {
          role: "user",
          content: `Please recommend crops for a field with the following characteristics:
          - Soil Type: ${soilType}
          - Location: ${location}
          - Season: ${seasonality}
          - Water Availability: ${waterAvailability}
          - Previous Crops: ${previousCrops}
          
          Provide recommendations in JSON format with an array of recommended crops (each with name, confidence level from 0-1, and reasoning) and general advice.`
        }
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    return {
      recommendedCrops: result.recommendedCrops || [],
      generalAdvice: result.generalAdvice || "No specific advice available."
    };
  } catch (error) {
    console.error("Error with OpenAI API for crop recommendations:", error);
    throw new Error("Failed to generate crop recommendations. Please try again later.");
  }
}

// Government subsidy recommendation
export async function getSubsidyRecommendations(
  farmerDetails: {
    location: string;
    landSize: number;
    crops: string[];
    income: string;
    category: string;
  }
): Promise<{
  recommendedSubsidies: { name: string; eligibility: string; description: string; applicationProcess: string }[];
  generalAdvice: string;
}> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: 
            "You are a government subsidy expert for Indian farmers. " +
            "Based on the farmer's details, recommend suitable government subsidies, schemes, and programs. " +
            "Provide accurate information about eligibility, documentation, application process, and benefits. " +
            "Focus on the most relevant and beneficial programs for the specific farmer profile."
        },
        {
          role: "user",
          content: `Please recommend government subsidies and schemes for a farmer with the following profile:
          - Location: ${farmerDetails.location}
          - Land Size: ${farmerDetails.landSize} acres
          - Crops: ${farmerDetails.crops.join(', ')}
          - Income Level: ${farmerDetails.income}
          - Category: ${farmerDetails.category}
          
          Provide recommendations in JSON format with an array of recommended subsidies (each with name, eligibility criteria, description, and application process) and general advice.`
        }
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    return {
      recommendedSubsidies: result.recommendedSubsidies || [],
      generalAdvice: result.generalAdvice || "No specific advice available."
    };
  } catch (error) {
    console.error("Error with OpenAI API for subsidy recommendations:", error);
    throw new Error("Failed to generate subsidy recommendations. Please try again later.");
  }
}