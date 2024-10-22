import { handler } from '../../../lambda/handlers/getProductsById';
import { products } from '../../../lambda/data/products';
import { APIGatewayProxyEvent, Context, Callback, APIGatewayProxyResult } from 'aws-lambda';

describe('getProductsById handler', () => {
    const event = {} as APIGatewayProxyEvent;
    const context = {} as Context;
    const callback: Callback = jest.fn();

    it('should return a product when found', async () => {
        event.pathParameters = { productId: products[0].id }
        const response = await handler(event, context, callback) as APIGatewayProxyResult;

        expect(response.statusCode).toEqual(200);
        expect(response.headers!['Content-Type']).toEqual('application/json');
        expect(response.headers!['Access-Control-Allow-Origin']).toEqual('https://d393tsl9iif6hb.cloudfront.net');
        expect(response.headers!['Access-Control-Allow-Credentials']).toEqual('true');
        expect(response.body).toEqual(JSON.stringify(products[0]));
    });

    it('should return a 404 when product not found', async () => {
        event.pathParameters = { productId: 'null' }
        const response = await handler(event, context, callback) as APIGatewayProxyResult;

        expect(response.statusCode).toEqual(404);
        expect(response.headers!['Content-Type']).toEqual('application/json');
        expect(response.body).toEqual(JSON.stringify({ message: 'Product not found' }));
    });
});
