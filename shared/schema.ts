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

// Irrigation System Schema
export const irrigationSystems = pgTable("irrigation_systems", {
  id: serial("id").primaryKey(),
  fieldId: integer("field_id").notNull(),
  name: text("name").notNull(),
  type: text("type").notNull(), // "Drip", "Sprinkler", "Flood", "Center Pivot", "Smart System"
  installationDate: timestamp("installation_date").defaultNow(),
  status: text("status").notNull(), // "Active", "Inactive", "Maintenance", "Offline"
  waterSource: text("water_source").notNull(), // "Well", "Canal", "Pond", "Rainwater Harvesting", "River"
  coverageArea: real("coverage_area").notNull(), // in acres
  efficiency: integer("efficiency"), // Percentage of water used effectively (0-100)
  lastMaintenanceDate: timestamp("last_maintenance_date"),
  nextMaintenanceDate: timestamp("next_maintenance_date"),
  description: text("description"),
  isSmartEnabled: boolean("is_smart_enabled").default(false),
  sensorData: json("sensor_data").$type<{
    moisture?: number;
    temperature?: number;
    humidity?: number;
    batteryLevel?: number;
  }>(),
});

export const insertIrrigationSystemSchema = createInsertSchema(irrigationSystems).pick({
  fieldId: true,
  name: true,
  type: true,
  installationDate: true,
  status: true,
  waterSource: true,
  coverageArea: true,
  efficiency: true,
  lastMaintenanceDate: true,
  nextMaintenanceDate: true,
  description: true,
  isSmartEnabled: true,
  sensorData: true,
});

// Irrigation Schedule Schema
export const irrigationSchedules = pgTable("irrigation_schedules", {
  id: serial("id").primaryKey(),
  systemId: integer("system_id").notNull(),
  name: text("name").notNull(),
  frequency: text("frequency").notNull(), // "Daily", "Weekly", "Custom"
  startTime: timestamp("start_time").notNull(),
  duration: integer("duration").notNull(), // in minutes
  daysOfWeek: json("days_of_week").$type<string[]>(), // ["Monday", "Wednesday", "Friday"]
  isActive: boolean("is_active").default(true),
  waterAmount: real("water_amount"), // in liters or gallons
  status: text("status").notNull(), // "Scheduled", "Running", "Completed", "Skipped", "Failed"
  adjustForWeather: boolean("adjust_for_weather").default(false), // Adjust based on weather forecast
  createdAt: timestamp("created_at").defaultNow(),
  lastRunTime: timestamp("last_run_time"),
  nextRunTime: timestamp("next_run_time"),
});

export const insertIrrigationScheduleSchema = createInsertSchema(irrigationSchedules).pick({
  systemId: true,
  name: true,
  frequency: true,
  startTime: true,
  duration: true,
  daysOfWeek: true,
  isActive: true,
  waterAmount: true,
  status: true,
  adjustForWeather: true,
  lastRunTime: true,
  nextRunTime: true,
});

// Irrigation History Schema
export const irrigationHistory = pgTable("irrigation_history", {
  id: serial("id").primaryKey(),
  fieldId: integer("field_id").notNull(),
  systemId: integer("system_id").notNull(),
  scheduleId: integer("schedule_id"),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time"),
  duration: integer("duration"), // in minutes
  waterUsed: real("water_used"), // in liters or gallons
  status: text("status").notNull(), // "Completed", "Interrupted", "Failed", "Manual"
  initiatedBy: text("initiated_by").notNull(), // "System", "User", "Weather Alert"
  notes: text("notes"),
  soilMoistureBefore: integer("soil_moisture_before"), // Percentage
  soilMoistureAfter: integer("soil_moisture_after"), // Percentage
  weatherConditions: json("weather_conditions").$type<{
    temperature?: number;
    humidity?: number;
    precipitation?: number;
    windSpeed?: number;
  }>(),
});

export const insertIrrigationHistorySchema = createInsertSchema(irrigationHistory).pick({
  fieldId: true,
  systemId: true,
  scheduleId: true,
  startTime: true,
  endTime: true,
  duration: true,
  waterUsed: true,
  status: true,
  initiatedBy: true,
  notes: true,
  soilMoistureBefore: true,
  soilMoistureAfter: true,
  weatherConditions: true,
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

export type IrrigationSystem = typeof irrigationSystems.$inferSelect;
export type InsertIrrigationSystem = z.infer<typeof insertIrrigationSystemSchema>;

export type IrrigationSchedule = typeof irrigationSchedules.$inferSelect;
export type InsertIrrigationSchedule = z.infer<typeof insertIrrigationScheduleSchema>;

export type IrrigationHistory = typeof irrigationHistory.$inferSelect;
export type InsertIrrigationHistory = z.infer<typeof insertIrrigationHistorySchema>;

// Buyer Schema
export const buyers = pgTable("buyers", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  companyName: text("company_name"),
  businessType: text("business_type").notNull(), // "Retailer", "Wholesaler", "Processor", "Exporter"
  location: text("location").notNull(),
  phoneNumber: text("phone_number").notNull(),
  email: text("email").notNull(),
  preferredLanguage: text("preferred_language").default("english"),
  verificationStatus: text("verification_status").default("pending"), // "pending", "verified", "rejected"
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertBuyerSchema = createInsertSchema(buyers).pick({
  username: true,
  password: true,
  fullName: true,
  companyName: true,
  businessType: true,
  location: true,
  phoneNumber: true,
  email: true,
  preferredLanguage: true,
});

// Crop Listing Schema
export const cropListings = pgTable("crop_listings", {
  id: serial("id").primaryKey(),
  farmerId: integer("farmer_id").notNull(),
  title: text("title").notNull(),
  cropName: text("crop_name").notNull(),
  cropVariety: text("crop_variety").notNull(),
  quantity: real("quantity").notNull(), // in quintals/tons
  pricePerUnit: integer("price_per_unit").notNull(), // in currency (e.g. rupees)
  unit: text("unit").notNull(), // "kg", "quintal", "ton"
  qualityGrade: text("quality_grade").notNull(), // "A", "B", "C" or "Premium", "Standard", "Economy"
  harvestDate: timestamp("harvest_date").notNull(),
  availableUntil: timestamp("available_until").notNull(),
  description: text("description"),
  location: text("location").notNull(),
  isOrganic: boolean("is_organic").default(false),
  certifications: json("certifications").$type<string[]>(), // ["Organic", "GAP", "Fair Trade"]
  images: json("images").$type<string[]>(), // URLs to images of the crop
  status: text("status").default("available"), // "available", "pending_sale", "sold"
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertCropListingSchema = createInsertSchema(cropListings).pick({
  farmerId: true,
  title: true,
  cropName: true,
  cropVariety: true,
  quantity: true,
  pricePerUnit: true,
  unit: true,
  qualityGrade: true,
  harvestDate: true,
  availableUntil: true,
  description: true,
  location: true,
  isOrganic: true,
  certifications: true,
  images: true,
});

// Purchase Request Schema
export const purchaseRequests = pgTable("purchase_requests", {
  id: serial("id").primaryKey(),
  listingId: integer("listing_id").notNull(),
  buyerId: integer("buyer_id").notNull(),
  farmerId: integer("farmer_id").notNull(),
  requestedQuantity: real("requested_quantity").notNull(), // in same unit as listing
  bidPricePerUnit: integer("bid_price_per_unit"), // Optional bid price if different from listing
  message: text("message"),
  status: text("status").default("pending"), // "pending", "accepted", "rejected", "completed"
  requestDate: timestamp("request_date").defaultNow(),
  responseDate: timestamp("response_date"),
  completedDate: timestamp("completed_date"),
  paymentStatus: text("payment_status").default("pending"), // "pending", "completed", "refunded"
  transportationMethod: text("transportation_method"), // "buyer_pickup", "seller_delivery", "third_party"
  deliveryDate: timestamp("delivery_date"),
  contactNumber: text("contact_number"),
  notes: text("notes"),
});

export const insertPurchaseRequestSchema = createInsertSchema(purchaseRequests).pick({
  listingId: true,
  buyerId: true,
  farmerId: true,
  requestedQuantity: true,
  bidPricePerUnit: true,
  message: true,
  transportationMethod: true,
  deliveryDate: true,
  contactNumber: true,
  notes: true,
});

// Export Buyer types
export type Buyer = typeof buyers.$inferSelect;
export type InsertBuyer = z.infer<typeof insertBuyerSchema>;

// Export CropListing types
export type CropListing = typeof cropListings.$inferSelect;
export type InsertCropListing = z.infer<typeof insertCropListingSchema>;

// Export PurchaseRequest types
export type PurchaseRequest = typeof purchaseRequests.$inferSelect;
export type InsertPurchaseRequest = z.infer<typeof insertPurchaseRequestSchema>;
