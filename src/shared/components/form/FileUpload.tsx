
import React, { useRef } from 'react';
import { Button, Box, Typography, styled, alpha } from '@mui/material';
import { CloudUpload } from '@mui/icons-material';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  label?: string;
  variant?: 'button' | 'drag-drop';
  uiVariant?: 'classic' | 'modern';
}

const DropZone = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'uiVariant',
})<{ uiVariant: 'classic' | 'modern' }>(({ theme, uiVariant }) => ({
  border: `2px dashed ${theme.palette.divider}`,
  borderRadius: uiVariant === 'modern' ? 16 : 4,
  padding: theme.spacing(4),
  textAlign: 'center',
  cursor: 'pointer',
  transition: theme.transitions.create(['border-color', 'background-color']),
  backgroundColor: theme.palette.mode === 'light' ? '#fafafa' : alpha(theme.palette.common.white, 0.02),
  '&:hover': {
    borderColor: theme.palette.primary.main,
    backgroundColor: alpha(theme.palette.primary.main, 0.04),
  },
}));

export const FileUpload = ({ onFileSelect, accept = "image/*", label = "Subir archivo", variant = 'button',uiVariant = 'classic'}: FileUploadProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onFileSelect(file);
  };

  if (variant === 'drag-drop') {
    return (
      <DropZone 
        uiVariant={uiVariant}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const file = e.dataTransfer.files?.[0];
          if (file) onFileSelect(file);
        }}
      >
        <input type="file" ref={inputRef} style={{ display: 'none' }} accept={accept} onChange={handleFileChange} />
        <CloudUpload sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
        <Typography variant="body1">{label}</Typography>
        <Typography variant="caption" color="textSecondary">Arrastra y suelta o haz clic para buscar</Typography>
      </DropZone>
    );
  }

  return (
    <Box>
      <input type="file" ref={inputRef} style={{ display: 'none' }} accept={accept} onChange={handleFileChange} />
      <Button 
        variant={uiVariant === 'modern' ? 'contained' : 'outlined'} 
        startIcon={<CloudUpload />}
        onClick={() => inputRef.current?.click()}
        sx={{ borderRadius: uiVariant === 'modern' ? 10 : 1 }}
      >
        {label}
      </Button>
    </Box>
  );
};