import base from './playwright.config.mjs';
export default {
  ...base,
  outputDir: 'test-results-cross-browser',
  reporter: [['list']],
  projects: [
    { name: 'firefox', use: { browserName: 'firefox', viewport: { width: 1440, height: 1000 } } },
    { name: 'webkit', use: { browserName: 'webkit', viewport: { width: 390, height: 844 } } },
  ],
};
