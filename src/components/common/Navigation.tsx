import { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Avatar,
  Menu,
  MenuItem,
  IconButton,
  Badge,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  AccountCircle as AccountCircleIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import * as notificationService from '../../services/notificationService';
import { NotificationsPanel } from './NotificationsPanel';

interface NavigationProps {
  onLogout: () => void;
}

export const Navigation = ({ onLogout }: NavigationProps) => {
  const { user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    onLogout();
    handleMenuClose();
  };

  const handleNotificationsClick = () => {
    setIsNotificationsOpen(true);
  };

  const getRoleText = (role: string) => {
    switch (role) {
      case 'student':
        return 'Ученик';
      case 'teacher':
        return 'Учитель';
      case 'admin':
        return 'Администратор';
      default:
        return role;
    }
  };

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Система оценивания проектов
          </Typography>

          {user && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <IconButton
                color="inherit"
                onClick={handleNotificationsClick}
                sx={{ mr: 1 }}
              >
                <Badge badgeContent={unreadCount} color="error">
                  <NotificationsIcon />
                </Badge>
              </IconButton>

              <Button
                color="inherit"
                onClick={handleMenuOpen}
                startIcon={
                  <Avatar sx={{ width: 24, height: 24, fontSize: '0.875rem' }}>
                    {user.name?.charAt(0) || 'У'}
                  </Avatar>
                }
              >
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', ml: 1 }}>
                  <Typography variant="body2" sx={{ lineHeight: 1 }}>
                    {user.name}
                  </Typography>
                  <Typography variant="caption" sx={{ lineHeight: 1 }}>
                    {getRoleText(user.role)}
                  </Typography>
                </Box>
              </Button>

              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
              >
                <MenuItem onClick={handleMenuClose}>
                  <AccountCircleIcon sx={{ mr: 1 }} />
                  Профиль
                </MenuItem>
                <MenuItem onClick={handleLogout}>
                  <LogoutIcon sx={{ mr: 1 }} />
                  Выйти
                </MenuItem>
              </Menu>
            </Box>
          )}
        </Toolbar>
      </AppBar>

      <NotificationsPanel
        open={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
      />
    </>
  );
}; 