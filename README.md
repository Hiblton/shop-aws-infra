# Tasks

## Task 6.1
Create a lambda function called catalogBatchProcess under the same product service stack which will be triggered by an SQS event.
Create an SQS queue called catalogItemsQueue in this stack.
Configure the SQS to trigger lambda catalogBatchProcess with 5 messages at once via batchSize property.
The lambda function should iterate over all SQS messages and create corresponding products in the products table.

## Task 6.2
Update the importFileParser lambda function in the Import Service to send each CSV record into SQS.
It should no longer log entries from the readable stream to CloudWatch.

## Task 6.3 
Create an SNS topic createProductTopic and email subscription in the product service stack.
Create a subscription for this SNS topic with an email endpoint type with your own email in there.
Update the catalogBatchProcess lambda function in the Product Service to send an event to the SNS topic once it creates products.

## Additional (optional) tasks 
+15 (All languages) - catalogBatchProcess lambda is covered by unit tests
+15 (All languages) - set a Filter Policy for SNS createProductTopic in the CDK stack and create an additional email subscription to distribute messages to different emails depending on the filter for any product attribute


# Useful commands

* `npm run build`   compile typescript to js
* `npm run watch`   watch for changes and compile
* `npm run test`    perform the jest unit tests
* `npx cdk deploy`  deploy this stack to your default AWS account/region
* `npx cdk diff`    compare deployed stack with current state
* `npx cdk synth`   emits the synthesized CloudFormation template
