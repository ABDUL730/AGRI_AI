import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { 
  insertFarmerSchema, 
  insertFieldSchema,
  insertChatMessageSchema,
  insertCropRecommendationSchema
} from "@shared/schema";

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
      
      // Generate AI response based on user message
      // This is a simplified version - in a real app, you would integrate with an AI service
      let aiResponse = "I'm sorry, I don't understand. Could you please rephrase?";
      
      const userMessageLower = userMessage.message.toLowerCase();
      
      if (userMessageLower.includes("weather")) {
        aiResponse = "Based on the current forecast for your location, expect partly cloudy conditions with a chance of light rain in the next 48 hours.";
      } else if (userMessageLower.includes("crop") || userMessageLower.includes("plant")) {
        aiResponse = "For your soil type and current climate conditions, soybean would be an excellent choice with high market demand.";
      } else if (userMessageLower.includes("pest") || userMessageLower.includes("disease")) {
        aiResponse = "Based on the current humidity levels, there's a risk of fungal diseases. Consider preventive fungicide application if you observe any symptoms.";
      } else if (userMessageLower.includes("loan") || userMessageLower.includes("credit") || userMessageLower.includes("financial")) {
        aiResponse = "You're eligible for the Kisan Credit Card with up to ₹3,00,000 at 4% interest rate. Would you like to apply?";
      } else if (userMessageLower.includes("market") || userMessageLower.includes("price")) {
        aiResponse = "The current e-NAM price for wheat is ₹2,200/quintal, which is 9.2% above MSP. Market demand is trending upward.";
      } else if (userMessageLower.includes("harvest") || userMessageLower.includes("harvesting")) {
        aiResponse = "Based on your crop's current growth stage, optimal harvesting time would be in 30-35 days. I'll send you updates as we get closer.";
      } else if (userMessageLower.includes("water") || userMessageLower.includes("irrigation")) {
        aiResponse = "Your soil moisture sensors indicate adequate levels. No irrigation needed for the next 3-4 days, but monitor closely as temperatures are rising.";
      } else if (userMessageLower.includes("hello") || userMessageLower.includes("hi") || userMessageLower.includes("hey")) {
        aiResponse = "Hello! How can I assist with your farming operations today?";
      }
      
      // Save AI response
      const aiMessageData = {
        farmerId,
        sender: "ai",
        message: aiResponse
      };
      
      const aiMessage = await storage.createChatMessage(aiMessageData);
      
      return res.status(201).json([userMessage, aiMessage]);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Error processing chat message" });
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

  const httpServer = createServer(app);
  return httpServer;
}
