import { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Divider,
  Alert,
  Fab,
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  Download as DownloadIcon,
  Delete as DeleteIcon,
  Assessment as AssessmentIcon,
  Description as DescriptionIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { Presentation, Evaluation } from '../../types';
import * as presentationService from '../../services/presentationService';
import * as evaluationService from '../../services/evaluationService';

interface PresentationListProps {
  presentations: Presentation[];
  onPresentationUpdated: () => void;
  showStudentActions?: boolean;
  showTeacherActions?: boolean;
  onEvaluate?: (presentation: Presentation) => void;
  onAddPresentation?: () => void;
}

export const PresentationList = ({
  presentations,
  onPresentationUpdated,
  showStudentActions = false,
  showTeacherActions = false,
  onEvaluate,
  onAddPresentation,
}: PresentationListProps) => {
  const [selectedPresentation, setSelectedPresentation] = useState<Presentation | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);

  const handleDeletePresentation = async (presentationId: string) => {
    if (window.confirm('Вы уверены, что хотите удалить эту презентацию?')) {
      try {
        await presentationService.deletePresentation(presentationId);
        onPresentationUpdated();
      } catch (error) {
        console.error('Ошибка при удалении презентации:', error);
      }
    }
  };

  const handleViewPresentation = (presentation: Presentation) => {
    setSelectedPresentation(presentation);
    setIsViewOpen(true);
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

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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

  if (presentations.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <DescriptionIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h6" color="text.secondary" gutterBottom>
          Презентации не найдены
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {showStudentActions 
            ? 'У вас пока нет загруженных презентаций'
            : 'Нет презентаций для оценки'
          }
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ position: 'relative' }}>
      <Grid container spacing={2}>
        {presentations.map((presentation) => (
          <Grid item xs={12} sm={6} md={4} key={presentation.id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Typography variant="h6" component="h3" noWrap>
                    {presentation.title}
                  </Typography>
                  <Chip
                    label={getStatusText(presentation.status)}
                    color={getStatusColor(presentation.status) as any}
                    size="small"
                  />
                </Box>
                
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {presentation.description || 'Описание отсутствует'}
                </Typography>
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="caption" display="block" color="text.secondary">
                    Автор: {presentation.studentName}
                  </Typography>
                  <Typography variant="caption" display="block" color="text.secondary">
                    Загружено: {formatDate(presentation.uploadedAt)}
                  </Typography>
                  <Typography variant="caption" display="block" color="text.secondary">
                    Файл: {presentation.fileName} ({formatFileSize(presentation.fileSize)})
                  </Typography>
                </Box>

                {presentation.evaluations && presentation.evaluations.length > 0 && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" display="block" color="text.secondary">
                      Оценок: {presentation.evaluations.length}
                    </Typography>
                    {presentation.evaluations.map((evaluation, index) => (
                      <Typography key={index} variant="caption" display="block" color="text.secondary">
                        {evaluation.teacherName}: {evaluation.totalScore.toFixed(1)}%
                      </Typography>
                    ))}
                  </Box>
                )}
              </CardContent>

              <CardActions>
                <Button
                  size="small"
                  startIcon={<VisibilityIcon />}
                  onClick={() => handleViewPresentation(presentation)}
                >
                  Просмотр
                </Button>
                
                {showStudentActions && (
                  <>
                    <Button
                      size="small"
                      startIcon={<DownloadIcon />}
                      href={presentation.fileUrl}
                      target="_blank"
                    >
                      Скачать
                    </Button>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDeletePresentation(presentation.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </>
                )}
                
                {showTeacherActions && presentation.status === 'pending' && onEvaluate && (
                  <Button
                    size="small"
                    variant="contained"
                    startIcon={<AssessmentIcon />}
                    onClick={() => onEvaluate(presentation)}
                  >
                    Оценить
                  </Button>
                )}
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Модальное окно просмотра презентации */}
      <Dialog
        open={isViewOpen}
        onClose={() => setIsViewOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedPresentation?.title}
        </DialogTitle>
        <DialogContent>
          {selectedPresentation && (
            <Box>
              <Typography variant="body1" gutterBottom>
                <strong>Описание:</strong> {selectedPresentation.description || 'Описание отсутствует'}
              </Typography>
              
              <Typography variant="body2" color="text.secondary" gutterBottom>
                <strong>Автор:</strong> {selectedPresentation.studentName}
              </Typography>
              
              <Typography variant="body2" color="text.secondary" gutterBottom>
                <strong>Загружено:</strong> {formatDate(selectedPresentation.uploadedAt)}
              </Typography>
              
              <Typography variant="body2" color="text.secondary" gutterBottom>
                <strong>Файл:</strong> {selectedPresentation.fileName} ({formatFileSize(selectedPresentation.fileSize)})
              </Typography>

              <Divider sx={{ my: 2 }} />

              {selectedPresentation.evaluations && selectedPresentation.evaluations.length > 0 ? (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Оценки
                  </Typography>
                  {selectedPresentation.evaluations.map((evaluation, index) => (
                    <Box key={index} sx={{ mb: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
                      <Typography variant="subtitle2">
                        {evaluation.teacherName} - {evaluation.totalScore.toFixed(1)}%
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {evaluation.comments}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatDate(evaluation.evaluatedAt)}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              ) : (
                <Alert severity="info">
                  Презентация еще не оценена
                </Alert>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsViewOpen(false)}>
            Закрыть
          </Button>
          {selectedPresentation && (
            <Button
              href={selectedPresentation.fileUrl}
              target="_blank"
              startIcon={<DownloadIcon />}
            >
              Скачать
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Кнопка добавления презентации */}
      {onAddPresentation && (
        <Fab
          color="primary"
          aria-label="add presentation"
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
            zIndex: 1000,
          }}
          onClick={onAddPresentation}
        >
          <AddIcon />
        </Fab>
      )}
    </Box>
  );
}; 