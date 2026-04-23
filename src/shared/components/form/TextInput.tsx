import React from 'react';
import { TextField, styled, alpha, type TextFieldProps } from '@mui/material';
import { useFormContext, Controller, type RegisterOptions } from 'react-hook-form';

export type InputVariant = 'classic' | 'modern' | 'minimal';

interface TextInputProps extends Omit<TextFieldProps, 'variant'> {
  name: string;
  label: string;
  rules?: RegisterOptions;
  uiVariant?: InputVariant;
}

const StyledTextField = styled(TextField, {
  shouldForwardProp: (prop) => prop !== 'uiVariant',
})<{ uiVariant: InputVariant }>(({ theme, uiVariant }) => ({
  '& .MuiOutlinedInput-root': {
    transition: theme.transitions.create(['border-color', 'box-shadow']),
    ...(uiVariant === 'modern' && {
      borderRadius: 12,
      backgroundColor: theme.palette.mode === 'light' ? '#f8fafc' : alpha(theme.palette.common.white, 0.05),
      '&:hover': {
        backgroundColor: theme.palette.mode === 'light' ? '#f1f5f9' : alpha(theme.palette.common.white, 0.08),
      },
      '&.Mui-focused': {
        boxShadow: `${alpha(theme.palette.primary.main, 0.2)} 0 0 0 4px`,
      },
    }),
    ...(uiVariant === 'minimal' && {
      borderRadius: 0,
      borderTop: 'none',
      borderLeft: 'none',
      borderRight: 'none',
      backgroundColor: 'transparent',
      '& fieldset': {
        border: 'none',
      },
      borderBottom: `1px solid ${theme.palette.divider}`,
      '&:hover': {
        borderBottomColor: theme.palette.primary.main,
      },
      '&.Mui-focused': {
        borderBottom: `2px solid ${theme.palette.primary.main}`,
      },
    }),
  },
  '& .MuiInputLabel-root': {
    ...(uiVariant === 'modern' && {
      fontWeight: 600,
    }),
  },
}));

export const TextInput = React.memo(({ 
  name, 
  label, 
  rules, 
  uiVariant = 'classic', 
  ...props 
}: TextInputProps) => {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field, fieldState: { error } }) => (
        <StyledTextField
          {...field}
          label={label}
          uiVariant={uiVariant}
          fullWidth
          error={!!error}
          helperText={error?.message}
          variant="outlined"
          {...props}
        />
      )}
    />
  );
});

TextInput.displayName = 'TextInput';