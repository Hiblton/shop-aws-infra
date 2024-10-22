import { handler } from './../../../lambda/handlers/getProductsList';
import { products } from './../../../lambda/data/products';
import { APIGatewayProxyEvent, Context, Callback, APIGatewayProxyResult } from 'aws-lambda';

describe('getProductsList handler', () => {
    const event = {} as APIGatewayProxyEvent;
    const context = {} as Context;
    const callback: Callback = jest.fn();

    it('should return correct statusCode and headers', async () => {
        const response = await handler(event, context, callback) as APIGatewayProxyResult;

        expect(response.statusCode).toEqual(200);
        expect(response.headers!['Content-Type']).toEqual('application/json');
        expect(response.headers!['Access-Control-Allow-Origin']).toEqual('https://d393tsl9iif6hb.cloudfront.net');
        expect(response.headers!['Access-Control-Allow-Credentials']).toEqual('true');
    });

    it('should return the list of products', async () => {
        const response = await handler(event, context, callback) as APIGatewayProxyResult;

        expect(JSON.parse(response.body)).toEqual(products);
    });
});
