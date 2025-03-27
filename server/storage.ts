import { 
  Farmer, InsertFarmer, 
  Field, InsertField,
  WeatherData, InsertWeatherData,
  CropRecommendation, InsertCropRecommendation,
  FinancialAssistance, InsertFinancialAssistance,
  MarketData, InsertMarketData,
  ChatMessage, InsertChatMessage,
  Notification, InsertNotification
} from "@shared/schema";

export interface IStorage {
  // Farmer operations
  getFarmer(id: number): Promise<Farmer | undefined>;
  getFarmerByUsername(username: string): Promise<Farmer | undefined>;
  createFarmer(farmer: InsertFarmer): Promise<Farmer>;
  updateFarmer(id: number, farmer: Partial<Farmer>): Promise<Farmer | undefined>;
  
  // Field operations
  getField(id: number): Promise<Field | undefined>;
  getFieldsByFarmerId(farmerId: number): Promise<Field[]>;
  createField(field: InsertField): Promise<Field>;
  updateField(id: number, field: Partial<Field>): Promise<Field | undefined>;
  
  // Weather operations
  getWeatherByLocation(location: string): Promise<WeatherData | undefined>;
  createWeatherData(weatherData: InsertWeatherData): Promise<WeatherData>;
  
  // Crop recommendation operations
  getCropRecommendations(farmerId: number): Promise<CropRecommendation[]>;
  createCropRecommendation(recommendation: InsertCropRecommendation): Promise<CropRecommendation>;
  
  // Financial assistance operations
  getFinancialAssistance(): Promise<FinancialAssistance[]>;
  createFinancialAssistance(assistance: InsertFinancialAssistance): Promise<FinancialAssistance>;
  
  // Market data operations
  getMarketData(): Promise<MarketData[]>;
  createMarketData(marketData: InsertMarketData): Promise<MarketData>;
  
  // Chat message operations
  getChatMessagesByFarmerId(farmerId: number): Promise<ChatMessage[]>;
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  
  // Notification operations
  getNotifications(): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationAsRead(id: number): Promise<Notification | undefined>;
}

export class MemStorage implements IStorage {
  private farmers: Map<number, Farmer>;
  private fields: Map<number, Field>;
  private weather: Map<string, WeatherData>;
  private cropRecommendations: Map<number, CropRecommendation>;
  private financialAssistance: Map<number, FinancialAssistance>;
  private marketData: Map<number, MarketData>;
  private chatMessages: Map<number, ChatMessage>;
  private notifications: Map<number, Notification>;
  
  private farmerId: number;
  private fieldId: number;
  private cropRecommendationId: number;
  private financialAssistanceId: number;
  private marketDataId: number;
  private chatMessageId: number;
  private notificationId: number;

  constructor() {
    this.farmers = new Map();
    this.fields = new Map();
    this.weather = new Map();
    this.cropRecommendations = new Map();
    this.financialAssistance = new Map();
    this.marketData = new Map();
    this.chatMessages = new Map();
    this.notifications = new Map();
    
    this.farmerId = 1;
    this.fieldId = 1;
    this.cropRecommendationId = 1;
    this.financialAssistanceId = 1;
    this.marketDataId = 1;
    this.chatMessageId = 1;
    this.notificationId = 1;
    
    // Initialize with sample data
    this.initializeData();
  }

  private initializeData() {
    // Create a sample farmer
    const sampleFarmer: InsertFarmer = {
      username: "rajesh.kumar",
      password: "password123",
      fullName: "Rajesh Kumar",
      location: "Maharashtra",
      phoneNumber: "+91123456789",
      preferredLanguage: "english"
    };
    this.createFarmer(sampleFarmer);

    // Create sample field
    const sampleField: InsertField = {
      farmerId: 1,
      name: "North Field",
      size: 10,
      soilType: "Black Cotton Soil",
      location: "Nagpur, Maharashtra",
      currentCrop: "Wheat",
      cropVariety: "HD-2967",
      plantingDate: new Date(new Date().setDate(new Date().getDate() - 72))
    };
    this.createField(sampleField);

    // Create sample weather data
    const sampleWeather: InsertWeatherData = {
      location: "Nagpur, Maharashtra",
      date: new Date(),
      temperature: 32,
      condition: "Partly Cloudy",
      humidity: 65,
      windSpeed: 12,
      rainChance: 20,
      advisories: [
        "Light rain expected in the next 48 hours. Consider postponing pesticide application.",
        "High humidity levels may increase disease risk for wheat crops."
      ]
    };
    this.createWeatherData(sampleWeather);

    // Create sample crop recommendations
    const cropRec1: InsertCropRecommendation = {
      farmerId: 1,
      cropName: "Soybean",
      cropVariety: "Early Maturing Variety",
      suitabilityScore: 4,
      description: "High yield potential based on your soil type and current moisture levels. Recent satellite data shows optimal conditions for soybean in your region.",
      daysToMaturity: 90,
      eNamPrice: 4500,
      priceTrend: 8,
      marketDemand: "High"
    };
    
    const cropRec2: InsertCropRecommendation = {
      farmerId: 1,
      cropName: "Cotton",
      cropVariety: "BT Variety",
      suitabilityScore: 3,
      description: "Moderately suitable for your soil. Higher water requirements may be challenging with current rainfall projections. Government subsidy available for BT cotton seeds.",
      daysToMaturity: 170,
      eNamPrice: 6200,
      priceTrend: 12,
      marketDemand: "Very High"
    };
    
    this.createCropRecommendation(cropRec1);
    this.createCropRecommendation(cropRec2);

    // Create sample financial assistance options
    const option1: InsertFinancialAssistance = {
      name: "Kisan Credit Card",
      type: "Loan",
      description: "You qualify for a crop loan up to ₹3,00,000 at 4% interest rate.",
      amount: 300000,
      interestRate: 4,
      eligibilityDetails: "All farmers with land holding",
      processingTime: "7-10 days",
      status: "Active"
    };
    
    const option2: InsertFinancialAssistance = {
      name: "PM-KISAN Installment",
      type: "Subsidy",
      description: "Next installment of ₹2,000 under PM-KISAN scheduled for May 2023.",
      amount: 2000,
      eligibilityDetails: "All eligible farmers under PM-KISAN scheme",
      status: "Active"
    };
    
    const option3: InsertFinancialAssistance = {
      name: "Subsidy for Drip Irrigation",
      type: "Subsidy",
      description: "Government is offering 55% subsidy on drip irrigation installation.",
      amount: 0, // Variable amount
      eligibilityDetails: "All farmers",
      status: "New Scheme"
    };
    
    this.createFinancialAssistance(option1);
    this.createFinancialAssistance(option2);
    this.createFinancialAssistance(option3);

    // Create sample market data
    const market1: InsertMarketData = {
      commodity: "Wheat",
      grade: "A",
      market: "Nagpur e-NAM",
      state: "Maharashtra",
      currentPrice: 2200,
      msp: 2015,
      priceChange: 4.5,
      demand: "High",
      demandPercentage: 75
    };
    
    const market2: InsertMarketData = {
      commodity: "Soybean",
      grade: "A",
      market: "Nagpur e-NAM",
      state: "Maharashtra",
      currentPrice: 4500,
      msp: 4300,
      priceChange: 8.0,
      demand: "Very High",
      demandPercentage: 90
    };
    
    const market3: InsertMarketData = {
      commodity: "Cotton",
      grade: "B",
      market: "Nagpur e-NAM",
      state: "Maharashtra",
      currentPrice: 6200,
      msp: 6080,
      priceChange: 12.0,
      demand: "High",
      demandPercentage: 85
    };
    
    this.createMarketData(market1);
    this.createMarketData(market2);
    this.createMarketData(market3);

    // Create sample chat messages
    const message1: InsertChatMessage = {
      farmerId: 1,
      sender: "ai",
      message: "Hello! I'm your AgriAI assistant. How can I help with your farming today?"
    };
    
    const message2: InsertChatMessage = {
      farmerId: 1,
      sender: "user",
      message: "What is the best time to harvest my wheat crop?"
    };
    
    const message3: InsertChatMessage = {
      farmerId: 1,
      sender: "ai",
      message: "Based on your wheat variety (HD-2967) and current growth stage (flowering - 70%), you should plan to harvest in approximately 30-35 days. The ideal time is when grain moisture content reaches 25-30%. I can send you a notification when your crop approaches the ideal harvesting time based on weather and satellite data."
    };
    
    this.createChatMessage(message1);
    this.createChatMessage(message2);
    this.createChatMessage(message3);

    // Create sample notifications
    const notification1: InsertNotification = {
      title: "Kisan Credit Card application deadline extended",
      description: "Kisan Credit Card application deadline extended to May 15th.",
      type: "urgent"
    };
    
    const notification2: InsertNotification = {
      title: "AgriMela farmers' training event",
      description: "AgriMela farmers' training event on June 2nd in Nagpur district.",
      type: "event"
    };
    
    const notification3: InsertNotification = {
      title: "Cotton MSP increased",
      description: "Cotton MSP increased by 5% for the upcoming season.",
      type: "info"
    };
    
    this.createNotification(notification1);
    this.createNotification(notification2);
    this.createNotification(notification3);
  }

  // Farmer operations
  async getFarmer(id: number): Promise<Farmer | undefined> {
    return this.farmers.get(id);
  }

  async getFarmerByUsername(username: string): Promise<Farmer | undefined> {
    return Array.from(this.farmers.values()).find(
      (farmer) => farmer.username === username
    );
  }

  async createFarmer(farmer: InsertFarmer): Promise<Farmer> {
    const id = this.farmerId++;
    const newFarmer: Farmer = { ...farmer, id, createdAt: new Date() };
    this.farmers.set(id, newFarmer);
    return newFarmer;
  }

  async updateFarmer(id: number, farmerData: Partial<Farmer>): Promise<Farmer | undefined> {
    const farmer = this.farmers.get(id);
    if (!farmer) return undefined;
    
    const updatedFarmer = { ...farmer, ...farmerData };
    this.farmers.set(id, updatedFarmer);
    return updatedFarmer;
  }

  // Field operations
  async getField(id: number): Promise<Field | undefined> {
    return this.fields.get(id);
  }

  async getFieldsByFarmerId(farmerId: number): Promise<Field[]> {
    return Array.from(this.fields.values()).filter(
      (field) => field.farmerId === farmerId
    );
  }

  async createField(field: InsertField): Promise<Field> {
    const id = this.fieldId++;
    const newField: Field = { 
      ...field, 
      id, 
      currentGrowthStage: field.plantingDate ? "Flowering" : "",
      growthPercentage: 70,
      healthStatus: "Good Condition",
      irrigationStatus: "Adequate moisture levels",
      lastIrrigationDate: new Date(new Date().setDate(new Date().getDate() - 3))
    };
    this.fields.set(id, newField);
    return newField;
  }

  async updateField(id: number, fieldData: Partial<Field>): Promise<Field | undefined> {
    const field = this.fields.get(id);
    if (!field) return undefined;
    
    const updatedField = { ...field, ...fieldData };
    this.fields.set(id, updatedField);
    return updatedField;
  }

  // Weather operations
  async getWeatherByLocation(location: string): Promise<WeatherData | undefined> {
    return this.weather.get(location);
  }

  async createWeatherData(weatherData: InsertWeatherData): Promise<WeatherData> {
    const newWeatherData: WeatherData = { ...weatherData, id: 1 };
    this.weather.set(weatherData.location, newWeatherData);
    return newWeatherData;
  }

  // Crop recommendation operations
  async getCropRecommendations(farmerId: number): Promise<CropRecommendation[]> {
    return Array.from(this.cropRecommendations.values()).filter(
      (recommendation) => recommendation.farmerId === farmerId
    );
  }

  async createCropRecommendation(recommendation: InsertCropRecommendation): Promise<CropRecommendation> {
    const id = this.cropRecommendationId++;
    const newRecommendation: CropRecommendation = { ...recommendation, id };
    this.cropRecommendations.set(id, newRecommendation);
    return newRecommendation;
  }

  // Financial assistance operations
  async getFinancialAssistance(): Promise<FinancialAssistance[]> {
    return Array.from(this.financialAssistance.values());
  }

  async createFinancialAssistance(assistance: InsertFinancialAssistance): Promise<FinancialAssistance> {
    const id = this.financialAssistanceId++;
    const newAssistance: FinancialAssistance = { ...assistance, id };
    this.financialAssistance.set(id, newAssistance);
    return newAssistance;
  }

  // Market data operations
  async getMarketData(): Promise<MarketData[]> {
    return Array.from(this.marketData.values());
  }

  async createMarketData(data: InsertMarketData): Promise<MarketData> {
    const id = this.marketDataId++;
    const newMarketData: MarketData = { ...data, id };
    this.marketData.set(id, newMarketData);
    return newMarketData;
  }

  // Chat message operations
  async getChatMessagesByFarmerId(farmerId: number): Promise<ChatMessage[]> {
    return Array.from(this.chatMessages.values())
      .filter((message) => message.farmerId === farmerId)
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }

  async createChatMessage(message: InsertChatMessage): Promise<ChatMessage> {
    const id = this.chatMessageId++;
    const newMessage: ChatMessage = { ...message, id, timestamp: new Date() };
    this.chatMessages.set(id, newMessage);
    return newMessage;
  }

  // Notification operations
  async getNotifications(): Promise<Notification[]> {
    return Array.from(this.notifications.values()).sort(
      (a, b) => b.date.getTime() - a.date.getTime()
    );
  }

  async createNotification(notification: InsertNotification): Promise<Notification> {
    const id = this.notificationId++;
    const newNotification: Notification = { 
      ...notification, 
      id, 
      date: new Date(),
      isRead: false
    };
    this.notifications.set(id, newNotification);
    return newNotification;
  }

  async markNotificationAsRead(id: number): Promise<Notification | undefined> {
    const notification = this.notifications.get(id);
    if (!notification) return undefined;
    
    const updatedNotification = { ...notification, isRead: true };
    this.notifications.set(id, updatedNotification);
    return updatedNotification;
  }
}

export const storage = new MemStorage();
