const AWS = require("aws-sdk");
const req = require("request-promise-native");

module.exports.handler = async (event, context) => {
  try {
    const results = await Promise.all(
      event.Records.map(record => sendSms(JSON.parse(record.body)))
    );
    console.log(results.map(result => JSON.stringify(result)).join(","));
  } catch (error) {
    console.log(error);
  }
};

const sendSms = ({ To, From, Body }) => {
  return req({
    uri: "https://api.message360.com//api/v3/sms/sendsms.json",
    headers: {
      Authorization: `Basic ${process.env.AUTH_CREDENTIALS}`
    },
    body: { To, From, Body },
    json: true
  });
};
