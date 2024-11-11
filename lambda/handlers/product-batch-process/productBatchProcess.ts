import { DynamoDBDocumentClient, TransactWriteCommand, TransactWriteCommandInput } from '@aws-sdk/lib-dynamodb';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { SQSEvent, SQSHandler } from 'aws-lambda';
import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';
import { randomUUID } from 'crypto';

const dbClient = new DynamoDBClient();
const docClient = DynamoDBDocumentClient.from(dbClient);

const snsClient = new SNSClient();

export const handler: SQSHandler = async (event: SQSEvent): Promise<void> => {
    const productsTable = process.env.PRODUCTS_TABLE_NAME;
    const stockTable = process.env.STOCK_TABLE_NAME;
    const topicArn = process.env.SNS_TOPIC_ARN;
    const outOfStockProductIds: string[] = [];

    const transactionItems = event.Records.flatMap(record => {
        const data = JSON.parse(record.body);
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

        if (data.count < 1) {
            outOfStockProductIds.push(productId);
        }

        return [
            {
                Put: {
                    TableName: productsTable,
                    Item: productItem
                }
            },
            {
                Put: {
                    TableName: stockTable,
                    Item: stockItem
                }
            }
        ];
    });

    const transactionParams: TransactWriteCommandInput = {
        TransactItems: transactionItems
    };

    try {
        await docClient.send(new TransactWriteCommand(transactionParams));

        await snsClient.send(new PublishCommand({
            Subject: 'Task 6: products saved!',
            Message: 'Products saved successfully.',
            TopicArn: topicArn
        }));

        if (outOfStockProductIds.length > 0) {
            await snsClient.send(new PublishCommand({
                Subject: 'Task 6: out of stock!',
                Message: `Out of stock product IDs: ${outOfStockProductIds.join()}.`,
                TopicArn: topicArn,
                MessageAttributes: {
                    count: {
                        DataType: 'Number',
                        StringValue: "0"
                    }
                }
            }))
        }

        console.log('Products saved successfully.');
    } catch (error) {
        console.error('Error processing transaction:', error);
        throw new Error('Error processing transaction');
    }
};
