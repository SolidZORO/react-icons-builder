#!/usr/bin/env node

/*
 eslint-disable

 file fork by https://github.com/react-icons/react-icons/blob/master/packages/react-icons/scripts/logics.js
*/
const cheerio = require('cheerio');
const glob = require('glob-promise');
const path = require('path');
const fs = require('fs');
const { promisify } = require('util');
const camelcase = require('camelcase');

const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');

const argv = { src: '', dist: '', ...yargs(hideBin(process.argv)).argv };
// console.log('ARGV', argv);

if (!argv.src || !argv.dist) {
  console.error('⚠️  Missing argv `--src` or `--dist`');
  console.error('⚠️  e.g. node build.js --src ./__test__/ti --dist ./dist/react-icons-ext');
  return;
}

const CWD_DIR = process.cwd();
const SRC_DIR = path.resolve(CWD_DIR, argv.src);
const DIST_DIR = path.resolve(CWD_DIR, argv.dist);

const { icons } = require(SRC_DIR);

async function getIconFiles(content) {
  return glob(content.files);
}

async function convertIconData(svg, multiColor) {
  const $svg = cheerio.load(svg, { xmlMode: true })('svg');

  // filter/convert attributes
  // 1. remove class attr
  // 2. convert to camelcase ex: fill-opacity => fillOpacity
  const attrConverter = (
    /** @type {{[key: string]: string}} */ attribs,
    /** @type string */ tagName,
  ) =>
    attribs &&
    Object.keys(attribs)
      .filter(
        (name) =>
          ![
            'class',
            ...(tagName === 'svg' ? ['xmlns', 'xmlns:xlink', 'xml:space', 'width', 'height'] : []), // if tagName is svg remove size attributes
          ].includes(name),
      )
      .reduce((obj, name) => {
        const newName = camelcase(name);
        switch (newName) {
          case 'fill':
            if (attribs[name] === 'none' || attribs[name] === 'currentColor' || multiColor) {
              obj[newName] = attribs[name];
            }
            break;
          default:
            obj[newName] = attribs[name];
            break;
        }
        return obj;
      }, {});

  // convert to [ { tag: 'path', attr: { d: 'M436 160c6.6 ...', ... }, child: { ... } } ]
  const elementToTree = (/** @type {Cheerio} */ element) =>
    element
      .filter((_, e) => e.tagName && !['style'].includes(e.tagName))
      .map((_, e) => ({
        tag: e.tagName,
        attr: attrConverter(e.attribs, e.tagName),
        child:
          e.children && e.children.length ? elementToTree(cheerio.default(e.children)) : undefined,
      }))
      .get();

  const tree = elementToTree($svg);
  return tree[0]; // like: [ { tag: 'path', attr: { d: 'M436 160c6.6 ...', ... }, child: { ... } } ]
}

function generateIconRow(icon, formattedName, iconData, type = 'module') {
  switch (type) {
    case 'module':
      return (
        `export function ${formattedName} (props) {\n` +
        `  return GenIcon(${JSON.stringify(iconData)})(props);\n` +
        `};\n`
      );
    case 'common':
      return (
        `module.exports.${formattedName} = function ${formattedName} (props) {\n` +
        `  return GenIcon(${JSON.stringify(iconData)})(props);\n` +
        `};\n`
      );
    case 'dts':
      return `export declare const ${formattedName}: IconType;\n`;
  }
}

function generateIconsEntry(iconId, type = 'module') {
  switch (type) {
    case 'module':
      return `export * from './${iconId}';\n`;
    case 'dts':
      return `export * from './${iconId}';\n`;
  }
}

async function dirInit() {
  const ignore = (err) => {
    if (err.code === 'EEXIST') return;
    throw err;
  };

  const mkdir = promisify(fs.mkdir);
  const writeFile = promisify(fs.writeFile);

  await mkdir(DIST_DIR).catch(ignore);

  const write = (filePath, str) =>
    writeFile(path.resolve(DIST_DIR, ...filePath), str, 'utf8').catch(ignore);

  // const initFiles = ['index.d.ts', 'index.esm.js', 'index.js', 'all.js', 'all.d.ts'];
  // const initFiles = ['index.d.ts', 'index.esm.js', 'index.js'];

  for (const icon of icons) {
    await mkdir(path.resolve(DIST_DIR, icon.id)).catch(ignore);

    await write(
      [icon.id, 'index.js'],
      "// THIS FILE IS AUTO GENERATED\nvar GenIcon = require('react-icons/lib').GenIcon\n",
    );
    await write(
      [icon.id, 'index.esm.js'],
      "// THIS FILE IS AUTO GENERATED\nimport { GenIcon } from 'react-icons/lib';\n",
    );
    await write(
      [icon.id, 'index.d.ts'],
      "import { IconTree, IconType } from 'react-icons/lib'\n// THIS FILE IS AUTO GENERATED\n",
    );
    await write(
      [icon.id, 'package.json'],
      `${JSON.stringify(
        {
          sideEffects: false,
          module: './index.esm.js',
        },
        null,
        2,
      )}\n`,
    );
  }

  // for (const file of initFiles) {
  //   await write([file], '// THIS FILE IS AUTO GENERATED\n');
  // }
}

async function writeIconModule(icon) {
  const appendFile = promisify(fs.appendFile);
  const exists = new Set(); // for remove duplicate
  for (const content of icon.contents) {
    const files = await getIconFiles(content);

    for (const file of files) {
      const svgStr = await promisify(fs.readFile)(file, 'utf8');
      const iconData = await convertIconData(svgStr, content.multiColor);

      const rawName = path.basename(file, path.extname(file));
      const pascalName = camelcase(rawName, { pascalCase: true });
      const name = (content.formatter && content.formatter(pascalName)) || pascalName;
      if (exists.has(name)) continue;
      exists.add(name);

      // write like: module/fa/index.esm.js
      const modRes = generateIconRow(icon, name, iconData, 'module');
      await appendFile(path.resolve(DIST_DIR, icon.id, 'index.esm.js'), modRes, 'utf8');
      const comRes = generateIconRow(icon, name, iconData, 'common');
      await appendFile(path.resolve(DIST_DIR, icon.id, 'index.js'), comRes, 'utf8');
      const dtsRes = generateIconRow(icon, name, iconData, 'dts');
      await appendFile(path.resolve(DIST_DIR, icon.id, 'index.d.ts'), dtsRes, 'utf8');

      exists.add(file);
    }
  }
}

async function main() {
  try {
    await dirInit();

    for (const icon of icons) {
      await writeIconModule(icon);
    }
    console.log(`\n✅  ${icons.length} Icons Build at >>>> ${DIST_DIR}\n`);
  } catch (e) {
    console.error(e);
  }
}

main();
