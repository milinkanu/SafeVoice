import express from 'express';
import { query } from '../db/index.js';
const router = express.Router();

// @route   GET /api/lcc/complaints
// @desc    Fetch all complaints that are directed to the LCC (e.g. via Telegram)
router.get('/complaints', async (req, res, next) => {
    try {
        // Fetch complaints where the source is the LCC Telegram Bot
        const result = await query("SELECT * FROM complaints WHERE incident_details->>'source' = 'Telegram_Bot' ORDER BY created_at DESC");
        res.json({
            success: true,
            data: result.rows
        });
    } catch (err) {
        next(err);
    }
});

// @route   PATCH /api/lcc/complaints/:id
// @desc    update status (LCC actions)
router.patch('/complaints/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status, actionNotes, history, lccMessage } = req.body;

        const existing = await query('SELECT * FROM complaints WHERE case_id = $1', [id]);
        if (existing.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Case not found' });
        }

        const currentData = existing.rows[0];
        const newStatus = status || currentData.status;
        const newHistory = history ? JSON.stringify(history) : currentData.history;
        const newLccMessage = lccMessage !== undefined ? lccMessage : currentData.icc_message;

        const updateQuery = `
            UPDATE complaints 
            SET status = $1, history = $2, icc_message = $3
            WHERE case_id = $4 
            RETURNING *
        `;
        const result = await query(updateQuery, [newStatus, newHistory, newLccMessage, id]);

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

// @route   POST /api/lcc/login
// @desc    Auth for LCC members
router.post('/login', async (req, res, next) => {
    try {
        const { email, password } = req.body;
        // Mock token return
        res.json({
            success: true,
            token: "MockJWT.xx.yy_LCC",
            user: { role: 'lcc_member', email }
        });
    } catch (err) {
        next(err);
    }
});

export default router;
