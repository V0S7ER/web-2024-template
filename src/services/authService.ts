import { User, AuthState } from '../types';

const USERS_KEY = 'project_evaluation_users';
const CURRENT_USER_KEY = 'project_evaluation_current_user';

// Инициализация демо-данных
const initializeDemoData = (): User[] => {
  const demoUsers: User[] = [
    {
      id: '1',
      email: 'admin@school.com',
      name: 'Администратор',
      role: 'admin',
      createdAt: new Date(),
    },
    {
      id: '2',
      email: 'teacher1@school.com',
      name: 'Иванов Иван Иванович',
      role: 'teacher',
      createdAt: new Date(),
    },
    {
      id: '3',
      email: 'teacher2@school.com',
      name: 'Петрова Мария Сергеевна',
      role: 'teacher',
      createdAt: new Date(),
    },
    {
      id: '4',
      email: 'student1@school.com',
      name: 'Сидоров Алексей',
      role: 'student',
      createdAt: new Date(),
    },
    {
      id: '5',
      email: 'student2@school.com',
      name: 'Козлова Анна',
      role: 'student',
      createdAt: new Date(),
    },
  ];

  localStorage.setItem(USERS_KEY, JSON.stringify(demoUsers));
  return demoUsers;
};

export const getUsers = (): User[] => {
  const users = localStorage.getItem(USERS_KEY);
  if (!users) {
    return initializeDemoData();
  }
  return JSON.parse(users).map((user: any) => ({
    ...user,
    createdAt: new Date(user.createdAt),
  }));
};

export const saveUsers = (users: User[]): void => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

export const login = async (email: string, password: string): Promise<User> => {
  const users = getUsers();
  const user = users.find(u => u.email === email);
  
  if (!user) {
    throw new Error('Пользователь не найден');
  }
  
  // В демо-версии пароль не проверяется
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  return user;
};

export const logout = (): void => {
  localStorage.removeItem(CURRENT_USER_KEY);
};

export const getCurrentUser = (): User | null => {
  const user = localStorage.getItem(CURRENT_USER_KEY);
  if (!user) return null;
  
  const parsedUser = JSON.parse(user);
  return {
    ...parsedUser,
    createdAt: new Date(parsedUser.createdAt),
  };
};

export const register = async (userData: Omit<User, 'id' | 'createdAt'>): Promise<User> => {
  const users = getUsers();
  const existingUser = users.find(u => u.email === userData.email);
  
  if (existingUser) {
    throw new Error('Пользователь с таким email уже существует');
  }
  
  const newUser: User = {
    ...userData,
    id: Date.now().toString(),
    createdAt: new Date(),
  };
  
  const updatedUsers = [...users, newUser];
  saveUsers(updatedUsers);
  
  return newUser;
};

export const updateUser = async (userId: string, updates: Partial<User>): Promise<User> => {
  const users = getUsers();
  const userIndex = users.findIndex(u => u.id === userId);
  
  if (userIndex === -1) {
    throw new Error('Пользователь не найден');
  }
  
  users[userIndex] = { ...users[userIndex], ...updates };
  saveUsers(users);
  
  return users[userIndex];
};

export const deleteUser = async (userId: string): Promise<void> => {
  const users = getUsers();
  const filteredUsers = users.filter(u => u.id !== userId);
  saveUsers(filteredUsers);
}; 