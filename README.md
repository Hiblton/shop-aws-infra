# Task 4.1

* Use AWS Console to create two database tables in DynamoDB. Expected schemas for products and stock:

```
Product model:
  products:
    id -  uuid (Primary key)
    title - text, not null
    description - text
    price - integer
```

```
Stock model:
  stock:
    product_id - uuid (Foreign key from products.id)
    count - integer (Total number of products in stock, can't be exceeded)
```

* Write a script to fill tables with test examples. Store it in your Github repository. Execute it for your DB to fill data.


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
