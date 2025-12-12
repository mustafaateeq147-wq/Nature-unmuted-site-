import { GoogleGenAI, Type } from "@google/genai";
import { SeoData } from "../types";

const apiKey = process.env.API_KEY || '';

// Initialize Gemini
const ai = new GoogleGenAI({ apiKey });

export const generateSeoTags = async (postContent: string, postTitle: string): Promise<SeoData> => {
  if (!apiKey) {
    console.warn("No API Key provided for Gemini.");
    return {
      metaTitle: postTitle,
      metaDescription: "Content about " + postTitle,
      keywords: ["nature", "blog"]
    };
  }

  try {
    const prompt = `
      Analyze the following blog post content and title. 
      Generate optimized SEO metadata including a meta title (max 60 chars), 
      a meta description (max 160 chars), and a list of 5-8 relevant keywords.
      
      Title: ${postTitle}
      Content snippet: ${postContent.substring(0, 1000)}...
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            metaTitle: { type: Type.STRING },
            metaDescription: { type: Type.STRING },
            keywords: { 
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["metaTitle", "metaDescription", "keywords"]
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as SeoData;
    }
    
    throw new Error("No response text from Gemini");

  } catch (error) {
    console.error("Gemini SEO Generation Error:", error);
    // Fallback
    return {
      metaTitle: postTitle,
      metaDescription: postContent.substring(0, 150),
      keywords: ["environment", "nature", "sustainability"]
    };
  }
};