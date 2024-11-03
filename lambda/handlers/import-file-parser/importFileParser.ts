import { S3Handler } from 'aws-lambda';
import { S3Client, GetObjectCommand, CopyObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import * as stream from 'stream';
// import * as csv from 'csv-parser';

const s3Client = new S3Client();

export const handler: S3Handler = async (event) => {
    for (const record of event.Records) {
        const bucketName = record.s3.bucket.name;
        const objectKey = decodeURIComponent(record.s3.object.key.replace(/\+/g, ' '));

        const getObjectParams = {
            Bucket: bucketName,
            Key: objectKey,
        };

        try {
            const getObjectCommand = new GetObjectCommand(getObjectParams);
            const { Body } = await s3Client.send(getObjectCommand);

            const s3Stream = Body as stream.Readable;
            s3Stream
                //.pipe(csv())
                .on('data', (data: any) => console.log(data))
                .on('end', async () => {
                    console.log('CSV file has been processed successfully.');
                    await moveToParsedFolder(bucketName, objectKey);
                });
        } catch (err) {
            console.error('Error processing CSV file:', err);
            throw err;
        }
    }
};

async function moveToParsedFolder(bucketName: string, objectKey: string) {
    const newKey = objectKey.replace('uploaded/', 'parsed/');

    const copyObjectCommand = new CopyObjectCommand({
        Bucket: bucketName,
        CopySource: `${bucketName}/${objectKey}`,
        Key: newKey
    });
    await s3Client.send(copyObjectCommand);

    const deleteObjectCommand = new DeleteObjectCommand({
        Bucket: bucketName,
        Key: objectKey
    });
    await s3Client.send(deleteObjectCommand);

    console.log(`File moved to ${newKey}`);
}
