import { Timeline } from '../ui/Timeline';
import { format, formatDistanceToNow, addDays, isPast } from 'date-fns';

export function CaseTimeline({ historyEvents, initialDate }) {
    // Translate backend history to timeline props
    // Expected history structure: { stage: 'filed' | 'acknowledged' | 'inquiry_started' | 'resolved', date: ISOString }

    const filedDate = new Date(initialDate || Date.now());
    const day7 = addDays(filedDate, 7);
    const day30 = addDays(filedDate, 30);
    const day90 = addDays(filedDate, 90);

    const safeHistory = Array.isArray(historyEvents) ? historyEvents : [];

    // Status map
    const hasStage = (stage) => safeHistory.some(e => e.stage === stage);
    const getStageDate = (stage) => safeHistory.find(e => e.stage === stage)?.date;

    const events = [
        {
            title: 'Complaint Filed securely',
            date: format(filedDate, 'MMM dd, yyyy'),
            status: 'done',
            description: 'Your report and encrypted evidence were successfully deposited to the ICC.'
        },
        {
            title: hasStage('acknowledged') ? 'ICC Acknowledged receipt' : 'ICC Acknowledgment pending',
            date: hasStage('acknowledged')
                ? format(new Date(getStageDate('acknowledged')), 'MMM dd, yyyy')
                : `Due by ${format(day7, 'MMM dd')}`,
            status: hasStage('acknowledged')
                ? 'done'
                : isPast(day7) ? 'overdue' : 'pending',
            description: isPast(day7) && !hasStage('acknowledged')
                ? 'The ICC has missed the legally mandated 7-day acknowledgment window.'
                : 'The organization must legally acknowledge your complaint within 7 days.'
        },
        {
            title: hasStage('inquiry_started') ? 'Formal Inquiry Began' : 'Inquiry Initiation',
            date: hasStage('inquiry_started')
                ? format(new Date(getStageDate('inquiry_started')), 'MMM dd, yyyy')
                : `Expect by ${format(day30, 'MMM dd')}`,
            status: hasStage('inquiry_started')
                ? 'done'
                : (!hasStage('acknowledged') ? 'pending' : (isPast(day30) ? 'overdue' : 'pending'))
        },
        {
            title: hasStage('resolved') ? 'Inquiry Concluded' : 'Resolution Mandatory Deadline',
            date: hasStage('resolved')
                ? format(new Date(getStageDate('resolved')), 'MMM dd, yyyy')
                : `By ${format(day90, 'MMM dd')}`,
            status: hasStage('resolved')
                ? 'done'
                : isPast(day90) ? 'overdue' : 'pending',
            description: 'Under the POSH Act, the ICC inquiry MUST be completed within 90 days of the complaint date.'
        }
    ];

    return (
        <div className="bg-bg-secondary p-6 rounded-2xl border border-border-default shadow-xl">
            <h3 className="text-xl font-semibold mb-6 text-text-primary tracking-tight">Timeline Tracker</h3>
            <Timeline events={events} />
        </div>
    );
}
