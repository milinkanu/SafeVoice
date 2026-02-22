import express from 'express';
import { query } from '../db/index.js';
const router = express.Router();

// @route   GET /api/icc/complaints
// @desc    Fetch all complaints for the dashboard
router.get('/complaints', async (req, res, next) => {
    try {
        const result = await query('SELECT * FROM complaints ORDER BY created_at DESC');
        res.json({
            success: true,
            data: result.rows
        });
    } catch (err) {
        next(err);
    }
});

// @route   PATCH /api/icc/complaints/:id
// @desc    update status (ICC actions)
router.patch('/complaints/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status, actionNotes, history, iccMessage } = req.body;

        // Fetch existing first to avoid overwriting with null, or conditionally build query
        const existing = await query('SELECT * FROM complaints WHERE case_id = $1', [id]);
        if (existing.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Case not found' });
        }

        const currentData = existing.rows[0];
        const newStatus = status || currentData.status;
        const newHistory = history ? JSON.stringify(history) : currentData.history;
        const newIccMessage = iccMessage !== undefined ? iccMessage : currentData.icc_message;

        // Update DB
        const updateQuery = `
            UPDATE complaints 
            SET status = $1, history = $2, icc_message = $3
            WHERE case_id = $4 
            RETURNING *
        `;
        const result = await query(updateQuery, [newStatus, newHistory, newIccMessage, id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Case not found' });
        }

        res.json({
            success: true,
            status: status,
            case: result.rows[0],
            message: `Case ${id} status successfully updated to ${status}`
        });
    } catch (err) {
        next(err);
    }
});

// @route   POST /api/icc/login
// @desc    Auth for ICC members
router.post('/login', async (req, res, next) => {
    try {
        const { email, password } = req.body;
        // Mock token return
        res.json({
            success: true,
            token: "MockJWT.xx.yy",
            user: { role: 'icc_member', email }
        });
    } catch (err) {
        next(err);
    }
});

export default router;
