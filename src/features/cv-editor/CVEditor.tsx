import { lazy, Suspense, useRef, useState, useCallback, useMemo } from 'react';
import { useForm, FormProvider } from 'react-hook-form';

import { Alert, Box, Button, Container, Paper, Stack, Skeleton, Typography } from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { Preview } from '@mui/icons-material';

import PreviewModal from '../cv-preview/PreviewModal';

import { isFormValid, isNonEmptyString, EMAIL_REGEX } from './helpers/validation';

import type { ResumeData } from '../../shared/types/resume.types';

// -----------------------------------------------------------------------------
// Lazy‑loaded form sections (reduce initial bundle size)
// -----------------------------------------------------------------------------
const PersonalInfoSection = lazy(() => import('./components/PersonalInfoSection'));
const ExperienceSection = lazy(() => import('./components/ExperienceSection'));
const EducationSection = lazy(() => import('./components/EducationSection'));
const CertificationsSection = lazy(() => import('./components/CertificationsSection'));
const LanguagesSection = lazy(() => import('./components/LanguagesSection'));
const SkillsSection = lazy(() => import('./components/SkillsSection'));

// -----------------------------------------------------------------------------
// Skeleton fallback mientras se carga cada sección
// -----------------------------------------------------------------------------
const SectionSkeleton = () => (
  <Box sx={{ mt: 3 }}>
    <Skeleton variant="text" width="40%" height={32} sx={{ mb: 2 }} />
    <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 2 }} />
  </Box>
);

// -----------------------------------------------------------------------------
// Form default values
// -----------------------------------------------------------------------------
const defaultResumeData: ResumeData = {
  personalInfo: {
    firstName: '',
    lastName: '',
    headline: '',
    email: '',
    phone: '',
    location: '',
    summary: '',
    profilePicture: '',
  },
  experience: [],
  education: [],
  skills: [],
  certifications: [],
  languages: [],
};

// -----------------------------------------------------------------------------
// Main editor component
// -----------------------------------------------------------------------------
export default function CVEditor() {
  const previewRef = useRef<HTMLDivElement>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const methods = useForm<ResumeData>({
    defaultValues: defaultResumeData,
    mode: 'onChange',
  });

  const data = methods.watch();

  const isValid = useMemo(() => isFormValid(data), [data]);

  const missingFlags = useMemo(() => {
    const missingBasic =
      !isNonEmptyString(data.personalInfo.firstName) ||
      !isNonEmptyString(data.personalInfo.lastName) ||
      !isNonEmptyString(data.personalInfo.headline) ||
      !isNonEmptyString(data.personalInfo.phone) ||
      !isNonEmptyString(data.personalInfo.location) ||
      !EMAIL_REGEX.test(data.personalInfo.email);

    const missingEntries =
      !data.experience.some(
        (exp) => isNonEmptyString(exp.title) && isNonEmptyString(exp.company)
      ) &&
      !data.education.some(
        (edu) => isNonEmptyString(edu.school) && isNonEmptyString(edu.degree)
      );

    const missingFullEntry = !isValid && !missingEntries && !missingBasic;

    return { missingBasic, missingEntries, missingFullEntry };
  }, [data, isValid]);

  const handleOpenPreview = useCallback(() => {
    if (isFormValid(methods.getValues())) {
      setModalOpen(true);
    }
  }, [methods]);

  const handleClosePreview = useCallback(() => {
    setModalOpen(false);
  }, []);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <FormProvider {...methods}>
        <Box sx={{ bgcolor: '#f5f7fa', minHeight: '100vh', py: 4 }}>
          <Container maxWidth="lg">
            <Paper
              elevation={0}
              sx={{
                p: 4,
                borderRadius: 4,
                boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                border: '1px solid rgba(0,0,0,0.05)',
              }}
            >
              {/* Cabecera con título y botón de vista previa */}
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 4,
                }}
              >
                <Typography variant="h5" sx={{ fontWeight: 700, color: '#0A66C2' }}>
                  Edita tu CV
                </Typography>
                <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
                  <Button
                    variant="contained"
                    startIcon={<Preview />}
                    onClick={handleOpenPreview}
                    disabled={!isValid}
                    sx={{
                      borderRadius: 2,
                      px: 3,
                      py: 1,
                      textTransform: 'none',
                      bgcolor: '#0A66C2',
                      fontWeight: 600,
                      '&:hover': { bgcolor: '#004182' },
                      '&.Mui-disabled': { bgcolor: 'grey.300' },
                    }}
                  >
                    Generar vista previa
                  </Button>
                </Stack>
              </Box>

              {/* Mensaje de advertencia con requisitos pendientes */}
              {!isValid && (
                <Alert severity="warning" sx={{ mb: 4, borderRadius: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    Acción requerida para habilitar la vista previa:
                  </Typography>
                  <ul style={{ margin: '4px 0', paddingLeft: '20px' }}>
                    {missingFlags.missingBasic && (
                      <li>
                        Completa toda tu Información Personal (incluyendo título,
                        teléfono y ubicación).
                      </li>
                    )}
                    {missingFlags.missingEntries && (
                      <li>Añade al menos una Experiencia o Educación.</li>
                    )}
                    {missingFlags.missingFullEntry && (
                      <li>
                        Asegúrate de que al menos una entrada de experiencia o
                        educación esté <strong>totalmente rellena</strong> (todos los
                        campos con *).
                      </li>
                    )}
                  </ul>
                </Alert>
              )}

              {/* Secciones del formulario cargadas perezosamente */}
              <Stack spacing={4}>
                <Suspense fallback={<SectionSkeleton />}>
                  <PersonalInfoSection />
                </Suspense>
                <Suspense fallback={<SectionSkeleton />}>
                  <ExperienceSection />
                </Suspense>
                <Suspense fallback={<SectionSkeleton />}>
                  <EducationSection />
                </Suspense>
                <Suspense fallback={<SectionSkeleton />}>
                  <CertificationsSection />
                </Suspense>
                <Suspense fallback={<SectionSkeleton />}>
                  <LanguagesSection />
                </Suspense>
                <Suspense fallback={<SectionSkeleton />}>
                  <SkillsSection />
                </Suspense>
              </Stack>
            </Paper>
          </Container>

          {/* Modal de vista previa (contiene el botón de exportación PDF cargado perezosamente) */}
          <PreviewModal
            open={modalOpen}
            onClose={handleClosePreview}
            data={data}
            previewRef={previewRef as React.RefObject<HTMLDivElement>}
          />
        </Box>
      </FormProvider>
    </LocalizationProvider>
  );
}