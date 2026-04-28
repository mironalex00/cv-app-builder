
import { memo } from 'react';

import { validateEmail } from '../../services/emailService';
import TextInput, { type InputVariant } from './TextInput';

import type { TextFieldProps } from '@mui/material';

declare interface EmailInputProps extends Omit<TextFieldProps, 'variant'> {
  name: string;
  label?: string;
  required?: boolean;
  uiVariant?: InputVariant;
}

const EmailInput = memo(({ 
  name, 
  label = 'Email', 
  required = true, 
  uiVariant = 'classic',
  ...props 
}: EmailInputProps) => {
  return (
    <TextInput
      name={name}
      label={label}
      type="email"
      uiVariant={uiVariant}
      rules={{
        required: required ? 'El email es obligatorio' : false,
        validate: (value: string) => !value || validateEmail(value) || 'Email inválido'
      }}
      {...props}
    />
  );
});

EmailInput.displayName = 'EmailInput';

export default EmailInput;