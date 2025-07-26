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
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  People as PeopleIcon,
  Assessment as AssessmentIcon,
  Settings as SettingsIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Description as DescriptionIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { User, EvaluationCriteria, Presentation, Evaluation } from '../../types';
import * as authService from '../../services/authService';
import * as evaluationService from '../../services/evaluationService';
import * as presentationService from '../../services/presentationService';
import { AddPresentationButton } from '../common/AddPresentationButton';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`admin-tabpanel-${index}`}
      aria-labelledby={`admin-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
};

export const AdminDashboard = () => {
  const { user } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [users, setUsers] = useState<User[]>([]);
  const [criteria, setCriteria] = useState<EvaluationCriteria[]>([]);
  const [presentations, setPresentations] = useState<Presentation[]>([]);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
  const [isCriteriaDialogOpen, setIsCriteriaDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editingCriteria, setEditingCriteria] = useState<EvaluationCriteria | null>(null);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    const allUsers = authService.getUsers();
    const allCriteria = evaluationService.getCriteria();
    const allPresentations = presentationService.getPresentations();
    const allEvaluations = evaluationService.getEvaluations();
    setUsers(allUsers);
    setCriteria(allCriteria);
    setPresentations(allPresentations);
    setEvaluations(allEvaluations);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleAddUser = () => {
    setEditingUser(null);
    setIsUserDialogOpen(true);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setIsUserDialogOpen(true);
  };

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm('Вы уверены, что хотите удалить этого пользователя?')) {
      try {
        await authService.deleteUser(userId);
        loadData();
      } catch (error) {
        console.error('Ошибка при удалении пользователя:', error);
      }
    }
  };

  const handleAddCriteria = () => {
    setEditingCriteria(null);
    setIsCriteriaDialogOpen(true);
  };

  const handleEditCriteria = (criteria: EvaluationCriteria) => {
    setEditingCriteria(criteria);
    setIsCriteriaDialogOpen(true);
  };

  const handleDeleteCriteria = async (criteriaId: string) => {
    if (window.confirm('Вы уверены, что хотите удалить этот критерий?')) {
      try {
        await evaluationService.deleteCriteria(criteriaId);
        loadData();
      } catch (error) {
        console.error('Ошибка при удалении критерия:', error);
      }
    }
  };

  const getPresentationStats = (presentation: Presentation) => {
    const evaluationsForPresentation = evaluations.filter(e => e.presentationId === presentation.id);
    const totalEvaluations = evaluationsForPresentation.length;
    const averageScore = totalEvaluations > 0 
      ? evaluationsForPresentation.reduce((sum, evaluation) => sum + evaluation.totalScore, 0) / totalEvaluations
      : 0;
    
    return {
      totalEvaluations,
      averageScore,
      evaluations: evaluationsForPresentation,
    };
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

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  };

  const totalUsers = users.length;
  const studentsCount = users.filter(u => u.role === 'student').length;
  const teachersCount = users.filter(u => u.role === 'teacher').length;
  const adminsCount = users.filter(u => u.role === 'admin').length;

  return (
    <Box sx={{ p: 3 }}>
      {/* Заголовок */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ bgcolor: 'primary.main' }}>
            {user?.name?.charAt(0) || 'А'}
          </Avatar>
          <Box>
            <Typography variant="h4" component="h1">
              Панель администратора
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {user?.name}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Статистика */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <PeopleIcon color="primary" sx={{ fontSize: 40 }} />
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
        
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <PeopleIcon color="success" sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="h4" component="div">
                    {studentsCount}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Учеников
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <AssessmentIcon color="info" sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="h4" component="div">
                    {teachersCount}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Учителей
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <DescriptionIcon color="secondary" sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="h4" component="div">
                    {presentations.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Презентаций
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <TrendingUpIcon color="success" sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="h4" component="div">
                    {evaluations.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Оценок
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={2}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <SettingsIcon color="warning" sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="h4" component="div">
                    {adminsCount}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Администраторов
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Divider sx={{ my: 3 }} />

      {/* Табы */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Пользователи" />
          <Tab label="Критерии оценки" />
          <Tab label="Презентации" />
          <Tab label="Оценки" />
        </Tabs>
      </Box>

      {/* Таб пользователей */}
      <TabPanel value={tabValue} index={0}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Управление пользователями</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddUser}
          >
            Добавить пользователя
          </Button>
        </Box>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Имя</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Роль</TableCell>
                <TableCell>Дата регистрации</TableCell>
                <TableCell align="right">Действия</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{getRoleText(user.role)}</TableCell>
                  <TableCell>{formatDate(user.createdAt)}</TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={() => handleEditUser(user)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDeleteUser(user.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      {/* Таб критериев */}
      <TabPanel value={tabValue} index={1}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Критерии оценки</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddCriteria}
          >
            Добавить критерий
          </Button>
        </Box>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Название</TableCell>
                <TableCell>Описание</TableCell>
                <TableCell>Максимальный балл</TableCell>
                <TableCell>Вес</TableCell>
                <TableCell>Статус</TableCell>
                <TableCell align="right">Действия</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {criteria.map((criterion) => (
                <TableRow key={criterion.id}>
                  <TableCell>{criterion.name}</TableCell>
                  <TableCell>{criterion.description}</TableCell>
                  <TableCell>{criterion.maxScore}</TableCell>
                  <TableCell>{criterion.weight}</TableCell>
                  <TableCell>
                    {criterion.isActive ? 'Активен' : 'Неактивен'}
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={() => handleEditCriteria(criterion)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDeleteCriteria(criterion.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      {/* Таб презентаций */}
      <TabPanel value={tabValue} index={2}>
        <Typography variant="h6" gutterBottom>
          Презентации и их оценки
        </Typography>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Название</TableCell>
                <TableCell>Автор</TableCell>
                <TableCell>Дата загрузки</TableCell>
                <TableCell>Статус</TableCell>
                <TableCell align="right">Количество оценок</TableCell>
                <TableCell align="right">Средний балл</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {presentations.map((presentation) => {
                const stats = getPresentationStats(presentation);
                return (
                  <TableRow key={presentation.id}>
                    <TableCell>{presentation.title}</TableCell>
                    <TableCell>{presentation.studentName}</TableCell>
                    <TableCell>{formatDate(presentation.uploadedAt)}</TableCell>
                    <TableCell>
                      {presentation.status === 'pending' ? 'Ожидает оценки' :
                       presentation.status === 'reviewed' ? 'Оценено' :
                       presentation.status === 'approved' ? 'Одобрено' : 'Отклонено'}
                    </TableCell>
                    <TableCell align="right">{stats.totalEvaluations}</TableCell>
                    <TableCell align="right">
                      {stats.averageScore > 0 ? `${stats.averageScore.toFixed(1)}%` : 'Нет оценок'}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      {/* Таб оценок */}
      <TabPanel value={tabValue} index={3}>
        <Typography variant="h6" gutterBottom>
          Детальная таблица оценок
        </Typography>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Презентация</TableCell>
                <TableCell>Автор</TableCell>
                <TableCell>Оценщик</TableCell>
                <TableCell>Общий балл</TableCell>
                <TableCell>Дата оценки</TableCell>
                <TableCell>Комментарии</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {evaluations.map((evaluation) => {
                const presentation = presentations.find(p => p.id === evaluation.presentationId);
                return (
                  <TableRow key={evaluation.id}>
                    <TableCell>{presentation?.title || 'Неизвестная презентация'}</TableCell>
                    <TableCell>{presentation?.studentName || 'Неизвестный автор'}</TableCell>
                    <TableCell>{evaluation.teacherName}</TableCell>
                    <TableCell>{evaluation.totalScore.toFixed(1)}%</TableCell>
                    <TableCell>{formatDate(evaluation.evaluatedAt)}</TableCell>
                    <TableCell>
                      {evaluation.comments ? (
                        <Typography variant="body2" sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {evaluation.comments}
                        </Typography>
                      ) : (
                        'Нет комментариев'
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      {/* Кнопка добавления презентации (только для демонстрации) */}
      <AddPresentationButton 
        onClick={() => alert('Администраторы не могут загружать презентации. Эта функция доступна только ученикам.')}
        tooltip="Администраторы не могут загружать презентации"
        disabled={true}
      />
    </Box>
  );
}; 