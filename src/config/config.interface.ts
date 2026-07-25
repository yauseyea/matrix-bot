export type LogLevel = 'fatal' | 'error' | 'warn' | 'info' | 'debug' | 'trace';

export interface LoggerConfig {
  name: string;
  environment: 'local' | 'dev' | 'prod';
  streams: {
    console: {
      level: LogLevel;
      prettyPrint: boolean;
    };
    loki: {
      level: LogLevel;
      url: string;
    };
    tempo: {
      url: string;
    };
    profiling: {
      url: string;
    };
  };
}

export interface AppConfig {
  environment: 'local' | 'dev' | 'prod';
  logger: LoggerConfig;
  app: {
    port: number;
  };
  matrix: {
    url: string;
    name: string;
    asToken: string;
    hsToken: string;
    botLocalPart: string;
    configPath: string;
  };
  webhookService: {
    url: string;
    apiKey: string;
  };
  auth: {
    apiKeys: string[];
  };
}

export function requireEnvVar(name: string): string {
  const value = process.env[name];
  if (value === undefined) {
    throw new Error(`Environment variable ${name} is not set`);
  }
  return value;
}

export function splittStringIntoArray(value: string, sepeartor: string) {
  return value.split(sepeartor);
}
