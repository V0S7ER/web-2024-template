import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Divider,
} from '@mui/material';
import {
  Assessment as AssessmentIcon,
  Description as DescriptionIcon,
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
} from '@mui/icons-material';
import { Presentation, Evaluation, User } from '../../types';
import * as presentationService from '../../services/presentationService';
import * as evaluationService from '../../services/evaluationService';
import * as authService from '../../services/authService';

interface StatisticsProps {
  userId?: string;
  showPersonalStats?: boolean;
}

export const Statistics = ({ userId, showPersonalStats = false }: StatisticsProps) => {
  const [presentations, setPresentations] = useState<Presentation[]>([]);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, [userId]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const allPresentations = presentationService.getPresentations();
      const allEvaluations = evaluationService.getEvaluations();
      const allUsers = authService.getUsers();
      
      setPresentations(allPresentations);
      setEvaluations(allEvaluations);
      setUsers(allUsers);
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
  const totalUsers = users.length;
  const studentsCount = users.filter(u => u.role === 'student').length;
  const teachersCount = users.filter(u => u.role === 'teacher').length;

  const averageScore = evaluations.length > 0
    ? evaluations.reduce((sum, evaluation) => sum + evaluation.totalScore, 0) / evaluations.length
    : 0;

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

  const evaluationsByMonth = evaluations.reduce((acc, evaluation) => {
    const month = new Date(evaluation.evaluatedAt).toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' });
    acc[month] = (acc[month] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <Typography>Загрузка статистики...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Общая статистика */}
      <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
        {showPersonalStats ? 'Персональная статистика' : 'Общая статистика системы'}
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
                    Всего оценок
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
                <PeopleIcon color="info" sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="h4" component="div">
                    {totalUsers}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Пользователей
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Divider sx={{ my: 3 }} />

      {/* Дополнительная статистика */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Распределение пользователей
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography>Ученики</Typography>
                <Typography variant="h6">{studentsCount}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography>Учителя</Typography>
                <Typography variant="h6">{teachersCount}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography>Средняя оценка</Typography>
                <Typography variant="h6">{averageScore.toFixed(1)}%</Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Статус презентаций
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography>Оценено</Typography>
                <Typography variant="h6">{evaluatedPresentations}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography>Ожидают оценки</Typography>
                <Typography variant="h6">{pendingPresentations}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography>Процент оцененных</Typography>
                <Typography variant="h6">
                  {totalPresentations > 0 ? ((evaluatedPresentations / totalPresentations) * 100).toFixed(1) : 0}%
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <Divider sx={{ my: 3 }} />

      {/* Топ учеников */}
      {topStudents.length > 0 && (
        <>
          <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
            Лучшие ученики
          </Typography>
          
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
        </>
      )}

      {/* Статистика по месяцам */}
      {Object.keys(evaluationsByMonth).length > 0 && (
        <>
          <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
            Оценки по месяцам
          </Typography>
          
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
        </>
      )}
    </Box>
  );
}; 