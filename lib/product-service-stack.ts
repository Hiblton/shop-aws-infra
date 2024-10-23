import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
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

        const productsTable = dynamodb.Table.fromTableName(this, 'ProductsTable', 'products');
        const stockTable = dynamodb.Table.fromTableName(this, 'StockTable', 'stock');

        const getProductsList = new lambda.Function(this, 'GetProductsListFunction', {
            runtime: lambda.Runtime.NODEJS_20_X,
            memorySize: 128,
            timeout: cdk.Duration.seconds(5),
            code: lambda.Code.fromAsset(path.join(__dirname, '../lambda')),
            handler: 'handlers/getProductsList.handler',
            environment: {
                PRODUCTS_TABLE_NAME: productsTable.tableName,
                STOCK_TABLE_NAME: stockTable.tableName
            }
        });

        productsTable.grantReadData(getProductsList);
        stockTable.grantReadData(getProductsList);

        const getProductsById = new lambda.Function(this, 'GetProductsByIdFunction', {
            runtime: lambda.Runtime.NODEJS_20_X,
            memorySize: 128,
            timeout: cdk.Duration.seconds(5),
            code: lambda.Code.fromAsset(path.join(__dirname, '../lambda')),
            handler: 'handlers/getProductsById.handler',
            environment: {
                PRODUCTS_TABLE_NAME: productsTable.tableName,
                STOCK_TABLE_NAME: stockTable.tableName
            }
        });

        productsTable.grantReadData(getProductsById);
        stockTable.grantReadData(getProductsById);

        const api = new apigateway.RestApi(this, 'ProductServiceApi', {
            restApiName: 'Product Service',
            description: 'This service serves products',
        });

        const productsResource = api.root.addResource('products');
        productsResource.addMethod('GET', new apigateway.LambdaIntegration(getProductsList));
        productsResource.addCorsPreflight(CORS_CONFIGURATION);

        const productByIdResource = api.root.addResource('{productId}');
        productByIdResource.addMethod('GET', new apigateway.LambdaIntegration(getProductsById));
        productByIdResource.addCorsPreflight(CORS_CONFIGURATION);
    }
}
