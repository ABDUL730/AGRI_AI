import { pgTable, text, serial, integer, boolean, timestamp, json, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Define the Storage Interface
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

// User/Farmer Schema
export const farmers = pgTable("farmers", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  location: text("location").notNull(),
  phoneNumber: text("phone_number").notNull(),
  preferredLanguage: text("preferred_language").default("english"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertFarmerSchema = createInsertSchema(farmers).pick({
  username: true,
  password: true,
  fullName: true,
  location: true,
  phoneNumber: true,
  preferredLanguage: true,
});

// Fields/Farms Schema
export const fields = pgTable("fields", {
  id: serial("id").primaryKey(),
  farmerId: integer("farmer_id").notNull(),
  name: text("name").notNull(),
  size: real("size").notNull(), // in acres
  soilType: text("soil_type").notNull(),
  location: text("location").notNull(),
  currentCrop: text("current_crop"),
  cropVariety: text("crop_variety"),
  plantingDate: timestamp("planting_date"),
  currentGrowthStage: text("current_growth_stage"),
  growthPercentage: integer("growth_percentage"),
  healthStatus: text("health_status"),
  irrigationStatus: text("irrigation_status"),
  lastIrrigationDate: timestamp("last_irrigation_date"),
});

export const insertFieldSchema = createInsertSchema(fields).pick({
  farmerId: true,
  name: true,
  size: true,
  soilType: true,
  location: true,
  currentCrop: true,
  cropVariety: true,
  plantingDate: true,
});

// Weather Data Schema
export const weatherData = pgTable("weather_data", {
  id: serial("id").primaryKey(),
  location: text("location").notNull(),
  date: timestamp("date").notNull(),
  temperature: real("temperature").notNull(),
  condition: text("condition").notNull(),
  humidity: integer("humidity").notNull(),
  windSpeed: real("wind_speed").notNull(),
  rainChance: integer("rain_chance").notNull(),
  advisories: json("advisories").$type<string[]>(),
});

export const insertWeatherSchema = createInsertSchema(weatherData).pick({
  location: true,
  date: true,
  temperature: true,
  condition: true,
  humidity: true,
  windSpeed: true,
  rainChance: true,
  advisories: true,
});

// Crop Recommendations Schema
export const cropRecommendations = pgTable("crop_recommendations", {
  id: serial("id").primaryKey(),
  farmerId: integer("farmer_id").notNull(),
  cropName: text("crop_name").notNull(),
  cropVariety: text("crop_variety").notNull(),
  suitabilityScore: integer("suitability_score").notNull(), // 1-5
  description: text("description").notNull(),
  daysToMaturity: integer("days_to_maturity").notNull(),
  eNamPrice: integer("e_nam_price").notNull(), // in rupees per quintal
  priceTrend: real("price_trend").notNull(), // percentage
  marketDemand: text("market_demand").notNull(), // "Low", "Medium", "High", "Very High"
});

export const insertCropRecommendationSchema = createInsertSchema(cropRecommendations).pick({
  farmerId: true,
  cropName: true,
  cropVariety: true,
  suitabilityScore: true,
  description: true,
  daysToMaturity: true,
  eNamPrice: true,
  priceTrend: true,
  marketDemand: true,
});

// Financial Assistance Schema
export const financialAssistance = pgTable("financial_assistance", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), // "Loan", "Subsidy", "Grant"
  description: text("description").notNull(),
  amount: integer("amount").notNull(),
  interestRate: real("interest_rate"),
  eligibilityDetails: text("eligibility_details").notNull(),
  processingTime: text("processing_time"),
  status: text("status").notNull(), // "Active", "Closed", "New Scheme"
});

export const insertFinancialAssistanceSchema = createInsertSchema(financialAssistance).pick({
  name: true,
  type: true,
  description: true,
  amount: true,
  interestRate: true,
  eligibilityDetails: true,
  processingTime: true,
  status: true,
});

// Market Data Schema
export const marketData = pgTable("market_data", {
  id: serial("id").primaryKey(),
  commodity: text("commodity").notNull(),
  grade: text("grade").notNull(),
  market: text("market").notNull(),
  state: text("state").notNull(),
  currentPrice: integer("current_price").notNull(),
  msp: integer("msp").notNull(),
  priceChange: real("price_change").notNull(), // percentage
  demand: text("demand").notNull(), // "Low", "Medium", "High", "Very High"
  demandPercentage: integer("demand_percentage").notNull(), // 0-100
});

export const insertMarketDataSchema = createInsertSchema(marketData).pick({
  commodity: true,
  grade: true,
  market: true,
  state: true,
  currentPrice: true,
  msp: true,
  priceChange: true,
  demand: true,
  demandPercentage: true,
});

// AI Chat Message Schema
export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  farmerId: integer("farmer_id").notNull(),
  sender: text("sender").notNull(), // "user" or "ai"
  message: text("message").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).pick({
  farmerId: true,
  sender: true,
  message: true,
});

// Important Updates/Notifications Schema
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  type: text("type").notNull(), // "urgent", "event", "info"
  date: timestamp("date").defaultNow(),
  isRead: boolean("is_read").default(false),
});

export const insertNotificationSchema = createInsertSchema(notifications).pick({
  title: true,
  description: true,
  type: true,
});

// Export types
export type Farmer = typeof farmers.$inferSelect;
export type InsertFarmer = z.infer<typeof insertFarmerSchema>;

export type Field = typeof fields.$inferSelect;
export type InsertField = z.infer<typeof insertFieldSchema>;

export type WeatherData = typeof weatherData.$inferSelect;
export type InsertWeatherData = z.infer<typeof insertWeatherSchema>;

export type CropRecommendation = typeof cropRecommendations.$inferSelect;
export type InsertCropRecommendation = z.infer<typeof insertCropRecommendationSchema>;

export type FinancialAssistance = typeof financialAssistance.$inferSelect;
export type InsertFinancialAssistance = z.infer<typeof insertFinancialAssistanceSchema>;

export type MarketData = typeof marketData.$inferSelect;
export type InsertMarketData = z.infer<typeof insertMarketDataSchema>;

export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
