const mailgun = require("mailgun-js");
const DOMAIN = "sandbox48ab92736c6d405ba5453898481aa10e.mailgun.org";
const mg = mailgun({
    apiKey: "94eb2a7b73bcd123b584ffd50d6fa587-dbdfb8ff-12cd4f8b",
    domain: DOMAIN,
});

const sendWelcomeEmail = (email, name) => {
    const data = {
        from: "alias_mailbox_3.overeyebrowed@slmail.me",
        to: email,
        subject: "welcome to task manager app.",
        text: `welcome again ${name}, and take a look around.`,
    };
    mg.messages().send(data, function (error, body) {
        console.log(body);
    });
};

const sendCancelationEmail = (email, name) => {
    const data = {
        from: "alias_mailbox_3.overeyebrowed@slmail.me",
        to: email,
        subject: "Sad to see you go.",
        text: `Goodbye, ${name},let us know if we can do something to keep you.`,
    };
    mg.messages().send(data, function (error, body) {
        console.log(body);
    });
};

module.exports = {
    sendWelcomeEmail,
    sendCancelationEmail,
};
