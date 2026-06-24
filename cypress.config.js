const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:8080',
    supportFile: false,
    specPattern: 'tests/integration/**/*.cy.js',
    video: false,
    screenshotOnRunFailure: true,
  },
});
