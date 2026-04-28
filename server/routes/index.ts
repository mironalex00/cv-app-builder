import cors from 'cors'

import { Router, json } from 'express';

//  Countries routes
import countriesGetRouter from './countries/getRouter.js';

//  States routes
import statesGetRouter from './states/getRouter.js';

//  Cities routes
import citiesGetRouter from './cities/getRouter.js';

//  Domains routes
import domainsGetRouter from './domains/getRoutes.js';
import domainsPostRouter from './domains/postRouter.js';

//  Others
import { sendNotFound } from '../shared/http/response.js';

const router = Router();

// ============================================================================
// Middleware
// ============================================================================
const ALLOWED_ORIGINS: string[] = [
    'https://localhost',
    'https://localhost:443',
];

router.use(cors({
    origin: ALLOWED_ORIGINS,
    methods: ['GET', 'POST'],
    credentials: true,
    maxAge: 86400,
}));
router.use(json({ limit: '10kb' }))

// ============================================================================
// Countries
// ============================================================================
router.use('/countries', countriesGetRouter);

// ============================================================================
// States
// ============================================================================
router.use('/states', statesGetRouter);

// ============================================================================
// Cities
// ============================================================================
router.use('/cities', citiesGetRouter);

// ============================================================================
// Domains
// ============================================================================
router.use('/domains', domainsGetRouter, domainsPostRouter);

// ============================================================================
// Rest of the routes
// ============================================================================
router.use((_req, res) => sendNotFound(res, "Route not found"));

export default router;