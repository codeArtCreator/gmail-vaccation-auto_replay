const express = require("express");
const cors = require("cors");
const gmailModel = require("../Model/gmailModel");
const gmailController = require("../Controller/gmailController");

const app = express();
app.use(cors());

async function handleHomePage(req, res) {
    try {
        const auth = await gmailModel.authenticateGmail();

        // Start processing emails
        await gmailController.startProcessing(auth);

        res.json({ "Authentication": "Successful" });
    } catch (error) {
        console.error("Error:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

app.get("/", handleHomePage);


module.exports = { app }