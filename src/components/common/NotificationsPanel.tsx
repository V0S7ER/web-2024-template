import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Typography,
  Box,
  Chip,
  IconButton,
  Divider,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Info as InfoIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { Notification } from '../../types';
import * as notificationService from '../../services/notificationService';

interface NotificationsPanelProps {
  open: boolean;
  onClose: () => void;
}

export const NotificationsPanel = ({ open, onClose }: NotificationsPanelProps) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open && user) {
      loadNotifications();
    }
  }, [open, user]);

  const loadNotifications = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const userNotifications = notificationService.getNotificationsByUser(user.id);
      setNotifications(userNotifications);
    } catch (error) {
      console.error('Ошибка при загрузке уведомлений:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await notificationService.markNotificationAsRead(notificationId);
      loadNotifications();
    } catch (error) {
      console.error('Ошибка при отметке уведомления:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!user) return;
    
    try {
      await notificationService.markAllNotificationsAsRead(user.id);
      loadNotifications();
    } catch (error) {
      console.error('Ошибка при отметке всех уведомлений:', error);
    }
  };

  const handleDeleteNotification = async (notificationId: string) => {
    try {
      await notificationService.deleteNotification(notificationId);
      loadNotifications();
    } catch (error) {
      console.error('Ошибка при удалении уведомления:', error);
    }
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircleIcon color="success" />;
      case 'warning':
        return <WarningIcon color="warning" />;
      case 'error':
        return <ErrorIcon color="error" />;
      default:
        return <InfoIcon color="info" />;
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">
            Уведомления
            {unreadCount > 0 && (
              <Chip
                label={unreadCount}
                color="primary"
                size="small"
                sx={{ ml: 1 }}
              />
            )}
          </Typography>
          {unreadCount > 0 && (
            <Button
              size="small"
              onClick={handleMarkAllAsRead}
              disabled={isLoading}
            >
              Отметить все как прочитанные
            </Button>
          )}
        </Box>
      </DialogTitle>
      
      <DialogContent>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <Typography>Загрузка уведомлений...</Typography>
          </Box>
        ) : notifications.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <NotificationsIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Уведомлений нет
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Здесь будут появляться уведомления о новых презентациях и оценках
            </Typography>
          </Box>
        ) : (
          <List>
            {notifications.map((notification, index) => (
              <Box key={notification.id}>
                <ListItem
                  sx={{
                    bgcolor: notification.isRead ? 'transparent' : 'action.hover',
                    borderRadius: 1,
                    mb: 1,
                  }}
                >
                  <ListItemIcon>
                    {getNotificationIcon(notification.type)}
                  </ListItemIcon>
                  
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography
                          variant="subtitle2"
                          sx={{
                            fontWeight: notification.isRead ? 'normal' : 'bold',
                          }}
                        >
                          {notification.title}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          {!notification.isRead && (
                            <Chip
                              label="Новое"
                              color="primary"
                              size="small"
                            />
                          )}
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteNotification(notification.id)}
                          >
                            <ClearIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          {notification.message}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatDate(notification.createdAt)}
                        </Typography>
                      </Box>
                    }
                  />
                  
                  {!notification.isRead && (
                    <Button
                      size="small"
                      onClick={() => handleMarkAsRead(notification.id)}
                    >
                      Прочитано
                    </Button>
                  )}
                </ListItem>
                
                {index < notifications.length - 1 && <Divider />}
              </Box>
            ))}
          </List>
        )}
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose}>
          Закрыть
        </Button>
      </DialogActions>
    </Dialog>
  );
}; 