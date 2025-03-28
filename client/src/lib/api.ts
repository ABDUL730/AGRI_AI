import { apiRequest } from "@/lib/queryClient";
import type {
  Farmer,
  Field,
  CropRecommendation,
  FinancialAssistance,
  MarketData,
  ChatMessage,
  Notification
} from "@shared/schema";

// Authentication API
export async function loginUser(username: string, password: string): Promise<Farmer> {
  const response = await apiRequest("POST", "/api/auth/login", { username, password });
  return response.json();
}

export async function registerUser(userData: {
  username: string;
  password: string;
  fullName: string;
  location: string;
  phoneNumber: string;
  preferredLanguage: string;
}): Promise<Farmer> {
  const response = await apiRequest("POST", "/api/auth/register", userData);
  return response.json();
}

export async function logoutUser(): Promise<void> {
  await apiRequest("POST", "/api/auth/logout", {});
}

export async function getCurrentUser(): Promise<Farmer> {
  const response = await apiRequest("GET", "/api/auth/check", undefined);
  return response.json();
}

export async function requestPasswordReset(username: string): Promise<void> {
  await apiRequest("POST", "/api/auth/reset-password-request", { username });
}

export async function resetPassword(token: string, newPassword: string): Promise<void> {
  await apiRequest("POST", "/api/auth/reset-password", { token, newPassword });
}

// Fields API
export async function getFields(): Promise<Field[]> {
  const response = await apiRequest("GET", "/api/fields", undefined);
  return response.json();
}

export async function getField(id: number): Promise<Field> {
  const response = await apiRequest("GET", `/api/fields/${id}`, undefined);
  return response.json();
}

export async function createField(fieldData: {
  name: string;
  size: number;
  soilType: string;
  location: string;
  currentCrop?: string;
  cropVariety?: string;
  plantingDate?: Date;
}): Promise<Field> {
  const response = await apiRequest("POST", "/api/fields", fieldData);
  return response.json();
}

// Crop Recommendations API
export async function getCropRecommendations(): Promise<CropRecommendation[]> {
  const response = await apiRequest("GET", "/api/crop-recommendations", undefined);
  return response.json();
}

// Financial Assistance API
export async function getFinancialAssistance(): Promise<FinancialAssistance[]> {
  const response = await apiRequest("GET", "/api/financial-assistance", undefined);
  return response.json();
}

// Market Data API
export async function getMarketData(): Promise<MarketData[]> {
  const response = await apiRequest("GET", "/api/market-data", undefined);
  return response.json();
}

// Chat Messages API
export async function getChatMessages(): Promise<ChatMessage[]> {
  const response = await apiRequest("GET", "/api/chat-messages", undefined);
  return response.json();
}

export async function sendChatMessage(message: string): Promise<ChatMessage[]> {
  const response = await apiRequest("POST", "/api/chat-messages", {
    sender: "user",
    message
  });
  return response.json();
}

// Notifications API
export async function getNotifications(): Promise<Notification[]> {
  const response = await apiRequest("GET", "/api/notifications", undefined);
  return response.json();
}

export async function markNotificationAsRead(id: number): Promise<Notification> {
  const response = await apiRequest("POST", `/api/notifications/${id}/read`, {});
  return response.json();
}
