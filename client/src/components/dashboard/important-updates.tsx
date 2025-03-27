import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/hooks/use-language";
import { apiRequest } from "@/lib/queryClient";
import type { Notification } from "@shared/schema";

export function ImportantUpdates() {
  const { t } = useLanguage();
  
  const { data: notifications, isLoading, error } = useQuery<Notification[]>({
    queryKey: ['/api/notifications'],
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse flex space-x-4">
            <div className="flex-1 space-y-4 py-1">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <span className="material-icons text-red-500 text-3xl">error</span>
            <p className="mt-2 text-gray-600">{t("Failed to load updates")}</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  const getUpdateStyles = (type: string) => {
    switch (type) {
      case 'urgent':
        return {
          bgColor: 'bg-red-50',
          iconColor: 'text-red-500',
          icon: 'priority_high'
        };
      case 'event':
        return {
          bgColor: 'bg-amber-50',
          iconColor: 'text-amber-500',
          icon: 'event'
        };
      default:
        return {
          bgColor: '',
          iconColor: 'text-gray-400',
          icon: 'info'
        };
    }
  };

  const markAsRead = async (id: number) => {
    try {
      await apiRequest('POST', `/api/notifications/${id}/read`, {});
      // Invalidate the notifications cache to trigger a refetch
      await queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  return (
    <Card>
      <CardContent className="px-4 py-5 sm:p-6">
        <div className="flex items-center">
          <span className="flex-shrink-0 rounded-md bg-red-50 p-2">
            <span className="material-icons text-red-500">notifications_active</span>
          </span>
          <h3 className="ml-3 text-lg font-heading font-semibold text-gray-900">{t("Important Updates")}</h3>
        </div>
        <div className="mt-4 space-y-4">
          {notifications && notifications.map((notification) => {
            const styles = getUpdateStyles(notification.type);
            
            return (
              <div 
                key={notification.id} 
                className={`flex items-start p-2 rounded-md ${styles.bgColor}`}
                onClick={() => markAsRead(notification.id)}
              >
                <span className={`flex-shrink-0 h-5 w-5 ${styles.iconColor}`}>
                  <span className="material-icons text-sm">{styles.icon}</span>
                </span>
                <div className="ml-2">
                  <p className="text-sm text-gray-700">
                    {notification.type === 'urgent' && <strong>{t("New!")} </strong>}
                    {notification.description}
                  </p>
                </div>
              </div>
            );
          })}
          
          {(!notifications || notifications.length === 0) && (
            <div className="flex items-start p-2">
              <span className="flex-shrink-0 h-5 w-5 text-gray-400">
                <span className="material-icons text-sm">info</span>
              </span>
              <div className="ml-2">
                <p className="text-sm text-gray-700">{t("No important updates at this time.")}</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
      <div className="bg-gray-50 px-4 py-4">
        <div className="text-sm">
          <a href="#" className="font-medium text-accent hover:text-accent-dark">
            {t("View all notifications")} →
          </a>
        </div>
      </div>
    </Card>
  );
}

export default ImportantUpdates;
