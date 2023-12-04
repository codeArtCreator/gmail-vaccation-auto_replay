const { authenticate } = require("@google-cloud/local-auth");
const { google } = require("googleapis");
const path = require("path");

const SCOPES = [
    "https://www.googleapis.com/auth/gmail.readonly",
    "https://www.googleapis.com/auth/gmail.send",
    "https://www.googleapis.com/auth/gmail.labels",
    "https://mail.google.com/",
];

const labelName = "Vacation Auto-Reply";

async function authenticateGmail() {
    return authenticate({
        keyfilePath: path.join(__dirname, '../credentials.json'),
        scopes: SCOPES,
    });
}

async function getUnrepliedMessages(auth) {
    const gmail = google.gmail({ version: "v1", auth });
    const response = await gmail.users.messages.list({
        userId: "me",
        labelIds: ["INBOX"],
        q: "is:unread",
    });
    return response.data.messages || [];
}

async function createLabel(auth) {
    const gmail = google.gmail({ version: "v1", auth });
    try {
        const response = await gmail.users.labels.create({
            userId: "me",
            requestBody: {
                name: labelName,
                labelListVisibility: "labelShow",
                messageListVisibility: "show",
            },
        });
        return response.data.id;
    } catch (error) {
        if (error.code === 409) {
            const response = await gmail.users.labels.list({
                userId: "me",
            });
            const label = response.data.labels.find(
                (label) => label.name === labelName
            );
            return label.id;
        } else {
            throw error;
        }
    }
}

module.exports = {
    authenticateGmail,
    getUnrepliedMessages,
    createLabel,
};
