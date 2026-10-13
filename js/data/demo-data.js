// ---------------------------------------------------------------------
// Extra demo students so that every promotion transition (L1>L2, L2>L3, L3>L4) has data
// ---------------------------------------------------------------------
const makeDemoStudent = (o) => ({
    id: o.id, academicId: o.academicId, nationalId: o.nationalId, nameAr: o.nameAr, nameEn: o.nameEn,
    cohortId: o.cohortId, cohortName: o.cohortName, dept: o.dept, level: o.level,
    passedCredits: o.passedCredits, cgpa: o.cgpa, academicStatus: o.academicStatus || 'Regular', warningCount: o.warningCount || 0,
    advisorName: 'أ.د. محمد عبد الفتاح البرنس', regType: 'مستجد', highSchoolGrade: o.hs || 85,
    phone: o.phone, email: `${o.academicId}@hicit.edu.eg`, maxCreditOverride: null,
    choices: { choice1: o.dept, choice2: 'IS', choice3: 'IT' }, cs101Grade: o.cs101Grade || 'B'
});

const extraStudents = [
    makeDemoStudent({ id: 'STD-2023120', academicId: '20230120', nationalId: '30206151401234', nameAr: 'ياسمين خالد فتحي', nameEn: 'Yasmin Khaled Fathy', cohortId: 'COH-2023', cohortName: 'دفعة 2023', dept: 'CS', level: 2, passedCredits: 66, cgpa: 3.20, phone: '01011002200', cs101Grade: 'A' }),
    makeDemoStudent({ id: 'STD-2023131', academicId: '20230131', nationalId: '30207201402345', nameAr: 'محمود سعيد عبد الله', nameEn: 'Mahmoud Saeed Abdallah', cohortId: 'COH-2023', cohortName: 'دفعة 2023', dept: 'IT', level: 2, passedCredits: 58, cgpa: 2.35, phone: '01122003300' }),
    makeDemoStudent({ id: 'STD-2022041', academicId: '20220041', nationalId: '30105101403456', nameAr: 'أحمد رضا منصور', nameEn: 'Ahmed Reda Mansour', cohortId: 'COH-2022', cohortName: 'دفعة 2022', dept: 'IS', level: 3, passedCredits: 99, cgpa: 3.05, phone: '01233004400' }),
    makeDemoStudent({ id: 'STD-2022057', academicId: '20220057', nationalId: '30106111404567', nameAr: 'نور الهدى ياسر', nameEn: 'Nour Elhoda Yasser', cohortId: 'COH-2022', cohortName: 'دفعة 2022', dept: 'CS', level: 3, passedCredits: 102, cgpa: 3.55, phone: '01544005500', cs101Grade: 'A' }),
    makeDemoStudent({ id: 'STD-2022063', academicId: '20220063', nationalId: '30108121405678', nameAr: 'إسلام عادل حسنين', nameEn: 'Eslam Adel Hassanein', cohortId: 'COH-2022', cohortName: 'دفعة 2022', dept: 'CS', level: 3, passedCredits: 84, cgpa: 1.90, academicStatus: 'Academic Warning', warningCount: 2, phone: '01055006600' }),
];

// ---------------------------------------------------------------------
// Control & Grading: initial marks database (40% year-work / 60% final)
// ---------------------------------------------------------------------
const generateSecretCodes = (count, seed = 7) => {
    const codes = Array.from({ length: count }, (_, i) => 701 + i);
    let s = seed;
    for (let i = codes.length - 1; i > 0; i--) {
        s = (s * 9301 + 49297) % 233280;
        const j = Math.floor((s / 233280) * (i + 1));
        [codes[i], codes[j]] = [codes[j], codes[i]];
    }
    return codes.map(c => `SEC-${c}`);
};

const logsFromString = (str) => WEEK_KEYS.reduce((acc, k, i) => ({ ...acc, [k]: str[i] || 'P' }), {});

const buildInitialGrades = (studentsSource, regulation) => {
    const spec = [
        // CS101 (Fall 2024): year-work locked, final entered, results not processed yet
        { sid: 'STD-2023001', c: 'CS101', logs: 'PPPPPPPP', t: 9, m: 17, f: 52 },
        { sid: 'STD-2023045', c: 'CS101', logs: 'PPLAPPPP', t: 6, m: 11, f: 17 },
        { sid: 'STD-2024012', c: 'CS101', logs: 'PPPPPPPP', t: 10, m: 19, f: 55 },
        { sid: 'STD-2024089', c: 'CS101', logs: 'AAPLPPPP', t: 4, m: 9, f: 29 },
        { sid: 'STD-2023099', c: 'CS101', logs: 'PPPPPPPL', t: 8, m: 16, f: 40 },
        { sid: 'STD-2024102', c: 'CS101', logs: 'PPAPPPLP', t: 8, m: 14, f: 33 },
        // MATH101: already approved and published
        { sid: 'STD-2023001', c: 'MATH101', logs: 'PPPPPPPP', t: 10, m: 18, f: 45, done: true },
        { sid: 'STD-2024012', c: 'MATH101', logs: 'PPPPPPPP', t: 10, m: 19, f: 50, done: true },
        { sid: 'STD-2024089', c: 'MATH101', logs: 'PALPPPAP', t: 4, m: 8, f: 0, abs: true, done: true },
    ];
    const codesByCourse = {};
    spec.forEach(r => { codesByCourse[r.c] = (codesByCourse[r.c] || 0) + 1; });
    const secretPools = {};
    Object.keys(codesByCourse).forEach((c, idx) => { secretPools[c] = generateSecretCodes(codesByCourse[c], 11 + idx * 5); });
    const counters = {};
    return spec.map(r => {
        const st = studentsSource.find(s => s.id === r.sid);
        counters[r.c] = (counters[r.c] || 0);
        const secretCode = secretPools[r.c][counters[r.c]++];
        const base = {
            id: `GRD-${st.academicId}-${r.c}`, studentId: st.id, academicId: st.academicId, studentName: st.nameAr,
            secretCode, courseCode: r.c, semesterId: 'Fall 2024',
            attendanceMarks: attendanceMarksFromLogs(logsFromString(r.logs)), taskMarks: r.t, midtermMarks: r.m,
            yearWorkLocked: !!r.done, finalExamMark: r.f, isAbsent: !!r.abs, graceMarksApplied: 0,
            weeklyLogs: logsFromString(r.logs), processed: !!r.done, isApproved: !!r.done, isPublished: !!r.done,
            totalMark: null, letterGrade: null, points: null
        };
        if (r.done) {
            const res = computeGradeResult(base, regulation);
            return { ...base, totalMark: res.totalMark, letterGrade: res.letterGrade, points: res.points };
        }
        return base;
    });
};

// ---------------------------------------------------------------------
// Term offerings (simplified naming: محاضرة / سكشن N / معمل N)
// ---------------------------------------------------------------------
const mkSec = (kind, n, instructorId, days, time, room, capacity, enrolled, practicalMarks = 0) => ({
    id: kind === 'lecture' ? 'LEC' : `${kind === 'lab' ? 'LAB' : 'SEC'}-${n}`,
    kind, label: kind === 'lecture' ? 'محاضرة' : kind === 'lab' ? `معمل ${n}` : `سكشن ${n}`,
    instructorId, days, time, room, capacity, enrolled, practicalMarks
});

const initialTermOfferings = [
    { id: 'OFF-CS101-Fall2024', courseCode: 'CS101', semesterId: 'Fall 2024', academicYear: '2024/2025', status: 'Open', sections: [
        mkSec('lecture', 0, 'INS-101', 'الأحد / الثلاثاء', '09:00 - 10:30', 'مدرج 1', 100, 92),
        mkSec('section', 1, 'INS-104', 'الأحد', '11:00 - 12:30', 'قاعة 101', 35, 34),
        mkSec('section', 2, 'INS-106', 'الإثنين', '11:00 - 12:30', 'قاعة 102', 35, 33),
        mkSec('lab', 1, 'INS-104', 'الأربعاء', '11:00 - 01:00', 'معمل حاسب 2', 30, 28, 10),
        mkSec('lab', 2, 'INS-106', 'الخميس', '11:00 - 01:00', 'معمل حاسب 2', 30, 30, 10),
    ]},
    { id: 'OFF-MATH101-Fall2024', courseCode: 'MATH101', semesterId: 'Fall 2024', academicYear: '2024/2025', status: 'Closed', sections: [
        mkSec('lecture', 0, 'INS-105', 'الإثنين / الخميس', '10:00 - 11:30', 'مدرج 2', 120, 120),
        mkSec('section', 1, 'INS-106', 'الثلاثاء', '12:00 - 02:00', 'قاعة 101', 40, 40, 5),
    ]},
    { id: 'OFF-IS201-Fall2024', courseCode: 'IS201', semesterId: 'Fall 2024', academicYear: '2024/2025', status: 'Open', sections: [
        mkSec('lecture', 0, 'INS-102', 'الأحد', '12:00 - 02:00', 'مدرج 1', 80, 55),
        mkSec('lab', 1, 'INS-104', 'الخميس', '09:00 - 11:00', 'معمل حاسب 1', 30, 22, 10),
    ]},
    { id: 'OFF-CS305-Fall2024', courseCode: 'CS305', semesterId: 'Fall 2024', academicYear: '2024/2025', status: 'Open', sections: [
        mkSec('lecture', 0, 'INS-101', 'الثلاثاء', '01:00 - 04:00', 'مدرج 3', 60, 41),
        mkSec('section', 1, 'INS-106', 'الأربعاء', '09:00 - 10:30', 'قاعة 103', 30, 20),
        mkSec('lab', 1, 'INS-104', 'الأربعاء', '02:00 - 04:00', 'معمل حاسب 2', 30, 20, 10),
    ]},
    { id: 'OFF-IS401-Fall2024', courseCode: 'IS401', semesterId: 'Fall 2024', academicYear: '2024/2025', status: 'Open', sections: [
        mkSec('lecture', 0, 'INS-102', 'الإثنين', '01:00 - 02:00', 'قاعة الاجتماعات', 40, 18),
        mkSec('lab', 1, 'INS-106', 'الخميس', '01:00 - 05:00', 'معمل مشروعات', 20, 18, 10),
    ]},
    { id: 'OFF-CS102-Spring2025', courseCode: 'CS102', semesterId: 'Spring 2025', academicYear: '2024/2025', status: 'Open', sections: [
        mkSec('lecture', 0, 'INS-101', 'الأحد / الثلاثاء', '09:00 - 10:30', 'مدرج 1', 100, 0),
        mkSec('lab', 1, 'INS-104', 'الأربعاء', '11:00 - 01:00', 'معمل حاسب 2', 30, 0, 10),
    ]},
    { id: 'OFF-IT202-Spring2025', courseCode: 'IT202', semesterId: 'Spring 2025', academicYear: '2024/2025', status: 'Open', sections: [
        mkSec('lecture', 0, 'INS-103', 'السبت', '10:00 - 01:00', 'مدرج 2', 70, 0),
        mkSec('lab', 1, 'INS-106', 'الأحد', '02:00 - 04:00', 'معمل شبكات', 25, 0, 10),
    ]},
];

const initialOverrideRequests = [
    { id: 'OVR-001', studentName: 'علي أحمد محمود حسن', typeAr: 'تجاوز الحد الأقصى للساعات', requestedCourse: 'CS305', reason: 'الطالب متوقع تخرجه هذا العام ويحتاج 21 ساعة لاستكمال المتطلبات.', advisorName: 'أ.د. محمد عبد الفتاح البرنس', status: 'Pending' },
    { id: 'OVR-002', studentName: 'عمر خالد عبد السلام', typeAr: 'تجاوز المتطلب السابق', requestedCourse: 'IS201', reason: 'اجتاز المتطلب السابق بمعادلة من معهد آخر ولم يُسجل بعد بالنظام.', advisorName: 'د. نرمين كمال فهمي', status: 'Pending' },
    { id: 'OVR-003', studentName: 'مريم يوسف إبراهيم', typeAr: 'تسجيل في شعبة مغلقة', requestedCourse: 'MATH101', reason: 'تعارض في جدول الطالبة مع الشعبة الأخرى.', advisorName: 'د. نرمين كمال فهمي', status: 'Approved' },
    { id: 'OVR-004', studentName: 'كريم طارق مصطفى', typeAr: 'تجاوز الحد الأقصى للساعات', requestedCourse: 'CS101', reason: 'الطالب تحت الإنذار الأكاديمي ولا يستوفي شروط زيادة العبء.', advisorName: 'أ.د. محمد عبد الفتاح البرنس', status: 'Rejected' }
];
