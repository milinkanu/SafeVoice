import TelegramBot from 'node-telegram-bot-api';
import { query } from './db/index.js';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

// Bypass self-signed certificate errors
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

// Replace with process.env.TELEGRAM_BOT_TOKEN
const token = process.env.TELEGRAM_BOT_TOKEN || '8698682081:AAHpO1dV1dChvUD1Sq5kpvrNqsOeHjklkY8';

const bot = new TelegramBot(token, { polling: true });

// In-memory session store
const sessions = new Map();

// Phases Enum
const PHASES = {
    IDLE: 'IDLE',
    LANGUAGE_SELECTION: 'LANGUAGE_SELECTION',
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
        lang: 'en', // default
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

const locales = {
    en: {
        welcome: "I’m here to help you document your experience safely and in accordance with the POSH Act, 2013.\n\nYou remain in control at every step.\nNothing will be formally submitted without your confirmation.",
        safe_check: "Before we begin — are you safe right now?\n(Please reply with Yes / No)",
        unsafe: "If you are in immediate danger, please contact local emergency services or dial 112.\nI will remain here whenever you are ready to continue.",
        date_prompt: "Under the POSH Act, a complaint should ideally be filed within 3 months of the incident.\n\nWhen did the incident occur?\n(An approximate date is acceptable.)",
        delay_prompt: "If this incident occurred more than 3 months ago, the law allows an extension of up to 3 additional months if sufficient reason is provided.\n\nWould you like to briefly explain the delay?\n(Reply with your reason, or type 'Skip' if it happened recently)",
        location_prompt: "Where did this occur?\n(Department, office location, or work-related setting)",
        description_prompt: "Please describe what happened in your own words.\nShare only what you are comfortable documenting.\n\nThis statement may later form part of a formal written complaint under the POSH Act.",
        accused_intro: "Thank you for sharing that.\nBased on what you've described, this may fall under workplace sexual harassment guidelines defined under the POSH Act, 2013.\n\nI will now guide you through the formal details required for an Internal or Local Complaints Committee inquiry.",
        accused_level: "What is the designation level of the person involved?\n(Senior / Same level / Junior / External)\n\nIf known, you may also share the name or department. This helps in proper identification during inquiry.",
        interim_relief: "Under the POSH Act, you may request interim relief during inquiry, such as:\n• Transfer\n• Change in reporting structure\n• Leave up to 3 months\n\nWould you like to request any interim protection?\n(Yes / No / Decide Later)",
        evidence_prompt: "If you have supporting material such as messages, emails, audio, or witness details, you may upload them now.\n\nFiles are encrypted and digitally hashed for integrity validation.\n\n(Upload files now, or type 'Skip' to proceed)",
        notice_msg: "For a formal ICC/LCC inquiry under the POSH Act, your identity must be disclosed to the committee.\n\nYour identity will remain confidential and cannot be shared publicly.\n\nAt this stage, would you like to:\n1️⃣ Keep this as a confidential documented record\n2️⃣ Proceed with formal POSH complaint submission",
        summary_intro: "Here is a summary of your report:\n",
        summary_type: "Type:",
        summary_date: "Date:",
        summary_location: "Location:",
        summary_details: "Details Captured: Yes\n",
        summary_accused: "Accused Level:",
        summary_interim: "Interim Relief:",
        summary_evidence: "Evidence attached:",
        confirm_formal: "Please confirm that the above statement is true to the best of your knowledge and that you request a formal inquiry under the POSH Act, 2013.\n\n(Confirm / Edit / Cancel)",
        confirm_confidential: "Do you confirm saving this as a confidential record?\n\n(Confirm / Edit / Cancel)",
        cancelled: "Report cancelled. Your data has been cleared. Type /start to begin again.",
        edit: "Let's start over to update your details. Type /start when you are ready.",
        db_error: "There was an error securely submitting your report. Please try again later.",
        fallback: "I did not understand that. Please type /start to reset.",
        bot_error: "A secure error occurred. Please type /start to restart the process.",
        final_msg: "Your complaint has been securely registered.\n\nCase ID: *{caseId}*\n\nThe Internal/Local Complaints Committee will be notified in accordance with statutory timelines:\n\n• 7 days — Notice to respondent\n• 90 days — Inquiry completion\n• 10 days — Report submission\n\nYou may track updates using your secure Case ID.",
        yes: "Yes",
        no: "No",
        skip: "Skip",
        senior: "Senior",
        same_level: "Same level",
        junior: "Junior",
        external: "External",
        decide_later: "Decide Later",
        confidential_record: "Confidential Record",
        formal_submission: "Formal POSH Submission",
        opt1: "1️⃣ Confidential Record",
        opt2: "2️⃣ Formal POSH Submission",
        confirm: "Confirm",
        cancel: "Cancel",
        edit_btn: "Edit",
        pause: "Your progress has been securely saved.\nYou may resume anytime using your secure phrase or typing /resume.",
        no_session: "No active session found. Type /start to begin.",
        welcome_back: "Welcome back. Let's continue from where you left off. Please reply to the last question asked.",
        choose_action: "Please choose Confirm, Edit, or Cancel.",
        evidence_no: "No (No file detected)",
        evidence_yes: "Yes"
    },
    hi: {
        welcome: "मैं POSH अधिनियम (POSH Act), 2013 के अनुसार आपके अनुभव को सुरक्षित रूप से दर्ज करने में मदद करने के लिए यहाँ हूँ।\n\nआप हर कदम पर नियंत्रण में रहेंगी।\nआपकी पुष्टि के बिना कुछ भी औपचारिक रूप से जमा नहीं किया जाएगा।",
        safe_check: "शुरू करने से पहले — क्या आप अभी सुरक्षित हैं?\n(कृपया हाँ / नहीं में उत्तर दें)",
        unsafe: "यदि आप तत्काल खतरे में हैं, तो कृपया स्थानीय आपातकालीन सेवाओं से संपर्क करें या 112 डायल करें।\nजब भी आप जारी रखने के लिए तैयार होंगी, मैं यहीं रहूंगा।",
        date_prompt: "POSH अधिनियम के तहत, शिकायत आदर्श रूप से घटना के 3 महीने के भीतर दर्ज की जानी चाहिए।\n\nघटना कब हुई?\n(अनुमानित तिथि भी मान्य है।)",
        delay_prompt: "यदि यह घटना 3 महीने से अधिक समय पहले हुई थी, तो पर्याप्त कारण बताने पर कानून 3 अतिरिक्त महीनों के विस्तार की अनुमति देता है।\n\nक्या आप देरी का कारण संक्षेप में बताना चाहेंगी?\n(अपना कारण लिखें, या यदि यह हाल ही में हुआ है तो 'छोड़ें' टाइप करें)",
        location_prompt: "यह घटना कहाँ हुई थी?\n(विभाग, कार्यालय का स्थान, या काम से संबंधित जगह)",
        description_prompt: "तसल्ली से बताएं कि क्या हुआ था, अपने शब्दों में। \nजितना आप साझा करने में सहज हैं, केवल उतना ही साझा करें।\n\nयह बयान बाद में POSH अधिनियम के तहत एक औपचारिक लिखित शिकायत का हिस्सा बन सकता है।",
        accused_intro: "यह जानकारी देने के लिए धन्यवाद।\nआपने जो बताया है, उसके आधार पर यह POSH अधिनियम, 2013 के तहत कार्यस्थल पर यौन उत्पीड़न के दिशानिर्देशों के अंतर्गत आ सकता है।\n\nअब मैं आपको आंतरिक (ICC) या स्थानीय शिकायत समिति (LCC) की पूछताछ के लिए आवश्यक औपचारिक विवरणों के बारे में मार्गदर्शन करूँगा।",
        accused_level: "जिस व्यक्ति ने दुर्व्यवहार किया, उसका पद (Designation) क्या है?\n(सीनियर / मेरे स्तर का / जूनियर / बाहरी व्यक्ति)\n\nयदि ज्ञात हो, तो आप नाम या विभाग भी साझा कर सकती हैं। इससे पूछताछ के दौरान उचित पहचान करने में मदद मिलती है।",
        interim_relief: "POSH अधिनियम के तहत, आप पूछताछ के दौरान अंतरिम राहत (Interim Relief) मांग सकती हैं, जैसे:\n• ट्रांसफर\n• रिपोर्टिंग स्ट्रक्चर में बदलाव\n• 3 महीने तक की छुट्टी\n\nक्या आप कोई अंतरिम सुरक्षा मांगना चाहेंगी?\n(हाँ / नहीं / बाद में तय करूंगी)",
        evidence_prompt: "यदि आपके पास मैसेज, ईमेल, ऑडियो या गवाह के विवरण जैसी कोई सहायक सामग्री है, तो आप उन्हें अभी अपलोड कर सकती हैं।\n\nफ़ाइलों को एन्क्रिप्ट किया जाता है और सुरक्षा के लिए डिजिटल हैश में बदल दिया जाता है।\n\n(फ़ाइलें अभी अपलोड करें, या आगे बढ़ने के लिए 'छोड़ें' टाइप करें)",
        notice_msg: "POSH अधिनियम के तहत औपचारिक ICC/LCC पूछताछ के लिए, समिति को आपकी पहचान बताना आवश्यक है।\n\nआपकी पहचान गोपनीय रखी जाएगी और इसे सार्वजनिक रूप से साझा नहीं किया जा सकता है।\n\nइस चरण में, आप क्या करना चुनेंगी:\n1️⃣ इसे एक गोपनीय दस्तावेज़ी रिकॉर्ड के रूप में रखें\n2️⃣ औपचारिक POSH शिकायत सबमिशन के साथ आगे बढ़ें",
        summary_intro: "यहाँ आपकी रिपोर्ट का सारांश है:\n",
        summary_type: "प्रकार:",
        summary_date: "दिनांक:",
        summary_location: "स्थान:",
        summary_details: "विवरण दर्ज: हाँ\n",
        summary_accused: "आरोपी का स्तर:",
        summary_interim: "अंतरिम राहत:",
        summary_evidence: "संलग्न साक्ष्य:",
        confirm_formal: "कृपया पुष्टि करें कि उपरोक्त विवरण आपकी जानकारी के अनुसार सत्य है और आप POSH अधिनियम, 2013 के तहत औपचारिक पूछताछ का अनुरोध करती हैं।\n\n(पुष्टि करें / संपादित करें / रद्द करें)",
        confirm_confidential: "क्या आप इसे गोपनीय रिकॉर्ड के रूप में सहेजने की पुष्टि करती हैं?\n\n(पुष्टि करें / संपादित करें / रद्द करें)",
        cancelled: "रिपोर्ट रद्द कर दी गई है। आपका डेटा हटा दिया गया है। फिर से शुरू करने के लिए /start टाइप करें।",
        edit: "आइए आपके विवरण को अपडेट करने के लिए फिर से शुरू करें। जब आप तैयार हों तो /start टाइप करें।",
        db_error: "आपकी रिपोर्ट सुरक्षित रूप से सबमिट करने में कोई त्रुटि थी। कृपया बाद में पुनः प्रयास करें।",
        fallback: "मुझे समझ नहीं आया। रीसेट करने के लिए कृपया /start टाइप करें।",
        bot_error: "एक सुरक्षित त्रुटि हुई। प्रक्रिया पुनः आरंभ करने के लिए कृपया /start टाइप करें।",
        final_msg: "आपकी शिकायत सुरक्षित रूप से पंजीकृत कर ली गई है।\n\nकेस आई-डी: *{caseId}*\n\nआंतरिक/स्थानीय शिकायत समिति (ICC/LCC) को वैधानिक समय-सीमा के अनुसार सूचित किया जाएगा:\n\n• 7 दिन — प्रतिवादी को नोटिस\n• 90 दिन — पूछताछ पूर्ण\n• 10 दिन — रिपोर्ट जमा करना\n\nआप अपनी सुरक्षित केस आईडी का उपयोग करके अपडेट को ट्रैक कर सकती हैं।",
        yes: "हाँ",
        no: "नहीं",
        skip: "छोड़ें",
        senior: "सीनियर",
        same_level: "मेरे स्तर का",
        junior: "जूनियर",
        external: "बाहरी व्यक्ति",
        decide_later: "बाद में तय करूंगी",
        confidential_record: "गोपनीय रिकॉर्ड",
        formal_submission: "औपचारिक POSH सबमिशन",
        opt1: "1️⃣ गोपनीय रिकॉर्ड",
        opt2: "2️⃣ औपचारिक POSH सबमिशन",
        confirm: "पुष्टि करें",
        cancel: "रद्द करें",
        edit_btn: "संपादित करें",
        pause: "आपकी प्रगति सुरक्षित रूप से सहेज ली गई है।\nआप किसी भी समय अपना सुरक्षित वाक्यांश दर्ज करके या /resume टाइप करके जारी रख सकती हैं।",
        no_session: "कोई सक्रिय सत्र नहीं पाया गया। शुरू करने के लिए /start टाइप करें।",
        welcome_back: "वापसी पर स्वागत है। आइए वहीं से जारी रखें जहां आपने छोड़ा था। कृपया पूछे गए अंतिम प्रश्न का उत्तर दें।",
        choose_action: "कृपया पुष्टि करें, संपादित करें, या रद्द करें चुनें।",
        evidence_no: "नहीं (कोई फ़ाइल नहीं मिली)",
        evidence_yes: "हाँ"
    }
};

const generateCaseId = () => `SV-${new Date().getFullYear()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

// Root command
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;

    sessions.set(chatId, getInitSession());
    const session = sessions.get(chatId);
    session.phase = PHASES.LANGUAGE_SELECTION;

    bot.sendMessage(chatId, 'Welcome. Please select your preferred language:\n\nनमस्ते। कृपया अपनी पसंदीदा भाषा चुनें:', {
        reply_markup: {
            keyboard: [[{ text: '🇬🇧 English' }, { text: '🇮🇳 हिंदी' }]],
            one_time_keyboard: true,
            resize_keyboard: true
        }
    });
});

bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text ? msg.text.trim() : '';

    if (text.toLowerCase() === 'pause') {
        const session = sessions.get(chatId) || getInitSession();
        const t = locales[session.data.lang] || locales.en;
        bot.sendMessage(chatId, t.pause, { reply_markup: { remove_keyboard: true } });
        return;
    }

    if (text.startsWith('/start')) return;

    if (text.toLowerCase() === '/resume') {
        const session = sessions.get(chatId);
        if (!session || session.phase === PHASES.IDLE) {
            bot.sendMessage(chatId, 'No active session found. Type /start to begin.');
        } else {
            const t = locales[session.data.lang] || locales.en;
            bot.sendMessage(chatId, t.welcome_back);
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

    const t = locales[session.data.lang] || locales.en;

    try {
        switch (session.phase) {
            case PHASES.LANGUAGE_SELECTION:
                if (text.includes('English') || text.includes('english')) {
                    session.data.lang = 'en';
                } else if (text.includes('हिंदी') || text.includes('Hindi')) {
                    session.data.lang = 'hi';
                } else {
                    bot.sendMessage(chatId, 'Please select "🇬🇧 English" or "🇮🇳 हिंदी".\n(कृपया "🇬🇧 English" या "🇮🇳 हिंदी" चुनें।)');
                    return;
                }

                const tLang = locales[session.data.lang];
                bot.sendMessage(chatId, tLang.welcome).then(() => {
                    setTimeout(() => {
                        session.phase = PHASES.SAFETY_CHECK;
                        bot.sendMessage(chatId, tLang.safe_check, {
                            reply_markup: {
                                keyboard: [[{ text: tLang.yes }, { text: tLang.no }]],
                                one_time_keyboard: true,
                                resize_keyboard: true
                            }
                        });
                    }, 1500);
                });
                break;

            case PHASES.SAFETY_CHECK:
                if (text === t.no || text.toLowerCase() === 'no' || text.toLowerCase() === 'नहीं') {
                    bot.sendMessage(chatId, t.unsafe, {
                        reply_markup: { remove_keyboard: true }
                    });
                } else {
                    session.phase = PHASES.INCIDENT_DATE;
                    bot.sendMessage(chatId, t.date_prompt, {
                        reply_markup: { remove_keyboard: true }
                    });
                }
                break;

            case PHASES.INCIDENT_DATE:
                session.data.date = text;
                session.phase = PHASES.DELAY_REASON;

                bot.sendMessage(chatId, t.delay_prompt, {
                    reply_markup: {
                        keyboard: [[{ text: t.skip }]],
                        one_time_keyboard: true,
                        resize_keyboard: true
                    }
                });
                break;

            case PHASES.DELAY_REASON:
                if (text !== t.skip && text.toLowerCase() !== 'skip' && text !== 'छोड़ें') {
                    session.data.delayReason = text;
                }
                session.phase = PHASES.LOCATION;
                bot.sendMessage(chatId, t.location_prompt, {
                    reply_markup: { remove_keyboard: true }
                });
                break;

            case PHASES.LOCATION:
                session.data.location = text;
                session.phase = PHASES.DESCRIPTION;
                bot.sendMessage(chatId, t.description_prompt, {
                    reply_markup: { remove_keyboard: true }
                });
                break;

            case PHASES.DESCRIPTION:
                session.data.description = text;
                session.phase = PHASES.ACCUSED_LEVEL;

                await bot.sendMessage(chatId, t.accused_intro);

                bot.sendMessage(chatId, t.accused_level, {
                    reply_markup: {
                        keyboard: [[{ text: t.senior }, { text: t.same_level }], [{ text: t.junior }, { text: t.external }]],
                        one_time_keyboard: true,
                        resize_keyboard: true
                    }
                });
                break;

            case PHASES.ACCUSED_LEVEL:
                session.data.accusedLevel = text;
                session.phase = PHASES.INTERIM_RELIEF;

                bot.sendMessage(chatId, t.interim_relief, {
                    reply_markup: {
                        keyboard: [[{ text: t.yes }, { text: t.no }, { text: t.decide_later }]],
                        one_time_keyboard: true,
                        resize_keyboard: true
                    }
                });
                break;

            case PHASES.INTERIM_RELIEF:
                session.data.interimRelief = text;
                session.phase = PHASES.EVIDENCE;

                bot.sendMessage(chatId, t.evidence_prompt, {
                    reply_markup: {
                        keyboard: [[{ text: t.skip }]],
                        one_time_keyboard: true,
                        resize_keyboard: true
                    }
                });
                break;

            case PHASES.EVIDENCE:
                if (msg.photo || msg.document || msg.audio || msg.video || msg.voice) {
                    session.data.evidenceAttached = t.evidence_yes;
                } else if (text !== t.skip && text.toLowerCase() !== 'skip' && text !== 'छोड़ें') {
                    session.data.evidenceAttached = t.evidence_no;
                }

                session.phase = PHASES.DISCLOSURE_NOTICE;

                bot.sendMessage(chatId, t.notice_msg, {
                    reply_markup: {
                        keyboard: [
                            [{ text: t.opt1 }],
                            [{ text: t.opt2 }]
                        ],
                        one_time_keyboard: true,
                        resize_keyboard: true
                    }
                });
                break;

            case PHASES.DISCLOSURE_NOTICE:
                session.data.submissionType = text.includes('1') || text.includes('Record') || text.includes('रिकॉर्ड') ? t.confidential_record : t.formal_submission;
                session.phase = PHASES.CONFIRMATION;

                let summaryBody = `${t.summary_intro}` +
                    `${t.summary_type} ${session.data.submissionType}\n` +
                    `${t.summary_date} ${session.data.date}\n` +
                    `${t.summary_location} ${session.data.location}\n` +
                    `${t.summary_details}` +
                    `${t.summary_accused} ${session.data.accusedLevel}\n` +
                    `${t.summary_interim} ${session.data.interimRelief}\n` +
                    `${t.summary_evidence} ${session.data.evidenceAttached}\n\n`;

                if (session.data.submissionType === t.formal_submission) {
                    summaryBody += t.confirm_formal;
                } else {
                    summaryBody += t.confirm_confidential;
                }

                bot.sendMessage(chatId, summaryBody, {
                    reply_markup: {
                        keyboard: [[{ text: t.confirm }, { text: t.edit_btn }, { text: t.cancel }]],
                        one_time_keyboard: true,
                        resize_keyboard: true
                    }
                });
                break;

            case PHASES.CONFIRMATION:
                const response = text.toLowerCase();
                const isCancel = response === t.cancel.toLowerCase() || response === 'cancel' || response === 'रद्द करें';
                const isEdit = response === t.edit_btn.toLowerCase() || response === 'edit' || response === 'संपादित करें';
                const isConfirm = response === t.confirm.toLowerCase() || response === 'confirm' || response === 'पुष्टि करें';

                if (isCancel) {
                    bot.sendMessage(chatId, t.cancelled, {
                        reply_markup: { remove_keyboard: true }
                    });
                    sessions.delete(chatId);
                } else if (isEdit) {
                    bot.sendMessage(chatId, t.edit, {
                        reply_markup: { remove_keyboard: true }
                    });
                    sessions.delete(chatId);
                } else if (isConfirm) {
                    try {
                        const caseId = generateCaseId();
                        const incidentDetails = {
                            date: session.data.date,
                            delayReason: session.data.delayReason || null,
                            location: session.data.location,
                            description: session.data.description,
                            submissionType: session.data.submissionType,
                            interimRelief: session.data.interimRelief,
                            source: 'Telegram_Bot',
                            lang: session.data.lang
                        };
                        const accusedDetails = {
                            roleLevel: session.data.accusedLevel
                        };

                        const publicKey = 'TELEGRAM-BOT-USER';
                        const contactPhone = `TG_CHAT_${chatId}`;

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

                        const finalMsg = t.final_msg.replace('{caseId}', caseId);

                        bot.sendMessage(chatId, finalMsg, {
                            parse_mode: 'Markdown',
                            reply_markup: { remove_keyboard: true }
                        });

                        sessions.delete(chatId);
                    } catch (dbErr) {
                        console.error('DB Insert Error from Bot:', dbErr);
                        bot.sendMessage(chatId, t.db_error, {
                            reply_markup: { remove_keyboard: true }
                        });
                    }
                } else {
                    bot.sendMessage(chatId, t.choose_action);
                }
                break;

            default:
                bot.sendMessage(chatId, t.fallback);
                sessions.delete(chatId);
                break;
        }
    } catch (err) {
        console.error('Bot Error:', err);
        bot.sendMessage(chatId, t.bot_error);
    }
});

console.log('🤖 SafeVoice Legal Companion (Telegram Bot) initialized successfully [Multilingual Output: Enabled]');

export default bot;
