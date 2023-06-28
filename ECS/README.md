# Tutorial: Deploy an Amazon ECS Service

### Before (Blue):
![image](https://github.com/aws-6w8hnx/code-workshop-ecs-lambda-codedeploy/assets/29943707/8006439b-d42b-405d-9b55-b2d12fecf46c)

### After (Green):

![image](https://github.com/aws-6w8hnx/code-workshop-ecs-lambda-codedeploy/assets/29943707/41bf772a-185e-47b7-8313-0ce663d6ec72)

---

Step :one: : Set up your infrastructure

1. Clone the repo, run the command: `git clone https://github.com/aws-6w8hnx/code-workshop-ecs-lambda-codedeploy.git`
2. Install cdk module, and run the command: `cd ECS/ && npm update`
3. run the command: `cdk deploy --all --require-approval never`
4. After you successfully deploy the app, you should see Simple PHP App website via ALB DNS Name:
<img width="617" alt="image" src="https://github.com/aws-k68pex/code-training-ecs-deploy/assets/29943707/b939a603-c257-46dd-b8ec-8f27a19e05e2">


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
<img width="1039" alt="image" src="https://github.com/aws-k68pex/code-training-ecs-deploy/assets/29943707/e872c470-fe71-4d9a-acbb-3ccae107b09d">

3. CodeDeploy starts to route traffic to the new task sets:
<img width="1039" alt="image" src="https://github.com/aws-k68pex/code-training-ecs-deploy/assets/29943707/3a3684fe-67ce-4541-92bb-68e54cbbe0f9">

4. Open the DNS name of the ALB to test the deployment, and keep refreshing the browser, you should see an nginx web page
<img width="767" alt="image" src="https://github.com/aws-k68pex/code-training-ecs-deploy/assets/29943707/42e03d9c-616e-4979-b25d-101e76a0241e">

5. After 5 minutes, all the traffic will be routed to the new task sets.
