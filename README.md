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

# Task 4.2 

* Extend your CDK Configuration file with data about your database table and pass it to lambda’s environment variables section.

* Integrate the getProductsList lambda to return via GET `/products` request a list of products from the database (joined stock and products tables).

* Implement a Product model on FE side as a joined model of product and stock by productId. For example:

```
BE: Separate tables in DynamoDB
  Stock model example in DB:
  {
    product_id: '19ba3d6a-f8ed-491b-a192-0a33b71b38c4',
    count: 2
  }


  Product model example in DB:
  {
    id: '19ba3d6a-f8ed-491b-a192-0a33b71b38c4'
    title: 'Product Title',
    description: 'This product ...',
    price: 200
  }
FE: One product model as a result of BE models join (product and it's stock)
  Product model example on Frontend side:
  {
    id: '19ba3d6a-f8ed-491b-a192-0a33b71b38c4',
    count: 2
    price: 200,
    title: ‘Product Title’,
    description: ‘This product ...’
  }
```

* Integrate the getProductsById lambda to return via GET `/products/{productId}` request a single product from the database.


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
