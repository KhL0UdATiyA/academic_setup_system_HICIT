const NAV_ITEMS = [
    { key: 'Dashboard', name: 'لوحة التحكم', en: 'Dashboard', icon: 'layout-dashboard' },
    { key: 'Academic Setup', name: 'الإعداد الأكاديمي', en: 'Academic Setup', icon: 'book-open' },
    { key: 'System Members', name: 'أعضاء النظام', en: 'System Members', icon: 'users' },
    { key: 'Students & Cohorts', name: 'الطلاب والدفعات', en: 'Students & Cohorts', icon: 'user-check' },
    { key: 'Term Operations', name: 'عمليات الفصل الدراسي', en: 'Term Operations', icon: 'calendar' },
    { key: 'Control & Grading', name: 'الكنترول والنتائج', en: 'Control & Grading', icon: 'file-spreadsheet' },
];

const SUB_TABS = {
    'Academic Setup': [
        { id: 'Regulations Management', label: 'اللوائح الأكاديمية' },
        { id: 'Departments', label: 'الأقسام العلمية' },
        { id: 'Global Course Catalog', label: 'كتالوج المقررات' },
    ],
    'System Members': [
        { id: 'Instructors Directory', label: 'أعضاء هيئة التدريس والمعيدون' },
        { id: 'Staff & Roles (RBAC)', label: 'الموظفون والصلاحيات (RBAC)' },
    ],
    'Students & Cohorts': [
        { id: 'Cohorts & Student Onboarding', label: 'الدفعات وقيد الطلاب' },
        { id: 'Academic Status Tracking & Overrides', label: 'تتبع الحالات الأكاديمية والاستثناءات' },
        { id: 'Progression & Department Branching', label: 'الترقية والتشعيب' },
    ],
    'Term Operations': [
        { id: 'Term Offerings & Scheduling', label: 'طرح المقررات والجدولة' },
        { id: 'Course Assignment & Teaching Load', label: 'الأعباء التدريسية' },
        { id: 'Registration & Overrides', label: 'التسجيل والاستثناءات' },
    ],
    'Control & Grading': [
        { id: 'Instructor Assessment Log', label: '1. رصد درجات المحاضر (40% أعمال سنة)' },
        { id: 'Grade Processing & Rules Engine', label: '2. محرك المعالجة والنتائج والإنذارات' },
        { id: 'Verification, Lock & Publishing', label: '3. التوثيق وقفل الكنترول ومواعيد الامتحانات' },
    ],
};

// Which permission opens which screen: 'full' = manage, 'read' = read-only access
const TAB_ACCESS = {
    'Regulations Management': { full: ['reg.manage'], read: ['reports.view'] },
    'Departments': { full: ['dept.manage'], read: ['reports.view'] },
    'Global Course Catalog': { full: ['catalog.manage'], read: ['reports.view'] },
    'Instructors Directory': { full: ['members.manage'], read: ['reports.view'] },
    'Staff & Roles (RBAC)': { full: ['staff.manage'], read: [] },
    'Cohorts & Student Onboarding': { full: ['students.register'], read: ['reports.view'] },
    'Academic Status Tracking & Overrides': { full: ['students.status'], read: ['reports.view'] },
    'Progression & Department Branching': { full: ['students.progress'], read: ['reports.view'] },
    'Term Offerings & Scheduling': { full: ['term.offer'], read: ['term.schedule', 'reports.view'] },
    'Course Assignment & Teaching Load': { full: ['term.offer'], read: ['term.schedule', 'reports.view'] },
    'Registration & Overrides': { full: ['term.override', 'students.register'], read: ['reports.view'] },
    'Instructor Assessment Log': { full: ['control.entry'], read: ['reports.view'] },
    'Grade Processing & Rules Engine': { full: ['control.process'], read: ['reports.view'] },
    'Verification, Lock & Publishing': { full: ['control.approve'], read: ['reports.view'] },
};

const accessFor = (perms, tabId) => {
    const rule = TAB_ACCESS[tabId];
    if (!rule) return 'full';
    if (rule.full.some(k => perms.includes(k))) return 'full';
    if (rule.read.some(k => perms.includes(k))) return 'readonly';
    return 'none';
};
