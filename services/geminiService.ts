import { GoogleGenAI, Type } from "@google/genai";
import { SeoData, Category } from "../types";

// User provided API Key to resolve RPC errors
const MANUAL_API_KEY = 'AIzaSyBRCSp4hpg1NulPI-AhKXGxwx8GP3dyWf4';

// Safe access to environment variable or manual key
const getApiKey = () => {
  try {
    return MANUAL_API_KEY || process.env.API_KEY || '';
  } catch (e) {
    return MANUAL_API_KEY;
  }
};

const apiKey = getApiKey();

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
      const parsed = JSON.parse(response.text);
      return {
          metaTitle: parsed.metaTitle || postTitle.substring(0, 60),
          metaDescription: parsed.metaDescription || postContent.substring(0, 160),
          keywords: parsed.keywords || []
      };
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

const generateBlogImage = async (prompt: string): Promise<string> => {
  if (!apiKey) return `https://loremflickr.com/1280/720/nature?lock=${Date.now()}`;
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: `A photorealistic, high-quality nature blog cover image about: ${prompt}. Landscape aspect ratio (16:9), cinematic lighting, detailed, professional photography.` }]
      },
      config: {
        imageConfig: {
          aspectRatio: "16:9"
        }
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    throw new Error("No image data found in response");
  } catch (error) {
    console.warn("Image generation failed, falling back to placeholder", error);
    // Fallback if AI image generation fails (e.g. quota or model availability)
    return `https://loremflickr.com/1280/720/nature?lock=${Date.now()}`;
  }
};

export const classifyPost = async (title: string, contentSnippet: string): Promise<Category> => {
  if (!apiKey) return Category.SUSTAINABILITY;

  try {
    const prompt = `
      Classify the following blog post into exactly one of these categories: 
      "Oceans", "Forests", "Wildlife", "Sustainability", "Climate Change".
      
      Title: ${title}
      Content: ${contentSnippet.substring(0, 300)}...
      
      Return ONLY the category name.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    
    const text = response.text?.trim() || '';
    
    // Simple matching to ensure it matches a valid enum
    if (text.includes("Oceans")) return Category.OCEANS;
    if (text.includes("Forests")) return Category.FORESTS;
    if (text.includes("Wildlife")) return Category.WILDLIFE;
    if (text.includes("Climate")) return Category.CLIMATE;
    return Category.SUSTAINABILITY;
  } catch (e) {
    console.error("Classification failed", e);
    return Category.SUSTAINABILITY;
  }
}

export const generateFullPost = async (title: string): Promise<{
  subtitle: string;
  content: string;
  category: Category;
  tags: string[];
  seo: SeoData;
  imageKeyword: string;
  coverImage: string;
}> => {
  if (!apiKey) {
    throw new Error("API Key is missing. Cannot generate content.");
  }

  // 1. Generate Text Content
  const textPrompt = `
    You are an expert environmental blog writer for "Nature Unmuted".
    Create a complete, high-quality blog post based on this title: "${title}".
    
    Return a JSON object with:
    1. subtitle: A compelling, short summary (max 2 sentences).
    2. content: The full blog post in Markdown. Use H2 (##) for section headers, bullet points, and bold text. It should be educational, inspiring, and at least 400 words.
    3. category: Choose exactly one: "Oceans", "Forests", "Wildlife", "Sustainability", "Climate Change".
    4. tags: Array of 4-6 relevant tags.
    5. seo: Object with 'metaTitle', 'metaDescription', 'keywords'.
    6. imageKeyword: A single descriptive sentence to generate a cover image (e.g. "A serene forest with sunlight streaming through trees").

    Ensure the tone is professional yet passionate.
  `;

  try {
    const textResponse = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: textPrompt,
        config: {
        responseMimeType: "application/json",
        responseSchema: {
            type: Type.OBJECT,
            properties: {
            subtitle: { type: Type.STRING },
            content: { type: Type.STRING },
            category: { type: Type.STRING, enum: ["Oceans", "Forests", "Wildlife", "Sustainability", "Climate Change"] },
            tags: { type: Type.ARRAY, items: { type: Type.STRING } },
            imageKeyword: { type: Type.STRING },
            seo: {
                type: Type.OBJECT,
                properties: {
                metaTitle: { type: Type.STRING },
                metaDescription: { type: Type.STRING },
                keywords: { type: Type.ARRAY, items: { type: Type.STRING } }
                }
            }
            }
        }
        }
    });

    if (!textResponse.text) {
        throw new Error("Failed to generate post content text");
    }

    const data = JSON.parse(textResponse.text);

    // Ensure SEO object exists even if model returns incomplete data
    const sanitizedSeo = data.seo || { 
        metaTitle: title, 
        metaDescription: data.subtitle || 'A post about ' + title, 
        keywords: [] 
    };

    // 2. Generate Image based on the keyword/description provided by the text model
    const coverImage = await generateBlogImage(data.imageKeyword || title);

    return { ...data, seo: sanitizedSeo, coverImage };
  } catch (error) {
    console.error("Full post generation failed:", error);
    throw error;
  }
};