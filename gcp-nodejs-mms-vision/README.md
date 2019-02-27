# gcp-nodejs-mms-vision

This project demonstrates some of Ytel's API capababilities, notably the use of 
callbacks on inbound messages, the handling of MMS attachments, and sending an outbound SMS. Once set up,
you will be able to send a JPG or PNG as a MMS from your handset to a Ytel
number supporting MMS, which will result in a SMS response with some label detection results powered by
[Cloud Vision](https://cloud.google.com/vision/). 

![gcp-nodejs-mms-vision](https://user-images.githubusercontent.com/1994863/53471176-ac8c1b00-3a18-11e9-8848-5d71d808f3bb.png)


For simplicity's sake, this project uses The Serverless Framework to 
package and deploy the HTTP-triggered Google Cloud Function.
Rather than setting up the entire project, you can also simply [view the source](https://github.com/Ytel-Inc/ytel-api-examples/blob/master/gcp-nodejs-mms-vision/index.js), which is lightly commented and relatively straightforward.

## Prerequisites
* Google Cloud Platform Account
  * Enable Vision API
* Node.js v6.50 or later
* Ytel API Account
  * Base64-encoded Credentials
  * Provisioned Number with MMS Support

## Quickstart
Install Serverless Framework and setup the [Google credentials](https://serverless.com/framework/docs/providers/google/guide/credentials/) to use.
```
npm i -g serverless
```
From project root, copy the template file and modify values as necessary, namely the GCP `project`, GCP `credentials` path, and base64 encoded Ytel API `AUTH_CREDENTIALS`. 
```
cp env.yml.template env.yml
```

Install dependencies.
```
npm i
```
Deploy.
```
sls deploy
```
Your output should look something like this
```
Serverless: Packaging service...
Serverless: Excluding development dependencies...
Serverless: Compiling function "mmsHandler"...
Serverless: Uploading artifacts...
Serverless: Artifacts successfully uploaded...
Serverless: Updating deployment...
Serverless: Checking deployment update progress...
...................
Serverless: Done...
Service Information
service: gcp-nodejs-mms-vision
project: yourproject-619858
stage: dev
region: us-central1

Deployed functions
mmsHandler
  https://us-central1-yourproject-619858.cloudfunctions.net/inboundHandler

```
Use the value of `endpoints` as the SMS Request URL under the SMS Settings for the Ytel number. You can also simulate a callback via command line or a tool like Postman or Insomnia.

Via cURL:
```
curl -d To=+16191234567 -d From=+18581234567 -d MediaURL=https://upload.wikimedia.org/wikipedia/commons/9/98/PyramidOfTheMoonTeotihuacan.jpg https://us-central1-yourproject-619858.cloudfunctions.net/inboundHandler
```

Via HTTPie:
```
http -f https://us-central1-yourproject-619858.cloudfunctions.net/inboundHandler To=+16191234567 From=+18581234567 MediaURL=https://upload.wikimedia.org/wikipedia/commons/9/98/PyramidOfTheMoonTeotihuacan.jpg
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
