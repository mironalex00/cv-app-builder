import { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { useFormContext } from 'react-hook-form';
import { Typography, Grid, Box } from '@mui/material';

import { isValidPhoneNumber, type CountryCode } from 'libphonenumber-js';

import { TextInput } from '../../../shared/components/form/TextInput';
import { EmailInput } from '../../../shared/components/form/EmailInput';
import { SelectInput } from '../../../shared/components/form/SelectInput';
import { ProfilePicture } from '../../../shared/components/form/ProfilePicture';

import { useCountries, useJobTitleSuggestions, useStates } from '../hooks/location.hooks';

import type { CountryData, StateData } from '../../../shared/services/locationService';
import type { JobTitleSuggestion } from '../../../shared/services/jobTitlesService';

import type { ResumeData } from '../../../shared/types/resume.types';

// -----------------------------------------------------------------------------
// Interfaces
// -----------------------------------------------------------------------------
declare interface LocationSelectorsProps {
  selectedCountryId: number | null;
  setSelectedCountryId: (id: number | null) => void;
  selectedStateId: number | null;
  setSelectedStateId: (id: number | null) => void;
  locationValue: string;
  setLocation: (value: string) => void;
}
declare interface TitleAutocompleteProps {
  uiVariant: 'modern';
  onInputChange: (event: React.SyntheticEvent, value: string) => void;
  loading: boolean;
  options: JobTitleSuggestion[];
}

// -----------------------------------------------------------------------------
// Memoized Subcomponents
// -----------------------------------------------------------------------------
const LocationSelectors = memo(function LocationSelectors({
  selectedCountryId,
  setSelectedCountryId,
  selectedStateId,
  setSelectedStateId,
  locationValue,
  setLocation,
}: LocationSelectorsProps) {
  const { countries, loading: loadingCountries } = useCountries();
  const { states, loading: loadingStates } = useStates(selectedCountryId);

  useEffect(() => {
    if (!locationValue || countries.length === 0) return;
    const parts = locationValue.split(', ');
    if (parts.length < 2) return;
    const [, countryLabel] = parts;
    const matchedCountry = countries.find(
      (c) => (c.searchTerms?.[0] || c.name).toUpperCase() === countryLabel.toUpperCase()
    );
    if (matchedCountry && matchedCountry.id !== selectedCountryId) {
      setSelectedCountryId(matchedCountry.id);
    }
  }, [locationValue, countries, selectedCountryId, setSelectedCountryId]);

  const handleCountryChange = useCallback(
    (_: React.SyntheticEvent, country: CountryData | null) => {
      if (country) {
        setSelectedCountryId(country.id);
        setLocation((country.searchTerms?.[0] || country.name).toUpperCase());
        setSelectedStateId(null);
      } else {
        setSelectedCountryId(null);
        setLocation('');
        setSelectedStateId(null);
      }
    },
    [setSelectedCountryId, setSelectedStateId, setLocation]
  );

  const handleStateChange = useCallback(
    (_: React.SyntheticEvent, state: StateData | null) => {
      const country = countries.find((c) => c.id === selectedCountryId);
      if (state && country) {
        const countryLabel = (country.searchTerms?.[0] || country.name).toUpperCase();
        setLocation(`${state.name.toUpperCase()}, ${countryLabel}`);
        setSelectedStateId(state.id);
      } else if (country) {
        setLocation((country.searchTerms?.[0] || country.name).toUpperCase());
        setSelectedStateId(null);
      } else {
        setLocation('');
        setSelectedStateId(null);
      }
    },
    [selectedCountryId, countries, setSelectedStateId, setLocation]
  );

  const selectedCountry = useMemo(
    () => countries.find((c) => c.id === selectedCountryId) ?? null,
    [countries, selectedCountryId]
  );

  const selectedState = useMemo(
    () => states.find((s) => s.id === selectedStateId) ?? null,
    [states, selectedStateId]
  );

  return (
    <>
      <Grid size={{ xs: 12, sm: 5 }}>
        <SelectInput<CountryData, false>
          name="_countrySelect"
          label="País"
          required
          options={countries}
          loading={loadingCountries}
          value={selectedCountry}
          onChange={handleCountryChange}
          getOptionLabel={(option) => option.searchTerms?.[0] || option.name}
          uiVariant="modern"
          enableSearchTerms
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 7 }}>
        <SelectInput<StateData, false>
          name="_stateSelect"
          label="Estado / Provincia"
          required
          options={states}
          loading={loadingStates}
          value={selectedState}
          onChange={handleStateChange}
          disabled={!selectedCountryId}
          getOptionLabel={(option) => option.name}
          uiVariant="modern"
          placeholder={selectedCountryId ? 'Selecciona un estado' : 'Primero selecciona un país'}
          enableSearchTerms
        />
      </Grid>
    </>
  );
});

const TitleAutocomplete = memo(function TitleAutocomplete({
  uiVariant,
  onInputChange,
  loading,
  options,
}: TitleAutocompleteProps) {
  return (
    <SelectInput<JobTitleSuggestion | string, true>
      name="personalInfo.headline"
      label="Título profesional"
      required
      freeSolo
      options={options}
      getOptionLabel={(option) => (typeof option === 'string' ? option : option.title)}
      onInputChange={onInputChange}
      loading={loading}
      uiVariant={uiVariant}
      placeholder="Ej: Desarrollador Frontend"
      enableSearchTerms
    />
  );
});

// -----------------------------------------------------------------------------
// Main Component
// -----------------------------------------------------------------------------
export default function PersonalInfoSection() {
  const { setValue, watch } = useFormContext<ResumeData>();
  const uiVariant = 'modern' as const;

  const [selectedCountryId, setSelectedCountryId] = useState<number | null>(null);
  const [selectedStateId, setSelectedStateId] = useState<number | null>(null);

  const locationValue = watch('personalInfo.location');

  const { options: titleOptions, loading: loadingTitles, handleInputChange } = useJobTitleSuggestions();

  const setLocation = useCallback(
    (value: string) => {
      setValue('personalInfo.location', value);
    },
    [setValue]
  );

  const phoneRules = useMemo(
    () => ({
      required: 'El teléfono es obligatorio',
      validate: (value: string) => {
        if (!value) return true;
        const countryCode = (selectedCountryId ? 'ES' : undefined) as CountryCode | undefined;
        return countryCode && isValidPhoneNumber(value, countryCode)
          ? true
          : 'Número de teléfono inválido';
      },
    }),
    [selectedCountryId]
  );

  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }} gutterBottom>
        Información Personal
      </Typography>

      <Grid container spacing={4}>
        <Grid size={{ xs: 12, sm: 3 }}>
          <ProfilePicture name="personalInfo.profilePicture" uiVariant={uiVariant} />
        </Grid>

        <Grid size={{ xs: 12, sm: 9 }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextInput
                name="personalInfo.firstName"
                label="Nombre"
                required
                rules={{ required: 'El nombre es obligatorio' }}
                uiVariant={uiVariant}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextInput
                name="personalInfo.lastName"
                label="Apellido"
                required
                rules={{ required: 'El apellido es obligatorio' }}
                uiVariant={uiVariant}
              />
            </Grid>

            <Grid size={12}>
              <TitleAutocomplete
                uiVariant={uiVariant}
                onInputChange={handleInputChange}
                loading={loadingTitles}
                options={titleOptions}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <EmailInput name="personalInfo.email" uiVariant={uiVariant} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextInput
                name="personalInfo.phone"
                label="Teléfono"
                type="tel"
                required
                uiVariant={uiVariant}
                rules={phoneRules}
              />
            </Grid>

            <LocationSelectors
              selectedCountryId={selectedCountryId}
              setSelectedCountryId={setSelectedCountryId}
              selectedStateId={selectedStateId}
              setSelectedStateId={setSelectedStateId}
              locationValue={locationValue}
              setLocation={setLocation}
            />

            <Grid size={12}>
              <TextInput
                name="personalInfo.summary"
                label="Resumen profesional"
                multiline
                rows={3}
                uiVariant={uiVariant}
                placeholder="Breve descripción de tu perfil..."
              />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
}