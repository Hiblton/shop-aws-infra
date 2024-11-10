import { CfnOutput, RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';
import * as s3n from 'aws-cdk-lib/aws-s3-notifications';
import * as path from 'path';

const CORS_CONFIGURATION = {
    allowOrigins: ['https://d393tsl9iif6hb.cloudfront.net'],
    allowMethods: ['OPTIONS', 'GET'],
    allowHeaders: ['Content-Type', 'Authorization'],
}

export class ImportServiceStack extends Stack {
    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        const importBucket = new s3.Bucket(this, "ImportBucket", {
            autoDeleteObjects: true,
            blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
            removalPolicy: RemovalPolicy.DESTROY,
            cors: [
                {
                    allowedOrigins: CORS_CONFIGURATION.allowOrigins,
                    allowedMethods: [s3.HttpMethods.PUT],
                },
            ],
        })

        new s3deploy.BucketDeployment(this, 'ImportBucketDeployment', {
            sources: [s3deploy.Source.asset('./assets')],
            destinationBucket: importBucket,
            destinationKeyPrefix: 'uploaded/'
        });

        const lambdaRole = new iam.Role(this, 'LambdaExecutionRole', {
            assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
            managedPolicies: [
                iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole')
            ],
            description: 'Role for Import Products Lambda Function',
        });

        lambdaRole.addToPolicy(new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            actions: ['s3:GetObject', 's3:PutObject', 's3:DeleteObject'],
            resources: [importBucket.bucketArn, `${importBucket.bucketArn}/*`],
        }));

        const importProductsFile = new lambda.Function(this, 'ImportProductsFile', {
            runtime: lambda.Runtime.NODEJS_20_X,
            memorySize: 128,
            handler: 'importProductsFile.handler',
            code: lambda.Code.fromAsset(path.join(__dirname, '../lambda/handlers/import-products-file')),
            role: lambdaRole,
            environment: {
                BUCKET_NAME: importBucket.bucketName
            }
        });

        importBucket.grantPut(importProductsFile);

        const csvParserLayer = new lambda.LayerVersion(this, 'CsvParserLayer', {
            code: lambda.Code.fromAsset(path.join(__dirname, '../lambda-layers/csv-parser-layer')),
            compatibleRuntimes: [lambda.Runtime.NODEJS_20_X],
            description: 'A layer that contains the csv-parser package',
        });

        const importFileParser = new lambda.Function(this, 'ImportFileParser', {
            runtime: lambda.Runtime.NODEJS_20_X,
            memorySize: 128,
            handler: 'importFileParser.handler',
            code: lambda.Code.fromAsset(path.join(__dirname, '../lambda/handlers/import-file-parser')),
            role: lambdaRole,
            layers: [csvParserLayer],
            environment: {
                BUCKET_NAME: importBucket.bucketName,
            }
        });

        importBucket.addEventNotification(s3.EventType.OBJECT_CREATED, new s3n.LambdaDestination(importFileParser), {
            prefix: 'uploaded/',
        });

        const api = new apigateway.RestApi(this, 'ImportServiceApi', {
            restApiName: 'Import Service API'
        });

        const importResource = api.root.addResource('import');
        importResource.addMethod('GET', new apigateway.LambdaIntegration(importProductsFile));
        importResource.addCorsPreflight(CORS_CONFIGURATION);

        new CfnOutput(this, "APIGatewayURL", {
            value: api.url,
            description: "URL of the API Gateway",
            exportName: "ImportAPIURL"
        });

        new CfnOutput(this, "ImportBucketName", {
            value: importBucket.bucketName,
            description: "The name of S3 import bucket",
            exportName: "ImportBucketName",
        });
    }
}
