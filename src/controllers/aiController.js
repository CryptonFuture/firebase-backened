const client = require("../config/openai");
const geni = require("../config/geni");

const { db } = require("../config/firebase");

exports.askAI = async (req, res) => {
    try {
        const { prompt } = req.body;

        const response = await client.responses.create({
            model: "gpt-4.1",
            input: prompt
        });

        const answer = response.output_text;

        await db.collection("chatHistory").add({
            uid: req.user.uid,
            prompt,
            answer,
            createdAt: new Date()
        });

       return res.json({
            success: true,
            answer
        });

    } catch (err) {
        console.log(err);
       return res.status(500).json({
            error: err.message
        });

    }

}

exports.geniChat = async (req, res) => {

    try {

        const { prompt } = req.body;

        if (!prompt) {

            return res.status(400).json({
                success: false,
                message: "Prompt Required"
            });

        }

        const response = await geni.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
        });

        res.json({
            success: true,
            response: response.text,
        });

    } catch (err) {

        res.status(500).json({
            success: false,
            error: err.message,
        });

    }

};
