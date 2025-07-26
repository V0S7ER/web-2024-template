import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Alert,
  CircularProgress,
  Slider,
  FormControl,
  FormLabel,
  FormHelperText,
  Divider,
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import { Presentation, EvaluationCriteria, CriteriaScore } from '../../types';
import * as evaluationService from '../../services/evaluationService';
import * as notificationService from '../../services/notificationService';

interface EvaluationFormProps {
  open: boolean;
  presentation: Presentation;
  onClose: () => void;
  onEvaluated: () => void;
}

export const EvaluationForm = ({ open, presentation, onClose, onEvaluated }: EvaluationFormProps) => {
  const { user } = useAuth();
  const [criteria, setCriteria] = useState<EvaluationCriteria[]>([]);
  const [criteriaScores, setCriteriaScores] = useState<Record<string, number>>({});
  const [comments, setComments] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      loadCriteria();
      initializeScores();
    }
  }, [open]);

  const loadCriteria = async () => {
    const activeCriteria = evaluationService.getCriteria().filter(c => c.isActive);
    setCriteria(activeCriteria);
  };

  const initializeScores = () => {
    const initialScores: Record<string, number> = {};
    criteria.forEach(criterion => {
      initialScores[criterion.id] = 0;
    });
    setCriteriaScores(initialScores);
  };

  const handleScoreChange = (criteriaId: string, value: number) => {
    setCriteriaScores(prev => ({
      ...prev,
      [criteriaId]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setError('Пользователь не авторизован');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Создаем оценки по критериям
      const criteriaScoresArray: CriteriaScore[] = criteria.map(criterion => ({
        criteriaId: criterion.id,
        criteriaName: criterion.name,
        score: criteriaScores[criterion.id] || 0,
        maxScore: criterion.maxScore,
        weight: criterion.weight,
      }));

      // Рассчитываем общий балл
      const totalScore = evaluationService.calculateTotalScore(criteriaScoresArray);

      // Создаем оценку
      await evaluationService.createEvaluation({
        presentationId: presentation.id,
        teacherId: user.id,
        teacherName: user.name,
        criteria: criteriaScoresArray,
        totalScore,
        comments,
      });

      // Обновляем статус презентации
      await presentationService.updatePresentation(presentation.id, {
        status: 'reviewed',
      });

      // Отправляем уведомление ученику
      await notificationService.notifyEvaluationComplete(
        presentation.studentId,
        presentation.title,
        user.name
      );

      // Сбрасываем форму
      setComments('');
      initializeScores();
      
      onEvaluated();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Ошибка при сохранении оценки');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setComments('');
      initializeScores();
      setError(null);
      onClose();
    }
  };

  const getScoreLabel = (value: number) => {
    return `${value}`;
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Оценка презентации: {presentation.title}
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Box sx={{ mb: 3 }}>
            <Typography variant="body1" gutterBottom>
              <strong>Автор:</strong> {presentation.studentName}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              <strong>Описание:</strong> {presentation.description || 'Описание отсутствует'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <strong>Файл:</strong> {presentation.fileName}
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Divider sx={{ my: 2 }} />

          <Typography variant="h6" gutterBottom>
            Критерии оценки
          </Typography>

          {criteria.map((criterion) => (
            <Box key={criterion.id} sx={{ mb: 3 }}>
              <FormControl fullWidth>
                <FormLabel>
                  {criterion.name} (максимум: {criterion.maxScore} баллов)
                </FormLabel>
                <FormHelperText>
                  {criterion.description}
                </FormHelperText>
                <Box sx={{ mt: 2, px: 2 }}>
                  <Slider
                    value={criteriaScores[criterion.id] || 0}
                    onChange={(_, value) => handleScoreChange(criterion.id, value as number)}
                    min={0}
                    max={criterion.maxScore}
                    step={1}
                    marks
                    valueLabelDisplay="auto"
                    valueLabelFormat={getScoreLabel}
                    disabled={isSubmitting}
                  />
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Текущая оценка: {criteriaScores[criterion.id] || 0} из {criterion.maxScore}
                </Typography>
              </FormControl>
            </Box>
          ))}

          <Divider sx={{ my: 2 }} />

          <TextField
            fullWidth
            label="Комментарии к оценке"
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            multiline
            rows={4}
            disabled={isSubmitting}
            helperText="Оставьте комментарии к презентации (необязательно)"
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose} disabled={isSubmitting}>
            Отмена
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isSubmitting}
            startIcon={isSubmitting ? <CircularProgress size={20} /> : undefined}
          >
            {isSubmitting ? 'Сохранение...' : 'Сохранить оценку'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}; 