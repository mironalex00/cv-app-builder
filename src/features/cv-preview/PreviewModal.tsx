import { lazy, Suspense } from 'react';

import { Box, Button, CircularProgress, Dialog, DialogContent, IconButton } from '@mui/material';
import { Close } from '@mui/icons-material';

import ResumePreview from './ResumePreview';

import type { ResumeData } from '../../shared/types/resume.types';

declare interface PreviewModalProps {
  open: boolean;
  onClose: () => void;
  data: ResumeData;
  previewRef: React.RefObject<HTMLDivElement>;
}

const PdfExportButton = lazy(() => import('../../shared/components/ui/DownloadPDFButton'));

export default function PreviewModal({
  open,
  onClose,
  data,
  previewRef,
}: PreviewModalProps) {
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 2, pb: 0 }}>
        <IconButton onClick={onClose} size="small">
          <Close />
        </IconButton>
        <Suspense
          fallback={
            <Button disabled startIcon={<CircularProgress size={20} />}>
              Cargando...
            </Button>
          }
        >
          <PdfExportButton data={data} previewRef={previewRef} />
        </Suspense>
      </Box>
      <DialogContent sx={{ p: 0 }}>
        <ResumePreview ref={previewRef} data={data} />
      </DialogContent>
    </Dialog>
  );
}