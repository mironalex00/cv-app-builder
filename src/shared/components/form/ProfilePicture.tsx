
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { 
  Box, 
  Avatar, 
  IconButton, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  Typography, 
  Slider,
  styled,
  alpha,
  Skeleton
} from '@mui/material';
import { PhotoCamera, Delete, Person } from '@mui/icons-material';
import Cropper, { type Area } from 'react-easy-crop';
import { useFormContext } from 'react-hook-form';

// ============================================================
// Types
// ============================================================
declare type UIVariant = 'classic' | 'modern';

// ============================================================
// Interfaces
// ============================================================
declare interface ProfilePictureContainerProps {
  name: string;
  uiVariant?: UIVariant;
}
declare interface AvatarDisplayProps {
  src?: string;
  uiVariant: UIVariant;
  isLoading?: boolean;
}
declare interface UploadButtonProps {
  hasPicture: boolean;
  onUpload: (file: File) => void;
  onRemove: () => void;
  uiVariant: UIVariant;
  disabled?: boolean;
}
declare interface CropDialogProps {
  open: boolean;
  imageUrl: string | null;
  onClose: () => void;
  onSave: (croppedDataUrl: string) => void;
}

// ============================================================
// Internal helpers
// ============================================================
function shortUUID(): string {
  const uuid = globalThis.crypto.randomUUID();
  const undecorated = uuid.replace(/-/g, '');
  const bytes = new Uint8Array(16);

  for (let i = 0; i < 32; i += 2) {
    bytes[i / 2] = parseInt(undecorated.substring(i, i + 2), 16);
  }
  
  const binaryString = String.fromCharCode(...bytes);
  const base64 = btoa(binaryString);
  const base64url = base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  
  const base64Again = base64url.replace(/-/g, '+').replace(/_/g, '/');
  const padLength = (4 - (base64Again.length % 4)) % 4;
  const padded = base64Again + '='.repeat(padLength);
  const decodedBinary = atob(padded);
  const decodedBytes = Uint8Array.from(decodedBinary, (c) => c.charCodeAt(0));

  const hexBack = Array.from(decodedBytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  
    return `${hexBack.substring(
      0, 8
    )}-${hexBack.substring(
      8, 12
    )}-${hexBack.substring(
      12, 16
    )}-${hexBack.substring(
      16, 20
    )}-${hexBack.substring(20)}`;
}

// ============================================================
// Styled Components
// ============================================================
const StyledAvatar = styled(Avatar, {
  shouldForwardProp: (prop) => prop !== 'uiVariant' && prop !== 'isLoading',
})<{ uiVariant: UIVariant; isLoading?: boolean }>(({ theme, uiVariant, isLoading }) => ({
  width: 120,
  height: 120,
  marginBottom: theme.spacing(2),
  border: `3px solid ${theme.palette.primary.main}`,
  boxShadow: uiVariant === 'modern'
    ? `0 8px 16px ${alpha(theme.palette.primary.main, 0.2)}`
    : 'none',
  transition: theme.transitions.create(['transform', 'box-shadow']),
  '&:hover': {
    transform: uiVariant === 'modern' && !isLoading ? 'scale(1.02)' : 'none',
  },
  '.MuiSkeleton-root': {
    transform: 'scale(1)',
  },
}));

const MAX_SIZE = 10 * 1024 * 1024; // 10 MB

// ============================================================
// Subcomponents
// ============================================================
const AvatarDisplay = React.memo(({ src, uiVariant, isLoading }: AvatarDisplayProps) => {
  return (
    <StyledAvatar src={src} uiVariant={uiVariant} isLoading={isLoading}>
      {!src && !isLoading && <Person />}
      {isLoading && <Skeleton variant="circular" width={120} height={120} />}
    </StyledAvatar>
  );
});
const UploadButton = React.memo(({
  hasPicture,
  onUpload,
  onRemove,
  uiVariant,
  disabled,
}: UploadButtonProps) => {
  const inputId = `profile-upload-${shortUUID()}`;
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      e.target.value = '';
      onUpload(file);
    }
  };
  return (
    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
      <input
        accept="image/*"
        style={{ display: 'none' }}
        id={inputId}
        type="file"
        onChange={handleFileChange}
        disabled={disabled}
      />
      <label htmlFor={inputId}>
        <Button
          variant={uiVariant === 'modern' ? 'contained' : 'outlined'}
          component="span"
          startIcon={<PhotoCamera />}
          size="small"
          disabled={disabled}
          sx={{ borderRadius: uiVariant === 'modern' ? 8 : 1 }}
        >
          {hasPicture ? 'Cambiar' : 'Subir'}
        </Button>
      </label>
      {hasPicture && (
        <IconButton
          onClick={onRemove}
          size="small"
          color="error"
          aria-label="Eliminar foto"
        >
          <Delete />
        </IconButton>
      )}
    </Box>
  );
});
const CropDialog = React.memo(({ open, imageUrl, onClose, onSave }: CropDialogProps) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);

  const croppedAreaPixelsRef = useRef<Area | null>(null);

  useEffect(() => {
    if (open) {
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      croppedAreaPixelsRef.current = null;
    }
  }, [open, imageUrl]);

  const onCropComplete = useCallback((_: Area, pixels: Area) => {
    croppedAreaPixelsRef.current = pixels;
  }, []);

  const createCroppedImage = useCallback(async () => {
    if (!imageUrl || !croppedAreaPixelsRef.current) return;
    const pixels = croppedAreaPixelsRef.current;
    const image = new Image();
    image.src = imageUrl;
    await new Promise<void>((resolve) => {
      image.onload = () => resolve();
    });

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = pixels.width;
    canvas.height = pixels.height;

    ctx.drawImage(
      image,
      pixels.x,
      pixels.y,
      pixels.width,
      pixels.height,
      0,
      0,
      pixels.width,
      pixels.height
    );

    const croppedDataUrl = canvas.toDataURL('image/jpeg', 0.9);
    onSave(croppedDataUrl);
  }, [imageUrl, onSave]);

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      aria-labelledby="crop-dialog-title"
    >
      <DialogTitle id="crop-dialog-title">Recortar imagen</DialogTitle>
      <DialogContent sx={{ height: 400, position: 'relative' }}>
        {imageUrl && (
          <Cropper
            image={imageUrl}
            crop={crop}
            zoom={zoom}
            aspect={1}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
        )}
      </DialogContent>
      <DialogActions sx={{ flexDirection: 'column', px: 3, pb: 2 }}>
        <Box sx={{ width: '100%', mb: 1 }}>
          <Typography variant="caption">Zoom</Typography>
          <Slider
            value={zoom}
            min={1}
            max={3}
            step={0.1}
            onChange={(_, value) => setZoom(value as number)}
          />
        </Box>
        <Box sx={{ display: 'flex', gap: 1, alignSelf: 'flex-end' }}>
          <Button onClick={handleClose}>Cancelar</Button>
          <Button variant="contained" onClick={createCroppedImage}>
            Aceptar
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
});

export default function ProfilePicture({ name, uiVariant = 'classic'}: ProfilePictureContainerProps) {
  const { setValue, watch } = useFormContext();
  const profilePicture = watch(name) as string | undefined;

  const [cropDialogOpen, setCropDialogOpen] = useState(false);
  const [cropImageUrl, setCropImageUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    return () => {
      if (cropImageUrl) {
        URL.revokeObjectURL(cropImageUrl);
      }
    };
  }, [cropImageUrl]);

  const handleUpload = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) return;
    if (file.size > MAX_SIZE) return;
    if (cropImageUrl) {
      URL.revokeObjectURL(cropImageUrl);
    }

    const objectUrl = URL.createObjectURL(file);
    setCropImageUrl(objectUrl);
    setCropDialogOpen(true);
  }, [cropImageUrl]);

  const handleRemove = useCallback(() => {
    setValue(name, '', { shouldDirty: true });
  }, [setValue, name]);

  const handleCropSave = useCallback((croppedDataUrl: string) => {
    setValue(name, croppedDataUrl, { shouldDirty: true, shouldValidate: true });
    setIsProcessing(false);
    if (cropImageUrl) {
      URL.revokeObjectURL(cropImageUrl);
      setCropImageUrl(null);
    }
    setCropDialogOpen(false);
  }, [setValue, name, cropImageUrl]);

  const handleCropClose = useCallback(() => {
    setIsProcessing(false);
    if (cropImageUrl) {
      URL.revokeObjectURL(cropImageUrl);
      setCropImageUrl(null);
    }
    setCropDialogOpen(false);
  }, [cropImageUrl]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
    {/* Avatar: non‑interactable when picture exists (default behavior) */}
      <AvatarDisplay
        src={profilePicture}
        uiVariant={uiVariant}
        isLoading={isProcessing}
      />

      {/* Upload controls */}
      <UploadButton
        hasPicture={Boolean(profilePicture)}
        onUpload={handleUpload}
        onRemove={handleRemove}
        uiVariant={uiVariant}
        disabled={isProcessing}
      />

      {/* Crop dialog – only mounted when an image is ready */}
      <CropDialog
        open={cropDialogOpen}
        imageUrl={cropImageUrl}
        onClose={handleCropClose}
        onSave={handleCropSave}
      />
    </Box>
  )
}