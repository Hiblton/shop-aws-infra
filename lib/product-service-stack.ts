import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as subscriptions from 'aws-cdk-lib/aws-sns-subscriptions';
import * as path from 'path';
import { Construct } from 'constructs';

const CORS_CONFIGURATION = {
    allowOrigins: ['https://d393tsl9iif6hb.cloudfront.net'],
    allowMethods: ['OPTIONS', 'GET', 'POST'],
    allowHeaders: ['Content-Type', 'Authorization'],
}

export class ProductServiceStack extends cdk.Stack {
    public readonly productItemsQueue: sqs.Queue;

    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        this.productItemsQueue = new sqs.Queue(this, 'ProductItemsQueue', {
            queueName: 'productItemsQueue'
        });

        const createProductTopic = new sns.Topic(this, 'CreateProductTopic', {
            displayName: 'createProductTopic'
        });

        const productsTable = dynamodb.Table.fromTableName(this, 'ProductsTable', 'products');
        const stockTable = dynamodb.Table.fromTableName(this, 'StockTable', 'stock');

        const getProductsList = new lambda.Function(this, 'GetProductsListFunction', {
            runtime: lambda.Runtime.NODEJS_20_X,
            memorySize: 128,
            timeout: cdk.Duration.seconds(5),
            code: lambda.Code.fromAsset(path.join(__dirname, '../lambda/handlers/get-products')),
            handler: 'getProducts.handler',
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
            code: lambda.Code.fromAsset(path.join(__dirname, '../lambda/handlers/get-product-by-id')),
            handler: 'getProductById.handler',
            environment: {
                PRODUCTS_TABLE_NAME: productsTable.tableName,
                STOCK_TABLE_NAME: stockTable.tableName
            }
        });

        productsTable.grantReadData(getProductsById);
        stockTable.grantReadData(getProductsById);

        const createProduct = new lambda.Function(this, 'CreateProductFunction', {
            runtime: lambda.Runtime.NODEJS_20_X,
            memorySize: 128,
            timeout: cdk.Duration.seconds(5),
            code: lambda.Code.fromAsset(path.join(__dirname, '../lambda/handlers/create-product')),
            handler: 'createProduct.handler',
            environment: {
                PRODUCTS_TABLE_NAME: productsTable.tableName,
                STOCK_TABLE_NAME: stockTable.tableName
            }
        });

        productsTable.grantWriteData(createProduct);
        stockTable.grantWriteData(createProduct);

        const api = new apigateway.RestApi(this, 'ProductServiceApi', {
            restApiName: 'Product Service',
            description: 'This service serves products',
        });

        const productsResource = api.root.addResource('products');
        productsResource.addMethod('GET', new apigateway.LambdaIntegration(getProductsList));
        productsResource.addMethod('POST', new apigateway.LambdaIntegration(createProduct));
        productsResource.addCorsPreflight(CORS_CONFIGURATION);

        const productByIdResource = productsResource.addResource('{productId}');
        productByIdResource.addMethod('GET', new apigateway.LambdaIntegration(getProductsById));
        productByIdResource.addCorsPreflight(CORS_CONFIGURATION);

        const productBatchProcess = new lambda.Function(this, 'ProductBatchProcessFunction', {
            runtime: lambda.Runtime.NODEJS_20_X,
            memorySize: 128,
            timeout: cdk.Duration.seconds(5),
            code: lambda.Code.fromAsset(path.join(__dirname, '../lambda/handlers/product-batch-process')),
            handler: 'productBatchProcess.handler',
            environment: {
                PRODUCTS_TABLE_NAME: productsTable.tableName,
                STOCK_TABLE_NAME: stockTable.tableName,
                SNS_TOPIC_ARN: createProductTopic.topicArn
            }
        });

        productsTable.grantWriteData(productBatchProcess);
        stockTable.grantWriteData(productBatchProcess);

        productBatchProcess.addEventSource(new cdk.aws_lambda_event_sources.SqsEventSource(this.productItemsQueue, {
            batchSize: 5
        }));

        createProductTopic.grantPublish(productBatchProcess);
        createProductTopic.addSubscription(new subscriptions.EmailSubscription("hiblton91@gmail.com"));
        createProductTopic.addSubscription(new subscriptions.EmailSubscription("hiblton91+out@gmail.com", {
            filterPolicy: {
                count: sns.SubscriptionFilter.numericFilter({
                    lessThanOrEqualTo: 0
                })
            }
        }));
    }
}
