import { spawn, type ChildProcess } from 'node:child_process';
import { get } from 'node:http';
import { resolve } from 'node:path';
import { defineConfig } from 'cypress';
import createBundler from '@bahmutov/cypress-esbuild-preprocessor';
import { addCucumberPreprocessorPlugin } from '@badeball/cypress-cucumber-preprocessor';
import createEsbuildPlugin from '@badeball/cypress-cucumber-preprocessor/esbuild';

const appUrl = 'http://127.0.0.1:4200';
let appServer: ChildProcess | undefined;

function isAppAvailable(): Promise<boolean> {
  return new Promise(resolveRequest => {
    const request = get(appUrl, response => {
      response.resume();
      resolveRequest(response.statusCode !== undefined && response.statusCode < 500);
    });

    request.setTimeout(1000, () => request.destroy());
    request.on('error', () => resolveRequest(false));
  });
}

function stopAppServer(): void {
  appServer?.kill();
  appServer = undefined;
}

async function ensureAppServer(): Promise<void> {
  if (await isAppAvailable()) {
    return;
  }

  appServer = spawn(
    process.execPath,
    [resolve('node_modules/@angular/cli/bin/ng.js'), 'serve', '--host', '127.0.0.1', '--port', '4200'],
    { stdio: 'ignore', windowsHide: true }
  );
  let startupError: Error | undefined;
  appServer.once('error', error => startupError = error);
  process.once('exit', stopAppServer);

  for (let attempt = 0; attempt < 90; attempt++) {
    if (await isAppAvailable()) {
      return;
    }

    if (appServer.exitCode !== null || appServer.signalCode !== null) {
      throw new Error('The Angular app exited before becoming available at http://127.0.0.1:4200.');
    }
    if (startupError) {
      stopAppServer();
      throw new Error(`Unable to start the Angular app for Cypress: ${startupError.message}`);
    }

    await new Promise(resolveDelay => setTimeout(resolveDelay, 1000));
  }

  stopAppServer();
  throw new Error('Timed out waiting for the Angular app at http://127.0.0.1:4200.');
}

export default defineConfig({
  e2e: {
    baseUrl: appUrl,
    specPattern: ['cypress/e2e/**/*.feature', 'cypress/e2e/**/*.cy.ts'],
    supportFile: false,
    async setupNodeEvents(on, config) {
      await addCucumberPreprocessorPlugin(on, config);
      on('file:preprocessor', createBundler({ plugins: [createEsbuildPlugin(config)] }));
      await ensureAppServer();
      on('after:run', stopAppServer);
      return config;
    }
  }
});