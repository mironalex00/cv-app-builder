import { Router } from 'express'

import countriesController from '../../controllers/geoLocation/countriesController.js';

/**
 * @openapi
 * tags:
 *   name: Countries
 *   description: API for retrieving global country data including capitals, currencies, populations, and timezones.
 * components:
 *   schemas:
 *     Timezone:
 *       type: object
 *       required: [zoneName, gmtOffset, gmtOffsetName, abbreviation, tzName]
 *       properties:
 *         zoneName:
 *           type: string
 *           example: Europe/Madrid
 *         gmtOffset:
 *           type: integer
 *           example: 3600
 *         gmtOffsetName:
 *           type: string
 *           example: UTC+01:00
 *         abbreviation:
 *           type: string
 *           example: CET
 *         tzName:
 *           type: string
 *           example: Central European Time
 *
 *     Country:
 *       type: object
 *       required: [id, name, phoneCode, searchTerms, timezones]
 *       properties:
 *         id:
 *           type: integer
 *           example: 207
 *         name:
 *           type: string
 *           example: Spain
 *         phoneCode:
 *           type: integer
 *           example: 34
 *         capital:
 *           type: string
 *           nullable: true
 *           example: Madrid
 *         currency:
 *           type: string
 *           nullable: true
 *           example: EUR
 *         region:
 *           type: string
 *           nullable: true
 *           example: Europe
 *         subregion:
 *           type: string
 *           nullable: true
 *           example: Southern Europe
 *         population:
 *           type: integer
 *           nullable: true
 *           example: 46754778
 *         latitude:
 *           type: number
 *           nullable: true
 *           example: 40.0
 *         longitude:
 *           type: number
 *           nullable: true
 *           example: -4.0
 *         timezones:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Timezone'
 *         searchTerms:
 *           type: array
 *           items:
 *             type: string
 *           example: [spain, españa, es, esp]
 *
 *     CountryFieldProjection:
 *       type: object
 *       description: Minimal projection — country name paired with a single requested field.
 *       required: [name]
 *       properties:
 *         name:
 *           type: string
 *           example: Spain
 *
 *     HttpEnvelope:
 *       type: object
 *       required: [statusCode, message, data]
 *       properties:
 *         statusCode:
 *           type: integer
 *           example: 200
 *         message:
 *           type: string
 *           example: ok
 *         data:
 *           description: Response payload — shape depends on the endpoint.
 *
 *   parameters:
 *     CountryParam:
 *       in: path
 *       name: country
 *       required: true
 *       schema:
 *         type: string
 *       description: Country identifier — name, search term, or numeric ID.
 *       example: spain
 *
 *   responses:
 *     BadRequest:
 *       description: Invalid or missing identifier.
 *       content:
 *         application/json:
 *           schema:
 *             allOf:
 *               - $ref: '#/components/schemas/HttpEnvelope'
 *               - type: object
 *                 properties:
 *                   data:
 *                     type: object
 *                     properties:
 *                       error:
 *                         type: string
 *                         example: Invalid country
 *     NotFound:
 *       description: Country not found.
 *       content:
 *         application/json:
 *           schema:
 *             allOf:
 *               - $ref: '#/components/schemas/HttpEnvelope'
 *               - type: object
 *                 properties:
 *                   data:
 *                     type: object
 *                     properties:
 *                       error:
 *                         type: string
 *                         example: country not found
*/
const router = Router();

/**
 * @openapi
 * /countries/count:
 *   get:
 *     summary: Total number of countries
 *     tags: [Countries]
 *     responses:
 *       200:
 *         description: Count returned.
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/HttpEnvelope'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         count:
 *                           type: integer
 *                           example: 250
*/
router.get('/count', countriesController.getCountriesCount);

/**
 * @openapi
 * /countries/population:
 *   get:
 *     summary: Population of all countries
 *     tags: [Countries]
 *     responses:
 *       200:
 *         description: List returned.
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/HttpEnvelope'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         allOf:
 *                           - $ref: '#/components/schemas/CountryFieldProjection'
 *                           - type: object
 *                             properties:
 *                               population:
 *                                 type: integer
 *                                 nullable: true
 *                                 example: 46754778
 */
router.get('/population', countriesController.getCountryPopulations);

/**
 * @openapi
 * /countries/population/{country}:
 *   get:
 *     summary: Population for a specific country
 *     tags: [Countries]
 *     parameters:
 *       - $ref: '#/components/parameters/CountryParam'
 *     responses:
 *       200:
 *         description: Population returned.
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/HttpEnvelope'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       allOf:
 *                         - $ref: '#/components/schemas/CountryFieldProjection'
 *                         - type: object
 *                           properties:
 *                             population:
 *                               type: integer
 *                               nullable: true
 *                               example: 46754778
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         $ref: '#/components/responses/NotFound'
*/
router.get('/population/:country', countriesController.getPopulationByCountry);

/**
 * @openapi
 * /countries/capital:
 *   get:
 *     summary: Capital cities of all countries
 *     tags: [Countries]
 *     responses:
 *       200:
 *         description: List returned.
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/HttpEnvelope'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         allOf:
 *                           - $ref: '#/components/schemas/CountryFieldProjection'
 *                           - type: object
 *                             properties:
 *                               capital:
 *                                 type: string
 *                                 nullable: true
 *                                 example: Madrid
*/
router.get('/capital', countriesController.getCountryCapitals);

/**
 * @openapi
 * /countries/capital/{country}:
 *   get:
 *     summary: Capital for a specific country
 *     tags: [Countries]
 *     parameters:
 *       - $ref: '#/components/parameters/CountryParam'
 *     responses:
 *       200:
 *         description: Capital returned.
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/HttpEnvelope'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       allOf:
 *                         - $ref: '#/components/schemas/CountryFieldProjection'
 *                         - type: object
 *                           properties:
 *                             capital:
 *                               type: string
 *                               nullable: true
 *                               example: Madrid
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         $ref: '#/components/responses/NotFound'
*/
router.get('/capital/:country', countriesController.getCapitalByCountry);

/**
 * @openapi
 * /countries/currency:
 *   get:
 *     summary: Currencies of all countries
 *     tags: [Countries]
 *     responses:
 *       200:
 *         description: List returned.
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/HttpEnvelope'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         allOf:
 *                           - $ref: '#/components/schemas/CountryFieldProjection'
 *                           - type: object
 *                             properties:
 *                               currency:
 *                                 type: string
 *                                 nullable: true
 *                                 example: EUR
*/
router.get('/currency', countriesController.getCountryCurrencies);

/**
 * @openapi
 * /countries/currency/{country}:
 *   get:
 *     summary: Currency for a specific country
 *     tags: [Countries]
 *     parameters:
 *       - $ref: '#/components/parameters/CountryParam'
 *     responses:
 *       200:
 *         description: Currency returned.
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/HttpEnvelope'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       allOf:
 *                         - $ref: '#/components/schemas/CountryFieldProjection'
 *                         - type: object
 *                           properties:
 *                             currency:
 *                               type: string
 *                               nullable: true
 *                               example: EUR
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         $ref: '#/components/responses/NotFound'
*/
router.get('/currency/:country', countriesController.getCurrencyByCountry);

/**
 * @openapi
 * /countries/region:
 *   get:
 *     summary: Regions of all countries
 *     tags: [Countries]
 *     responses:
 *       200:
 *         description: List returned.
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/HttpEnvelope'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         allOf:
 *                           - $ref: '#/components/schemas/CountryFieldProjection'
 *                           - type: object
 *                             properties:
 *                               region:
 *                                 type: string
 *                                 nullable: true
 *                                 example: Europe
*/
router.get('/region', countriesController.getCountryRegions);

/**
 * @openapi
 * /countries/region/{country}:
 *   get:
 *     summary: Region for a specific country
 *     tags: [Countries]
 *     parameters:
 *       - $ref: '#/components/parameters/CountryParam'
 *     responses:
 *       200:
 *         description: Region returned.
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/HttpEnvelope'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       allOf:
 *                         - $ref: '#/components/schemas/CountryFieldProjection'
 *                         - type: object
 *                           properties:
 *                             region:
 *                               type: string
 *                               nullable: true
 *                               example: Europe
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         $ref: '#/components/responses/NotFound'
*/
router.get('/region/:country', countriesController.getRegionByCountry);

/**
 * @openapi
 * /countries/subregion:
 *   get:
 *     summary: Subregions of all countries
 *     tags: [Countries]
 *     responses:
 *       200:
 *         description: List returned.
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/HttpEnvelope'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         allOf:
 *                           - $ref: '#/components/schemas/CountryFieldProjection'
 *                           - type: object
 *                             properties:
 *                               subregion:
 *                                 type: string
 *                                 nullable: true
 *                                 example: Southern Europe
*/
router.get('/subregion', countriesController.getCountrySubregions);

/**
 * @openapi
 * /countries/subregion/{country}:
 *   get:
 *     summary: Subregion for a specific country
 *     tags: [Countries]
 *     parameters:
 *       - $ref: '#/components/parameters/CountryParam'
 *     responses:
 *       200:
 *         description: Subregion returned.
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/HttpEnvelope'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       allOf:
 *                         - $ref: '#/components/schemas/CountryFieldProjection'
 *                         - type: object
 *                           properties:
 *                             subregion:
 *                               type: string
 *                               nullable: true
 *                               example: Southern Europe
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         $ref: '#/components/responses/NotFound'
*/
router.get('/subregion/:country', countriesController.getSubregionByCountry);

/**
 * @openapi
 * /countries/phonecode:
 *   get:
 *     summary: International phone codes for all countries
 *     tags: [Countries]
 *     responses:
 *       200:
 *         description: List returned.
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/HttpEnvelope'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         allOf:
 *                           - $ref: '#/components/schemas/CountryFieldProjection'
 *                           - type: object
 *                             properties:
 *                               phoneCode:
 *                                 type: integer
 *                                 example: 34
*/
router.get('/phonecode', countriesController.getCountryPhoneCodes);

/**
 * @openapi
 * /countries/phonecode/{country}:
 *   get:
 *     summary: Phone code for a specific country
 *     tags: [Countries]
 *     parameters:
 *       - $ref: '#/components/parameters/CountryParam'
 *     responses:
 *       200:
 *         description: Phone code returned.
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/HttpEnvelope'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       allOf:
 *                         - $ref: '#/components/schemas/CountryFieldProjection'
 *                         - type: object
 *                           properties:
 *                             phoneCode:
 *                               type: integer
 *                               example: 34
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         $ref: '#/components/responses/NotFound'
*/
router.get('/phonecode/:country', countriesController.getPhoneCodeByCountry);

/**
 * @openapi
 * /countries/timezones:
 *   get:
 *     summary: Timezones for all countries
 *     tags: [Countries]
 *     responses:
 *       200:
 *         description: List returned.
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/HttpEnvelope'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Country'
*/
router.get('/timezones', countriesController.getCountryTimezones);

/**
 * @openapi
 * /countries/timezones/{country}:
 *   get:
 *     summary: Timezones for a specific country
 *     tags: [Countries]
 *     parameters:
 *       - $ref: '#/components/parameters/CountryParam'
 *     responses:
 *       200:
 *         description: Timezones returned.
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/HttpEnvelope'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Country'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         $ref: '#/components/responses/NotFound'
*/
router.get('/timezones/:country', countriesController.getTimezonesByCountry);

/**
 * @openapi
 * /countries/{country}:
 *   get:
 *     summary: Single country by identifier
 *     description: Resolves a country by numeric ID, canonical name, or any configured search term (e.g. "españa" → Spain).
 *     tags: [Countries]
 *     parameters:
 *       - $ref: '#/components/parameters/CountryParam'
 *     responses:
 *       200:
 *         description: Country returned.
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/HttpEnvelope'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Country'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.get('/:country', countriesController.getCountryByParam);

/**
 * @openapi
 * /countries:
 *   get:
 *     summary: Complete list of all countries
 *     description: Returns all countries with full metadata — coordinates, capital, currency, timezones, and regional classification.
 *     tags: [Countries]
 *     responses:
 *       200:
 *         description: Full country array returned.
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/HttpEnvelope'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Country'
*/
router.get('/', countriesController.getCountries);

export default router;