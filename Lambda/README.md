# code-workshop-lambda-deploy

## Step 1: Set up your infrastructure

1. Create an s3 bucket in your account:
- Name: `code-workshop-lambda-deploy-117645918752-us-east-1-s3`

2. In the Lambda directory, run the following:
```
sam package \
  --template-file template.yml \
  --output-template-file package.yml \
  --s3-bucket code-workshop-lambda-deploy-117645918752-us-east-1-s3
```

3. In the root directory, run the following:
```
sam deploy \
  --template-file package.yml \
  --stack-name code-workshop-lambda-deploy \
  --capabilities CAPABILITY_IAM
```

4. Test your function (AWS CLI)
```
aws lambda invoke \
--cli-binary-format raw-in-base64-out \
--payload "{\"option\": \"date\", \"period\": \"today\"}" out-v1.txt \
--function code-workshop-lambda-deploy-myDateTimeFunction-gAwFpDza2W96
```

* Sample Output:
```
{"statusCode":200,"headers":{"Content-type":"application/json"},"body":"{\"month\":6,\"day\":26,\"year\":2023}"
```

## Step 2: Update the Lambda function
Description: In this step, you use the `myDateTimeFunction.js` file to deploy the updated function. This triggers CodeDeploy to deploy it by shifting production traffic from the current version of the Lambda function to the updated version.

1. Open myDateTimeFunction.js
2. Save the file: `myDateTimeFunction.js` using the below sample:
```
'use strict';

exports.handler = function(event, context, callback) {

  if (event.body) {
    event = JSON.parse(event.body);
  }

  var sc; // Status code
  var result = ""; // Response payload

  switch(event.option) {
    case "date":
      switch(event.period) {
        case "yesterday":
          result = setDateResult("yesterday");
          sc = 200;
          break;
        case "today":
          result = setDateResult();
          sc = 200;
          break;
        case "tomorrow":
          result = setDateResult("tomorrow");
          sc = 200;
          break;
        default:
          result = {
            "error": "Must specify 'yesterday', 'today', or 'tomorrow'."
          };
          sc = 400;
          break;
      }
      break;
      case "time":
        var d = new Date();
        var h = d.getHours();
        var mi = d.getMinutes();
        var s = d.getSeconds();

        result = {
          "hour": h,
          "minute": mi,
          "second": s
        };
        sc = 200;
        break;

      default:
        result = {
          "error": "Must specify 'date' or 'time'."
        };
        sc = 400;
      break;
  }

  const response = {
    statusCode: sc,
    headers: { "Content-type": "application/json" },
    body: JSON.stringify( result )
  };

  callback(null, response);

  function setDateResult(option) {

    var d = new Date(); // Today
    var mo; // Month
    var da; // Day
    var y; // Year

    switch(option) {
      case "yesterday":
        d.setDate(d.getDate() - 1);
        break;
      case "tomorrow":
        d.setDate(d.getDate() + 1);
      default:
       break;
    }

    mo = d.getMonth() + 1; // Months are zero offset (0-11)
    da = d.getDate();
    y = d.getFullYear();

    result = {
      "month": mo,
      "day": da,
      "year": y
    };

    return result;
  }
};
```

## Step 3: Deploy the updated Lambda function
Description: In this step, we use the updated `myDateTimeFunction.js` to update and initiate the deployment of your Lambda function. You can monitor the deployment progress in the CodeDeploy or AWS Lambda console.


1. In the root directory, run the following command:

```
sam package \
  --template-file template.yml \
  --output-template-file package.yml  \
  --s3-bucket code-workshop-lambda-deploy-117645918752-us-east-1-s3
```

2. After packaging, in the root directory, run the following command:
```
sam deploy \
  --template-file package.yml \
  --stack-name code-workshop-lambda-deploy \
  --capabilities CAPABILITY_IAM
```

3. Open **CodeDeploy** console to view the deployment process
The Traffic shifting progress bar and the percentages in the Original and Replacement boxes on this page display its progress.
![image](https://github.com/aws-6w8hnx/code-workshop-ecs-lambda-codedeploy/assets/29943707/926687af-c86f-4a7f-a78e-021f4fc00b6b)


4. (Optional) View traffic during a deployment (Lambda console)
5. Open the AWS Lambda console and in Aliases:
![image](https://github.com/aws-6w8hnx/code-workshop-ecs-lambda-codedeploy/assets/29943707/d55554f0-93b6-4fb3-b832-f9ee8bdd2b34)




## Step 4: View your deployment results
- Deployment Complete:
![image](https://github.com/aws-6w8hnx/code-workshop-ecs-lambda-codedeploy/assets/29943707/d03e0842-f8d6-4ecc-bb75-b3691ff4aa83)




- Use the command to test:

```
aws lambda invoke \
--cli-binary-format raw-in-base64-out \
--payload "{\"option\": \"time\"}" out-v2.txt \
--function code-workshop-lambda-deploy-myDateTimeFunction-gAwFpDza2W96
```

* Sample Output:
```
{"statusCode":200,"headers":{"Content-type":"application/json"},"body":"{\"hour\":10,\"minute\":8,\"second\":46}"}
```

## Troubleshooting:
Q: Why Deployment Status stuck `In progress`?
- **CodeDeploy** && **CloudFormation**
![image](https://github.com/aws-6w8hnx/code-workshop-ecs-lambda-codedeploy/assets/29943707/2de2d462-4d4c-40d0-89fe-86783b8e3187)


- Lambda version:
![image](https://github.com/aws-6w8hnx/code-workshop-ecs-lambda-codedeploy/assets/29943707/77f5823a-8a07-4b01-95c2-bf909fb8f6b0)

Troubleshooting Steps:
1. According this [doc](https://docs.aws.amazon.com/codedeploy/latest/userguide/deployments-view-logs.html): **Logs are not supported for AWS Lambda or Amazon ECS deployments**.
2. I checked CloudTrail, and I can see there was a `CreateLogGroup` Log Group Api call made at the time of deployment started.
3. Based on the CloudTrail Api call, I found the `"logGroupName": "/aws/lambda/CodeDeployHook_beforeAllowTraffic"`
4. Then, I open the log and it shows Error:
```
2023-06-25T11:34:11.410Z	undefined	ERROR	Uncaught Exception 	
{
    "errorType": "Runtime.ImportModuleError",
    "errorMessage": "Error: Cannot find module 'aws-sdk'\nRequire stack:\n- /var/task/beforeAllowTraffic.js\n- /var/runtime/index.mjs",
    "stack": [
        "Runtime.ImportModuleError: Error: Cannot find module 'aws-sdk'",
        "Require stack:",
        "- /var/task/beforeAllowTraffic.js",
        "- /var/runtime/index.mjs",
        "    at _loadUserApp (file:///var/runtime/index.mjs:997:17)",
        "    at async UserFunction.js.module.exports.load (file:///var/runtime/index.mjs:1032:21)",
        "    at async start (file:///var/runtime/index.mjs:1195:23)",
        "    at async file:///var/runtime/index.mjs:1201:1"
    ]
}
```
5. Found this [post](https://stackoverflow.com/questions/74792293/aws-lambda-cannot-find-module-aws-sdk-in-build-a-basic-web-application-tutoria), which mentioned that the nodejs18 using AWS SDK v3 and it does not support AWS SDK v2
6. Update the lambda code to nodejs16 or import AWS SDk v3.
7. AFter updating the lambda to nodejs16, deployment works fine
