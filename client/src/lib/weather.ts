import { apiRequest } from "@/lib/queryClient";
import type { WeatherData } from "@shared/schema";

/**
 * Fetches weather data for a specific location
 * @param location The location to get weather data for
 * @returns Weather data for the specified location
 */
export async function getWeatherByLocation(location: string): Promise<WeatherData> {
  try {
    const response = await fetch(`/api/weather?location=${encodeURIComponent(location)}`, {
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch weather data: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error fetching weather data:", error);
    throw error;
  }
}

/**
 * Helper function to get weather icon based on condition
 * @param condition The weather condition
 * @returns Material icon name for the condition
 */
export function getWeatherIcon(condition: string): string {
  const conditionLower = condition.toLowerCase();
  
  if (conditionLower.includes('rain') || conditionLower.includes('drizzle')) {
    return 'rainy';
  } else if (conditionLower.includes('snow')) {
    return 'ac_unit';
  } else if (conditionLower.includes('cloud')) {
    return 'cloud';
  } else if (conditionLower.includes('clear') || conditionLower.includes('sunny')) {
    return 'wb_sunny';
  } else if (conditionLower.includes('thunder') || conditionLower.includes('storm')) {
    return 'flash_on';
  } else if (conditionLower.includes('fog') || conditionLower.includes('mist')) {
    return 'filter_drama';
  } else {
    return 'wb_sunny'; // Default
  }
}

/**
 * Formats weather advisory into farmer-friendly messages
 * @param advisory Raw advisory text
 * @returns Formatted advisory message
 */
export function formatWeatherAdvisory(advisory: string): string {
  return advisory; // Already formatted from the server
}

/**
 * Determines if a weather condition is suitable for specific farming activities
 * @param condition The weather condition
 * @param activity The farming activity to check
 * @returns Whether the condition is suitable for the activity
 */
export function isWeatherSuitableForActivity(condition: string, activity: 'planting' | 'harvesting' | 'spraying' | 'irrigation'): boolean {
  const conditionLower = condition.toLowerCase();
  
  switch (activity) {
    case 'planting':
      return !conditionLower.includes('rain') && !conditionLower.includes('storm');
    case 'harvesting':
      return !conditionLower.includes('rain') && !conditionLower.includes('storm');
    case 'spraying':
      return !conditionLower.includes('rain') && !conditionLower.includes('wind');
    case 'irrigation':
      return conditionLower.includes('clear') || conditionLower.includes('sunny');
    default:
      return true;
  }
}
