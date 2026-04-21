import { Button } from '@mui/material';
import { PictureAsPdf } from '@mui/icons-material';
import { generatePDF } from '../../utils/pdfGenerator';

interface DownloadPDFButtonProps {
  contentRef: React.RefObject<HTMLElement>;
  fileName?: string;
}

export default function DownloadPDFButton({ contentRef, fileName }: DownloadPDFButtonProps) {
  const handleClick = async () => {
    if (contentRef.current) {
      await generatePDF(contentRef.current, fileName);
    }
  };

  return (
    <Button
      variant="contained"
      color="primary"
      startIcon={<PictureAsPdf />}
      onClick={handleClick}
    >
      Descargar PDF
    </Button>
  );
}