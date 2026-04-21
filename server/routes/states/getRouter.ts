import { Router } from 'express'
import statesController from '../../controllers/statesController.js';

const router = Router();

/**
 * @openapi
 * tags:
 *   name: States
 *   description: API for retrieving administrative subdivisions (states, provinces, regions) of countries globally.
 */

/**
 * @openapi
 * /states/count:
 *   get:
 *     summary: Retrieve total number of states/provinces
 *     description: Returns the total count of administrative subdivisions stored in the geographic database.
 *     tags: [States]
 *     responses:
 *       200:
 *         description: Success count returned.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 count:
 *                   type: integer
 *                   example: 4120
 */
router.get('/count', statesController.getStateCount);
/**
 * @openapi
 * /states/type:
 *   get:
 *     summary: Retrieve state types for all states
 *     description: Returns a mapping of states to their administrative types (e.g., State, Territory).
 *     tags: [States]
 */
router.get('/type', statesController.getStateTypes);

/**
 * @openapi
 * /states/native:
 *   get:
 *     summary: Retrieve native names for all states
 *     description: Returns a mapping of states to their names in the native language of their respective country.
 *     tags: [States]
 */
router.get('/native', statesController.getStateNatives);

/**
 * @openapi
 * /states/type/{state}:
 *   get:
 *     summary: Retrieve administrative type for a specific state
 *     tags: [States]
 *     parameters:
 *       - in: path
 *         name: state
 *         required: true
 *         schema:
 *           type: string
 */
router.get('/type/:state', statesController.getStateTypeByParam);

/**
 * @openapi
 * /states/native/{state}:
 *   get:
 *     summary: Retrieve native name for a specific state
 *     tags: [States]
 *     parameters:
 *       - in: path
 *         name: state
 *         required: true
 *         schema:
 *           type: string
 */
router.get('/native/:state', statesController.getStateNativeByParam);

/**
 * @openapi
 * /states/{state}/country:
 *   get:
 *     summary: Retrieve country information for a specific state
 *     description: Returns the parent country data for a given state identifier.
 *     tags: [States]
 *     parameters:
 *       - in: path
 *         name: state
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/:state/country', statesController.getCountryByState);

/**
 * @openapi
 * /states/count/{country}:
 *   get:
 *     summary: Retrieve total number of states in a specific country
 *     description: Returns the count of administrative subdivisions within the specified country.
 *     tags: [States]
 *     parameters:
 *       - in: path
 *         name: country
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/count/:country', statesController.getStateCountByCountry);

/**
 * @openapi
 * /states/{country}:
 *   get:
 *     summary: Retrieve all states belonging to a specific country
 *     description: Returns a collection of states/provinces for the given country identifier.
 *     tags: [States]
 *     parameters:
 *       - in: path
 *         name: country
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/:country', statesController.getStatesByCountry);

/**
 * @openapi
 * /states/{state}:
 *   get:
 *     summary: Retrieve specific state data by identifier
 *     description: Returns full details for a single state record.
 *     tags: [States]
 *     parameters:
 *       - in: path
 *         name: state
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/:state', statesController.getStateByParam);

/**
 * @openapi
 * /states:
 *   get:
 *     summary: Get a complete list of all states
 *     description: Returns a full array of every administrative subdivision in the database.
 *     tags: [States]
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/', statesController.getStates);

export default router;