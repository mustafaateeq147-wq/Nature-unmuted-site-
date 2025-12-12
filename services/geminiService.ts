import { GoogleGenAI, Type } from "@google/genai";
import { SeoData, Category } from "../types";

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

export const generateFullPost = async (topic: string): Promise<{
  title: string;
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
    Create a complete, high-quality blog post about the following topic: "${topic}".
    
    Return a JSON object with:
    1. title: A catchy, SEO-friendly title.
    2. subtitle: A compelling, short summary (max 2 sentences).
    3. content: The full blog post in Markdown. Use H2 (##) for section headers, bullet points, and bold text. It should be educational, inspiring, and at least 400 words.
    4. category: Choose exactly one: "Oceans", "Forests", "Wildlife", "Sustainability", "Climate Change".
    5. tags: Array of 4-6 relevant tags.
    6. seo: Object with 'metaTitle', 'metaDescription', 'keywords'.
    7. imageKeyword: A single descriptive sentence to generate a cover image (e.g. "A serene forest with sunlight streaming through trees").

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
            title: { type: Type.STRING },
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
        metaTitle: data.title, 
        metaDescription: data.subtitle || 'A post about ' + topic, 
        keywords: [] 
    };

    // 2. Generate Image based on the keyword/description provided by the text model
    const coverImage = await generateBlogImage(data.imageKeyword || topic);

    return { ...data, seo: sanitizedSeo, coverImage };
  } catch (error) {
    console.error("Full post generation failed:", error);
    throw error;
  }
};