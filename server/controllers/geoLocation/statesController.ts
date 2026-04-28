import type { Request, Response } from 'express';

import { sendBadRequest, sendNotFound, sendSuccess } from '../../shared/http/response.js';

import { createListHandler, createSingleHandler } from '../utils/controllerFactory.js'
import { getParamFirst } from '../utils/searchHelpers.js';

import { toStateDTO, toStateDTOArray } from '../../dto/location.dto.js';
import { getStatesList, stateCount, getState, getCountry } from '../../services/geoLocationService.js';

// ============================================================================
// Private handlers
// ============================================================================
async function getStates(_req: Request, res: Response): Promise<void> {
    const states = getStatesList();
    const dtos = toStateDTOArray(states);
    sendSuccess(res, dtos);
}

async function getStateByParam(req: Request, res: Response): Promise<void> {
    const identifier = getParamFirst(req, ['state', 'id']);
    if (!identifier) {
        return sendBadRequest(res, 'Invalid state identifier');
    }
    const state = getState(identifier, { exact: true }); // TODO: It retrieves countries not states :(
    if (!state) {
        return sendNotFound(res, 'State not found');
    }
    sendSuccess(res, toStateDTO(state));
}

async function getStateCount(_req: Request, res: Response): Promise<void> {
    sendSuccess(res, { count: stateCount() });
}

async function getStatesByCountry(req: Request, res: Response): Promise<void> {
    const identifier = getParamFirst(req, ['country', 'id']);
    if (!identifier) {
        return sendBadRequest(res, 'Invalid country identifier');
    }
    const country = getCountry(identifier, { exact: true });
    if (!country) {
        return sendNotFound(res, 'Country not found, cant retrieve states');
    }
    const dtos = toStateDTOArray(country.states);
    sendSuccess(res, {
        country: { id: country.id, name: country.name },
        states: dtos,
    });
}

async function getStateCountByCountry(req: Request, res: Response): Promise<void> {
    const identifier = getParamFirst(req, ['country', 'id']);
    if (!identifier) {
        return sendBadRequest(res, 'Invalid country identifier');
    }
    const country = getCountry(identifier, { exact: true });
    if (!country) {
        return sendNotFound(res, 'Country not found, cant retrieve state count');
    }
    sendSuccess(res, {
        country: { id: country.id, name: country.name },
        count: country.states.length,
    });
}

async function getCountryByState(req: Request, res: Response): Promise<void> {
    const identifier = getParamFirst(req, ['state', 'id']);
    if (!identifier) {
        return sendBadRequest(res, 'Invalid state identifier');
    }
    const state = getState(identifier, { exact: true });
    if (!state) {
        return sendNotFound(res, 'State not found');
    }
    sendSuccess(res, {
        state: { id: state.id, name: state.name },
        country: state.country,
    });
}

// ============================================================================
// Field‑Specific Endpoints (Factory‑Generated)
// ============================================================================
const getStateTypes = createListHandler(getStatesList, 'type');
const getStateTypeByParam = createSingleHandler(getState, 'type', ['state', 'id', 'searchTerms']);
const getStateNatives = createListHandler(getStatesList, 'native');
const getStateNativeByParam = createSingleHandler(getState, 'native', ['state', 'id', 'searchTerms']);

export default {
    getStateByParam,
    getStates,
    getStatesByCountry,
    getStateCount,
    getStateCountByCountry,
    getCountryByState,
    getStateTypes,
    getStateTypeByParam,
    getStateNatives,
    getStateNativeByParam,
} as const;