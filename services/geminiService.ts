
import { GoogleGenAI, GenerateContentResponse, Chat } from "@google/genai";
import { FilterState, Product, GroundingChunk, ChatMessage } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const cleanJsonString = (str: string): string => {
  // Remove markdown code block fences
  const cleaned = str.replace(/```json/g, '').replace(/```/g, '');
  // Find the start of the array or object
  const firstBracket = cleaned.indexOf('[');
  const firstBrace = cleaned.indexOf('{');
  
  let start = -1;
  if (firstBracket === -1) start = firstBrace;
  else if (firstBrace === -1) start = firstBracket;
  else start = Math.min(firstBracket, firstBrace);
  
  if (start === -1) return '';

  // Find the end of the array or object
  const lastBracket = cleaned.lastIndexOf(']');
  const lastBrace = cleaned.lastIndexOf('}');
  const end = Math.max(lastBracket, lastBrace);

  if (end === -1) return '';

  return cleaned.substring(start, end + 1).trim();
};

export const searchEquipment = async (filters: FilterState): Promise<{products: Product[], groundingChunks: GroundingChunk[]}> => {
  let prompt = "You are an expert in commercial kitchen and laundry equipment. Search the web for products matching the following criteria:\n";
  if (filters.keyword) prompt += `- Keyword: ${filters.keyword}\n`;
  if (filters.brand) prompt += `- Brand: ${filters.brand}\n`;
  if (filters.model) prompt += `- Model: ${filters.model}\n`;
  if (filters.category && filters.category !== 'Any') prompt += `- Category: ${filters.category}\n`;
  if (filters.countries && filters.countries.length > 0) prompt += `- Countries/Regions: ${filters.countries.join(', ')}\n`;
  if (filters.priceMin || filters.priceMax) {
    prompt += `- Price Range: ${filters.priceMin || 'any'} to ${filters.priceMax || 'any'} ${filters.currency}\n`;
  }
  if (filters.condition && filters.condition !== 'Any') prompt += `- Condition: ${filters.condition}\n`;
    if (filters.supplierWebsites) {
    prompt += `\nPrioritize or exclusively search within these supplier websites:\n${filters.supplierWebsites}\n`;
  }

  prompt += `
Return a maximum of ${filters.itemsPerPage} results.
The results MUST be a JSON array string. Do not include any text, explanation, or markdown formatting before or after the JSON array.
Each object in the array must have these keys: 'id' (a unique string), 'brand', 'model', 'price' (a number, or 0 if not found), 'currency' (e.g., '${filters.currency}'), 'imageUrl' (a valid direct image URL), 'supplier', 'productUrl', 'specs' (an object with key-value pairs like 'Power', 'Capacity', 'Dimensions'), and 'condition' ('New', 'Used', or 'Refurbished').
If an image is not found, use a placeholder URL from picsum.photos.
`;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: [{googleSearch: {}}],
        temperature: 0.2
      },
    });

    // Fix: Ensure groundingChunks is always an array by checking the type from the response.
    const rawGroundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    const groundingChunks: GroundingChunk[] = Array.isArray(rawGroundingChunks) ? rawGroundingChunks : [];

    const jsonString = cleanJsonString(response.text);
    if (!jsonString) {
        console.warn("Gemini returned non-JSON response:", response.text);
        return {products: [], groundingChunks};
    }

    const products: Product[] = JSON.parse(jsonString);
    return {products, groundingChunks};
  } catch (error) {
    console.error("Error searching equipment:", error);
    return {products: [], groundingChunks: []};
  }
};

export const summarizeDifferences = async (products: Product[]): Promise<string> => {
    const prompt = `You are a helpful product comparison assistant.
    Analyze the following commercial equipment products and provide a concise summary of their key differences. 
    Focus on specifications, price, and primary use case. Use bullet points for clarity.
    
    Products:
    ${JSON.stringify(products, null, 2)}
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error("Error summarizing differences:", error);
        return "Could not generate comparison summary.";
    }
}

let chatInstance: Chat | null = null;

const getChatInstance = (): Chat => {
    if (!chatInstance) {
         chatInstance = ai.chats.create({
            model: 'gemini-2.5-flash',
            config: {
                systemInstruction: "You are a helpful assistant specializing in commercial kitchen and laundry equipment. Use the search tool to answer user questions about products, prices, and suppliers. Keep your answers concise and helpful.",
                tools: [{googleSearch: {}}]
            },
        });
    }
    return chatInstance;
};

export const sendChatMessage = async (message: string, history: ChatMessage[]): Promise<string> => {
    const chat = getChatInstance();
    // Gemini chat API doesn't have a direct way to load history,
    // so we'll provide context in the message for this implementation.
    // A more complex implementation might re-initialize the chat with history.
    try {
        const response = await chat.sendMessage({ message });
        return response.text;
    } catch (error) {
        console.error("Error in chat:", error);
        return "Sorry, I encountered an error. Please try again.";
    }
};
