import cron, { ScheduledTask, TaskOptions as ScheduleOptions } from 'node-cron';

// ============================================================================
// Type Definitions
// ============================================================================
/**
 * Numeric range types using recursive tuple enumeration.
 * Limited depth to avoid TypeScript recursion limits.
 */
type EnumerateRange<
  Start extends number,
  End extends number,
  Acc extends number[] = []
> = Acc['length'] extends End
  ? Acc[number] | Start
  : EnumerateRange<Start, End, [...Acc, Acc['length']]>;

export type Minute = EnumerateRange<0, 60>;        // 0‑59
export type Hour = EnumerateRange<0, 24>;          // 0‑23
export type DayOfMonth = EnumerateRange<1, 32>;    // 1‑31
export type Month = EnumerateRange<1, 13>;         // 1‑12
export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = Sunday

/**
 * Cron field value: specific number, wildcard, or step pattern.
 * TypeScript discriminates union for compile‑time validation.
 */
export type CronField<T extends number> = T | '*' | `*/${number}` | `${number}`;

export interface CronExpression {
  readonly minute: CronField<Minute>;
  readonly hour: CronField<Hour>;
  readonly dayOfMonth: CronField<DayOfMonth>;
  readonly month: CronField<Month>;
  readonly dayOfWeek: CronField<DayOfWeek>;
}

/**
 * Job definition compatible with node-cron ScheduledTask.
 */
export interface ScheduledJob {
  readonly id: string;
  readonly cron: CronExpression;
  readonly handler: () => void | Promise<void>;
  readonly options?: ScheduleOptions;
  readonly task: ScheduledTask;
  readonly createdAt: number;
}

// ============================================================================
// Immutable Cron Builder State (Static API)
// ============================================================================
export class CronBuilderState {
  constructor(
    public readonly minute: CronField<Minute> = '*',
    public readonly hour: CronField<Hour> = '*',
    public readonly dayOfMonth: CronField<DayOfMonth> = '*',
    public readonly month: CronField<Month> = '*',
    public readonly dayOfWeek: CronField<DayOfWeek> = '*'
  ) { }

  withMinute(value: CronField<Minute>): CronBuilderState {
    return new CronBuilderState(value, this.hour, this.dayOfMonth, this.month, this.dayOfWeek);
  }
  withHour(value: CronField<Hour>): CronBuilderState {
    return new CronBuilderState(this.minute, value, this.dayOfMonth, this.month, this.dayOfWeek);
  }
  withDayOfMonth(value: CronField<DayOfMonth>): CronBuilderState {
    return new CronBuilderState(this.minute, this.hour, value, this.month, this.dayOfWeek);
  }
  withMonth(value: CronField<Month>): CronBuilderState {
    return new CronBuilderState(this.minute, this.hour, this.dayOfMonth, value, this.dayOfWeek);
  }
  withDayOfWeek(value: CronField<DayOfWeek>): CronBuilderState {
    return new CronBuilderState(this.minute, this.hour, this.dayOfMonth, this.month, value);
  }
  build(): CronExpression {
    return Object.freeze({
      minute: this.minute,
      hour: this.hour,
      dayOfMonth: this.dayOfMonth,
      month: this.month,
      dayOfWeek: this.dayOfWeek,
    });
  }
  toString(): string {
    return `${this.minute} ${this.hour} ${this.dayOfMonth} ${this.month} ${this.dayOfWeek}`;
  }
}
export default class CronBuilder {
  private constructor() { }

  static every(): CronBuilderState {
    return new CronBuilderState();
  }
  static presets = {
    everyMinute: () => new CronBuilderState('*', '*', '*', '*', '*'),
    everyFiveMinutes: () => new CronBuilderState('*/5', '*', '*', '*', '*'),
    hourly: () => new CronBuilderState('0', '*', '*', '*', '*'),
    daily: () => new CronBuilderState('0', '0', '*', '*', '*'),
    weekly: () => new CronBuilderState('0', '0', '*', '*', '0'),
    monthly: () => new CronBuilderState('0', '0', '1', '*', '*'),
  } as const;
  static parse(expression: string): CronExpression {
    const trimmed = expression.trim();
    if (!cron.validate(trimmed)) {
      throw new TypeError(`Invalid cron expression: "${trimmed}"`);
    }
    const parts = trimmed.split(/\s+/);
    if (parts.length !== 5) {
      throw new TypeError(`Cron expression must have 5 fields, got ${parts.length}`);
    }
    const [minute, hour, dom, month, dow] = parts as [string, string, string, string, string];
    const toField = <T extends number>(value: string, min: number, max: number): CronField<T> => {
      if (value === '*') {
        return '*' as CronField<T>;
      }
      if (value.startsWith('*/')) {
        const step = Number(value.slice(2));
        if (Number.isInteger(step) && step > 0 && step <= max) {
          return value as `*/${number}` as CronField<T>;
        }
      }
      const num = Number(value);
      if (Number.isInteger(num) && num >= min && num <= max) {
        return num as CronField<T>;
      }
      throw new RangeError(`Invalid value "${value}"`);
    };
    return Object.freeze({
      minute: toField<Minute>(minute, 0, 59),
      hour: toField<Hour>(hour, 0, 23),
      dayOfMonth: toField<DayOfMonth>(dom, 1, 31),
      month: toField<Month>(month, 1, 12),
      dayOfWeek: toField<DayOfWeek>(dow, 0, 6),
    });
  }
}

// ============================================================================
// Job Scheduler (Instance API powered by node-cron)
// ============================================================================
interface SchedulerState {
  jobs: Map<string, ScheduledJob>;
  isDestroyed: boolean;
}
export class CronScheduler {
  private static instance: CronScheduler | null = null;
  private state: SchedulerState;

  private constructor() {
    this.state = {
      jobs: new Map(),
      isDestroyed: false,
    };
  }
  static getInstance(): CronScheduler {
    if (!CronScheduler.instance) {
      CronScheduler.instance = new CronScheduler();
    }
    return CronScheduler.instance;
  }

  /**
   * Adds a job to the registry and starts its node-cron task.
   * @param id Unique job identifier
   * @param cronExpr Cron expression (builder state or raw expression)
   * @param handler Async or sync function to execute
   * @param options node-cron ScheduleOptions (timezone, scheduled, etc.)
   * @returns The job ID
   * @throws If job ID already exists or cron expression invalid
   */
  addJob(
    id: string,
    cronExpr: CronExpression | CronBuilderState,
    handler: () => void | Promise<void>,
    options?: ScheduleOptions
  ): string {
    if (this.state.isDestroyed) {
      throw new Error('Scheduler has been destroyed. Create a new instance.');
    }
    if (this.state.jobs.has(id)) {
      throw new Error(`Job with id "${id}" already exists. Use updateJob() to modify.`);
    }
    const cronExpression = cronExpr instanceof CronBuilderState
      ? cronExpr.build()
      : cronExpr;
    const cronString = this.expressionToString(cronExpression);
    if (!cron.validate(cronString)) {
      throw new TypeError(`Invalid cron expression: "${cronString}"`);
    }
    const safeHandler = async () => {
      try {
        await handler();
      } catch (err) {
        console.error(`Cron job "${id}" failed:`, err);
      }
    };
    const task = cron.schedule(cronString, safeHandler, { ...options });
    const job: ScheduledJob = Object.freeze({
      id,
      cron: cronExpression,
      handler,
      options,
      task,
      createdAt: Date.now(),
    });
    this.state.jobs.set(id, job);
    return id;
  }

  /**
   * Removes a job by ID and stops its associated task.
   */
  removeJob(id: string): boolean {
    const job = this.state.jobs.get(id);
    if (job) {
      job.task.stop();
      return this.state.jobs.delete(id);
    }
    return false;
  }

  /**
   * Updates an existing job's handler, schedule, or options.
   * Stops the old task and starts a new one.
   */
  updateJob(
    id: string,
    updates: Partial<Pick<ScheduledJob, 'cron' | 'handler' | 'options'>>
  ): void {
    const existing = this.state.jobs.get(id);
    if (!existing) {
      throw new Error(`Job with id "${id}" not found.`);
    }
    const newCron = updates.cron ?? existing.cron;
    const cronString = this.expressionToString(newCron);
    if (!cron.validate(cronString)) {
      throw new TypeError(`Invalid cron expression: "${cronString}"`);
    }
    existing.task.stop();
    const newHandler = updates.handler ?? existing.handler;
    const safeHandler = async () => {
      try {
        await newHandler();
      } catch (err) {
        console.error(`Cron job "${id}" failed:`, err);
      }
    };
    const newOptions = { ...existing.options, ...updates.options };
    const newTask = cron.schedule(cronString, safeHandler, { ...newOptions });
    const updated: ScheduledJob = Object.freeze({
      id,
      cron: newCron,
      handler: newHandler,
      options: newOptions,
      task: newTask,
      createdAt: existing.createdAt,
    });
    this.state.jobs.set(id, updated);
  }

  /**
   * Retrieves registered jobs (read‑only).
  */
  getJobs(): ReadonlyMap<string, ScheduledJob> {
    return this.state.jobs;
  }
  getJob(id: string): ScheduledJob | undefined {
    return this.state.jobs.get(id);
  }

  /**
   * Starts all tasks that were created with `scheduled: false`.
   * Note: node-cron tasks are started by default unless option overridden.
   */
  startAll(): void {
    if (this.state.isDestroyed) return;
    for (const job of this.state.jobs.values()) {
      job.task.start();
    }
  }
  stopAll(): void {
    for (const job of this.state.jobs.values()) {
      job.task.stop();
    }
  }

  /**
   * Destroys the scheduler, stopping all tasks and clearing the registry.
   * Singleton instance must be recreated via getInstance() after destroy.
   */
  destroy(): void {
    this.stopAll();
    this.state.jobs.clear();
    this.state.isDestroyed = true;
    CronScheduler.instance = null;
  }

  get size(): number {
    return this.state.jobs.size;
  }
  private expressionToString(expr: CronExpression): string {
    return `${expr.minute} ${expr.hour} ${expr.dayOfMonth} ${expr.month} ${expr.dayOfWeek}`;
  }
}