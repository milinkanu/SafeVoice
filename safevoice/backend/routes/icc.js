import express from 'express';
const router = express.Router();

// @route   PATCH /api/icc/complaints/:id
// @desc    update status (ICC actions)
router.patch('/complaints/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status, actionNotes } = req.body;

        // Mock update DB
        res.json({
            success: true,
            status: status,
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
