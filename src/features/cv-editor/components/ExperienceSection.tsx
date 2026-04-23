
import { useState, useCallback, memo, useMemo } from 'react';
import { useFieldArray, useFormContext, Controller } from 'react-hook-form';

import { 
  Autocomplete, Box, Button,
  Checkbox, Chip, FormControl,
  FormControlLabel, Grid,
  IconButton, InputLabel, MenuItem,
  Select, TextField, Typography,
} from '@mui/material';

import { Add, Delete, CheckCircle } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

import dayjs, { type Dayjs } from 'dayjs';

import { getCompanySuggestions } from '../../../shared/services/companyService';

import type { ResumeData } from '../../../shared/types/resume.types';


// ============================================================================
// Private interfaces
// ============================================================================
declare interface ExperienceItemCompletion {
  title: boolean;
  company: boolean;
  employmentType: boolean;
  workMode: boolean;
  startDate: boolean;
  endDate: boolean;
  description: boolean;
  location: boolean;
}
declare interface ExperienceItemProps {
  index: number;
  companyInputValue: string;
  onCompanyInputChange: (index: number, value: string) => void;
  onRemove: (index: number) => void;
}

// ============================================================================
// Private constants
// ============================================================================
const EMPLOYMENT_TYPES = [
  'Jornada completa',
  'Jornada parcial',
  'Autónomo',
  'Prácticas',
  'Freelance',
  'Contrato',
  'Temporal',
] as const;

const WORK_MODES = ['Presencial', 'Remoto', 'Híbrido'] as const;

// ============================================================================
// Private handlers
// ============================================================================
function isNonEmptyString(value: string): boolean {
  return typeof value === 'string' && value.trim().length > 0;
}
function isExperienceComplete(completion: ExperienceItemCompletion): boolean {
  return Object.values(completion).every(Boolean);
}
function checkExperienceCompletion(data: ResumeData['experience'][number]): ExperienceItemCompletion {
  return {
    title: isNonEmptyString(data.title),
    company: isNonEmptyString(data.company),
    employmentType: isNonEmptyString(data.employmentType),
    workMode: isNonEmptyString(data.workMode),
    startDate: isNonEmptyString(data.startDate),
    endDate: isNonEmptyString(data.endDate),
    description: isNonEmptyString(data.description),
    location: isNonEmptyString(data.location!),
  };
}

// ============================================================================
// Components
// ============================================================================
const ExperienceFields = memo(function ExperienceFields() {
  const { control } = useFormContext<ResumeData>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'experience',
  });

  const [companyInputs, setCompanyInputs] = useState<Record<number, string>>({});

  const handleCompanyInputChange = useCallback((index: number, value: string) => {
    setCompanyInputs((prev) => ({ ...prev, [index]: value }));
  }, []);

  const addExperience = useCallback(() => {
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
  }, [append]);

  const handleRemove = useCallback(
    (index: number) => {
      remove(index);
      setCompanyInputs((prev) => {
        const updated = { ...prev };
        delete updated[index];
        return updated;
      });
    },
    [remove]
  );

  return (
    <Box sx={{ mt: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Experiencia Laboral
        </Typography>
        <Button
          startIcon={<Add />}
          onClick={addExperience}
          variant="outlined"
          size="small"
          sx={{ borderRadius: 2 }}
        >
          Añadir experiencia
        </Button>
      </Box>

      {fields.map((field, index) => (
        <ExperienceItem
          key={field.id}
          index={index}
          companyInputValue={companyInputs[index] || ''}
          onCompanyInputChange={handleCompanyInputChange}
          onRemove={handleRemove}
        />
      ))}
    </Box>
  );
});
const ExperienceItem = memo(function ExperienceItem({
  index,
  companyInputValue,
  onCompanyInputChange,
  onRemove,
}: ExperienceItemProps) {
  const { control, register, setValue, watch } = useFormContext<ResumeData>();

  const currentData = watch(`experience.${index}`);
  const companyOptions = useMemo(
    () => getCompanySuggestions(companyInputValue),
    [companyInputValue]
  );

  const completion = useMemo(() => checkExperienceCompletion(currentData), [currentData]);
  const isComplete = useMemo(() => isExperienceComplete(completion), [completion]);

  const handleCompanyChange = useCallback(
    (_: React.SyntheticEvent, value: string | null) => {
      setValue(`experience.${index}.company`, value || '');
    },
    [index, setValue]
  );

  const handleRemove = useCallback(() => {
    onRemove(index);
  }, [index, onRemove]);

  const handleCompanyInput = useCallback(
    (_: React.SyntheticEvent, value: string) => {
      onCompanyInputChange(index, value);
    },
    [index, onCompanyInputChange]
  );

  return (
    <Box
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
        },
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: 16,
          right: 16,
          display: 'flex',
          gap: 1,
          alignItems: 'center',
          zIndex: 1,
        }}
      >
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
          onClick={handleRemove}
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
            value={currentData.company || ''}
            onInputChange={handleCompanyInput}
            onChange={handleCompanyChange}
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

        {/* Fecha inicio */}
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

        {/* Fecha fin */}
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
        <Grid size={{ xs: 12, sm: 2 }} sx={{ display: 'flex', alignItems: 'center' }}>
          <Controller
            name={`experience.${index}.endDate`}
            control={control}
            render={({ field: { value, onChange } }) => (
              <FormControlLabel
                control={
                  <Checkbox
                    checked={value === 'Presente'}
                    onChange={(e) => {
                      onChange(e.target.checked ? 'Presente' : '');
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
});

// ============================================================================
// Exports
// ============================================================================
export default ExperienceFields;