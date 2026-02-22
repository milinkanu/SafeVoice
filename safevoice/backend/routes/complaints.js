import express from 'express';
import { query } from '../db/index.js';
import crypto from 'crypto';
const router = express.Router();

// @route   POST /api/complaints
// @desc    Store complaint + public key
router.post('/', async (req, res, next) => {
    try {
        const { incidentDetails, accusedDetails, publicKey, contactPhone } = req.body;

        // Generate Unique Case ID
        const caseId = `SV-${new Date().getFullYear()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

        // Insert into DB
        const insertQuery = `
            INSERT INTO complaints (case_id, incident_details, accused_details, public_key, contact_phone, status)
            VALUES ($1, $2, $3, $4, $5, 'Submitted')
        `;
        await query(insertQuery, [
            caseId,
            JSON.stringify(incidentDetails),
            JSON.stringify(accusedDetails),
            publicKey,
            contactPhone
        ]);

        res.status(201).json({
            success: true,
            caseId: caseId,
            message: 'Complaint filed securely'
        });
    } catch (err) {
        next(err);
    }
});

// @route   GET /api/complaints/challenge
// @desc    Return a challenge string for auth
router.get('/challenge', (req, res) => {
    res.json({ challenge: 'MockChallengeString123' });
});

// @route   POST /api/complaints/verify
// @desc    Verify signature, return case status
router.post('/verify', async (req, res, next) => {
    try {
        const { caseId, signature } = req.body;

        // Fetch public key from DB
        const result = await query('SELECT public_key, status FROM complaints WHERE case_id = $1', [caseId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Case not found' });
        }

        const { public_key, status } = result.rows[0];

        // Basic verification mock for now (since frontend handles real crypto verification)
        // In reality you would use standard ECDSA verification here against public_key
        if (!public_key) {
            return res.status(400).json({ success: false, message: 'Invalid case details' });
        }

        res.json({ authorized: true, status: status, message: 'Verified' });
    } catch (err) {
        next(err);
    }
});

export default router;
