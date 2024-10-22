import { APIGatewayProxyHandler } from 'aws-lambda';
import { products } from '../data/products';

const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Origin": "https://d393tsl9iif6hb.cloudfront.net",
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Allow-Methods": "OPTIONS,GET"
}

export const handler: APIGatewayProxyHandler = async (event) => {
    const productId = event.pathParameters?.productId;
    const product = products.find(product => product.id === productId);

    if (!product) {
        return {
            headers,
            statusCode: 404,
            body: JSON.stringify({ message: 'Product not found' }),
        };
    }

    return {
        headers,
        statusCode: 200,
        body: JSON.stringify(product),
    };
};
