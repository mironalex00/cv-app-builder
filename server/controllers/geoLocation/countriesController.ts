import type { Request, Response } from 'express';

import { sendBadRequest, sendNotFound, sendSuccess } from '../../shared/http/response.js';

import { createListHandler, createSingleHandler } from '../utils/controllerFactory.js'
import { getParam } from '../utils/searchHelpers.js';

import { toCountryDTO, toCountryDTOArray } from '../../dto/location.dto.js';
import { getCountriesList, countryCount, getCountry } from '../../services/geoLocationService.js';

async function getCountries(_req: Request, res: Response): Promise<void> {
    const countries = getCountriesList();
    const dtos = toCountryDTOArray(countries);
    sendSuccess(res, dtos);
}

async function getCountryByParam(req: Request, res: Response): Promise<void> {
    const identifier = getParam(req, 'country');
    if (!identifier) {
        return sendBadRequest(res, 'Invalid country identifier');
    }
    const country = getCountry(identifier, { exact: false });
    if (!country) {
        return sendNotFound(res, 'Country not found, cant retrieve country');
    }
    sendSuccess(res, toCountryDTO(country));
};

async function getCountriesCount(_req: Request, res: Response): Promise<void> {
    sendSuccess(res, { count: countryCount() });
};

const getCountryPopulations  = createListHandler(getCountriesList, 'population');
const getCountryCapitals     = createListHandler(getCountriesList, 'capital');
const getCountryCurrencies   = createListHandler(getCountriesList, 'currency');
const getCountryRegions      = createListHandler(getCountriesList, 'region');
const getCountrySubregions   = createListHandler(getCountriesList, 'subregion');
const getCountryPhoneCodes   = createListHandler(getCountriesList, 'phoneCode');

const getPopulationByCountry = createSingleHandler(getCountry, 'population',  ['country', 'id', 'searchTerms']);
const getCapitalByCountry    = createSingleHandler(getCountry, 'capital',     ['country', 'id', 'searchTerms']);
const getCurrencyByCountry   = createSingleHandler(getCountry, 'currency',    ['country', 'id', 'searchTerms']);
const getRegionByCountry     = createSingleHandler(getCountry, 'region',      ['country', 'id', 'searchTerms']);
const getSubregionByCountry  = createSingleHandler(getCountry, 'subregion',   ['country', 'id', 'searchTerms']);
const getPhoneCodeByCountry  = createSingleHandler(getCountry, 'phoneCode',   ['country', 'id', 'searchTerms']);

const getCountryTimezones    = createListHandler(getCountriesList, toCountryDTOArray);
const getTimezonesByCountry  = createSingleHandler(getCountry, toCountryDTO, ['country', 'id', 'searchTerms']);

export default {
    getCountries,
    getCountryByParam,
    getCountriesCount,
    getPopulationByCountry,
    getCountryPopulations,
    getCapitalByCountry,
    getCountryCapitals,
    getCurrencyByCountry,
    getCountryCurrencies,
    getRegionByCountry,
    getCountryRegions,
    getSubregionByCountry,
    getCountrySubregions,
    getPhoneCodeByCountry,
    getCountryPhoneCodes,
    getTimezonesByCountry,
    getCountryTimezones
} as const;