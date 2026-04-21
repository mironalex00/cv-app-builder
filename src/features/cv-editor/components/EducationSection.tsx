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

function EducationFields() {
  const { control, register, setValue, watch } = useFormContext<ResumeData>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'education',
  });

  const [schoolInputs, setSchoolInputs] = useState<Record<number, string>>({});

  const handleSchoolInputChange = (index: number, value: string) => {
    setSchoolInputs((prev) => ({ ...prev, [index]: value }));
  };

  const addEducation = () => {
    append({
      id: crypto.randomUUID(),
      school: '',
      degree: '',
      fieldOfStudy: '',
      startYear: '',
      endYear: '',
    });
  };

  return (
    <Box sx={{ mt: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Educación
        </Typography>
        <Button startIcon={<Add />} onClick={addEducation} variant="outlined" size="small" sx={{ borderRadius: 2 }}>
          Añadir educación
        </Button>
      </Box>

      {fields.map((field, index) => {
        const schoolOptions = getCompanySuggestions(schoolInputs[index] || '');
        const currentData = watch(`education.${index}`);

        const isComplete = 
          currentData.school?.trim() !== '' && 
          currentData.degree?.trim() !== '' && 
          currentData.fieldOfStudy?.trim() !== '' && 
          currentData.startYear?.trim() !== '' && 
          currentData.endYear?.trim() !== '';

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
              {/* Institución */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Autocomplete
                  freeSolo
                  options={schoolOptions}
                  value={watch(`education.${index}.school`) || ''}
                  onInputChange={(_, value) => handleSchoolInputChange(index, value)}
                  onChange={(_, value) => setValue(`education.${index}.school`, value || '')}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Institución"
                      fullWidth
                      required
                      size="small"
                      placeholder="Ej: Universidad Complutense"
                    />
                  )}
                />
              </Grid>

              {/* Título */}
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  {...register(`education.${index}.degree`)}
                  label="Título"
                  fullWidth
                  required
                  size="small"
                  placeholder="Ej: Grado en Ingeniería Informática"
                />
              </Grid>

              {/* Campo de estudio */}
              <Grid size={12}>
                <TextField
                  {...register(`education.${index}.fieldOfStudy`)}
                  label="Campo de estudio"
                  fullWidth
                  required
                  size="small"
                  placeholder="Ej: Desarrollo de Software"
                />
              </Grid>

              {/* Fecha inicio */}
              <Grid size={{ xs: 6, sm: 4 }}>
                <Controller
                  name={`education.${index}.startYear`}
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

              {/* Fecha fin */}
              <Grid size={{ xs: 6, sm: 4 }}>
                <Controller
                  name={`education.${index}.endYear`}
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

              {/* Checkbox Actual */}
              <Grid size={{ xs: 12, sm: 2 }} sx={{ display: 'flex', alignItems: 'center' }} >
                <Controller
                  name={`education.${index}.endYear`}
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
            </Grid>
          </Box>
        );
      })}
    </Box>
  );
}

export default function EducationSection() {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <EducationFields />
    </LocalizationProvider>
  );
}