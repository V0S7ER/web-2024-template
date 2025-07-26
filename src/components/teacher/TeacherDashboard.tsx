import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Avatar,
  Divider,
  Chip,
} from '@mui/material';
import {
  Assessment as AssessmentIcon,
  Description as DescriptionIcon,
  Notifications as NotificationsIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { Presentation } from '../../types';
import * as presentationService from '../../services/presentationService';
import * as evaluationService from '../../services/evaluationService';
import { PresentationList } from '../student/PresentationList';
import { NotificationsPanel } from '../common/NotificationsPanel';
import { EvaluationForm } from './EvaluationForm';
import { TeacherStats } from './TeacherStats';
import { AddPresentationButton } from '../common/AddPresentationButton';

export const TeacherDashboard = () => {
  const { user } = useAuth();
  const [presentations, setPresentations] = useState<Presentation[]>([]);
  const [selectedPresentation, setSelectedPresentation] = useState<Presentation | null>(null);
  const [isEvaluationOpen, setIsEvaluationOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isStatsOpen, setIsStatsOpen] = useState(false);

  useEffect(() => {
    if (user) {
      loadPresentations();
    }
  }, [user]);

  const loadPresentations = async () => {
    const teacherPresentations = presentationService.getPresentationsForTeacher();
    setPresentations(teacherPresentations);
  };

  const handleEvaluatePresentation = (presentation: Presentation) => {
    setSelectedPresentation(presentation);
    setIsEvaluationOpen(true);
  };

  const handleEvaluationComplete = () => {
    setIsEvaluationOpen(false);
    setSelectedPresentation(null);
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

  const pendingPresentations = presentations.filter(p => p.status === 'pending').length;
  const reviewedPresentations = presentations.filter(p => p.status === 'reviewed').length;
  const totalPresentations = presentations.length;

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
              Личный кабинет учителя
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
            variant="outlined"
            startIcon={<SettingsIcon />}
            onClick={() => setIsStatsOpen(true)}
          >
            Статистика
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
                    {reviewedPresentations}
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
        Презентации для оценки
      </Typography>
      
      <PresentationList 
        presentations={presentations}
        onPresentationUpdated={loadPresentations}
        showTeacherActions={true}
        onEvaluate={handleEvaluatePresentation}
      />

      {/* Кнопка добавления презентации (только для демонстрации) */}
      <AddPresentationButton 
        onClick={() => alert('Учителя не могут загружать презентации. Эта функция доступна только ученикам.')}
        tooltip="Учителя не могут загружать презентации"
        disabled={true}
      />

      {/* Модальные окна */}
      {selectedPresentation && (
        <EvaluationForm
          open={isEvaluationOpen}
          presentation={selectedPresentation}
          onClose={() => {
            setIsEvaluationOpen(false);
            setSelectedPresentation(null);
          }}
          onEvaluated={handleEvaluationComplete}
        />
      )}

      <NotificationsPanel
        open={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
      />

      <TeacherStats
        open={isStatsOpen}
        onClose={() => setIsStatsOpen(false)}
      />
    </Box>
  );
}; 