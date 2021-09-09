const express = require('express')
const router = new express.Router()
const auth = require('../middleware/auth')
const User = require('../models/user')

//Enter an user details
router.post('/users', async (req, res) => {
    const user = new User(req.body)

    try {
        const token = await user.generateAuthToken()
        await user.save()
        res.status(201).send({ user, token })
    } catch (e) {
        res.status(400).send(e)
    }
})

//Login point for the users
router.post('/users/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        res.send({ user, token })
    } catch (e) {
        res.status(400).send()
    }
})

//Get details of the logged in profile
router.get('/users/me', auth, async (req, res) => {
    res.send(req.user)
})

//Get single user details by ID
router.get('/users/:id', async (req, res) => {
    const _id = req.params.id
    try {
        const user = await User.findById(_id)
        if (!user) return res.status(404).send()
        res.status(200).send(user)
    } catch (e) {
        res.send(500).send()
    }
})

//Update an User details by ID
router.patch('/users/:id', async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'email', 'age', 'password']

    const isValidOperation = updates.every(update => allowedUpdates.includes(update))

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' })
    }

    try {
        const user = await User.findById(req.params.id)

        updates.forEach(update => user[update] = req.body[update])

        await user.save()

        if (!user) return res.status(404).send()

        res.status(200).send(user)
    } catch (e) {
        res.status(400).send(e)
    }
})

//Deleting an User details by ID
router.delete('/users/:id', async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id)

        if (!user) return res.status(404).send()

        res.status(200).send(user)
    } catch (e) {
        res.status(500).send()
    }
})


module.exports = router