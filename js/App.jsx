function App() {
    const [activeNav, setActiveNav] = useState('Dashboard');
    const [activeSubTab, setActiveSubTab] = useState('');
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [isInstituteOpen, setIsInstituteOpen] = useState(false);
    const [viewPersonaId, setViewPersonaId] = useState('SUPER');
    const [isPersonaMenuOpen, setIsPersonaMenuOpen] = useState(false);

    const [regulations, setRegulations] = useState(initialRegulations);
    const [departments, setDepartments] = useState(initialDepartments);
    const [courses, setCourses] = useState(initialCourses);
    const [instructors, setInstructors] = useState(initialInstructors);
    const [staffList, setStaffList] = useState(initialStaff);
    const [roles, setRoles] = useState(initialRoles);

    const [cohorts, setCohorts] = useState([
        ...initialCohorts,
        { id: 'COH-2022', code: 'دفعة 2022', level: 3, regulationId: 'REG-2023', totalStudents: 310, avgGpa: 2.94, warnedCount: 14, status: 'Active' },
        { id: 'COH-2021', code: 'دفعة 2021 (التخرج)', level: 4, regulationId: 'REG-2023', totalStudents: 280, avgGpa: 3.01, warnedCount: 9, status: 'Active' },
    ]);
    const [students, setStudents] = useState([...initialStudents, ...extraStudents]);

    const [activeSemester, setActiveSemester] = useState('Fall 2024');
    const [termOfferings, setTermOfferings] = useState(initialTermOfferings);
    const [overrideRequests, setOverrideRequests] = useState(initialOverrideRequests);

    // Control & Grading state
    const [studentGrades, setStudentGrades] = useState(() => buildInitialGrades([...initialStudents, ...extraStudents], initialRegulations.find(r => r.status === 'Active') || initialRegulations[0]));

    const [statusFocus, setStatusFocus] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [toast, setToast] = useState(null);

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 4000);
    };

    const [isBuilderOpen, setIsBuilderOpen] = useState(false);
    const [currentRegulation, setCurrentRegulation] = useState(null);

    // ---- "View as" personas (role preview) ----
    const facultyDemo = instructors.find(i => i.id === 'INS-101') || instructors.find(i => FACULTY_TITLES.includes(i.title));
    const personas = [
        { id: 'SUPER', nameAr: 'المدير العام للنظام', who: 'Super Admin', initials: 'SA', permissions: ALL_PERMISSION_KEYS, color: 'emerald' },
        ...roles.map(r => {
            const m = staffList.find(s => s.accessLevel === r.name);
            const digit = (r.name.match(/\d/) || [])[0];
            return { id: r.id, nameAr: r.nameAr, who: m ? m.name : r.name, initials: digit ? `L${digit}` : r.name.slice(0, 2).toUpperCase(), permissions: r.permissions, color: r.color };
        }),
        { id: 'FACULTY', nameAr: 'عضو هيئة تدريس / معيد (مقرراته فقط)', who: facultyDemo ? facultyDemo.name : 'عضو هيئة تدريس', initials: 'DR', permissions: ['control.entry', 'term.schedule'], color: 'blue', scope: 'own', instructorId: facultyDemo ? facultyDemo.id : null },
    ];
    const persona = personas.find(x => x.id === viewPersonaId) || personas[0];
    const getAccess = (tabId) => accessFor(persona.permissions, tabId);
    const navAccessible = (key) => !SUB_TABS[key] || SUB_TABS[key].some(s => getAccess(s.id) !== 'none');

    const controlCourses = useMemo(() => {
        if (persona.scope !== 'own') return courses;
        return courses.filter(c => termOfferings.some(o => o.semesterId === activeSemester && o.courseCode === c.code && o.sections.some(s => s.instructorId === persona.instructorId)));
    }, [courses, termOfferings, activeSemester, persona.scope, persona.instructorId]);

    const navigate = (key) => {
        if (SUB_TABS[key]) {
            const first = SUB_TABS[key].find(s => getAccess(s.id) !== 'none');
            if (!first) { showToast('لا تملك صلاحية الدخول لهذا القسم بالمستوى الحالي.', 'error'); return; }
            setActiveNav(key);
            setActiveSubTab(first.id);
        } else {
            setActiveNav(key);
            setActiveSubTab('');
        }
        setSearchQuery('');
    };

    const switchPersona = (id) => {
        const next = personas.find(x => x.id === id);
        if (!next) return;
        const stillAllowed = activeNav === 'Dashboard' || accessFor(next.permissions, activeSubTab) !== 'none';
        if (!stillAllowed) { setActiveNav('Dashboard'); setActiveSubTab(''); }
        setViewPersonaId(id);
        setIsPersonaMenuOpen(false);
        showToast(id === 'SUPER' ? 'تمت العودة لعرض المدير العام بكامل الصلاحيات.' : `أنت الآن تعرض النظام بصلاحيات: ${next.nameAr}`, 'info');
    };

    // Direct jump from the Progression engine to the "Academic Status Tracking & Exceptions" screen
    const openStatusTracking = (level) => {
        if (getAccess('Academic Status Tracking & Overrides') === 'none') { showToast('لا تملك صلاحية الاطلاع على الحالات الأكاديمية.', 'error'); return; }
        setStatusFocus({ level, nonce: Date.now() });
        setActiveNav('Students & Cohorts');
        setActiveSubTab('Academic Status Tracking & Overrides');
    };

    // Icons (lucide) are re-rendered whenever the DOM changes (modals, tabs, etc.)
    useEffect(() => {
        let timer = null;
        const refresh = () => { if (window.lucide) window.lucide.createIcons(); };
        refresh();
        const observer = new MutationObserver(() => {
            clearTimeout(timer);
            timer = setTimeout(refresh, 30);
        });
        observer.observe(document.body, { childList: true, subtree: true });
        return () => { observer.disconnect(); clearTimeout(timer); };
    }, []);

    useEffect(() => {
        const onKey = (e) => {
            if (e.key === 'Escape') { setIsInstituteOpen(false); setIsBuilderOpen(false); setIsPersonaMenuOpen(false); }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, []);

    const handleCreateNewRegulation = () => {
        const year = new Date().getFullYear() + 1;
        const newReg = {
            id: `REG-${year}`,
            code: `REG-${year}`,
            title: `لائحة المعهد العالي ${year}`,
            status: 'Draft',
            totalHours: 134,
            maxStayLevel1: 2,
            maxAcademicWarnings: 4,
            applicableCohorts: [`دفعة ${year}`],
            description: 'مسودة لائحة جديدة مجهزة للتعديل وضبط اللوائح وقواعد التسجيل.',
            gradeScales: [
                { grade: 'A', points: 4.0, minPercent: 85, desc: 'ممتاز' },
                { grade: 'B+', points: 3.5, minPercent: 80, desc: 'جيد جداً مرتفع' },
                { grade: 'B', points: 3.0, minPercent: 75, desc: 'جيد جداً' },
                { grade: 'C+', points: 2.5, minPercent: 70, desc: 'جيد مرتفع' },
                { grade: 'C', points: 2.0, minPercent: 65, desc: 'جيد' },
                { grade: 'D+', points: 1.5, minPercent: 60, desc: 'مقبول مرتفع' },
                { grade: 'D', points: 1.0, minPercent: 50, desc: 'مقبول' },
                { grade: 'F', points: 0.0, minPercent: 0, desc: 'راسب' },
            ],
            semesterRules: { maxHoursRegular: 18, maxHoursWarned: 12, maxHoursSummer: 9, minProgressionHours: 28 },
            progressionRules: { ...DEFAULT_PROGRESSION },
            controlRules: { ...DEFAULT_CONTROL_RULES },
            updatedAt: new Date().toISOString().split('T')[0]
        };
        setCurrentRegulation(newReg);
        setIsBuilderOpen(true);
    };

    const handleDuplicateRegulation = (regToDuplicate) => {
        const copy = {
            ...JSON.parse(JSON.stringify(regToDuplicate)),
            id: `REG-2025-COPY-${Date.now().toString().slice(-4)}`,
            code: `REG-2025`,
            title: `لائحة المعهد المحدثة 2025 (مسودة معدلة من ${regToDuplicate.code})`,
            status: 'Under Review',
            applicableCohorts: ['دفعة 2025 المستقبليين'],
            updatedAt: new Date().toISOString().split('T')[0]
        };
        setRegulations([...regulations, copy]);
        showToast(`تم نسخ اللائحة (${regToDuplicate.code}) بنجاح وتحويلها لمسودة لائحة 2025!`);
    };

    const handleEditRegulation = (reg) => {
        setCurrentRegulation(JSON.parse(JSON.stringify(reg)));
        setIsBuilderOpen(true);
    };

    const handleSaveRegulation = (updatedReg) => {
        const exists = regulations.some(r => r.id === updatedReg.id);
        if (exists) {
            setRegulations(regulations.map(r => r.id === updatedReg.id ? updatedReg : r));
            showToast('تم تحديث قواعد وضوابط اللائحة بنجاح.');
        } else {
            setRegulations([...regulations, updatedReg]);
            showToast('تم إنشاء وتطوير اللائحة الأكاديمية الجديدة بنجاح.');
        }
        setIsBuilderOpen(false);
    };

    const activeRegulation = regulations.find(r => r.status === 'Active') || regulations[0];
    const currentNav = NAV_ITEMS.find(n => n.key === activeNav);
    const subTabs = SUB_TABS[activeNav] ? SUB_TABS[activeNav].filter(s => getAccess(s.id) !== 'none') : null;
    const mode = activeNav === 'Dashboard' ? 'full' : getAccess(activeSubTab);

    return (
        <div className="flex h-screen bg-[#f4f6fa] overflow-hidden">
            {/* Sidebar (collapsible) */}
            <aside className={`${sidebarCollapsed ? 'w-[76px]' : 'w-64'} gradient-sidebar text-white flex flex-col justify-between shadow-xl z-20 shrink-0 transition-all duration-300`}>
                <div>
                    <div className={`p-4 flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-3'} border-b border-white/10`}>
                        <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur flex items-center justify-center text-white font-bold shadow-inner shrink-0">
                            <i data-lucide="graduation-cap" className="w-6 h-6"></i>
                        </div>
                        {!sidebarCollapsed && (
                            <div className="min-w-0">
                                <h1 className="font-extrabold text-lg tracking-wider leading-tight">HICIT</h1>
                                <p className="text-[10px] text-blue-200 opacity-80 font-semibold leading-tight">المعهد العالي للحاسبات - المنصورة</p>
                            </div>
                        )}
                    </div>

                    <nav className="mt-5 px-3 space-y-1">
                        {NAV_ITEMS.filter(item => item.key === 'Dashboard' || navAccessible(item.key)).map((item) => {
                            const isActive = activeNav === item.key;
                            return (
                                <button
                                    key={item.key}
                                    onClick={() => navigate(item.key)}
                                    title={item.name}
                                    className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center px-0' : 'gap-3 px-4'} py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                                        isActive
                                            ? 'bg-white/15 text-white shadow-lg backdrop-blur-md border border-white/20 font-bold'
                                            : 'text-blue-100 hover:bg-white/10 hover:text-white'
                                    }`}
                                >
                                    <i data-lucide={item.icon} className={`w-5 h-5 shrink-0 ${isActive ? 'text-blue-300' : 'text-blue-200'}`}></i>
                                    {!sidebarCollapsed && (
                                        <span className="text-right leading-tight">
                                            <span className="block">{item.name}</span>
                                            <span className="block text-[10px] opacity-60 font-normal">{item.en}</span>
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </nav>
                </div>

                <div className="p-3 border-t border-white/10 space-y-1">
                    <button
                        onClick={() => setIsInstituteOpen(true)}
                        title="تعريف المعهد العالي للحاسبات بالمنصورة"
                        className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center px-0' : 'gap-3 px-4'} py-2.5 rounded-xl text-sm font-bold text-amber-200 bg-white/5 hover:bg-white/10 transition`}
                    >
                        <i data-lucide="building-2" className="w-5 h-5 shrink-0"></i>
                        {!sidebarCollapsed && <span>تعريف المعهد</span>}
                    </button>
                </div>
            </aside>

            {/* Main content wrapper */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <header className="bg-white border-b border-slate-200 shadow-sm z-10">
                    <div className="px-6 py-3 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 min-w-0">
                            <button
                                onClick={() => setSidebarCollapsed(v => !v)}
                                title="طي / فتح القائمة الجانبية"
                                className="p-2 rounded-xl hover:bg-slate-100 text-slate-600 border border-slate-200"
                            >
                                <i data-lucide="menu" className="w-5 h-5"></i>
                            </button>
                            <div className="min-w-0">
                                <div className="text-[11px] text-slate-400 font-semibold">HICIT · نظام الإدارة الأكاديمية</div>
                                <div className="text-lg font-extrabold text-slate-900 truncate">{currentNav ? currentNav.name : ''}</div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="relative hidden md:block">
                                <i data-lucide="search" className="w-4 h-4 text-slate-400 absolute top-3 right-3"></i>
                                <input
                                    type="text"
                                    placeholder="بحث عن طالب، كود، محاضر، لائحة..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-4 pr-9 py-2 bg-slate-100 border border-slate-200 rounded-full text-xs w-64 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                                />
                            </div>
                            <button
                                onClick={() => setIsInstituteOpen(true)}
                                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-extrabold transition"
                            >
                                <i data-lucide="building-2" className="w-4 h-4"></i>
                                <span className="hidden lg:inline">تعريف المعهد</span>
                            </button>
                            <div className="relative border-r pr-4 border-slate-200">
                                <button onClick={() => setIsPersonaMenuOpen(v => !v)} title="عرض النظام كأنك مستخدم بصلاحيات مختلفة" className="flex items-center gap-3 rounded-2xl px-2 py-1 hover:bg-slate-50 transition">
                                    <div className={`w-10 h-10 rounded-full text-white flex items-center justify-center font-black text-sm shadow ring-2 ring-white border border-slate-200 ${persona.id === 'SUPER' ? 'bg-gradient-to-br from-blue-700 to-indigo-900' : 'bg-gradient-to-br from-amber-500 to-orange-700'}`}>{persona.initials}</div>
                                    <div className="leading-tight text-right">
                                        <div className="text-sm font-extrabold text-slate-900 max-w-[170px] truncate">{persona.who}</div>
                                        <div className={`text-[11px] font-bold flex items-center gap-1 ${persona.id === 'SUPER' ? 'text-emerald-700' : 'text-amber-700'}`}>
                                            <span className={`w-1.5 h-1.5 rounded-full inline-block ${persona.id === 'SUPER' ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                                            <span className="max-w-[150px] truncate">{persona.nameAr}</span>
                                        </div>
                                    </div>
                                    <span className="text-slate-400 text-xs">▾</span>
                                </button>

                                {isPersonaMenuOpen && (
                                    <>
                                        <div className="fixed inset-0 z-40" onClick={() => setIsPersonaMenuOpen(false)}></div>
                                        <div className="absolute left-0 top-full mt-2 w-96 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 overflow-hidden">
                                            <div className="px-4 py-3 bg-slate-900 text-white">
                                                <div className="text-sm font-extrabold">عرض النظام كأنك…</div>
                                                <div className="text-[11px] text-slate-400">اختر مستخدماً لتشاهد الشاشات والأزرار المتاحة له فقط (معاينة).</div>
                                            </div>
                                            <div className="max-h-96 overflow-y-auto divide-y divide-slate-100">
                                                {personas.map(x => {
                                                    const col = ROLE_COLORS[x.color] || ROLE_COLORS.slate;
                                                    const active = x.id === persona.id;
                                                    const screens = Object.keys(TAB_ACCESS).filter(t => accessFor(x.permissions, t) !== 'none').length;
                                                    return (
                                                        <button key={x.id} onClick={() => switchPersona(x.id)} className={`w-full text-right px-4 py-3 flex items-center gap-3 hover:bg-slate-50 transition ${active ? 'bg-blue-50' : ''}`}>
                                                            <span className={`w-9 h-9 rounded-full shrink-0 flex items-center justify-center text-white text-xs font-black ${col.dot}`}>{x.initials}</span>
                                                            <span className="flex-1 min-w-0">
                                                                <span className="block text-xs font-extrabold text-slate-900 truncate">{x.who}</span>
                                                                <span className="block text-[11px] text-slate-500 truncate">{x.nameAr}</span>
                                                            </span>
                                                            <span className="text-[10px] font-bold text-slate-500 whitespace-nowrap">{x.id === 'SUPER' ? 'كل الشاشات' : `${screens} من ${Object.keys(TAB_ACCESS).length} شاشة`}</span>
                                                            {active && <span className="text-blue-700 font-black">✓</span>}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {persona.id !== 'SUPER' && (
                        <div className="px-6 py-2 bg-amber-50 border-t border-amber-200 text-xs font-bold text-amber-900 flex items-center justify-between gap-3">
                            <span>وضع المعاينة: أنت تشاهد النظام بصلاحيات «{persona.nameAr}» — {persona.who}</span>
                            <button onClick={() => switchPersona('SUPER')} className="px-3 py-1 rounded-lg bg-amber-200 hover:bg-amber-300 text-amber-950 font-extrabold">العودة للمدير العام</button>
                        </div>
                    )}

                    {subTabs && (
                        <div className="px-6 border-t border-slate-100 flex items-center gap-7 overflow-x-auto">
                            {subTabs.map((sub) => {
                                const isSelected = activeSubTab === sub.id;
                                return (
                                    <button
                                        key={sub.id}
                                        onClick={() => setActiveSubTab(sub.id)}
                                        className={`relative py-3 text-sm font-semibold whitespace-nowrap transition-colors ${
                                            isSelected ? 'text-blue-700 font-bold' : 'text-slate-600 hover:text-slate-900'
                                        }`}
                                    >
                                        {sub.label}
                                        {getAccess(sub.id) === 'readonly' && <span className="mr-1.5 text-[9px] bg-slate-100 text-slate-500 border border-slate-200 rounded px-1.5 py-0.5 font-bold">قراءة فقط</span>}
                                        {isSelected && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-700 rounded-full"></span>}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </header>

                <main className="flex-1 overflow-y-auto p-8">
                    {toast && (
                        <div key={toast.msg} className={`fixed bottom-6 left-6 z-[60] pl-3 pr-5 py-3 rounded-xl shadow-2xl text-white font-medium flex items-center gap-3 max-w-md ${
                            toast.type === 'success' ? 'bg-emerald-600' : toast.type === 'error' ? 'bg-rose-600' : 'bg-blue-600'
                        }`}>
                            <i data-lucide={toast.type === 'error' ? 'alert-circle' : 'check-circle-2'} className="w-5 h-5 shrink-0"></i>
                            <span className="text-sm">{toast.msg}</span>
                            <button onClick={() => setToast(null)} className="p-1 rounded-lg hover:bg-white/20" title="إغلاق"><i data-lucide="x" className="w-4 h-4"></i></button>
                        </div>
                    )}

                    {mode === 'none' ? (
                        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-2">
                            <div className="text-4xl">🔒</div>
                            <div className="font-extrabold text-slate-900">لا تملك صلاحية الدخول لهذه الشاشة</div>
                            <div className="text-xs text-slate-500">تواصل مع مدير النظام لمنحك الصلاحية المناسبة.</div>
                        </div>
                    ) : (
                    <>
                    {mode === 'readonly' && (
                        <div className="mb-5 bg-slate-100 border border-slate-300 text-slate-700 rounded-xl px-4 py-3 text-xs font-bold flex items-center gap-2">
                            <span>👁</span>
                            <span>وضع القراءة فقط: صلاحيات «{persona.nameAr}» تسمح بالاطلاع على هذه الشاشة دون تنفيذ أي تعديل.</span>
                        </div>
                    )}
                    {persona.scope === 'own' && activeSubTab === 'Instructor Assessment Log' && (
                        <div className="mb-5 bg-blue-50 border border-blue-200 text-blue-900 rounded-xl px-4 py-3 text-xs font-bold">
                            تظهر هنا مقرراتك المسندة لك فقط في الفصل الحالي ({controlCourses.length} مقرر): {controlCourses.map(c => c.code).join('، ') || '—'}
                        </div>
                    )}
                    <fieldset disabled={mode === 'readonly'} className="contents">
                    {/* Dashboard */}
                    {activeNav === 'Dashboard' && (
                        <DashboardOverviewView
                            students={students}
                            instructors={instructors}
                            courses={courses}
                            studentGrades={studentGrades}
                            overrideRequests={overrideRequests}
                            cohorts={cohorts}
                            setActiveNav={navigate}
                            onOpenInstitute={() => setIsInstituteOpen(true)}
                        />
                    )}

                    {/* Academic Setup */}
                    {activeNav === 'Academic Setup' && (
                        <>
                            {activeSubTab === 'Regulations Management' && (
                                <RegulationsDirectoryView
                                    regulations={regulations}
                                    searchQuery={searchQuery}
                                    onCreateNew={handleCreateNewRegulation}
                                    onDuplicate={handleDuplicateRegulation}
                                    onEdit={handleEditRegulation}
                                />
                            )}
                            {activeSubTab === 'Departments' && (
                                <DepartmentsView departments={departments} setDepartments={setDepartments} regulations={regulations} showToast={showToast} />
                            )}
                            {activeSubTab === 'Global Course Catalog' && (
                                <CourseCatalogView courses={courses} setCourses={setCourses} departments={departments} regulations={regulations} showToast={showToast} />
                            )}
                        </>
                    )}

                    {/* System Members */}
                    {activeNav === 'System Members' && (
                        <>
                            {activeSubTab === 'Instructors Directory' && (
                                <InstructorsDirectoryView instructors={instructors} setInstructors={setInstructors} departments={departments} searchQuery={searchQuery} showToast={showToast} />
                            )}
                            {activeSubTab === 'Staff & Roles (RBAC)' && (
                                <StaffAndRolesView staffList={staffList} setStaffList={setStaffList} roles={roles} setRoles={setRoles} departments={departments} showToast={showToast} />
                            )}
                        </>
                    )}

                    {/* Students & Cohorts */}
                    {activeNav === 'Students & Cohorts' && (
                        <>
                            {activeSubTab === 'Cohorts & Student Onboarding' && (
                                <CohortsAndOnboardingView
                                    cohorts={cohorts} students={students} setStudents={setStudents} departments={departments}
                                    regulations={regulations} instructors={instructors} searchQuery={searchQuery} showToast={showToast}
                                />
                            )}
                            {activeSubTab === 'Academic Status Tracking & Overrides' && (
                                <AcademicStatusTrackingView
                                    students={students} setStudents={setStudents} cohorts={cohorts} departments={departments}
                                    regulations={regulations} focus={statusFocus} clearFocus={() => setStatusFocus(null)}
                                    searchQuery={searchQuery} showToast={showToast}
                                />
                            )}
                            {activeSubTab === 'Progression & Department Branching' && (
                                <ProgressionAndBranchingView
                                    students={students} setStudents={setStudents} departments={departments}
                                    regulations={regulations} showToast={showToast} onOpenStatusTracking={openStatusTracking}
                                />
                            )}
                        </>
                    )}

                    {/* Term Operations */}
                    {activeNav === 'Term Operations' && (
                        <>
                            {activeSubTab === 'Term Offerings & Scheduling' && (
                                <TermOfferingsView
                                    activeSemester={activeSemester} setActiveSemester={setActiveSemester}
                                    termOfferings={termOfferings} setTermOfferings={setTermOfferings}
                                    courses={courses} instructors={instructors} searchQuery={searchQuery} showToast={showToast}
                                />
                            )}
                            {activeSubTab === 'Course Assignment & Teaching Load' && (
                                <TeachingLoadView
                                    activeSemester={activeSemester} instructors={instructors} termOfferings={termOfferings}
                                    courses={courses} searchQuery={searchQuery} showToast={showToast}
                                />
                            )}
                            {activeSubTab === 'Registration & Overrides' && (
                                <RegistrationAndOverridesView
                                    students={students} termOfferings={termOfferings} courses={courses}
                                    overrideRequests={overrideRequests} setOverrideRequests={setOverrideRequests}
                                    searchQuery={searchQuery} showToast={showToast}
                                />
                            )}
                        </>
                    )}

                    {/* Control & Grading */}
                    {activeNav === 'Control & Grading' && (
                        <>
                            {activeSubTab === 'Instructor Assessment Log' && (
                                <InstructorAssessmentLogView
                                    courses={controlCourses} regulation={activeRegulation} studentGrades={studentGrades}
                                    setStudentGrades={setStudentGrades} searchQuery={searchQuery} showToast={showToast}
                                />
                            )}
                            {activeSubTab === 'Grade Processing & Rules Engine' && (
                                <GradeProcessingEngineView
                                    courses={courses} students={students} departments={departments} regulation={activeRegulation} studentGrades={studentGrades}
                                    setStudentGrades={setStudentGrades} searchQuery={searchQuery} showToast={showToast}
                                />
                            )}
                            {activeSubTab === 'Verification, Lock & Publishing' && (
                                <VerificationLockPublishView
                                    courses={courses} regulation={activeRegulation} students={students} setStudents={setStudents} cohorts={cohorts}
                                    studentGrades={studentGrades} setStudentGrades={setStudentGrades} showToast={showToast}
                                />
                            )}
                        </>
                    )}
                    </fieldset>
                    </>
                    )}
                </main>
            </div>

            {isBuilderOpen && currentRegulation && (
                <RegulationBuilderModal regulation={currentRegulation} onClose={() => setIsBuilderOpen(false)} onSave={handleSaveRegulation} />
            )}

            {isInstituteOpen && (
                <InstituteProfileModal
                    students={students} instructors={instructors} courses={courses} departments={departments}
                    cohorts={cohorts} regulation={activeRegulation} onClose={() => setIsInstituteOpen(false)}
                />
            )}
        </div>
    );
}
