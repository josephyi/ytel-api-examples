# aws-nodejs-mms-rekognition

This project demonstrates some of Ytel's API capababilities, notably the use of 
callbacks on inbound messages, the handling of MMS attachments, and sending an outbound SMS. Once set up,
you will be able to send a JPG or PNG as a MMS from your handset to a Ytel
number supporting MMS, which will result in a SMS response with some label detection results powered by
[AWS Rekognition](https://aws.amazon.com/rekognition/). 

![blank network diagram 3](https://user-images.githubusercontent.com/1994863/53393931-8a2fca00-3952-11e9-9c84-90fc6ddfda77.png)


For simplicity's sake, this project uses The Serverless Framework to 
set up the HTTP endpoint, deploy the code in an AWS Lambda function, and grant fine-grained permissions to use Rekognition.
Rather than setting up the entire project, you can also simply [view the source](https://github.com/Ytel-Inc/ytel-api-examples/blob/master/aws-nodejs-mms-rekognition/index.js), which is lightly commented and relatively straightforward.

## Prerequisites
* AWS Account
* Node.js v6.50 or later
* Ytel API Account
  * Base64-encoded Credentials
  * Provisioned Number with MMS Support

## Quickstart
Install Serverless Framework and setup the [AWS credentials](https://serverless.com/framework/docs/providers/aws/guide/credentials/) to use.
```
npm i -g serverless
```

From project root, copy the template file and modify as necessary. You will need to supply the `AUTH_CREDENTIALS`. 
```
cp env.yml.template env.yml
```

Install dependencies.
```
npm i
```
From this point, you can test locally, changing the `To` to your Ytel number, and the `From` to your personal number.
```
sls invoke local --function mmsHandler --data '{"body":"To=+16191234567&From=+18581234567&MediaURL=https://upload.wikimedia.org/wikipedia/commons/9/98/PyramidOfTheMoonTeotihuacan.jpg"}'
```
Deploy.
```
sls deploy
```
Your output should look something like this
```
Serverless: Packaging service...
Serverless: Excluding development dependencies...
Serverless: Uploading CloudFormation file to S3...
Serverless: Uploading artifacts...
Serverless: Uploading service aws-nodejs-mms-rekognition.zip file to S3 (6.73 MB)...
Serverless: Validating template...
Serverless: Updating Stack...
Serverless: Checking Stack update progress...
..........
Serverless: Stack update finished...
Service Information
service: aws-nodejs-mms-rekognition
stage: dev
region: us-east-1
stack: aws-nodejs-mms-rekognition-dev
resources: 10
api keys:
  None
endpoints:
  POST - https://qpc1e7ocjp.execute-api.us-east-1.amazonaws.com/dev/handle
functions:
  mmsHandler: aws-nodejs-mms-rekognition-dev-mmsHandler
layers:
  None
```
Use the value of `endpoints` as the SMS Request URL under the SMS Settings for the Ytel number. You can also simulate a callback via command line or a tool like Postman or Insomnia.

Via cURL:
```
curl -d To=+16191234567 -d From=+18581234567 -d MediaURL=https://upload.wikimedia.org/wikipedia/commons/9/98/PyramidOfTheMoonTeotihuacan.jpg https://qpc1e7ocjp.execute-api.us-east-1.amazonaws.com/dev/handle
```

Via HTTPie:
```
http -f https://qpc1e7ocjp.execute-api.us-east-1.amazonaws.com/dev/handle To=+16191234567 From=+18581234567 MediaURL=https://upload.wikimedia.org/wikipedia/commons/9/98/PyramidOfTheMoonTeotihuacan.jpg
```

## Ytel API Authentication

This demo assumes you have already converted your `AccountSid` and `AuthToken` to base64-encoded credentials. For your convenience, the [Ytel API Dashboard](https://portal.ytel.com/docs/v3/Dashboard/index) has a button to copy the `{AccountSid}:{AuthToken}`, which you can encode yourself, or you can try using the [API Documentation](https://docs.ytel.com/reference/sms#sendsms), which will have the token generated in the sample code.

To generate it yourself, given the following AccountSid and AuthToken:

| AccountSid | AuthToken |
| --- | --- |
| 1e2eff2c-3927-11e9-a551-671bc9b3471c | d1ebef211a74479z01e6b91b8e9j21dz |

In `{AccountSid}:{AuthToken}` form, e.g.:
```
1e2eff2c-3927-11e9-a551-671bc9b3471c:d1ebef211a74479z01e6b91b8e9j21dz
```

Encode via Command line:
```sh
echo -n 1e2eff2c-3927-11e9-a551-671bc9b3471c:d1ebef211a74479z01e6b91b8e9j21dz | base64 -w 0
```

Encode via Node.js:
```javascript
Buffer.from('1e2eff2c-3927-11e9-a551-671bc9b3471c:d1ebef211a74479z01e6b91b8e9j21dz').toString('base64');
```
The result for either should be:
```
MWUyZWZmMmMtMzkyNy0xMWU5LWE1NTEtNjcxYmM5YjM0NzFjOmQxZWJlZjIxMWE3NDQ3OXowMWU2YjkxYjhlOWoyMWR6
```
