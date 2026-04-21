import type { Request, Response } from 'express';

import { getParam, sendSuccess, sendBadRequest, sendNotFound } from '../common.js';
import { createListHandler, createSingleHandler } from './utils/controllerFactory.js'

import { getCountriesList, countryCount, getCountry } from '../services/countryService.js';

import { toCountryDTO, toCountryDTOArray } from '../dto/location.dto.js';

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

const getCountryPopulations = createListHandler(getCountriesList, 'population');
const getPopulationByCountry = createSingleHandler(getCountry, 'population', 'country');
const getCountryCapitals = createListHandler(getCountriesList, 'capital');
const getCapitalByCountry = createSingleHandler(getCountry, 'capital', 'country');
const getCountryCurrencies = createListHandler(getCountriesList, 'currency');
const getCurrencyByCountry = createSingleHandler(getCountry, 'currency', 'country');
const getCountryRegions = createListHandler(getCountriesList, 'region');
const getRegionByCountry = createSingleHandler(getCountry, 'region', 'country');
const getCountrySubregions = createListHandler(getCountriesList, 'subregion');
const getSubregionByCountry = createSingleHandler(getCountry, 'subregion', 'country');
const getCountryPhoneCodes = createListHandler(getCountriesList, 'phoneCode');
const getPhoneCodeByCountry = createSingleHandler(getCountry, 'phoneCode', 'country');
const getCountryTimezones = createListHandler(getCountriesList, 'timezones');
const getTimezonesByCountry = createSingleHandler(getCountry, 'timezones', 'country');

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