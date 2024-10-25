import { APIGatewayProxyHandler } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, TransactWriteCommand } from '@aws-sdk/lib-dynamodb';
import { randomUUID } from 'crypto';

interface ProductRequest {
    id: string;
    title: string;
    description: string;
    price: number;
    image: string;
    count: number;
}

const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Origin": "https://d393tsl9iif6hb.cloudfront.net",
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Allow-Methods": "OPTIONS,POST"
};

const dbClient = new DynamoDBClient();
const docClient = DynamoDBDocumentClient.from(dbClient);

export const handler: APIGatewayProxyHandler = async (event) => {
    console.log("Incoming request:", JSON.stringify(event));

    const productsTableName = process.env.PRODUCTS_TABLE_NAME;
    const stockTableName = process.env.STOCK_TABLE_NAME;

    let data: ProductRequest;

    try {
        data = JSON.parse(event.body || '{}');
    } catch (error) {
        console.error("Error parsing JSON: ", error);
        return {
            statusCode: 400,
            body: JSON.stringify({ message: "Invalid JSON format" })
        };
    }

    if (!data.title || !data.description || !data.price || !data.count) {
        return {
            statusCode: 400,
            headers,
            body: JSON.stringify({
                message: "Missing or invalid fields. Required fields: title (string), description (string), price (number), count (string, optional)."
            })
        };
    }

    const productId = randomUUID();

    const productItem = {
        id: productId,
        title: data.title,
        description: data.description,
        price: data.price,
        image: data.image
    };

    const stockItem = {
        product_id: productId,
        count: data.count
    };

    const transactionParams = {
        TransactItems: [
            {
                Put: {
                    TableName: productsTableName,
                    Item: productItem
                }
            },
            {
                Put: {
                    TableName: stockTableName,
                    Item: stockItem
                }
            }
        ]
    };

    try {
        await docClient.send(new TransactWriteCommand(transactionParams));

        return {
            statusCode: 201,
            headers,
            body: JSON.stringify({ ...productItem, ...stockItem })
        };
    } catch (error) {
        console.error("Error creating the product:", error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ message: "Internal server error" })
        };
    }
};
