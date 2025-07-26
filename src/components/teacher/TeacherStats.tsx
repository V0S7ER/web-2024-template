import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Divider,
} from '@mui/material';
import {
  Assessment as AssessmentIcon,
  Description as DescriptionIcon,
  TrendingUp as TrendingUpIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { Presentation, Evaluation } from '../../types';
import * as presentationService from '../../services/presentationService';
import * as evaluationService from '../../services/evaluationService';

interface TeacherStatsProps {
  open: boolean;
  onClose: () => void;
}

export const TeacherStats = ({ open, onClose }: TeacherStatsProps) => {
  const { user } = useAuth();
  const [presentations, setPresentations] = useState<Presentation[]>([]);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open && user) {
      loadStats();
    }
  }, [open, user]);

  const loadStats = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const allPresentations = presentationService.getPresentations();
      const teacherEvaluations = evaluationService.getEvaluationsByTeacher(user.id);
      
      setPresentations(allPresentations);
      setEvaluations(teacherEvaluations);
    } catch (error) {
      console.error('Ошибка при загрузке статистики:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const totalPresentations = presentations.length;
  const pendingPresentations = presentations.filter(p => p.status === 'pending').length;
  const evaluatedPresentations = presentations.filter(p => p.status === 'reviewed' || p.status === 'approved').length;
  const totalEvaluations = evaluations.length;

  const averageScore = evaluations.length > 0
    ? evaluations.reduce((sum, evaluation) => sum + evaluation.totalScore, 0) / evaluations.length
    : 0;

  const evaluationsByMonth = evaluations.reduce((acc, evaluation) => {
    const month = new Date(evaluation.evaluatedAt).toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' });
    acc[month] = (acc[month] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topStudents = presentations
    .filter(p => p.evaluations && p.evaluations.length > 0)
    .map(presentation => {
      const avgScore = presentation.evaluations.reduce((sum, evaluation) => sum + evaluation.totalScore, 0) / presentation.evaluations.length;
      return {
        studentName: presentation.studentName,
        presentationTitle: presentation.title,
        averageScore: avgScore,
      };
    })
    .sort((a, b) => b.averageScore - a.averageScore)
    .slice(0, 5);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Typography variant="h5">
          Статистика и отчеты
        </Typography>
      </DialogTitle>
      
      <DialogContent>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <Typography>Загрузка статистики...</Typography>
          </Box>
        ) : (
          <Box>
            {/* Общая статистика */}
            <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
              Общая статистика
            </Typography>
            
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={6} md={3}>
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
              
              <Grid item xs={12} sm={6} md={3}>
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
              
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <TrendingUpIcon color="success" sx={{ fontSize: 40 }} />
                      <Box>
                        <Typography variant="h4" component="div">
                          {totalEvaluations}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Ваших оценок
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <PersonIcon color="info" sx={{ fontSize: 40 }} />
                      <Box>
                        <Typography variant="h4" component="div">
                          {averageScore.toFixed(1)}%
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Средняя оценка
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            {/* Топ учеников */}
            <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
              Лучшие ученики
            </Typography>
            
            {topStudents.length > 0 ? (
              <TableContainer component={Paper} sx={{ mb: 4 }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Место</TableCell>
                      <TableCell>Ученик</TableCell>
                      <TableCell>Презентация</TableCell>
                      <TableCell align="right">Средний балл</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {topStudents.map((student, index) => (
                      <TableRow key={index}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>{student.studentName}</TableCell>
                        <TableCell>{student.presentationTitle}</TableCell>
                        <TableCell align="right">{student.averageScore.toFixed(1)}%</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body2" color="text.secondary">
                  Нет данных для отображения
                </Typography>
              </Box>
            )}

            <Divider sx={{ my: 3 }} />

            {/* Статистика по месяцам */}
            <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
              Оценки по месяцам
            </Typography>
            
            {Object.keys(evaluationsByMonth).length > 0 ? (
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Месяц</TableCell>
                      <TableCell align="right">Количество оценок</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {Object.entries(evaluationsByMonth)
                      .sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime())
                      .map(([month, count]) => (
                        <TableRow key={month}>
                          <TableCell>{month}</TableCell>
                          <TableCell align="right">{count}</TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body2" color="text.secondary">
                  Нет данных для отображения
                </Typography>
              </Box>
            )}
          </Box>
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