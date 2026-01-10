/**
 * AI Features Dummy Data
 * Centralized mock data for all AI components
 * Replace these with actual API calls when ready
 */

// ==================== Property DNA Matching ====================

export interface DNAMatchData {
  overallScore: number;
  categories: {
    location: number;
    price: number;
    amenities: number;
    lifestyle: number;
    investment: number;
    community: number;
  };
  strengths: string[];
  weaknesses: string[];
  personalityMatch: {
    type: string;
    description: string;
    color: string;
  };
}

export const getDNAMatchData = (propertyId: number): DNAMatchData => {
  // TODO: Replace with actual API call
  // const response = await api.get(`/ai/property-dna/${propertyId}`);
  // return response.data;

  return {
    overallScore: 92,
    categories: {
      location: 95,
      price: 88,
      amenities: 90,
      lifestyle: 94,
      investment: 85,
      community: 92,
    },
    strengths: [
      "Perfect location match for your commute preferences",
      "Amenities align perfectly with your active lifestyle",
      "Excellent schools in the area (matches family priorities)",
      "Strong community fit based on your social preferences",
      "Property size matches your current and future needs",
    ],
    weaknesses: [
      "Slightly above your optimal price range",
      "Limited parking (noted in your must-haves)",
    ],
    personalityMatch: {
      type: "Urban Professional",
      description:
        "This property matches your preference for modern, convenient living with access to city amenities and excellent connectivity",
      color: "from-blue-600 to-purple-600",
    },
  };
};

// ==================== Predictive Market Intelligence ====================

export interface MarketData {
  currentValue: number;
  predictedValue: {
    "1M": number;
    "3M": number;
    "6M": number;
    "1Y": number;
    "3Y": number;
  };
  confidence: number;
  trend: "up" | "down" | "stable";
  changePercent: number;
}

export interface MarketInsight {
  type: "opportunity" | "risk" | "neutral";
  title: string;
  description: string;
  impact: "high" | "medium" | "low";
}

export interface MarketTrend {
  period: string;
  value: number;
  prediction: number;
}

export const getMarketData = (propertyId?: number): MarketData => {
  // TODO: Replace with actual API call
  // const response = await api.get(`/ai/market-intelligence/${propertyId || ''}`);
  // return response.data;

  return {
    currentValue: 425000,
    predictedValue: {
      "1M": 428000,
      "3M": 435000,
      "6M": 448000,
      "1Y": 465000,
      "3Y": 520000,
    },
    confidence: 87,
    trend: "up",
    changePercent: 9.4,
  };
};

export const getMarketInsights = (): MarketInsight[] => {
  // TODO: Replace with actual API call
  // const response = await api.get('/ai/market-insights');
  // return response.data;

  return [
    {
      type: "opportunity",
      title: "Prime Buying Window",
      description: "AI predicts property values will increase 8-12% in next 6 months",
      impact: "high",
    },
    {
      type: "opportunity",
      title: "Development Boom",
      description: "3 major infrastructure projects announced within 2 miles",
      impact: "high",
    },
    {
      type: "neutral",
      title: "Interest Rate Stability",
      description: "Rates predicted to remain stable for next 90 days",
      impact: "medium",
    },
    {
      type: "risk",
      title: "Supply Increase",
      description: "15% more listings expected in this area next quarter",
      impact: "low",
    },
  ];
};

export const getPriceHistory = (): MarketTrend[] => {
  // TODO: Replace with actual API call
  // const response = await api.get('/ai/price-history');
  // return response.data;

  return [
    { period: "Jan", value: 385000, prediction: 385000 },
    { period: "Feb", value: 390000, prediction: 390000 },
    { period: "Mar", value: 395000, prediction: 395000 },
    { period: "Apr", value: 405000, prediction: 405000 },
    { period: "May", value: 415000, prediction: 415000 },
    { period: "Jun", value: 425000, prediction: 425000 },
    { period: "Jul", value: 0, prediction: 435000 },
    { period: "Aug", value: 0, prediction: 445000 },
    { period: "Sep", value: 0, prediction: 455000 },
    { period: "Oct", value: 0, prediction: 465000 },
    { period: "Nov", value: 0, prediction: 475000 },
    { period: "Dec", value: 0, prediction: 485000 },
  ];
};

// ==================== Conversational Property Discovery ====================

export interface ChatMessage {
  id: string;
  type: "user" | "ai" | "system";
  content: string;
  timestamp: Date;
  properties?: PropertyCard[];
  suggestions?: string[];
}

export interface PropertyCard {
  id: number;
  title: string;
  price: string;
  location: string;
  beds: number;
  baths: number;
  sqft: number;
  image: string;
  matchScore: number;
}

export const getAIChatResponse = async (userMessage: string): Promise<ChatMessage> => {
  // TODO: Replace with actual API call
  // const response = await api.post('/ai/chat', { message: userMessage });
  // return response.data;

  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1500));

  return {
    id: Date.now().toString(),
    type: "ai",
    content:
      "I found 3 properties that match your criteria perfectly! Here's what I discovered based on your preferences:",
    timestamp: new Date(),
    properties: getMockProperties(),
    suggestions: [
      "Tell me more about the first one",
      "What's the neighborhood like?",
      "Show me similar properties",
      "Schedule a viewing",
    ],
  };
};

export const getMockProperties = (): PropertyCard[] => {
  // TODO: Replace with actual property data from API
  return [
    {
      id: 1,
      title: "Modern Family Home",
      price: "$485,000",
      location: "Sunset District, CA",
      beds: 4,
      baths: 3,
      sqft: 2400,
      image: "/assets/hero-house.jpg",
      matchScore: 95,
    },
    {
      id: 2,
      title: "Contemporary Villa",
      price: "$525,000",
      location: "Marina Bay, CA",
      beds: 3,
      baths: 2.5,
      sqft: 2100,
      image: "/assets/hero-house.jpg",
      matchScore: 88,
    },
    {
      id: 3,
      title: "Cozy Cottage",
      price: "$425,000",
      location: "Green Valley, CA",
      beds: 3,
      baths: 2,
      sqft: 1800,
      image: "/assets/hero-house.jpg",
      matchScore: 82,
    },
  ];
};

// ==================== Quick Actions & Suggestions ====================

export const getQuickActions = () => {
  return [
    { query: "Show me family homes with 3+ bedrooms", icon: "Home" },
    { query: "Find modern condos in downtown area", icon: "Building2" },
    { query: "Properties under $500k", icon: "DollarSign" },
    { query: "Homes near good schools", icon: "GraduationCap" },
  ];
};

export const getInitialSuggestions = () => {
  return [
    "Find me a family home with a backyard",
    "Show me modern condos downtown",
    "Properties under $400k",
    "Houses near tech companies",
  ];
};

// ==================== API Integration Guide ====================

/*
INTEGRATION GUIDE:
------------------
1. PROPERTY DNA MATCHING:
   - Endpoint: POST /api/ai/property-dna/:propertyId
   - Response: DNAMatchData
   - Replace: getDNAMatchData() in PropertyDNAMatching.tsx
2. PREDICTIVE MARKET INTELLIGENCE:
   - Endpoint: GET /api/ai/market-data/:propertyId?
   - Response: MarketData
   - Replace: getMarketData() in PredictiveMarketIntelligence.tsx
   - Endpoint: GET /api/ai/market-insights
   - Response: MarketInsight[]
   - Replace: getMarketInsights()
   - Endpoint: GET /api/ai/price-history/:propertyId?
   - Response: MarketTrend[]
   - Replace: getPriceHistory()
3. CONVERSATIONAL PROPERTY DISCOVERY:
   - Endpoint: POST /api/ai/chat
   - Request Body: { message: string, userId?: number }
   - Response: ChatMessage
   - Replace: getAIChatResponse() in ConversationalPropertyDiscovery.tsx
EXAMPLE API INTEGRATION:
------------------------
import api from "@/api/axios";
export const getDNAMatchData = async (propertyId: number): Promise<DNAMatchData> => {
  const response = await api.post(`/ai/property-dna/${propertyId}`);
  return response.data;
};
export const getAIChatResponse = async (userMessage: string): Promise<ChatMessage> => {
  const response = await api.post('/ai/chat', {
    message: userMessage,
    userId: getCurrentUserId()
  });
  return response.data;
};
*/
