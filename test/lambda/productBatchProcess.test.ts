import { handler } from './../../lambda/handlers/product-batch-process/productBatchProcess';
import { SQSEvent, Context, SQSRecord } from 'aws-lambda';

jest.mock('@aws-sdk/client-dynamodb', () => ({
    DynamoDBClient: jest.fn()
}));

jest.mock('@aws-sdk/lib-dynamodb', () => {
    const dbSendMock = jest.fn().mockResolvedValue({});
    const fromMock = jest.fn(() => ({ send: dbSendMock }));
    return {
        DynamoDBDocumentClient: { from: fromMock },
        TransactWriteCommand: jest.fn((input) => input),
        dbSendMock,
    };
});

jest.mock('@aws-sdk/client-sns', () => {
    const snsSendMock = jest.fn().mockResolvedValue({});
    return {
        SNSClient: jest.fn(() => ({
            send: snsSendMock
        })),
        PublishCommand: jest.fn().mockImplementation((input) => input),
        snsSendMock
    }
});

jest.mock('crypto', () => ({
    randomUUID: jest.fn(() => 'xxxx-xxxx-xxxx-xxxx')
}));

describe('SQS Handler', () => {
    const context = {} as Context;
    const callback = jest.fn();
    const { dbSendMock } = require('@aws-sdk/lib-dynamodb');
    const { snsSendMock } = require('@aws-sdk/client-sns');

    beforeEach(() => {
        jest.resetModules();
        jest.clearAllMocks();

        process.env.PRODUCTS_TABLE_NAME = 'Products';
        process.env.STOCK_TABLE_NAME = 'Stock';
        process.env.SNS_TOPIC_ARN = 'arn:aws:sns:region:1234567890:SomeTopic';
    });

    it('should process batched messages as a single transaction', async () => {
        const event: SQSEvent = {
            Records: [{
                body: JSON.stringify({
                    title: 'Product 1',
                    description: 'Description 1',
                    price: 100,
                    count: 10,
                }),
            }, {
                body: JSON.stringify({
                    title: 'Product 2',
                    description: 'Description 2',
                    price: 200,
                    count: 5,
                }),
            }] as SQSRecord[]
        };

        await handler(event, context, callback);

        expect(dbSendMock).toHaveBeenCalledWith(expect.anything());
        expect(dbSendMock).toHaveBeenCalledTimes(1);

        expect(snsSendMock).toHaveBeenCalledWith(expect.objectContaining({
            Subject: 'Task 6: products saved!',
            Message: 'Products saved successfully.'
        }));
        expect(snsSendMock).toHaveBeenCalledTimes(1);
    });

    it('should notify when products are out of stock', async () => {
        const event: SQSEvent = {
            Records: [{
                body: JSON.stringify({
                    title: 'Product 1',
                    description: 'Description 1',
                    price: 100,
                    count: 0,  // This product is out of stock
                })
            }] as SQSRecord[]
        };

        await handler(event, context, callback);

        expect(snsSendMock).toHaveBeenCalledWith(expect.objectContaining({
            Subject: 'Task 6: products saved!',
            Message: 'Products saved successfully.',
            TopicArn: process.env.SNS_TOPIC_ARN,
        }));
        expect(snsSendMock).toHaveBeenCalledWith(expect.objectContaining({
            Subject: 'Task 6: out of stock!',
            Message: `Out of stock product IDs: xxxx-xxxx-xxxx-xxxx.`,
            TopicArn: process.env.SNS_TOPIC_ARN,
            MessageAttributes: {
                count: {
                    DataType: 'Number',
                    StringValue: "0"
                }
            }
        }));
    });
});
