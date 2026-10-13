// Permission catalog used by the RBAC matrix + custom role builder
const PERMISSION_CATALOG = [
    { module: 'الإعداد الأكاديمي', items: [
        { key: 'reg.manage', label: 'إنشاء وتعديل اللوائح وسلالم التقديرات' },
        { key: 'dept.manage', label: 'إدارة الأقسام العلمية وقواعد التشعيب' },
        { key: 'catalog.manage', label: 'إدارة كتالوج المقررات وتوزيع الدرجات' },
    ]},
    { module: 'الأعضاء والموظفون', items: [
        { key: 'members.manage', label: 'إضافة وتعديل أعضاء هيئة التدريس والمعيدين' },
        { key: 'staff.manage', label: 'إضافة الموظفين وإدارة الصلاحيات' },
    ]},
    { module: 'الطلاب والدفعات', items: [
        { key: 'students.register', label: 'قيد الطلاب المستجدين وتحديث بياناتهم' },
        { key: 'students.status', label: 'تعديل الحالات الأكاديمية والاستثناءات' },
        { key: 'students.progress', label: 'تشغيل محرك الترقية والتشعيب' },
    ]},
    { module: 'عمليات الفصل الدراسي', items: [
        { key: 'term.offer', label: 'طرح المقررات وجدولة المحاضرات والسكاشن' },
        { key: 'term.override', label: 'الموافقة على طلبات الاستثناء وتجاوز حد الساعات' },
        { key: 'term.schedule', label: 'اعتماد الجداول الدراسية (حذف وإضافة)' },
    ]},
    { module: 'الكنترول والنتائج', items: [
        { key: 'control.entry', label: 'رصد أعمال السنة والحضور' },
        { key: 'control.process', label: 'تشغيل محرك النتائج ومنح الرأفة' },
        { key: 'control.approve', label: 'الاعتماد النهائي ونشر النتائج وحساب الـ CGPA' },
        { key: 'reports.view', label: 'استعراض كشوف الدرجات والتقارير (قراءة فقط)' },
    ]},
];

const ALL_PERMISSION_KEYS = PERMISSION_CATALOG.flatMap(g => g.items.map(i => i.key));

const initialRoles = [
    { id: 'ROLE-L1', name: 'Level 1 Control', nameAr: 'المستوى الأول - الكنترول والرئاسة', color: 'purple', system: true,
      description: 'أعلى صلاحيات في إدارة النتيجة والتحكم بالنظام.',
      permissions: ['control.entry', 'control.process', 'control.approve', 'reports.view', 'term.override', 'students.status'] },
    { id: 'ROLE-L2', name: 'Level 2 Entry', nameAr: 'المستوى الثاني - مدخلو البيانات والشؤون', color: 'blue', system: true,
      description: 'صلاحيات الإدخال والتسجيل المباشر.',
      permissions: ['students.register', 'students.progress', 'term.offer', 'control.entry', 'reports.view'] },
    { id: 'ROLE-L3', name: 'Level 3 Advisor', nameAr: 'المستوى الثالث - المشاهدة والإرشاد', color: 'emerald', system: true,
      description: 'صلاحيات المتابعة والاطلاع واعتماد الجداول.',
      permissions: ['reports.view', 'term.schedule'] },
];

const ROLE_COLORS = {
    purple: { badge: 'bg-purple-50 text-purple-800 border-purple-200', card: 'border-purple-200', head: 'text-purple-950', dot: 'bg-purple-600' },
    blue: { badge: 'bg-blue-50 text-blue-800 border-blue-200', card: 'border-blue-200', head: 'text-blue-950', dot: 'bg-blue-600' },
    emerald: { badge: 'bg-emerald-50 text-emerald-800 border-emerald-200', card: 'border-emerald-200', head: 'text-emerald-950', dot: 'bg-emerald-600' },
    amber: { badge: 'bg-amber-50 text-amber-800 border-amber-200', card: 'border-amber-200', head: 'text-amber-950', dot: 'bg-amber-500' },
    rose: { badge: 'bg-rose-50 text-rose-800 border-rose-200', card: 'border-rose-200', head: 'text-rose-950', dot: 'bg-rose-600' },
    slate: { badge: 'bg-slate-100 text-slate-800 border-slate-300', card: 'border-slate-300', head: 'text-slate-900', dot: 'bg-slate-600' },
};
