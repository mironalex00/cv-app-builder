import CronBuilder, { CronScheduler } from '../utils/cronBuilder.js';
import { updateCountriesFromSource } from '../services/countryService.js';

const JOB_ID = 'country-update';
const JOB_SCHEDULE = CronBuilder.presets.monthly().withDayOfMonth(1).withHour(0).withMinute(0); // Every 1st day of the month at 00:00

const countryUpdateHandler = async (): Promise<void> => {
  console.info('[Cron:country-update] Starting country update...');
  const startTime = performance.now();
  try {
    const count = await updateCountriesFromSource();
    const duration = Math.round(performance.now() - startTime);
    console.info(`[Cron:country-update] Completed: ${count} countries loaded in ${duration}ms.`);
  } catch (error) {
    const duration = Math.round(performance.now() - startTime);
    console.error(
      `[Cron:country-update] Failed after ${duration}ms:`,
      error instanceof Error ? error.message : String(error)
    );
  }
};

// ============================================================================
// Public API
// ============================================================================
export function registerCountryUpdateJob(): void {
  const scheduler = CronScheduler.getInstance();
  if (scheduler.getJob(JOB_ID)) {
    console.warn(`[Cron] Job "${JOB_ID}" is already registered.`);
    return;
  }
  scheduler.addJob(JOB_ID, JOB_SCHEDULE, countryUpdateHandler, { timezone: 'UTC' });
  console.info(`[Cron] Registered job "${JOB_ID}" with schedule: ${JOB_SCHEDULE.toString()}`);
}
export function unregisterCountryUpdateJob(): void {
  const scheduler = CronScheduler.getInstance();
  if (scheduler.removeJob(JOB_ID)) {
    console.info(`[Cron] Unregistered job "${JOB_ID}".`);
  }
}