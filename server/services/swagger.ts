import swaggerJsdoc from 'swagger-jsdoc';

/**
 * Swagger JSDoc configuration options.
 */
const options: swaggerJsdoc.Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'CV Builder - Backend API',
            version: '1.0.0',
            description: 'Comprehensive API documentation for the project, covering all the endpoints.',
            contact: {
                name: process.env.VITE_CONTACT_NAME,
                email: process.env.VITE_CONTACT_MAIL,
                url: process.env.VITE_CONTACT_URL,
            },
            license: {
                name: 'MIT',
                url: 'https://opensource.org/licenses/MIT',
            }
        },
        servers: [
            {
                url: 'https://localhost/api',
                description: 'Local Development Server',
            },
        ],
        components: {
            schemas: {
                Error: {
                    type: 'object',
                    properties: {
                        error: {
                            type: 'string',
                            example: 'Resource not found',
                        },
                    },
                },
                Country: {
                    type: 'object',
                    description: 'Comprehensive geographic and economic data for a country.',
                    properties: {
                        id: { type: 'integer', example: 1 },
                        name: { type: 'string', example: 'Spain' },
                        phoneCode: { type: 'string', example: '+34' },
                        capital: { type: 'string', example: 'Madrid' },
                        currency: { type: 'string', example: 'EUR' },
                        region: { type: 'string', example: 'Europe' },
                        subregion: { type: 'string', example: 'Southern Europe' },
                        population: { type: 'integer', example: 47000000 },
                        latitude: { type: 'number', format: 'float', example: 40.4637 },
                        longitude: { type: 'number', format: 'float', example: -3.7492 },
                    },
                },
                State: {
                    type: 'object',
                    description: 'Administrative subdivision of a country.',
                    properties: {
                        id: { type: 'integer', example: 123 },
                        name: { type: 'string', example: 'California' },
                        countryCode: { type: 'string', example: 'US' },
                        stateCode: { type: 'string', example: 'CA' },
                    },
                },
            },
        },
    },
    // Path to the API docs
    apis: [
        './server/routes/**/*.ts',
        './server/routes/**/*.js',
        './server/controllers/**/*.ts',
    ],
};

//  Export the swagger spec
export default swaggerJsdoc(options);