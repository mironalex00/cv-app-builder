import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import {
  Box,
  Typography,
  TextField,
  Chip,
  IconButton,
  InputAdornment,
  Paper,
} from '@mui/material';
import { Add, Close } from '@mui/icons-material';
import type { ResumeData } from '../../../shared/types/resume.types';

// Habilidades sugeridas para UX Designer (se pueden mostrar como chips de ejemplo)
const SUGGESTED_SKILLS = [
  'User Research',
  'Wireframing',
  'Prototyping',
  'Figma',
  'Adobe XD',
  'Usability Testing',
  'Information Architecture',
  'Design Systems',
  'User Flows',
  'Interaction Design',
];

export default function SkillsSection() {
  const { watch, setValue } = useFormContext<ResumeData>();
  const skills = watch('skills') || [];
  const [newSkill, setNewSkill] = useState('');

  const handleAddSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setValue('skills', [...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setValue(
      'skills',
      skills.filter((s) => s !== skillToRemove)
    );
  };

  const handleAddSuggested = (skill: string) => {
    if (!skills.includes(skill)) {
      setValue('skills', [...skills, skill]);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddSkill();
    }
  };

  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h6" sx={{ fontWeight: 600 }} gutterBottom>
        Habilidades
      </Typography>

      <TextField
        value={newSkill}
        onChange={(e) => setNewSkill(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder="Ej: JavaScript, Figma, Project Management"
        fullWidth
        size="small"
        slotProps={{
          input: {
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={handleAddSkill} edge="end" disabled={!newSkill.trim()}>
                  <Add />
                </IconButton>
              </InputAdornment>
            ),
          },
        }}
        sx={{ mb: 2 }}
      />

      {/* Habilidades actuales */}
      <Paper
        variant="outlined"
        sx={{
          p: 2,
          minHeight: 80,
          display: 'flex',
          flexWrap: 'wrap',
          gap: 1,
          borderRadius: 2,
          mb: 2,
        }}
      >
        {skills.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ width: '100%', textAlign: 'center' }}>
            Aún no has añadido habilidades
          </Typography>
        ) : (
          skills.map((skill) => (
            <Chip
              key={skill}
              label={skill}
              onDelete={() => handleRemoveSkill(skill)}
              deleteIcon={<Close />}
              sx={{
                bgcolor: '#f0f7ff',
                color: '#0A66C2',
                fontWeight: 500,
                '& .MuiChip-deleteIcon': { color: '#0A66C2' },
              }}
            />
          ))
        )}
      </Paper>

      {/* Sugerencias (solo visibles si no hay muchas habilidades) */}
      {skills.length < 8 && (
        <Box>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Sugerencias para UX Designer
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {SUGGESTED_SKILLS.filter((s) => !skills.includes(s))
              .slice(0, 5)
              .map((skill) => (
                <Chip
                  key={skill}
                  label={skill}
                  variant="outlined"
                  onClick={() => handleAddSuggested(skill)}
                  size="small"
                  sx={{ cursor: 'pointer' }}
                />
              ))}
          </Box>
        </Box>
      )}
    </Box>
  );
}