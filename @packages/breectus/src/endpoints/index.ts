import { readdirSync } from 'fs';
import { resolve } from 'path';
import { defineEndpoint } from '@directus/extensions-sdk';
import type Bree from 'bree/types';
import fg from 'fast-glob';

export default defineEndpoint({
  id: 'breectus',
  handler: (router, { env }) => {
    const jobsDir = resolve(env.EXTENSIONS_PATH, 'jobs');

    router.get('/list-jobs', async (req, res) => {
      const fsJobs = await fg(`${jobsDir}/*.js`);

      const bree: Bree = req.app.get('bree');
      const breeJobs = bree.config.jobs;

      const result = fsJobs.map((fsJobPath) => {
        const breeJob = breeJobs.find((_j) => _j.path === fsJobPath);
        if (breeJob) {
          const _j: any = breeJob;
          _j.status = 'done';
          if (bree.workers.has(breeJob.name)) _j.status = 'active';
          else if (bree.timeouts.has(breeJob.name)) _j.status = 'delayed';
          else if (bree.intervals.has(breeJob.name)) _j.status = 'waiting';
          return _j;
        } else {
          return {
            name: fsJobPath.split('/').pop()?.replace('.js', ''),
            path: fsJobPath,
            status: 'stopped',
          };
        }
      });

      res.send(result);
    });

    router.post('/add-job/:jobName', async (req, res) => {
      const jobName = req.params.jobName;

      const bree: Bree = req.app.get('bree');
      const breeJobs = bree.config.jobs;
      const jobExists = breeJobs.find((j) => j.name === jobName);

      if (jobExists) return res.status(409).send('Conflict!');

      const fsJobs = await fg(`${jobsDir}/${jobName}.js`);
      if (fsJobs.length === 0) return res.status(404).send();
      if (fsJobs.length > 1) return res.status(409).send();

      if (fsJobs && fsJobs.length === 1) {
        const fsJobPath = fsJobs[0];
        await bree.add({
          name: jobName,
          path: fsJobPath,
          cron: '* * * * *',
        });
        await bree.start(jobName);
        return res.send('ok');
      }
      return res.status(500).send();
    });
  },
});
