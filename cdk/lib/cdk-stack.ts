/* eslint-disable @typescript-eslint/no-useless-constructor */
import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
// import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as s3Deployment from "aws-cdk-lib/aws-s3-deployment";
//import * as cdk from "@aws-cdk/core";
//import * as cloudfront from '@aws-cdk/aws-cloudfront';

export class CdkStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here

    // example resource
    // const queue = new sqs.Queue(this, 'CdkQueue', {
    //   visibilityTimeout: cdk.Duration.seconds(300)
    // });

    // S3:
    const bucket = new s3.Bucket(this, "CdkTestBucket", {
      publicReadAccess: true,
      websiteIndexDocument: "index.html",
    });

    // Deployment:
    new s3Deployment.BucketDeployment(this, "CdkDeployBucket", {
      sources: [s3Deployment.Source.asset("../build")],
      destinationBucket: bucket,
    });

    // Cloudfront
    const distribution = new cloudfront.CloudFrontWebDistribution(
      this,
      "CfDistribution",
      {
        originConfigs: [
          {
            s3OriginSource: {
              s3BucketSource: bucket,
            },
            behaviors: [{ isDefaultBehavior: true }],
          },
        ],
      }
    );
  }
}
