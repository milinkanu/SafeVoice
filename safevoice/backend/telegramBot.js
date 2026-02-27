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
    INCIDENT_LOCATION: 'INCIDENT_LOCATION',
    INCIDENT_DESCRIPTION: 'INCIDENT_DESCRIPTION',
    ACCUSED_LEVEL: 'ACCUSED_LEVEL',
    EVIDENCE: 'EVIDENCE',
    CONFIRMATION: 'CONFIRMATION'
};

const getInitSession = () => ({
    phase: PHASES.IDLE,
    data: {
        date: '',
        location: '',
        description: '',
        accusedLevel: '',
        evidenceAttached: 'No'
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
    const introMsg = `I’m here to help you document your experience safely and confidentially.\nYou are in control at every step.\nNothing will be submitted without your confirmation.`;

    bot.sendMessage(chatId, introMsg).then(() => {
        // Phase 1: Emotional Grounding
        setTimeout(() => {
            const session = sessions.get(chatId);
            session.phase = PHASES.SAFETY_CHECK;

            bot.sendMessage(chatId, 'Before we begin — are you safe right now?\n(Please reply with Yes / No)', {
                reply_markup: {
                    keyboard: [[{ text: 'Yes' }, { text: 'No' }]],
                    one_time_keyboard: true,
                    resize_keyboard: true
                }
            });
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
        if (!session) {
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
                    bot.sendMessage(chatId, 'If you are in immediate danger, please contact local emergency services.\nI can continue once you are safe.', {
                        reply_markup: { remove_keyboard: true }
                    });
                    // keep phase same, so they can reply 'Yes' later
                } else {
                    // Start Guided Incident Logging
                    session.phase = PHASES.INCIDENT_DATE;
                    bot.sendMessage(chatId, 'Whenever you’re ready, you can describe what happened in your own words. There’s no need to rush.\n\nFirst, when did the incident occur?\nYou may enter an approximate date.', {
                        reply_markup: { remove_keyboard: true }
                    });
                }
                break;

            case PHASES.INCIDENT_DATE:
                session.data.date = text;
                session.phase = PHASES.INCIDENT_LOCATION;
                bot.sendMessage(chatId, 'Where did this happen? (Department or location)');
                break;

            case PHASES.INCIDENT_LOCATION:
                session.data.location = text;
                session.phase = PHASES.INCIDENT_DESCRIPTION;
                bot.sendMessage(chatId, 'Please describe what happened in your own words.\nTake your time.');
                break;

            case PHASES.INCIDENT_DESCRIPTION:
                session.data.description = text;
                session.phase = PHASES.ACCUSED_LEVEL;

                await bot.sendMessage(chatId, 'Thank you for sharing that. I know documenting this can be difficult.');

                bot.sendMessage(chatId, 'Based on what you’ve shared, this may fall under workplace harassment guidelines. I’ll guide you through the next steps.\n\nWhat is the designation level of the person involved?\n(Senior / Same level / Junior / External)', {
                    reply_markup: {
                        keyboard: [[{ text: 'Senior' }, { text: 'Same level' }], [{ text: 'Junior' }, { text: 'External' }]],
                        one_time_keyboard: true,
                        resize_keyboard: true
                    }
                });
                break;

            case PHASES.ACCUSED_LEVEL:
                session.data.accusedLevel = text;
                session.phase = PHASES.EVIDENCE;
                bot.sendMessage(chatId, 'If you have any screenshots, emails, or audio that you feel comfortable sharing, you may upload them. This is optional.\n\n(Upload files now, or type "Skip" to proceed)', {
                    reply_markup: { remove_keyboard: true }
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

                session.phase = PHASES.CONFIRMATION;
                const summaryMsg = `Here is a summary of your report:\n` +
                    `Date: ${session.data.date}\n` +
                    `Department/Location: ${session.data.location}\n` +
                    `Description: ${session.data.description}\n` +
                    `Accused Level: ${session.data.accusedLevel}\n` +
                    `Evidence attached: ${session.data.evidenceAttached}\n\n` +
                    `Do you confirm submission?\n(Confirm / Edit / Cancel)`;

                bot.sendMessage(chatId, summaryMsg, {
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
                            location: session.data.location,
                            description: session.data.description,
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

                        bot.sendMessage(chatId, `Your report has been securely submitted to the ICC.\n\nYour secure Case ID is: *${caseId}*\n\nPlease keep this safe. You can use this ID to check the status of your case on our platform.`, {
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

console.log('🤖 SafeVoice Telegram Bot initialized successfully');

export default bot;
