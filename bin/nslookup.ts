#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { NslookupStack } from '../lib/nslookup-stack';

const app = new cdk.App();
new NslookupStack(app, 'NslookupStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  }
});
