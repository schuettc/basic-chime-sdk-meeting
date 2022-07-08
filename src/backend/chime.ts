import { Duration, NestedStackProps, NestedStack } from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Architecture, Runtime } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import * as chime from 'cdk-amazon-chime-resources';
import { Construct } from 'constructs';

interface ChimeProps extends NestedStackProps {
  readonly meetingsTable: dynamodb.Table;
}

export class Chime extends NestedStack {
  public readonly fromNumber: string;
  public readonly smaId: string;

  constructor(scope: Construct, id: string, props: ChimeProps) {
    super(scope, id, props);

    const smaHandlerRole = new iam.Role(this, 'smaHandlerRole', {
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

    const smaHandlerLambda = new NodejsFunction(this, 'smaHandlerLambda', {
      entry: 'src/smaHandler/smaHandler.js',
      bundling: {
        externalModules: ['aws-sdk'],
      },
      runtime: Runtime.NODEJS_14_X,
      role: smaHandlerRole,
      architecture: Architecture.ARM_64,
      timeout: Duration.seconds(60),
      environment: {
        MEETINGS_TABLE_NAME: props.meetingsTable.tableName,
      },
    });

    props.meetingsTable.grantReadWriteData(smaHandlerLambda);

    const phoneNumber = new chime.ChimePhoneNumber(this, 'phoneNumber', {
      phoneState: 'IL',
      phoneNumberType: chime.PhoneNumberType.LOCAL,
      phoneProductType: chime.PhoneProductType.SMA,
    });

    const sipMediaApp = new chime.ChimeSipMediaApp(this, 'sipMediaApp', {
      region: this.region,
      endpoint: smaHandlerLambda.functionArn,
    });

    const sipRule = new chime.ChimeSipRule(this, 'sipRule', {
      triggerType: chime.TriggerType.TO_PHONE_NUMBER,
      triggerValue: phoneNumber.phoneNumber,
      targetApplications: [
        {
          region: this.region,
          priority: 1,
          sipMediaApplicationId: sipMediaApp.sipMediaAppId,
        },
      ],
    });

    this.fromNumber = phoneNumber.phoneNumber;
    this.smaId = sipMediaApp.sipMediaAppId;
  }
}
