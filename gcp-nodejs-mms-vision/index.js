const https = require("https");
const vision = require("@google-cloud/vision");

exports.inboundHandler = async (req, res) => {
  // Get parameters from Inbound SMS callback
  const { To, From, MediaURL } = req.body;

  // Detect labels via Vision API
  const labels = await detectLabels(MediaURL);

  // Prepare text message
  const message = createMessage(labels.slice(0, 3));

  // Use Ytel SMS API to send Outbound SMS
  const sendResult = await sendMessage(To, From, message);

  res.send(sendResult);
};

const detectLabels = async imageUri => {
  const request = {
    image: {
      source: { imageUri }
    }
  };
  const client = new vision.ImageAnnotatorClient();
  const [result] = await client.labelDetection(request);

  return result.labelAnnotations;
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

const createMessage = labels => {
  return `Vision sees: ${labels
    .map(e => `${e.description} ${(e.score * 100).toFixed(2)}%`)
    .join(", ")}`;
};
