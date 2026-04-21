import { useFieldArray, useFormContext, Controller } from 'react-hook-form';
import {
  TextField,
  IconButton,
  Box,
  Typography,
  Button,
  Grid,
} from '@mui/material';
import { Add, Delete } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { type Dayjs } from 'dayjs';

import type { ResumeData } from '../../../shared/types/resume.types';

function CertificationFields() {
  const { control, register } = useFormContext<ResumeData>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'certifications',
  });

  const addCertification = () => {
    append({
      id: crypto.randomUUID(),
      name: '',
      authority: '',
      issueDate: '',
      expirationDate: '',
      url: '',
    });
  };

  return (
    <Box sx={{ mt: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Certificaciones
        </Typography>
        <Button startIcon={<Add />} onClick={addCertification} variant="outlined" size="small">
          Añadir
        </Button>
      </Box>

      {fields.map((field, index) => (
        <Box
          key={field.id}
          sx={{
            mb: 3,
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
                {...register(`certifications.${index}.name`)}
                label="Nombre de la certificación"
                fullWidth
                size="small"
                placeholder="Ej: AWS Certified Solutions Architect"
              />
            </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                {...register(`certifications.${index}.authority`)}
                label="Organización emisora"
                fullWidth
                size="small"
                placeholder="Ej: Amazon Web Services"
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name={`certifications.${index}.issueDate`}
                control={control}
                render={({ field: { value, onChange } }) => (
                  <DatePicker
                    label="Fecha de expedición"
                    views={['month', 'year']}
                    value={value ? dayjs(value) : null}
                    onChange={(newValue: Dayjs | null) => {
                      onChange(newValue ? newValue.format('YYYY-MM') : '');
                    }}
                    slotProps={{
                      textField: {
                        size: 'small',
                        fullWidth: true,
                      },
                    }}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name={`certifications.${index}.expirationDate`}
                control={control}
                render={({ field: { value, onChange } }) => (
                  <DatePicker
                    label="Fecha de caducidad"
                    views={['month', 'year']}
                    value={value ? dayjs(value) : null}
                    onChange={(newValue: Dayjs | null) => {
                      onChange(newValue ? newValue.format('YYYY-MM') : '');
                    }}
                    slotProps={{
                      textField: {
                        size: 'small',
                        fullWidth: true,
                      },
                    }}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                {...register(`certifications.${index}.url`)}
                label="URL de la credencial"
                fullWidth
                size="small"
                placeholder="https://..."
              />
            </Grid>
          </Grid>
        </Box>
      ))}
    </Box>
  );
}

export default function CertificationsSection() {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <CertificationFields />
    </LocalizationProvider>
  );
}
