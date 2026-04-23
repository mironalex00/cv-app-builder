
import React, { useState, useCallback } from 'react';
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
  alpha
} from '@mui/material';
import { PhotoCamera, Delete } from '@mui/icons-material';
import Cropper, { type Area } from 'react-easy-crop';
import { useFormContext } from 'react-hook-form';

interface ProfilePictureProps {
  name: string;
  uiVariant?: 'classic' | 'modern';
}

const StyledAvatar = styled(Avatar, {
  shouldForwardProp: (prop) => prop !== 'uiVariant',
})<{ uiVariant: 'classic' | 'modern' }>(({ theme, uiVariant }) => ({
  width: 120,
  height: 120,
  marginBottom: theme.spacing(2),
  border: `3px solid ${theme.palette.primary.main}`,
  boxShadow: uiVariant === 'modern' ? `0 8px 16px ${alpha(theme.palette.primary.main, 0.2)}` : 'none',
  transition: theme.transitions.create(['transform', 'box-shadow']),
  '&:hover': {
    transform: 'scale(1.02)',
  }
}));

export const ProfilePicture = ({ name, uiVariant = 'classic' }: ProfilePictureProps) => {
  const { setValue, watch } = useFormContext();
  const profilePicture = watch(name);

  const [cropDialogOpen, setCropDialogOpen] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImageSrc(reader.result as string);
        setCropDialogOpen(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const onCropComplete = useCallback((_: Area, pixels: Area) => {
    setCroppedAreaPixels(pixels);
  }, []);

  const createCroppedImage = async () => {
    if (!imageSrc || !croppedAreaPixels) return;
    const image = new Image();
    image.src = imageSrc;
    await new Promise((resolve) => (image.onload = resolve));
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = croppedAreaPixels.width;
    canvas.height = croppedAreaPixels.height;
    
    ctx.drawImage(
      image,
      croppedAreaPixels.x,
      croppedAreaPixels.y,
      croppedAreaPixels.width,
      croppedAreaPixels.height,
      0,
      0,
      croppedAreaPixels.width,
      croppedAreaPixels.height
    );

    const croppedImage = canvas.toDataURL('image/jpeg');
    setValue(name, croppedImage, { shouldDirty: true, shouldValidate: true });
    setCropDialogOpen(false);
    setImageSrc(null);
  };

  const handleRemove = () => {
    setValue(name, '', { shouldDirty: true });
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <StyledAvatar src={profilePicture} uiVariant={uiVariant} />
      
      <Box sx={{ display: 'flex', gap: 1 }}>
        <input
          accept="image/*"
          style={{ display: 'none' }}
          id={`profile-upload-${name}`}
          type="file"
          onChange={handleFileChange}
        />
        <label htmlFor={`profile-upload-${name}`}>
          <Button
            variant={uiVariant === 'modern' ? 'contained' : 'outlined'}
            component="span"
            startIcon={<PhotoCamera />}
            size="small"
            sx={{ borderRadius: uiVariant === 'modern' ? 8 : 1 }}
          >
            {profilePicture ? 'Cambiar' : 'Subir'}
          </Button>
        </label>
        {profilePicture && (
          <IconButton onClick={handleRemove} size="small" color="error">
            <Delete />
          </IconButton>
        )}
      </Box>

      <Dialog open={cropDialogOpen} onClose={() => setCropDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Recortar imagen</DialogTitle>
        <DialogContent sx={{ height: 400, position: 'relative' }}>
          {imageSrc && (
            <Cropper
              image={imageSrc}
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
            <Button onClick={() => setCropDialogOpen(false)}>Cancelar</Button>
            <Button variant="contained" onClick={createCroppedImage}>Aceptar</Button>
          </Box>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
