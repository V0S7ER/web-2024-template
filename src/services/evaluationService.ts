import { Evaluation, EvaluationCriteria, CriteriaScore, Presentation } from '../types';

const EVALUATIONS_KEY = 'project_evaluation_evaluations';
const CRITERIA_KEY = 'project_evaluation_criteria';

// Инициализация демо-критериев
const initializeDemoCriteria = (): EvaluationCriteria[] => {
  const demoCriteria: EvaluationCriteria[] = [
    {
      id: '1',
      name: 'Оригинальность идеи',
      description: 'Новизна и креативность предложенного решения',
      maxScore: 10,
      weight: 0.25,
      isActive: true,
    },
    {
      id: '2',
      name: 'Глубина проработки темы',
      description: 'Детальность и полнота исследования',
      maxScore: 10,
      weight: 0.25,
      isActive: true,
    },
    {
      id: '3',
      name: 'Качество презентации',
      description: 'Структурированность и наглядность материала',
      maxScore: 10,
      weight: 0.2,
      isActive: true,
    },
    {
      id: '4',
      name: 'Техническая реализация',
      description: 'Качество технического исполнения',
      maxScore: 10,
      weight: 0.2,
      isActive: true,
    },
    {
      id: '5',
      name: 'Практическая значимость',
      description: 'Применимость результатов на практике',
      maxScore: 10,
      weight: 0.1,
      isActive: true,
    },
  ];

  localStorage.setItem(CRITERIA_KEY, JSON.stringify(demoCriteria));
  return demoCriteria;
};

export const getCriteria = (): EvaluationCriteria[] => {
  const criteria = localStorage.getItem(CRITERIA_KEY);
  if (!criteria) {
    return initializeDemoCriteria();
  }
  return JSON.parse(criteria);
};

export const saveCriteria = (criteria: EvaluationCriteria[]): void => {
  localStorage.setItem(CRITERIA_KEY, JSON.stringify(criteria));
};

export const getEvaluations = (): Evaluation[] => {
  const evaluations = localStorage.getItem(EVALUATIONS_KEY);
  if (!evaluations) {
    return [];
  }
  return JSON.parse(evaluations).map((evaluation: any) => ({
    ...evaluation,
    evaluatedAt: new Date(evaluation.evaluatedAt),
  }));
};

export const saveEvaluations = (evaluations: Evaluation[]): void => {
  localStorage.setItem(EVALUATIONS_KEY, JSON.stringify(evaluations));
};

export const createEvaluation = async (
  evaluationData: Omit<Evaluation, 'id' | 'evaluatedAt'>
): Promise<Evaluation> => {
  const evaluations = getEvaluations();
  
  const newEvaluation: Evaluation = {
    ...evaluationData,
    id: Date.now().toString(),
    evaluatedAt: new Date(),
  };
  
  const updatedEvaluations = [...evaluations, newEvaluation];
  saveEvaluations(updatedEvaluations);
  
  return newEvaluation;
};

export const updateEvaluation = async (
  evaluationId: string,
  updates: Partial<Evaluation>
): Promise<Evaluation> => {
  const evaluations = getEvaluations();
  const evaluationIndex = evaluations.findIndex(e => e.id === evaluationId);
  
  if (evaluationIndex === -1) {
    throw new Error('Оценка не найдена');
  }
  
  evaluations[evaluationIndex] = { ...evaluations[evaluationIndex], ...updates };
  saveEvaluations(evaluations);
  
  return evaluations[evaluationIndex];
};

export const deleteEvaluation = async (evaluationId: string): Promise<void> => {
  const evaluations = getEvaluations();
  const filteredEvaluations = evaluations.filter(e => e.id !== evaluationId);
  saveEvaluations(filteredEvaluations);
};

export const getEvaluationsByPresentation = (presentationId: string): Evaluation[] => {
  const evaluations = getEvaluations();
  return evaluations.filter(e => e.presentationId === presentationId);
};

export const getEvaluationsByTeacher = (teacherId: string): Evaluation[] => {
  const evaluations = getEvaluations();
  return evaluations.filter(e => e.teacherId === teacherId);
};

export const calculateTotalScore = (criteriaScores: CriteriaScore[]): number => {
  return criteriaScores.reduce((total, score) => {
    const weightedScore = (score.score / score.maxScore) * score.weight;
    return total + weightedScore;
  }, 0) * 100; // Умножаем на 100 для получения процентов
};

export const addCriteria = async (criteria: Omit<EvaluationCriteria, 'id'>): Promise<EvaluationCriteria> => {
  const allCriteria = getCriteria();
  
  const newCriteria: EvaluationCriteria = {
    ...criteria,
    id: Date.now().toString(),
  };
  
  const updatedCriteria = [...allCriteria, newCriteria];
  saveCriteria(updatedCriteria);
  
  return newCriteria;
};

export const updateCriteria = async (
  criteriaId: string,
  updates: Partial<EvaluationCriteria>
): Promise<EvaluationCriteria> => {
  const allCriteria = getCriteria();
  const criteriaIndex = allCriteria.findIndex(c => c.id === criteriaId);
  
  if (criteriaIndex === -1) {
    throw new Error('Критерий не найден');
  }
  
  allCriteria[criteriaIndex] = { ...allCriteria[criteriaIndex], ...updates };
  saveCriteria(allCriteria);
  
  return allCriteria[criteriaIndex];
};

export const deleteCriteria = async (criteriaId: string): Promise<void> => {
  const allCriteria = getCriteria();
  const filteredCriteria = allCriteria.filter(c => c.id !== criteriaId);
  saveCriteria(filteredCriteria);
}; 