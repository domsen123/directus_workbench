import { defineConfig } from 'tsup';
import pkg from './package.json';

const nodes = ['hooks'];

const name = pkg.name.split('/')[pkg.name.split('/').length - 1];

export default defineConfig(
  nodes.map((node) => ({
    entry: [`src/${node}/index.ts`],
    outDir: `dist/${node}/${name}`,
    splitting: false,
    clean: true,
    format: ['cjs'],
    target: 'esnext',
    legacyOutput: true,
    noExternal: [],
    minify: true,
    onSuccess: `mkdir -p /home/dmarx/directus_workspace/@deploy/extensions/${node}/${name} && cp -r ./dist/${node}/${name}/* /home/dmarx/directus_workspace/@deploy/extensions/${node}/${name}`,
  })),
);
