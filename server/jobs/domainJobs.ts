import CronBuilder, { CronScheduler } from '../utils/cronBuilder.js';
import { updateDomainsFromSource } from '../services/domainService.js';

const JOB_ID = 'domain-update';
const JOB_SCHEDULE = CronBuilder.presets.daily().withMinute(0).withHour(0); // Every day at 00:00

const domainUpdateHandler = async (): Promise<void> => {
  console.info('[Cron:domain-update] Starting disposable domain update...');
  const startTime = performance.now();
  try {
    const count = await updateDomainsFromSource();
    const duration = Math.round(performance.now() - startTime);
    console.info(`[Cron:domain-update] Completed: ${count} domains loaded in ${duration}ms.`);
  } catch (error) {
    const duration = Math.round(performance.now() - startTime);
    console.error(
      `[Cron:domain-update] Failed after ${duration}ms:`,
      error instanceof Error ? error.message : String(error)
    );
  }
};

// ============================================================================
// Public API
// ============================================================================
export function registerDomainUpdateJob(): void {
  const scheduler = CronScheduler.getInstance();
  if (scheduler.getJob(JOB_ID)) {
    console.warn(`[Cron] Job "${JOB_ID}" is already registered.`);
    return;
  }
  scheduler.addJob(JOB_ID, JOB_SCHEDULE, domainUpdateHandler, { timezone: 'UTC' });
  console.info(`[Cron] Registered job "${JOB_ID}" with schedule: ${JOB_SCHEDULE.toString()}`);
}
export function unregisterDomainUpdateJob(): void {
  const scheduler = CronScheduler.getInstance();
  if (scheduler.removeJob(JOB_ID)) {
    console.info(`[Cron] Unregistered job "${JOB_ID}".`);
  }
}