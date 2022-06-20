import { execSync, ExecSyncOptions } from 'child_process';
import {
  CfnOutput,
  RemovalPolicy,
  Stack,
  StackProps,
  DockerImage,
  Fn,
} from 'aws-cdk-lib';
import * as cfn from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';
import * as cr from 'aws-cdk-lib/custom-resources';
import { Construct } from 'constructs';
import { copySync } from 'fs-extra';

export class FrontEnd extends Stack {
  constructor(scope: Construct, id: string, props: StackProps = {}) {
    super(scope, id, props);

    const siteBucket = new s3.Bucket(this, 'websiteBucket', {
      publicReadAccess: false,
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    const distribution = new cfn.Distribution(this, 'CloudfrontDistribution', {
      enableLogging: true,
      minimumProtocolVersion: cfn.SecurityPolicyProtocol.TLS_V1_2_2021,
      defaultBehavior: {
        origin: new origins.S3Origin(siteBucket),
        viewerProtocolPolicy: cfn.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        cachePolicy: cfn.CachePolicy.CACHING_DISABLED,
      },
      defaultRootObject: 'index.html',
    });
    const execOptions: ExecSyncOptions = { stdio: 'inherit' };

    const bundle = s3deploy.Source.asset('./site', {
      bundling: {
        command: [
          'sh',
          '-c',
          'echo "Docker build not supported. Please install esbuild."',
        ],
        image: DockerImage.fromRegistry('alpine'),
        local: {
          tryBundle(outputDir: string) {
            try {
              execSync('esbuild --version', execOptions);
            } catch {
              /* istanbul ignore next */
              return false;
            }
            execSync(
              'cd site && yarn install --frozen-lockfile && yarn build',
              execOptions,
            );
            copySync('./site/dist', outputDir, {
              ...execOptions,
              recursive: true,
            });
            return true;
          },
        },
      },
    });

    new s3deploy.BucketDeployment(this, 'DeployBucket', {
      sources: [bundle],
      destinationBucket: siteBucket,
      distribution: distribution,
      distributionPaths: ['/*'],
    });
    const importedApiUrl = Fn.importValue('simpleChimeMeetingApiUrl');

    const cdkOutputs = { BackEnd: { apiUrl: importedApiUrl } };

    new cr.AwsCustomResource(this, 'ConfigFrontEnd', {
      onUpdate: {
        service: 'S3',
        action: 'putObject',
        parameters: {
          Body: JSON.stringify(cdkOutputs),
          Bucket: siteBucket.bucketName,
          Key: 'cdk-outputs.json',
        },
        physicalResourceId: cr.PhysicalResourceId.of(Date.now().toString()),
      },
      policy: cr.AwsCustomResourcePolicy.fromSdkCalls({
        resources: cr.AwsCustomResourcePolicy.ANY_RESOURCE,
      }),
    });

    new CfnOutput(this, 'distribution', {
      value: distribution.domainName,
    });

    new CfnOutput(this, 'siteBucket', { value: siteBucket.bucketName });
  }
}
