import { APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda';
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Origin": "https://d393tsl9iif6hb.cloudfront.net",
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Allow-Methods": "OPTIONS,GET"
};

const s3 = new S3Client();

export const handler: APIGatewayProxyHandler = async (event): Promise<APIGatewayProxyResult> => {
    const fileName = event.queryStringParameters?.name;

    if (!fileName) {
        return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: "File name is required as a query parameter." })
        };
    }

    if (!fileName.endsWith('.csv')) {
        return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: "Only csv file is allowed." })
        };
    }

    const params = {
        Bucket: process.env.BUCKET_NAME,
        Key: `uploaded/${fileName}`
    };

    try {
        const url = await getSignedUrl(s3, new PutObjectCommand(params), { expiresIn: 3600 });
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ url })
        };
    } catch (err) {
        console.error('Error creating signed URL:', err);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: "Error creating signed URL" })
        };
    }
};
