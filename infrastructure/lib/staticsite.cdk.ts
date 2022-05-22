import { StackProps, Stack, App, RemovalPolicy } from "aws-cdk-lib";
import { Bucket } from "aws-cdk-lib/aws-s3";
import { PolicyStatement, AnyPrincipal } from "aws-cdk-lib/aws-iam";
import { CloudFrontWebDistribution, OriginProtocolPolicy } from "aws-cdk-lib/aws-cloudfront";
import { BucketDeployment, Source } from "aws-cdk-lib/aws-s3-deployment";

/**
 * @category Doc Sites
 */
export interface StaticSiteStackProps extends StackProps {
  /**
   * A name used for the content bucket.
   */
  bucketName: string;
  /**
   * IPs to whitelist (until we have an identity/frontend setup for access).
   * Note that S3 public access settings for accounts will prevent granting public access to buckets via policies.
   */
  allowedIPs: string[];
  /**
   * Path to the source files to upload to the bucket.
   */
  websiteSource: string;
  /**
   * Index document for the website (defaults to index.html).
   */
  websiteIndexDocument?: string;
  /**
   * Redirect behavior for the website.
   */
  websiteRedirect?: string;
}

/**
 * A stack which deploys a static website stored in an S3 bucket using a CloudFront distribution.
 *
 * @category Doc Sites
 */
export class StaticSiteStack extends Stack {
  /**
   * Creates a new static site.
   *
   * @param {App} scope Parent of this stack.
   * @param {string} id The construct ID of this stack.
   * @param {StaticSiteStackProps} props Stack properties.
   */
  constructor(scope: App, id: string, props: StaticSiteStackProps) {
    super(scope, id, props);

    /**
     * TODO
     * Domain
     * TLS cert / CloudFront HTTPS
     */

    // Content bucket
    const sourceBucket = new Bucket(this, "SiteBucket", {
      bucketName: props.bucketName,
      websiteIndexDocument: props.websiteIndexDocument || "index.html",
      // The default removal policy is RETAIN.
      // This will attempt to remove the bucket (will error if not empty)
      removalPolicy: RemovalPolicy.DESTROY,
    });

    sourceBucket.addToResourcePolicy(
      new PolicyStatement({
        resources: [sourceBucket.arnForObjects("*"), sourceBucket.bucketArn],
        actions: ["s3:Get*"],
        principals: [new AnyPrincipal()],
        conditions: {
          IpAddress: {
            "aws:SourceIp": props.allowedIPs,
          },
        },
      }),
    );

    // CloudFront distribution
    const distribution = new CloudFrontWebDistribution(this, "SiteDistribution", {
      originConfigs: [
        {
          customOriginSource: {
            domainName: sourceBucket.bucketWebsiteDomainName,
            originProtocolPolicy: OriginProtocolPolicy.HTTP_ONLY,
          },
          behaviors: [
            {
              isDefaultBehavior: true,
            },
          ],
        },
      ],
    });

    // Deploy site
    new BucketDeployment(this, "DeployWithInvalidation", {
      sources: [Source.asset(props.websiteSource)],
      destinationBucket: Bucket.fromBucketArn(this, "SourceBucket", sourceBucket.bucketArn),
      distribution,
      distributionPaths: ["/*"],
    });
  }
}