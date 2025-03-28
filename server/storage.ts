import { 
  Farmer, InsertFarmer, 
  Field, InsertField,
  WeatherData, InsertWeatherData,
  CropRecommendation, InsertCropRecommendation,
  FinancialAssistance, InsertFinancialAssistance,
  MarketData, InsertMarketData,
  ChatMessage, InsertChatMessage,
  Notification, InsertNotification,
  IrrigationSystem, InsertIrrigationSystem,
  IrrigationSchedule, InsertIrrigationSchedule,
  IrrigationHistory, InsertIrrigationHistory,
  Buyer, InsertBuyer,
  CropListing, InsertCropListing,
  PurchaseRequest, InsertPurchaseRequest
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
  
  // Irrigation operations
  getIrrigationSystemsByFieldId(fieldId: number): Promise<IrrigationSystem[]>;
  getIrrigationSystem(id: number): Promise<IrrigationSystem | undefined>;
  createIrrigationSystem(system: InsertIrrigationSystem): Promise<IrrigationSystem>;
  updateIrrigationSystem(id: number, system: Partial<IrrigationSystem>): Promise<IrrigationSystem | undefined>;
  deleteIrrigationSystem(id: number): Promise<void>;
  
  // Irrigation schedule operations
  getIrrigationSchedules(systemId: number): Promise<IrrigationSchedule[]>;
  getIrrigationSchedule(id: number): Promise<IrrigationSchedule | undefined>;
  createIrrigationSchedule(schedule: InsertIrrigationSchedule): Promise<IrrigationSchedule>;
  updateIrrigationSchedule(id: number, schedule: Partial<IrrigationSchedule>): Promise<IrrigationSchedule | undefined>;
  deleteIrrigationSchedule(id: number): Promise<void>;
  
  // Irrigation history operations
  getIrrigationHistory(fieldId: number): Promise<IrrigationHistory[]>;
  getIrrigationHistoryById(id: number): Promise<IrrigationHistory | undefined>;
  createIrrigationHistory(history: InsertIrrigationHistory): Promise<IrrigationHistory>;
  
  // Buyer operations
  getBuyer(id: number): Promise<Buyer | undefined>;
  getBuyerByUsername(username: string): Promise<Buyer | undefined>;
  createBuyer(buyer: InsertBuyer): Promise<Buyer>;
  updateBuyer(id: number, buyer: Partial<Buyer>): Promise<Buyer | undefined>;
  
  // Crop Listing operations
  getCropListings(): Promise<CropListing[]>;
  getCropListingsByFarmerId(farmerId: number): Promise<CropListing[]>;
  getCropListing(id: number): Promise<CropListing | undefined>;
  createCropListing(listing: InsertCropListing): Promise<CropListing>;
  updateCropListing(id: number, listing: Partial<CropListing>): Promise<CropListing | undefined>;
  deleteCropListing(id: number): Promise<void>;
  
  // Purchase Request operations
  getPurchaseRequests(): Promise<PurchaseRequest[]>;
  getPurchaseRequestsByBuyerId(buyerId: number): Promise<PurchaseRequest[]>;
  getPurchaseRequestsByFarmerId(farmerId: number): Promise<PurchaseRequest[]>;
  getPurchaseRequest(id: number): Promise<PurchaseRequest | undefined>;
  createPurchaseRequest(request: InsertPurchaseRequest): Promise<PurchaseRequest>;
  updatePurchaseRequest(id: number, request: Partial<PurchaseRequest>): Promise<PurchaseRequest | undefined>;
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
  private irrigationSystems: Map<number, IrrigationSystem>;
  private irrigationSchedules: Map<number, IrrigationSchedule>;
  private irrigationHistory: Map<number, IrrigationHistory>;
  private buyers: Map<number, Buyer>;
  private cropListings: Map<number, CropListing>;
  private purchaseRequests: Map<number, PurchaseRequest>;
  
  private farmerId: number;
  private fieldId: number;
  private cropRecommendationId: number;
  private financialAssistanceId: number;
  private marketDataId: number;
  private chatMessageId: number;
  private notificationId: number;
  private irrigationSystemId: number;
  private irrigationScheduleId: number;
  private irrigationHistoryId: number;
  private buyerId: number;
  private cropListingId: number;
  private purchaseRequestId: number;

  constructor() {
    this.farmers = new Map();
    this.fields = new Map();
    this.weather = new Map();
    this.cropRecommendations = new Map();
    this.financialAssistance = new Map();
    this.marketData = new Map();
    this.chatMessages = new Map();
    this.notifications = new Map();
    this.irrigationSystems = new Map();
    this.irrigationSchedules = new Map();
    this.irrigationHistory = new Map();
    this.buyers = new Map();
    this.cropListings = new Map();
    this.purchaseRequests = new Map();
    
    this.farmerId = 1;
    this.fieldId = 1;
    this.cropRecommendationId = 1;
    this.financialAssistanceId = 1;
    this.marketDataId = 1;
    this.chatMessageId = 1;
    this.notificationId = 1;
    this.irrigationSystemId = 1;
    this.irrigationScheduleId = 1;
    this.irrigationHistoryId = 1;
    this.buyerId = 1;
    this.cropListingId = 1;
    this.purchaseRequestId = 1;
    
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
    
    // Create sample buyer
    const sampleBuyer: InsertBuyer = {
      username: "rajesh.agro",
      password: "password123",
      fullName: "Rajesh Agrawal",
      location: "Pune, Maharashtra",
      phoneNumber: "+91987654321",
      email: "rajesh@agrobuyers.com",
      companyName: "Agrawal AgroBuyers Ltd.",
      businessType: "Wholesale",
      preferredLanguage: "english"
    };
    this.createBuyer(sampleBuyer);
    
    // Create sample crop listing
    const sampleListing: InsertCropListing = {
      farmerId: 1,
      cropName: "Wheat",
      cropVariety: "HD-2967",
      quantity: 5000,
      unit: "kg",
      pricePerUnit: 2200,
      harvestDate: new Date(new Date().setDate(new Date().getDate() - 15)),
      description: "Premium quality wheat harvested from pesticide-free field. Well dried and ready for immediate purchase.",
      location: "Nagpur, Maharashtra",
      images: ["/images/wheat-sample.jpg"],
      availableFrom: new Date(),
      availableUntil: new Date(new Date().setDate(new Date().getDate() + 30)),
      organicCertified: true,
      deliveryOptions: ["pickup", "delivery_within_50km"]
    };
    this.createCropListing(sampleListing);
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

  // Irrigation operations
  async getIrrigationSystemsByFieldId(fieldId: number): Promise<IrrigationSystem[]> {
    return Array.from(this.irrigationSystems.values()).filter(
      (system) => system.fieldId === fieldId
    );
  }

  async getIrrigationSystem(id: number): Promise<IrrigationSystem | undefined> {
    return this.irrigationSystems.get(id);
  }

  async createIrrigationSystem(system: InsertIrrigationSystem): Promise<IrrigationSystem> {
    const id = this.irrigationSystemId++;
    const newSystem: IrrigationSystem = { 
      ...system, 
      id,
      installationDate: system.installationDate || new Date(),
      lastMaintenanceDate: system.lastMaintenanceDate || new Date(new Date().setMonth(new Date().getMonth() - 2)),
      nextMaintenanceDate: system.nextMaintenanceDate || new Date(new Date().setMonth(new Date().getMonth() + 4)),
      sensorData: system.sensorData || {
        moisture: 65,
        temperature: 28,
        humidity: 70,
        batteryLevel: 92
      }
    };
    this.irrigationSystems.set(id, newSystem);
    return newSystem;
  }

  async updateIrrigationSystem(id: number, system: Partial<IrrigationSystem>): Promise<IrrigationSystem | undefined> {
    const existingSystem = this.irrigationSystems.get(id);
    if (!existingSystem) return undefined;
    
    const updatedSystem = { ...existingSystem, ...system };
    this.irrigationSystems.set(id, updatedSystem);
    return updatedSystem;
  }

  async deleteIrrigationSystem(id: number): Promise<void> {
    this.irrigationSystems.delete(id);
  }

  // Irrigation schedule operations
  async getIrrigationSchedules(systemId: number): Promise<IrrigationSchedule[]> {
    return Array.from(this.irrigationSchedules.values()).filter(
      (schedule) => schedule.systemId === systemId
    );
  }

  async getIrrigationSchedule(id: number): Promise<IrrigationSchedule | undefined> {
    return this.irrigationSchedules.get(id);
  }

  async createIrrigationSchedule(schedule: InsertIrrigationSchedule): Promise<IrrigationSchedule> {
    const id = this.irrigationScheduleId++;
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const newSchedule: IrrigationSchedule = {
      ...schedule,
      id,
      createdAt: new Date(),
      lastRunTime: schedule.lastRunTime || null,
      nextRunTime: schedule.nextRunTime || tomorrow
    };
    this.irrigationSchedules.set(id, newSchedule);
    return newSchedule;
  }

  async updateIrrigationSchedule(id: number, schedule: Partial<IrrigationSchedule>): Promise<IrrigationSchedule | undefined> {
    const existingSchedule = this.irrigationSchedules.get(id);
    if (!existingSchedule) return undefined;
    
    const updatedSchedule = { ...existingSchedule, ...schedule };
    this.irrigationSchedules.set(id, updatedSchedule);
    return updatedSchedule;
  }

  async deleteIrrigationSchedule(id: number): Promise<void> {
    this.irrigationSchedules.delete(id);
  }

  // Irrigation history operations
  async getIrrigationHistory(fieldId: number): Promise<IrrigationHistory[]> {
    return Array.from(this.irrigationHistory.values())
      .filter((history) => history.fieldId === fieldId)
      .sort((a, b) => b.startTime.getTime() - a.startTime.getTime());
  }

  async getIrrigationHistoryById(id: number): Promise<IrrigationHistory | undefined> {
    return this.irrigationHistory.get(id);
  }

  async createIrrigationHistory(history: InsertIrrigationHistory): Promise<IrrigationHistory> {
    const id = this.irrigationHistoryId++;
    const endTime = history.endTime || new Date(new Date(history.startTime).getTime() + history.duration * 60000);
    
    const newHistory: IrrigationHistory = {
      ...history,
      id,
      endTime,
      status: history.status || "Completed",
      weatherConditions: history.weatherConditions || {
        temperature: 30,
        humidity: 65,
        precipitation: 0,
        windSpeed: 8
      }
    };
    this.irrigationHistory.set(id, newHistory);
    return newHistory;
  }

  // Buyer operations
  async getBuyer(id: number): Promise<Buyer | undefined> {
    return this.buyers.get(id);
  }

  async getBuyerByUsername(username: string): Promise<Buyer | undefined> {
    return Array.from(this.buyers.values()).find(
      (buyer) => buyer.username === username
    );
  }

  async createBuyer(buyer: InsertBuyer): Promise<Buyer> {
    const id = this.buyerId++;
    const newBuyer: Buyer = { 
      ...buyer, 
      id, 
      createdAt: new Date(), 
      verificationStatus: "pending"
    };
    this.buyers.set(id, newBuyer);
    return newBuyer;
  }

  async updateBuyer(id: number, buyerData: Partial<Buyer>): Promise<Buyer | undefined> {
    const buyer = this.buyers.get(id);
    if (!buyer) return undefined;
    
    const updatedBuyer = { ...buyer, ...buyerData };
    this.buyers.set(id, updatedBuyer);
    return updatedBuyer;
  }

  // Crop Listing operations
  async getCropListings(): Promise<CropListing[]> {
    return Array.from(this.cropListings.values())
      .filter(listing => listing.status === "available")
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getCropListingsByFarmerId(farmerId: number): Promise<CropListing[]> {
    return Array.from(this.cropListings.values())
      .filter(listing => listing.farmerId === farmerId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getCropListing(id: number): Promise<CropListing | undefined> {
    return this.cropListings.get(id);
  }

  async createCropListing(listing: InsertCropListing): Promise<CropListing> {
    const id = this.cropListingId++;
    const now = new Date();
    
    const newListing: CropListing = {
      ...listing,
      id,
      status: "available",
      createdAt: now,
      updatedAt: now,
      images: listing.images || []
    };
    
    this.cropListings.set(id, newListing);
    return newListing;
  }

  async updateCropListing(id: number, listingData: Partial<CropListing>): Promise<CropListing | undefined> {
    const listing = this.cropListings.get(id);
    if (!listing) return undefined;
    
    const updatedListing = {
      ...listing,
      ...listingData,
      updatedAt: new Date()
    };
    
    this.cropListings.set(id, updatedListing);
    return updatedListing;
  }

  async deleteCropListing(id: number): Promise<void> {
    this.cropListings.delete(id);
  }

  // Purchase Request operations
  async getPurchaseRequests(): Promise<PurchaseRequest[]> {
    return Array.from(this.purchaseRequests.values())
      .sort((a, b) => b.requestDate.getTime() - a.requestDate.getTime());
  }

  async getPurchaseRequestsByBuyerId(buyerId: number): Promise<PurchaseRequest[]> {
    return Array.from(this.purchaseRequests.values())
      .filter(request => request.buyerId === buyerId)
      .sort((a, b) => b.requestDate.getTime() - a.requestDate.getTime());
  }

  async getPurchaseRequestsByFarmerId(farmerId: number): Promise<PurchaseRequest[]> {
    return Array.from(this.purchaseRequests.values())
      .filter(request => request.farmerId === farmerId)
      .sort((a, b) => b.requestDate.getTime() - a.requestDate.getTime());
  }

  async getPurchaseRequest(id: number): Promise<PurchaseRequest | undefined> {
    return this.purchaseRequests.get(id);
  }

  async createPurchaseRequest(request: InsertPurchaseRequest): Promise<PurchaseRequest> {
    const id = this.purchaseRequestId++;
    
    const newRequest: PurchaseRequest = {
      ...request,
      id,
      status: "pending",
      requestDate: new Date(),
      responseDate: null,
      completedDate: null,
      paymentStatus: "pending"
    };
    
    this.purchaseRequests.set(id, newRequest);
    
    // Update the listing status to "pending_sale" if it exists
    const listing = this.cropListings.get(request.listingId);
    if (listing) {
      listing.status = "pending_sale";
      this.cropListings.set(listing.id, listing);
    }
    
    return newRequest;
  }

  async updatePurchaseRequest(id: number, requestData: Partial<PurchaseRequest>): Promise<PurchaseRequest | undefined> {
    const request = this.purchaseRequests.get(id);
    if (!request) return undefined;
    
    const updatedRequest = { ...request, ...requestData };
    
    // If the status is being updated to "completed", update the listing status to "sold"
    if (requestData.status === "completed" && request.status !== "completed") {
      updatedRequest.completedDate = new Date();
      
      const listing = this.cropListings.get(request.listingId);
      if (listing) {
        listing.status = "sold";
        this.cropListings.set(listing.id, listing);
      }
    }
    
    // If the status is being updated to "accepted" or "rejected", update the response date
    if ((requestData.status === "accepted" || requestData.status === "rejected") 
        && (request.status !== "accepted" && request.status !== "rejected")) {
      updatedRequest.responseDate = new Date();
    }
    
    this.purchaseRequests.set(id, updatedRequest);
    return updatedRequest;
  }
}

// Import the PostgreSQL storage implementation
import { PostgresStorage } from './db/storage';
import { checkDatabaseConnection } from './db/index';

// Create both storage options
const memStorage = new MemStorage();
const pgStorage = new PostgresStorage();

// Determine which storage to use based on database availability
let activeStorage: IStorage = memStorage;

// Try to use PostgreSQL storage if database is available
(async function initializeStorage() {
  try {
    const dbStatus = await checkDatabaseConnection();
    if (dbStatus.success) {
      console.log('Using PostgreSQL storage');
      activeStorage = pgStorage;
    } else {
      console.log('Database connection failed, using in-memory storage');
    }
  } catch (error) {
    console.error('Storage initialization error, using in-memory storage', error);
  }
})();

export const storage: IStorage = {
  // Proxy that forwards calls to the active storage implementation
  getFarmer: (...args) => activeStorage.getFarmer(...args),
  getFarmerByUsername: (...args) => activeStorage.getFarmerByUsername(...args),
  createFarmer: (...args) => activeStorage.createFarmer(...args),
  updateFarmer: (...args) => activeStorage.updateFarmer(...args),
  
  getField: (...args) => activeStorage.getField(...args),
  getFieldsByFarmerId: (...args) => activeStorage.getFieldsByFarmerId(...args),
  createField: (...args) => activeStorage.createField(...args),
  updateField: (...args) => activeStorage.updateField(...args),
  
  getWeatherByLocation: (...args) => activeStorage.getWeatherByLocation(...args),
  createWeatherData: (...args) => activeStorage.createWeatherData(...args),
  
  getCropRecommendations: (...args) => activeStorage.getCropRecommendations(...args),
  createCropRecommendation: (...args) => activeStorage.createCropRecommendation(...args),
  
  getFinancialAssistance: (...args) => activeStorage.getFinancialAssistance(...args),
  createFinancialAssistance: (...args) => activeStorage.createFinancialAssistance(...args),
  
  getMarketData: (...args) => activeStorage.getMarketData(...args),
  createMarketData: (...args) => activeStorage.createMarketData(...args),
  
  getChatMessagesByFarmerId: (...args) => activeStorage.getChatMessagesByFarmerId(...args),
  createChatMessage: (...args) => activeStorage.createChatMessage(...args),
  
  getNotifications: (...args) => activeStorage.getNotifications(...args),
  createNotification: (...args) => activeStorage.createNotification(...args),
  markNotificationAsRead: (...args) => activeStorage.markNotificationAsRead(...args),
  
  // Irrigation operations - always use memory storage for these features
  getIrrigationSystemsByFieldId: (...args) => memStorage.getIrrigationSystemsByFieldId(...args),
  getIrrigationSystem: (...args) => memStorage.getIrrigationSystem(...args),
  createIrrigationSystem: (...args) => memStorage.createIrrigationSystem(...args),
  updateIrrigationSystem: (...args) => memStorage.updateIrrigationSystem(...args),
  deleteIrrigationSystem: (...args) => memStorage.deleteIrrigationSystem(...args),
  
  // Irrigation schedule operations - always use memory storage for these features
  getIrrigationSchedules: (...args) => memStorage.getIrrigationSchedules(...args),
  getIrrigationSchedule: (...args) => memStorage.getIrrigationSchedule(...args),
  createIrrigationSchedule: (...args) => memStorage.createIrrigationSchedule(...args),
  updateIrrigationSchedule: (...args) => memStorage.updateIrrigationSchedule(...args),
  deleteIrrigationSchedule: (...args) => memStorage.deleteIrrigationSchedule(...args),
  
  // Irrigation history operations - always use memory storage for these features
  getIrrigationHistory: (...args) => memStorage.getIrrigationHistory(...args),
  getIrrigationHistoryById: (...args) => memStorage.getIrrigationHistoryById(...args),
  createIrrigationHistory: (...args) => memStorage.createIrrigationHistory(...args),
  
  // Buyer operations
  getBuyer: (...args) => memStorage.getBuyer(...args),
  getBuyerByUsername: (...args) => memStorage.getBuyerByUsername(...args),
  createBuyer: (...args) => memStorage.createBuyer(...args),
  updateBuyer: (...args) => memStorage.updateBuyer(...args),
  
  // Crop Listing operations
  getCropListings: (...args) => memStorage.getCropListings(...args),
  getCropListingsByFarmerId: (...args) => memStorage.getCropListingsByFarmerId(...args),
  getCropListing: (...args) => memStorage.getCropListing(...args),
  createCropListing: (...args) => memStorage.createCropListing(...args),
  updateCropListing: (...args) => memStorage.updateCropListing(...args),
  deleteCropListing: (...args) => memStorage.deleteCropListing(...args),
  
  // Purchase Request operations
  getPurchaseRequests: (...args) => memStorage.getPurchaseRequests(...args),
  getPurchaseRequestsByBuyerId: (...args) => memStorage.getPurchaseRequestsByBuyerId(...args),
  getPurchaseRequestsByFarmerId: (...args) => memStorage.getPurchaseRequestsByFarmerId(...args),
  getPurchaseRequest: (...args) => memStorage.getPurchaseRequest(...args),
  createPurchaseRequest: (...args) => memStorage.createPurchaseRequest(...args),
  updatePurchaseRequest: (...args) => memStorage.updatePurchaseRequest(...args),
};
