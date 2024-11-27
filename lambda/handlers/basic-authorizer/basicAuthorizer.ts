import { APIGatewayTokenAuthorizerEvent, APIGatewayAuthorizerResult } from 'aws-lambda';

export const handler = async (event: APIGatewayTokenAuthorizerEvent): Promise<APIGatewayAuthorizerResult> => {
    console.log("event.authorizationToken", event.authorizationToken);

    if (!event.authorizationToken) {
        return generatePolicy('user', 'Deny', event.methodArn);
    }

    const [, token] = event.authorizationToken.split(' ');
    const [username, password] = Buffer.from(token, 'base64').toString('utf-8').split(':');

    if (!username || !password) {
        return generatePolicy('user', 'Deny', event.methodArn);
    }

    if (process.env[username] !== password) {
        return generatePolicy('user', 'Deny', event.methodArn);
    }

    return generatePolicy('user', 'Allow', event.methodArn);
};

function generatePolicy(principalId: string, effect: 'Allow' | 'Deny', resource: string): APIGatewayAuthorizerResult {
    return {
        principalId: principalId,
        policyDocument: {
            Version: '2012-10-17',
            Statement: [{
                Action: 'execute-api:Invoke',
                Effect: effect,
                Resource: resource
            }]
        }
    };
}
