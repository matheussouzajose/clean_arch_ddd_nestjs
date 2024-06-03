import config from './jest.config';

config.testRegex = '.e2e-spec.ts$';
config.roots = ['<rootDir>/test/e2e'];
config.setupFilesAfterEnv = ['<rootDir>/test/jest-setup.ts'];
export default config;
