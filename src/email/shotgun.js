const mailgun = require("mailgun-js");
const DOMAIN = "sandbox48ab92736c6d405ba5453898481aa10e.mailgun.org";
const mg = mailgun({
    apiKey: "94eb2a7b73bcd123b584ffd50d6fa587-dbdfb8ff-12cd4f8b",
    domain: DOMAIN,
});

const data = {
    from: "Mailgun Sandbox <postmaster@sandbox48ab92736c6d405ba5453898481aa10e.mailgun.org>",
    to: "alias_mailbox_3.overeyebrowed@slmail.me",
    subject: "Hello",
    text: "Testing some Mailgun awesomeness!",
};

mg.messages().send(data, function (error, body) {
    console.log(body);
});
