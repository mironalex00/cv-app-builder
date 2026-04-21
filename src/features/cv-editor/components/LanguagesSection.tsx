import { useFieldArray, useFormContext } from 'react-hook-form';
import {
  TextField,
  IconButton,
  Box,
  Typography,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { Add, Delete } from '@mui/icons-material';

import type { ResumeData } from '../../../shared/types/resume.types';

const PROFICIENCY_LEVELS = [
  'Nativo o bilingüe',
  'Competencia profesional completa',
  'Competencia profesional limitada',
  'Competencia básica limitada',
  'Competencia básica',
];

export default function LanguagesSection() {
  const { control, register } = useFormContext<ResumeData>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'languages',
  });

  const addLanguage = () => {
    append({
      id: crypto.randomUUID(),
      name: '',
      proficiency: '',
    });
  };

  return (
    <Box sx={{ mt: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Idiomas
        </Typography>
        <Button startIcon={<Add />} onClick={addLanguage} variant="outlined" size="small">
          Añadir
        </Button>
      </Box>

      {fields.map((field, index) => (
        <Box
          key={field.id}
          sx={{
            mb: 2,
            p: 2,
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2,
            position: 'relative',
          }}
        >
          <IconButton
            onClick={() => remove(index)}
            size="small"
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              zIndex: 10,
              backgroundColor: 'white',
              '&:hover': { backgroundColor: '#f5f5f5' },
            }}
          >
            <Delete fontSize="small" />
          </IconButton>

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                {...register(`languages.${index}.name`)}
                label="Idioma"
                fullWidth
                size="small"
                placeholder="Ej: Inglés"
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Nivel de competencia</InputLabel>
                <Select
                  {...register(`languages.${index}.proficiency`)}
                  label="Nivel de competencia"
                >
                  {PROFICIENCY_LEVELS.map((level) => (
                    <MenuItem key={level} value={level}>
                      {level}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Box>
      ))}
    </Box>
  );
}
