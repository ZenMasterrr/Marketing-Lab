const mongoose = require('mongoose');

const simulationSchema = new mongoose.Schema({
    // --- User Inputs ---
    productName: { type: String, required: true },
    productCategory: { type: String, required: true },
    productSubcategory: { type: String },
    productDetails: { type: String },
    targetLocation: { type: String },
    competitors: { type: String },

    // --- Ad Strategy ---
    mediaTypes: [String],
    adApproach: { type: String },
    paymentModel: { type: String },

    // --- Ad Spend Details ---
    printDetails: {
        publication: String,
        adSize: String,
        frequency: String,
        cost: Number
    },
    digitalDetails: {
        keywords: String,
        budget: Number,
        targetCPC: Number
    },
    influencerDetails: {
        platform: String,
        niche: String,
        followers: String,
        cost: Number
    },

    // --- Simulation Results ---
    totalInvestment: { type: Number, required: true },
    finalROI: { type: Number, required: true },
    netProfit: { type: Number, required: true },

    // --- AI Analysis (for Phase 3) ---
    aiAnalysis: {
        strengths: String,
        weaknesses: String,
        suggestions: String
    }
}, {
    timestamps: true // Automatically adds createdAt and updatedAt fields
});

const Simulation = mongoose.model('Simulation', simulationSchema);

module.exports = Simulation;
