# Task 3

link to app with connected '/products' endpoint
https://d393tsl9iif6hb.cloudfront.net/


direct link to the '/products/{id}' endpont - 200 OK
https://k0h09xn077.execute-api.eu-central-1.amazonaws.com/prod/products/7567ec4b-b10c-45c5-9345-fc73c48a80a1


direct link to the '/products/{id}' endpont - 404 Not Found
https://k0h09xn077.execute-api.eu-central-1.amazonaws.com/prod/products/7567ec4b-b10c-45c5-9345-fc73c48a80a2


Notes:
+5 - Async/await is used in lambda functions
+5 - ES6 modules are used for Product Service implementation
-4 - Custom Webpack/ESBuild/etc is manually configured for Product Service. Not applicable for preconfigured/built-in bundlers that come with templates, plugins, etc.
-4 (All languages) - SWAGGER documentation is created for Product Service
+4 (All languages) - Lambda handlers are covered by basic UNIT tests (NO infrastructure logic is needed to be covered)
+4 (All languages) - Lambda handlers (getProductsList, getProductsById) code is written not in 1 single module (file) and separated in codebase.
+4 (All languages) - Main error scenarios are handled by API ("Product not found" error).

# Welcome to your CDK TypeScript project

This is a blank project for CDK development with TypeScript.

The `cdk.json` file tells the CDK Toolkit how to execute your app.

## Useful commands

* `npm run build`   compile typescript to js
* `npm run watch`   watch for changes and compile
* `npm run test`    perform the jest unit tests
* `npx cdk deploy`  deploy this stack to your default AWS account/region
* `npx cdk diff`    compare deployed stack with current state
* `npx cdk synth`   emits the synthesized CloudFormation template
