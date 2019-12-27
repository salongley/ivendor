// Idea here is to update the version locally to provide a unique value
// when publishing a module to Artifactory.
//
// Only done if we are not in a RELEASE build; in that case, you should
// manually bump your version via 'npm version'.
//
// Add this script to your 'scripts' section of your package.json like so:
// "scripts": {
//   "postinstall": "node version-bump.js"
// }

const ver_postfix = '-dev'
const cur_version = require('./package.json').version;
const build_number = process.env.RIO_BUILD_NUMBER || 1;

function info(message) {
  console.log('version-bump.js (INFO) - ' + message);
}

if (typeof process.env.RELEASE != 'undefined') {
  info('RELEASE env var detected. Leaving version at ' + cur_version);
  process.exit(0);
}

if (cur_version.indexOf(ver_postfix) !== -1) {
  info('Version already bumped to ' + cur_version);
  process.exit(0);
}

var new_version = cur_version + ver_postfix + build_number
info('Bumping version to ' + cur_version + ' -> ' + new_version)

// Use of npm_config_git_tag_version=false is to avoid any git operation
const exec = require('child_process').exec;
exec('npm_config_git_tag_version=false npm version ' + new_version, (err, stdout, stderr) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
});
