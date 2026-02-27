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

// @route   GET /api/lcc/insights
// @desc    NLP Pattern Detection for serial offenders or hostile environments
router.get('/insights', async (req, res, next) => {
    try {
        const result = await query("SELECT * FROM complaints WHERE incident_details->>'source' = 'Telegram_Bot' ORDER BY created_at DESC");
        const complaints = result.rows;

        // --- Mock NLP Logic for Hackathon ---
        // In a real scenario, this would send descriptions to an LLM or ML classifier
        // Here, we look for overlapping departments, accused levels, or keywords.

        let insights = [];
        let departmentCounts = {};
        let accusedLevelCounts = {};

        complaints.forEach(c => {
            const dept = c.incident_details?.location?.toLowerCase() || 'unknown';
            const accLvl = c.accused_details?.roleLevel?.toLowerCase() || 'unknown';

            departmentCounts[dept] = (departmentCounts[dept] || 0) + 1;
            accusedLevelCounts[accLvl] = (accusedLevelCounts[accLvl] || 0) + 1;
        });

        // 1. Hostile Environment Detection (Multiple cases in same department)
        for (const [dept, count] of Object.entries(departmentCounts)) {
            if (count > 1 && dept !== 'unknown') {
                insights.push({
                    id: Math.random().toString(36).substr(2, 9),
                    type: 'HOSTILE_ENVIRONMENT',
                    severity: 'HIGH',
                    title: `Cluster Alert: ${dept.toUpperCase()}`,
                    description: `NLP algorithms detected ${count} separate complaints originating from the ${dept} department. High probability of a localized hostile environment.`,
                    actionRecommended: `Initiate a generalized anonymous climate survey in ${dept}.`
                });
            }
        }

        // 2. Serial Offender Detection (Multiple cases against same level, e.g., Senior)
        if (accusedLevelCounts['senior'] > 1) {
            insights.push({
                id: Math.random().toString(36).substr(2, 9),
                type: 'SERIAL_OFFENDER',
                severity: 'CRITICAL',
                title: `Pattern Warning: Senior Management`,
                description: `Linguistic markers across ${accusedLevelCounts['senior']} complaints indicate repeated behavior by someone in a 'Senior' role. Power-dynamic abuse strongly suspected.`,
                actionRecommended: `Review recent external complaints regarding senior staff.`
            });
        }

        // Return empty if no patterns, or default mock if they just started
        if (insights.length === 0 && complaints.length > 0) {
            insights.push({
                id: 'mock-1',
                type: 'ANOMALY_DETECTED',
                severity: 'MEDIUM',
                title: 'Potential Micro-Aggression Pattern',
                description: 'Initial text-analysis indicates repeated mention of inappropriate comments. Monitoring for statistical significance.',
                actionRecommended: 'Review recent complaints for shared linguistic markers.'
            });
        }

        res.json({
            success: true,
            data: insights
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
