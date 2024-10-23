import { APIGatewayProxyHandler } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand } from '@aws-sdk/lib-dynamodb';

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

    const productsTableName = process.env.PRODUCTS_TABLE_NAME;
    const stockTableName = process.env.STOCK_TABLE_NAME;

    try {
        const productsData = await docClient.send(new ScanCommand({
            TableName: productsTableName
        }));

        const stockData = await docClient.send(new ScanCommand({
            TableName: stockTableName
        }));

        const stockMap = new Map(stockData.Items?.map(item => [item.product_id, item.count]));

        const productsWithStock = productsData.Items?.map(product => ({
            ...product,
            count: stockMap.get(product.id) || 0
        }));

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(productsWithStock),
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
