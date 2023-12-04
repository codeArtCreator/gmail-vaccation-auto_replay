const { google } = require("googleapis");
const gmailModel = require("../Model/gmailModel");

async function processUnrepliedMessages(auth, labelId) {
    const gmail = google.gmail({ version: "v1", auth });
    const messages = await gmailModel.getUnrepliedMessages(auth);

    if (messages && messages.length > 0) {
        for (const message of messages) {
            const messageData = await gmail.users.messages.get({
                auth,
                userId: "me",
                id: message.id,
            });

            const hasReplied = messageData.data.payload.headers.some(
                (header) => header.name === "In-Reply-To"
            );

            if (!hasReplied) {
                const replyMessage = {
                    userId: "me",
                    resource: {
                        raw: Buffer.from(
                            `To: ${messageData.data.payload.headers.find(
                                (header) => header.name === "From"
                            ).value}\r\n` +
                            `Subject: Re: ${messageData.data.payload.headers.find(
                                (header) => header.name === "Subject"
                            ).value}\r\n` +
                            `Content-Type: text/plain; charset="UTF-8"\r\n` +
                            `Content-Transfer-Encoding: 7bit\r\n\r\n` +
                            `Thank you for your email. I'm currently on vacation and will reply to you when I return.\r\n`
                        ).toString("base64"),
                    },
                };

                await gmail.users.messages.send(replyMessage);

                await gmail.users.messages.modify({
                    auth,
                    userId: "me",
                    id: message.id,
                    resource: {
                        addLabelIds: [labelId],
                        removeLabelIds: ["INBOX"],
                    },
                });
            }
        }
    }
}

async function startProcessing(auth) {
    const labelId = await gmailModel.createLabel(auth);

    setInterval(async () => {
        await processUnrepliedMessages(auth, labelId);
    }, Math.floor(Math.random() * (120 - 45 + 1) + 45) * 1000);
}



module.exports = {
    startProcessing,
};
