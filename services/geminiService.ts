import { GoogleGenAI, Type } from "@google/genai";
import { SeoData, Category } from "../types";

const apiKey = process.env.API_KEY || '';

// Initialize Gemini
const ai = new GoogleGenAI({ apiKey });

// Helper to clean JSON string from Markdown code blocks
const cleanJsonString = (str: string) => {
  if (!str) return '';
  // Remove ```json at start and ``` at end, and generic ``` wrappers
  let cleaned = str.replace(/^```json\s*/i, '').replace(/^```\s*/i, '');
  cleaned = cleaned.replace(/\s*```$/, '');
  return cleaned.trim();
};

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
      const cleanedText = cleanJsonString(response.text);
      return JSON.parse(cleanedText) as SeoData;
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

  try {
    // 1. Generate Metadata (Structure & SEO) - JSON
    const metadataPrompt = `
      You are an expert environmental blog writer for "Nature Unmuted".
      Topic: "${topic}".
      
      Generate the structure and metadata for a blog post.
      Return a JSON object with:
      1. title: A catchy, SEO-friendly title.
      2. subtitle: A compelling, short summary (max 2 sentences).
      3. category: Choose exactly one: "Oceans", "Forests", "Wildlife", "Sustainability", "Climate Change".
      4. tags: Array of 4-6 relevant tags.
      5. seo: Object with 'metaTitle', 'metaDescription', 'keywords'.
      6. imageKeyword: A single descriptive sentence to generate a cover image (e.g. "A serene forest with sunlight streaming through trees").
    `;

    const metadataResponse = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: metadataPrompt,
        config: {
        responseMimeType: "application/json",
        responseSchema: {
            type: Type.OBJECT,
            properties: {
            title: { type: Type.STRING },
            subtitle: { type: Type.STRING },
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
            },
            required: ["title", "subtitle", "category", "tags", "imageKeyword", "seo"]
        }
        }
    });

    if (!metadataResponse.text) throw new Error("Failed to generate post metadata");
    
    const cleanedMetadataJson = cleanJsonString(metadataResponse.text);
    let metadata;
    try {
        metadata = JSON.parse(cleanedMetadataJson);
    } catch (e) {
        console.error("Metadata JSON Parse Error:", cleanedMetadataJson);
        throw new Error("Failed to parse metadata JSON.");
    }

    // 2. Generate Content - Plain Text (Markdown)
    // We do this separately to avoid JSON escaping issues with large text blocks
    const contentPrompt = `
      Write a complete, professional, and passionate environmental blog post in Markdown based on the following:
      
      Title: "${metadata.title}"
      Subtitle: "${metadata.subtitle}"
      Topic: "${topic}"
      
      Requirements:
      - Use H2 (##) for section headers.
      - Use bullet points and bold text where appropriate.
      - Do NOT include the title at the top (it's handled separately).
      - STRICTLY text content only. No images.
      - Length: approx 500-700 words.
    `;

    const contentResponse = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: contentPrompt,
        // No responseMimeType means plain text/markdown
    });

    if (!contentResponse.text) throw new Error("Failed to generate post content");
    const content = contentResponse.text;

    // 3. Generate Image
    const coverImage = await generateBlogImage(metadata.imageKeyword || topic);

    // Ensure SEO object exists
    const sanitizedSeo = metadata.seo || { 
        metaTitle: metadata.title, 
        metaDescription: metadata.subtitle || 'A post about ' + topic, 
        keywords: [] 
    };

    return { 
        ...metadata, 
        content, 
        seo: sanitizedSeo, 
        coverImage 
    };

  } catch (error) {
    console.error("Full post generation failed:", error);
    throw error;
  }
};