import fss, { promises as fs } from 'fs';
import originalFs from 'original-fs';
import fse from 'fs-extra';
import axios from 'axios';
import { extractFull } from 'node-7z';
import jimp from 'jimp/es';
import makeDir from 'make-dir';
import { promisify } from 'util';
import { ipcRenderer } from 'electron';
import path from 'path';
import crypto from 'crypto';
import { exec, spawn } from 'child_process';
import {
  MC_LIBRARIES_URL,
  FABRIC,
  FORGE,
  LATEST_JAVA_VERSION
} from '../../../common/utils/constants';

import {
  removeDuplicates,
  sortByForgeVersionDesc
} from '../../../common/utils';
import {
  getAddonFile,
  mojangSessionServerUrl,
  elyBySkinSystemUrl
} from '../../../common/api';
import { downloadFile } from './downloader';

export const isDirectory = source =>
  fs.lstat(source).then(r => r.isDirectory());

export const getDirectories = async source => {
  const dirs = await fs.readdir(source);
  return Promise.all(
    dirs
      .map(name => path.join(source, name))
      .filter(isDirectory)
      .map(dir => path.basename(dir))
  );
};

export const mavenToArray = (s, nativeString, forceExt) => {
  const pathSplit = s.split(':');
  const fileName = pathSplit[3]
    ? `${pathSplit[2]}-${pathSplit[3]}`
    : pathSplit[2];
  const finalFileName = fileName.includes('@')
    ? fileName.replace('@', '.')
    : `${fileName}${nativeString || ''}${forceExt || '.jar'}`;
  const initPath = pathSplit[0]
    .split('.')
    .concat(pathSplit[1])
    .concat(pathSplit[2].split('@')[0])
    .concat(`${pathSplit[1]}-${finalFileName}`);
  return initPath;
};

export const convertOSToMCFormat = ElectronFormat => {
  switch (ElectronFormat) {
    case 'win32':
      return 'windows';
    case 'darwin':
      return 'osx';
    case 'linux':
      return 'linux';
    default:
      return false;
  }
};

export const convertOSToJavaFormat = ElectronFormat => {
  switch (ElectronFormat) {
    case 'win32':
      return 'windows';
    case 'darwin':
      return 'mac';
    case 'linux':
      return 'linux';
    default:
      return false;
  }
};

export const skipLibrary = lib => {
  let skip = false;
  if (lib.rules) {
    skip = true;
    lib.rules.forEach(({ action, os, features }) => {
      if (features) return true;
      if (
        action === 'allow' &&
        ((os && os.name === convertOSToMCFormat(process.platform)) || !os)
      ) {
        skip = false;
      }
      if (
        action === 'disallow' &&
        ((os && os.name === convertOSToMCFormat(process.platform)) || !os)
      ) {
        skip = true;
      }
    });
  }
  return skip;
};

export const librariesMapper = (libraries, librariesPath) => {
  return removeDuplicates(
    libraries
      .filter(v => !skipLibrary(v))
      .reduce((acc, lib) => {
        const tempArr = [];
        // Forge libs
        if (lib.downloads && lib.downloads.artifact) {
          let { url } = lib.downloads.artifact;
          // Handle special case for forge universal where the url is "".
          if (lib.downloads.artifact.url === '') {
            url = `https://files.minecraftforge.net/${mavenToArray(
              lib.name
            ).join('/')}`;
          }
          tempArr.push({
            url,
            path: path.join(librariesPath, lib.downloads.artifact.path),
            sha1: lib.downloads.artifact.sha1,
            name: lib.name
          });
        }

        const native = (
          (lib?.natives &&
            lib?.natives[convertOSToMCFormat(process.platform)]) ||
          ''
        ).replace(
          '${arch}', // eslint-disable-line no-template-curly-in-string
          '64'
        );

        // Vanilla native libs
        if (native && lib?.downloads?.classifiers[native]) {
          tempArr.push({
            url: lib.downloads.classifiers[native].url,
            path: path.join(
              librariesPath,
              lib.downloads.classifiers[native].path
            ),
            sha1: lib.downloads.classifiers[native].sha1,
            natives: true,
            name: lib.name
          });
        }
        if (tempArr.length === 0) {
          tempArr.push({
            url: `${lib.url || `${MC_LIBRARIES_URL}/`}${mavenToArray(
              lib.name,
              native && `-${native}`
            ).join('/')}`,
            path: path.join(librariesPath, ...mavenToArray(lib.name, native)),
            ...(native && { natives: true }),
            name: lib.name
          });
        }
        // Patch log4j versions https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2021-44228
        for (const k in tempArr) {
          if (tempArr[k]?.url?.includes('log4j')) {
            // Get rid of all log4j aside from official
            if (!tempArr[k].url.includes('libraries.minecraft.net')) {
              tempArr[k] = null;
              continue;
            }

            if (tempArr[k].url.includes('2.0-beta9')) {
              tempArr[k] = {
                url: tempArr[k].url
                  .replace(
                    'libraries.minecraft.net',
                    'cdn.gdlauncher.com/maven'
                  )
                  .replace(/2.0-beta9/g, '2.0-beta9-fixed'),
                path: tempArr[k].path.replace(/2.0-beta9/g, '2.0-beta9-fixed'),
                sha1: tempArr[k].url.includes('log4j-api')
                  ? 'b61eaf2e64d8b0277e188262a8b771bbfa1502b3'
                  : '677991ea2d7426f76309a73739cecf609679492c',
                name: tempArr[k].name
              };
            } else {
              const splitName = tempArr[k].name.split(':');
              splitName[splitName.length - 1] = '2.15.0';
              const patchedName = splitName.join(':');

              // Assuming we can use 2.15
              tempArr[k] = {
                url: `https://cdn.gdlauncher.com/maven/${mavenToArray(
                  patchedName,
                  native
                ).join(path.sep)}`,
                path: path.join(
                  librariesPath,
                  ...mavenToArray(patchedName, native)
                ),
                sha1: tempArr[k].url.includes('log4j-api')
                  ? '42319af9991a86b4475ab3316633a3d03e2d29e1'
                  : '9bd89149d5083a2a3ab64dcc88b0227da14152ec'
              };
            }
          }
        }

        return acc.concat(tempArr.filter(_ => _));
      }, []),
    'url'
  );
};

export const getFilteredVersions = (
  vanillaManifest,
  forgeManifest,
  fabricManifest
) => {
  const versions = [
    {
      value: 'vanilla',
      label: 'Vanilla',
      children: [
        {
          value: 'release',
          label: 'Releases',
          children: vanillaManifest.versions
            .filter(v => v.type === 'release')
            .map(v => ({
              value: v.id,
              label: v.id
            }))
        },
        {
          value: 'snapshot',
          label: 'Snapshots',
          children: vanillaManifest.versions
            .filter(v => v.type === 'snapshot')
            .map(v => ({
              value: v.id,
              label: v.id
            }))
        },
        {
          value: 'old_beta',
          label: 'Old Beta',
          children: vanillaManifest.versions
            .filter(v => v.type === 'old_beta')
            .map(v => ({
              value: v.id,
              label: v.id
            }))
        },
        {
          value: 'old_alpha',
          label: 'Old Alpha',
          children: vanillaManifest.versions
            .filter(v => v.type === 'old_alpha')
            .map(v => ({
              value: v.id,
              label: v.id
            }))
        }
      ]
    },
    {
      value: 'forge',
      label: 'Forge',
      children: Object.entries(forgeManifest).map(([k, v]) => ({
        value: k,
        label: k,
        children: v.sort(sortByForgeVersionDesc).map(child => ({
          value: child,
          label: child.split('-')[1]
        }))
      }))
    },
    {
      value: 'fabric',
      label: 'Fabric',
      children: [
        {
          value: 'release',
          label: 'Releases',
          children: fabricManifest.game
            .filter(v => v.stable)
            .map(v => ({
              value: v.version,
              label: v.version,
              children: fabricManifest.loader.map(c => ({
                value: c.version,
                label: c.version
              }))
            }))
        },
        {
          value: 'snapshot',
          label: 'Snapshots',
          children: fabricManifest.game
            .filter(v => !v.stable)
            .map(v => ({
              value: v.version,
              label: v.version,
              children: fabricManifest.loader.map(c => ({
                value: c.version,
                label: c.version
              }))
            }))
        }
      ]
    }
  ];
  return versions;
};

export const isLatestJavaDownloaded = async (
  meta,
  userData,
  retry,
  version = 8
) => {
  const javaOs = convertOSToJavaFormat(process.platform);
  let log = null;

  const isJavaLatest = version === LATEST_JAVA_VERSION;

  const manifest = isJavaLatest ? meta.javaLatest : meta.java;

  const javaMeta = manifest.find(
    v =>
      v.os === javaOs &&
      v.architecture === 'x64' &&
      (v.binary_type === 'jre' || v.binary_type === 'jdk')
  );
  const javaFolder = path.join(
    userData,
    'java',
    javaMeta.version_data.openjdk_version
  );
  // Check if it's downloaded, if it's latest version and if it's a valid download
  let isValid = true;

  const javaExecutable = path.join(
    javaFolder,
    'bin',
    `java${javaOs === 'windows' ? '.exe' : ''}`
  );
  try {
    await fs.access(javaFolder);
    log = await promisify(exec)(`"${javaExecutable}" -version`);
  } catch (err) {
    if (retry) {
      if (process.platform !== 'win32') {
        try {
          await promisify(exec)(`chmod +x "${javaExecutable}"`);
          await promisify(exec)(`chmod 755 "${javaExecutable}"`);
        } catch {
          // swallow error
        }
      }

      return isLatestJavaDownloaded(meta, userData, null, version);
    }

    isValid = false;
  }
  // Return stderr because that garbage of a language which is java
  // outputs the result of the version command to the error stream
  // https://stackoverflow.com/questions/13483443/why-does-java-version-go-to-stderr
  return { isValid, log: log?.stderr };
};

export const get7zPath = async () => {
  // Get userData from ipc because we can't always get this from redux
  let baseDir = await ipcRenderer.invoke('getExecutablePath');
  const isDev = process.env.NODE_ENV === 'development';
  if (isDev) {
    baseDir = path.resolve(baseDir, '../../');
    if (process.platform === 'win32') {
      baseDir = path.join(baseDir, '7zip-bin/win/x64');
    } else if (process.platform === 'linux') {
      baseDir = path.join(baseDir, '7zip-bin/linux/x64');
    } else if (process.platform === 'darwin') {
      baseDir = path.resolve(baseDir, '../../../', '7zip-bin/mac/x64');
    }
  }
  if (process.platform === 'linux') {
    return path.join(baseDir, '7za');
  }
  if (process.platform === 'darwin') {
    return path.resolve(baseDir, isDev ? '' : '../', '7za');
  }
  return path.join(baseDir, '7za.exe');
};

get7zPath();

export const extractAll = async (
  source,
  destination,
  args = {},
  funcs = {}
) => {
  const sevenZipPath = await get7zPath();
  const extraction = extractFull(source, destination, {
    ...args,
    yes: true,
    $bin: sevenZipPath,
    $spawnOptions: { shell: true }
  });
  let extractedParentDir = null;
  await new Promise((resolve, reject) => {
    if (funcs.progress) {
      extraction.on('progress', ({ percent }) => {
        funcs.progress(percent);
      });
    }
    extraction.on('data', data => {
      if (!extractedParentDir) {
        [extractedParentDir] = data.file.split('/');
      }
    });
    extraction.on('end', () => {
      funcs.end?.();
      resolve(extractedParentDir);
    });
    extraction.on('error', err => {
      funcs.error?.();
      reject(err);
    });
  });
  return { extraction, extractedParentDir };
};

export const extractNatives = async (libraries, instancePath) => {
  const extractLocation = path.join(instancePath, 'natives');
  await Promise.all(
    libraries
      .filter(l => l.natives)
      .map(async l => {
        await extractAll(l.path, extractLocation, {
          $raw: ['-xr!META-INF']
        });
      })
  );
};

export const copyAssetsToResources = async assets => {
  await Promise.all(
    assets.map(async asset => {
      try {
        await fs.access(asset.resourcesPath);
      } catch {
        await makeDir(path.dirname(asset.resourcesPath));
        await fs.copyFile(asset.path, asset.resourcesPath);
      }
    })
  );
};

export const copyAssetsToLegacy = async assets => {
  await Promise.all(
    assets.map(async asset => {
      try {
        await fs.access(asset.legacyPath);
      } catch {
        await makeDir(path.dirname(asset.legacyPath));
        await fs.copyFile(asset.path, asset.legacyPath);
      }
    })
  );
};

const getFileContent = async (srcPath, callback) => {
  fss.readFile(srcPath, 'utf8', (err, data) => {
    if (err) throw err;
    callback(data);
  });
};

export const addGlobalSettings = async (instancePath, settings) => {
  const filePath = `${instancePath}/options.txt`;

  const {
    fullscreen,
    autoJump,
    guiScale,
    fov,
    fps,
    renderDistance,
    soundCategoryMaster,
    soundCategoryMusik,
    soundCategoryJukebox,
    soundCategoryWeather,
    soundCategoryBlocks,
    soundCategoryHostile,
    soundCategoryNeutral,
    soundCategoryPlayer,
    soundCategoryAmbient,
    soundCategoryVoice,
    vsync,
    muteAllSounds
  } = settings;

  let data =
    `fullscreen:${fullscreen}\n` +
    `autoJump:${autoJump}\n` +
    `guiScale:${guiScale}\n` +
    `fov:${fov}\n` +
    `maxFps:${fps}\n` +
    `renderDistance:${renderDistance}\n` +
    `enableVsync:${vsync}\n`;

  if (!muteAllSounds) {
    data +=
      `soundCategory_master:${soundCategoryMaster}\n` +
      `soundCategory_music:${soundCategoryMusik}\n` +
      `soundCategory_record:${soundCategoryJukebox}\n` +
      `soundCategory_weather:${soundCategoryWeather}\n` +
      `soundCategory_blocks:${soundCategoryBlocks}\n` +
      `soundCategory_hostile:${soundCategoryHostile}\n` +
      `soundCategory_neutral:${soundCategoryNeutral}\n` +
      `soundCategory_player:${soundCategoryPlayer}\n` +
      `soundCategory_ambient:${soundCategoryAmbient}\n` +
      `soundCategory_voice:${soundCategoryVoice}`;
  } else {
    data +=
      `soundCategory_master:0\n` +
      `soundCategory_music:0\n` +
      `soundCategory_record:0\n` +
      `soundCategory_weather:0\n` +
      `soundCategory_blocks:0\n` +
      `soundCategory_hostile:0\n` +
      `soundCategory_neutral:0\n` +
      `soundCategory_player:0\n` +
      `soundCategory_ambient:0\n` +
      `soundCategory_voice:0`;
  }

  if (!fss.existsSync(filePath)) {
    await fss.writeFile(filePath, data, _err => {
      // In case of a error throw err.
      if (_err) throw _err;
    });
  } else {
    let newData;
    getFileContent(filePath, _data => {
      const splitted = data.split('\n');
      for (let i = 0; i < splitted.length; i += 1) {
        const regex = new RegExp(`(?=${splitted[i].split(':')[0]}).*(?=\n)`);
        newData = _data.replace(regex, splitted[i]);
      }

      fss.writeFile(filePath, newData, err => {
        if (err) throw err;
      });
    });
  }
};

const hiddenToken = '__HIDDEN_TOKEN__';
export const getJVMArguments112 = (
  libraries,
  mcjar,
  instancePath,
  assetsPath,
  mcJson,
  account,
  memory,
  resolution,
  hideAccessToken,
  jvmOptions = []
) => {
  const args = [];
  args.push('-cp');

  args.push(
    [...libraries, mcjar]
      .filter(l => !l.natives)
      .map(l => `"${l.path}"`)
      .join(process.platform === 'win32' ? ';' : ':')
  );

  // if (process.platform === "darwin") {
  //   args.push("-Xdock:name=instancename");
  //   args.push("-Xdock:icon=instanceicon");
  // }

  args.push(`-Xmx${memory}m`);
  args.push(`-Xms${memory}m`);
  args.push(...jvmOptions);
  args.push(`-Djava.library.path="${path.join(instancePath, 'natives')}"`);
  args.push(`-Dminecraft.applet.TargetDirectory="${instancePath}"`);
  if (mcJson.logging) {
    args.push(mcJson?.logging?.client?.argument || '');
  }

  args.push(mcJson.mainClass);

  const mcArgs = mcJson.minecraftArguments.split(' ');
  const argDiscovery = /\${*(.*)}/;

  for (let i = 0; i < mcArgs.length; i += 1) {
    if (argDiscovery.test(mcArgs[i])) {
      const identifier = mcArgs[i].match(argDiscovery)[1];
      let val = null;
      switch (identifier) {
        case 'auth_player_name':
          val = account.selectedProfile.name.trim();
          break;
        case 'version_name':
          val = mcJson.id;
          break;
        case 'game_directory':
          val = `"${instancePath}"`;
          break;
        case 'assets_root':
          val = `"${assetsPath}"`;
          break;
        case 'game_assets':
          val = `"${path.join(assetsPath, 'virtual', 'legacy')}"`;
          break;
        case 'assets_index_name':
          val = mcJson.assets;
          break;
        case 'auth_uuid':
          val = account.selectedProfile.id.trim();
          break;
        case 'auth_access_token':
          val = hideAccessToken ? hiddenToken : account.accessToken;
          break;
        case 'auth_session':
          val = hideAccessToken ? hiddenToken : account.accessToken;
          break;
        case 'user_type':
          val = 'mojang';
          break;
        case 'version_type':
          val = mcJson.type;
          break;
        case 'user_properties':
          val = '{}';
          break;
        default:
          break;
      }
      if (val != null) {
        mcArgs[i] = val;
      }
    }
  }

  args.push(...mcArgs);

  if (resolution) {
    args.push(`--width ${resolution.width}`);
    args.push(`--height ${resolution.height}`);
  }

  return args;
};

export const getJVMArguments113 = (
  libraries,
  mcjar,
  instancePath,
  assetsPath,
  mcJson,
  account,
  memory,
  resolution,
  hideAccessToken,
  jvmOptions = []
) => {
  const argDiscovery = /\${*(.*)}/;
  let args = mcJson.arguments.jvm.filter(v => !skipLibrary(v));

  // if (process.platform === "darwin") {
  //   args.push("-Xdock:name=instancename");
  //   args.push("-Xdock:icon=instanceicon");
  // }

  args.push(`-Xmx${memory}m`);
  args.push(`-Xms${memory}m`);
  args.push(`-Dminecraft.applet.TargetDirectory="${instancePath}"`);
  if (mcJson.logging) {
    args.push(mcJson?.logging?.client?.argument || '');
  }
  args.push(...jvmOptions);

  // Eventually inject additional arguments (from 1.17 (?))
  if (mcJson?.forge?.arguments?.jvm) {
    args.push(...mcJson.forge.arguments.jvm);
  }

  args.push(mcJson.mainClass);

  args.push(...mcJson.arguments.game.filter(v => !skipLibrary(v)));

  for (let i = 0; i < args.length; i += 1) {
    if (typeof args[i] === 'object' && args[i].rules) {
      if (typeof args[i].value === 'string') {
        args[i] = `"${args[i].value}"`;
      } else if (typeof args[i].value === 'object') {
        args.splice(i, 1, ...args[i].value.map(v => `"${v}"`));
      }
      i -= 1;
    } else if (typeof args[i] === 'string') {
      if (argDiscovery.test(args[i])) {
        const identifier = args[i].match(argDiscovery)[1];
        let val = null;
        switch (identifier) {
          case 'auth_player_name':
            val = account.selectedProfile.name.trim();
            break;
          case 'version_name':
            val = mcJson.id;
            break;
          case 'game_directory':
            val = `"${instancePath}"`;
            break;
          case 'assets_root':
            val = `"${assetsPath}"`;
            break;
          case 'assets_index_name':
            val = mcJson.assets;
            break;
          case 'auth_uuid':
            val = account.selectedProfile.id.trim();
            break;
          case 'auth_access_token':
            val = hideAccessToken ? hiddenToken : account.accessToken;
            break;
          case 'user_type':
            val = 'mojang';
            break;
          case 'version_type':
            val = mcJson.type;
            break;
          case 'resolution_width':
            val = 800;
            break;
          case 'resolution_height':
            val = 600;
            break;
          case 'natives_directory':
            val = args[i].replace(
              argDiscovery,
              `"${path.join(instancePath, 'natives')}"`
            );
            break;
          case 'launcher_name':
            val = args[i].replace(argDiscovery, 'rPLauncher');
            break;
          case 'launcher_version':
            val = args[i].replace(argDiscovery, '1.0');
            break;
          case 'classpath':
            val = [...libraries, mcjar]
              .filter(l => !l.natives)
              .map(l => `"${l.path}"`)
              .join(process.platform === 'win32' ? ';' : ':');
            break;
          default:
            break;
        }
        if (val !== null) {
          args[i] = val;
        }
      }
    }
  }

  if (resolution) {
    args.push(`--width ${resolution.width}`);
    args.push(`--height ${resolution.height}`);
  }

  args = args.filter(arg => {
    return arg != null;
  });

  return args;
};

export const readJarManifest = async (jarPath, property) => {
  const { extraction: list } = await extractAll(jarPath, '.', {
    toStdout: true,
    $cherryPick: 'META-INF/MANIFEST.MF'
  });

  if (list.info.has(property)) return list.info.get(property);
  return null;
};

export const patchForge113 = async (
  forgeJson,
  mainJar,
  librariesPath,
  installerPath,
  mcJsonPath,
  universalPath,
  javaPath,
  updatePercentage
) => {
  const { processors } = forgeJson;
  const replaceIfPossible = arg => {
    const finalArg = arg.replace('{', '').replace('}', '');
    if (forgeJson.data[finalArg]) {
      // Handle special case
      if (finalArg === 'BINPATCH') {
        return `"${path
          .join(librariesPath, ...mavenToArray(forgeJson.path || universalPath))
          .replace('.jar', '-clientdata.lzma')}"`;
      }
      // Return replaced string
      return forgeJson.data[finalArg].client;
    }
    // Fix forge madness
    return arg
      .replace('{SIDE}', `client`)
      .replace('{ROOT}', `"${path.dirname(installerPath)}"`)
      .replace('{MINECRAFT_JAR}', `"${mainJar}"`)
      .replace('{MINECRAFT_VERSION}', `"${mcJsonPath}"`)
      .replace('{INSTALLER}', `"${installerPath}"`)
      .replace('{LIBRARY_DIR}', `"${librariesPath}"`);
  };
  const computePathIfPossible = arg => {
    if (arg[0] === '[') {
      return `"${path.join(
        librariesPath,
        ...mavenToArray(arg.replace('[', '').replace(']', ''))
      )}"`;
    }
    return arg;
  };

  let counter = 1;
  /* eslint-disable no-await-in-loop, no-restricted-syntax */
  for (const key in processors) {
    if (Object.prototype.hasOwnProperty.call(processors, key)) {
      const p = processors[key];
      if (p?.sides && !(p?.sides || []).includes('client')) {
        continue;
      }
      const filePath = path.join(librariesPath, ...mavenToArray(p.jar));
      const args = p.args
        .map(arg => replaceIfPossible(arg))
        .map(arg => computePathIfPossible(arg));

      const classPaths = p.classpath.map(
        cp => `"${path.join(librariesPath, ...mavenToArray(cp))}"`
      );

      const mainClass = await readJarManifest(filePath, 'Main-Class');

      await new Promise(resolve => {
        const ps = spawn(
          `"${javaPath}"`,
          [
            '-classpath',
            [`"${filePath}"`, ...classPaths].join(path.delimiter),
            mainClass,
            ...args
          ],
          { shell: true }
        );

        ps.stdout.on('data', data => {
          console.log(data.toString());
        });

        ps.stderr.on('data', data => {
          console.error(`ps stderr: ${data}`);
        });

        ps.on('close', code => {
          if (code !== 0) {
            console.log(`process exited with code ${code}`);
            resolve();
          }
          resolve();
        });
      });
      updatePercentage(counter, processors.length);
      counter += 1;
    }
  }
  /* eslint-enable no-await-in-loop, no-restricted-syntax */
};

export const importAddonZip = async (
  zipPath,
  instancePath,
  instanceTempPath,
  tempPath
) => {
  const tempZipFile = path.join(instanceTempPath, 'addon.zip');
  await makeDir(instanceTempPath);
  if (zipPath.includes(tempPath)) {
    await fse.move(zipPath, tempZipFile);
  } else {
    await fse.copyFile(zipPath, tempZipFile);
  }
  const instanceManifest = path.join(instancePath, 'manifest.json');
  // Wait 500ms to avoid `The process cannot access the file because it is being used by another process.`
  await new Promise(resolve => {
    setTimeout(() => resolve(), 500);
  });

  await extractAll(tempZipFile, instancePath, {
    yes: true,
    $cherryPick: 'manifest.json'
  });
  const manifest = await fse.readJson(instanceManifest);
  return manifest;
};

export const downloadAddonZip = async (id, fileID, instancePath, tempPath) => {
  const data = await getAddonFile(id, fileID);
  const instanceManifest = path.join(instancePath, 'manifest.json');
  const zipFile = path.join(tempPath, 'addon.zip');
  await downloadFile(zipFile, data.downloadUrl);
  // Wait 500ms to avoid `The process cannot access the file because it is being used by another process.`
  await new Promise(resolve => {
    setTimeout(() => resolve(), 500);
  });

  await extractAll(zipFile, instancePath, {
    yes: true,
    $cherryPick: 'manifest.json'
  });
  const manifest = await fse.readJson(instanceManifest);
  return manifest;
};

const defaultskin =
  'iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAMAAACdt4HsAAAA6lBMVEUAAADlmUfljT/YgDLckzzonUyqiV6ce1DfxqPr07Py2rrky6n7+/sjYiTy3cLu1rbv2bvy273u17nvu7FkQSwoKCh6tXeGh2FoRTB6r3fYupR5VT2AWkBtSjOMvop9snqBtX+LuohyTjZvTDWKi2aMjWh3r3WAglqHiWKPkGuGXkZ9tHrkyag7Ozt4VDxGRkZJSUlaWlpdXV1NTU1XV1fp0K/s1Ljky6phYWFra2vp0bPv2b3ly63v2r8YOBYaPxlPgEx3sHRSUlJjY2NKSkpQUFDy38jq1LhcXFw/Pz9wcHBISEhMTEx1UDg5NQK9AAAAAXRSTlMAQObYZgAAAypJREFUeNqczkd2A0EQw1ADU5RdbWXd/67K6wnY8z/+fANBnD79rE2EItO0e7QBoIIl0+730W7DgwpgbQeMmPrbCiAWyWagFPABPNsABBNTf59WXA9JRBRBxCAicRaQ71QK/GoJJjILJCIBqW6MGkxiWAJQkCqqqsf/P1CYYAziLFBAddf//jCOh/1/CYgIgcwDpvo4xuk8juNyHV0I0aCBWUBCj+PxMb/dxuhjl0hUAs4CSD8fjIfwdLoEEQP3dsujK3IYCMJkkA46eT0SNu2RTc5RRHvImf//d7Z6Ld56nmDiderSrcfU12qSCtebGkQR9Af6PsetWWh+WntNeRljlsXyQABodno+AMSDA5aWWj8CxLIYCCCkxHciXCEEgBobnaQrOtIRUZbFOBMD+Ffx358J/1jbFtMN2Yw/bsk2pxuj8ySBX0dFmuYxf3AVAMk/RWP476TdthbTY5sRf9laagJgLVKd1zXJDQOyNSHwa8CmNkQWAFzNEhdD3YAIs3XSBVgnWlubnsc6JibL9sxubG5utLZavjQBULG9XXDVEE8CIKP5HVzbA4hoFxJC+NIA7O3tRXp/X0doDiCDqRlc7DOQxYFP7JOSEUIK2QAcHh7uHR0fH+2hOTk9PWEAUY3gdTDd4kjwA3Am3LmTUjUB0MXl5QVXBsQQ0Tp7AOAeLQ5OOHEl5bW7KaW86gLs1YC9GlB1qs4tAOtEtx3uie5wuHXQlVKudE6p5g1OTu73jh4ejvbuT04en54esYGpqgreqmNwBVTmdJwrS6WeGfCsXroBr3yD1wbA8trWkuGeV0Bflq58flYl6nPXDd7e3l4f3t8fXtF8fH5+mBgm/QVpW8OIZd01AFjBecBEE0000Uh5Yd4/6yMDpufHBczwsz4GYCYeAsA5YSVNNNci48cFL7x/5WhmkOlw6iTJv/MCjPPTAAS5oBcg12nx/7nnXJAFuaDH/gDwBh4Q5ILeCvNCkAt6K8wLQS7orTAv8FwJghM+F/RWmBdgvL5iwM1AgDAv+FxQlwEAQV7g51ipq7oMAAjyQslO5AIQ1PNzT+vPeaEUiCQ+2vwE+AvPvqCUbKfGoQAAAABJRU5ErkJggg==';

const getBase64 = url => {
  return axios
    .get(url, {
      responseType: 'arraybuffer'
    })
    .then(response => Buffer.from(response.data, 'binary').toString('base64'));
};

export const mojangPlayerSkinService = async uuid => {
  let skin = defaultskin;
  try {
    const playerSkin = await mojangSessionServerUrl('profile', uuid);
    if (playerSkin.status === 204) return skin;
    const data = playerSkin;
    const base64 = data.properties[0].value;
    const decoded = JSON.parse(Buffer.from(base64, 'base64').toString());

    if (decoded?.textures?.SKIN?.url)
      skin = await getBase64(decoded?.textures?.SKIN?.url);
  } catch (error) {
    console.error(error);
  }
  return skin;
};

export const elyByPlayerSkinService = async name => {
  let skin = defaultskin;
  try {
    const playerTexture = await elyBySkinSystemUrl('textures', name);
    if (playerTexture.status === 204) return skin;
    const data = playerTexture;

    if (data?.SKIN?.url) {
      skin = await getBase64(data?.SKIN?.url);
    }
  } catch (error) {
    console.error(error);
  }
  return skin;
};

const isBase64 = text => {
  try {
    return Buffer.from(text, 'base64').toString('base64') === text;
  } catch (_) {
    return false;
  }
};

export const extractFace = async buffer => {
  const face = await jimp.read(
    isBase64(buffer) ? Buffer.from(buffer, 'base64') : buffer
  );
  const hat = await jimp.read(
    isBase64(buffer) ? Buffer.from(buffer, 'base64') : buffer
  );

  face.crop(8, 8, 8, 8);
  hat.crop(40, 8, 8, 8);
  face.scale(10, jimp.RESIZE_NEAREST_NEIGHBOR);
  hat.scale(10, jimp.RESIZE_NEAREST_NEIGHBOR);
  face.composite(hat, 0, 0);
  const ImageBuffer = await face.getBufferAsync(jimp.MIME_PNG);
  return ImageBuffer.toString('base64');
};

export const normalizeModData = (data, projectID, modName) => {
  const temp = data;
  temp.name = modName;
  if (data.fileFingerprint) {
    temp.packageFingerprint = data.fileFingerprint;
  }
  if (data.projectID && data.fileID) return temp;
  if (data.id) {
    temp.projectID = projectID;
    temp.fileID = data?.file?.id || data.id;
  }
  return temp;
};

export const reflect = p =>
  p.then(
    v => ({ v, status: true }),
    e => ({ e, status: false })
  );

export const convertCompletePathToInstance = (f, instancesPath) => {
  const escapeRegExp = stringToGoIntoTheRegex => {
    return stringToGoIntoTheRegex.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
  };

  return f.replace(new RegExp(escapeRegExp(instancesPath), 'gi'), '');
};

export const isMod = (fileName, instancesPath) =>
  /^(\\|\/)([\w\d-.{}()[\]@#$%^&!\s])+((\\|\/)mods((\\|\/)(.*))(\.jar|\.disabled))$/.test(
    convertCompletePathToInstance(fileName, instancesPath)
  );

export const isInstanceFolderPath = (f, instancesPath) =>
  /^(\\|\/)([\w\d-.{}()[\]@#$%^&!\s])+$/.test(
    convertCompletePathToInstance(f, instancesPath)
  );

export const isFileModFabric = file => {
  return (
    (file.gameVersions.includes('Fabric') ||
      file.modules.find(v => v.foldername === 'fabric.mod.json')) &&
    !file.gameVersions.includes('Forge')
  );
};

export const filterFabricFilesByVersion = (files, version) => {
  return files.filter(v => {
    if (Array.isArray(v.gameVersions)) {
      return v.gameVersions.includes(version) && isFileModFabric(v);
    }
    return v.gameVersions === version;
  });
};

export const filterForgeFilesByVersion = (files, version) => {
  return files.filter(v => {
    if (Array.isArray(v.gameVersions)) {
      return v.gameVersions.includes(version) && !isFileModFabric(v);
    }
    return v.gameVersions === version;
  });
};

export const getFirstPreferredCandidate = (files, release) => {
  let counter = release || 1;

  let latestFile = null;
  while (counter <= 3 && !latestFile) {
    const c = counter;
    const latest = files.find(v => v.releaseType <= c);
    if (latest) {
      latestFile = latest;
    }
    counter += 1;
  }
  return latestFile;
};

export const getFileHash = async (filePath, algorithm = 'sha1') => {
  // Calculate sha1 on original file
  const shasum = crypto.createHash(algorithm);

  const s = originalFs.ReadStream(filePath);
  s.on('data', data => {
    shasum.update(data);
  });

  const hash = await new Promise(resolve => {
    s.on('end', () => {
      resolve(shasum.digest('hex'));
    });
  });
  return hash;
};

export const getFilesRecursive = async dir => {
  const subdirs = await originalFs.promises.readdir(dir);
  const files = await Promise.all(
    subdirs.map(async subdir => {
      const res = path.resolve(dir, subdir);
      return (await originalFs.promises.stat(res)).isDirectory()
        ? getFilesRecursive(res)
        : res;
    })
  );
  return files.reduce((a, f) => a.concat(f), []);
};

export const extractFabricVersionFromManifest = manifest => {
  // Backwards compatability for manifest entries that use the `yarn`
  // property to set the fabric loader version. Newer manifests use the
  // format `fabric-<version>` in the id.
  let loaderVersion = manifest?.minecraft?.modLoaders[0]?.yarn;
  if (!loaderVersion) {
    loaderVersion = manifest?.minecraft?.modLoaders[0]?.id?.split('-', 2)[1];
  }
  return loaderVersion;
};

export const convertcurseForgeToCanonical = (
  curseForge,
  mcVersion,
  forgeManifest
) => {
  const patchedCurseForge = curseForge.replace('forge-', '');
  const forgeEquivalent = forgeManifest[mcVersion].find(v => {
    return v.split('-')[1] === patchedCurseForge;
  });
  return forgeEquivalent;
};

export const getPatchedInstanceType = instance => {
  const isForge = instance.loader?.loaderType === FORGE;
  const hasJumpLoader = (instance.mods || []).find(v => v.projectID === 361988);
  if (isForge && !hasJumpLoader) {
    return FORGE;
  }
  return FABRIC;
};
