export interface User {
  id: string;
  email: string;
  name: string;
  role: 'student' | 'teacher' | 'admin';
  avatar?: string;
  createdAt: Date;
}

export interface Presentation {
  id: string;
  title: string;
  description: string;
  studentId: string;
  studentName: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  fileType: string;
  uploadedAt: Date;
  status: 'pending' | 'reviewed' | 'approved' | 'rejected';
  evaluations: Evaluation[];
}

export interface Evaluation {
  id: string;
  presentationId: string;
  teacherId: string;
  teacherName: string;
  criteria: CriteriaScore[];
  totalScore: number;
  comments: string;
  evaluatedAt: Date;
}

export interface CriteriaScore {
  criteriaId: string;
  criteriaName: string;
  score: number;
  maxScore: number;
  weight: number;
}

export interface EvaluationCriteria {
  id: string;
  name: string;
  description: string;
  maxScore: number;
  weight: number;
  isActive: boolean;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  createdAt: Date;
  relatedId?: string;
  relatedType?: 'presentation' | 'evaluation';
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface AppState {
  presentations: Presentation[];
  evaluations: Evaluation[];
  criteria: EvaluationCriteria[];
  notifications: Notification[];
  users: User[];
} 