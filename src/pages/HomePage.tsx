import { Container, Box, Typography, Paper, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { EditNote } from '@mui/icons-material';

export default function HomePage() {
  const navigate = useNavigate();

  const handleStartBlank = () => {
    navigate('/editor');
  };

  return (
    <Container maxWidth="md" sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
      <Paper
        elevation={0}
        sx={{
          p: { xs: 4, md: 8 },
          width: '100%',
          background: 'linear-gradient(145deg, #ffffff 0%, #f8faff 100%)',
          borderRadius: 6,
          border: '1px solid rgba(10, 102, 194, 0.1)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.05)',
          textAlign: 'center',
        }}
      >
        <Box sx={{ mb: 6 }}>
          <Typography
            variant="h2"
            sx={{
              fontWeight: 800,
              background: 'linear-gradient(135deg, #0A66C2 0%, #004182 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 2,
              fontSize: { xs: '2.5rem', md: '3.5rem' }
            }}
          >
            CV Style Studio
          </Typography>
          <Typography variant="h5" color="text.secondary" sx={{ mb: 4, fontWeight: 400 }}>
            Crea un currículum profesional y destacado en pocos minutos
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: '600px', mx: 'auto', mb: 6 }}>
            Diseña tu perfil profesional con nuestras herramientas intuitivas y descarga un PDF listo para impresionar a cualquier reclutador.
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Button
            variant="contained"
            size="large"
            startIcon={<EditNote />}
            onClick={handleStartBlank}
            sx={{
              py: 2.5,
              px: 6,
              borderRadius: 4,
              fontSize: '1.25rem',
              fontWeight: 600,
              textTransform: 'none',
              bgcolor: '#0A66C2',
              boxShadow: '0 10px 20px rgba(10, 102, 194, 0.2)',
              '&:hover': { 
                bgcolor: '#004182',
                boxShadow: '0 15px 30px rgba(10, 102, 194, 0.3)',
                transform: 'translateY(-2px)'
              },
              transition: 'all 0.3s ease'
            }}
          >
            Empezar a editar mi CV
          </Button>
        </Box>

        <Box sx={{ mt: 8, pt: 4, borderTop: '1px solid rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'center', gap: 4 }}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#0A66C2' }}>Rápido</Typography>
            <Typography variant="caption" color="text.secondary">En 5 minutos</Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#0A66C2' }}>Profesional</Typography>
            <Typography variant="caption" color="text.secondary">Diseño limpio</Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#0A66C2' }}>Gratis</Typography>
            <Typography variant="caption" color="text.secondary">Sin registros</Typography>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
}
