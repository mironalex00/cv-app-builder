
import { useState, useCallback, useEffect } from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import {
  TextField,
  Box,
  Typography,
  Avatar,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Slider,
  IconButton,
  Autocomplete,
  Grid,
} from '@mui/material';
import { PhotoCamera, Delete } from '@mui/icons-material';
import Cropper from 'react-easy-crop';
import type { Area } from 'react-easy-crop';
import { isValidPhoneNumber, type CountryCode } from 'libphonenumber-js';
import {
  fetchCountries,
  fetchStates,
  type CountryData,
  type StateData,
} from '../../../shared/services/locationService';
import { validateEmail } from '../../../shared/utils/emailValidator';
import { getJobTitleSuggestions, type JobTitleSuggestion } from '../../../shared/services/jobTitlesService';

import type { ResumeData } from '../../../shared/types/resume.types';

export default function PersonalInfoSection() {
  const { register, setValue, watch, control, formState: { errors } } = useFormContext<ResumeData>();
  const profilePicture = watch('personalInfo.profilePicture');

  // Estados para recorte de imagen
  const [cropDialogOpen, setCropDialogOpen] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  // Estados para ubicaciones
  const [countries, setCountries] = useState<CountryData[]>([]);
  const [loadingCountries, setLoadingCountries] = useState(true);
  const [states, setStates] = useState<StateData[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<CountryData | null>(null);
  const [selectedState, setSelectedState] = useState<StateData | null>(null);

  // Estados para títulos profesionales
  const [titleOptions, setTitleOptions] = useState<JobTitleSuggestion[]>([]);
  const [loadingTitles, setLoadingTitles] = useState(false);

  const locationValue = watch('personalInfo.location');

  // Cargar países desde la API al montar
  useEffect(() => {
    const loadCountries = async () => {
      try {
        const data = await fetchCountries();
        setCountries(data);
      } catch {
        setCountries([]);
      } finally {
        setLoadingCountries(false);
      }
    };
    loadCountries();
  }, []);

  // Sincronizar ubicación guardada con los selects (para edición)
  useEffect(() => {
    if (locationValue && countries.length > 0) {
      const parts = locationValue.split(', ');
      
      if (parts.length >= 2) {
        const [stateName, countryName] = parts;
        
        const country = countries.find(c => 
          c.name === countryName || 
          Object.values(c.translations || {}).some(t => t.common === countryName)
        );
        if (country) {
          setSelectedCountry(country);
          const loadStates = async () => {
            const statesList = await fetchStates(country.name);
            setStates(statesList);
            const state = statesList.find(s => s.name === stateName);
            if (state) setSelectedState(state);
          };
          loadStates();
        }
      }
    }
  }, [locationValue, countries]);

  // Actualizar estados cuando cambia el país
  const handleCountryChange = async (country: CountryData | null) => {
    setSelectedCountry(country);
    setSelectedState(null);
    if (country) {
      const statesList = await fetchStates(country.name);
      setStates(statesList);
      const countryDisplayName = country.translations?.spa?.common || country.name;
      setValue('personalInfo.location', countryDisplayName);
    } else {
      setStates([]);
      setValue('personalInfo.location', '');
    }
  };

  // Actualizar ciudades cuando cambia el estado
  const handleStateChange = (state: StateData | null) => {
    setSelectedState(state);
    if (state && selectedCountry) {
      const countryDisplayName = selectedCountry.translations?.spa?.common || selectedCountry.name;
      setValue('personalInfo.location', `${state.name}, ${countryDisplayName}`);
    } else if (selectedCountry) {
      const countryDisplayName = selectedCountry.translations?.spa?.common || selectedCountry.name;
      setValue('personalInfo.location', countryDisplayName);
    }
  };



  // Manejar sugerencias de títulos
  const handleTitleInputChange = async (_: React.SyntheticEvent, value: string) => {
    if (value.length >= 2) {
      setLoadingTitles(true);
      try {
        const suggestions = await getJobTitleSuggestions(value);
        setTitleOptions(suggestions);
      } catch {
        // Silently fail or use fallback handled by service
      } finally {
        setLoadingTitles(false);
      }
    } else {
      setTitleOptions([]);
    }
  };

  // Funciones de recorte de imagen (sin cambios)
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

  const onCropComplete = useCallback((_: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
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
    setValue('personalInfo.profilePicture', croppedImage, { shouldDirty: true, shouldValidate: true });
    setCropDialogOpen(false);
    setImageSrc(null);
  };

  const handleRemovePicture = () => {
    setValue('personalInfo.profilePicture', '', { shouldDirty: true });
  };

  return (
    <Box sx={{ mb: 3 }}>
    <Typography variant="h6" sx={{ fontWeight: 600 }} gutterBottom>
        Información Personal
      </Typography>

      <Grid container spacing={3}>
        {/* Foto de perfil */}
        <Grid size={{ xs: 12, sm: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Avatar
              src={profilePicture}
              sx={{ width: 100, height: 100, mb: 1, border: '2px solid #0A66C2' }}
            />
            <input
              accept="image/*"
              style={{ display: 'none' }}
              id="upload-photo"
              type="file"
              onChange={handleFileChange}
            />
            <Box>
              <label htmlFor="upload-photo">
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<PhotoCamera />}
                  size="small"
                  sx={{ mr: 1 }}
                >
                  Subir
                </Button>
              </label>
              {profilePicture && (
                <IconButton onClick={handleRemovePicture} size="small" color="error">
                  <Delete />
                </IconButton>
              )}
            </Box>
          </Box>
        </Grid>

        {/* Campos de texto */}
        <Grid size={{ xs: 12, sm: 9 }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                {...register('personalInfo.firstName', { required: 'El nombre es obligatorio' })}
                label="Nombre"
                fullWidth
                required
                error={!!errors.personalInfo?.firstName}
                helperText={errors.personalInfo?.firstName?.message}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                {...register('personalInfo.lastName', { required: 'El apellido es obligatorio' })}
                label="Apellido"
                fullWidth
                required
                error={!!errors.personalInfo?.lastName}
                helperText={errors.personalInfo?.lastName?.message}
              />
            </Grid>

            {/* Título profesional con Autocomplete */}
            <Grid size={12}>
              <Controller
                name="personalInfo.headline"
                control={control}
                rules={{ required: 'El título profesional es obligatorio' }}
                render={({ field, fieldState }) => (
                  <Autocomplete
                    freeSolo
                    autoHighlight
                    autoSelect
                    options={titleOptions}
                    getOptionLabel={(option) => typeof option === 'string' ? option : option.title}
                    isOptionEqualToValue={(option, value) => 
                      typeof option === 'string' || typeof value === 'string' 
                        ? option === value 
                        : option.title === value.title
                    }
                    value={field.value || ''}
                    onChange={(_, newValue) => field.onChange(typeof newValue === 'string' ? newValue : newValue?.title || '')}
                    onInputChange={handleTitleInputChange}
                    loading={loadingTitles}
                    filterOptions={(x) => x}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Título profesional"
                        placeholder="Ej: Desarrollador Frontend"
                        fullWidth
                        required
                        error={!!fieldState.error}
                        helperText={fieldState.error?.message}
                      />
                    )}
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                {...register('personalInfo.email', {
                  required: 'El email es obligatorio',
                  validate: validateEmail
                })}
                label="Email"
                type="email"
                fullWidth
                required
                error={!!errors.personalInfo?.email}
                helperText={errors.personalInfo?.email?.message}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                {...register('personalInfo.phone', {
                  required: 'El teléfono es obligatorio',
                  validate: (value) => {
                    if (!value) return true;
                    const isValid = isValidPhoneNumber(value, selectedCountry?.code as CountryCode);
                    return isValid || 'Número de teléfono inválido o formato incorrecto';
                  }
                })}
                label="Teléfono"
                type="tel"
                fullWidth
                required
                error={!!errors.personalInfo?.phone}
                helperText={errors.personalInfo?.phone?.message}
              />
            </Grid>

            {/* Ubicación: País */}
            <Grid size={{ xs: 12, sm: 5 }}>
              <Autocomplete
                options={countries}
                loading={loadingCountries}
                autoHighlight
                autoSelect
                handleHomeEndKeys
                isOptionEqualToValue={(option, value) => option.code === value.code}
                getOptionLabel={(option) => option.translations?.spa?.common || option.name}
                filterOptions={(options, { inputValue }) => {
                  const query = inputValue.toLowerCase();
                  return options.filter(option => 
                    option.name.toLowerCase().includes(query) ||
                    (option.translations?.spa?.common || '').toLowerCase().includes(query) ||
                    Object.values(option.translations || {}).some(t => t.common.toLowerCase().includes(query))
                  );
                }}
                value={selectedCountry}
                onChange={(_, newValue) => handleCountryChange(newValue)}
                renderInput={(params) => (
                  <TextField {...params} label="País" fullWidth required />
                )}
              />
            </Grid>

            {/* Ubicación: Estado */}
            <Grid size={{ xs: 12, sm: 7 }}>
              <Autocomplete
                options={states}
                autoHighlight
                autoSelect
                handleHomeEndKeys
                isOptionEqualToValue={(option, value) => option.isoCode === value.isoCode}
                getOptionLabel={(option) => option.name}
                value={selectedState}
                onChange={(_, newValue) => handleStateChange(newValue)}
                disabled={!selectedCountry}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Estado / Provincia"
                    fullWidth
                    required
                    placeholder={selectedCountry ? 'Selecciona un estado' : 'Primero selecciona un país'}
                  />
                )}
              />
            </Grid>



            <Grid size={12}>
              <TextField
                label="Resumen profesional"
                fullWidth
                multiline
                rows={3}
                placeholder="Breve descripción de tu perfil..."
              />
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      {/* Diálogo de recorte */}
      <Dialog open={cropDialogOpen} onClose={() => setCropDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Recortar imagen de perfil</DialogTitle>
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
            <Button variant="contained" onClick={createCroppedImage}>
              Aceptar
            </Button>
          </Box>
        </DialogActions>
      </Dialog>
    </Box>
  );
}