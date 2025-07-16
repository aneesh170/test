
export type CareSymbol = {
  symbol: string;
  meaning: string;
};

export type GarmentAnalysis = {
  detectedMaterial: string;
  itemType: string;
  color: string;
  careSymbols: CareSymbol[];
};

export type StainAnalysis = {
  detectedStain: string;
  stainDescription: string;
  confidence: 'High' | 'Medium' | 'Low';
};

export type RecommendationStep = {
  step: number;
  instruction: string;
  icon: 'pretreat' | 'wash' | 'dry' | 'check';
  recommendedProductName?: string;
};

export type Recommendations = {
  title: string;
  summary: string;
  steps: RecommendationStep[];
  warnings: string[];
};

export type ProductRecommendationItem = {
    productName: string;
    reason: string;
    imageLink: string;
    purchaseLink: string;
};

export interface LaundryRecommendation {
  garmentAnalysis: GarmentAnalysis;
  stainAnalysis: StainAnalysis;
  recommendations: Recommendations;
  productRecommendations: {
    stainRemovers: ProductRecommendationItem[];
    washingSupplies: ProductRecommendationItem[];
  }
}