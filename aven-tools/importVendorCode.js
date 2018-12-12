const fs = require('fs-extra');
const pathJoin = require('path').join;
const pathRelative = require('path').relative;
const babel = require('babel-core');
const spawn = require('@expo/spawn-async');

const srcRoot = pathJoin(__dirname, '..');

const UNUSED_DISABLES_TO_STRIP = [
  '// eslint-disable-next-line no-unused-vars',
  '// eslint-disable-next-line import/no-commonjs',
  '/\\* eslint-disable import/no-commonjs \\*/',
];

function stripUnusedLintDisables(code) {
  /* eslint-disable import/no-commonjs */
  let exportedCode = code;
  UNUSED_DISABLES_TO_STRIP.forEach(stripStr => {
    exportedCode = exportedCode.replace(new RegExp(stripStr, 'g'), '');
  });
  return exportedCode;
}

function runTransform(input, vendedSrcDeps, fileDest) {
  const handledBabel = babel.transform(input, {
    sourceMaps: true,
    comments: true,
    parserOpts: {
      plugins: ['jsx', 'objectRestSpread', 'classProperties', 'flow'],
    },
    plugins: [
      ({ parse, traverse }) => ({
        visitor: {
          ImportDeclaration(path) {
            const sourceName = path.node.source.value;
            let vendedDep = null;
            let insideModulePath = '';
            Object.keys(vendedSrcDeps).forEach(possibleDepName => {
              if (sourceName.match(new RegExp('^' + possibleDepName))) {
                vendedDep = vendedSrcDeps[possibleDepName];
                insideModulePath = sourceName.slice(possibleDepName.length);
                // terrible hack because we copy out of the src dir into ./depname
                if (insideModulePath.match(/^\/src/)) {
                  insideModulePath = insideModulePath.slice('/src'.length);
                }
              }
            });
            if (vendedDep) {
              const destModule = pathJoin(srcRoot, vendedDep);
              const fileDestDir = pathJoin(fileDest, '..');
              const relativeModule = pathRelative(fileDestDir, destModule);
              path.node.source.value = relativeModule + insideModulePath;
            }
          },
        },
      }),
    ],
  });
  return stripUnusedLintDisables(handledBabel.code);
}

async function copyWithTransform(source, dest, vendedSrcDeps, file = '') {
  const fileSource = pathJoin(source, file);
  const fileDest = pathJoin(dest, file);
  const stat = await fs.stat(fileSource);
  if (stat.isDirectory()) {
    const files = await fs.readdir(fileSource);
    await fs.mkdirp(fileDest);
    await Promise.all(
      files.map(innerFile =>
        copyWithTransform(
          source,
          dest,
          vendedSrcDeps,
          pathJoin(file, innerFile),
        ),
      ),
    );
  } else {
    if (file.match(/\.DS_Store$/)) {
      return;
    }
    if (!file.match(/\.js$/)) {
      await fs.copy(fileSource, fileDest);
      return;
    }
    const sourceCode = await fs.readFile(fileSource);
    const transformedCode = runTransform(sourceCode, vendedSrcDeps, fileDest);
    await fs.writeFile(fileDest, transformedCode);
  }
}

async function vendUpstream(
  { moduleName, srcName, moduleSrcPath, ...upstreamSpec },
  vendedSrcDeps,
) {
  const destPath = pathJoin(srcRoot, srcName);
  const fullModuleSrcPath = pathJoin(
    srcRoot,
    'node_modules',
    moduleName,
    moduleSrcPath,
  );
  const srcRootPkg = JSON.parse(
    await fs.readFile(pathJoin(srcRoot, 'package.json')),
  );
  const modulePkgPath = pathJoin(
    srcRoot,
    'node_modules',
    moduleName,
    'package.json',
  );
  const srcPkg = JSON.parse(await fs.readFile(modulePkgPath));
  const peerDeps = new Set(Object.keys(srcPkg.peerDependencies || {}));
  const moduleDependencies = [
    ...Object.keys(srcPkg.dependencies || {}),
    // ...(upstreamSpec.moduleDependencies || []),
  ];
  const srcDependencies = [];
  const destPkg = {
    name: moduleName,
    aven: { srcDependencies, moduleDependencies },
  };
  moduleDependencies.forEach(depName => {
    const depVersion = srcPkg.dependencies[depName];
    const rootDepVersion = srcRootPkg.dependencies[depName];
    if (!rootDepVersion) {
      throw new Error(
        `Cannot find dependency ${depName} in root package! Expecting version ${depVersion}`,
      );
      // console.warn(`yarn add ${depName}@${depVersion}`);
    }
    if (rootDepVersion !== depVersion) {
      console.warn(
        `Version mismatch of ${depName}. Expecting ${depVersion}, observed ${rootDepVersion}`,
      );
    }
  });

  await copyWithTransform(fullModuleSrcPath, destPath, vendedSrcDeps);

  await fs.writeFile(
    pathJoin(destPath, 'package.json'),
    JSON.stringify(destPkg, null, 2),
  );
}

async function vendUpstreams(upstreams) {
  const vendedSrcDeps = {};
  upstreams.map(u => {
    vendedSrcDeps[u.moduleName] = u.srcName;
  });
  console.log(`🗄  Copying the following modules from your dependencies into this workspace:

${upstreams
    .map(u => `node_modules/${u.moduleName} -> ./${u.srcName}`)
    .join('\n')}

⚠️  - You are responsible for syncronizing workspace source with the original modules!`);
  await Promise.all(upstreams.map(u => vendUpstream(u, vendedSrcDeps)));
  await spawn('yarn', ['format'], { stdio: 'inherit' });
}

vendUpstreams([
  {
    moduleName: '@react-navigation/core',
    srcName: 'navigation-core',
    moduleSrcPath: 'src',
  },
  {
    moduleName: '@react-navigation/web',
    srcName: 'navigation-web',
    moduleSrcPath: 'src',
  },
  {
    moduleName: '@react-navigation/native',
    srcName: 'navigation-native',
    moduleSrcPath: 'src',
  },
  {
    moduleName: 'react-navigation-hooks',
    srcName: 'navigation-hooks',
    moduleSrcPath: 'src',
    moduleDependencies: ['@types/jest'],
  },
  {
    moduleName: 'react-navigation-stack',
    srcName: 'navigation-stack',
    moduleSrcPath: 'src',
  },
])
  .then(() => {
    console.log('✅ Done!');
  })
  .catch(console.error);
