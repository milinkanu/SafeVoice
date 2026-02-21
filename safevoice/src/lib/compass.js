export const COMPASS_QUESTIONS = [
    {
        id: 'q1',
        text: "Did this happen at your workplace or a work-related situation?",
        options: [
            { id: 'yes', label: "Yes", score: 10 },
            { id: 'no', label: "No", score: 0 },
            { id: 'not_sure', label: "Not Sure", score: 5 },
        ]
    },
    {
        id: 'q2',
        text: "Who is the person who harassed you?",
        options: [
            { id: 'boss', label: "My employer or boss", score: 10 },
            { id: 'colleague', label: "A colleague", score: 10 },
            { id: 'client', label: "A client or vendor", score: 10 },
            { id: 'other', label: "Someone else", score: 5 },
        ]
    },
    {
        id: 'q3',
        text: "Was the behavior sexual in nature?",
        tooltip: "Includes unwelcome physical contact, sexual remarks, showing pornography, or asking for sexual favors.",
        options: [
            { id: 'yes', label: "Yes", score: 20 },
            { id: 'no', label: "No", score: 0, flag: "non_posh" },
            { id: 'not_sure', label: "I'm not sure", score: 5 },
        ]
    },
    {
        id: 'q4',
        text: "Did it involve any of these?",
        type: "multiselect",
        options: [
            { id: 'physical', label: "Physical contact or advances", score: 10 },
            { id: 'verbal', label: "Sexual remarks or jokes", score: 10 },
            { id: 'visual', label: "Showing explicit content/pornography", score: 10 },
            { id: 'favors', label: "Demands for sexual favors", score: 10 },
            { id: 'stalking', label: "Stalking or following", score: 10, flag: "ipc_354d" },
            { id: 'hostile', label: "Creating a hostile work environment", score: 5 },
        ]
    },
    {
        id: 'q5',
        text: "How long ago did the most recent incident happen?",
        tooltip: "Under POSH, complaints should ideally be filed within 3 months of the last incident.",
        options: [
            { id: 'recent', label: "Within the last week", score: 10 },
            { id: 'month', label: "1 week to 1 month ago", score: 10 },
            { id: 'three_months', label: "1 to 3 months ago", score: 10 },
            { id: 'older', label: "More than 3 months ago", score: 0, flag: "time_barred_warning" },
        ]
    },
    {
        id: 'q6',
        text: "Where do you work?",
        options: [
            { id: 'corporate', label: "Registered company (10+ employees)", score: 10 },
            { id: 'small', label: "Small company (Less than 10 employees)", score: 10, flag: "lcc_route" },
            { id: 'domestic', label: "I work at someone's home (Domestic worker)", score: 10, flag: "lcc_route" },
            { id: 'unorganized', label: "Unorganized sector or daily wage", score: 10, flag: "lcc_route" },
        ]
    },
    {
        id: 'q7',
        text: "Is there an Internal Complaints Committee (ICC) at your workplace?",
        options: [
            { id: 'yes', label: "Yes", score: 10 },
            { id: 'no', label: "No", score: 5, flag: "lcc_route" },
            { id: 'not_sure', label: "I don't know", score: 5 },
        ]
    },
    {
        id: 'q8',
        text: "Are you comfortable sharing details with HR or the ICC, or do you need full anonymity right now?",
        options: [
            { id: 'anonymous', label: "I need full anonymity to feel safe", score: 10 },
            { id: 'limited', label: "I'm okay with limited sharing", score: 5 },
            { id: 'open', label: "Either is fine, I just want action", score: 0 },
        ]
    }
];

export function evaluateCompassAnswers(answers) {
    let totalScore = 0;
    const flags = new Set();
    let isSexual = false;
    let hasEvidenceOfWorkplace = false;

    // Process answers
    Object.entries(answers).forEach(([questionId, answerData]) => {
        const question = COMPASS_QUESTIONS.find(q => q.id === questionId);
        if (!question) return;

        if (question.type === 'multiselect') {
            // answerData is an array of selected option IDs
            const selectedOptions = question.options.filter(opt => answerData.includes(opt.id));
            selectedOptions.forEach(opt => {
                totalScore += opt.score;
                if (opt.flag) flags.add(opt.flag);
            });
            if (answerData.length > 0) isSexual = true;
        } else {
            // answerData is a single option ID
            const option = question.options.find(opt => opt.id === answerData);
            if (option) {
                totalScore += option.score;
                if (option.flag) flags.add(option.flag);

                if (questionId === 'q3' && option.id === 'yes') isSexual = true;
                if (questionId === 'q1' && option.id === 'yes') hasEvidenceOfWorkplace = true;
            }
        }
    });

    // Determine outcome

    if (flags.has('non_posh') || (!isSexual && totalScore < 30)) {
        return {
            type: 'NOT_POSH',
            title: 'This may not fall under the POSH Act',
            description: "Based on your answers, the incident might not legally qualify as workplace sexual harassment under POSH. However, you are still legally protected under other laws.",
            laws: [
                { name: "IPC Section 354", logic: "Assault or criminal force with intent to outrage modesty." },
                { name: "IT Act Section 66E", logic: "Violation of privacy through electronic means." },
                { name: "Workplace Grievance", logic: "You can still file a general HR grievance for hostile work behavior." }
            ],
            recommendation: "We recommend speaking with a counselor or legal advocate to understand your best path forward."
        };
    }

    if (flags.has('time_barred_warning')) {
        return {
            type: 'PARTIAL',
            title: 'Your case usually falls under POSH, but there is a time limit.',
            description: "The POSH act requires complaints to be filed within 3 months of the incident. Since yours occurred over 3 months ago, the ICC may require a valid written reason for the delay before accepting it.",
            recommendation: "You can still file anonymously to create a secure record. We suggest attaching a note explaining why you couldn't file sooner (e.g., fear of retaliation, trauma)."
        };
    }

    if (flags.has('lcc_route')) {
        return {
            type: 'POSH_LCC',
            title: 'Your experience qualifies under the POSH Act 2013.',
            description: "Because your workplace has fewer than 10 employees, or you are a domestic worker, your case is handled by the **Local Complaints Committee (LCC)** in your district, rather than an internal committee.",
            recommendation: "You have the right to legally escalate this. SafeVoice can help you generate the necessary secure documentation to approach the LCC."
        };
    }

    // Default POSH applicable route
    return {
        type: 'POSH_APPLICABLE',
        title: 'Your experience qualifies under the POSH Act 2013.',
        description: "You have the right to file a formal complaint. SafeVoice allows you to securely record your complaint and evidence immediately, while remaining completely anonymous until you are ready to reveal yourself to the ICC.",
        recommendation: "Filing securely creates a legally timestamped record that protects you."
    };
}
