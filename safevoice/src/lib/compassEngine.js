import { compassLayers } from './compassConfig';

export function evaluateJurisdiction(answers) {
    const j1 = answers['J1'];
    const j2 = answers['J2'];
    const j3 = answers['J3'];
    const j4 = answers['J4'];
    const j5 = answers['J5'];

    if (j1 === 'no') return { pass: false, redirect: 'IPC_354D' };
    if (j2 === 'no') return { pass: false, redirect: 'IPC_354' };
    if (j3 === 'no') return { pass: false, redirect: 'HR_POLICY' };

    let timeBarred = false;
    if (j4 === '3_to_6_months' || j4 === 'more_than_6_months') {
        timeBarred = true;
    }

    let employerAccused = false;
    if (j5 === 'yes') {
        employerAccused = true;
    }

    return { pass: true, timeBarred, employerAccused };
}

export function classifyIncident(answers) {
    const c1 = answers['C1'] || [];
    let poshTypes = new Set();
    let hasExplicit = false;
    let hasEnv = false;

    if (c1.includes('none')) {
        return { poshTypes: [], isPosh: false, hasExplicit: false, hasEnv: false };
    }

    // Map selection back to types
    const cLayer = compassLayers.find(l => l.id === 'classification');
    const c1q = cLayer.questions.find(q => q.id === 'C1');

    c1.forEach(optId => {
        const opt = c1q.options.find(o => o.id === optId);
        if (opt && opt.poshType) {
            poshTypes.add(opt.poshType);
            if (['TYPE_A', 'TYPE_B', 'TYPE_C', 'TYPE_D'].includes(opt.poshType)) {
                hasExplicit = true;
            }
            if (['TYPE_E', 'TYPE_F'].includes(opt.poshType)) {
                hasEnv = true;
            }
        }
    });

    return { poshTypes: Array.from(poshTypes), isPosh: poshTypes.size > 0, hasExplicit, hasEnv };
}

export function checkThreshold(answers, classification) {
    const t1 = answers['T1'];
    const t2 = answers['T2'];
    const t3 = answers['T3'];

    let powerDynamic = t1 === 'afraid';

    const tLayer = compassLayers.find(l => l.id === 'threshold');
    const t3q = tLayer.questions.find(q => q.id === 'T3');
    const t3opt = t3q.options.find(o => o.id === t3);

    let isReasonablePosh = t3opt ? t3opt.poshCheck : true;

    if (!isReasonablePosh && !classification.hasExplicit) {
        return { strongCase: false, insufficient: true, reason: 'workplace_bullying_not_sexual', powerDynamic };
    }

    let count = t2 === 'once' ? 1 : t2 === 'few' ? 3 : 6;

    if (count === 1 && classification.hasEnv && !classification.hasExplicit) {
        return { strongCase: false, insufficient: true, reason: 'hostile_env_needs_pattern', powerDynamic };
    }

    let validNeedsDocs = (count < 3 && classification.hasEnv && !classification.hasExplicit);

    return { strongCase: !validNeedsDocs, insufficient: false, validNeedsDocs, powerDynamic };
}

export function generateResult(answers) {
    const juris = evaluateJurisdiction(answers);

    if (!juris.pass) {
        return {
            outcome: 'NOT_POSH',
            poshType: [],
            routeTo: 'OTHER',
            flags: {},
            redirectLaw: juris.redirect
        };
    }

    const classification = classifyIncident(answers);
    if (!classification.isPosh) {
        return {
            outcome: 'NOT_POSH',
            poshType: [],
            routeTo: 'OTHER',
            flags: {},
            redirectLaw: 'HR_POLICY'
        };
    }

    const threshold = checkThreshold(answers, classification);

    if (threshold.insufficient) {
        return {
            outcome: 'INSUFFICIENT',
            poshType: classification.poshTypes,
            routeTo: 'OTHER',
            flags: { privateLogRecommended: true },
            redirectLaw: null
        };
    }

    const routeTo = juris.employerAccused ? 'LCC' : 'ICC';

    let outcome = 'STRONG_POSH';
    if (threshold.validNeedsDocs) outcome = 'VALID_NEEDS_DOCS';
    if (juris.employerAccused) outcome = 'LCC_ROUTE';
    if (juris.timeBarred && outcome !== 'LCC_ROUTE') outcome = 'TIME_BARRED';

    return {
        outcome,
        poshType: classification.poshTypes,
        routeTo,
        flags: {
            employerAccused: juris.employerAccused,
            powerDynamic: threshold.powerDynamic,
            timeBarred: juris.timeBarred,
            singleIncident: answers['T2'] === 'once',
            domesticWorker: false // Could be inferred or asked
        },
        redirectLaw: null
    };
}
