export const compassLayers = [
    {
        id: 'jurisdiction',
        title: 'Jurisdiction Check',
        description: 'Does POSH apply here?',
        questions: [
            {
                id: 'J1',
                text: 'Did this happen AT your workplace, or because of your work relationship? (e.g., office, client visit, work trip, office party, WFH on work call)',
                type: 'single',
                options: [
                    { id: 'yes', label: 'Yes', value: true },
                    { id: 'no', label: 'No', value: false, disqualifies: true, redirect: 'IPC_354D' }
                ]
            },
            {
                id: 'J2',
                text: 'Is the person who harassed you connected to your work? (employer / colleague / supervisor / client / vendor / contract worker)',
                type: 'single',
                options: [
                    { id: 'yes', label: 'Yes', value: true },
                    { id: 'no', label: 'No', value: false, disqualifies: true, redirect: 'IPC_354' }
                ]
            },
            {
                id: 'J3',
                text: 'Are you a woman? (POSH Act currently only protects women)',
                type: 'single',
                options: [
                    { id: 'yes', label: 'Yes', value: true },
                    { id: 'no', label: 'No', value: false, disqualifies: true, redirect: 'HR_POLICY' }
                ]
            },
            {
                id: 'J4',
                text: 'When did the most recent incident happen?',
                type: 'single',
                options: [
                    { id: 'within_3_months', label: 'Within the last 3 months', value: 'valid' },
                    { id: '3_to_6_months', label: 'Between 3 and 6 months ago', value: 'time_barred' },
                    { id: 'more_than_6_months', label: 'More than 6 months ago', value: 'time_barred' }
                ]
            },
            {
                id: 'J5',
                text: 'Are you the employer or is the person harassing you your direct employer? (Also relevant if your workplace has less than 10 employees or you are a domestic worker)',
                type: 'single',
                options: [
                    { id: 'yes', label: 'Yes (Employer accused / <10 employees / Domestic worker)', value: true, flag: 'employer_accused' },
                    { id: 'no', label: 'No', value: false }
                ]
            }
        ]
    },
    {
        id: 'classification',
        title: 'Incident Classification',
        description: 'What type of behavior occurred?',
        questions: [
            {
                id: 'C1',
                text: 'Select everything that happened — even if it happened only once (Select all that apply):',
                type: 'multi',
                options: [
                    { id: 'phys_contact', category: 'Physical', label: 'Unwanted touching, hugging, kissing, or physical contact', poshType: 'TYPE_A' },
                    { id: 'phys_block', category: 'Physical', label: 'Blocking my path, cornering me, invading my personal space', poshType: 'TYPE_A' },
                    { id: 'phys_follow', category: 'Physical', label: 'Following me physically', poshType: 'TYPE_A' },

                    { id: 'verb_jokes', category: 'Verbal', label: 'Sexual jokes, comments about my body or appearance', poshType: 'TYPE_C' },
                    { id: 'verb_personal', category: 'Verbal', label: 'Asking about my personal/romantic/sexual life repeatedly', poshType: 'TYPE_C' },
                    { id: 'verb_favors', category: 'Verbal', label: 'Suggesting or demanding sexual favors (directly or indirectly)', poshType: 'TYPE_B' },
                    { id: 'verb_msgs', category: 'Verbal', label: 'Sending sexual messages, emails, or voice notes', poshType: 'TYPE_C' },

                    { id: 'vis_images', category: 'Visual/Digital', label: 'Showing me sexual images, videos, or explicit content', poshType: 'TYPE_D' },
                    { id: 'vis_msgs', category: 'Visual/Digital', label: 'Sending me such content digitally', poshType: 'TYPE_D' },
                    { id: 'vis_record', category: 'Visual/Digital', label: 'Recording me without consent in private situations', poshType: 'TYPE_D' },

                    { id: 'pow_promo', category: 'Power/Environment', label: 'Promising promotion/benefits in exchange for sexual compliance', poshType: 'TYPE_E' },
                    { id: 'pow_threat', category: 'Power/Environment', label: 'Threatening consequences if I don\'t comply', poshType: 'TYPE_E' },
                    { id: 'pow_hostile', category: 'Power/Environment', label: 'Creating a humiliating/intimidating atmosphere through sexual behavior', poshType: 'TYPE_F' },
                    { id: 'pow_diff', category: 'Power/Environment', label: 'Being treated differently (tasks, leave, pay) after rejecting advances', poshType: 'TYPE_E' },

                    { id: 'none', category: 'None', label: 'None of these, but I was treated unfairly/differently', none_of_above: true }
                ]
            }
        ]
    },
    {
        id: 'threshold',
        title: 'Legal Threshold Check',
        description: 'How strong is the case?',
        questions: [
            {
                id: 'T1',
                text: 'Did you at any point clearly (verbally or in writing) tell the person to stop, that it was unwelcome, or did you avoid/escape the situation?',
                type: 'single',
                options: [
                    { id: 'told_stop', label: 'Yes, I told them to stop / walked away', value: 'strong' },
                    { id: 'froze', label: 'No, I froze or couldn\'t respond', value: 'frozen' },
                    { id: 'afraid', label: 'I didn\'t react because I was afraid of consequences', value: 'fear', flag: 'power_dynamic' }
                ]
            },
            {
                id: 'T2',
                text: 'How many times did this happen?',
                type: 'single',
                options: [
                    { id: 'once', label: 'Once', count: 1 },
                    { id: 'few', label: '2-5 times', count: 3 },
                    { id: 'many', label: 'More than 5 times / ongoing', count: 6 }
                ]
            },
            {
                id: 'T3',
                text: 'The "Reasonable Person" Filter: Is your experience similar to any of these?',
                type: 'single',
                options: [
                    { id: 'scen1', label: 'Scenario 1: Someone touched me or made explicit passes even after I showed discomfort.', poshCheck: true },
                    { id: 'scen2', label: 'Scenario 2: My boss/colleague screams at me and treats me unfairly (but no sexual undertones).', poshCheck: false },
                    { id: 'scen3', label: 'Scenario 3: Someone regularly makes sexual jokes or forwards inappropriate content in my presence.', poshCheck: true },
                    { id: 'scen4', label: 'None of the above exactly, but it felt sexual and unwelcome.', poshCheck: true }
                ]
            }
        ]
    }
];
