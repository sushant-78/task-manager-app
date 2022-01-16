const express = require("express");
const router = new express.Router();
const Task = require("../db/models/tasks");
const auth = require("../db/middleware/auth");
//create task endpoint
router.post("/tasks", auth, async (req, res) => {
    const newTask = new Task({
        ...req.body,
        owner: req.user._id,
    });
    try {
        await newTask.save();
        res.status(200).send(newTask);
    } catch (e) {
        res.status(400).send(e);
    }
});

//read task endpoint
///tasks?completed=true
///tasks?limit=10&skip=20
///tasks?sortBy=createdAt:asc (desc= descending)
router.get("/tasks", auth, async (req, res) => {
    const match = {};
    const sort = {};

    if (req.query.completed) {
        match.completed = req.query.completed === "true";
    }

    if (req.query.sortBy) {
        const queryArr = req.query.sortBy.split(":");
        sort[queryArr[0]] = queryArr[1] === "desc" ? -1 : 1;
    }
    try {
        await req.user
            .populate({
                path: "tasks",
                match,
                options: {
                    limit: parseInt(req.query.limit),
                    skip: parseInt(req.query.skip),
                    sort,
                },
            })
            .execPopulate();
        res.status(200).send(req.user.tasks);
    } catch (e) {
        res.status(400).send(e);
    }
});

//read specific task endpoint
router.get("/tasks/:id", auth, async (req, res) => {
    const _id = req.params.id;
    try {
        const task = await Task.findOne({
            _id,
            owner: req.user._id,
        });

        if (!task) {
            return res.status(404).send();
        }
        res.status(200).send(task);
    } catch (e) {
        res.status(400).send(e);
    }
});

//update a task endpoint
router.patch("/tasks/:id", auth, async (req, res) => {
    const _id = req.params.id;
    const availableKeys = Object.keys(req.body);
    const allowedUpdates = ["completed", "description"];
    availableKeys.forEach((key) => {
        if (!allowedUpdates.includes(key)) {
            res.status(400).send("error: Invalid updates.");
        }
    });
    try {
        /* const task = await Task.findById(req.params.id); */
        const task = await Task.findOne({
            _id,
            owner: req.user._id,
        });
        if (!task) {
            return res.status(404).send();
        }
        availableKeys.forEach((currentKey) => {
            task[currentKey] = req.body[currentKey];
        });

        await task.save();

        res.status(200).send(task);
    } catch (e) {
        res.status(400).send(e);
    }
});

//delete a task endpoint
router.delete("/tasks/:id", auth, async (req, res) => {
    const _id = req.params.id;
    try {
        const task = await Task.findOneAndDelete({ _id, owner: req.user._id });
        if (!task) {
            return res.status(404).send();
        }
        res.status(200).send(task);
    } catch (e) {
        res.status(400).send(e);
    }
});

module.exports = router;
