const express = require('express')
const router = new express.Router()
const auth = require('../middleware/auth')
const Task = require('../models/task')

//Enter task details
router.post('/tasks', auth, async (req, res) => {
    const task = new Task({
        ...req.body,
        owner: req.user._id
    })
    try {
        await task.save()
        res.status(201).send(task)
    } catch (e) {
        res.status(400).send(e)
    }
})

//Get all tasks details
router.get('/tasks', auth, async (req, res) => {
    try {
        const tasks = await Task.find({ owner: req.user._id })
        res.status(200).send(tasks)
    } catch (e) {
        res.status(500).send()
    }
})

//Get single task details by ID
router.get('/tasks/:id', auth, async (req, res) => {
    const _id = req.params.id
    try {
        const task = await Task.findOne({ _id, owner: req.user._id })
        if (!task) res.status(404).send()
        res.status(200).send(task)
    } catch (e) {
        res.status(500).send()
    }
})

//Update task details by ID
router.patch('/tasks/:id', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['completed', 'description']

    const isValidOperation = updates.every(update => allowedUpdates.includes(update))

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' })
    }

    try {
        const task = await Task.findOne({ _id: req.params.id, owner: req.user._id })

        if (!task) return res.status(404).send()

        updates.forEach(update => task[update] = req.body[update])
        await task.save()

        res.status(200).send(task)
    } catch (e) {
        res.status(400).send(e)
    }
})

//Deleting a task by ID
router.delete('/tasks/:id', auth, async (req, res) => {
    try {
        const task = await Task.findOneAndDelete({ _id: req.params.id, owner: req.user._id })

        if (!task) return res.status(404).send()

        res.status(200).send(task)
    } catch (e) {
        res.status(500).send()
    }
})

module.exports = router