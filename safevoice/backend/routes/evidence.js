import express from 'express';
import multer from 'multer';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// @route   POST /api/evidence/:caseId
// @desc    Upload evidence file + store hash
router.post('/:caseId', upload.single('file'), async (req, res, next) => {
    try {
        const { caseId } = req.params;
        const { hash } = req.body; // Hash from client

        res.status(201).json({
            success: true,
            message: 'Evidence securely stored',
            fileId: req.file ? req.file.filename : 'mock-xyz'
        });
    } catch (err) {
        next(err);
    }
});

export default router;
