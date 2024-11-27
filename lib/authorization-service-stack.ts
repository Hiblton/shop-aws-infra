import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as cdk from 'aws-cdk-lib';
import * as path from 'path';
import { Construct } from 'constructs';

export class AuthorizationServiceStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        const basicAuthorizer = new lambda.Function(this, "BasicAuthorizer", {
            runtime: lambda.Runtime.NODEJS_20_X,
            memorySize: 128,
            code: lambda.Code.fromAsset(path.join(__dirname, '../lambda/handlers/basic-authorizer')),
            handler: 'basicAuthorizer.handler',
            environment: process.env as {[username: string]: string}
        });

        new cdk.CfnOutput(this, 'BasicAuthorizerArn', {
            value: basicAuthorizer.functionArn,
            exportName: 'BasicAuthorizerArn'
        });
    }
}
