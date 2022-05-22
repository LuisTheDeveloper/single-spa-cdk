import "source-map-support/register";
import { App } from "aws-cdk-lib";
import { StaticSiteStack } from "./staticsite.cdk"

const app = new App();
const env = {
    account: app.node.tryGetContext("account"),
    region: app.node.tryGetContext("region"),
  };
const bitbucketRepo: string = app.node.tryGetContext("bitbucketRepo");

new StaticSiteStack(app, "FrontEndSPA", {
    env,
    stackName: `${bitbucketRepo}-test-frontend-spa`,
    bucketName: `${bitbucketRepo}-test-frontend-spa`.toLowerCase(),
    websiteSource: "../../../frontend/dist",
    websiteRedirect: "/root-config/dist/index.html",
    allowedIPs: [
      "84.65.31.248"
    ],
  });

