const { awscdk } = require('projen');
const project = new awscdk.AwsCdkTypeScriptApp({
  cdkVersion: '2.28.0',
  defaultReleaseBranch: 'main',
  name: 'basic-chime-sdk-meeting',
  deps: ['fs-extra', '@types/fs-extra'],
  appEntrypoint: 'basic-chime-sdk-meeting.ts',
  devDeps: ['esbuild'],
  autoApproveOptions: {
    secret: 'GITHUB_TOKEN',
    allowedUsernames: ['schuettc'],
  },
  depsUpgradeOptions: {
    ignoreProjen: false,
    workflowOptions: {
      labels: ['auto-approve', 'auto-merge'],
    },
  },
  scripts: {
    launch:
      'yarn && yarn projen && yarn build && yarn cdk bootstrap && yarn cdk deploy BackEnd -O site/src/cdk-outputs.json && yarn cdk deploy FrontEnd',
  },
});
const common_exclude = [
  'cdk.out',
  'cdk.context.json',
  'yarn-error.log',
  'dependabot.yml',
  '*.drawio',
];

project.gitignore.exclude(...common_exclude);
project.synth();
