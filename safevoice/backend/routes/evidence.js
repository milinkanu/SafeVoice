import express from 'express';
import multer from 'multer';
import { query } from '../db/index.js';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// @route   POST /api/evidence/:caseId
// @desc    Upload evidence file + store hash
router.post('/:caseId', upload.single('file'), async (req, res, next) => {
    try {
        const { caseId } = req.params;
        const { hash } = req.body; // Hash from client

        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }

        // Insert evidence into DB
        await query(
            'INSERT INTO evidence (case_id, file_path, file_hash) VALUES ($1, $2, $3)',
            [caseId, req.file.path, hash || 'no-hash-provided']
        );

        res.status(201).json({
            success: true,
            message: 'Evidence securely stored',
            fileId: req.file.filename
        });
    } catch (err) {
        next(err);
    }
});

// @route   GET /api/evidence/:caseId
// @desc    Get evidence for a case
router.get('/:caseId', async (req, res, next) => {
    try {
        const { caseId } = req.params;
        const result = await query('SELECT * FROM evidence WHERE case_id = $1', [caseId]);
        res.json({
            success: true,
            data: result.rows
        });
    } catch (err) {
        next(err);
    }
});

export default router;
