const path = require('path');
const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '..');

function escapePath(value) {
  return value.replace(/[/\\]/g, '[/\\\\]');
}

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
  watchFolders: [workspaceRoot],
  resolver: {
    blockList: [
      new RegExp(
        `${escapePath(path.resolve(workspaceRoot, 'node_modules/react-native'))}.*`,
      ),
    ],
    nodeModulesPaths: [
      path.resolve(projectRoot, 'node_modules'),
      path.resolve(workspaceRoot, 'node_modules'),
    ],
    extraNodeModules: {
      react: path.resolve(projectRoot, 'node_modules/react'),
      'react-native': path.resolve(projectRoot, 'node_modules/react-native'),
      'rn-savings-notifier': path.resolve(workspaceRoot, 'libreria'),
    },
  },
};

module.exports = mergeConfig(getDefaultConfig(projectRoot), config);
