const AWS = require("aws-sdk");
const qs = require("querystring");

module.exports.handler = async (event, context) => {
  const { To, From, Text } = qs.parse(event.body);

  try { 
    const lex = new AWS.LexRuntime();
    const params = {
      botAlias: process.env.BOT_ALIAS,
      botName: process.env.BOT_NAME,
      inputText: Text,
      userId: From.replace('+', ''),
      sessionAttributes: {
      }
    };
    const lexResponse = await lex.postText(params).promise();
    console.log(lexResponse);
    const sqs = new AWS.SQS();
    const MessageBody = JSON.stringify({To: From, From: To, Body: lexResponse.message });
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
    console.log(error);
    return {
        statusCode: 500,
        body: error
    }
  }
};
