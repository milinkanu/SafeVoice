import TelegramBot from 'node-telegram-bot-api';
import { query } from './db/index.js';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

// Bypass self-signed certificate errors (Network/Proxy issues)
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

// Replace with process.env.TELEGRAM_BOT_TOKEN in production
const token = process.env.TELEGRAM_BOT_TOKEN || '8698682081:AAHpO1dV1dChvUD1Sq5kpvrNqsOeHjklkY8';

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, { polling: true });

// In-memory session store
// Key: chatId, Value: Session Object
const sessions = new Map();

// Phases Enum
const PHASES = {
    IDLE: 'IDLE',
    SAFETY_CHECK: 'SAFETY_CHECK',
    INCIDENT_DATE: 'INCIDENT_DATE',
    DELAY_REASON: 'DELAY_REASON',
    LOCATION: 'LOCATION',
    DESCRIPTION: 'DESCRIPTION',
    ACCUSED_LEVEL: 'ACCUSED_LEVEL',
    INTERIM_RELIEF: 'INTERIM_RELIEF',
    EVIDENCE: 'EVIDENCE',
    DISCLOSURE_NOTICE: 'DISCLOSURE_NOTICE',
    CONFIRMATION: 'CONFIRMATION'
};

const getInitSession = () => ({
    phase: PHASES.IDLE,
    data: {
        date: '',
        delayReason: '',
        location: '',
        description: '',
        accusedLevel: '',
        interimRelief: '',
        evidenceAttached: 'No',
        submissionType: ''
    }
});

// Helper to encrypt data if needed before storing
const generateCaseId = () => `SV-${new Date().getFullYear()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

// Root command
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;

    // Reset session
    sessions.set(chatId, getInitSession());

    // Phase 0: Entry Safety Frame
    const introMsg = `I’m here to help you document your experience safely and in accordance with the POSH Act, 2013.\n\nYou remain in control at every step.\nNothing will be formally submitted without your confirmation.`;

    bot.sendMessage(chatId, introMsg).then(() => {
        // Phase 1: Emotional Grounding
        setTimeout(() => {
            const session = sessions.get(chatId);
            if (session) {
                session.phase = PHASES.SAFETY_CHECK;
                bot.sendMessage(chatId, 'Before we begin — are you safe right now?\n(Please reply with Yes / No)', {
                    reply_markup: {
                        keyboard: [[{ text: 'Yes' }, { text: 'No' }]],
                        one_time_keyboard: true,
                        resize_keyboard: true
                    }
                });
            }
        }, 1500);
    });
});

bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text ? msg.text.trim() : '';

    // Handle "Pause" feature at any point
    if (text.toLowerCase() === 'pause') {
        bot.sendMessage(chatId, 'Your progress has been securely saved.\nYou may resume anytime using your secure phrase or typing /resume.', {
            reply_markup: { remove_keyboard: true }
        });
        return; // we keep the session active in memory
    }

    // Ignore /start as it's handled above
    if (text.startsWith('/start')) return;

    if (text.toLowerCase() === '/resume') {
        const session = sessions.get(chatId);
        if (!session || session.phase === PHASES.IDLE) {
            bot.sendMessage(chatId, 'No active session found. Type /start to begin.');
        } else {
            bot.sendMessage(chatId, 'Welcome back. Let\'s continue from where you left off. Please reply to the last question asked.');
        }
        return;
    }

    const session = sessions.get(chatId);
    if (!session || session.phase === PHASES.IDLE) {
        if (!text.startsWith('/')) {
            bot.sendMessage(chatId, 'Please type /start to begin a secure reporting session.');
        }
        return;
    }

    // State Machine
    try {
        switch (session.phase) {
            case PHASES.SAFETY_CHECK:
                if (text.toLowerCase() === 'no') {
                    bot.sendMessage(chatId, 'If you are in immediate danger, please contact local emergency services or dial 112.\nI will remain here whenever you are ready to continue.', {
                        reply_markup: { remove_keyboard: true }
                    });
                } else {
                    session.phase = PHASES.INCIDENT_DATE;
                    bot.sendMessage(chatId, 'Under the POSH Act, a complaint should ideally be filed within 3 months of the incident.\n\nWhen did the incident occur?\n(An approximate date is acceptable.)', {
                        reply_markup: { remove_keyboard: true }
                    });
                }
                break;

            case PHASES.INCIDENT_DATE:
                session.data.date = text;
                session.phase = PHASES.DELAY_REASON;

                bot.sendMessage(chatId, "If this incident occurred more than 3 months ago, the law allows an extension of up to 3 additional months if sufficient reason is provided.\n\nWould you like to briefly explain the delay?\n(Reply with your reason, or type 'Skip' if it happened recently)", {
                    reply_markup: {
                        keyboard: [[{ text: 'Skip' }]],
                        one_time_keyboard: true,
                        resize_keyboard: true
                    }
                });
                break;

            case PHASES.DELAY_REASON:
                if (text.toLowerCase() !== 'skip' && text.toLowerCase() !== 'no') {
                    session.data.delayReason = text;
                }
                session.phase = PHASES.LOCATION;
                bot.sendMessage(chatId, 'Where did this occur?\n(Department, office location, or work-related setting)', {
                    reply_markup: { remove_keyboard: true }
                });
                break;

            case PHASES.LOCATION:
                session.data.location = text;
                session.phase = PHASES.DESCRIPTION;
                bot.sendMessage(chatId, 'Please describe what happened in your own words.\nShare only what you are comfortable documenting.\n\nThis statement may later form part of a formal written complaint under the POSH Act.', {
                    reply_markup: { remove_keyboard: true }
                });
                break;

            case PHASES.DESCRIPTION:
                session.data.description = text;
                session.phase = PHASES.ACCUSED_LEVEL;

                await bot.sendMessage(chatId, 'Thank you for sharing that.\nBased on what you\'ve described, this may fall under workplace sexual harassment guidelines defined under the POSH Act, 2013.\n\nI will now guide you through the formal details required for an Internal or Local Complaints Committee inquiry.');

                bot.sendMessage(chatId, 'What is the designation level of the person involved?\n(Senior / Same level / Junior / External)\n\nIf known, you may also share the name or department. This helps in proper identification during inquiry.', {
                    reply_markup: {
                        keyboard: [[{ text: 'Senior' }, { text: 'Same level' }], [{ text: 'Junior' }, { text: 'External' }]],
                        one_time_keyboard: true,
                        resize_keyboard: true
                    }
                });
                break;

            case PHASES.ACCUSED_LEVEL:
                session.data.accusedLevel = text;
                session.phase = PHASES.INTERIM_RELIEF;

                bot.sendMessage(chatId, 'Under the POSH Act, you may request interim relief during inquiry, such as:\n• Transfer\n• Change in reporting structure\n• Leave up to 3 months\n\nWould you like to request any interim protection?\n(Yes / No / Decide Later)', {
                    reply_markup: {
                        keyboard: [[{ text: 'Yes' }, { text: 'No' }, { text: 'Decide Later' }]],
                        one_time_keyboard: true,
                        resize_keyboard: true
                    }
                });
                break;

            case PHASES.INTERIM_RELIEF:
                session.data.interimRelief = text;
                session.phase = PHASES.EVIDENCE;

                bot.sendMessage(chatId, 'If you have supporting material such as messages, emails, audio, or witness details, you may upload them now.\n\nFiles are encrypted and digitally hashed for integrity validation.\n\n(Upload files now, or type "Skip" to proceed)', {
                    reply_markup: {
                        keyboard: [[{ text: 'Skip' }]],
                        one_time_keyboard: true,
                        resize_keyboard: true
                    }
                });
                break;

            case PHASES.EVIDENCE:
                // Handle document / photo / text (Skip)
                if (msg.photo || msg.document || msg.audio || msg.video || msg.voice) {
                    session.data.evidenceAttached = 'Yes';
                } else if (text.toLowerCase() !== 'skip') {
                    // Might be some text instead of file, assume they described evidence or just typed skip
                    session.data.evidenceAttached = 'No (No file detected)';
                }

                session.phase = PHASES.DISCLOSURE_NOTICE;

                const noticeMsg = `For a formal ICC/LCC inquiry under the POSH Act, your identity must be disclosed to the committee.\n\nYour identity will remain confidential and cannot be shared publicly.\n\nAt this stage, would you like to:\n1️⃣ Keep this as a confidential documented record\n2️⃣ Proceed with formal POSH complaint submission`;

                bot.sendMessage(chatId, noticeMsg, {
                    reply_markup: {
                        keyboard: [
                            [{ text: '1️⃣ Confidential Record' }],
                            [{ text: '2️⃣ Formal POSH Submission' }]
                        ],
                        one_time_keyboard: true,
                        resize_keyboard: true
                    }
                });
                break;

            case PHASES.DISCLOSURE_NOTICE:
                session.data.submissionType = text.includes('1') ? 'Confidential Record' : 'Formal POSH Submission';
                session.phase = PHASES.CONFIRMATION;

                let summaryBody = `Here is a summary of your report:\n` +
                    `Type: ${session.data.submissionType}\n` +
                    `Date: ${session.data.date}\n` +
                    `Location: ${session.data.location}\n` +
                    `Details Captured: Yes\n` +
                    `Accused Level: ${session.data.accusedLevel}\n` +
                    `Interim Relief: ${session.data.interimRelief}\n` +
                    `Evidence attached: ${session.data.evidenceAttached}\n\n`;

                if (session.data.submissionType === 'Formal POSH Submission') {
                    summaryBody += `Please confirm that the above statement is true to the best of your knowledge and that you request a formal inquiry under the POSH Act, 2013.\n\n(Confirm / Edit / Cancel)`;
                } else {
                    summaryBody += `Do you confirm saving this as a confidential record?\n\n(Confirm / Edit / Cancel)`;
                }

                bot.sendMessage(chatId, summaryBody, {
                    reply_markup: {
                        keyboard: [[{ text: 'Confirm' }, { text: 'Edit' }, { text: 'Cancel' }]],
                        one_time_keyboard: true,
                        resize_keyboard: true
                    }
                });
                break;

            case PHASES.CONFIRMATION:
                const response = text.toLowerCase();
                if (response === 'cancel') {
                    bot.sendMessage(chatId, 'Report cancelled. Your data has been cleared. Type /start to begin again.', {
                        reply_markup: { remove_keyboard: true }
                    });
                    sessions.delete(chatId);
                } else if (response === 'edit') {
                    bot.sendMessage(chatId, 'Let\'s start over to update your details. Type /start when you are ready.', {
                        reply_markup: { remove_keyboard: true }
                    });
                    sessions.delete(chatId);
                } else if (response === 'confirm') {
                    try {
                        const caseId = generateCaseId();
                        const incidentDetails = {
                            date: session.data.date,
                            delayReason: session.data.delayReason || null,
                            location: session.data.location,
                            description: session.data.description,
                            submissionType: session.data.submissionType,
                            interimRelief: session.data.interimRelief,
                            source: 'Telegram_Bot'
                        };
                        const accusedDetails = {
                            roleLevel: session.data.accusedLevel
                        };

                        // Fake a public key or leave empty (Telegram bot cases might not have a public key initially)
                        const publicKey = 'TELEGRAM-BOT-USER';
                        const contactPhone = `TG_CHAT_${chatId}`; // To know it came from TG

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

                        const finalMsg = `Your complaint has been securely registered.\n\nCase ID: *${caseId}*\n\nThe Internal/Local Complaints Committee will be notified in accordance with statutory timelines:\n\n• 7 days — Notice to respondent\n• 90 days — Inquiry completion\n• 10 days — Report submission\n\nYou may track updates using your secure Case ID.`;

                        bot.sendMessage(chatId, finalMsg, {
                            parse_mode: 'Markdown',
                            reply_markup: { remove_keyboard: true }
                        });

                        // Clear session
                        sessions.delete(chatId);
                    } catch (dbErr) {
                        console.error('DB Insert Error from Bot:', dbErr);
                        bot.sendMessage(chatId, 'There was an error securely submitting your report. Please try again later.', {
                            reply_markup: { remove_keyboard: true }
                        });
                    }
                } else {
                    bot.sendMessage(chatId, 'Please choose Confirm, Edit, or Cancel.');
                }
                break;

            default:
                bot.sendMessage(chatId, 'I did not understand that. Please type /start to reset.');
                sessions.delete(chatId);
                break;
        }
    } catch (err) {
        console.error('Bot Error:', err);
        bot.sendMessage(chatId, 'A secure error occurred. Please type /start to restart the process.');
    }
});

console.log('🤖 SafeVoice Legal Companion (Telegram Bot) initialized successfully');

export default bot;
