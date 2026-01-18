const express = require('express');
const Whiteboard = require('../models/Whiteboard');

const router = express.Router();

// Create a new whiteboard
router.post('/', async (req, res) => {
    const { name, data } = req.body;

    try {
        const newWhiteboard = new Whiteboard({ name, data });
        await newWhiteboard.save();
        res.status(201).json({ message: 'Whiteboard saved', whiteboard: newWhiteboard });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get all whiteboards
router.get('/', async (req, res) => {
    try {
        const whiteboards = await Whiteboard.find();
        res.status(200).json(whiteboards);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get a specific whiteboard by ID
router.get('/:id', async (req, res) => {
    try {
        const whiteboard = await Whiteboard.findById(req.params.id);
        if (!whiteboard) {
            return res.status(404).json({ message: 'Whiteboard not found' });
        }
        res.status(200).json(whiteboard);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update a whiteboard
router.put('/:id', async (req, res) => {
    const { name, data } = req.body;
    try {
        const updatedWhiteboard = await Whiteboard.findByIdAndUpdate(
            req.params.id,
            { name, data },
            { new: true }
        );
        if (!updatedWhiteboard) {
            return res.status(404).json({ message: 'Whiteboard not found' });
        }
        res.status(200).json({ message: 'Whiteboard updated', whiteboard: updatedWhiteboard });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete a whiteboard
router.delete('/:id', async (req, res) => {
    try {
        const deletedWhiteboard = await Whiteboard.findByIdAndDelete(req.params.id);
        if (!deletedWhiteboard) {
            return res.status(404).json({ message: 'Whiteboard not found' });
        }
        res.status(200).json({ message: 'Whiteboard deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;