import { Router } from 'express'
import countriesController from '../../controllers/countriesController.js';

const router = Router();

/**
 * @openapi
 * tags:
 *   name: Countries
 *   description: API for retrieving global country data including capitals, currencies, populations, and timezones.
 */

/**
 * @openapi
 * /countries/count:
 *   get:
 *     summary: Retrieve total number of countries
 *     description: Returns the absolute count of country records currently indexed in the systems master data store.
 *     tags: [Countries]
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
 *                   description: Total number of countries.
 *                   example: 250
 */
router.get('/count', countriesController.getCountriesCount);

/**
 * @openapi
 * /countries/population:
 *   get:
 *     summary: Retrieve populations of all countries
 *     description: Returns a mapping of all countries to their most recent recorded population figures.
 *     tags: [Countries]
 *     responses:
 *       200:
 *         description: List of country populations returned.
 */
router.get('/population', countriesController.getCountryPopulations);

/**
 * @openapi
 * /countries/population/{country}:
 *   get:
 *     summary: Retrieve population for a specific country
 *     description: Returns the population for a given country identifier.
 *     tags: [Countries]
 *     parameters:
 *       - in: path
 *         name: country
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Population value returned.
 */
router.get('/population/:country', countriesController.getPopulationByCountry);

/**
 * @openapi
 * /countries/capital:
 *   get:
 *     summary: Retrieve capital cities of all countries
 *     description: Returns a mapping of countries to their respective capital cities.
 *     tags: [Countries]
 *     responses:
 *       200:
 *         description: List of country capitals returned.
 */
router.get('/capital', countriesController.getCountryCapitals);

/**
 * @openapi
 * /countries/capital/{country}:
 *   get:
 *     summary: Retrieve capital for a specific country
 *     description: Returns the capital city for a given country identifier.
 *     tags: [Countries]
 *     parameters:
 *       - in: path
 *         name: country
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Capital city returned.
 */
router.get('/capital/:country', countriesController.getCapitalByCountry);

/**
 * @openapi
 * /countries/currency:
 *   get:
 *     summary: Retrieve currencies of all countries
 *     description: Returns a mapping of countries to their primary official currencies.
 *     tags: [Countries]
 *     responses:
 *       200:
 *         description: List of country currencies returned.
 */
router.get('/currency', countriesController.getCountryCurrencies);

/**
 * @openapi
 * /countries/currency/{country}:
 *   get:
 *     summary: Retrieve currency for a specific country
 *     description: Returns the primary currency for a given country identifier.
 *     tags: [Countries]
 *     parameters:
 *       - in: path
 *         name: country
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Currency information returned.
 */
router.get('/currency/:country', countriesController.getCurrencyByCountry);

/**
 * @openapi
 * /countries/region:
 *   get:
 *     summary: Retrieve regions of all countries
 *     description: Returns a breakdown of countries categorized by their major world regions (e.g., Europe, Africa).
 *     tags: [Countries]
 *     responses:
 *       200:
 *         description: List of country regions returned.
 */
router.get('/region', countriesController.getCountryRegions);

/**
 * @openapi
 * /countries/region/{country}:
 *   get:
 *     summary: Retrieve region for a specific country
 *     description: Returns the world region belonging to a specific country identifier.
 *     tags: [Countries]
 *     parameters:
 *       - in: path
 *         name: country
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Region name returned.
 */
router.get('/region/:country', countriesController.getRegionByCountry);

/**
 * @openapi
 * /countries/subregion:
 *   get:
 *     summary: Retrieve subregions of all countries
 *     description: Returns a breakdown of countries categorized by their specific world subregions (e.g., Southern Europe).
 *     tags: [Countries]
 *     responses:
 *       200:
 *         description: List of country subregions returned.
 */
router.get('/subregion', countriesController.getCountrySubregions);

/**
 * @openapi
 * /countries/subregion/{country}:
 *   get:
 *     summary: Retrieve subregion for a specific country
 *     description: Returns the world subregion belonging to a specific country identifier.
 *     tags: [Countries]
 *     parameters:
 *       - in: path
 *         name: country
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Subregion name returned.
 */
router.get('/subregion/:country', countriesController.getSubregionByCountry);

/**
 * @openapi
 * /countries/phonecode:
 *   get:
 *     summary: Retrieve international phone codes for all countries
 *     description: Returns a mapping of countries to their official international calling codes.
 *     tags: [Countries]
 *     responses:
 *       200:
 *         description: List of country phone codes returned.
 */
router.get('/phonecode', countriesController.getCountryPhoneCodes);

/**
 * @openapi
 * /countries/phonecode/{country}:
 *   get:
 *     summary: Retrieve phone code for a specific country
 *     description: Returns the international calling code for a specific country identifier.
 *     tags: [Countries]
 *     parameters:
 *       - in: path
 *         name: country
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Phone code returned.
 */
router.get('/phonecode/:country', countriesController.getPhoneCodeByCountry);

/**
 * @openapi
 * /countries/timezones:
 *   get:
 *     summary: Retrieve timezones for all countries
 *     description: Returns a mapping of countries to their associated timezones.
 *     tags: [Countries]
 *     responses:
 *       200:
 *         description: List of country timezones returned.
 */
router.get('/timezones', countriesController.getCountryTimezones);

/**
 * @openapi
 * /countries/timezones/{country}:
 *   get:
 *     summary: Retrieve timezones for a specific country
 *     description: Returns a collection of timezones utilized by a specific country identifier.
 *     tags: [Countries]
 *     parameters:
 *       - in: path
 *         name: country
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Timezones returned.
 */
router.get('/timezones/:country', countriesController.getTimezonesByCountry);

/**
 * @openapi
 * /countries:
 *   get:
 *     summary: Get a complete list of all countries
 *     description: Returns a full collection of all countries in the system. Each entry includes geographic coordinates, capital city, currency, and regional metadata.
 *     tags: [Countries]
 *     responses:
 *       200:
 *         description: A complete array of Country objects.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Country'
 */
router.get('/', countriesController.getCountries);

/**
 * @openapi
 * /countries/{country}:
 *   get:
 *     summary: Retrieve single country by identifier (ID, Name, or ISO Code)
 *     description: Highly flexible endpoint that resolves a country record by its numeric ID, standard common name, or ISO code (Alpha-2/Alpha-3).
 *     tags: [Countries]
 *     parameters:
 *       - in: path
 *         name: country
 *         required: true
 *         schema:
 *           type: string
 *         description: The numeric ID, Full Name, or ISO code of the country.
 *     responses:
 *       200:
 *         description: Successfully retrieved country data.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Country'
 *       400:
 *         description: Invalid identifier provided.
 *       404:
 *         description: Country not found or unrecognized identifier.
 */
router.get('/:country', countriesController.getCountryByParam);

export default router;