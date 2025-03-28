import { eq, and, or, count } from 'drizzle-orm';
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
  DirectMessage, InsertDirectMessage,
  IrrigationSystem, InsertIrrigationSystem,
  IrrigationSchedule, InsertIrrigationSchedule,
  IrrigationHistory, InsertIrrigationHistory,
  Buyer, InsertBuyer,
  CropListing, InsertCropListing,
  PurchaseRequest, InsertPurchaseRequest,
  farmers, fields, weatherData, cropRecommendations,
  financialAssistance, marketData, chatMessages, notifications,
  directMessages
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
  
  async getFarmers(): Promise<Farmer[]> {
    return safeDbOperation(async () => {
      return await db!.select().from(farmers);
    }, []);
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

  // Direct Message operations
  async getDirectMessages(userId: number, userType: string): Promise<DirectMessage[]> {
    return safeDbOperation(async () => {
      return await db!.select()
        .from(directMessages)
        .where(
          or(
            and(
              eq(directMessages.senderId, userId),
              eq(directMessages.senderType, userType)
            ),
            and(
              eq(directMessages.receiverId, userId),
              eq(directMessages.receiverType, userType)
            )
          )
        )
        .orderBy(directMessages.timestamp);
    }, []);
  }

  async getConversation(senderId: number, senderType: string, receiverId: number, receiverType: string): Promise<DirectMessage[]> {
    return safeDbOperation(async () => {
      return await db!.select()
        .from(directMessages)
        .where(
          or(
            and(
              eq(directMessages.senderId, senderId),
              eq(directMessages.senderType, senderType),
              eq(directMessages.receiverId, receiverId),
              eq(directMessages.receiverType, receiverType)
            ),
            and(
              eq(directMessages.senderId, receiverId),
              eq(directMessages.senderType, receiverType),
              eq(directMessages.receiverId, senderId),
              eq(directMessages.receiverType, senderType)
            )
          )
        )
        .orderBy(directMessages.timestamp);
    }, []);
  }

  async createDirectMessage(message: InsertDirectMessage): Promise<DirectMessage> {
    return safeDbOperation(async () => {
      const result = await db!.insert(directMessages)
        .values({
          senderId: message.senderId,
          receiverId: message.receiverId,
          senderType: message.senderType,
          receiverType: message.receiverType,
          message: message.message,
          relatedListingId: message.relatedListingId || null,
          relatedRequestId: message.relatedRequestId || null,
          isRead: false,
          timestamp: new Date()
        })
        .returning();
      return result[0];
    }, {
      id: 0,
      message: '',
      timestamp: new Date(),
      isRead: false,
      senderId: 0,
      receiverId: 0,
      senderType: '',
      receiverType: '',
      relatedListingId: null,
      relatedRequestId: null
    });
  }

  async markDirectMessageAsRead(id: number): Promise<DirectMessage | undefined> {
    return safeDbOperation(async () => {
      const result = await db!.update(directMessages)
        .set({ isRead: true })
        .where(eq(directMessages.id, id))
        .returning();
      return result[0];
    }, undefined);
  }

  async getUnreadMessageCount(userId: number, userType: string): Promise<{count: number}> {
    return safeDbOperation(async () => {
      const result = await db!.select({ count: count() })
        .from(directMessages)
        .where(
          and(
            eq(directMessages.receiverId, userId),
            eq(directMessages.receiverType, userType),
            eq(directMessages.isRead, false)
          )
        );
      return result[0] || { count: 0 };
    }, { count: 0 });
  }
  
  // Irrigation operations - These stubs are required by the interface
  // but rely on the memory storage implementation for now
  async getIrrigationSystemsByFieldId(fieldId: number): Promise<IrrigationSystem[]> {
    return [];
  }

  async getIrrigationSystem(id: number): Promise<IrrigationSystem | undefined> {
    return undefined;
  }

  async createIrrigationSystem(system: InsertIrrigationSystem): Promise<IrrigationSystem> {
    return {
      id: 0,
      name: '',
      fieldId: 0,
      type: '',
      status: '',
      waterSource: '',
      installationDate: null,
      lastMaintenanceDate: null,
      sensorData: null,
      createdAt: null
    };
  }

  async updateIrrigationSystem(id: number, system: Partial<IrrigationSystem>): Promise<IrrigationSystem | undefined> {
    return undefined;
  }

  async deleteIrrigationSystem(id: number): Promise<void> {
    return;
  }

  // Irrigation schedule operations
  async getIrrigationSchedules(systemId: number): Promise<IrrigationSchedule[]> {
    return [];
  }

  async getIrrigationSchedule(id: number): Promise<IrrigationSchedule | undefined> {
    return undefined;
  }

  async createIrrigationSchedule(schedule: InsertIrrigationSchedule): Promise<IrrigationSchedule> {
    return {
      id: 0,
      name: '',
      createdAt: null,
      status: '',
      systemId: 0,
      frequency: '',
      startTime: new Date(),
      duration: 0,
      daysOfWeek: null,
      isActive: null,
      waterAmount: null,
      adjustForWeather: null,
      lastRunTime: null,
      nextRunTime: null
    };
  }

  async updateIrrigationSchedule(id: number, schedule: Partial<IrrigationSchedule>): Promise<IrrigationSchedule | undefined> {
    return undefined;
  }

  async deleteIrrigationSchedule(id: number): Promise<void> {
    return;
  }

  // Irrigation history operations
  async getIrrigationHistory(fieldId: number): Promise<IrrigationHistory[]> {
    return [];
  }

  async getIrrigationHistoryById(id: number): Promise<IrrigationHistory | undefined> {
    return undefined;
  }

  async createIrrigationHistory(history: InsertIrrigationHistory): Promise<IrrigationHistory> {
    return {
      id: 0,
      fieldId: 0,
      systemId: 0,
      startTime: new Date(),
      endTime: null,
      duration: null,
      waterAmount: null,
      scheduleId: null,
      weatherConditions: null,
      notes: null
    };
  }

  // Buyer operations - These stubs are required by the interface
  // but rely on the memory storage implementation for now
  async getBuyer(id: number): Promise<Buyer | undefined> {
    return undefined;
  }

  async getBuyerByUsername(username: string): Promise<Buyer | undefined> {
    return undefined;
  }

  async createBuyer(buyer: InsertBuyer): Promise<Buyer> {
    return {
      id: 0,
      username: '',
      password: '',
      fullName: '',
      location: '',
      phoneNumber: '',
      preferredLanguage: null,
      createdAt: null,
      companyName: null,
      businessType: '',
      email: '',
      verificationStatus: null
    };
  }

  async updateBuyer(id: number, buyer: Partial<Buyer>): Promise<Buyer | undefined> {
    return undefined;
  }

  // Crop Listing operations
  async getCropListings(): Promise<CropListing[]> {
    return [];
  }

  async getCropListingsByFarmerId(farmerId: number): Promise<CropListing[]> {
    return [];
  }

  async getCropListing(id: number): Promise<CropListing | undefined> {
    return undefined;
  }

  async createCropListing(listing: InsertCropListing): Promise<CropListing> {
    return {
      id: 0,
      farmerId: 0,
      cropName: '',
      cropVariety: '',
      title: '',
      quantity: 0,
      unit: '',
      pricePerUnit: 0,
      qualityGrade: '',
      description: '',
      location: '',
      harvestDate: new Date(),
      organicCertified: false,
      availableUntil: null,
      images: null,
      deliveryOptions: null
    };
  }

  async updateCropListing(id: number, listing: Partial<CropListing>): Promise<CropListing | undefined> {
    return undefined;
  }

  async deleteCropListing(id: number): Promise<void> {
    return;
  }

  // Purchase Request operations
  async getPurchaseRequests(): Promise<PurchaseRequest[]> {
    return [];
  }

  async getPurchaseRequestsByBuyerId(buyerId: number): Promise<PurchaseRequest[]> {
    return [];
  }

  async getPurchaseRequestsByFarmerId(farmerId: number): Promise<PurchaseRequest[]> {
    return [];
  }

  async getPurchaseRequest(id: number): Promise<PurchaseRequest | undefined> {
    return undefined;
  }

  async createPurchaseRequest(request: InsertPurchaseRequest): Promise<PurchaseRequest> {
    return {
      id: 0,
      listingId: 0,
      buyerId: 0,
      farmerId: 0,
      requestedQuantity: 0,
      bidPricePerUnit: null,
      requestDate: null,
      responseDate: null,
      completedDate: null,
      status: null,
      message: null,
      notes: null,
      paymentStatus: null,
      paymentMethod: null,
      deliveryMethod: null,
      contactNumber: null
    };
  }

  async updatePurchaseRequest(id: number, request: Partial<PurchaseRequest>): Promise<PurchaseRequest | undefined> {
    return undefined;
  }
}