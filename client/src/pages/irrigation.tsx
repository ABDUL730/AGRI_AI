import { useState, useEffect } from "react";
import MainLayout from "@/components/layout/main-layout";
import { useLanguage } from "@/hooks/use-language";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Droplets, CalendarClock, History, Plus, Settings2, Activity, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Field, IrrigationSystem, IrrigationSchedule, IrrigationHistory } from "@shared/schema";
import { IrrigationSystemForm } from "@/components/irrigation/irrigation-system-form";
import { IrrigationScheduleForm } from "@/components/irrigation/irrigation-schedule-form";
import { IrrigationHistoryForm } from "@/components/irrigation/irrigation-history-form";

export default function Irrigation() {
  const { t } = useLanguage();
  const [selectedFieldId, setSelectedFieldId] = useState<number | null>(null);
  const [selectedSystem, setSelectedSystem] = useState<IrrigationSystem | null>(null);
  const [createSystemOpen, setCreateSystemOpen] = useState(false);
  const [createScheduleOpen, setCreateScheduleOpen] = useState(false);
  const [createHistoryOpen, setCreateHistoryOpen] = useState(false);

  // Fetch fields
  const { 
    data: fields,
    isLoading: isFieldsLoading,
    error: fieldsError 
  } = useQuery<Field[]>({ 
    queryKey: ['/api/fields']
  });

  // Fetch irrigation systems when a field is selected
  const {
    data: systems,
    isLoading: isSystemsLoading,
    error: systemsError,
    refetch: refetchSystems
  } = useQuery<IrrigationSystem[]>({
    queryKey: ['/api/irrigation-systems/field', selectedFieldId],
    enabled: !!selectedFieldId,
  });

  // Fetch irrigation schedules when a system is selected
  const {
    data: schedules,
    isLoading: isSchedulesLoading,
    error: schedulesError,
    refetch: refetchSchedules
  } = useQuery<IrrigationSchedule[]>({
    queryKey: ['/api/irrigation-schedules/system', selectedSystem?.id],
    enabled: !!selectedSystem,
  });

  // Fetch irrigation history when a field is selected
  const {
    data: history,
    isLoading: isHistoryLoading,
    error: historyError,
    refetch: refetchHistory
  } = useQuery<IrrigationHistory[]>({
    queryKey: ['/api/irrigation-history/field', selectedFieldId],
    enabled: !!selectedFieldId,
  });

  // Set the first field as selected when fields are loaded
  useEffect(() => {
    if (fields && fields.length > 0 && !selectedFieldId) {
      setSelectedFieldId(fields[0].id);
    }
  }, [fields, selectedFieldId]);

  // Set the first system as selected when systems are loaded
  useEffect(() => {
    if (systems && systems.length > 0) {
      setSelectedSystem(systems[0]);
    } else {
      setSelectedSystem(null);
    }
  }, [systems]);

  // Handle form submission success
  const handleSystemCreated = () => {
    setCreateSystemOpen(false);
    refetchSystems();
  };

  const handleScheduleCreated = () => {
    setCreateScheduleOpen(false);
    refetchSchedules();
  };

  const handleHistoryCreated = () => {
    setCreateHistoryOpen(false);
    refetchHistory();
  };

  // Format date for display
  const formatDate = (dateString: string | Date) => {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Get system status color
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-500';
      case 'inactive':
        return 'bg-gray-500';
      case 'maintenance':
        return 'bg-yellow-500';
      case 'offline':
        return 'bg-red-500';
      default:
        return 'bg-blue-500';
    }
  };

  // Placeholder for systems or schedules if none exist
  const NoSystemsMessage = () => (
    <div className="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-lg">
      <Droplets className="h-12 w-12 text-gray-400 mb-4" />
      <h3 className="text-lg font-medium">{t("No Irrigation Systems")}</h3>
      <p className="text-sm text-gray-500 mb-4 text-center">
        {t("You haven't set up any irrigation systems for this field yet.")}
      </p>
      <Button onClick={() => setCreateSystemOpen(true)}>
        <Plus className="h-4 w-4 mr-2" />
        {t("Add Irrigation System")}
      </Button>
    </div>
  );

  const NoSchedulesMessage = () => (
    <div className="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-lg">
      <CalendarClock className="h-12 w-12 text-gray-400 mb-4" />
      <h3 className="text-lg font-medium">{t("No Irrigation Schedules")}</h3>
      <p className="text-sm text-gray-500 mb-4 text-center">
        {t("You haven't set up any irrigation schedules for this system yet.")}
      </p>
      <Button onClick={() => setCreateScheduleOpen(true)}>
        <Plus className="h-4 w-4 mr-2" />
        {t("Create Schedule")}
      </Button>
    </div>
  );

  const NoHistoryMessage = () => (
    <div className="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-lg">
      <History className="h-12 w-12 text-gray-400 mb-4" />
      <h3 className="text-lg font-medium">{t("No Irrigation History")}</h3>
      <p className="text-sm text-gray-500 mb-4 text-center">
        {t("There's no recorded irrigation history for this field yet.")}
      </p>
      <Button onClick={() => setCreateHistoryOpen(true)}>
        <Plus className="h-4 w-4 mr-2" />
        {t("Record Irrigation")}
      </Button>
    </div>
  );

  return (
    <MainLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-heading font-bold text-gray-900">{t("Irrigation Management")}</h1>
        <p className="mt-1 text-sm text-gray-600">{t("Monitor and control irrigation for your fields")}</p>
      </div>

      {/* Field selection */}
      <div className="mb-6">
        <div className="flex items-center">
          <Select
            value={selectedFieldId?.toString() || ""}
            onValueChange={(value) => setSelectedFieldId(Number(value))}
            disabled={isFieldsLoading || fields?.length === 0}
          >
            <SelectTrigger className="w-full md:w-[300px]">
              <SelectValue placeholder={t("Select a field")} />
            </SelectTrigger>
            <SelectContent>
              {fields?.map((field) => (
                <SelectItem key={field.id} value={field.id.toString()}>
                  {field.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button 
            variant="outline" 
            className="ml-2"
            onClick={() => setCreateSystemOpen(true)}
            disabled={!selectedFieldId}
          >
            <Plus className="h-4 w-4 mr-2" />
            {t("Add System")}
          </Button>
          
          <Button 
            variant="outline" 
            className="ml-2"
            onClick={() => setCreateHistoryOpen(true)}
            disabled={!systems || systems.length === 0}
          >
            <Plus className="h-4 w-4 mr-2" />
            {t("Record Irrigation")}
          </Button>
        </div>
      </div>

      {isFieldsLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : fields?.length === 0 ? (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
          <div className="flex flex-col items-center justify-center h-64">
            <div className="text-center">
              <Droplets className="mx-auto h-12 w-12 text-gray-400" />
              <h2 className="mt-2 text-lg font-medium text-gray-900">{t("No Fields Available")}</h2>
              <p className="mt-1 text-gray-500">
                {t("You need to add a field before setting up irrigation systems.")}
              </p>
              <Button className="mt-4" asChild>
                <a href="/crop-management">{t("Go to Field Management")}</a>
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <Tabs defaultValue="systems" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="systems">
              <Droplets className="h-4 w-4 mr-2" />
              {t("Systems")}
            </TabsTrigger>
            <TabsTrigger value="schedules" disabled={!selectedSystem}>
              <CalendarClock className="h-4 w-4 mr-2" />
              {t("Schedules")}
            </TabsTrigger>
            <TabsTrigger value="history">
              <History className="h-4 w-4 mr-2" />
              {t("History")}
            </TabsTrigger>
          </TabsList>
          
          {/* Systems Tab */}
          <TabsContent value="systems" className="mt-4">
            {isSystemsLoading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : systems && systems.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {systems.map((system) => (
                  <Card key={system.id} className={`${system.id === selectedSystem?.id ? 'ring-2 ring-primary' : ''}`}>
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>{system.name}</CardTitle>
                          <CardDescription>{t(system.type)}</CardDescription>
                        </div>
                        <Badge className={getStatusColor(system.status)}>
                          {t(system.status)}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="font-medium">{t("Water Source")}:</span>
                          <span className="ml-1">{t(system.waterSource)}</span>
                        </div>
                        <div>
                          <span className="font-medium">{t("Coverage")}:</span>
                          <span className="ml-1">{system.coverageArea} {t("acres")}</span>
                        </div>
                        <div>
                          <span className="font-medium">{t("Efficiency")}:</span>
                          <span className="ml-1">{system.efficiency || "N/A"}%</span>
                        </div>
                        <div>
                          <span className="font-medium">{t("Installed")}:</span>
                          <span className="ml-1">{new Date(system.installationDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                      
                      {system.isSmartEnabled && system.sensorData && (
                        <div className="mt-4">
                          <h4 className="text-sm font-medium mb-2">{t("Sensor Data")}</h4>
                          <div className="space-y-2">
                            {system.sensorData.moisture && (
                              <div>
                                <div className="flex justify-between text-xs">
                                  <span>{t("Soil Moisture")}</span>
                                  <span>{system.sensorData.moisture}%</span>
                                </div>
                                <Progress value={system.sensorData.moisture} className="h-2" />
                              </div>
                            )}
                            {system.sensorData.batteryLevel && (
                              <div>
                                <div className="flex justify-between text-xs">
                                  <span>{t("Battery")}</span>
                                  <span>{system.sensorData.batteryLevel}%</span>
                                </div>
                                <Progress value={system.sensorData.batteryLevel} className="h-2" />
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </CardContent>
                    <CardFooter className="border-t pt-3 flex justify-between">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setSelectedSystem(system)}
                      >
                        <Settings2 className="h-4 w-4 mr-2" />
                        {t("Manage")}
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setCreateScheduleOpen(true)}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        {t("Schedule")}
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <NoSystemsMessage />
            )}
          </TabsContent>
          
          {/* Schedules Tab */}
          <TabsContent value="schedules" className="mt-4">
            {!selectedSystem ? (
              <div className="bg-gray-50 rounded-lg p-6 text-center">
                {t("Please select an irrigation system first")}
              </div>
            ) : isSchedulesLoading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : schedules && schedules.length > 0 ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">
                    {t("Schedules for")} {selectedSystem.name}
                  </h3>
                  <Button onClick={() => setCreateScheduleOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    {t("Add Schedule")}
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {schedules.map((schedule) => (
                    <Card key={schedule.id}>
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle>{schedule.name}</CardTitle>
                            <CardDescription>
                              {t(schedule.frequency)}
                              {schedule.frequency === "Weekly" && schedule.daysOfWeek && 
                                `: ${schedule.daysOfWeek.map(day => t(day)).join(', ')}`}
                            </CardDescription>
                          </div>
                          <Badge className={schedule.isActive ? "bg-green-500" : "bg-gray-500"}>
                            {schedule.isActive ? t("Active") : t("Inactive")}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="font-medium">{t("Start Time")}:</span>
                            <span className="ml-1">{new Date(schedule.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                          </div>
                          <div>
                            <span className="font-medium">{t("Duration")}:</span>
                            <span className="ml-1">{schedule.duration} {t("min")}</span>
                          </div>
                          <div>
                            <span className="font-medium">{t("Status")}:</span>
                            <span className="ml-1">{t(schedule.status)}</span>
                          </div>
                          <div>
                            <span className="font-medium">{t("Water Amount")}:</span>
                            <span className="ml-1">{schedule.waterAmount || "Auto"} {schedule.waterAmount ? t("L") : ""}</span>
                          </div>
                          {schedule.nextRunTime && (
                            <div className="col-span-2">
                              <span className="font-medium">{t("Next Run")}:</span>
                              <span className="ml-1">{formatDate(schedule.nextRunTime)}</span>
                            </div>
                          )}
                          {schedule.lastRunTime && (
                            <div className="col-span-2">
                              <span className="font-medium">{t("Last Run")}:</span>
                              <span className="ml-1">{formatDate(schedule.lastRunTime)}</span>
                            </div>
                          )}
                        </div>
                      </CardContent>
                      <CardFooter className="border-t pt-3 flex justify-between">
                        <Button variant="outline" size="sm">
                          <Settings2 className="h-4 w-4 mr-2" />
                          {t("Edit")}
                        </Button>
                        <Button 
                          variant={schedule.isActive ? "destructive" : "outline"} 
                          size="sm"
                        >
                          {schedule.isActive ? t("Deactivate") : t("Activate")}
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </div>
            ) : (
              <NoSchedulesMessage />
            )}
          </TabsContent>
          
          {/* History Tab */}
          <TabsContent value="history" className="mt-4">
            {isHistoryLoading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : history && history.length > 0 ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">
                    {t("Irrigation History")}
                  </h3>
                  <Button onClick={() => setCreateHistoryOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    {t("Record Irrigation")}
                  </Button>
                </div>
                <div className="overflow-hidden rounded-md border">
                  <table className="w-full min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t("Date")}</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t("System")}</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t("Duration")}</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t("Water Used")}</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t("Status")}</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {history.map((entry) => {
                        const system = systems?.find(s => s.id === entry.systemId);
                        return (
                          <tr key={entry.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatDate(entry.startTime)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{system?.name || entry.systemId}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{entry.duration} {t("min")}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{entry.waterUsed || "N/A"} {entry.waterUsed ? t("L") : ""}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <Badge className={
                                entry.status === "Completed" ? "bg-green-500" :
                                entry.status === "Interrupted" ? "bg-yellow-500" :
                                entry.status === "Failed" ? "bg-red-500" : "bg-blue-500"
                              }>
                                {t(entry.status)}
                              </Badge>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <NoHistoryMessage />
            )}
          </TabsContent>
        </Tabs>
      )}

      {/* Create Irrigation System Dialog */}
      <Dialog open={createSystemOpen} onOpenChange={setCreateSystemOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>{t("Add Irrigation System")}</DialogTitle>
            <DialogDescription>
              {t("Set up a new irrigation system for your field")}
            </DialogDescription>
          </DialogHeader>
          {selectedFieldId && (
            <IrrigationSystemForm
              fieldId={selectedFieldId}
              onSuccess={handleSystemCreated}
              onCancel={() => setCreateSystemOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Create Irrigation Schedule Dialog */}
      <Dialog open={createScheduleOpen} onOpenChange={setCreateScheduleOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>{t("Create Irrigation Schedule")}</DialogTitle>
            <DialogDescription>
              {t("Schedule irrigation for your system")}
            </DialogDescription>
          </DialogHeader>
          {selectedSystem && (
            <IrrigationScheduleForm
              systemId={selectedSystem.id}
              onSuccess={handleScheduleCreated}
              onCancel={() => setCreateScheduleOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Record Irrigation History Dialog */}
      <Dialog open={createHistoryOpen} onOpenChange={setCreateHistoryOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>{t("Record Irrigation")}</DialogTitle>
            <DialogDescription>
              {t("Record a manual irrigation event")}
            </DialogDescription>
          </DialogHeader>
          {selectedFieldId && systems && systems.length > 0 && (
            <IrrigationHistoryForm
              fieldId={selectedFieldId}
              systems={systems}
              onSuccess={handleHistoryCreated}
              onCancel={() => setCreateHistoryOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
