import type { AppConfig } from './config.interface.js';

import { devConfig } from './config.dev.js';
import { localConfig } from './config.local.js';
import { prodConfig } from './config.pord.js';

type Environment = 'local' | 'dev' | 'prod';

class ConfigManager {
  private config: AppConfig;
  private environment: Environment;

  constructor() {
    this.environment = this.validateEnvironment();
    this.config = this.loadConfig();
  }

  /**
   * Validates and returns the current environment
   */
  private validateEnvironment(): Environment {
    const env = (process.env.NODE_ENV || 'local').toLowerCase();

    const validEnvironments: Environment[] = ['local', 'dev', 'prod'];

    if (!validEnvironments.includes(env as Environment)) {
      // oxlint-disable-next-line no-console
      console.warn(
        `Invalid NODE_ENV "${env}". Falling back to "local". Valid options: ${validEnvironments.join(', ')}`
      );
      return 'local';
    }

    return env as Environment;
  }

  /**
   * Loads the appropriate configuration based on environment
   */
  private loadConfig(): AppConfig {
    switch (this.environment) {
      case 'local':
        return localConfig;
      case 'dev':
        return devConfig;
      case 'prod':
        return prodConfig;
      default:
        // This should never happen due to validation, but TypeScript requires it
        throw new Error(`Unknown environment`);
    }
  }

  /**
   * Gets the current configuration
   */
  public getConfig(): AppConfig {
    return this.config;
  }

  /**
   * Gets the current environment
   */
  public getEnvironment(): Environment {
    return this.environment;
  }

  /**
   * Checks if running in a specific environment
   */
  public isLocal(): boolean {
    return this.environment === 'local';
  }

  public isDev(): boolean {
    return this.environment === 'dev';
  }

  public isProd(): boolean {
    return this.environment === 'prod';
  }
}

// Export singleton instance
export const configManager = new ConfigManager();
export const config = configManager.getConfig();
export const environment = configManager.getEnvironment();
