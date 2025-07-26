import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Alert,
  CircularProgress,
  Paper,
} from '@mui/material';
import {
  Download as DownloadIcon,
  OpenInNew as OpenInNewIcon,
} from '@mui/icons-material';
import { Presentation } from '../../types';

interface PresentationViewerProps {
  open: boolean;
  presentation: Presentation | null;
  onClose: () => void;
}

export const PresentationViewer = ({ open, presentation, onClose }: PresentationViewerProps) => {
  const [isLoading, setIsLoading] = useState(false);

  if (!presentation) return null;

  const getFileIcon = (fileType: string) => {
    const extension = fileType.toLowerCase();
    if (extension.includes('pdf')) return '📄';
    if (extension.includes('pptx') || extension.includes('ppt')) return '📊';
    if (extension.includes('docx') || extension.includes('doc')) return '📝';
    return '📎';
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

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = presentation.fileUrl;
    link.download = presentation.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleOpenInNewTab = () => {
    window.open(presentation.fileUrl, '_blank');
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <span style={{ fontSize: '2rem' }}>
            {getFileIcon(presentation.fileType)}
          </span>
          <Typography variant="h6">
            {presentation.title}
          </Typography>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Typography variant="body1" gutterBottom>
            <strong>Описание:</strong> {presentation.description || 'Описание отсутствует'}
          </Typography>
          
          <Typography variant="body2" color="text.secondary" gutterBottom>
            <strong>Автор:</strong> {presentation.studentName}
          </Typography>
          
          <Typography variant="body2" color="text.secondary" gutterBottom>
            <strong>Загружено:</strong> {formatDate(presentation.uploadedAt)}
          </Typography>
          
          <Typography variant="body2" color="text.secondary" gutterBottom>
            <strong>Файл:</strong> {presentation.fileName} ({formatFileSize(presentation.fileSize)})
          </Typography>
        </Box>

        <Paper sx={{ p: 2, bgcolor: 'background.paper' }}>
          <Typography variant="h6" gutterBottom>
            Информация о файле
          </Typography>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Typography variant="body2">
              <strong>Тип файла:</strong> {presentation.fileType}
            </Typography>
            <Typography variant="body2">
              <strong>Размер:</strong> {formatFileSize(presentation.fileSize)}
            </Typography>
            <Typography variant="body2">
              <strong>Статус:</strong> {
                presentation.status === 'pending' ? 'Ожидает оценки' :
                presentation.status === 'reviewed' ? 'Оценено' :
                presentation.status === 'approved' ? 'Одобрено' :
                'Отклонено'
              }
            </Typography>
          </Box>
        </Paper>

        {presentation.evaluations && presentation.evaluations.length > 0 && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Оценки ({presentation.evaluations.length})
            </Typography>
            
            {presentation.evaluations.map((evaluation, index) => (
              <Paper key={index} sx={{ p: 2, mb: 2, bgcolor: 'background.paper' }}>
                <Typography variant="subtitle2" gutterBottom>
                  {evaluation.teacherName} - {evaluation.totalScore.toFixed(1)}%
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {evaluation.comments}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {formatDate(evaluation.evaluatedAt)}
                </Typography>
              </Paper>
            ))}
          </Box>
        )}
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose}>
          Закрыть
        </Button>
        <Button
          startIcon={<DownloadIcon />}
          onClick={handleDownload}
        >
          Скачать
        </Button>
        <Button
          startIcon={<OpenInNewIcon />}
          onClick={handleOpenInNewTab}
          variant="contained"
        >
          Открыть
        </Button>
      </DialogActions>
    </Dialog>
  );
}; 