import { APIGatewayProxyHandler } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand } from '@aws-sdk/lib-dynamodb';

const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Origin": "https://d393tsl9iif6hb.cloudfront.net",
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Allow-Methods": "OPTIONS,GET"
};

const dbClient = new DynamoDBClient();
const docClient = DynamoDBDocumentClient.from(dbClient);

export const handler: APIGatewayProxyHandler = async (event) => {
    console.log("Incoming request:", JSON.stringify(event));

    const productId = event.pathParameters?.productId;
    const productsTableName = process.env.PRODUCTS_TABLE_NAME;
    const stockTableName = process.env.STOCK_TABLE_NAME;

    if (!productId) {
        return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ message: "Product ID is required" }),
        };
    }

    try {
        const productData = await docClient.send(new GetCommand({
            TableName: productsTableName,
            Key: { id: productId }
        }));

        if (!productData.Item) {
            return {
                statusCode: 404,
                headers,
                body: JSON.stringify({ message: "Product not found" }),
            };
        }

        const stockData = await docClient.send(new GetCommand({
            TableName: stockTableName,
            Key: { product_id: productId }
        }));

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({...productData.Item, ...stockData.Item}),
        };
    } catch (error) {
        console.error("Error handling request:", error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ message: "Internal server error" }),
        };
    }
};
