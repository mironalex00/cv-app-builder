import { useState, useCallback } from 'react';

import { Button, CircularProgress } from '@mui/material';
import { PictureAsPdf } from '@mui/icons-material';

declare interface PdfExportButtonProps {
  data: unknown;
  previewRef: React.RefObject<HTMLDivElement>;
}

export default function PdfExportButton({ previewRef }: PdfExportButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleExport = useCallback(async () => {
    if (!previewRef.current) {
      return;
    }

    setIsGenerating(true);
    
    try {
      const [html2canvasModule, jsPDFModule] = await Promise.all([
        import('html2canvas'),
        import('jspdf'),
      ]);

      const html2canvas = html2canvasModule.default;
      const canvas = await html2canvas(previewRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
      });
      
      const jsPDF = jsPDFModule.default;
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [canvas.width, canvas.height],
      });

      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save('cv.pdf');
    } catch (error) {
      console.error('PDF generation failed:', error);
    } finally {
      setIsGenerating(false);
    }
  }, [previewRef]);

  return (
    <Button
      variant="outlined"
      startIcon={isGenerating ? <CircularProgress size={20} /> : <PictureAsPdf />}
      onClick={handleExport}
      disabled={isGenerating}
    >
      {isGenerating ? 'Generando PDF...' : 'Exportar PDF'}
    </Button>
  );
}