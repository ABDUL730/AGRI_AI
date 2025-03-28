import { useEffect, useState } from "react";
import { useLanguage } from "@/hooks/use-language";
import { useToast } from "@/hooks/use-toast";
import { IrrigationSystem } from "@shared/schema";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiRequest } from "@/lib/queryClient";
import { 
  Droplet, 
  Thermometer, 
  Waves, 
  BatteryMedium, 
  RefreshCw, 
  Power, 
  AlertCircle,
  Cloud,
  CloudRain
} from "lucide-react";

interface IotDashboardProps {
  system: IrrigationSystem;
  onUpdate: () => void;
}

interface SensorData {
  moisture: number | null;
  temperature: number | null;
  humidity: number | null;
  batteryLevel: number;
  lastUpdated?: string;
}

// Simulated weather data
interface WeatherData {
  temperature: number;
  humidity: number;
  precipitation: number;
  forecast: string;
}

export function IotDashboard({ system, onUpdate }: IotDashboardProps) {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [sensors, setSensors] = useState<SensorData>(
    system.sensorData || {
      moisture: null,
      temperature: null,
      humidity: null,
      batteryLevel: 100,
      lastUpdated: new Date().toISOString()
    }
  );
  const [autoMode, setAutoMode] = useState(system.isSmartEnabled || false);
  const [irrigationStatus, setIrrigationStatus] = useState("Inactive");
  const [thresholds, setThresholds] = useState({
    moisture: 30,
    temperature: 35
  });
  const [loading, setLoading] = useState(false);
  
  // Simulated weather data
  const [weather, setWeather] = useState<WeatherData>({
    temperature: 29,
    humidity: 65,
    precipitation: 10,
    forecast: "Partly Cloudy"
  });

  // Simulate updating sensor data
  const refreshSensorData = async () => {
    setLoading(true);
    
    try {
      // In a real application, this would be an API call to get actual sensor data
      // For this demo, we'll simulate with random values
      const newSensorData: SensorData = {
        moisture: Math.floor(Math.random() * 100),
        temperature: 20 + Math.floor(Math.random() * 20),
        humidity: 40 + Math.floor(Math.random() * 40),
        batteryLevel: Math.max(sensors.batteryLevel - Math.floor(Math.random() * 3), 0),
        lastUpdated: new Date().toISOString()
      };
      
      // Update the system in the database
      const response = await apiRequest(
        "PUT", 
        `/api/irrigation-systems/${system.id}`,
        { 
          sensorData: newSensorData,
          isSmartEnabled: autoMode
        }
      );
      
      if (!response.ok) {
        throw new Error("Failed to update sensor data");
      }
      
      setSensors(newSensorData);
      
      // Check if automatic irrigation should trigger
      if (autoMode && 
          newSensorData.moisture !== null && 
          newSensorData.moisture < thresholds.moisture) {
        await triggerIrrigation();
      }
      
      toast({
        title: t("Sensors Updated"),
        description: t("Latest sensor readings have been fetched")
      });
    } catch (error) {
      toast({
        title: t("Error"),
        description: t("Failed to update sensor data"),
        variant: "destructive"
      });
      console.error("Error updating sensor data:", error);
    } finally {
      setLoading(false);
    }
  };
  
  // Simulate triggering irrigation
  const triggerIrrigation = async () => {
    setLoading(true);
    setIrrigationStatus("Running");
    
    try {
      // Create a record in irrigation history
      const response = await apiRequest("POST", "/api/irrigation-history", {
        fieldId: system.fieldId,
        systemId: system.id,
        startTime: new Date().toISOString(),
        endTime: null, // Will be set when irrigation ends
        waterUsed: null, // Will be calculated when irrigation ends
        status: "Running",
        initiatedBy: "IoT System",
        notes: "Automatic irrigation triggered by low soil moisture",
        soilMoistureBefore: sensors.moisture,
        soilMoistureAfter: null, // Will be updated when irrigation ends
        weatherConditions: {
          temperature: weather.temperature,
          humidity: weather.humidity,
          precipitation: weather.precipitation,
          windSpeed: 5 // Sample value
        }
      });
      
      if (!response.ok) {
        throw new Error("Failed to trigger irrigation");
      }
      
      // Simulate irrigation running for a short period
      setTimeout(async () => {
        const newMoistureLevel = Math.min((sensors.moisture || 0) + 40, 100);
        
        // Update sensor data with new moisture level
        const updatedSensorData = {
          ...sensors,
          moisture: newMoistureLevel,
          lastUpdated: new Date().toISOString()
        };
        
        await apiRequest(
          "PUT", 
          `/api/irrigation-systems/${system.id}`,
          { sensorData: updatedSensorData }
        );
        
        setSensors(updatedSensorData);
        setIrrigationStatus("Completed");
        
        toast({
          title: t("Irrigation Completed"),
          description: t("Soil moisture level increased to {{level}}%", { level: newMoistureLevel }),
        });
        
        setLoading(false);
      }, 3000);
      
    } catch (error) {
      toast({
        title: t("Error"),
        description: t("Failed to trigger irrigation"),
        variant: "destructive"
      });
      console.error("Error triggering irrigation:", error);
      setIrrigationStatus("Inactive");
      setLoading(false);
    }
  };
  
  // Toggle auto irrigation mode
  const toggleAutoMode = async (enabled: boolean) => {
    setAutoMode(enabled);
    
    try {
      const response = await apiRequest(
        "PUT", 
        `/api/irrigation-systems/${system.id}`,
        { isSmartEnabled: enabled }
      );
      
      if (!response.ok) {
        throw new Error("Failed to update automatic mode");
      }
      
      toast({
        title: enabled ? t("Auto Mode Enabled") : t("Auto Mode Disabled"),
        description: enabled 
          ? t("System will automatically irrigate when soil moisture is low") 
          : t("Manual control mode active")
      });
    } catch (error) {
      setAutoMode(!enabled); // Revert on error
      toast({
        title: t("Error"),
        description: t("Failed to update automatic mode"),
        variant: "destructive"
      });
    }
  };
  
  // Update thresholds
  const saveThresholds = () => {
    toast({
      title: t("Thresholds Updated"),
      description: t("Automatic irrigation thresholds have been saved")
    });
  };
  
  // Format the lastUpdated time
  const formatLastUpdated = () => {
    if (!sensors.lastUpdated) return "";
    
    const date = new Date(sensors.lastUpdated);
    return date.toLocaleString();
  };
  
  // Get color for moisture level
  const getMoistureColor = (level: number | null) => {
    if (level === null) return "bg-gray-300";
    if (level < 30) return "bg-red-500";
    if (level < 60) return "bg-yellow-500";
    return "bg-green-500";
  };
  
  // Get battery status
  const getBatteryStatus = (level: number) => {
    if (level < 20) return { color: "bg-red-500", icon: <AlertCircle className="h-5 w-5 text-red-500" /> };
    if (level < 50) return { color: "bg-yellow-500", icon: <AlertCircle className="h-5 w-5 text-yellow-500" /> };
    return { color: "bg-green-500", icon: <BatteryMedium className="h-5 w-5 text-green-500" /> };
  };
  
  // Simulate initial data fetch
  useEffect(() => {
    refreshSensorData();
    // In a real application, you might want to set up a polling mechanism 
    // or websocket to get regular updates from the IoT devices
    
    // For demo purposes, we'll just refresh the data every minute
    const interval = setInterval(refreshSensorData, 60000);
    
    return () => clearInterval(interval);
  }, []);
  
  const batteryStatus = getBatteryStatus(sensors.batteryLevel);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{t("Smart Irrigation Control")}</h3>
        <div className="flex items-center gap-2">
          <Badge variant={irrigationStatus === "Running" ? "default" : "outline"}>
            {irrigationStatus === "Running" ? t("Irrigating...") : t(irrigationStatus)}
          </Badge>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={refreshSensorData} 
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Sensor readings */}
        <Card>
          <CardHeader>
            <CardTitle>{t("Soil & Environment")}</CardTitle>
            <CardDescription>
              {t("Last updated")}: {formatLastUpdated()}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Moisture */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <div className="flex items-center gap-2">
                  <Droplet className="h-4 w-4 text-blue-500" />
                  <span>{t("Soil Moisture")}</span>
                </div>
                <span>{sensors.moisture !== null ? `${sensors.moisture}%` : t("No data")}</span>
              </div>
              <Progress 
                value={sensors.moisture || 0} 
                max={100} 
                className={getMoistureColor(sensors.moisture)}
              />
              {sensors.moisture !== null && sensors.moisture < thresholds.moisture && (
                <p className="text-xs text-red-500">{t("Moisture below threshold")}</p>
              )}
            </div>
            
            {/* Temperature */}
            <div className="space-y-1">
              <div className="flex justify-between">
                <div className="flex items-center gap-2">
                  <Thermometer className="h-4 w-4 text-red-500" />
                  <span>{t("Temperature")}</span>
                </div>
                <span>
                  {sensors.temperature !== null ? `${sensors.temperature}°C` : t("No data")}
                </span>
              </div>
            </div>
            
            {/* Humidity */}
            <div className="space-y-1">
              <div className="flex justify-between">
                <div className="flex items-center gap-2">
                  <Waves className="h-4 w-4 text-blue-400" />
                  <span>{t("Humidity")}</span>
                </div>
                <span>
                  {sensors.humidity !== null ? `${sensors.humidity}%` : t("No data")}
                </span>
              </div>
            </div>
            
            {/* Battery */}
            <div className="space-y-1">
              <div className="flex justify-between">
                <div className="flex items-center gap-2">
                  {batteryStatus.icon}
                  <span>{t("Battery")}</span>
                </div>
                <span>{sensors.batteryLevel}%</span>
              </div>
              <Progress 
                value={sensors.batteryLevel} 
                max={100} 
                className={batteryStatus.color}
              />
            </div>
          </CardContent>
        </Card>
        
        {/* Weather Data */}
        <Card>
          <CardHeader>
            <CardTitle>{t("Weather Conditions")}</CardTitle>
            <CardDescription>
              {t("Current and forecast data")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-center mb-4">
              {weather.forecast.includes("Rain") ? (
                <CloudRain className="h-16 w-16 text-blue-500" />
              ) : (
                <Cloud className="h-16 w-16 text-gray-500" />
              )}
            </div>
            
            <div className="text-center mb-4">
              <h3 className="text-2xl font-bold">{weather.temperature}°C</h3>
              <p className="text-muted-foreground">{weather.forecast}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-secondary rounded-md p-2">
                <p className="text-xs text-muted-foreground">{t("Humidity")}</p>
                <p className="font-medium">{weather.humidity}%</p>
              </div>
              
              <div className="bg-secondary rounded-md p-2">
                <p className="text-xs text-muted-foreground">{t("Precipitation")}</p>
                <p className="font-medium">{weather.precipitation}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Controls */}
        <Card>
          <CardHeader>
            <CardTitle>{t("System Controls")}</CardTitle>
            <CardDescription>
              {t("Manage automatic irrigation")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Tabs defaultValue="auto" className="w-full">
              <TabsList className="w-full">
                <TabsTrigger value="auto" className="flex-1">{t("Auto")}</TabsTrigger>
                <TabsTrigger value="manual" className="flex-1">{t("Manual")}</TabsTrigger>
                <TabsTrigger value="settings" className="flex-1">{t("Settings")}</TabsTrigger>
              </TabsList>
              
              <TabsContent value="auto" className="space-y-4 pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">{t("Automatic Irrigation")}</h4>
                    <p className="text-sm text-muted-foreground">
                      {t("Let the system handle irrigation based on sensor data")}
                    </p>
                  </div>
                  <Switch 
                    checked={autoMode} 
                    onCheckedChange={toggleAutoMode}
                    disabled={loading}
                  />
                </div>
                
                <div className="border rounded-md p-3 bg-muted/50">
                  <p className="text-sm">
                    {autoMode
                      ? t("System will irrigate when moisture drops below {{threshold}}%", { threshold: thresholds.moisture })
                      : t("Automatic irrigation is disabled")}
                  </p>
                </div>
              </TabsContent>
              
              <TabsContent value="manual" className="space-y-4 pt-4">
                <div>
                  <h4 className="font-medium">{t("Manual Control")}</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    {t("Trigger irrigation manually as needed")}
                  </p>
                  
                  <Button 
                    onClick={triggerIrrigation} 
                    disabled={loading || irrigationStatus === "Running"}
                    className="w-full"
                  >
                    <Power className="mr-2 h-4 w-4" />
                    {irrigationStatus === "Running" 
                      ? t("Irrigation in Progress...") 
                      : t("Start Irrigation")}
                  </Button>
                </div>
              </TabsContent>
              
              <TabsContent value="settings" className="space-y-4 pt-4">
                <div>
                  <h4 className="font-medium mb-4">{t("Threshold Settings")}</h4>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="moisture-threshold">
                        {t("Moisture Threshold (%)")}
                      </Label>
                      <Input 
                        id="moisture-threshold" 
                        type="number" 
                        min="10" 
                        max="90" 
                        value={thresholds.moisture}
                        onChange={(e) => setThresholds({
                          ...thresholds,
                          moisture: parseInt(e.target.value)
                        })}
                      />
                      <p className="text-xs text-muted-foreground">
                        {t("System will irrigate when moisture drops below this threshold")}
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="temp-threshold">
                        {t("Temperature Threshold (°C)")}
                      </Label>
                      <Input 
                        id="temp-threshold" 
                        type="number" 
                        min="20" 
                        max="40" 
                        value={thresholds.temperature}
                        onChange={(e) => setThresholds({
                          ...thresholds,
                          temperature: parseInt(e.target.value)
                        })}
                      />
                      <p className="text-xs text-muted-foreground">
                        {t("System might skip watering if temperature is above this threshold")}
                      </p>
                    </div>
                    
                    <Button onClick={saveThresholds}>
                      {t("Save Thresholds")}
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter>
            <p className="text-xs text-muted-foreground">
              {t("Smart irrigation helps save water by watering only when necessary")}
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}