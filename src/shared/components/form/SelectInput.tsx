import { useCallback, useState, useMemo } from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { alpha, Autocomplete, Box, CircularProgress, TextField, Typography } from '@mui/material';

import type { SyntheticEvent } from 'react';
import type { AutocompleteProps, AutocompleteValue, AutocompleteInputChangeReason, AutocompleteRenderInputParams } from '@mui/material';
import type { InputVariant } from './TextInput';

// ============================================================================
// Types & Interfaces
// ============================================================================
export type SelectInputValue<T, FreeSolo extends boolean> = AutocompleteValue<T, false, false, FreeSolo>;

export interface SearchableOption {
  id?: string | number;
  name?: string;
  title?: string;
  searchTerms?: string[];
}

export interface SelectInputProps<
  T,
  FreeSolo extends boolean = false
> extends Omit<
  AutocompleteProps<
    T, false, false, FreeSolo
  >, 'renderInput' | 'value' | 'onChange' | 'options'
> {
  name: string;
  label: string;
  required?: boolean;
  uiVariant?: InputVariant;
  placeholder?: string;
  onChange?: (event: SyntheticEvent, value: SelectInputValue<T, FreeSolo>) => void;
  value?: SelectInputValue<T, FreeSolo>;
  options: readonly T[];
  enableSearchTerms?: boolean;
}


function defaultFilterOptions<T>(
  options: readonly T[],
  state: { inputValue: string; getOptionLabel: (option: T) => string },
  enableSearchTerms: boolean = false
): T[] {
  const query = state.inputValue.toLowerCase().trim();
  if (!query) return options as T[];

  return options.filter((option) => {
    const label = state.getOptionLabel(option).toLowerCase();
    if (label.includes(query)) return true;

    if (enableSearchTerms) {
      const optionWithTerms = option as unknown as SearchableOption;
      const terms = optionWithTerms.searchTerms;
      if (Array.isArray(terms)) {
        return terms.some((term) => term.toLowerCase().includes(query));
      }
    }
    return false;
  });
}

export function SelectInput<T, FreeSolo extends boolean = false>({
  name,
  label,
  required = false,
  uiVariant = 'classic',
  options,
  placeholder,
  enableSearchTerms = false,
  filterOptions: externalFilterOptions,
  getOptionLabel: externalGetOptionLabel,
  onChange: externalOnChange,
  value: externalValue,
  onInputChange: externalOnInputChange,
  loading = false,
  ...props
}: SelectInputProps<T, FreeSolo>) {
  const { control } = useFormContext();
  const [internalInputValue, setInternalInputValue] = useState<string>('');

  const getOptionLabel = useCallback(
    (option: T | string): string => {
      if (typeof option === 'string') return option;
      if (externalGetOptionLabel) {
        return externalGetOptionLabel(option as T);
      }
      if (option === null || option === undefined) return '';

      const obj = option as unknown as SearchableOption;
      if (obj.name && typeof obj.name === 'string') return obj.name;
      if (obj.title && typeof obj.title === 'string') return obj.title;
      if (obj.id !== undefined) return String(obj.id);
      return '';
    },
    [externalGetOptionLabel]
  );

  const filterOptions = useMemo(() => {
    if (externalFilterOptions) return externalFilterOptions;
    return (opts: T[], state: { inputValue: string; getOptionLabel: (opt: T) => string }) =>
      defaultFilterOptions(opts, state, enableSearchTerms);
  }, [externalFilterOptions, enableSearchTerms]);

  const handleInputChange = useCallback(
    (event: SyntheticEvent, value: string, reason: AutocompleteInputChangeReason) => {
      setInternalInputValue(value);
      externalOnInputChange?.(event, value, reason);
    },
    [externalOnInputChange]
  );

  const handleChange = useCallback(
    (event: SyntheticEvent, newValue: SelectInputValue<T, FreeSolo>) => {
      externalOnChange?.(event, newValue);
    },
    [externalOnChange]
  );

  const isOptionEqualToValue = useCallback(
    (option: T, value: T | string): boolean => {
      if (typeof value === 'string') {
        return getOptionLabel(option) === value;
      }
      if (!value) return false;

      const optId = (option as SearchableOption).id;
      const valId = (value as SearchableOption).id;
      if (optId !== undefined && valId !== undefined) {
        return optId === valId;
      }
      return getOptionLabel(option) === getOptionLabel(value);
    },
    [getOptionLabel]
  );

  return (
    <Controller
      name={name}
      control={control}
      rules={{ required: required ? `${label} es obligatorio` : false }}
      render={({ field: { onChange, value, ref, ...field }, fieldState: { error } }) => {
        const resolvedValue = (externalValue !== undefined ? externalValue : value ?? null) as SelectInputValue<
          T,
          FreeSolo
        >;

        return (
          <Autocomplete<T, false, false, FreeSolo>
            {...field}
            {...props}
            ref={ref}
            options={options}
            filterOptions={filterOptions}
            getOptionLabel={getOptionLabel}
            inputValue={internalInputValue}
            onInputChange={handleInputChange}
            value={resolvedValue}
            onChange={(event, newValue) => {
              onChange(newValue);
              handleChange(event, newValue as SelectInputValue<T, FreeSolo>);
            }}
            loading={loading}
            loadingText="Cargando..."
            noOptionsText="Sin opciones"
            autoHighlight
            autoSelect
            isOptionEqualToValue={isOptionEqualToValue}
            sx={[
              {
                textTransform: 'capitalize',
                '& .MuiOutlinedInput-root': {
                  transition: (theme) => theme.transitions.create(['border-color', 'box-shadow']),
                  ...(uiVariant === 'modern' && {
                    borderRadius: 12,
                    backgroundColor: (theme) =>
                      theme.palette.mode === 'light' ? '#f8fafc' : alpha(theme.palette.common.white, 0.05),
                    '&.Mui-focused': {
                      boxShadow: (theme) => `${alpha(theme.palette.primary.main, 0.2)} 0 0 0 4px`,
                    },
                  }),
                  ...(uiVariant === 'minimal' && {
                    borderRadius: 0,
                    '& fieldset': { border: 'none' },
                    borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
                    '&.Mui-focused': {
                      borderBottom: (theme) => `2px solid ${theme.palette.primary.main}`,
                    },
                  }),
                },
                '& .MuiAutocomplete-option': { textTransform: 'capitalize' },
              },
              ...(Array.isArray(props.sx) ? props.sx : props.sx ? [props.sx] : []),
            ]}
            renderOption={(props, option, state) => {
              const { key, ...optionProps } = props;
              const opt = option as T;
              
              const uniqueKey =
                typeof opt === 'object' && opt !== null && 'id' in opt
                  ? String((opt as { id?: string | number }).id)
                  : key;

              const query = state.inputValue.toLowerCase().trim();
              const label = getOptionLabel(opt);
              const isDirectMatch = label.toLowerCase().includes(query);

              let secondaryTerm: string | undefined;
              if (!isDirectMatch && enableSearchTerms) {
                const terms = (option as SearchableOption).searchTerms;
                if (Array.isArray(terms)) {
                  secondaryTerm = terms.find((t) => t.toLowerCase().includes(query));
                }
              }

              return (
                <li key={uniqueKey} {...optionProps}>
                  <Box>
                    <Typography
                      component="span"
                      sx={{
                        fontWeight: isDirectMatch ? 600 : 400,
                        textTransform: 'capitalize',
                      }}
                    >
                      {label}
                    </Typography>
                    {secondaryTerm && (
                      <Typography variant="caption" color="text.secondary" sx={{ ml: 1, display: 'block' }}>
                        ({secondaryTerm})
                      </Typography>
                    )}
                  </Box>
                </li>
              );
            }}
            renderInput={(params: AutocompleteRenderInputParams) => (
              <TextField
                {...params}
                label={label}
                placeholder={placeholder}
                required={required}
                error={!!error}
                helperText={error?.message}
                slotProps={{
                  ...params.slotProps,
                  input: {
                    ...params.slotProps?.input,
                    endAdornment: (
                      <>
                        {loading ? <CircularProgress color="inherit" size={20} /> : null}
                        {params.slotProps?.input?.endAdornment}
                      </>
                    ),
                  },
                }}
                sx={{
                  '& .MuiInputBase-input': { textTransform: 'capitalize' },
                }}
              />
            )}
          />
        );
      }}
    />
  );
}