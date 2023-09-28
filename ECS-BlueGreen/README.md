# Tutorial: Deploy an Amazon ECS service with a validation test

Ref: https://docs.aws.amazon.com/codedeploy/latest/userguide/tutorial-ecs-deployment-with-hooks.html

During an Amazon ECS deployment with validation tests, CodeDeploy uses a load balancer that is configured with two target groups: one production traffic listener and one test traffic listener.  

The following diagram shows how the load balancer, production and test listeners, target groups, and your Amazon ECS application are related before the deployment starts.  
![image](https://github.com/aws-6w8hnx/code-workshop-ecs-lambda-codedeploy/assets/29943707/3f200c01-a831-4ab0-9ff5-b6ee386e3b1f)

During an Amazon ECS deployment, there are five lifecycle hooks for testing:  
![image](https://github.com/aws-6w8hnx/code-workshop-ecs-lambda-codedeploy/assets/29943707/c1afa485-8732-4dae-a904-5f5245fe9c2b)

## [Deployment workflow (high level) on an Amazon ECS compute platform](https://docs.aws.amazon.com/codedeploy/latest/userguide/deployment-steps-ecs.html#deployment-steps-what-happens)
![image](https://github.com/aws-6w8hnx/code-workshop-ecs-lambda-codedeploy/assets/29943707/12d036c8-0f53-4b18-94ca-490c1ba9dac6)

### [What happens during an Amazon ECS deployment](https://docs.aws.amazon.com/codedeploy/latest/userguide/deployment-steps-ecs.html#deployment-steps-what-happens)
![image](https://github.com/aws-6w8hnx/code-workshop-ecs-lambda-codedeploy/assets/29943707/a65e536e-44d3-46a8-9002-ca5e4dd91187)

| **Lifecycle event** | **Lifecycle event action** |
|:--------------------|:---------------------------|
| `BeforeInstal`l (a hook for Lambda functions) | Run Lambda functions. |
| Install| Set up the replacement task set. |
| `AfterInstall` (a hook for Lambda functions) | Run Lambda functions. |
| AllowTestTraffic | Route traffic from the test listener to target group 2. |
| `AfterAllowTestTraffic` (a hook for Lambda functions) | Run Lambda functions. |
| `BeforeAllowTraffic` (a hook for Lambda functions) | Run Lambda functions. |
| AllowTraffic | Route traffic from the production listener to target group 2. |
| `AfterAllowTraffic` (a hook for Lambda functions) | Run Lambda functions. |


### List of lifecycle event hooks for an Amazon ECS deployment
Reference: https://docs.aws.amazon.com/codedeploy/latest/userguide/reference-appspec-file-structure-hooks.html#reference-appspec-file-structure-hooks-list-ecs  
1. `BeforeInstall` - Use to run tasks before the replacement task set is created. One target group is associated with the original task set. If an optional test listener is specified, it is associated with the original task set. A rollback is not possible at this point.
2. `AfterInstall` - Use to run tasks after the replacement task set is created and one of the target groups is associated with it. If an optional test listener is specified, it is associated with the original task set. The results of a hook function at this lifecycle event can trigger a rollback.
3. `AfterAllowTestTraffic` - Use to run tasks after the test listener serves traffic to the replacement task set. The results of a hook function at this point can trigger a rollback.
4. `BeforeAllowTraffic` - Use to run tasks after the second target group is associated with the replacement task set, but before traffic is shifted to the replacement task set. The results of a hook function at this lifecycle event can trigger a rollback.
5. `AfterAllowTraffic` - Use to run tasks after the second target group serves traffic to the replacement task set. The results of a hook function at this lifecycle event can trigger a rollback.

### Run order of hooks in an Amazon ECS deployment
In an Amazon ECS deployment, event hooks run in the following order:  
Reference: https://docs.aws.amazon.com/codedeploy/latest/userguide/reference-appspec-file-structure-hooks.html#reference-appspec-file-structure-hooks-list-ecs  
![image](https://github.com/aws-6w8hnx/code-workshop-ecs-lambda-codedeploy/assets/29943707/3e498084-0ade-421a-ac0d-cd75408a8af3)

---

### Deployment Id: `d-GZWB9KKX1`


#### ECS Service Events for replacement TaskSet:
```
September 28, 2023 at 23:32 (UTC+13:00)	(service cdk-code-workshop-ecs-blue-green-deploy-stack-blueService5A3A7736-HLi72fFkWqMz, taskSet ecs-svc/6423974283189490361) updated state to STEADY_STATE.	4e66b565-12e4-4482-aab6-0da78c0643bf

September 28, 2023 at 23:31 (UTC+13:00)	(service cdk-code-workshop-ecs-blue-green-deploy-stack-blueService5A3A7736-HLi72fFkWqMz, taskSet ecs-svc/6423974283189490361) registered 1 targets in target-group cdk-co-green-Z1ZFVL7BWOWB 	14fd4f85-df66-4a33-8294-7afe1876dced    # <<< task set: 6423974283189490361 register到 TG: cdk-co-green-Z1ZFVL7BWOWB

September 28, 2023 at 23:31 (UTC+13:00)	(service cdk-code-workshop-ecs-blue-green-deploy-stack-blueService5A3A7736-HLi72fFkWqMz, taskSet ecs-svc/6423974283189490361) has started 1 tasks: task bc03abcf83c6453583837359cc641457.	b2e7b512-9b02-4e89-9708-5995bac42ebb    # <<< task set: 6423974283189490361 创建 Task ID: bc03abcf83c6453583837359cc641457

September 28, 2023 at 23:31 (UTC+13:00)	service cdk-code-workshop-ecs-blue-green-deploy-stack-blueService5A3A7736-HLi72fFkWqMz updated computedDesiredCount for taskSet ecs-svc/6423974283189490361 to 1.	7c8fdbde-c936-47ab-9f29-fb48ad182d08
```

#### Ctrail Api calls:
