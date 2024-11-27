# Tasks

## Task 7.1
Create a new service called authorization-service at the same level as Product and Import services. The backend project structure should look like this:
```
   backend-repository
      product-service
      import-service
      authorization-service
```
Create a lambda function called basicAuthorizer under the same config file of the Authorization Service.
This lambda should have at least one environment variable with the following credentials:
  `{yours_github_account_login}=TEST_PASSWORD`
{yours_github_account_login} - your GitHub account name. Login for test user should be your GitHub account name
TEST_PASSWORD - password string. Password for test user must be "TEST_PASSWORD"
example: johndoe=TEST_PASSWORD
This basicAuthorizer lambda should take Basic Authorization token, decode it and check that credentials provided by token exist in the lambda environment variable.
This lambda should return 403 HTTP status if access is denied for this user (invalid authorization_token) and 401 HTTP status if Authorization header is not provided.
NOTE: Do not send your credentials to the GitHub. Use .env file to add environment variables to the lambda. Add .env file to .gitignore file.
  .env file example:
    `vasiapupkin=TEST_PASSWORD`

## Task 7.2 
Add Lambda authorization to the `/import` path of the Import Service API Gateway.
Use your basicAuthorizer lambda as the Lambda authorizer

## Task 7.3 
Request from the client application to the `/import` path of the Import Service should have Basic Authorization header:
  Authorization: Basic {authorization_token}
{authorization_token} is a base64-encoded {yours_github_account_login}:TEST_PASSWORD
example: Authorization: Basic sGLzdRxvZmw0ZXs0UGFzcw==
Client should get authorization_token value from browser localStorage
  `const authorization_token = localStorage.getItem('authorization_token')`


## Additional (optional) tasks 
+30 (All languages) - Client application should display alerts for the responses in 401 and 403 HTTP statuses. This behavior should be added to the `nodejs-aws-fe-main/src/index.tsx` file.


# Useful commands

* `npm run build`   compile typescript to js
* `npm run watch`   watch for changes and compile
* `npm run test`    perform the jest unit tests
* `npx cdk deploy`  deploy this stack to your default AWS account/region
* `npx cdk diff`    compare deployed stack with current state
* `npx cdk synth`   emits the synthesized CloudFormation template
