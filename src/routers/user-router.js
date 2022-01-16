const express = require("express");
const User = require("../db/models/users");
const auth = require("../db/middleware/auth");
const multer = require("multer");
const sharp = require("sharp");
const { sendWelcomeEmail, sendCancelationEmail } = require("../email/accounts");
const router = new express.Router();
//sign up user
router.post("/users", async (req, res) => {
    const user = new User(req.body);

    try {
        await user.save();
        sendWelcomeEmail(user.email, user.name);
        const token = await user.generateAuthToken();
        res.status(201).send({ user, token });
    } catch (e) {
        res.status(400).send(e);
    }
});

//login user
router.post("/users/login", async (req, res) => {
    try {
        const user = await User.findByCredentials(
            req.body.email,
            req.body.password
        );
        const token = await user.generateAuthToken();
        res.send({ user, token });
    } catch (e) {
        res.status(400).send();
    }
});

//logout a user
router.post("/users/logout", auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token;
        });
        await req.user.save();

        res.send();
    } catch (e) {
        res.status(500).send();
    }
});

//logout all the users
router.post("/users/logoutAll", auth, async (req, res) => {
    try {
        req.user.tokens = [];
        await req.user.save();
        res.status(200).send();
    } catch (e) {
        res.status(500).send();
    }
});

//a users profile
router.get("/users/me", auth, async (req, res) => {
    res.send(req.user);
});
//a users profile accessed by others using id
router.get("/users/:id", async (req, res) => {
    const _id = req.params.id;

    try {
        const user = await User.findById(_id);

        if (!user) {
            return res.status(404).send();
        }

        res.send(user);
    } catch (e) {
        res.status(500).send();
    }
});

//update a user
router.patch("/users/me", auth, async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ["name", "email", "password", "age"];
    const isValidOperation = updates.every((update) =>
        allowedUpdates.includes(update)
    );

    if (!isValidOperation) {
        return res.status(400).send({ error: "Invalid updates!" });
    }

    try {
        updates.forEach((update) => (req.user[update] = req.body[update]));
        await req.user.save();

        res.send(req.user);
    } catch (e) {
        res.status(400).send(e);
    }
});

//delete a user
router.delete("/users/me", auth, async (req, res) => {
    try {
        await req.user.remove();
        sendCancelationEmail(req.user.email, req.user.name);
        res.status(200).send(req.user);
    } catch (e) {
        res.status(500).send();
    }
});

//multer to upload a avatar for user profile
const upload = multer({
    limits: {
        fileSize: 1000000,
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return cb(new Error("please upload a image."));
        }
        cb(undefined, true);
    },
});

//upload/update a avatar
router.post(
    "/users/me/avatar",
    auth,
    upload.single("avatar"),
    async (req, res) => {
        try {
            const buffer = await sharp(req.file.buffer)
                .resize({ width: 250, height: 250 })
                .png()
                .toBuffer();
            req.user.avatar = buffer;
            await req.user.save();
            res.status(200).send();
        } catch (e) {
            res.status(500).send();
        }
    },
    (error, req, res, next) => {
        res.status(400).send({ error: error.message });
    }
);

//delete a avatar
router.delete("/users/me/avatar", auth, async (req, res) => {
    try {
        req.user.avatar = undefined;
        await req.user.save();
        res.status(200).send();
    } catch (e) {
        res.status(500).send();
    }
});

//access avatar of a user
router.get("/users/:id/avatar", async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user || !user.avatar) {
            throw new Error();
        }

        res.set("Content-Type", "image/png");
        res.send(user.avatar);
    } catch {
        res.status(404).send();
    }
});

module.exports = router;
