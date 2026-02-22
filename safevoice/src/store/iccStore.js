import { create } from 'zustand';

// Calculate deadlines based on a "today" anchor
export const addDays = (dateStr, days) => {
    const d = new Date(dateStr);
    d.setDate(d.getDate() + days);
    return d.toISOString().split('T')[0];
};

const SEED_COMPLAINTS = [
    {
        id: "SV-2025-XK9-4721",
        filedDate: "2025-11-15",
        category: "TYPE_A",
        poshTypes: ["TYPE_A"],
        description: "Unwanted physical contact in the breakroom.",
        accusedDesignation: "Engineer",
        accusedDepartment: "Engineering",
        powerDynamic: true,
        route: "ICC",
        stage: "FILED",
        timelineLog: [
            { date: "2025-11-15", stage: "FILED", action: "Complaint received and registered", by: "System", notes: "" }
        ],
        respondent: { notified: false, replyReceived: false, replyDate: null, replyText: "" },
        hearings: [],
        evidence: [{ id: "E1", name: "screenshot.png", hash: "a3f9b2d8e4", uploadedDate: "2025-11-15", submittedBy: "Complainant" }],
        interimRelief: { granted: false, measures: [], grantedDate: null },
        conciliation: { requested: false, requestedBy: null, outcome: null, settlementText: "" },
        report: { generated: false, generatedDate: null, findings: "", recommendation: "", actionTaken: false, actionDate: null }
    },
    {
        id: "SV-2025-AB3-1892",
        filedDate: "2025-11-01",
        category: "TYPE_C",
        poshTypes: ["TYPE_C"],
        description: "Repeated sexual remarks during client calls.",
        accusedDesignation: "Sales Lead",
        accusedDepartment: "Sales",
        powerDynamic: true,
        route: "ICC",
        stage: "INQUIRY_STARTED",
        timelineLog: [
            { date: "2025-11-01", stage: "FILED", action: "Complaint received", by: "System", notes: "" },
            { date: "2025-11-05", stage: "RESPONDENT_NOTIFIED", action: "Respondent formally notified", by: "ICC", notes: "" },
            { date: "2025-11-15", stage: "REPLY_RECEIVED", action: "Respondent submitted reply", by: "Respondent", notes: "" },
            { date: "2025-11-20", stage: "INQUIRY_STARTED", action: "Formal inquiry initiated", by: "ICC", notes: "" }
        ],
        respondent: { notified: true, replyReceived: true, replyDate: "2025-11-15", replyText: "I completely deny these allegations." },
        hearings: [
            { id: "H1", date: "2025-11-22", type: "COMPLAINANT_STATEMENT", attendees: ["Complainant", "ICC"], evidenceSubmitted: [], notes: "Initial cross-examination" },
            { id: "H2", date: "2025-11-25", type: "RESPONDENT_STATEMENT", attendees: ["Respondent", "ICC"], evidenceSubmitted: [], notes: "Respondent maintained denial" }
        ],
        evidence: [],
        interimRelief: { granted: false, measures: [], grantedDate: null },
        conciliation: { requested: false, requestedBy: null, outcome: null, settlementText: "" },
        report: { generated: false, generatedDate: null, findings: "", recommendation: "", actionTaken: false, actionDate: null }
    },
    {
        id: "SV-2025-QR7-5523",
        filedDate: "2025-08-10",
        category: "TYPE_A",
        poshTypes: ["TYPE_A", "TYPE_E"],
        description: "Quid pro quo advances from manager.",
        accusedDesignation: "Director",
        accusedDepartment: "Engineering",
        powerDynamic: true,
        route: "ICC",
        stage: "HEARINGS_IN_PROGRESS",
        timelineLog: [
            { date: "2025-08-10", stage: "FILED", action: "Complaint received", by: "System", notes: "" }
        ],
        respondent: { notified: true, replyReceived: false, replyDate: null, replyText: "" },
        hearings: [],
        evidence: [],
        interimRelief: { granted: false, measures: [], grantedDate: null },
        conciliation: { requested: false, requestedBy: null, outcome: null, settlementText: "" },
        report: { generated: false, generatedDate: null, findings: "", recommendation: "", actionTaken: false, actionDate: null }
    },
    {
        id: "SV-2025-MN2-3341",
        filedDate: "2025-09-01",
        category: "TYPE_B",
        poshTypes: ["TYPE_B"],
        description: "Demand for sexual favors.",
        accusedDesignation: "HR Manager",
        accusedDepartment: "HR",
        powerDynamic: true,
        route: "ICC",
        stage: "INQUIRY_COMPLETE",
        timelineLog: [
            { date: "2025-09-01", stage: "FILED", action: "Complaint received", by: "System", notes: "" }
        ],
        respondent: { notified: true, replyReceived: true, replyDate: "2025-09-15", replyText: "Misunderstanding." },
        hearings: [
            { id: "H1", date: "2025-10-01", type: "FINAL_ARGUMENTS", attendees: ["All"], evidenceSubmitted: [], notes: "Concluded." }
        ],
        evidence: [],
        interimRelief: { granted: false, measures: [], grantedDate: null },
        conciliation: { requested: false, requestedBy: null, outcome: null, settlementText: "" },
        report: { generated: false, generatedDate: null, findings: "", recommendation: "", actionTaken: false, actionDate: null }
    },
    {
        id: "SV-2025-PL9-8821",
        filedDate: "2025-05-01",
        category: "TYPE_E",
        poshTypes: ["TYPE_E", "TYPE_F"],
        description: "Hostile work environment creation.",
        accusedDesignation: "VP",
        accusedDepartment: "Operations",
        powerDynamic: true,
        route: "ICC",
        stage: "CLOSED_PROVEN",
        timelineLog: [
            { date: "2025-05-01", stage: "FILED", action: "Complaint received", by: "System", notes: "" },
            { date: "2025-08-01", stage: "CLOSED_PROVEN", action: "Action taken and case closed", by: "Employer", notes: "" }
        ],
        respondent: { notified: true, replyReceived: true, replyDate: "2025-05-10", replyText: "" },
        hearings: [],
        evidence: [],
        interimRelief: { granted: false, measures: [], grantedDate: null },
        conciliation: { requested: false, requestedBy: null, outcome: null, settlementText: "" },
        report: { generated: true, generatedDate: "2025-07-20", findings: "Guilty", recommendation: "TERMINATION", actionTaken: true, actionDate: "2025-08-01" }
    }
];

export const useIccStore = create((set, get) => ({
    cases: [...SEED_COMPLAINTS],
    simulatedToday: "2025-11-20", // Default today for simulation anchor

    setSimulatedToday: (dateStr) => set({ simulatedToday: dateStr }),

    // Gets active cases with computed deadlines
    getComputedCases: () => {
        const { cases, simulatedToday } = get();
        const todayDate = new Date(simulatedToday);

        return cases.map(c => {
            const filed = c.filedDate;
            const dates = {
                filed,
                respondentNotifyDeadline: addDays(filed, 7),
                replyDeadline: addDays(filed, 24), // Approx 17 working days via simple math
                inquiryStartDeadline: addDays(filed, 30),
                inquiryCompleteDeadline: addDays(filed, 90),
                reportDeadline: addDays(filed, 100),
                employerActionDeadline: addDays(filed, 160)
            };

            const checkStatus = (deadline, completedStageArray) => {
                if (completedStageArray.includes(c.stage) || c.stage.startsWith("CLOSED")) return "DONE";
                if (todayDate > new Date(deadline)) return "OVERDUE";
                return "PENDING";
            };

            // Stage arrays representing what is considered "DONE" for a given milestone
            const hasNotified = ["RESPONDENT_NOTIFIED", "REPLY_RECEIVED", "CONCILIATION_REQUESTED", "CONCILIATION_COMPLETE", "INQUIRY_STARTED", "HEARINGS_IN_PROGRESS", "INQUIRY_COMPLETE", "REPORT_SUBMITTED", "EMPLOYER_ACTION_PENDING"];
            const hasStarted = ["INQUIRY_STARTED", "HEARINGS_IN_PROGRESS", "INQUIRY_COMPLETE", "REPORT_SUBMITTED", "EMPLOYER_ACTION_PENDING"];
            const hasCompleted = ["INQUIRY_COMPLETE", "REPORT_SUBMITTED", "EMPLOYER_ACTION_PENDING"];
            const hasReported = ["REPORT_SUBMITTED", "EMPLOYER_ACTION_PENDING"];
            const hasAction = [];

            const deadlineStatus = {
                respondentNotify: checkStatus(dates.respondentNotifyDeadline, hasNotified),
                inquiryStart: checkStatus(dates.inquiryStartDeadline, hasStarted),
                inquiryComplete: checkStatus(dates.inquiryCompleteDeadline, hasCompleted),
                reportSubmit: checkStatus(dates.reportDeadline, hasReported),
                employerAction: checkStatus(dates.employerActionDeadline, hasAction)
            };

            return { ...c, dates, deadlineStatus };
        });
    },

    advanceStage: (id, newStage, actionNotes) => set(state => {
        const d = state.simulatedToday;
        return {
            cases: state.cases.map(c => c.id === id ? {
                ...c,
                stage: newStage,
                timelineLog: [...c.timelineLog, { date: d, stage: newStage, action: actionNotes, by: "ICC member", notes: "" }]
            } : c)
        }
    }),

    updateCase: (id, updates) => set(state => ({
        cases: state.cases.map(c => c.id === id ? { ...c, ...updates } : c)
    })),

    resetCases: () => set({ cases: [...SEED_COMPLAINTS] })
}));
