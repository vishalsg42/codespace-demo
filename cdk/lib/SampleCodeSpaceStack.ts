import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as cognito from "aws-cdk-lib/aws-cognito";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as sqs from "aws-cdk-lib/aws-sqs";
import * as events from "aws-cdk-lib/aws-events";
import * as targets from "aws-cdk-lib/aws-events-targets";

// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class SampleCodeSpaceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create a new Cognito user pool
    const userPool = new cognito.UserPool(this, "UserPool", {
      userPoolName: "my-user-pool",
      selfSignUpEnabled: true,
      signInAliases: { email: true },
      passwordPolicy: {
        minLength: 8,
        requireLowercase: true,
        requireDigits: true,
        requireSymbols: true,
        requireUppercase: true,
      },
    });

    // Create a new DynamoDB table
    const table = new dynamodb.Table(this, "Table", {
      tableName: "my-table",
      partitionKey: { name: "id", type: dynamodb.AttributeType.STRING },
    });

    // Create a new Lambda function
    const func = new lambda.Function(this, "Function", {
      functionName: "my-function",
      runtime: lambda.Runtime.NODEJS_14_X,
      handler: "index.handler",
      code: lambda.Code.fromAsset("path/to/lambda/function"),
      environment: {
        TABLE_NAME: table.tableName,
      },
    });

    // Create a new SQS queue
    const queue = new sqs.Queue(this, "Queue", {
      queueName: "my-queue",
      retentionPeriod: cdk.Duration.days(14),
    });

    // Create a new EventBridge rule
    const rule = new events.Rule(this, "Rule", {
      ruleName: "my-rule",
      eventPattern: {
        source: ["my-source"],
      },
    });

    // Add the Lambda function as a target for the EventBridge rule
    rule.addTarget(new targets.LambdaFunction(func));
  }
}
