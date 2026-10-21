// Real-browser test suite. Run:  npm install && npx playwright install chromium && npm run test:browser
// Set ONLINE=1 to also require third-party images (Wikimedia) and fonts to load.
const { defineConfig } = require('@playwright/test');
module.exports = defineConfig({
  testDir: './tests',
  timeout: 60000,
  fullyParallel: true,
  reporter: [['list'], ['html', { open: 'never', outputFolder: 'test-report' }], ['json', { outputFile: 'test-results/results.json' }]],
  use: { baseURL: 'http://localhost:4173', trace: 'retain-on-failure' },
  webServer: { command: 'node scripts/build-dist.js && npx --yes serve -l 4173 dist', url: 'http://localhost:4173', reuseExistingServer: true, timeout: 120000 },
  projects: [
    { name: 'desktop-1440', use: { viewport: { width: 1440, height: 900 } } },
    { name: 'tablet-768', use: { viewport: { width: 768, height: 1024 } } },
    { name: 'mobile-390', use: { viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true } },
  ],
});
