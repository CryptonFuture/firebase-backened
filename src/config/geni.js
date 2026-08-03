const { GoogleGenAI } = require("@google/genai");

const geni = new GoogleGenAI({
    apiKey: process.env.GOOGLE_API_KEY,
});

module.exports = geni;