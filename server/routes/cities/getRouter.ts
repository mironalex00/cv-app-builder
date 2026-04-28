import { Router } from 'express'
import citiesController from '../../controllers/geoLocation/citiesController.js';

/**
 * @openapi
 * tags:
 *   name: Cities
 *   description: API for retrieving cities globally.
 * components:
 *   schemas:
 *     Timezone:
 *       type: object
 *       properties:
 *         zoneName:
 *           type: string
 *           example: Europe/Madrid
 *         gmtOffset:
 *           type: integer
 *           example: 3600
 *
 *     City:
 *       type: object
 *       required: [id, name, timezone, state, searchTerms]
 *       properties:
 *         id:
 *           type: integer
 *           example: 3117735
 *         name:
 *           type: string
 *           example: Madrid
 *         latitude:
 *           type: number
 *           nullable: true
 *           example: 40.4165
 *         longitude:
 *           type: number
 *           nullable: true
 *           example: -3.70256
 *         timezone:
 *           type: string
 *           example: Europe/Madrid
 *         state:
 *           type: object
 *           properties:
 *             id:
 *               type: integer
 *               example: 5326
 *             name:
 *               type: string
 *               example: Community of Madrid
 *         searchTerms:
 *           type: array
 *           items:
 *             type: string
 *           example: [madrid, mad]
 */
const router = Router();

/**
 * @openapi
 * /cities/{city}:
 *   get:
 *     summary: Get a city by name or ID.
 *     description: Returns a single city based on the provided name or ID.
 *     tags: [Cities]
 *     parameters:
 *       - in: path
 *         name: city
 *         required: true
 *         description: The name or ID of the city to retrieve.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: City retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/City'
 *       400:
 *         description: Invalid city identifier.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: City not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error' 
 */
router.get('/:city', citiesController.getCityByParam);

/**
 * @openapi
 * /cities:
 *   get:
 *     summary: Get a list of all cities.
 *     description: Returns a paginated list of all cities.
 *     tags: [Cities]
 *     parameters:
 *       - in: query
 *         name: page
 *         required: false
 *         description: Page number for pagination.
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         required: false
 *         description: Number of items per page.
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: List of cities retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CityListResponse'
 */
router.get('/', citiesController.getCities);

/**
 * @openapi
 * /cities/count:
 *   get:
 *     summary: Get the total count of cities.
 *     description: Returns the total number of cities available.
 *     tags: [Cities]
 *     responses:
 *       200:
 *         description: City count retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 count:
 *                   type: integer
 *                   description: Total number of cities.
 */
router.get('/count', citiesController.getCityCount);

/**
 * @openapi
 * /cities/state/{state}:
 *   get:
 *     summary: Get cities by state.
 *     description: Returns a list of cities for a specific state.
 *     tags: [Cities]
 *     parameters:
 *       - in: path
 *         name: state
 *         required: true
 *         description: The name or ID of the state.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of cities retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/StateCitiesResponse'
 *       400:
 *         description: Invalid state identifier.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: State not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/state/:state', citiesController.getCitiesByState);

/**
 * @openapi
 * /cities/state/{state}/count:
 *   get:
 *     summary: Get the count of cities by state.
 *     description: Returns the number of cities for a specific state.
 *     tags: [Cities]
 *     parameters:
 *       - in: path
 *         name: state
 *         required: true
 *         description: The name or ID of the state.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: City count for the state retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/StateCityCountResponse'
 *       400:
 *         description: Invalid state identifier.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: State not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/state/:state/count', citiesController.getCityCountByState);

export default router;