import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

/**
 * Loads environment variables from .env file if it exists
 * @param {string} projectRoot - Path to project root directory
 */
export function loadEnvFile(projectRoot) {
  const envPath = join(projectRoot, '.env');
  
  if (!existsSync(envPath)) {
    return;
  }

  try {
    const envContent = readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
      const match = line.match(/^([^=]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        const value = match[2].trim();
        if (!process.env[key]) {
          process.env[key] = value;
        }
      }
    });
  } catch (error) {
    // Silently fail if .env file can't be read
  }
}

/**
 * Gets required environment variable or throws error
 * @param {string} name - Environment variable name
 * @returns {string} Environment variable value
 */
export function getRequiredEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} environment variable is required`);
  }
  return value;
}

/**
 * Gets optional environment variable with default value
 * @param {string} name - Environment variable name
 * @param {string} defaultValue - Default value if not set
 * @returns {string} Environment variable value or default
 */
export function getOptionalEnv(name, defaultValue = '') {
  return process.env[name] || defaultValue;
}