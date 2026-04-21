import { useState } from 'react';
import { useFieldArray, useFormContext, Controller } from 'react-hook-form';
import {
  TextField,
  IconButton,
  Box,
  Typography,
  Button,
  Grid,
  Autocomplete,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Checkbox,
  FormControlLabel,
  Chip,
} from '@mui/material';
import { Add, Delete, CheckCircle } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { type Dayjs } from 'dayjs';
import { getCompanySuggestions } from '../../../shared/services/companyService';

import type { ResumeData } from '../../../shared/types/resume.types';

const EMPLOYMENT_TYPES = [
  'Jornada completa',
  'Jornada parcial',
  'Autónomo',
  'Prácticas',
  'Freelance',
  'Contrato',
  'Temporal',
];

const WORK_MODES = ['Presencial', 'Remoto', 'Híbrido'];

// Componente contenedor para LocalizationProvider
function ExperienceFields() {
  const { control, register, setValue, watch } = useFormContext<ResumeData>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'experience',
  });

  const [companyInputs, setCompanyInputs] = useState<Record<number, string>>({});

  const handleCompanyInputChange = (index: number, value: string) => {
    setCompanyInputs((prev) => ({ ...prev, [index]: value }));
  };

  const addExperience = () => {
    append({
      id: crypto.randomUUID(),
      title: '',
      company: '',
      employmentType: '',
      workMode: '',
      startDate: '',
      endDate: '',
      description: '',
      location: '',
    });
  };

  return (
    <Box sx={{ mt: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Experiencia Laboral
        </Typography>
        <Button startIcon={<Add />} onClick={addExperience} variant="outlined" size="small" sx={{ borderRadius: 2 }}>
          Añadir experiencia
        </Button>
      </Box>

      {fields.map((field, index) => {
        const companyOptions = getCompanySuggestions(companyInputs[index] || '');
        const currentData = watch(`experience.${index}`);
        
        const isComplete = 
          currentData.title?.trim() !== '' && 
          currentData.company?.trim() !== '' && 
          currentData.employmentType?.trim() !== '' && 
          currentData.workMode?.trim() !== '' && 
          currentData.startDate?.trim() !== '' && 
          currentData.endDate?.trim() !== '' && 
          currentData.description?.trim() !== '' && 
          currentData.location?.trim() !== '';

        return (
          <Box
            key={field.id}
            sx={{
              mb: 3,
              p: 3,
              border: '2px solid',
              borderColor: isComplete ? 'success.main' : 'divider',
              borderRadius: 3,
              position: 'relative',
              transition: 'all 0.3s ease',
              bgcolor: isComplete ? 'rgba(46, 125, 50, 0.02)' : 'transparent',
              '&:hover': {
                borderColor: isComplete ? 'success.main' : 'primary.main',
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
              }
            }}
          >
            <Box sx={{ position: 'absolute', top: 16, right: 16, display: 'flex', gap: 1, alignItems: 'center', zIndex: 1 }}>
              {isComplete && (
                <Chip 
                  label="Completado" 
                  color="success" 
                  size="small" 
                  icon={<CheckCircle fontSize="small" />}
                  sx={{ fontWeight: 600 }}
                />
              )}
              <IconButton
                onClick={() => remove(index)}
                size="small"
                color="error"
                sx={{
                  backgroundColor: 'white',
                  border: '1px solid',
                  borderColor: 'error.light',
                  '&:hover': { backgroundColor: '#fff5f5' },
                }}
              >
                <Delete fontSize="small" />
              </IconButton>
            </Box>

            <Grid container spacing={3}>
              {/* Título */}
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  {...register(`experience.${index}.title`)}
                  label="Título del puesto"
                  fullWidth
                  required
                  size="small"
                  placeholder="Ej: Desarrollador Frontend"
                />
              </Grid>

              {/* Empresa */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Autocomplete
                  freeSolo
                  options={companyOptions}
                  value={watch(`experience.${index}.company`) || ''}
                  onInputChange={(_, value) => handleCompanyInputChange(index, value)}
                  onChange={(_, value) => setValue(`experience.${index}.company`, value || '')}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Empresa"
                      fullWidth
                      required
                      size="small"
                      placeholder="Ej: Google"
                    />
                  )}
                />
              </Grid>

              {/* Tipo de empleo */}
              <Grid size={{ xs: 12, sm: 4 }}>
                <FormControl fullWidth size="small" required>
                  <InputLabel>Tipo de empleo</InputLabel>
                  <Select
                    {...register(`experience.${index}.employmentType`)}
                    label="Tipo de empleo"
                  >
                    {EMPLOYMENT_TYPES.map((type) => (
                      <MenuItem key={type} value={type}>
                        {type}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Modalidad */}
              <Grid size={{ xs: 12, sm: 4 }}>
                <FormControl fullWidth size="small" required>
                  <InputLabel>Modalidad</InputLabel>
                  <Select {...register(`experience.${index}.workMode`)} label="Modalidad">
                    {WORK_MODES.map((mode) => (
                      <MenuItem key={mode} value={mode}>
                        {mode}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Fecha inicio con DatePicker */}
              <Grid size={{ xs: 6, sm: 4 }}>
                <Controller
                  name={`experience.${index}.startDate`}
                  control={control}
                  render={({ field: { value, onChange } }) => (
                    <DatePicker
                      label="Inicio"
                      views={['month', 'year']}
                      value={value ? dayjs(value) : null}
                      onChange={(newValue: Dayjs | null) => {
                        onChange(newValue ? newValue.format('YYYY-MM') : '');
                      }}
                      slotProps={{
                        textField: {
                          size: 'small',
                          fullWidth: true,
                          required: true,
                        },
                      }}
                    />
                  )}
                />
              </Grid>

              {/* Fecha fin con DatePicker y checkbox */}
              <Grid size={{ xs: 6, sm: 4 }}>
                <Controller
                  name={`experience.${index}.endDate`}
                  control={control}
                  render={({ field: { value, onChange } }) => (
                    <DatePicker
                      label="Fin"
                      views={['month', 'year']}
                      value={value && value !== 'Presente' ? dayjs(value) : null}
                      onChange={(newValue: Dayjs | null) => {
                        onChange(newValue ? newValue.format('YYYY-MM') : '');
                      }}
                      disabled={value === 'Presente'}
                      slotProps={{
                        textField: {
                          size: 'small',
                          fullWidth: true,
                          required: value !== 'Presente',
                        },
                      }}
                    />
                  )}
                />
              </Grid>

              {/* Checkbox "Actual" */}
              <Grid size={{ xs: 12, sm: 2 }} sx={{ display: 'flex', alignItems: 'center' }} >
                <Controller
                  name={`experience.${index}.endDate`}
                  control={control}
                  render={({ field: { value, onChange } }) => (
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={value === 'Presente'}
                          onChange={(e) => {
                            if (e.target.checked) {
                              onChange('Presente');
                            } else {
                              onChange('');
                            }
                          }}
                        />
                      }
                      label="Actual"
                    />
                  )}
                />
              </Grid>

              {/* Ubicación */}
              <Grid size={12}>
                <TextField
                  {...register(`experience.${index}.location`)}
                  label="Ubicación"
                  fullWidth
                  required
                  size="small"
                  placeholder="Ciudad, País"
                />
              </Grid>

              {/* Descripción */}
              <Grid size={12}>
                <TextField
                  {...register(`experience.${index}.description`)}
                  label="Descripción"
                  fullWidth
                  required
                  size="small"
                  multiline
                  rows={3}
                  placeholder="Responsabilidades, logros..."
                />
              </Grid>
            </Grid>
          </Box>
        );
      })}
    </Box>
  );
}

export default function ExperienceSection() {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <ExperienceFields />
    </LocalizationProvider>
  );
}