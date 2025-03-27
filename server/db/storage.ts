import { eq } from 'drizzle-orm';
import { db } from './index';
import {
  IStorage,
  Farmer, InsertFarmer,
  Field, InsertField,
  WeatherData, InsertWeatherData,
  CropRecommendation, InsertCropRecommendation,
  FinancialAssistance, InsertFinancialAssistance,
  MarketData, InsertMarketData,
  ChatMessage, InsertChatMessage,
  Notification, InsertNotification,
  farmers, fields, weatherData, cropRecommendations,
  financialAssistance, marketData, chatMessages, notifications
} from '@shared/schema';

// Helper function to safely handle database operations if db is null
function safeDbOperation<T>(operation: () => Promise<T>, fallback: T): Promise<T> {
  if (!db) {
    console.error('Database not available');
    return Promise.resolve(fallback);
  }
  return operation();
}

export class PostgresStorage implements IStorage {
  // Farmer operations
  async getFarmer(id: number): Promise<Farmer | undefined> {
    return safeDbOperation(async () => {
      const result = await db!.select().from(farmers).where(eq(farmers.id, id)).limit(1);
      return result[0];
    }, undefined);
  }

  async getFarmerByUsername(username: string): Promise<Farmer | undefined> {
    return safeDbOperation(async () => {
      const result = await db!.select().from(farmers).where(eq(farmers.username, username)).limit(1);
      return result[0];
    }, undefined);
  }

  async createFarmer(farmer: InsertFarmer): Promise<Farmer> {
    return safeDbOperation(async () => {
      const result = await db!.insert(farmers).values(farmer).returning();
      return result[0];
    }, {
      id: 0,
      username: '',
      password: '',
      fullName: '',
      location: '',
      phoneNumber: '',
      preferredLanguage: null,
      createdAt: new Date()
    } as Farmer);
  }

  async updateFarmer(id: number, farmer: Partial<Farmer>): Promise<Farmer | undefined> {
    return safeDbOperation(async () => {
      const result = await db!.update(farmers).set(farmer).where(eq(farmers.id, id)).returning();
      return result[0];
    }, undefined);
  }

  // Field operations
  async getField(id: number): Promise<Field | undefined> {
    return safeDbOperation(async () => {
      const result = await db!.select().from(fields).where(eq(fields.id, id)).limit(1);
      return result[0];
    }, undefined);
  }

  async getFieldsByFarmerId(farmerId: number): Promise<Field[]> {
    return safeDbOperation(async () => {
      return await db!.select().from(fields).where(eq(fields.farmerId, farmerId));
    }, []);
  }

  async createField(field: InsertField): Promise<Field> {
    return safeDbOperation(async () => {
      const result = await db!.insert(fields).values(field).returning();
      return result[0];
    }, {
      id: 0,
      farmerId: 0,
      name: '',
      size: 0,
      soilType: '',
      location: '',
      currentCrop: null,
      cropVariety: null,
      plantingDate: null,
      currentGrowthStage: null,
      growthPercentage: null,
      healthStatus: null,
      irrigationStatus: null,
      lastIrrigationDate: null
    } as Field);
  }

  async updateField(id: number, field: Partial<Field>): Promise<Field | undefined> {
    return safeDbOperation(async () => {
      const result = await db!.update(fields).set(field).where(eq(fields.id, id)).returning();
      return result[0];
    }, undefined);
  }

  // Weather operations
  async getWeatherByLocation(location: string): Promise<WeatherData | undefined> {
    return safeDbOperation(async () => {
      const result = await db!.select().from(weatherData).where(eq(weatherData.location, location)).limit(1);
      return result[0];
    }, undefined);
  }

  async createWeatherData(data: InsertWeatherData): Promise<WeatherData> {
    return safeDbOperation(async () => {
      const result = await db!.insert(weatherData).values({
        ...data,
        advisories: (data.advisories as string[]) || null
      }).returning();
      return result[0];
    }, {
      id: 0,
      date: new Date(),
      location: '',
      temperature: 0,
      condition: '',
      humidity: 0,
      windSpeed: 0,
      rainChance: 0,
      advisories: null
    } as WeatherData);
  }

  // Crop recommendation operations
  async getCropRecommendations(farmerId: number): Promise<CropRecommendation[]> {
    return safeDbOperation(async () => {
      return await db!.select()
        .from(cropRecommendations)
        .where(eq(cropRecommendations.farmerId, farmerId));
    }, []);
  }

  async createCropRecommendation(recommendation: InsertCropRecommendation): Promise<CropRecommendation> {
    return safeDbOperation(async () => {
      const result = await db!.insert(cropRecommendations).values(recommendation).returning();
      return result[0];
    }, {
      id: 0,
      farmerId: 0,
      cropName: '',
      cropVariety: '',
      suitabilityScore: 0,
      description: '',
      daysToMaturity: 0,
      eNamPrice: 0,
      priceTrend: 0,
      marketDemand: ''
    } as CropRecommendation);
  }

  // Financial assistance operations
  async getFinancialAssistance(): Promise<FinancialAssistance[]> {
    return safeDbOperation(async () => {
      return await db!.select().from(financialAssistance);
    }, []);
  }

  async createFinancialAssistance(assistance: InsertFinancialAssistance): Promise<FinancialAssistance> {
    return safeDbOperation(async () => {
      const result = await db!.insert(financialAssistance).values(assistance).returning();
      return result[0];
    }, {
      id: 0,
      name: '',
      type: '',
      description: '',
      amount: 0,
      interestRate: null,
      eligibilityDetails: '',
      processingTime: null,
      status: ''
    } as FinancialAssistance);
  }

  // Market data operations
  async getMarketData(): Promise<MarketData[]> {
    return safeDbOperation(async () => {
      return await db!.select().from(marketData);
    }, []);
  }

  async createMarketData(data: InsertMarketData): Promise<MarketData> {
    return safeDbOperation(async () => {
      const result = await db!.insert(marketData).values(data).returning();
      return result[0];
    }, {
      id: 0,
      commodity: '',
      grade: '',
      market: '',
      state: '',
      currentPrice: 0,
      msp: 0,
      priceChange: 0,
      demand: '',
      demandPercentage: 0
    } as MarketData);
  }

  // Chat message operations
  async getChatMessagesByFarmerId(farmerId: number): Promise<ChatMessage[]> {
    return safeDbOperation(async () => {
      return await db!.select()
        .from(chatMessages)
        .where(eq(chatMessages.farmerId, farmerId))
        .orderBy(chatMessages.timestamp);
    }, []);
  }

  async createChatMessage(message: InsertChatMessage): Promise<ChatMessage> {
    return safeDbOperation(async () => {
      const result = await db!.insert(chatMessages)
        .values({
          farmerId: message.farmerId,
          sender: message.sender,
          message: message.message
        })
        .returning();
      return result[0];
    }, {
      id: 0,
      farmerId: 0,
      sender: '',
      message: '',
      timestamp: new Date()
    } as ChatMessage);
  }

  // Notification operations
  async getNotifications(): Promise<Notification[]> {
    return safeDbOperation(async () => {
      return await db!.select().from(notifications);
    }, []);
  }

  async createNotification(notification: InsertNotification): Promise<Notification> {
    return safeDbOperation(async () => {
      const result = await db!.insert(notifications)
        .values({
          title: notification.title,
          description: notification.description,
          type: notification.type,
          date: new Date(),
          isRead: false
        })
        .returning();
      return result[0];
    }, {
      id: 0,
      title: '',
      description: '',
      type: '',
      date: new Date(),
      isRead: false
    } as Notification);
  }

  async markNotificationAsRead(id: number): Promise<Notification | undefined> {
    return safeDbOperation(async () => {
      const result = await db!.update(notifications)
        .set({ isRead: true })
        .where(eq(notifications.id, id))
        .returning();
      return result[0];
    }, undefined);
  }
}