import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as path from 'path';
import { Construct } from 'constructs';

const CORS_CONFIGURATION = {
    allowOrigins: ['https://d393tsl9iif6hb.cloudfront.net'],
    allowMethods: ['OPTIONS', 'GET'],
    allowHeaders: ['Content-Type'],
}

export class ProductServiceStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        // Define the Lambda function for getting the products list
        const getProductsList = new lambda.Function(this, 'GetProductsListFunction', {
            runtime: lambda.Runtime.NODEJS_20_X,
            memorySize: 128,
            timeout: cdk.Duration.seconds(5),
            code: lambda.Code.fromAsset(path.join(__dirname, '../lambda')),
            handler: 'handlers/getProductsList.handler',
        });

        // Define the Lambda function for getting product by ID
        const getProductsById = new lambda.Function(this, 'GetProductsByIdFunction', {
            runtime: lambda.Runtime.NODEJS_20_X,
            memorySize: 128,
            timeout: cdk.Duration.seconds(5),
            code: lambda.Code.fromAsset(path.join(__dirname, '../lambda')),
            handler: 'handlers/getProductsById.handler',
        });

        // Define the API Gateway
        const api = new apigateway.RestApi(this, 'ProductServiceApi', {
            restApiName: 'Product Service',
            description: 'This service serves products',
        });

        // Create an API Gateway resource for the products list
        const productsResource = api.root.addResource('products');
        productsResource.addMethod('GET', new apigateway.LambdaIntegration(getProductsList));
        productsResource.addCorsPreflight(CORS_CONFIGURATION)

        // Create an API Gateway resource for getting product by ID
        const productByIdResource = api.root.addResource('{productId}');
        productByIdResource.addMethod('GET', new apigateway.LambdaIntegration(getProductsById));
        productByIdResource.addCorsPreflight(CORS_CONFIGURATION)
    }
}
