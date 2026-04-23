import { forwardRef } from 'react';

import { Box, Paper, Typography, Avatar, Divider, Chip } from '@mui/material';

import type { ResumeData } from '../../shared/types/resume.types';

declare interface ResumePreviewProps {
  data: ResumeData;
}

const ResumePreview = forwardRef<HTMLDivElement, ResumePreviewProps>(({ data }, ref) => {
  const { 
    personalInfo, 
    experience = [], 
    education = [], 
    skills = [], 
    certifications = [], 
    languages = [] 
  } = data;

  return (
    <Paper
      ref={ref}
      elevation={0}
      sx={{
        p: 4,
        maxWidth: '800px',
        mx: 'auto',
        backgroundColor: 'white',
        fontFamily: '"Inter", "Segoe UI", Roboto, sans-serif',
        borderRadius: 3,
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
      }}
    >
      {/* Cabecera */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 4 }}>
        {personalInfo.profilePicture && (
          <Avatar
            src={personalInfo.profilePicture}
            sx={{ width: 100, height: 100, border: '2px solid #0A66C2' }}
          />
        )}
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
            {personalInfo.firstName} {personalInfo.lastName}
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 500, mb: 1 }}>
            {personalInfo.headline || 'Profesional'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', gap: 1.5 }}>
            <span>{personalInfo.location || 'Ubicación no especificada'}</span>
            {personalInfo.email && <span>· {personalInfo.email}</span>}
            {personalInfo.phone && <span>· {personalInfo.phone}</span>}
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ my: 3 }} />

      {/* Resumen */}
      {personalInfo.summary && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#0A66C2', mb: 1, textTransform: 'uppercase', fontSize: '0.85rem', letterSpacing: '1px' }}>
            Acerca de
          </Typography>
          <Typography variant="body2" sx={{ lineHeight: 1.6, color: '#333' }}>
            {personalInfo.summary}
          </Typography>
        </Box>
      )}

      {/* Experiencia */}
      {experience.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#0A66C2', mb: 2, textTransform: 'uppercase', fontSize: '0.85rem', letterSpacing: '1px' }}>
            Experiencia
          </Typography>
          {experience.map((exp, idx) => (
            <Box key={exp.id || idx} sx={{ mb: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5 }}>
                {exp.title}
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                {exp.company} {exp.location && `· ${exp.location}`}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                {exp.startDate} - {exp.endDate} · {exp.employmentType} · {exp.workMode}
              </Typography>
              <Typography variant="body2" sx={{ color: '#444', whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>
                {exp.description}
              </Typography>
            </Box>
          ))}
        </Box>
      )}

      {/* Educación */}
      {education.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#0A66C2', mb: 2, textTransform: 'uppercase', fontSize: '0.85rem', letterSpacing: '1px' }}>
            Educación
          </Typography>
          {education.map((edu, idx) => (
            <Box key={edu.id || idx} sx={{ mb: 2.5 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5 }}>
                {edu.school}
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {edu.degree} en {edu.fieldOfStudy}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {edu.startYear} - {edu.endYear}
              </Typography>
            </Box>
          ))}
        </Box>
      )}

      {/* Certificaciones */}
      {certifications.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#0A66C2', mb: 2, textTransform: 'uppercase', fontSize: '0.85rem', letterSpacing: '1px' }}>
            Licencias y certificaciones
          </Typography>
          {certifications.map((cert, idx) => (
            <Box key={cert.id || idx} sx={{ mb: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                {cert.name || 'Certificación sin nombre'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {cert.authority} {cert.issueDate && `· Expedición: ${cert.issueDate}`}
              </Typography>
              {cert.url && (
                <Typography variant="caption" sx={{ color: '#0A66C2', wordBreak: 'break-all' }}>
                  {cert.url}
                </Typography>
              )}
            </Box>
          ))}
        </Box>
      )}

      {/* Idiomas */}
      {languages.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#0A66C2', mb: 2, textTransform: 'uppercase', fontSize: '0.85rem', letterSpacing: '1px' }}>
            Idiomas
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
            {languages.map((lang, idx) => (
              <Box key={lang.id || idx}>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  {lang.name || 'Idioma'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {lang.proficiency}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      )}

      {/* Habilidades */}
      {skills.length > 0 && (
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#0A66C2', mb: 2, textTransform: 'uppercase', fontSize: '0.85rem', letterSpacing: '1px' }}>
            Aptitudes
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {skills.map((skill, idx) => (
              <Chip
                key={idx}
                label={skill}
                size="small"
                sx={{ 
                  bgcolor: '#f0f7ff', 
                  color: '#0A66C2', 
                  fontWeight: 600,
                  borderRadius: 1,
                  border: '1px solid rgba(10, 102, 194, 0.1)'
                }}
              />
            ))}
          </Box>
        </Box>
      )}
    </Paper>
  );
});

ResumePreview.displayName = 'ResumePreview';

export default ResumePreview;