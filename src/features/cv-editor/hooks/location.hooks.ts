import { useState, useEffect, useCallback } from 'react';

import { fetchCountries, fetchStates } from '../../../shared/services/locationService';
import { getJobTitleSuggestions } from '../../../shared/services/jobTitlesService';

import type { CountryData, StateData } from '../../../shared/services/locationService';
import type { JobTitleSuggestion } from '../../../shared/services/jobTitlesService';

// -----------------------------------------------------------------------------
// Custom hooks
// -----------------------------------------------------------------------------
export const useCountries = () => {
    const [countries, setCountries] = useState<CountryData[]>([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const load = async () => {
            try {
                const data = await fetchCountries();
                setCountries(data);
            } catch {
                setCountries([]);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);
    return { countries, loading };
};
export const useStates = (countryId: number | null) => {
    const [states, setStates] = useState<StateData[]>([]);
    const [loading, setLoading] = useState(false);
    useEffect(() => {
        if (!countryId) {
            setStates([]);
            return;
        }
        let cancelled = false;
        const load = async () => {
            setLoading(true);
            try {
                const data = await fetchStates(countryId);
                if (!cancelled) setStates(data);
            } catch {
                if (!cancelled) setStates([]);
            } finally {
                if (!cancelled) setLoading(false);
            }
        };
        load();
        return () => {
            cancelled = true;
        };
    }, [countryId]);
    return { states, loading };
};
export const useJobTitleSuggestions = () => {
    const [options, setOptions] = useState<JobTitleSuggestion[]>([]);
    const [loading, setLoading] = useState(false);
    const handleInputChange = useCallback(async (_: React.SyntheticEvent, value: string) => {
        if (value.length < 2) {
            setOptions([]);
            return;
        }
        setLoading(true);
        try {
            const suggestions = await getJobTitleSuggestions(value);
            setOptions(suggestions);
        } catch {
            setOptions([]);
        } finally {
            setLoading(false);
        }
    }, []);
    return { options, loading, handleInputChange };
};