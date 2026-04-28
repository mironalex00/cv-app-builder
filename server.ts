import 'dotenv/config';

import express from 'express';
import { getCertificate } from '@vitejs/plugin-basic-ssl';

import apiRouter from './server/routes/index.js';
import createViteSSRSetup from './server/setupViteSSR.ts';
import ServerBuilder from './server/utils/serverBuilder.ts';

import { initDomainService } from './server/services/domainService.js';
import { registerDomainUpdateJob, unregisterDomainUpdateJob } from './server/jobs/domainJobs.js';

import { initCountryService } from './server/services/geoLocationService.js';
import { registerCountryUpdateJob, unregisterCountryUpdateJob } from './server/jobs/countryJobs.js';

import { CronScheduler } from './server/utils/cronBuilder.js';

async function shutdown(signal: string): Promise<never> {
  console.info(`Received ${signal}. Shutting down gracefully...`);
  unregisterDomainUpdateJob();
  unregisterCountryUpdateJob();
  CronScheduler.getInstance().destroy();
  process.exit(0);
}

async function bootstrap(): Promise<void> {
  const app = express();
  const isProduction = process.env.IS_PRODUCTION === 'true';
  const cert = await getCertificate('node_modules/.vite/basic-ssl');

  ServerBuilder
    .create(app)
    .https({ key: cert, cert })
    .setConfig({ isProduction, port: 443 })
    .beforeStart(createViteSSRSetup({
      isProduction,
      baseRoute: '/',
      app,
    }))
    .addTask(initDomainService)
    .addTask(initCountryService)
    .addTask(registerDomainUpdateJob)
    .addTask(registerCountryUpdateJob)
    .useSwagger('/api-docs')
    .useRouter('/api', apiRouter)
    .start();
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

bootstrap().catch((err) => {
  console.error('Bootstrap failed:', err);
  process.exit(1);
});