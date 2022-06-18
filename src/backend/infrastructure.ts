import { Duration } from 'aws-cdk-lib';
import {
  RestApi,
  LambdaIntegration,
  EndpointType,
  MethodLoggingLevel,
  // CognitoUserPoolsAuthorizer,
  // AuthorizationType,
} from 'aws-cdk-lib/aws-apigateway';
// import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Architecture, Runtime } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';

// interface InfrastructureProps {
//   readonly userPool: cognito.IUserPool;
// }

export class Infrastructure extends Construct {
  public readonly apiUrl: string;

  // constructor(scope: Construct, id: string, props: InfrastructureProps) {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    const infrastructureRole = new iam.Role(this, 'infrastructureRole', {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      inlinePolicies: {
        ['chimePolicy']: new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              resources: ['*'],
              actions: ['chime:*'],
            }),
          ],
        }),
      },
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName(
          'service-role/AWSLambdaBasicExecutionRole',
        ),
      ],
    });

    const meetingInfoLambda = new NodejsFunction(this, 'meetingInfoLambda', {
      entry: 'resources/meetingInfo/meetingInfo.js',
      depsLockFilePath: 'resources/meetingInfo/package-lock.json',
      bundling: {
        externalModules: ['aws-sdk'],
        nodeModules: ['uuid'],
      },
      runtime: Runtime.NODEJS_16_X,
      architecture: Architecture.ARM_64,
      role: infrastructureRole,
      timeout: Duration.seconds(60),
      environment: {},
    });

    const api = new RestApi(this, 'ChimeSDKMeetingAPI', {
      defaultCorsPreflightOptions: {
        allowHeaders: [
          'Content-Type',
          'X-Amz-Date',
          'Authorization',
          'X-Api-Key',
        ],
        allowMethods: ['OPTIONS', 'POST'],
        allowCredentials: true,
        allowOrigins: ['*'],
      },
      deployOptions: {
        loggingLevel: MethodLoggingLevel.INFO,
        dataTraceEnabled: true,
      },
      endpointConfiguration: {
        types: [EndpointType.REGIONAL],
      },
    });

    // const auth = new CognitoUserPoolsAuthorizer(this, 'auth', {
    //   cognitoUserPools: [props.userPool],
    // });

    const dial = api.root.addResource('meeting');

    const meetingInfoIntegration = new LambdaIntegration(meetingInfoLambda);

    dial.addMethod('POST', meetingInfoIntegration, {
      // authorizer: auth,
      // authorizationType: AuthorizationType.COGNITO,
    });

    this.apiUrl = api.url;
  }
}
