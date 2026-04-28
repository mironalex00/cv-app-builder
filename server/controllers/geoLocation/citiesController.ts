import type { Request, Response } from 'express';

import { sendBadRequest, sendNotFound, sendSuccess } from '../../shared/http/response.js';

import { createListHandler, createSingleHandler } from '../utils/controllerFactory.js'
import { getParamFirst } from '../utils/searchHelpers.js';

import { toCityDTO, toCityDTOArray } from '../../dto/location.dto.js';
import { getCitiesList, cityCount, getCity } from '../../services/geoLocationService.js';

// ============================================================================
// Private handlers
// ============================================================================
async function getCities(_req: Request, res: Response): Promise<void> {
    const cities = getCitiesList();
    const dtos = toCityDTOArray(cities);
    sendSuccess(res, dtos);
}

async function getCityByParam(req: Request, res: Response): Promise<void> {
    const identifier = getParamFirst(req, ['city', 'id']);
    if (!identifier) {
        return sendBadRequest(res, 'Invalid city identifier');
    }
    const city = getCity(identifier, { exact: true }); // TODO: It retrieves states not cities :(
    if (!city) {
        return sendNotFound(res, 'City not found');
    }
    sendSuccess(res, toCityDTO(city));
}

async function getCityCount(_req: Request, res: Response): Promise<void> {
    sendSuccess(res, { count: cityCount() });
}

const getCitiesByState = createListHandler(getCitiesList, 'name');
const getCityCountByState = createSingleHandler(getCity, 'name', ['city', 'id']);

export default {
    getCities,
    getCityByParam,
    getCityCount,
    getCitiesByState,
    getCityCountByState,
} as const;