import { db } from './index';
import { log } from '../vite';
import {
  farmers, fields, weatherData, cropRecommendations,
  financialAssistance, marketData, chatMessages, notifications
} from '@shared/schema';

// Helper function to safely execute database operations
async function safeDbOperation<T>(operation: () => Promise<T>, fallback: T, operationName: string): Promise<T> {
  if (!db) {
    log(`Database not available for operation: ${operationName}`, 'seed');
    return fallback;
  }
  
  try {
    return await operation();
  } catch (error) {
    log(`Error in database operation ${operationName}: ${error}`, 'seed');
    return fallback;
  }
}

// Helper for insert operations
async function safeInsert(operation: () => Promise<any>, operationName: string): Promise<void> {
  if (!db) {
    log(`Database not available for operation: ${operationName}`, 'seed');
    return;
  }
  
  try {
    await operation();
    log(`Successfully completed operation: ${operationName}`, 'seed');
  } catch (error) {
    log(`Error in database operation ${operationName}: ${error}`, 'seed');
  }
}

// Seed the database with initial data
async function seedDatabase() {
  log('Seeding database...', 'seed');

  if (!db) {
    log('Database connection is not available, skipping seed', 'seed');
    return;
  }

  try {
    // Check if farmers table is empty
    const existingFarmers = await safeDbOperation(
      () => db!.select().from(farmers).limit(1),
      [],
      'check existing farmers'
    );
    
    if (existingFarmers.length > 0) {
      log('Database already has data, skipping seed', 'seed');
      return;
    }

    // Sample farmer
    const [farmer1] = await safeDbOperation(
      () => db!.insert(farmers).values({
        username: 'farmer1',
        password: 'password123',
        fullName: 'Rajesh Kumar',
        location: 'Anantapur, AP',
        phoneNumber: '+91987654321',
        preferredLanguage: 'english',
        createdAt: new Date()
      }).returning(),
      [{
        id: 1, 
        username: 'farmer1',
        password: 'password123',
        fullName: 'Rajesh Kumar',
        location: 'Anantapur, AP',
        phoneNumber: '+91987654321',
        preferredLanguage: 'english',
        createdAt: new Date()
      }],
      'insert farmer'
    );

    log(`Created farmer: ${farmer1.fullName}`, 'seed');

    // Sample field
    const [field1] = await safeDbOperation(
      () => db!.insert(fields).values({
        name: 'North Field',
        farmerId: farmer1.id,
        location: 'Anantapur, AP',
        size: 5.5,
        soilType: 'Red Sandy Loam',
        currentCrop: 'Groundnut',
        cropVariety: 'TMV-2',
        plantingDate: new Date('2023-06-15'),
        currentGrowthStage: 'Flowering',
        growthPercentage: 65,
        healthStatus: 'Good',
        irrigationStatus: 'Adequate',
        lastIrrigationDate: new Date('2023-07-20')
      }).returning(),
      [{
        id: 1,
        name: 'North Field',
        farmerId: farmer1.id,
        location: 'Anantapur, AP',
        size: 5.5,
        soilType: 'Red Sandy Loam',
        currentCrop: 'Groundnut',
        cropVariety: 'TMV-2',
        plantingDate: new Date('2023-06-15'),
        currentGrowthStage: 'Flowering',
        growthPercentage: 65,
        healthStatus: 'Good',
        irrigationStatus: 'Adequate',
        lastIrrigationDate: new Date('2023-07-20')
      }],
      'insert field'
    );

    log(`Created field: ${field1.name}`, 'seed');

    // Sample weather data
    await safeInsert(
      () => db!.insert(weatherData).values({
        location: 'Anantapur, AP',
        date: new Date(),
        temperature: 32,
        condition: 'Partly Cloudy',
        humidity: 65,
        windSpeed: 12,
        rainChance: 20,
        advisories: ['Moderate irrigation recommended', 'Watch for pests in humid conditions']
      }),
      'insert weather data'
    );

    log('Created weather data', 'seed');

    // Sample crop recommendations
    await safeInsert(
      () => db!.insert(cropRecommendations).values([
        {
          farmerId: farmer1.id,
          cropName: 'Rice',
          cropVariety: 'BPT-5204',
          suitabilityScore: 5,
          description: 'High-yielding variety suitable for irrigated conditions',
          daysToMaturity: 135,
          eNamPrice: 2500,
          priceTrend: 2.5,
          marketDemand: 'High'
        },
        {
          farmerId: farmer1.id,
          cropName: 'Millets',
          cropVariety: 'HHB-67',
          suitabilityScore: 4,
          description: 'Drought-tolerant, ideal for low-rainfall areas',
          daysToMaturity: 90,
          eNamPrice: 2800,
          priceTrend: 5.2,
          marketDemand: 'Growing'
        },
      ]),
      'insert crop recommendations'
    );

    log('Created crop recommendations', 'seed');

    // Sample financial assistance options
    await safeInsert(
      () => db!.insert(financialAssistance).values([
        {
          name: 'Kisan Credit Card',
          type: 'Loan',
          status: 'Available',
          description: 'Short-term loan for purchasing farm inputs',
          amount: 50000,
          interestRate: 4,
          eligibilityDetails: 'All farmers with land records',
          processingTime: '15-20 days'
        },
        {
          name: 'PM-KISAN',
          type: 'Subsidy',
          status: 'Available',
          description: 'Direct income support of Rs. 6000 per year',
          amount: 6000,
          interestRate: null,
          eligibilityDetails: 'Small and marginal farmers',
          processingTime: '30-60 days'
        },
        {
          name: 'Crop Insurance',
          type: 'Insurance',
          status: 'Available',
          description: 'Coverage against crop loss due to natural calamities',
          amount: 20000,
          interestRate: null,
          eligibilityDetails: 'Farmers growing notified crops',
          processingTime: '45 days for claim settlement'
        }
      ]),
      'insert financial assistance'
    );

    log('Created financial assistance options', 'seed');

    // Sample market data
    await safeInsert(
      () => db!.insert(marketData).values([
        {
          commodity: 'Rice',
          grade: 'Grade A',
          market: 'Anantapur APMC',
          state: 'Andhra Pradesh',
          currentPrice: 2200,
          msp: 2060,
          priceChange: 0.5,
          demand: 'High',
          demandPercentage: 80
        },
        {
          commodity: 'Groundnut',
          grade: 'Premium',
          market: 'Anantapur APMC',
          state: 'Andhra Pradesh',
          currentPrice: 5800,
          msp: 5550,
          priceChange: 3.5,
          demand: 'Very High',
          demandPercentage: 95
        },
        {
          commodity: 'Millets',
          grade: 'Organic',
          market: 'Organic Farmer Market',
          state: 'Andhra Pradesh',
          currentPrice: 3200,
          msp: 0,
          priceChange: 8.2,
          demand: 'Growing',
          demandPercentage: 65
        }
      ]),
      'insert market data'
    );

    log('Created market data', 'seed');

    // Sample chat messages
    await safeInsert(
      () => db!.insert(chatMessages).values([
        {
          farmerId: farmer1.id,
          message: 'Hello, I need advice on my groundnut crop.',
          sender: 'farmer',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
        },
        {
          farmerId: farmer1.id,
          message: 'I can help with that. What specific issues are you facing with your groundnut crop?',
          sender: 'ai',
          timestamp: new Date(Date.now() - 1.9 * 60 * 60 * 1000) // 1.9 hours ago
        },
        {
          farmerId: farmer1.id,
          message: 'The leaves are turning yellow and I see some spots.',
          sender: 'farmer',
          timestamp: new Date(Date.now() - 1.8 * 60 * 60 * 1000) // 1.8 hours ago
        }
      ]),
      'insert chat messages'
    );

    log('Created chat messages', 'seed');

    // Sample notifications
    await safeInsert(
      () => db!.insert(notifications).values([
        {
          title: 'Weather Alert',
          description: 'Rainfall expected in your area in the next 24 hours',
          type: 'Weather',
          date: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
          isRead: false
        },
        {
          title: 'Market Update',
          description: 'Groundnut prices have increased by 10% in Anantapur APMC',
          type: 'Market',
          date: new Date(Date.now() - 24 * 60 * 60 * 1000), // 24 hours ago
          isRead: true
        },
        {
          title: 'Subsidy Alert',
          description: 'New government subsidy announced for drip irrigation installation',
          type: 'Financial',
          date: new Date(Date.now() - 48 * 60 * 60 * 1000), // 48 hours ago
          isRead: false
        }
      ]),
      'insert notifications'
    );

    log('Created notifications', 'seed');

    log('Database seeding completed successfully', 'seed');
  } catch (error: any) {
    console.error('Database seeding failed:', error);
    throw error;
  }
}

// Execute seeding function
// This will be imported from server/index.ts, no need to auto-execute

export { seedDatabase };