import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import session from "express-session";

// Extend the Express Session type
declare module "express-session" {
  interface SessionData {
    farmerId?: number;
    buyerId?: number;
  }
}
import { 
  insertFarmerSchema, 
  insertFieldSchema,
  insertChatMessageSchema,
  insertCropRecommendationSchema,
  insertIrrigationSystemSchema,
  insertIrrigationScheduleSchema,
  insertIrrigationHistorySchema,
  insertBuyerSchema,
  insertCropListingSchema,
  insertPurchaseRequestSchema
} from "@shared/schema";
import { getAIChatResponse, getCropRecommendations, getSubsidyRecommendations } from "./services/openai";

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes prefix
  const apiRouter = app.route('/api');
  
  // Authentication routes
  app.post('/api/auth/login', async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }
      
      const farmer = await storage.getFarmerByUsername(username);
      
      if (!farmer || farmer.password !== password) {
        return res.status(401).json({ message: "Invalid username or password" });
      }
      
      // Create a session (in a real app, we'd use JWT or sessions)
      req.session.farmerId = farmer.id;
      
      return res.status(200).json({ 
        id: farmer.id,
        username: farmer.username,
        fullName: farmer.fullName,
        location: farmer.location,
        preferredLanguage: farmer.preferredLanguage
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Error during login" });
    }
  });
  
  // Password reset request
  app.post('/api/auth/reset-password-request', async (req: Request, res: Response) => {
    try {
      const { username } = req.body;
      
      if (!username) {
        return res.status(400).json({ message: "Username is required" });
      }
      
      const farmer = await storage.getFarmerByUsername(username);
      
      if (!farmer) {
        // Still return success to prevent username enumeration
        return res.status(200).json({ message: "If the account exists, a reset token has been sent" });
      }
      
      // In a real app, generate a secure token and send an email
      // For demo purposes, we'll use a simple token (the username reversed)
      const resetToken = username.split('').reverse().join('');
      
      // Store this token with the user (in a real app, we'd store a hashed version with an expiry)
      // For this demo, we'll just log it
      console.log(`Reset token for ${username}: ${resetToken}`);
      
      return res.status(200).json({ message: "If the account exists, a reset token has been sent" });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Error processing reset request" });
    }
  });
  
  // Password reset
  app.post('/api/auth/reset-password', async (req: Request, res: Response) => {
    try {
      const { token, newPassword } = req.body;
      
      if (!token || !newPassword) {
        return res.status(400).json({ message: "Token and new password are required" });
      }
      
      // In a real app, validate the token against stored tokens
      // For this demo, we'll reverse the token to get the username (token is username reversed)
      const username = token.split('').reverse().join('');
      
      const farmer = await storage.getFarmerByUsername(username);
      
      if (!farmer) {
        return res.status(400).json({ message: "Invalid or expired token" });
      }
      
      // Update the password - in a real app, you'd hash the password
      const updatedFarmer = await storage.updateFarmer(farmer.id, { password: newPassword });
      
      if (!updatedFarmer) {
        return res.status(500).json({ message: "Failed to update password" });
      }
      
      return res.status(200).json({ message: "Password updated successfully" });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Error resetting password" });
    }
  });
  
  app.post('/api/auth/register', async (req: Request, res: Response) => {
    try {
      const validationResult = insertFarmerSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ message: "Invalid farmer data", errors: validationResult.error.errors });
      }
      
      const existingFarmer = await storage.getFarmerByUsername(validationResult.data.username);
      
      if (existingFarmer) {
        return res.status(409).json({ message: "Username already exists" });
      }
      
      const newFarmer = await storage.createFarmer(validationResult.data);
      
      // Create a session
      req.session.farmerId = newFarmer.id;
      
      return res.status(201).json({ 
        id: newFarmer.id,
        username: newFarmer.username,
        fullName: newFarmer.fullName,
        location: newFarmer.location,
        preferredLanguage: newFarmer.preferredLanguage
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Error during registration" });
    }
  });
  
  app.post('/api/auth/logout', (req: Request, res: Response) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Failed to logout" });
      }
      
      res.clearCookie("connect.sid");
      return res.status(200).json({ message: "Logged out successfully" });
    });
  });
  
  // Check if user is authenticated
  app.get('/api/auth/check', async (req: Request, res: Response) => {
    try {
      if (req.session && req.session.farmerId) {
        const farmer = await storage.getFarmer(req.session.farmerId as number);
        
        if (farmer) {
          // Return farmer data without the password
          const { password, ...farmerData } = farmer;
          return res.status(200).json(farmerData);
        }
      }
      
      return res.status(401).json({ message: "Not authenticated" });
    } catch (error) {
      console.error('Error checking authentication:', error);
      return res.status(500).json({ message: 'Server error' });
    }
  });
  
  // Middleware to check if user is authenticated
  const isAuthenticated = (req: Request, res: Response, next: () => void) => {
    // Check if session exists and has farmerId
    if (!req.session || !req.session.farmerId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    next();
  };
  
  // Weather routes
  app.get('/api/weather', async (req: Request, res: Response) => {
    try {
      const { location } = req.query;
      
      if (!location || typeof location !== 'string') {
        return res.status(400).json({ message: "Location is required" });
      }
      
      const weatherData = await storage.getWeatherByLocation(location);
      
      if (!weatherData) {
        return res.status(404).json({ message: "Weather data not found for this location" });
      }
      
      return res.status(200).json(weatherData);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Error fetching weather data" });
    }
  });
  
  // Field routes
  app.get('/api/fields', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const farmerId = req.session.farmerId as number;
      const fields = await storage.getFieldsByFarmerId(farmerId);
      return res.status(200).json(fields);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Error fetching fields" });
    }
  });
  
  app.post('/api/fields', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const farmerId = req.session.farmerId as number;
      
      const fieldData = { ...req.body, farmerId };
      const validationResult = insertFieldSchema.safeParse(fieldData);
      
      if (!validationResult.success) {
        return res.status(400).json({ message: "Invalid field data", errors: validationResult.error.errors });
      }
      
      const newField = await storage.createField(validationResult.data);
      return res.status(201).json(newField);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Error creating field" });
    }
  });
  
  app.get('/api/fields/:id', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const fieldId = parseInt(req.params.id);
      
      if (isNaN(fieldId)) {
        return res.status(400).json({ message: "Invalid field ID" });
      }
      
      const field = await storage.getField(fieldId);
      
      if (!field) {
        return res.status(404).json({ message: "Field not found" });
      }
      
      // Check if field belongs to the authenticated farmer
      if (field.farmerId !== req.session.farmerId) {
        return res.status(403).json({ message: "Unauthorized access to this field" });
      }
      
      return res.status(200).json(field);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Error fetching field" });
    }
  });
  
  // Crop recommendation routes
  app.get('/api/crop-recommendations', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const farmerId = req.session.farmerId as number;
      const recommendations = await storage.getCropRecommendations(farmerId);
      return res.status(200).json(recommendations);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Error fetching crop recommendations" });
    }
  });
  
  // Financial assistance routes
  app.get('/api/financial-assistance', async (req: Request, res: Response) => {
    try {
      const assistance = await storage.getFinancialAssistance();
      return res.status(200).json(assistance);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Error fetching financial assistance options" });
    }
  });
  
  // Market data routes
  app.get('/api/market-data', async (req: Request, res: Response) => {
    try {
      const marketData = await storage.getMarketData();
      return res.status(200).json(marketData);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Error fetching market data" });
    }
  });
  
  // Chat message routes
  app.get('/api/chat-messages', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const farmerId = req.session.farmerId as number;
      const messages = await storage.getChatMessagesByFarmerId(farmerId);
      return res.status(200).json(messages);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Error fetching chat messages" });
    }
  });
  
  app.post('/api/chat-messages', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const farmerId = req.session.farmerId as number;
      
      const messageData = { ...req.body, farmerId };
      const validationResult = insertChatMessageSchema.safeParse(messageData);
      
      if (!validationResult.success) {
        return res.status(400).json({ message: "Invalid message data", errors: validationResult.error.errors });
      }
      
      // Save user message
      const userMessage = await storage.createChatMessage(validationResult.data);
      
      try {
        // Get AI response from OpenAI
        const previousMessages = await storage.getChatMessagesByFarmerId(farmerId);
        const lastFiveMessages = previousMessages
          .slice(-5)
          .map(msg => ({
            role: msg.sender === "user" ? "user" as const : "assistant" as const,
            content: msg.message
          }));
        
        // Add current message
        lastFiveMessages.push({
          role: "user",
          content: userMessage.message
        });
        
        // Get AI response using OpenAI
        const aiResponseText = await getAIChatResponse(lastFiveMessages, farmerId);
        
        // Save AI response
        const aiMessageData = {
          farmerId,
          sender: "ai",
          message: aiResponseText
        };
        
        const aiMessage = await storage.createChatMessage(aiMessageData);
        
        return res.status(201).json([userMessage, aiMessage]);
      } catch (aiError) {
        console.error("Error getting AI response:", aiError);
        
        // Fallback to basic response if AI service fails
        const aiMessageData = {
          farmerId,
          sender: "ai",
          message: "I'm sorry, I'm having trouble processing your request right now. Please try again later."
        };
        
        const aiMessage = await storage.createChatMessage(aiMessageData);
        return res.status(201).json([userMessage, aiMessage]);
      }
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Error processing chat message" });
    }
  });
  
  // Interactive Crop Recommendation Wizard API
  app.post('/api/crop-wizard/recommend', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const { soilType, location, seasonality, waterAvailability, previousCrops } = req.body;
      
      if (!soilType || !location || !seasonality || !waterAvailability) {
        return res.status(400).json({ message: "Missing required field information" });
      }
      
      // Get AI-powered crop recommendations
      const recommendations = await getCropRecommendations(
        soilType,
        location,
        seasonality,
        waterAvailability,
        previousCrops || "None"
      );
      
      // Store the recommendations in the database
      const farmerId = req.session.farmerId as number;
      const cropRecommendationPromises = recommendations.recommendedCrops.map(async (crop) => {
        const recommendationData = {
          farmerId,
          cropName: crop.crop,
          cropVariety: "Standard Variety", // Default value since we don't have specific variety data
          suitabilityScore: Math.round(crop.confidence * 100), // Convert confidence to 0-100 score
          description: crop.reasoning,
          daysToMaturity: crop.crop.includes("Rice") ? 120 : crop.crop.includes("Wheat") ? 145 : 90, // Example values
          eNamPrice: crop.crop.includes("Rice") ? 2200 : crop.crop.includes("Wheat") ? 2100 : 1800, // Example values in rupees per quintal
          priceTrend: 0.5, // Example value (0.5% increase)
          marketDemand: crop.confidence > 0.8 ? "High" : crop.confidence > 0.6 ? "Medium" : "Low"
        };
        
        return storage.createCropRecommendation(recommendationData);
      });
      
      await Promise.all(cropRecommendationPromises);
      
      return res.status(200).json(recommendations);
    } catch (error) {
      console.error("Error in crop recommendation wizard:", error);
      return res.status(500).json({ message: "Failed to generate crop recommendations" });
    }
  });
  
  // Government Subsidy API
  app.post('/api/subsidies/recommend', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const { location, landSize, crops, income, category } = req.body;
      
      if (!location || !landSize || !crops || !income || !category) {
        return res.status(400).json({ message: "Missing required farmer information" });
      }
      
      // Get AI-powered subsidy recommendations
      const recommendations = await getSubsidyRecommendations({
        location,
        landSize,
        crops: Array.isArray(crops) ? crops : [crops],
        income,
        category
      });
      
      return res.status(200).json(recommendations);
    } catch (error) {
      console.error("Error in subsidy recommendations:", error);
      return res.status(500).json({ message: "Failed to generate subsidy recommendations" });
    }
  });
  
  // Irrigation System Routes
  app.get('/api/irrigation-systems/field/:fieldId', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const fieldId = parseInt(req.params.fieldId);
      
      if (isNaN(fieldId)) {
        return res.status(400).json({ message: "Invalid field ID" });
      }
      
      // Verify field belongs to the authenticated farmer
      const field = await storage.getField(fieldId);
      if (!field) {
        return res.status(404).json({ message: "Field not found" });
      }
      
      if (field.farmerId !== req.session.farmerId) {
        return res.status(403).json({ message: "You don't have access to this field" });
      }
      
      const irrigationSystems = await storage.getIrrigationSystemsByFieldId(fieldId);
      return res.status(200).json(irrigationSystems);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Error fetching irrigation systems" });
    }
  });
  
  app.get('/api/irrigation-systems/:id', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const systemId = parseInt(req.params.id);
      
      if (isNaN(systemId)) {
        return res.status(400).json({ message: "Invalid irrigation system ID" });
      }
      
      const system = await storage.getIrrigationSystem(systemId);
      
      if (!system) {
        return res.status(404).json({ message: "Irrigation system not found" });
      }
      
      // Verify field belongs to the authenticated farmer
      const field = await storage.getField(system.fieldId);
      if (!field || field.farmerId !== req.session.farmerId) {
        return res.status(403).json({ message: "You don't have access to this irrigation system" });
      }
      
      return res.status(200).json(system);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Error fetching irrigation system" });
    }
  });
  
  app.post('/api/irrigation-systems', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const { fieldId } = req.body;
      
      if (!fieldId) {
        return res.status(400).json({ message: "Field ID is required" });
      }
      
      // Verify field belongs to the authenticated farmer
      const field = await storage.getField(fieldId);
      if (!field) {
        return res.status(404).json({ message: "Field not found" });
      }
      
      if (field.farmerId !== req.session.farmerId) {
        return res.status(403).json({ message: "You don't have access to this field" });
      }
      
      // Log the received data for debugging
      console.log("Received irrigation system data:", req.body);
      
      // Convert date string to Date object before validation
      let processedData = { ...req.body };
      
      // Check if installationDate is properly formatted
      if (processedData.installationDate && typeof processedData.installationDate === 'string') {
        try {
          // Parse the date string
          const date = new Date(processedData.installationDate);
          
          if (isNaN(date.getTime())) {
            return res.status(400).json({ 
              message: "Invalid irrigation system data", 
              errors: [{ path: ["installationDate"], message: "Invalid date format" }]
            });
          }
          
          // Replace string with actual date object
          processedData.installationDate = date;
        } catch (e) {
          return res.status(400).json({ 
            message: "Invalid irrigation system data", 
            errors: [{ path: ["installationDate"], message: "Invalid date format" }]
          });
        }
      }
      
      console.log("Processed irrigation system data:", processedData);
      
      const validationResult = insertIrrigationSystemSchema.safeParse(processedData);
      
      if (!validationResult.success) {
        console.error("Validation errors:", validationResult.error.errors);
        return res.status(400).json({ 
          message: "Invalid irrigation system data", 
          errors: validationResult.error.errors 
        });
      }
      
      const newSystem = await storage.createIrrigationSystem(validationResult.data);
      return res.status(201).json(newSystem);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Error creating irrigation system" });
    }
  });
  
  app.put('/api/irrigation-systems/:id', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const systemId = parseInt(req.params.id);
      
      if (isNaN(systemId)) {
        return res.status(400).json({ message: "Invalid irrigation system ID" });
      }
      
      const system = await storage.getIrrigationSystem(systemId);
      
      if (!system) {
        return res.status(404).json({ message: "Irrigation system not found" });
      }
      
      // Verify field belongs to the authenticated farmer
      const field = await storage.getField(system.fieldId);
      if (!field || field.farmerId !== req.session.farmerId) {
        return res.status(403).json({ message: "You don't have access to this irrigation system" });
      }
      
      // Update system
      const updatedSystem = await storage.updateIrrigationSystem(systemId, req.body);
      return res.status(200).json(updatedSystem);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Error updating irrigation system" });
    }
  });
  
  app.delete('/api/irrigation-systems/:id', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const systemId = parseInt(req.params.id);
      
      if (isNaN(systemId)) {
        return res.status(400).json({ message: "Invalid irrigation system ID" });
      }
      
      const system = await storage.getIrrigationSystem(systemId);
      
      if (!system) {
        return res.status(404).json({ message: "Irrigation system not found" });
      }
      
      // Verify field belongs to the authenticated farmer
      const field = await storage.getField(system.fieldId);
      if (!field || field.farmerId !== req.session.farmerId) {
        return res.status(403).json({ message: "You don't have access to this irrigation system" });
      }
      
      // Delete system
      await storage.deleteIrrigationSystem(systemId);
      return res.status(204).send();
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Error deleting irrigation system" });
    }
  });
  
  // Irrigation Schedule Routes
  app.get('/api/irrigation-schedules/system/:systemId', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const systemId = parseInt(req.params.systemId);
      
      if (isNaN(systemId)) {
        return res.status(400).json({ message: "Invalid irrigation system ID" });
      }
      
      const system = await storage.getIrrigationSystem(systemId);
      
      if (!system) {
        return res.status(404).json({ message: "Irrigation system not found" });
      }
      
      // Verify field belongs to the authenticated farmer
      const field = await storage.getField(system.fieldId);
      if (!field || field.farmerId !== req.session.farmerId) {
        return res.status(403).json({ message: "You don't have access to this irrigation system" });
      }
      
      const schedules = await storage.getIrrigationSchedules(systemId);
      return res.status(200).json(schedules);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Error fetching irrigation schedules" });
    }
  });
  
  app.post('/api/irrigation-schedules', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const { systemId } = req.body;
      
      if (!systemId) {
        return res.status(400).json({ message: "System ID is required" });
      }
      
      const system = await storage.getIrrigationSystem(systemId);
      
      if (!system) {
        return res.status(404).json({ message: "Irrigation system not found" });
      }
      
      // Verify field belongs to the authenticated farmer
      const field = await storage.getField(system.fieldId);
      if (!field || field.farmerId !== req.session.farmerId) {
        return res.status(403).json({ message: "You don't have access to this irrigation system" });
      }
      
      const validationResult = insertIrrigationScheduleSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "Invalid irrigation schedule data", 
          errors: validationResult.error.errors 
        });
      }
      
      const newSchedule = await storage.createIrrigationSchedule(validationResult.data);
      return res.status(201).json(newSchedule);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Error creating irrigation schedule" });
    }
  });
  
  app.put('/api/irrigation-schedules/:id', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const scheduleId = parseInt(req.params.id);
      
      if (isNaN(scheduleId)) {
        return res.status(400).json({ message: "Invalid irrigation schedule ID" });
      }
      
      const schedule = await storage.getIrrigationSchedule(scheduleId);
      
      if (!schedule) {
        return res.status(404).json({ message: "Irrigation schedule not found" });
      }
      
      // Verify system access
      const system = await storage.getIrrigationSystem(schedule.systemId);
      if (!system) {
        return res.status(404).json({ message: "Irrigation system not found" });
      }
      
      // Verify field belongs to the authenticated farmer
      const field = await storage.getField(system.fieldId);
      if (!field || field.farmerId !== req.session.farmerId) {
        return res.status(403).json({ message: "You don't have access to this irrigation schedule" });
      }
      
      // Update schedule
      const updatedSchedule = await storage.updateIrrigationSchedule(scheduleId, req.body);
      return res.status(200).json(updatedSchedule);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Error updating irrigation schedule" });
    }
  });
  
  app.delete('/api/irrigation-schedules/:id', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const scheduleId = parseInt(req.params.id);
      
      if (isNaN(scheduleId)) {
        return res.status(400).json({ message: "Invalid irrigation schedule ID" });
      }
      
      const schedule = await storage.getIrrigationSchedule(scheduleId);
      
      if (!schedule) {
        return res.status(404).json({ message: "Irrigation schedule not found" });
      }
      
      // Verify system access
      const system = await storage.getIrrigationSystem(schedule.systemId);
      if (!system) {
        return res.status(404).json({ message: "Irrigation system not found" });
      }
      
      // Verify field belongs to the authenticated farmer
      const field = await storage.getField(system.fieldId);
      if (!field || field.farmerId !== req.session.farmerId) {
        return res.status(403).json({ message: "You don't have access to this irrigation schedule" });
      }
      
      // Delete schedule
      await storage.deleteIrrigationSchedule(scheduleId);
      return res.status(204).send();
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Error deleting irrigation schedule" });
    }
  });
  
  // Irrigation History Routes
  app.get('/api/irrigation-history/field/:fieldId', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const fieldId = parseInt(req.params.fieldId);
      
      if (isNaN(fieldId)) {
        return res.status(400).json({ message: "Invalid field ID" });
      }
      
      // Verify field belongs to the authenticated farmer
      const field = await storage.getField(fieldId);
      if (!field) {
        return res.status(404).json({ message: "Field not found" });
      }
      
      if (field.farmerId !== req.session.farmerId) {
        return res.status(403).json({ message: "You don't have access to this field" });
      }
      
      const history = await storage.getIrrigationHistory(fieldId);
      return res.status(200).json(history);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Error fetching irrigation history" });
    }
  });
  
  app.post('/api/irrigation-history', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const { fieldId, systemId } = req.body;
      
      if (!fieldId || !systemId) {
        return res.status(400).json({ message: "Field ID and System ID are required" });
      }
      
      // Verify field belongs to the authenticated farmer
      const field = await storage.getField(fieldId);
      if (!field) {
        return res.status(404).json({ message: "Field not found" });
      }
      
      if (field.farmerId !== req.session.farmerId) {
        return res.status(403).json({ message: "You don't have access to this field" });
      }
      
      // Verify system exists and belongs to the field
      const system = await storage.getIrrigationSystem(systemId);
      if (!system || system.fieldId !== fieldId) {
        return res.status(404).json({ message: "Irrigation system not found for this field" });
      }
      
      const validationResult = insertIrrigationHistorySchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "Invalid irrigation history data", 
          errors: validationResult.error.errors 
        });
      }
      
      const newHistory = await storage.createIrrigationHistory(validationResult.data);
      
      // Update the field's lastIrrigationDate
      await storage.updateField(fieldId, { 
        lastIrrigationDate: newHistory.startTime,
        irrigationStatus: "Recently irrigated"
      });
      
      return res.status(201).json(newHistory);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Error recording irrigation history" });
    }
  });
  
  // Notification routes
  app.get('/api/notifications', async (req: Request, res: Response) => {
    try {
      const notifications = await storage.getNotifications();
      return res.status(200).json(notifications);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Error fetching notifications" });
    }
  });
  
  app.post('/api/notifications/:id/read', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const notificationId = parseInt(req.params.id);
      
      if (isNaN(notificationId)) {
        return res.status(400).json({ message: "Invalid notification ID" });
      }
      
      const updatedNotification = await storage.markNotificationAsRead(notificationId);
      
      if (!updatedNotification) {
        return res.status(404).json({ message: "Notification not found" });
      }
      
      return res.status(200).json(updatedNotification);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Error marking notification as read" });
    }
  });

  // Buyer authentication routes
  app.post('/api/buyer/login', async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }
      
      const buyer = await storage.getBuyerByUsername(username);
      
      if (!buyer) {
        return res.status(401).json({ message: "Invalid username or password" });
      }
      
      // For dev/testing purposes, enable a simple password check for test users
      const passwordMatches = buyer.username === 'buyer1' && password === 'password123' 
        ? true 
        : buyer.password === password;
        
      if (!passwordMatches) {
        return res.status(401).json({ message: "Invalid username or password" });
      }
      
      // Create a session
      req.session.buyerId = buyer.id;
      
      return res.status(200).json({ 
        id: buyer.id,
        username: buyer.username,
        fullName: buyer.fullName,
        location: buyer.location,
        preferredLanguage: buyer.preferredLanguage,
        companyName: buyer.companyName,
        businessType: buyer.businessType,
        verificationStatus: buyer.verificationStatus
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Error during login" });
    }
  });
  
  app.post('/api/buyer/register', async (req: Request, res: Response) => {
    try {
      const validationResult = insertBuyerSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ message: "Invalid buyer data", errors: validationResult.error.errors });
      }
      
      const existingBuyer = await storage.getBuyerByUsername(validationResult.data.username);
      
      if (existingBuyer) {
        return res.status(409).json({ message: "Username already exists" });
      }
      
      const newBuyer = await storage.createBuyer(validationResult.data);
      
      // Create a session
      req.session.buyerId = newBuyer.id;
      
      return res.status(201).json({ 
        id: newBuyer.id,
        username: newBuyer.username,
        fullName: newBuyer.fullName,
        location: newBuyer.location,
        companyName: newBuyer.companyName,
        businessType: newBuyer.businessType,
        verificationStatus: newBuyer.verificationStatus
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Error during registration" });
    }
  });
  
  app.get('/api/buyer/check', async (req: Request, res: Response) => {
    try {
      if (req.session && req.session.buyerId) {
        const buyer = await storage.getBuyer(req.session.buyerId as number);
        
        if (buyer) {
          // Return buyer data without the password
          const { password, ...buyerData } = buyer;
          return res.status(200).json(buyerData);
        }
      }
      
      return res.status(401).json({ message: "Not authenticated" });
    } catch (error) {
      console.error('Error checking authentication:', error);
      return res.status(500).json({ message: 'Server error' });
    }
  });
  
  app.post('/api/buyer/logout', (req: Request, res: Response) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Failed to logout" });
      }
      
      res.clearCookie("connect.sid");
      return res.status(200).json({ message: "Logged out successfully" });
    });
  });
  
  // Middleware to check if buyer is authenticated
  const isBuyerAuthenticated = (req: Request, res: Response, next: () => void) => {
    // Check if session exists and has buyerId
    if (!req.session || !req.session.buyerId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    next();
  };
  
  // Crop Listing routes
  app.get('/api/crop-listings', async (req: Request, res: Response) => {
    try {
      const listings = await storage.getCropListings();
      return res.status(200).json(listings);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Error fetching crop listings" });
    }
  });
  
  app.get('/api/crop-listings/farmer', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const farmerId = req.session.farmerId as number;
      const listings = await storage.getCropListingsByFarmerId(farmerId);
      return res.status(200).json(listings);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Error fetching farmer crop listings" });
    }
  });
  
  app.get('/api/crop-listings/:id', async (req: Request, res: Response) => {
    try {
      const listingId = parseInt(req.params.id);
      
      if (isNaN(listingId)) {
        return res.status(400).json({ message: "Invalid listing ID" });
      }
      
      const listing = await storage.getCropListing(listingId);
      
      if (!listing) {
        return res.status(404).json({ message: "Crop listing not found" });
      }
      
      return res.status(200).json(listing);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Error fetching crop listing" });
    }
  });
  
  app.post('/api/crop-listings', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const farmerId = req.session.farmerId as number;
      
      const listingData = { ...req.body, farmerId };
      const validationResult = insertCropListingSchema.safeParse(listingData);
      
      if (!validationResult.success) {
        return res.status(400).json({ message: "Invalid listing data", errors: validationResult.error.errors });
      }
      
      const newListing = await storage.createCropListing(validationResult.data);
      return res.status(201).json(newListing);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Error creating crop listing" });
    }
  });
  
  app.put('/api/crop-listings/:id', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const listingId = parseInt(req.params.id);
      const farmerId = req.session.farmerId as number;
      
      if (isNaN(listingId)) {
        return res.status(400).json({ message: "Invalid listing ID" });
      }
      
      const listing = await storage.getCropListing(listingId);
      
      if (!listing) {
        return res.status(404).json({ message: "Crop listing not found" });
      }
      
      // Check if listing belongs to the authenticated farmer
      if (listing.farmerId !== farmerId) {
        return res.status(403).json({ message: "Unauthorized access to this listing" });
      }
      
      const updatedListing = await storage.updateCropListing(listingId, req.body);
      return res.status(200).json(updatedListing);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Error updating crop listing" });
    }
  });
  
  app.delete('/api/crop-listings/:id', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const listingId = parseInt(req.params.id);
      const farmerId = req.session.farmerId as number;
      
      if (isNaN(listingId)) {
        return res.status(400).json({ message: "Invalid listing ID" });
      }
      
      const listing = await storage.getCropListing(listingId);
      
      if (!listing) {
        return res.status(404).json({ message: "Crop listing not found" });
      }
      
      // Check if listing belongs to the authenticated farmer
      if (listing.farmerId !== farmerId) {
        return res.status(403).json({ message: "Unauthorized access to this listing" });
      }
      
      await storage.deleteCropListing(listingId);
      return res.status(200).json({ message: "Crop listing deleted successfully" });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Error deleting crop listing" });
    }
  });
  
  // Purchase Request routes
  app.get('/api/purchase-requests/farmer', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const farmerId = req.session.farmerId as number;
      const requests = await storage.getPurchaseRequestsByFarmerId(farmerId);
      return res.status(200).json(requests);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Error fetching purchase requests" });
    }
  });
  
  app.get('/api/purchase-requests/buyer', isBuyerAuthenticated, async (req: Request, res: Response) => {
    try {
      const buyerId = req.session.buyerId as number;
      const requests = await storage.getPurchaseRequestsByBuyerId(buyerId);
      return res.status(200).json(requests);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Error fetching purchase requests" });
    }
  });
  
  app.post('/api/purchase-requests', isBuyerAuthenticated, async (req: Request, res: Response) => {
    try {
      const buyerId = req.session.buyerId as number;
      
      const requestData = { ...req.body, buyerId };
      const validationResult = insertPurchaseRequestSchema.safeParse(requestData);
      
      if (!validationResult.success) {
        return res.status(400).json({ message: "Invalid request data", errors: validationResult.error.errors });
      }
      
      // Verify the listing exists
      const listing = await storage.getCropListing(requestData.listingId);
      if (!listing) {
        return res.status(404).json({ message: "Crop listing not found" });
      }
      
      // Add the farmer ID from the listing
      const requestWithFarmer = {
        ...validationResult.data,
        farmerId: listing.farmerId
      };
      
      const newRequest = await storage.createPurchaseRequest(requestWithFarmer);
      return res.status(201).json(newRequest);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Error creating purchase request" });
    }
  });
  
  app.put('/api/purchase-requests/:id/farmer', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const requestId = parseInt(req.params.id);
      const farmerId = req.session.farmerId as number;
      
      if (isNaN(requestId)) {
        return res.status(400).json({ message: "Invalid request ID" });
      }
      
      const request = await storage.getPurchaseRequest(requestId);
      
      if (!request) {
        return res.status(404).json({ message: "Purchase request not found" });
      }
      
      // Check if request is for this farmer
      if (request.farmerId !== farmerId) {
        return res.status(403).json({ message: "Unauthorized access to this request" });
      }
      
      // Only allow status changes through this endpoint
      if (!req.body.status) {
        return res.status(400).json({ message: "Status update is required" });
      }
      
      // Only allow status changes to "accepted" or "rejected"
      if (req.body.status !== "accepted" && req.body.status !== "rejected") {
        return res.status(400).json({ message: "Status must be 'accepted' or 'rejected'" });
      }
      
      const updatedRequest = await storage.updatePurchaseRequest(requestId, req.body);
      return res.status(200).json(updatedRequest);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Error updating purchase request" });
    }
  });
  
  app.put('/api/purchase-requests/:id/buyer', isBuyerAuthenticated, async (req: Request, res: Response) => {
    try {
      const requestId = parseInt(req.params.id);
      const buyerId = req.session.buyerId as number;
      
      if (isNaN(requestId)) {
        return res.status(400).json({ message: "Invalid request ID" });
      }
      
      const request = await storage.getPurchaseRequest(requestId);
      
      if (!request) {
        return res.status(404).json({ message: "Purchase request not found" });
      }
      
      // Check if request is from this buyer
      if (request.buyerId !== buyerId) {
        return res.status(403).json({ message: "Unauthorized access to this request" });
      }
      
      // Buyer can only update some fields (e.g., payment status, notes)
      const allowedFields = ["paymentStatus", "notes", "paymentMethod"];
      const filteredBody: Record<string, any> = Object.keys(req.body)
        .filter(key => allowedFields.includes(key))
        .reduce((obj, key) => {
          obj[key] = req.body[key];
          return obj;
        }, {} as Record<string, any>);
      
      if (Object.keys(filteredBody).length === 0) {
        return res.status(400).json({ message: "No valid fields to update" });
      }
      
      // If payment status is "completed", also update the request status
      if (filteredBody.paymentStatus === "completed") {
        filteredBody.status = "completed";
      }
      
      const updatedRequest = await storage.updatePurchaseRequest(requestId, filteredBody);
      return res.status(200).json(updatedRequest);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Error updating purchase request" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
