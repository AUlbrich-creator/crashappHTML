const Anthropic = require("@anthropic-ai/sdk");

exports.handler = async function(event) {
  if(event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const { imageBase64, mediaType } = JSON.parse(event.body);

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const message = await client.messages.create({
      model: "claude-opus-4-5",
      max_tokens: 100,
      messages: [{
        role: "user",
        content: [
          {
            type: "image",
            source: {
              type: "base64",
              media_type: mediaType || "image/jpeg",
              data: imageBase64
            }
          },
          {
            type: "text",
            text: "Du siehst ein Foto eines deutschen Fahrzeugscheins (ZB I) oder einer Fahrzeugidentifikationsnummer. Extrahiere die FIN (Fahrzeugidentifikationsnummer, auch VIN genannt). Die FIN steht bei Feld E im Fahrzeugschein und ist genau 17 Zeichen lang aus Buchstaben und Zahlen (kein I, O, Q). Antworte NUR mit den 17 Zeichen der FIN, ohne Leerzeichen oder Erklärung. Falls keine FIN erkennbar: NICHT_ERKANNT"
          }
        ]
      }]
    });

    const fin = message.content[0].text.trim().toUpperCase().replace(/\s/g, "");

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fin: fin })
    };

  } catch(err) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: err.message, fin: "NICHT_ERKANNT" })
    };
  }
};
