# Tasks

## Task 5.1
CDK Stack Creation: Create a new CDK stack named ImportServiceStack, at the same level as your existing ProductServiceStack. This aligns with the structure of having separate services in your backend repository.
Repository Structure:
backend-repository
  - lib
    - product-service-stack.ts
    - import-service-stack.ts
S3 Bucket Creation: Using the CDK, define and deploy an S3 bucket in your ImportServiceStack. Include a folder named uploaded in the bucket definition

## Task 5.2
Lambda Function Setup: Define a new Lambda function named importProductsFile within the ImportServiceStack. This function will be triggered by an HTTP GET request.
API Gateway Integration: Create an API Gateway resource with a GET method at the path /import that triggers the importProductsFile Lambda function.
Function Logic: Implement the function to expect a request containing the name of a CSV file with products. It should create a new Signed URL for the file, using the key pattern: `uploaded/${fileName}`. The file name should be received as a query string parameter.
CDK Stack Permissions: Update the ImportServiceStack to include necessary IAM policies allowing the Lambda function to interact with the specified S3 bucket.
Return Signed URL: Ensure the Lambda function responds with the created Signed URL.
Frontend Integration: Update the frontend configuration to integrate the new Lambda endpoint under the import API path.

## Task 5.3 
Lambda Function Creation: Define another Lambda function named importFileParser within the ImportServiceStack, which will be triggered by an S3 event.
S3 Event Configuration: Configure the function trigger to respond to s3:ObjectCreated:* events, specifically for objects created in the uploaded folder of your S3 bucket.
Function Implementation: The importFileParser function should use a readable stream to retrieve objects from S3, parse them using the csv-parser package, and log each record for visibility in CloudWatch.

## Additional (optional) tasks 
+10 (for JS only) - async/await is used in lambda functions
+10 (All languages) - importProductsFile lambda is covered by unit tests. (for JS only) aws-sdk-mock can be used to mock S3 methods
+10 (All languages) - At the end of the stream the lambda function should move the file from the uploaded folder into the parsed folder (move the file means that file should be copied into a new folder in the same bucket called parsed, and then deleted from uploaded folder)


# Useful commands

* `npm run build`   compile typescript to js
* `npm run watch`   watch for changes and compile
* `npm run test`    perform the jest unit tests
* `npx cdk deploy`  deploy this stack to your default AWS account/region
* `npx cdk diff`    compare deployed stack with current state
* `npx cdk synth`   emits the synthesized CloudFormation template
