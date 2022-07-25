/* eslint-disable import/default */
import { resolve } from 'path';
import { defineHook } from '@directus/extensions-sdk';
import Bree from 'bree';
import Graceful from '@ladjs/graceful';

export default defineHook(({ init }, { logger, env }) => {
  init('app.before', async ({ app }) => {
    const root = resolve(env.EXTENSIONS_PATH, 'jobs');

    const bree = new Bree({
      logger,
      root,
      silenceRootCheckError: true,
      doRootCheck: false,
      jobs: [],
    });
    const graceful = new Graceful({ brees: [bree] });
    graceful.listen();
    await bree.start();
    app.set('bree', bree);
  });
});
