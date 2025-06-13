const express = require('express');
const router = express.Router();
const Simulation = require('../models/simulation.model');

// --- POST /api/simulations - Create a new simulation ---
router.post('/', async (req, res) => {
    try {
        // Note: In a real app, you'd have robust validation here
        const simulationData = req.body;

        // Create a new simulation instance from our model
        const newSimulation = new Simulation(simulationData);

        // Save it to the database
        const savedSimulation = await newSimulation.save();

        // Respond with the saved data and a success status
        res.status(201).json(savedSimulation);
    } catch (error) {
        console.error('Error saving simulation:', error);
        res.status(400).json({ message: 'Error saving simulation', error: error.message });
    }
});

// --- GET /api/simulations - Retrieve all simulations ---
router.get('/', async (req, res) => {
    try {
        // Find all simulations and sort by creation date (newest first)
        const simulations = await Simulation.find().sort({ createdAt: -1 });
        res.status(200).json(simulations);
    } catch (error) {
        console.error('Error fetching simulations:', error);
        res.status(500).json({ message: 'Error fetching simulations', error: error.message });
    }
});

module.exports = router;
