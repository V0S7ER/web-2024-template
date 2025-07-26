import { Presentation, User } from '../types';

const PRESENTATIONS_KEY = 'project_evaluation_presentations';

export const getPresentations = (): Presentation[] => {
  const presentations = localStorage.getItem(PRESENTATIONS_KEY);
  if (!presentations) {
    return [];
  }
  return JSON.parse(presentations).map((presentation: any) => ({
    ...presentation,
    uploadedAt: new Date(presentation.uploadedAt),
    evaluations: presentation.evaluations?.map((evaluation: any) => ({
      ...evaluation,
      evaluatedAt: new Date(evaluation.evaluatedAt),
    })) || [],
  }));
};

export const savePresentations = (presentations: Presentation[]): void => {
  localStorage.setItem(PRESENTATIONS_KEY, JSON.stringify(presentations));
};

export const createPresentation = async (
  presentationData: Omit<Presentation, 'id' | 'uploadedAt' | 'evaluations' | 'status'>
): Promise<Presentation> => {
  const presentations = getPresentations();
  
  const newPresentation: Presentation = {
    ...presentationData,
    id: Date.now().toString(),
    uploadedAt: new Date(),
    evaluations: [],
    status: 'pending',
  };
  
  const updatedPresentations = [...presentations, newPresentation];
  savePresentations(updatedPresentations);
  
  return newPresentation;
};

export const updatePresentation = async (
  presentationId: string,
  updates: Partial<Presentation>
): Promise<Presentation> => {
  const presentations = getPresentations();
  const presentationIndex = presentations.findIndex(p => p.id === presentationId);
  
  if (presentationIndex === -1) {
    throw new Error('Презентация не найдена');
  }
  
  presentations[presentationIndex] = { ...presentations[presentationIndex], ...updates };
  savePresentations(presentations);
  
  return presentations[presentationIndex];
};

export const deletePresentation = async (presentationId: string): Promise<void> => {
  const presentations = getPresentations();
  const filteredPresentations = presentations.filter(p => p.id !== presentationId);
  savePresentations(filteredPresentations);
};

export const getPresentationsByStudent = (studentId: string): Presentation[] => {
  const presentations = getPresentations();
  return presentations.filter(p => p.studentId === studentId);
};

export const getPresentationsForTeacher = (): Presentation[] => {
  const presentations = getPresentations();
  return presentations.filter(p => p.status === 'pending' || p.status === 'reviewed');
};

export const uploadFile = async (file: File): Promise<{ fileUrl: string; fileSize: number }> => {
  // В демо-версии создаем URL для файла
  const fileUrl = URL.createObjectURL(file);
  return {
    fileUrl,
    fileSize: file.size,
  };
};

export const getFileExtension = (fileName: string): string => {
  return fileName.split('.').pop()?.toLowerCase() || '';
};

export const isSupportedFileType = (fileName: string): boolean => {
  const extension = getFileExtension(fileName);
  const supportedTypes = ['pdf', 'pptx', 'ppt', 'docx', 'doc'];
  return supportedTypes.includes(extension);
}; 