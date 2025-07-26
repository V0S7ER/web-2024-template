import { useState } from 'react';
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { CloudUpload as CloudUploadIcon } from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import * as presentationService from '../../services/presentationService';
import * as notificationService from '../../services/notificationService';

interface UploadPresentationProps {
  open: boolean;
  onClose: () => void;
  onUploaded: () => void;
}

export const UploadPresentation = ({ open, onClose, onUploaded }: UploadPresentationProps) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!presentationService.isSupportedFileType(file.name)) {
        setError('Неподдерживаемый формат файла. Поддерживаемые форматы: PDF, PPTX, PPT, DOCX, DOC');
        return;
      }
      
      if (file.size > 50 * 1024 * 1024) { // 50MB limit
        setError('Файл слишком большой. Максимальный размер: 50MB');
        return;
      }
      
      setSelectedFile(file);
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFile || !formData.title.trim()) {
      setError('Пожалуйста, заполните все обязательные поля и выберите файл');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      // Загружаем файл
      const { fileUrl, fileSize } = await presentationService.uploadFile(selectedFile);
      
      // Создаем презентацию
      await presentationService.createPresentation({
        title: formData.title,
        description: formData.description,
        studentId: user!.id,
        studentName: user!.name,
        fileName: selectedFile.name,
        fileUrl,
        fileSize,
        fileType: selectedFile.type || presentationService.getFileExtension(selectedFile.name),
      });

      // Отправляем уведомления учителям
      await notificationService.notifyNewPresentation(user!.id, formData.title);

      // Сбрасываем форму
      setFormData({ title: '', description: '' });
      setSelectedFile(null);
      
      onUploaded();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Ошибка при загрузке файла');
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    if (!isUploading) {
      setFormData({ title: '', description: '' });
      setSelectedFile(null);
      setError(null);
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Загрузить презентацию</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Поддерживаемые форматы: PDF, PPTX, PPT, DOCX, DOC
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Максимальный размер файла: 50MB
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <TextField
            fullWidth
            label="Название презентации"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            margin="normal"
            required
            disabled={isUploading}
          />

          <TextField
            fullWidth
            label="Описание (необязательно)"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            margin="normal"
            multiline
            rows={3}
            disabled={isUploading}
          />

          <Box sx={{ mt: 2 }}>
            <input
              accept=".pdf,.pptx,.ppt,.docx,.doc"
              style={{ display: 'none' }}
              id="file-upload"
              type="file"
              onChange={handleFileSelect}
              disabled={isUploading}
            />
            <label htmlFor="file-upload">
              <Button
                variant="outlined"
                component="span"
                startIcon={<CloudUploadIcon />}
                disabled={isUploading}
                fullWidth
                sx={{ py: 2 }}
              >
                {selectedFile ? selectedFile.name : 'Выбрать файл'}
              </Button>
            </label>
          </Box>

          {selectedFile && (
            <Box sx={{ mt: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
              <Typography variant="body2">
                <strong>Выбранный файл:</strong> {selectedFile.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Размер: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </Typography>
            </Box>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose} disabled={isUploading}>
            Отмена
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isUploading || !selectedFile || !formData.title.trim()}
            startIcon={isUploading ? <CircularProgress size={20} /> : undefined}
          >
            {isUploading ? 'Загрузка...' : 'Загрузить'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}; 