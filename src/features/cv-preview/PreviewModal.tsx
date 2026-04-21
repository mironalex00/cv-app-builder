import { forwardRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Box,
} from '@mui/material';
import { Close } from '@mui/icons-material';
import ResumePreview from './ResumePreview';
import DownloadPDFButton from '../../shared/components/ui/DownloadPDFButton';

import type { ResumeData } from '../../shared/types/resume.types';

interface PreviewModalProps {
  open: boolean;
  onClose: () => void;
  data: ResumeData;
  isValid: boolean;
}

const PreviewModal = forwardRef<HTMLDivElement, PreviewModalProps>(
  ({ open, onClose, data, isValid }, ref) => {
    return (
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="md"
        fullWidth
        slotProps={{
          paper: { sx: { borderRadius: 3, overflow: 'hidden' } },
        }}
      >
        <DialogTitle sx={{ m: 0, p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          Vista previa del currículum
          <IconButton onClick={onClose}>
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 3, bgcolor: '#fafafa' }}>
          <Box sx={{ maxWidth: '100%', margin: '0 auto' }}>
            <ResumePreview ref={ref} data={data} />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, justifyContent: 'flex-end' }}>
          {isValid && (
            <DownloadPDFButton contentRef={ref as React.RefObject<HTMLDivElement>} fileName="mi-cv.pdf" />
          )}
          <Button onClick={onClose} variant="outlined">
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
);

PreviewModal.displayName = 'PreviewModal';

export default PreviewModal;