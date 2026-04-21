import { Box, Typography, Button, Container } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { ErrorOutlined } from '@mui/icons-material';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <Container maxWidth="md">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '80vh',
          textAlign: 'center',
          gap: 3,
        }}
      >
        <Box
          sx={{
            background: 'linear-gradient(135deg, #0A66C2 0%, #004182 100%)',
            borderRadius: '50%',
            p: 4,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 2,
            boxShadow: '0 8px 32px rgba(10, 102, 194, 0.25)',
            animation: 'pulse 2s infinite ease-in-out',
            '@keyframes pulse': {
              '0%': { transform: 'scale(1)', boxShadow: '0 8px 32px rgba(10, 102, 194, 0.25)' },
              '50%': { transform: 'scale(1.05)', boxShadow: '0 12px 48px rgba(10, 102, 194, 0.4)' },
              '100%': { transform: 'scale(1)', boxShadow: '0 8px 32px rgba(10, 102, 194, 0.25)' },
            },
          }}
        >
          <ErrorOutlined sx={{ fontSize: 100, color: '#fff' }} />
        </Box>

        <Typography 
          variant="h1" 
          component="h1"
          sx={{ 
            fontSize: { xs: '6rem', md: '10rem' }, 
            fontWeight: 900,
            background: 'linear-gradient(to bottom, #0A66C2, #004182)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: -4,
            lineHeight: 1,
          }}
        >
          404
        </Typography>

        <Typography 
          variant="h4" 
          color="text.primary" 
          gutterBottom
          sx={{ fontWeight: 700 }}
        >
          Oops! Page Not Found
        </Typography>

        <Typography 
          variant="body1" 
          color="text.secondary" 
          sx={{ maxWidth: 480, mb: 4, fontSize: '1.2rem' }}
        >
          The page you're looking for doesn't exist or has been moved. 
          Let's get you back on track to building your professional CV.
        </Typography>

        <Button
          variant="contained"
          size="large"
          onClick={() => navigate('/')}
          sx={{
            px: 6,
            py: 1.5,
            borderRadius: 8,
            fontSize: '1.1rem',
            fontWeight: 700,
            textTransform: 'none',
            background: 'linear-gradient(135deg, #0A66C2 0%, #004182 100%)',
            boxShadow: '0 4px 20px rgba(10, 102, 194, 0.3)',
            '&:hover': {
              background: 'linear-gradient(135deg, #004182 0%, #053361 100%)',
              transform: 'translateY(-2px)',
              boxShadow: '0 6px 24px rgba(10, 102, 194, 0.4)',
            },
            transition: 'all 0.3s ease',
          }}
        >
          Back to Home
        </Button>
      </Box>
    </Container>
  );
}