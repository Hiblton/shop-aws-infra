import { aws_s3, aws_s3_deployment, CfnOutput, RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';

export class ImportServiceStack extends Stack {
    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        const importBucket = new aws_s3.Bucket(this, "ImportBucket", {
            autoDeleteObjects: true,
            blockPublicAccess: aws_s3.BlockPublicAccess.BLOCK_ALL,
            removalPolicy: RemovalPolicy.DESTROY,
        })

        new aws_s3_deployment.BucketDeployment(this, 'ImportBucketDeployment', {
            sources: [aws_s3_deployment.Source.asset('./assets')],
            destinationBucket: importBucket,
            destinationKeyPrefix: 'uploaded/'
        });

        new CfnOutput(this, "ImportBucketName", {
            value: importBucket.bucketName,
            description: "The name of S3 import bucket",
            exportName: "ImportBucketName",
        });
    }
}
