import cors from 'cors'

import { Router, json } from 'express';

import countriesGetRouter from './countries/getRouter.js';
import statesGetRouter from './states/getRouter.js';
import domainsPostRouter from './domains/postRouter.js';
import { sendNotFound } from '../common.js';

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
// Domains
// ============================================================================
router.use('/domains', domainsPostRouter);

// ============================================================================
// Rest of the routes
// ============================================================================
router.use((_req, res) => {
    sendNotFound(res, "Route not found");
});

export default router;