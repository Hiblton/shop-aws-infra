import { handler } from './../../lambda/handlers/import-products-file/importProductsFile';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Context } from 'aws-lambda';

jest.mock('@aws-sdk/client-s3', () => ({
    S3Client: jest.fn().mockImplementation(() => ({
        send: jest.fn()
    })),
    PutObjectCommand: jest.fn()
}));

jest.mock('@aws-sdk/s3-request-presigner', () => ({
    getSignedUrl: jest.fn().mockImplementation((client, command, options) => Promise.resolve('http://signedurl.com/testfile.csv'))
}));

describe('importProductsFile Lambda Function', () => {
    const context = {} as Context;
    const callback = jest.fn();

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should return statusCode 400 if fileName is not provided', async () => {
        const event = { queryStringParameters: {} } as any;
        const result = await handler(event, context, callback);

        expect(result?.statusCode).toBe(400);
        expect(JSON.parse(result?.body!).error).toBe('File name is required as a query parameter.');
        expect(getSignedUrl).not.toHaveBeenCalled();
    });

    it('should return statusCode 400 if file is not a CSV', async () => {
        const event = { queryStringParameters: { name: 'testfile.txt' } } as any;
        const result = await handler(event, context, callback);

        expect(result?.statusCode).toBe(400);
        expect(JSON.parse(result?.body!).error).toBe('Only csv file is allowed.');
        expect(getSignedUrl).not.toHaveBeenCalled();
    });

    it('should return statusCode 200 and a signed URL if fileName is provided', async () => {
        const event = { queryStringParameters: { name: 'testfile.csv' } } as any;
        const result = await handler(event, context, callback);

        expect(result?.statusCode).toBe(200);
        expect(JSON.parse(result?.body!).url).toBe('http://signedurl.com/testfile.csv');
        expect(getSignedUrl).toHaveBeenCalled();
    });

    it('should handle errors from getSignedUrl', async () => {
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        (getSignedUrl as jest.Mock).mockRejectedValueOnce(new Error('Failed to create signed URL'));

        const event = { queryStringParameters: { name: 'testfile.csv' } } as any;
        const result = await handler(event, context, callback);

        expect(result?.statusCode).toBe(500);
        expect(JSON.parse(result?.body!).error).toBe('Error creating signed URL');
        expect(consoleSpy).toHaveBeenCalled();
        consoleSpy.mockRestore();
    });
});
