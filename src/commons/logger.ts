import pino, {
  type Logger as PinoLogger,
  type LoggerOptions,
  type TransportTargetOptions,
} from 'pino';
import { trace } from '@opentelemetry/api';

import { LogLevel } from '../config/config.interface.js';
import type { LoggerConfig } from '../config/config.interface.js';

export class Logger {
  private logger: PinoLogger;

  constructor(loggerConf: LoggerConfig) {
    const consoleConf = loggerConf.streams.console;
    const isPretty = consoleConf.prettyPrint;
    const targets: TransportTargetOptions[] = [];

    if (loggerConf.streams.console) {
      if (isPretty) {
        targets.push({
          target: 'pino-pretty',
          level: consoleConf.level,
          options: {
            colorize: true,
            translateTime: 'yyyy-mm-dd HH:MM:ss',
            ignore: 'pid,hostname',
          },
        });
      } else {
        targets.push({
          target: 'pino/file',
          level: consoleConf.level,
          options: { destination: 1 }, // stdout
        });
      }
    }

    const lokiConf = loggerConf.streams.loki;
    targets.push({
      target: 'pino-loki',
      level: lokiConf.level,
      options: {
        host: lokiConf.url,
        labels: {
          app: loggerConf.name,
          env: loggerConf.environment,
        },
        replaceTimestamp: true,
        silenceErrors: false,
      },
    });

    const pinoOptions: LoggerOptions = {
      name: loggerConf.name,
      level: consoleConf.level,
      transport: targets.length > 0 ? { targets } : undefined,
    };

    this.logger = pino(pinoOptions);
  }
  /**
   * Create a logger from config + appConfig for env/app metadata
   */
  static fromConfig(config: LoggerConfig): Logger {
    return new Logger(config);
  }

  /**
   * Create a child logger with additional context
   */
  child(bindings: Record<string, unknown>): Logger {
    const child = Object.create(this) as Logger;
    child.logger = this.logger.child(bindings);
    return child;
  }

  /**
   * Extracts the current OpenTelemetry trace/span IDs from context.
   * Returns an empty object when no active span exists.
   */
  private getTraceContext(): Record<string, string> {
    const span = trace.getActiveSpan();
    if (!span) return {};

    const { traceId, spanId, traceFlags } = span.spanContext();
    // traceFlags === 1 means the span is sampled
    if (traceFlags !== 1) return {};

    return { traceId, spanId };
  }

  trace(msg: string, context?: Record<string, unknown>): void {
    this.logger.trace({ context, ...this.getTraceContext() }, msg);
  }

  debug(msg: string, context?: Record<string, unknown>): void {
    this.logger.debug({ context, ...this.getTraceContext() }, msg);
  }

  info(msg: string, context?: Record<string, unknown>): void {
    this.logger.info({ context, ...this.getTraceContext() }, msg);
  }

  warn(msg: string, context?: Record<string, unknown>): void {
    this.logger.warn({ context, ...this.getTraceContext() }, msg);
  }

  error(msg: string, context?: Record<string, unknown>): void {
    this.logger.error({ context, ...this.getTraceContext() }, msg);
  }

  fatal(msg: string, context?: Record<string, unknown>): void {
    this.logger.fatal({ context, ...this.getTraceContext() }, msg);
  }

  setLevel(level: LogLevel): void {
    this.logger.level = level;
  }

  getLevel(): LogLevel {
    return this.logger.level as LogLevel;
  }

  getPinoLogger(): PinoLogger {
    return this.logger;
  }
}
