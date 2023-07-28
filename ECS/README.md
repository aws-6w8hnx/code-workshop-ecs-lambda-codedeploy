# Tutorial: Deploy an Amazon ECS Service

### Before (Blue):
<img width="750" alt="image" src="https://github.com/aws-6w8hnx/code-workshop-ecs-lambda-codedeploy/assets/29943707/1c477eb7-50a2-49ec-be89-b869659453e5">


### After (Green):

<img width="750" alt="image" src="https://github.com/aws-6w8hnx/code-workshop-ecs-lambda-codedeploy/assets/29943707/6c5d7dd3-bfcd-44fc-b24e-7de3f0dce4db">


---

Step :one: : Set up your infrastructure

1. Clone the repo, run the command: `git clone https://github.com/aws-6w8hnx/code-workshop-ecs-lambda-codedeploy.git`
2. Install cdk module, and run the command: `cd ECS/ && npm update`
3. run the command: `cdk deploy --all --require-approval never`
4. After you successfully deploy the app, you should see Simple PHP App website via ALB DNS Name:
<img width="750" alt="image" src="https://github.com/aws-6w8hnx/code-workshop-ecs-lambda-codedeploy/assets/29943707/388164f5-8311-4024-8760-5808cc4b704b">



Step :two: : Create a new Task Definition and update the `appspec.yml` file
- Create a new Task Definition:
1. Go to ECS Console, open the Cluster, then click **Tasks** Tab
2. Click the Task Definition open it, select it and click **Create revision with JSON**,
3. Replace the image URL from `amazon/amazon-ecs-sample` to `nginx:alpine3.17`, then click **Create**. Now you will get a new revision of the Task Definition.

- Update `appspec.yml`:
1. Open the `appspec.yml` file under assets DIR
2. Replace the current TaskDef Arn with your Own Arn (The one created in previous step 3), for example, `arn:aws:ecs:us-east-1:117645918752:task-definition/cdkcodeworkshopecsdeploystackcodeDeployTaskDef204EFDF9:2` and save the file.


Step :three: : Deploy your Amazon ECS application:
1. Open CodeDeploy Console, and click **Application** on the left,
2. Click the Application Name we created before,
3. Click the Deployment group to open it,
4. Click **Create deployment**
5. Revision type select "**Use AppSpec editor**" and YAML as AppSpec language, then copy and paste the appspec.yml content below.
6. Click **Create deployment**

Step :four: : View CodeDeploy deployment status
1. Monitor Deployment status,
2. Once the deployment is in Step 2, then click **Reroute traffic**
<img width="750" alt="image" src="https://github.com/aws-6w8hnx/code-workshop-ecs-lambda-codedeploy/assets/29943707/b69204f8-5fe0-426f-bc22-b3e69c982823">


3. CodeDeploy starts to route traffic to the new task sets:
<img width="750" alt="image" src="https://github.com/aws-6w8hnx/code-workshop-ecs-lambda-codedeploy/assets/29943707/8d2ca4a2-9b78-41d0-b857-67a05af360a5">


4. Open the DNS name of the ALB to test the deployment, and keep refreshing the browser, you should see an nginx web page
![image](https://github.com/aws-6w8hnx/code-workshop-ecs-lambda-codedeploy/assets/29943707/3ca2f7a5-ee0e-4573-8c6c-002f9233d777)


5. After 5 minutes, all the traffic will be routed to the new task sets.
