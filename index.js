const { execSync, spawn } = require('child_process');
const { existsSync } = require('fs');
const { EOL } = require('os');
const path = require('path');

// ... (Code for PACKAGEJSON_DIR and other initializations)

(async () => {
  const event = process.env.GITHUB_EVENT_PATH ? require(process.env.GITHUB_EVENT_PATH) : {};

  const allowedTypes = ['major', 'minor', 'patch', 'prerelease'];
  if (process.env['INPUT_VERSION-TYPE'] && !allowedTypes.includes(process.env['INPUT_VERSION-TYPE'])) {
    exitFailure('Invalid version type');
    return;
  }

  const versionType = process.env['INPUT_VERSION-TYPE'];
  const tagPrefix = process.env['INPUT_TAG-PREFIX'] || '';
  const tagSuffix = process.env['INPUT_TAG-SUFFIX'] || '';
  console.log('tagPrefix:', tagPrefix);
  console.log('tagSuffix:', tagSuffix);

  const checkLastCommitOnly = process.env['INPUT_CHECK-LAST-COMMIT-ONLY'] || 'false';

  let messages = [];
  if (checkLastCommitOnly === 'true') {
    console.log('Only checking the last commit...');
    const commit = event.head_commit;
    messages = commit ? [commit.message + '\n' + commit.body] : [];
  } else {
    messages = event.commits ? event.commits.map((commit) => commit.message + '\n' + commit.body) : [];
  }

  const commitMessage = process.env['INPUT_COMMIT-MESSAGE'] || 'ci: version bump to {{version}}';
  const bumpPolicy = process.env['INPUT_BUMP-POLICY'] || 'all';
  const commitMessageRegex = new RegExp(commitMessage.replace(/{{version}}/g, `${tagPrefix}\\d+\\.\\d+\\.\\d+${tagSuffix}`), 'ig');

  let isVersionBump = false;

  if (bumpPolicy === 'all') {
    isVersionBump = messages.find((message) => commitMessageRegex.test(message)) !== undefined;
  } else if (bumpPolicy === 'last-commit') {
    isVersionBump = messages.length > 0 && commitMessageRegex.test(messages[messages.length - 1]);
  } else if (bumpPolicy === 'ignore') {
    console.log('Ignoring any version bumps in commits...');
  } else {
    console.warn(`Unknown bump policy: ${bumpPolicy}`);
  }

  if (isVersionBump) {
    exitSuccess('No action necessary because we found a previous bump!');
    return;
  }
})();
  // ... (Code for determining the version bump based on commit messages)

  // ... (Code for the git logic)

  // Note: There's a commented-out line below. You may want to uncomment it if you want to include commit messages
  // in the version bump commit. Otherwise, the script will only bump the version and not create a commit.

  // if (process.env['INPUT_SKIP-COMMIT'] !== 'true') {
  //   await runInWorkspace('git', ['commit', '-a', '-m', commitMessage.replace(/{{version}}/g, newVersion)]);
  // }

  // ... (Code for pushing the new tag and committing changes if necessary)

// ... (Code for the getPackageJson function and other helper functions)
