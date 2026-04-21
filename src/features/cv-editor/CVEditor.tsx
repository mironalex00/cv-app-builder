import { useRef, useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import {
  Container,
  Paper,
  Box,
  Typography,
  Button,
  Alert,
  Stack,
} from '@mui/material';
import {
  Preview,
} from '@mui/icons-material';

import PreviewModal from '../cv-preview/PreviewModal';
import PersonalInfoSection from './components/PersonalInfoSection';
import ExperienceSection from './components/ExperienceSection';
import EducationSection from './components/EducationSection';
import CertificationsSection from './components/CertificationsSection';
import LanguagesSection from './components/LanguagesSection';
import SkillsSection from './components/SkillsSection';

import type { ResumeData } from '../../shared/types/resume.types';

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

const isFormValid = (data: ResumeData): boolean => {
  const { personalInfo, experience, education } = data;
  
  const isFilled = (val: string) => val.trim() !== '';

  const hasBasicInfo = 
    isFilled(personalInfo.firstName) && 
    isFilled(personalInfo.lastName) && 
    isFilled(personalInfo.headline) && 
    isFilled(personalInfo.phone) && 
    isFilled(personalInfo.location);
    
  const hasValidEmail = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(personalInfo.email);
  
  const hasFullExperience = experience.some(exp => 
    isFilled(exp.title) && 
    isFilled(exp.company) && 
    isFilled(exp.employmentType) && 
    isFilled(exp.workMode) && 
    isFilled(exp.startDate) && 
    isFilled(exp.endDate) && 
    isFilled(exp.description) && 
    isFilled(exp.location as string)
  );
  
  const hasFullEducation = education.some(edu => 
    isFilled(edu.school) && 
    isFilled(edu.degree) && 
    isFilled(edu.fieldOfStudy) && 
    isFilled(edu.startYear) && 
    isFilled(edu.endYear)
  );

  return hasBasicInfo && hasValidEmail && (hasFullExperience || hasFullEducation);
};

export default function CVEditor() {
  const previewRef = useRef<HTMLDivElement>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const methods = useForm<ResumeData>({
    defaultValues: defaultResumeData,
    mode: 'onChange',
  });

  const data = methods.watch();
  const isValid = isFormValid(data);

  const handleOpenPreview = () => {
    if (!isFormValid(methods.getValues())) {
      return;
    }
    setModalOpen(true);
  };

  const handleClosePreview = () => {
    setModalOpen(false);
  };

  const isFilled = (val: unknown) => typeof val === 'string' && val.trim() !== '';
  const missingBasic = 
    !isFilled(data.personalInfo.firstName) || 
    !isFilled(data.personalInfo.lastName) || 
    !isFilled(data.personalInfo.headline) || 
    !isFilled(data.personalInfo.phone) || 
    !isFilled(data.personalInfo.location) || 
    !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(data.personalInfo.email);

  const missingEntries = !data.experience.some(exp => isFilled(exp.title) && isFilled(exp.company)) && !data.education.some(edu => isFilled(edu.school) && isFilled(edu.degree));
  const missingFullEntry = !isValid && !missingEntries && !missingBasic;

  return (
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
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
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

            {!isValid && (
              <Alert severity="warning" sx={{ mb: 4, borderRadius: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  Acción requerida para habilitar la vista previa:
                </Typography>
                <ul style={{ margin: '4px 0', paddingLeft: '20px' }}>
                  {missingBasic && <li>Completa toda tu Información Personal (incluyendo título, teléfono y ubicación).</li>}
                  {missingEntries && <li>Añade al menos una Experiencia o Educación.</li>}
                  {missingFullEntry && <li>Asegúrate de que al menos una entrada de experiencia o educación esté **totalmente rellena** (todos los campos con *).</li>}
                </ul>
              </Alert>
            )}

            <Stack spacing={4}>
              <PersonalInfoSection />
              <ExperienceSection />
              <EducationSection />
              <CertificationsSection />
              <LanguagesSection />
              <SkillsSection />
            </Stack>
          </Paper>
        </Container>

        <PreviewModal
          open={modalOpen}
          onClose={handleClosePreview}
          data={data}
          isValid={isValid}
          ref={previewRef}
        />
      </Box>
    </FormProvider>
  );
}
