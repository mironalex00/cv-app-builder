import { Router } from 'express'
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
 * /domains/email:
 *   post:
 *     summary: Validate an email address format and domain
 *     description: Perfroms a comprehensive validation check on a provided email address. This includes RFC compliance checking and domain existence verification.
 *     tags: [Domains]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: The full email address to be validated.
 *                 example: contact@example.com
 *     responses:
 *       200:
 *         description: Email validation result returned.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 isValid:
 *                   type: boolean
 *                   description: Indicates if the email passed all internal validation checks.
 *                 reason:
 *                   type: string
 *                   description: Descriptive reason for validation failure (if applicable).
 *       400:
 *         description: Malformed request payload or missing email field.
 */
router.post('/email', domainsController.validateEmail)

export default router;