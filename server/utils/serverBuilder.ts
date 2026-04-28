// Node imports
import { ServerOptions, createServer as createHttpsServer, Server as HTTPS_Server } from 'node:https';
import { createServer as createHttpServer, Server as HTTP_Server } from 'node:http';

// External imports
import { Application, RequestHandler, Router } from 'express';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from '../services/swagger.js';

// Internal imports
import localhostOnly from '../middlewares/localhostOnly.js';
import { CronBuilderState, CronExpression, CronScheduler } from './cronBuilder.js';

// ============================================================================
// Type Definitions
// ============================================================================
declare type VoidableCallback = () => Promise<void> | void;

// ============================================================================
// Interfaces
// ============================================================================
declare interface IServerBuilderProtocol {
  http(): IServerBuilderConfig;
  https(options: { key: string | Buffer; cert: string | Buffer }): IServerBuilderConfig;
}
declare interface IServerBuilderConfig {
  setConfig(config: { port?: number; base?: string; isProduction?: boolean }): this;
  useMiddleware(path: string, middleware: RequestHandler): this;
  useMiddleware(middleware: RequestHandler): this;
  useRouter(path: string, router: Router): this;
  addTask(initTask: VoidableCallback): this;
  addTask(schedule: CronBuilderState | CronExpression, cronTask: VoidableCallback): this;
  start(): Promise<void>;
  beforeStart(callback: VoidableCallback): this;
  afterStart(callback: VoidableCallback): this;
  useSwagger(path: string): this;
  stop(): Promise<void>;
  beforeStop(callback: VoidableCallback): this;
  afterStop(callback: VoidableCallback): this;
}

// ============================================================================
// ServerBuilder Implementation
// ============================================================================
export default class ServerBuilder implements IServerBuilderProtocol, IServerBuilderConfig {

  private readonly app: Application;

  private useHttps: boolean = false;
  private httpsOptions?: ServerOptions;

  private isProduction?: boolean;
  private port?: number;
  private baseRoute?: string;

  private initTasks: Array<VoidableCallback> = [];
  private cronJobRegistrations: Array<{
    schedule: CronBuilderState | CronExpression;
    task: VoidableCallback;
  }> = [];

  private beforeStartHooks: Array<VoidableCallback> = [];
  private afterStartHooks: Array<VoidableCallback> = [];

  private beforeStopHooks: Array<VoidableCallback> = [];
  private afterStopHooks: Array<VoidableCallback> = [];

  private registeredJobIds: Set<string> = new Set();
  private serverInstance?: HTTP_Server | HTTPS_Server;

  private constructor(app: Application) {
    this.app = app;
  }

  public static create(app: Application): IServerBuilderProtocol {
    return new ServerBuilder(app);
  }

  public http(): IServerBuilderConfig {
    this.useHttps = false;
    return this;
  }

  public https(options: { key: string | Buffer; cert: string | Buffer }): IServerBuilderConfig {
    this.useHttps = true;
    this.httpsOptions = options;
    return this;
  }

  public setConfig(config: { port?: number; base?: string; isProduction?: boolean }): this {
    if (config.isProduction !== undefined) this.isProduction = config.isProduction;
    if (config.port !== undefined) this.port = config.port;
    if (config.base !== undefined) this.baseRoute = config.base;
    if (this.isProduction) this.useHttps = true;
    return this;
  }

  public useMiddleware(arg1: string | RequestHandler, arg2?: RequestHandler): this {
    if (typeof arg1 === 'string' && arg2) {
      this.app.use(arg1, arg2);
    } else if (typeof arg1 === 'function') {
      this.app.use(arg1);
    } else {
      throw new TypeError('Invalid arguments for useMiddleware');
    }
    return this;
  }

  public useRouter(path: string, router: Router): this {
    this.app.use(path, router);
    return this;
  }

  public addTask(initTaskOrSchedule: VoidableCallback | CronBuilderState | CronExpression, cronTask?: VoidableCallback): this {
    if (cronTask !== undefined) {
      const schedule = initTaskOrSchedule as CronBuilderState | CronExpression;
      this.cronJobRegistrations.push({ schedule, task: cronTask });
    } else if (typeof initTaskOrSchedule === 'function') {
      this.initTasks.push(initTaskOrSchedule);
    } else {
      throw new Error('Invalid arguments: provide either (initTask) or (schedule, cronTask)');
    }
    return this;
  }

  public beforeStart(fn: VoidableCallback): this {
    this.beforeStartHooks.push(fn);
    return this;
  }

  public afterStart(fn: VoidableCallback): this {
    this.afterStartHooks.push(fn);
    return this;
  }

  public useSwagger(path: string): this {
    this.app.use(path, localhostOnly, swaggerUi.serve, swaggerUi.setup(swaggerSpec));
    return this;
  }

  public async start(): Promise<void> {
    for (const hook of this.beforeStartHooks) {
      await hook();
    }

    for (const initTask of this.initTasks) {
      await initTask();
    }

    const scheduler = CronScheduler.getInstance();
    const timestamp = Date.now();

    this.cronJobRegistrations.forEach(({ schedule, task }, index) => {
      const jobId = `server-${timestamp}-${index}`;
      scheduler.addJob(jobId, schedule, task);
      this.registeredJobIds.add(jobId);
    });

    this.serverInstance = this.useHttps
      ? createHttpsServer(this.httpsOptions!, this.app)
      : createHttpServer(this.app);

    await new Promise<void>((resolve, reject) => {
      this.serverInstance!.listen(this.port, () => {
        const protocol = this.useHttps ? 'https' : 'http';
        console.log(`Server running at ${protocol}://localhost:${this.port}`);
        resolve();
      });
      this.serverInstance!.on('error', reject);
    });

    for (const hook of this.afterStartHooks) {
      await hook();
    }
  }

  public beforeStop(fn: VoidableCallback): this {
    this.beforeStopHooks.push(fn);
    return this;
  }

  public afterStop(fn: VoidableCallback): this {
    this.afterStopHooks.push(fn);
    return this;
  }

  public async stop(): Promise<void> {
    for (const hook of this.beforeStopHooks) {
      await hook();
    }

    const scheduler = CronScheduler.getInstance();
    for (const jobId of this.registeredJobIds) {
      scheduler.removeJob(jobId);
    }
    this.registeredJobIds.clear();

    if (this.serverInstance) {
      await new Promise<void>((resolve, reject) => {
        this.serverInstance!.close((err) => {
          if (err) reject(err);
          else resolve();
        })
      });

      for (const hook of this.afterStopHooks) {
        await hook();
      }
      this.serverInstance = undefined;
    }

    console.log('Server stopped and cron jobs unregistered.');
  }
}