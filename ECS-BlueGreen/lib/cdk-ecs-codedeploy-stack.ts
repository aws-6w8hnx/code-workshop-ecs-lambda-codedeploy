import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import * as codedeploy from "aws-cdk-lib/aws-codedeploy";
import * as path from 'path';
import { Construct } from 'constructs';

export class ecsCodeDeployStack extends cdk.Stack {
  public readonly vpc:   ec2.IVpc;
  public readonly albSG: ec2.ISecurityGroup;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    this.vpc = new ec2.Vpc (this, "codeVpc", {
      natGateways: 1,
    });

    // ALB and it's Security Group
    this.albSG = new ec2.SecurityGroup(this, 'ALBSecurityGroup', {
      vpc: this.vpc,
      allowAllOutbound: true,
    });
    this.albSG.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(80), 'allow inbound http rule');

    const alb = new elbv2.ApplicationLoadBalancer(this, "codeAlb", {
      vpc:              this.vpc,
      internetFacing:   true,
      securityGroup:    this.albSG,
    });

    // Two Target Groups:
    const blueTargetGroup = new elbv2.ApplicationTargetGroup(this, 'blueTargetGroup', {
      vpc: alb.vpc,
      port: 80,
      protocol: elbv2.ApplicationProtocol.HTTP,
      targetType: elbv2.TargetType.IP,
    });
    blueTargetGroup.configureHealthCheck({
      port: 'traffic-port',
      path: '/',
      protocol: elbv2.Protocol.HTTP,
    });

    const greenTargetGroup = new elbv2.ApplicationTargetGroup(this, 'greenTargetGroup', {
      vpc: alb.vpc,
      port: 80,
      protocol: elbv2.ApplicationProtocol.HTTP,
      targetType: elbv2.TargetType.IP,
    });
    greenTargetGroup.configureHealthCheck({
      port: 'traffic-port',
      path: '/',
      protocol: elbv2.Protocol.HTTP,
    });

    // One Prod listener:
    const ProdListener = alb.addListener('ProdListener', {
      port: 80,
      defaultTargetGroups: [blueTargetGroup],
    });

    // One Test listener:
    const TestListener = alb.addListener('TestListener', {
      port: 8080,
      defaultTargetGroups: [blueTargetGroup],
    });

    new s3.Bucket(this, 'Bucket', {
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      encryption: s3.BucketEncryption.S3_MANAGED,
      enforceSSL: true,
      versioned:  true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      // set object ownership to BUCKET_OWNER_PREFERRED - s3 changes on 1st April 2023
      objectOwnership: s3.ObjectOwnership.BUCKET_OWNER_PREFERRED,
    });

    // Step 3: Create a lifecycle hook Lambda function
    const fn = new lambda.Function(this, 'Function', {
      runtime: lambda.Runtime.NODEJS_18_X,
      memorySize: 1024,
      handler: 'index.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../assets')),
      timeout: cdk.Duration.minutes(10),
      environment: {
        REGION: cdk.Stack.of(this).region,
      },
    });

    // 👇 create a policy statement - codedeploy:PutLifecycleEventHookExecutionStatus
    const fnPolicy = new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: ['codedeploy:PutLifecycleEventHookExecutionStatus'],
      resources: ['*'],
    });

    // 👇 attach the policy to the function's role
    fn.role?.attachInlinePolicy(
      new iam.Policy(this, 'list-buckets', {
        statements: [fnPolicy],
      }),
    );

    const cluster = new ecs.Cluster(this, 'codeDeployCluster', {
      vpc:                this.vpc,
      containerInsights:  true,
    });

    const taskDef = new ecs.FargateTaskDefinition(this, 'codeDeployTaskDef', {});
    const container = taskDef.addContainer('sample', {
      containerName: 'amazonSample',
      image:          ecs.ContainerImage.fromRegistry('amazon/amazon-ecs-sample'),
      logging:        ecs.LogDrivers.awsLogs({ streamPrefix: 'ecsCodeDeployLogGroup', logRetention: 7 }),
    });
    container.addPortMappings({
      containerPort: 80,
    });

    const service = new ecs.FargateService(this, 'blueService', {
      cluster,
      taskDefinition:       taskDef,
      enableExecuteCommand: true,
      deploymentController: {
        type: ecs.DeploymentControllerType.CODE_DEPLOY,
      },
    });
    blueTargetGroup.addTarget(service);

    new codedeploy.EcsDeploymentGroup(this, 'BlueGreenDG', {
      service,
      autoRollback: {
        // CodeDeploy will automatically roll back if the 8-hour approval period times out and the deployment stops
        stoppedDeployment: true,
      },
      blueGreenDeploymentConfig: {
        // The deployment will wait for approval for up to 8 hours before stopping the deployment
        deploymentApprovalWaitTime: cdk.Duration.hours(2),
        blueTargetGroup,
        greenTargetGroup,
        listener: ProdListener,
        testListener: TestListener,
      },
      // CANARY_10PERCENT_5MINUTES - Traﬃc is shifted in two increments
      // LINEAR_10PERCENT_EVERY_3MINUTES - Traﬃc is shifted in equal increments with an equal number of minutes between each increment
      // ALL_AT_ONCE - All traﬃc is shifted from the original task set to the updated task set all at once
      deploymentConfig: codedeploy.EcsDeploymentConfig.CANARY_10PERCENT_15MINUTES,
    });
  }
}
