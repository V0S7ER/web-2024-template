import { Fab, Tooltip } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';

interface AddPresentationButtonProps {
  onClick: () => void;
  disabled?: boolean;
  tooltip?: string;
}

export const AddPresentationButton = ({ 
  onClick, 
  disabled = false, 
  tooltip = "Добавить презентацию" 
}: AddPresentationButtonProps) => {
  return (
    <Tooltip title={tooltip} placement="left">
      <Fab
        color="primary"
        aria-label="add presentation"
        disabled={disabled}
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          zIndex: 1000,
        }}
        onClick={onClick}
      >
        <AddIcon />
      </Fab>
    </Tooltip>
  );
}; 