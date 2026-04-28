import { Router } from 'express';

import localOnly from '../../middlewares/localhostOnly.js'
import domainsController from '../../controllers/geoLocation/domainsController.js';

/**
 * @openapi
 * tags:
 *   name: Domains
 *   description: API for managing and validating domain-related data, specifically focused on email address validation against known MX records and formatting standards.
 */
const router = Router();

/**
 * @openapi
 * /domains/count:
 *   get:
 *     summary: Get the number of domains in the blocklist
 *     description: Returns the total count of domains currently stored in the blocklist.
 *     tags: [Domains]
 *     responses:
 *       200:
 *         description: Domain count returned.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *             properties:
 *               count:
 *                 type: number
 *                 format: integer
 *                 description: The number of domains in the blocklist.
 *                 example: 1
 */
router.get('/count', domainsController.blocklistSize)

/**
 * @openapi
 * /domains/status:
 *   get:
 *     summary: Get the status of the domain service
 *     description: Returns the status of the domain service, including whether it is loaded, the last time it was loaded, and any error messages.
 *     tags: [Domains]
 *     responses:
 *       200:
 *         description: Domain service status returned.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *             example: {
 *               initialized: true,
 *               lastUpdated: 1678886400,
 *               cache: { }
 *             }
 *             properties:
 *               initialized:
 *                 type: boolean
 *                 description: Whether the domain service is initialized.
 *                 example: true
 *               lastUpdated:
 *                 type: number
 *                 format: integer
 *                 description: The time when the domain service was last updated.
 *                 example: 1678886400
 *               cache:
 *                 type: object
 *                 description: The cache statistics.
 */
router.get('/status', localOnly, domainsController.domainServiceStatus)

export default router;