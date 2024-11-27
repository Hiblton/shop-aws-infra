#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { AuthorizationServiceStack } from '../lib/authorization-service-stack';
import { ProductServiceStack } from '../lib/product-service-stack';
import { ImportServiceStack } from '../lib/import-service-stack';

const app = new cdk.App();

new AuthorizationServiceStack(app, 'AuthorizationServiceStack', {});

const productServiceStack = new ProductServiceStack(app, 'ProductServiceStack', {});

new ImportServiceStack(app, 'ImportServiceStack', {
    queue: productServiceStack.productItemsQueue
});
