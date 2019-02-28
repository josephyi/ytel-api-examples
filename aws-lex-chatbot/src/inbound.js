const AWS = require("aws-sdk");
const qs = require("querystring");

module.exports.handler = async (event, context) => {
  const { To, From, Text } = qs.parse(event.body);
  const sqs = new AWS.SQS();

  try {
    const MessageBody = JSON.stringify({To: From, From: To, Body: Text });
    const response = await sqs
      .sendMessage({ MessageBody, QueueUrl: process.env.QUEUE_URL })
      .promise();

    return {
      statusCode: 200,
      body: JSON.stringify({
        response
      })
    };
  } catch (error) {
    return {
        statusCode: 500,
        body: JSON.stringify({error})
    }
  }
};
