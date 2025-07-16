
import { GoogleGenAI, Type } from "@google/genai";
import { LaundryRecommendation } from '../types';
import { productsCSV } from '../data/products';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const model = "gemini-2.5-flash";

const productRecommendationItemSchema = {
    type: Type.OBJECT,
    properties: {
        productName: { type: Type.STRING, description: "The name of the product." },
        reason: { type: Type.STRING, description: "The reason for recommending this product." },
        imageLink: { type: Type.STRING, description: "A direct URL to an image of the product." },
        purchaseLink: { type: Type.STRING, description: "A URL to purchase the product." },
    },
    required: ['productName', 'reason', 'imageLink', 'purchaseLink']
};

const laundryRecommendationSchema = {
    type: Type.OBJECT,
    properties: {
        garmentAnalysis: {
            type: Type.OBJECT,
            properties: {
                detectedMaterial: { type: Type.STRING, description: "The detected material of the garment." },
                itemType: { type: Type.STRING, description: "The type of the garment item." },
                color: { type: Type.STRING, description: "The color of the garment." },
                careSymbols: {
                    type: Type.ARRAY,
                    description: "A list of care symbols found on the tag.",
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            symbol: { type: Type.STRING, description: "The name of the care symbol." },
                            meaning: { type: Type.STRING, description: "The meaning of the care symbol." },
                        },
                        required: ['symbol', 'meaning']
                    }
                }
            },
            required: ['detectedMaterial', 'itemType', 'color', 'careSymbols']
        },
        stainAnalysis: {
            type: Type.OBJECT,
            properties: {
                detectedStain: { type: Type.STRING, description: "The type of stain detected." },
                stainDescription: { type: Type.STRING, description: "A brief description of the stain." },
                confidence: { type: Type.STRING, description: "Confidence level of the stain detection (High, Medium, or Low)." },
            },
            required: ['detectedStain', 'stainDescription', 'confidence']
        },
        recommendations: {
            type: Type.OBJECT,
            properties: {
                title: { type: Type.STRING, description: "A title for the recommendation." },
                summary: { type: Type.STRING, description: "A short summary of the cleaning process." },
                steps: {
                    type: Type.ARRAY,
                    description: "Step-by-step cleaning instructions.",
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            step: { type: Type.INTEGER, description: "The step number." },
                            instruction: { type: Type.STRING, description: "The instruction for this step." },
                            icon: { type: Type.STRING, description: "An icon name for the step (pretreat, wash, dry, check)." },
                            recommendedProductName: { type: Type.STRING, description: "If this step uses a recommended product, specify its exact name here. Otherwise, omit this field." },
                        },
                        required: ['step', 'instruction', 'icon']
                    }
                },
                warnings: { type: Type.ARRAY, description: "A list of warnings.", items: { type: Type.STRING } }
            },
            required: ['title', 'summary', 'steps', 'warnings']
        },
        productRecommendations: {
            type: Type.OBJECT,
            properties: {
                stainRemovers: {
                    type: Type.ARRAY,
                    description: "Recommended stain remover products.",
                    items: productRecommendationItemSchema
                },
                washingSupplies: {
                    type: Type.ARRAY,
                    description: "Recommended washing supplies.",
                    items: productRecommendationItemSchema
                }
            },
            required: ['stainRemovers', 'washingSupplies']
        }
    }
};

const getLaundryAdvicePrompt = `
You are an expert stain removal assistant. Your task is to analyze one or two images and optional text context.
- The first image is always a stain on a garment.
- A second image of the garment's care tag may or may not be provided.
- Additional text context from the user may also be provided.

Your goal is to identify the garment's characteristics, the stain, provide cleaning instructions, and recommend products from a specific list.

**Analysis Rules:**
- **Garment Analysis**: Analyze the garment in the image(s) to identify its material, item type (e.g., 'T-Shirt', 'Jeans'), and color. If a care tag is provided, use it to confirm the material and identify care symbols. If no tag is provided, you MUST visually estimate the material, item type, and color from the stain image. For any visually estimated value, add "(visual estimate)" to it (e.g., "Cotton (visual estimate)"). If no care symbols are found, return an empty array for "careSymbols".
- **Stain Analysis**: Analyze the first image to identify the stain type and provide a brief, one-sentence visual description of the stain (e.g., 'A dark brown, circular liquid stain, approximately 1 inch in diameter.').
- **Recommendations**: Provide step-by-step instructions based on your combined analysis.

**Product Recommendation Rules:**
- You MUST recommend 1-2 specific, commercially available stain removers and 1-2 other relevant washing supplies (e.g., detergents, odor removers).
- **CRITICAL**: You MUST ONLY select products from the 'AVAILABLE PRODUCTS' list provided below. Do not invent products.
- For each product you recommend, you MUST provide its exact 'productName', 'purchaseLink', and 'imageLink' from the list.
- Provide a brief 'reason' explaining why each product is a good choice for the specific stain and garment.
- **VERY IMPORTANT**: In the 'steps' array, if an instruction involves using one of the products you are recommending, you MUST set the 'recommendedProductName' field for that step to the exact 'productName' of the product used. For steps that do not mention a specific product, omit the 'recommendedProductName' field.

**AVAILABLE PRODUCTS (CSV Format):**
---
${productsCSV}
---

You MUST respond ONLY with a single, valid JSON object that follows the provided schema.
`;

function fileToGenerativePart(base64: string, mimeType: string) {
    return {
        inlineData: {
            data: base64.split(',')[1],
            mimeType
        },
    };
}


export const getLaundryAdvice = async (stainImageBase64: string, tagImageBase64: string | null, additionalText: string): Promise<LaundryRecommendation> => {
    const stainImagePart = fileToGenerativePart(stainImageBase64, "image/jpeg");

    const parts: any[] = [
        { text: getLaundryAdvicePrompt },
    ];

    parts.push(stainImagePart);

    if (tagImageBase64) {
      const tagImagePart = fileToGenerativePart(tagImageBase64, "image/jpeg");
      parts.push({ text: "\n\nThis is the second image, the garment's care tag:" });
      parts.push(tagImagePart);
    }
    
    if (additionalText && additionalText.trim().length > 0) {
        parts.push({ text: `\n\nAdditional user context: ${additionalText}` });
    }

    const response = await ai.models.generateContent({
        model: model,
        contents: {
            parts: parts
        },
        config: {
            responseMimeType: "application/json",
            responseSchema: laundryRecommendationSchema,
            temperature: 0.2,
        }
    });

    try {
        // The Gemini API may wrap the JSON in markdown code blocks.
        // This cleans the string before parsing to improve reliability.
        const cleanedText = response.text.replace(/^```json\s*/, '').replace(/```\s*$/, '').trim();
        const parsedData: LaundryRecommendation = JSON.parse(cleanedText);
        return parsedData;
    } catch (e) {
        console.error("Failed to parse JSON response from AI. Raw response text:", response.text);
        throw new Error("The AI returned data in an unexpected format. Please try again.");
    }
};