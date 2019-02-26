const AWS = require("aws-sdk");
const qs = require("querystring");
const rekognition = new AWS.Rekognition();
const https = require("https");

module.exports.handler = async (event, context) => {
  // Parse callback's parameters, sent from an Inbound SMS callback
  const incoming = qs.parse(event.body);

  try {
    // Convert MMS image URL to base64 for Rekognition
    const bytes = await base64ImageBuffer(incoming.MediaURL);

    // Send image data to Rekognition service
    const result = await detectLabels(bytes, 10, 50);

    // Prepare text message
    const message = createMessage(result.Labels.slice(0, 3));

    // Use Ytel SMS API to send Outbound SMS
    const sendResult = await sendMessage(incoming.To, incoming.From, message);

    return {
      statusCode: 200,
      body: sendResult
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify(error)
    };
  }
};

const base64ImageBuffer = url => {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith("https") ? https : require("http");
    const request = lib.get(url, response => {
      if (response.statusCode < 200 || response.statusCode > 299) {
        reject(new Error(`Status Code: ${response.statusCode} for - ${url}`));
      }
      const chunks = [];
      response.setEncoding("base64");
      response.on("data", chunk => chunks.push(Buffer.from(chunk, "base64")));
      response.on("end", () => resolve(Buffer.concat(chunks)));
    });
    request.on("error", err => reject(err));
  });
};

const createMessage = labels => {
  return `Rekognition sees: ${labels
    .map(e => `${e.Name} ${e.Confidence.toFixed(2)}%`)
    .join(", ")}`;
};

// This is verbose as it is not relying on any dependencies. 
const sendMessage = (from, to, message) => {
  const data = JSON.stringify({
    From: from,
    To: to,
    Body: message
  });

  const options = {
    hostname: "api.message360.com",
    port: 443,
    path: "/api/v3/sms/sendsms.json",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": data.length,
      Authorization: `Basic ${process.env.AUTH_CREDENTIALS}`
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, res => {
      const chunks = [];
      res.on("data", d => {
        chunks.push(d);
      });
      res.on("end", () => resolve(chunks.join("")));
    });

    req.on("error", err => reject(err));
    req.write(data);
    req.end();
  });
};

const detectLabels = (Bytes, MaxLabels, MinConfidence) => {
  const params = {
    Image: {
      Bytes
    },
    MaxLabels,
    MinConfidence
  };

  return rekognition
    .detectLabels(params)
    .promise()
    .catch(error => new Error(error));
};
