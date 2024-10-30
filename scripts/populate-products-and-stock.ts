import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";

import * as data from './data.json';

export interface Product {
    id: string;
    title: string;
    description: string;
    price: number;
    image: string;
}

const client = new DynamoDBClient();

async function populateTables(): Promise<void> {
    console.log('Start tables populating!');
    const products: Product[] = data?.products || [];

    for (let i = 0; i < products.length; i++) {
        const product = products[i];

        const productParams = {
            TableName: 'products',
            Item: {
                id: { S: product.id },
                title: { S: product.title },
                description: { S: product.description },
                price: { N: product.price.toString() },
                image: { S: product.image }
            },
        };

        await client.send(new PutItemCommand(productParams));

        const stockParams = {
            TableName: 'stock',
            Item: {
                product_id: { S: product.id },
                count: { N: (i + 1).toString() },
            },
        };

        await client.send(new PutItemCommand(stockParams));
    }
}

populateTables()
    .then(() => console.log('Tables populated successfully!'))
    .catch((error) => console.error("An error occurred:", error));
