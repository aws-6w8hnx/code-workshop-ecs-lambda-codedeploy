#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { ecsCodeDeployStack } from './cdk-ecs-codedeploy-stack';

const app = new cdk.App();
const env = { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION }

const code_deploy_ecs_stack = new ecsCodeDeployStack(app, 'cdk-code-workshop-ecs-deploy-stack', {
  env: env,
});
cdk.Tags.of(code_deploy_ecs_stack).add('auto-delete', 'no');
cdk.Tags.of(code_deploy_ecs_stack).add('managedBy', 'cdk');
cdk.Tags.of(code_deploy_ecs_stack).add('environment', 'dev');
