// =====================================================================
// SHARED HELPERS (Regulation rules, promotion evaluation, grading maths)
// =====================================================================
const LEVEL_LABELS = { 1: 'الفرقة الأولى', 2: 'الفرقة الثانية', 3: 'الفرقة الثالثة', 4: 'الفرقة الرابعة' };

const FACULTY_TITLES = ['أستاذ', 'أستاذ مساعد', 'مدرس'];

const ASSISTANT_TITLES = ['مدرس مساعد', 'معيد'];

const WEEK_KEYS = ['w1', 'w2', 'w3', 'w4', 'w5', 'w6', 'w7', 'w8'];

const ATTENDANCE_MAX = 10;

const TASKS_MAX = 10;

const DEFAULT_PROGRESSION = { l2: 64, l3: 98 };

const DEFAULT_CONTROL_RULES = { yearWorkMax: 40, finalMax: 60, minFinalPercent: 30, graceMarks: 1, absenceLimitPercent: 25 };

const getProgressionRules = (reg) => ({
    l1: reg?.semesterRules?.minProgressionHours ?? 28,
    l2: reg?.progressionRules?.l2 ?? DEFAULT_PROGRESSION.l2,
    l3: reg?.progressionRules?.l3 ?? DEFAULT_PROGRESSION.l3,
});

const getControlRules = (reg) => ({ ...DEFAULT_CONTROL_RULES, ...(reg?.controlRules || {}) });

// Returns whether a student meets the promotion conditions of his current level
const evaluatePromotion = (student, rules) => {
    const required = student.level === 1 ? rules.l1 : student.level === 2 ? rules.l2 : student.level === 3 ? rules.l3 : null;
    if (required === null) return { eligible: false, required: null, reasons: ['الفرقة الأخيرة - التخرج وليس الترقية'], shortfall: 0, final: true };
    const reasons = [];
    const shortfall = Math.max(0, required - (student.passedCredits || 0));
    if (shortfall > 0) reasons.push(`ناقص ${shortfall} ساعة معتمدة (المجتاز ${student.passedCredits} من ${required} المطلوبة)`);
    if (student.academicStatus === 'Suspended') reasons.push('حالة القيد: موقوف / مجمد');
    return { eligible: reasons.length === 0, required, reasons, shortfall, final: false };
};

const attendanceMarksFromLogs = (logs) => {
    const vals = WEEK_KEYS.map(w => (logs && logs[w]) || 'P');
    const score = vals.reduce((a, v) => a + (v === 'P' ? 1 : v === 'L' ? 0.5 : 0), 0);
    return Math.round((score / WEEK_KEYS.length) * ATTENDANCE_MAX);
};

const summarizeLogs = (logs) => {
    const vals = WEEK_KEYS.map(w => (logs && logs[w]) || 'P');
    const present = vals.filter(v => v === 'P').length;
    const late = vals.filter(v => v === 'L').length;
    const absent = vals.filter(v => v === 'A').length;
    const percent = Math.round(((present + late * 0.5) / vals.length) * 100);
    const absencePercent = Math.round((absent / vals.length) * 100);
    return { present, late, absent, percent, absencePercent, total: vals.length };
};

const getYearWork = (g) => (g.attendanceMarks || 0) + (g.taskMarks || 0) + (g.midtermMarks || 0);

// Converts marks to total/letter/points using the regulation grade scale + final-exam minimum rule
const computeGradeResult = (g, regulation) => {
    const rules = getControlRules(regulation);
    const scale = [...(regulation?.gradeScales || [])].sort((a, b) => b.minPercent - a.minPercent);
    const yearWork = getYearWork(g);
    const finalMark = g.isAbsent ? 0 : (g.finalExamMark || 0);
    const totalMark = yearWork + finalMark + (g.graceMarksApplied || 0);
    const minFinal = (rules.finalMax * rules.minFinalPercent) / 100;
    const passedFinal = !g.isAbsent && finalMark >= minFinal;
    let letterGrade = 'F', points = 0;
    if (passedFinal) {
        const hit = scale.find(sc => totalMark >= sc.minPercent);
        if (hit) { letterGrade = hit.grade; points = hit.points; }
    }
    return { totalMark, letterGrade, points, passedFinal, minFinal };
};

const getPassMark = (regulation) => {
    const passing = (regulation?.gradeScales || []).filter(s => s.points > 0);
    return passing.length ? Math.min(...passing.map(s => s.minPercent)) : 50;
};
