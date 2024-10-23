import { APIGatewayProxyHandler } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import { randomUUID } from 'crypto';
import { Product } from '../data/products';

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

    const data = (event.body || {}) as Product;

    if (!data.title || typeof data.description !== 'string' || typeof data.price !== 'number') {
        return {
            statusCode: 400,
            headers,
            body: JSON.stringify({
                message: "Missing or invalid fields. Required fields: title (string), description (string), price (number), image (string, optional)."
            })
        };
    }

    const product = {
        id: randomUUID(),
        title: data.title,
        description: data.description,
        price: data.price,
        image: data.image
    };

    const params = {
        TableName: productsTableName,
        Item: product
    };

    try {
        await docClient.send(new PutCommand(params));

        return {
            statusCode: 201,
            headers,
            body: JSON.stringify(product)
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
