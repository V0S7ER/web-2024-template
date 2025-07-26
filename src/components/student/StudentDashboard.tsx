import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  Avatar,
  Divider,
} from '@mui/material';
import {
  Add as AddIcon,
  Description as DescriptionIcon,
  Assessment as AssessmentIcon,
  Notifications as NotificationsIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { Presentation } from '../../types';
import * as presentationService from '../../services/presentationService';
import { UploadPresentation } from './UploadPresentation';
import { PresentationList } from './PresentationList';
import { NotificationsPanel } from '../common/NotificationsPanel';
import { AddPresentationButton } from '../common/AddPresentationButton';

export const StudentDashboard = () => {
  const { user } = useAuth();
  const [presentations, setPresentations] = useState<Presentation[]>([]);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  useEffect(() => {
    if (user) {
      loadPresentations();
    }
  }, [user]);

  const loadPresentations = async () => {
    if (!user) return;
    
    const studentPresentations = presentationService.getPresentationsByStudent(user.id);
    setPresentations(studentPresentations);
  };

  const handlePresentationUploaded = () => {
    setIsUploadOpen(false);
    loadPresentations();
  };

  const getStatusColor = (status: Presentation['status']) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'reviewed':
        return 'info';
      case 'approved':
        return 'success';
      case 'rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusText = (status: Presentation['status']) => {
    switch (status) {
      case 'pending':
        return 'Ожидает оценки';
      case 'reviewed':
        return 'Оценено';
      case 'approved':
        return 'Одобрено';
      case 'rejected':
        return 'Отклонено';
      default:
        return status;
    }
  };

  const totalPresentations = presentations.length;
  const pendingPresentations = presentations.filter(p => p.status === 'pending').length;
  const evaluatedPresentations = presentations.filter(p => p.status === 'reviewed' || p.status === 'approved').length;

  return (
    <Box sx={{ p: 3 }}>
      {/* Заголовок */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ bgcolor: 'primary.main' }}>
            {user?.name?.charAt(0) || 'У'}
          </Avatar>
          <Box>
            <Typography variant="h4" component="h1">
              Личный кабинет ученика
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {user?.name}
            </Typography>
          </Box>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<NotificationsIcon />}
            onClick={() => setIsNotificationsOpen(true)}
          >
            Уведомления
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setIsUploadOpen(true)}
          >
            Загрузить презентацию
          </Button>
        </Box>
      </Box>

      {/* Статистика */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <DescriptionIcon color="primary" sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="h4" component="div">
                    {totalPresentations}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Всего презентаций
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <AssessmentIcon color="warning" sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="h4" component="div">
                    {pendingPresentations}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Ожидают оценки
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <AssessmentIcon color="success" sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="h4" component="div">
                    {evaluatedPresentations}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Оценено
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Divider sx={{ my: 3 }} />

      {/* Список презентаций */}
      <Typography variant="h5" component="h2" gutterBottom>
        Мои презентации
      </Typography>
      
      <PresentationList 
        presentations={presentations}
        onPresentationUpdated={loadPresentations}
        showStudentActions={true}
      />

      {/* Кнопка добавления презентации */}
      <AddPresentationButton 
        onClick={() => setIsUploadOpen(true)}
        tooltip="Загрузить новую презентацию"
      />

      {/* Модальные окна */}
      <UploadPresentation
        open={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUploaded={handlePresentationUploaded}
      />

      <NotificationsPanel
        open={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
      />
    </Box>
  );
}; 