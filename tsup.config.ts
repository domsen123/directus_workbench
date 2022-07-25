/* eslint-disable no-console */
import { existsSync, lstatSync, rmSync, symlinkSync } from 'fs';
import { dirname, join, resolve } from 'path';
import fg from 'fast-glob';
import { defineConfig } from 'tsup';

const getNameAndType = (extension: string) => {
  const _e = extension.split('/@packages/')[1];
  const extensionName = _e.split('/')[0];
  const extensionType = _e.split('/')[2];
  return { extensionName: `${extensionName}-${extensionType}`, extensionType };
};

const tsupConfigs: any[] = [];

const packagesPath = resolve(process.cwd(), '@packages');
const deployPath = resolve(process.cwd(), '@deploy/instance/extensions');
const instancePath = resolve(process.cwd(), '@deploy/directus/app/src');

const serverExtensions = await fg(
  `${packagesPath}/*/src/(hooks|endpoints|migrations)/index.ts`,
);

const clientExtensions = await await fg(
  `${packagesPath}/*/src/(displays|interfaces|layouts|modules|operations|panels)/index.ts`,
);

for (const extension of serverExtensions) {
  const { extensionName, extensionType } = getNameAndType(extension);

  tsupConfigs.push(
    defineConfig({
      entry: [extension],
      outDir: join('dist', extensionType, extensionName),
      splitting: false,
      clean: true,
      format: ['cjs'],
      target: 'esnext',
      legacyOutput: true,
      noExternal: [],
      // minify: true,
      onSuccess: `cp -Rf ./dist/* ${deployPath}`,
    }),
  );
}

// // CLEANUP
const _links = await fg(
  `${instancePath}/(displays|interfaces|layouts|modules|operations|panels)/*/index.ts`,
);
for (const _l of _links) {
  if (lstatSync(dirname(_l)).isSymbolicLink()) {
    console.log(`Removing Symbolic Link: ${_l}`);
    rmSync(dirname(_l), { recursive: true, force: true });
  }
}

for (const extension of clientExtensions) {
  const { extensionName, extensionType } = getNameAndType(extension);
  const appExtensionPath = join(instancePath, extensionType, extensionName);
  const exists = existsSync(appExtensionPath);
  if (!exists) {
    console.log(`Adding Symbolic Link: ${dirname(extension)}`);
    symlinkSync(dirname(extension), appExtensionPath);
  }
}

export default tsupConfigs;
