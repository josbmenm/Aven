const fs = require('fs-extra');

const rootListing = fs.readdirSync('.');

const mainPkg = JSON.parse(fs.readFileSync('package.json'));

const results = rootListing.map(fileName => {
  const stat = fs.statSync(fileName);
  return {
    fileName,
    isDirectory: stat.isDirectory(),
  };
});

const possiblePkgs = results.filter(
  res =>
    res.fileName !== 'packages' && res.isDirectory && res.fileName[0] !== '.',
);

const pkgs = possiblePkgs
  .map(info => {
    let pkg = null;
    let files = null;
    try {
      pkg = JSON.parse(fs.readFileSync(`${info.fileName}/package.json`));
    } catch (e) {}
    try {
      files = fs.readdirSync(info.fileName);
      files = files.filter(file => file !== 'package.json');
    } catch (e) {}
    return { ...info, pkg, files };
  })
  .filter(pkg => !!pkg.pkg);

const IMPORT_MAP = {
  "import Err from '../utils/Err';": "import {Err} from '@aven-cloud/utils';",
  "import getIdOfValue from '../cloud-utils/getIdOfValue';":
    "import {getIdOfValue} from '@aven-cloud/cloud-utils';",
  "import createDispatcher from '../cloud-utils/createDispatcher';":
    "import {createDispatcher} from '@aven-cloud/cloud-utils';",
  "import { createClient } from '../cloud-core/Kite';":
    "import {createClient} from '@aven-cloud/cloud-core';",
  "import { createStreamValue } from '../cloud-core/StreamValue';":
    "import { createStreamValue } from '@aven-cloud/cloud-core';",
  "import {streamOf,createProducerStream} from '../cloud-core/createMemoryStream';":
    "import {streamOf,createProducerStream} from '@aven-cloud/cloud-core';",
  "import { streamOf } from '../cloud-core/createMemoryStream';":
    "import {streamOf} from '@aven-cloud/cloud-core';",
  "import createNetworkSource from '../cloud-network/createNetworkSource';":
    "import {createNetworkSource} from '@aven-cloud/cloud-network';",
};

pkgs.forEach(info => {
  console.log('Migrating ' + info.fileName);
  fs.removeSync(`packages/${info.fileName}`);
  fs.mkdirSync(`packages/${info.fileName}`);
  fs.mkdirSync(`packages/${info.fileName}/src`);
  const { aven, srcChecksum, ...restPkg } = info.pkg;
  const dependencies = { ...restPkg.dependencies };
  aven.moduleDependencies &&
    aven.moduleDependencies.forEach(moduleDep => {
      dependencies[moduleDep] = mainPkg.dependencies[moduleDep];
    });
  const newPkg = {
    ...restPkg,
    name: `@aven-cloud/${info.fileName}`,
    main: 'lib/commonjs/index.js',
    'react-native': 'src/index.tsx',
    module: 'lib/module/index.js',
    types: 'lib/typescript/index.d.ts',
    scripts: {
      prepare: 'bob build',
      clean: 'del lib',
    },
    '@react-native-community/bob': {
      source: 'src',
      output: 'lib',
      targets: ['commonjs', 'module', 'typescript'],
    },
    dependencies,
  };
  fs.writeFileSync(
    `packages/${info.fileName}/package.json`,
    JSON.stringify(newPkg, null, 2),
  );
  fs.writeFileSync(
    `packages/${info.fileName}/tsconfig.json`,
    JSON.stringify(
      {
        compilerOptions: {
          composite: true,
          declaration: true,
          emitDeclarationOnly: true,
          isolatedModules: false,
          outDir: 'dist',
          rootDir: 'src',
          allowUnreachableCode: false,
          allowUnusedLabels: false,
          esModuleInterop: true,
          forceConsistentCasingInFileNames: true,
          jsx: 'react',
          lib: ['esnext', 'dom'],
          module: 'esnext',
          moduleResolution: 'node',
          noFallthroughCasesInSwitch: true,
          noImplicitReturns: true,
          noImplicitUseStrict: false,
          noStrictGenericChecks: false,
          noUnusedLocals: true,
          noUnusedParameters: true,
          resolveJsonModule: true,
          skipLibCheck: true,
          strict: true,
          target: 'esnext',
          types: ['react', 'jest'],
        },
      },
      null,
      2,
    ),
  );
  fs.writeFileSync(
    `packages/${info.fileName}/.gitignore`,
    `*.jsbundle
*.tsbuildinfo
.DS_Store
.history
.jest
.vscode
build
coverage
dist
lib
node_modules
npm-debug.log*
yarn-debug.log*
yarn-error.log*`,
  );

  info.files.forEach(childFile => {
    if (childFile.match(/\.js$/)) {
      const inputFile = fs.readFileSync(`${info.fileName}/${childFile}`, {
        encoding: 'utf8',
      });
      const transformed = inputFile
        .split('\n')
        .map(fileLine => {
          if (IMPORT_MAP[fileLine]) {
            return IMPORT_MAP[fileLine];
          }
          return fileLine;
        })
        .join('\n');
      fs.writeFileSync(
        `packages/${info.fileName}/src/${childFile}`,
        transformed,
      );
    } else {
      fs.copySync(
        `${info.fileName}/${childFile}`,
        `packages/${info.fileName}/src/${childFile}`,
      );
    }
  });

  fs.removeSync(info.fileName);
});
