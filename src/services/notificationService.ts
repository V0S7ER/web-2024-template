import { Notification } from '../types';

const NOTIFICATIONS_KEY = 'project_evaluation_notifications';

export const getNotifications = (): Notification[] => {
  const notifications = localStorage.getItem(NOTIFICATIONS_KEY);
  if (!notifications) {
    return [];
  }
  return JSON.parse(notifications).map((notification: any) => ({
    ...notification,
    createdAt: new Date(notification.createdAt),
  }));
};

export const saveNotifications = (notifications: Notification[]): void => {
  localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));
};

export const createNotification = async (
  notificationData: Omit<Notification, 'id' | 'createdAt' | 'isRead'>
): Promise<Notification> => {
  const notifications = getNotifications();
  
  const newNotification: Notification = {
    ...notificationData,
    id: Date.now().toString(),
    createdAt: new Date(),
    isRead: false,
  };
  
  const updatedNotifications = [...notifications, newNotification];
  saveNotifications(updatedNotifications);
  
  return newNotification;
};

export const markNotificationAsRead = async (notificationId: string): Promise<void> => {
  const notifications = getNotifications();
  const notificationIndex = notifications.findIndex(n => n.id === notificationId);
  
  if (notificationIndex !== -1) {
    notifications[notificationIndex].isRead = true;
    saveNotifications(notifications);
  }
};

export const markAllNotificationsAsRead = async (userId: string): Promise<void> => {
  const notifications = getNotifications();
  const updatedNotifications = notifications.map(notification => 
    notification.userId === userId ? { ...notification, isRead: true } : notification
  );
  saveNotifications(updatedNotifications);
};

export const deleteNotification = async (notificationId: string): Promise<void> => {
  const notifications = getNotifications();
  const filteredNotifications = notifications.filter(n => n.id !== notificationId);
  saveNotifications(filteredNotifications);
};

export const getNotificationsByUser = (userId: string): Notification[] => {
  const notifications = getNotifications();
  return notifications.filter(n => n.userId === userId);
};

export const getUnreadNotificationsCount = (userId: string): number => {
  const notifications = getNotifications();
  return notifications.filter(n => n.userId === userId && !n.isRead).length;
};

export const notifyNewPresentation = async (studentId: string, presentationTitle: string): Promise<void> => {
  // Уведомляем всех учителей о новой презентации
  const users = JSON.parse(localStorage.getItem('project_evaluation_users') || '[]');
  const teachers = users.filter((user: any) => user.role === 'teacher');
  
  for (const teacher of teachers) {
    await createNotification({
      userId: teacher.id,
      title: 'Новая презентация для оценки',
      message: `Ученик загрузил новую презентацию: "${presentationTitle}"`,
      type: 'info',
      relatedType: 'presentation',
    });
  }
};

export const notifyEvaluationComplete = async (
  studentId: string,
  presentationTitle: string,
  teacherName: string
): Promise<void> => {
  await createNotification({
    userId: studentId,
    title: 'Оценка презентации завершена',
    message: `${teacherName} оценил вашу презентацию "${presentationTitle}"`,
    type: 'success',
    relatedType: 'evaluation',
  });
}; 