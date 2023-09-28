# Tutorial: Deploy an Amazon ECS service with a validation test

Ref: https://docs.aws.amazon.com/codedeploy/latest/userguide/tutorial-ecs-deployment-with-hooks.html

During an Amazon ECS deployment with validation tests, CodeDeploy uses a load balancer that is configured with two target groups: one production traffic listener and one test traffic listener.  

The following diagram shows how the load balancer, production and test listeners, target groups, and your Amazon ECS application are related before the deployment starts.  
![image](https://github.com/aws-6w8hnx/code-workshop-ecs-lambda-codedeploy/assets/29943707/3f200c01-a831-4ab0-9ff5-b6ee386e3b1f)

During an Amazon ECS deployment, there are five lifecycle hooks for testing:  
![image](https://github.com/aws-6w8hnx/code-workshop-ecs-lambda-codedeploy/assets/29943707/c1afa485-8732-4dae-a904-5f5245fe9c2b)


### List of lifecycle event hooks for an Amazon ECS deployment
Reference: https://docs.aws.amazon.com/codedeploy/latest/userguide/reference-appspec-file-structure-hooks.html#reference-appspec-file-structure-hooks-list-ecs  
1. BeforeInstall - Use to run tasks before the replacement task set is created. One target group is associated with the original task set. If an optional test listener is specified, it is associated with the original task set. A rollback is not possible at this point.
2. AfterInstall - Use to run tasks after the replacement task set is created and one of the target groups is associated with it. If an optional test listener is specified, it is associated with the original task set. The results of a hook function at this lifecycle event can trigger a rollback.
3. AfterAllowTestTraffic - Use to run tasks after the test listener serves traffic to the replacement task set. The results of a hook function at this point can trigger a rollback.
4. BeforeAllowTraffic - Use to run tasks after the second target group is associated with the replacement task set, but before traffic is shifted to the replacement task set. The results of a hook function at this lifecycle event can trigger a rollback.
5. AfterAllowTraffic - Use to run tasks after the second target group serves traffic to the replacement task set. The results of a hook function at this lifecycle event can trigger a rollback.

### Run order of hooks in an Amazon ECS deployment
In an Amazon ECS deployment, event hooks run in the following order:  
Reference: https://docs.aws.amazon.com/codedeploy/latest/userguide/reference-appspec-file-structure-hooks.html#reference-appspec-file-structure-hooks-list-ecs  
![image](https://github.com/aws-6w8hnx/code-workshop-ecs-lambda-codedeploy/assets/29943707/3e498084-0ade-421a-ac0d-cd75408a8af3)
