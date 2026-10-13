function RegulationBuilderModal({ regulation, onClose, onSave }) {
    const [activeTab, setActiveTab] = useState('general');
    const [formData, setFormData] = useState(regulation);

    useEffect(() => {
        if (window.lucide) {
            window.lucide.createIcons();
        }
    }, [activeTab]);

    const handleGeneralChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSemesterRulesChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            semesterRules: { ...prev.semesterRules, [field]: Number(value) }
        }));
    };

    const handleProgressionChange = (field, value) => {
        setFormData(prev => ({ ...prev, progressionRules: { ...getProgressionRules(prev), ...(prev.progressionRules || {}), [field]: Number(value) } }));
    };
    const handleControlChange = (field, value) => {
        setFormData(prev => ({ ...prev, controlRules: { ...getControlRules(prev), [field]: Number(value) } }));
    };
    const handleYearWorkChange = (value) => {
        const yw = Math.min(100, Math.max(0, Number(value)));
        setFormData(prev => ({ ...prev, controlRules: { ...getControlRules(prev), yearWorkMax: yw, finalMax: 100 - yw } }));
    };

    const handleAddGradeRow = () => {
        const newRow = { grade: 'N', points: 1.0, minPercent: 50, desc: 'تقدير جديد' };
        setFormData(prev => ({
            ...prev,
            gradeScales: [...prev.gradeScales, newRow]
        }));
    };

    const handleUpdateGradeRow = (index, field, value) => {
        const updated = [...formData.gradeScales];
        updated[index][field] = field === 'points' || field === 'minPercent' ? Number(value) : value;
        setFormData(prev => ({ ...prev, gradeScales: updated }));
    };

    const handleDeleteGradeRow = (index) => {
        setFormData(prev => ({
            ...prev,
            gradeScales: prev.gradeScales.filter((_, i) => i !== index)
        }));
    };

    return (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-3xl w-full max-w-5xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
                <div className="bg-slate-900 text-white p-6 flex items-center justify-between border-b border-slate-800">
                    <div>
                        <div className="flex items-center gap-3">
                            <h2 className="text-xl font-extrabold">{formData.title}</h2>
                            <span className="font-mono text-xs bg-blue-600/30 text-blue-300 border border-blue-400/30 px-2.5 py-0.5 rounded">
                                {formData.code}
                            </span>
                        </div>
                        <p className="text-slate-400 text-xs mt-1">
                            مُنشئ ومعدل اللوائح الدراسية (Regulation Builder Workflow) - ضبط القواعد والسلالم والنظام الدراسي.
                        </p>
                    </div>
                    <button onClick={onClose} title="إغلاق" className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition">
                        <i data-lucide="x" className="w-6 h-6"></i>
                    </button>
                </div>

                <div className="bg-slate-100 border-b border-slate-200 px-6 pt-3 flex items-center gap-2 overflow-x-auto">
                    {[
                        { id: 'general', title: 'البيانات العامة وضوابط التخرج', icon: 'file-text' },
                        { id: 'gradescale', title: 'سلم التقديرات والدرجات', icon: 'award' },
                        { id: 'hierarchy', title: 'شجرة الفرق والفصول', icon: 'layers' },
                        { id: 'semester', title: 'شروط وقواعد التسجيل', icon: 'shield-alert' },
                        { id: 'control', title: 'شروط الانتقال والكنترول', icon: 'clipboard-check' },
                    ].map((tab) => {
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`px-4 py-3 rounded-t-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
                                    isActive
                                        ? 'bg-white text-blue-700 border-t-2 border-x border-slate-200 shadow-sm'
                                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                                }`}
                            >
                                <i data-lucide={tab.icon} className={`w-4 h-4 ${isActive ? 'text-blue-700' : 'text-slate-500'}`}></i>
                                <span>{tab.title}</span>
                            </button>
                        );
                    })}
                </div>

                <div className="p-6 overflow-y-auto flex-1 space-y-6">
                    {activeTab === 'general' && (
                        <div className="space-y-6">
                            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-xs text-blue-900 leading-relaxed">
                                <strong>البيانات العامة وضوابط التخرج:</strong> كود واسم اللائحة، إجمالي ساعات التخرج، أقصى مدة للبقاء بالمستوى الأول، وحد الإنذارات الأكاديمية للفصل أو التحويل.
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">كود واسم اللائحة (مثال REG-2023):</label>
                                    <input
                                        type="text"
                                        value={formData.code}
                                        onChange={(e) => handleGeneralChange('code', e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-bold focus:bg-white focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">عنوان اللائحة الكامل:</label>
                                    <input
                                        type="text"
                                        value={formData.title}
                                        onChange={(e) => handleGeneralChange('title', e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-bold focus:bg-white focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">إجمالي ساعات التخرج (حقل عددي):</label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="number"
                                            value={formData.totalHours}
                                            onChange={(e) => handleGeneralChange('totalHours', Number(e.target.value))}
                                            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-bold focus:bg-white focus:ring-2 focus:ring-blue-500"
                                        />
                                        <span className="text-xs text-slate-500 font-bold whitespace-nowrap">ساعة معتمدة</span>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">أقصى مدة للبقاء بالمستوى الأول (حقل عددي):</label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="number"
                                            value={formData.maxStayLevel1}
                                            onChange={(e) => handleGeneralChange('maxStayLevel1', Number(e.target.value))}
                                            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-bold focus:bg-white focus:ring-2 focus:ring-blue-500"
                                        />
                                        <span className="text-xs text-slate-500 font-bold whitespace-nowrap">سنة دراسية</span>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">حد الإنذارات الأكاديمية للفصل/التحويل (حقل عددي - مادة 25):</label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="number"
                                            value={formData.maxAcademicWarnings}
                                            onChange={(e) => handleGeneralChange('maxAcademicWarnings', Number(e.target.value))}
                                            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-bold focus:bg-white focus:ring-2 focus:ring-blue-500"
                                        />
                                        <span className="text-xs text-slate-500 font-bold whitespace-nowrap">إنذارات متتالية</span>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">حالة اللائحة (Status):</label>
                                    <select
                                        value={formData.status}
                                        onChange={(e) => handleGeneralChange('status', e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-bold focus:bg-white focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="Active">نشطة (Active)</option>
                                        <option value="Under Review">قيد المراجعة (Under Review)</option>
                                        <option value="Draft">مسودة (Draft)</option>
                                        <option value="Archived">مؤرشفة (Archived)</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">الوصف التفصيلي والدفعات المطبقة:</label>
                                <textarea
                                    rows="3"
                                    value={formData.description}
                                    onChange={(e) => handleGeneralChange('description', e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs focus:bg-white focus:ring-2 focus:ring-blue-500"
                                ></textarea>
                            </div>
                        </div>
                    )}

                    {activeTab === 'gradescale' && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="font-bold text-slate-900 text-sm">سلم التقديرات النقطية (Grade Scale System)</h3>
                                    <p className="text-xs text-slate-500">جدول إدخال وتعديل التقديرات الحرفية والدرجات والنقاط المعتمدة في اللائحة.</p>
                                </div>
                                <button
                                    onClick={handleAddGradeRow}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition"
                                >
                                    <i data-lucide="plus" className="w-3.5 h-3.5"></i>
                                    <span>إضافة تقدير جديد</span>
                                </button>
                            </div>

                            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                                <table className="w-full text-right text-xs">
                                    <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                                        <tr>
                                            <th className="p-3">التقدير الحرفي</th>
                                            <th className="p-3">النقاط (Points)</th>
                                            <th className="p-3">الحد الأدنى للنسبة المئوية (%)</th>
                                            <th className="p-3">الوصف بالعربية</th>
                                            <th className="p-3 text-center">إجراءات</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200 bg-white">
                                        {formData.gradeScales.map((item, idx) => (
                                            <tr key={idx} className="hover:bg-slate-50">
                                                <td className="p-2.5">
                                                    <input
                                                        type="text"
                                                        value={item.grade}
                                                        onChange={(e) => handleUpdateGradeRow(idx, 'grade', e.target.value)}
                                                        className="w-16 font-bold bg-slate-50 border border-slate-300 rounded px-2 py-1 text-center"
                                                    />
                                                </td>
                                                <td className="p-2.5">
                                                    <input
                                                        type="number"
                                                        step="0.1"
                                                        value={item.points}
                                                        onChange={(e) => handleUpdateGradeRow(idx, 'points', e.target.value)}
                                                        className="w-20 font-mono font-bold bg-slate-50 border border-slate-300 rounded px-2 py-1 text-center text-blue-700"
                                                    />
                                                </td>
                                                <td className="p-2.5">
                                                    <div className="flex items-center gap-1">
                                                        <span className="text-slate-400">&ge;</span>
                                                        <input
                                                            type="number"
                                                            value={item.minPercent}
                                                            onChange={(e) => handleUpdateGradeRow(idx, 'minPercent', e.target.value)}
                                                            className="w-20 font-bold bg-slate-50 border border-slate-300 rounded px-2 py-1 text-center"
                                                        />
                                                        <span>%</span>
                                                    </div>
                                                </td>
                                                <td className="p-2.5">
                                                    <input
                                                        type="text"
                                                        value={item.desc}
                                                        onChange={(e) => handleUpdateGradeRow(idx, 'desc', e.target.value)}
                                                        className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-1 font-semibold"
                                                    />
                                                </td>
                                                <td className="p-2.5 text-center">
                                                    <button
                                                        onClick={() => handleDeleteGradeRow(idx)}
                                                        className="text-rose-600 hover:text-rose-800 p-1 rounded hover:bg-rose-50"
                                                    >
                                                        <i data-lucide="trash-2" className="w-4 h-4"></i>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === 'hierarchy' && (
                        <div className="space-y-4">
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                                <h3 className="font-bold text-slate-800 text-sm">شجرة الفرق والفصول الدراسية (4 Levels Hierarchy Builder)</h3>
                                <p className="text-xs text-slate-500">الهيكل الشجري: 4 مستويات دراسية (الفرقة الأولى، الثانية، الثالثة، الرابعة)، وتفريع الفصول لكل فرقة (الترم الأول، الترم الثاني، الترم الصيفي).</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {[
                                    { title: 'الفرقة الأولى (Level 1)', code: 'L1' },
                                    { title: 'الفرقة الثانية (Level 2)', code: 'L2' },
                                    { title: 'الفرقة الثالثة (Level 3)', code: 'L3' },
                                    { title: 'الفرقة الرابعة (Level 4)', code: 'L4' },
                                ].map((lvl, lvlIdx) => (
                                    <div key={lvlIdx} className="border border-slate-200 rounded-2xl p-4 bg-white shadow-sm space-y-3">
                                        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                                            <span className="font-extrabold text-blue-900 text-sm flex items-center gap-2">
                                                <i data-lucide="folder-tree" className="w-4 h-4 text-blue-600"></i>
                                                {lvl.title}
                                            </span>
                                            <span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-bold">4 مستويات رئيسية</span>
                                        </div>

                                        <div className="space-y-2 text-xs">
                                            <div className="p-2.5 bg-slate-50 rounded-lg flex items-center justify-between border border-slate-100">
                                                <span className="font-semibold text-slate-700">• الفصل الدراسي الأول (First Term)</span>
                                                <span className="text-[11px] text-slate-500 font-bold">6 مقررات مجهزة</span>
                                            </div>
                                            <div className="p-2.5 bg-slate-50 rounded-lg flex items-center justify-between border border-slate-100">
                                                <span className="font-semibold text-slate-700">• الفصل الدراسي الثاني (Second Term)</span>
                                                <span className="text-[11px] text-slate-500 font-bold">6 مقررات مجهزة</span>
                                            </div>
                                            <div className="p-2.5 bg-amber-50/70 rounded-lg flex items-center justify-between border border-amber-200/60 text-amber-900">
                                                <span className="font-semibold">• الفصل الصيفي (Summer Semester)</span>
                                                <span className="text-[11px] text-amber-700 font-bold">اختياري (6-9 ساعات)</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'control' && (() => {
                        const prog = getProgressionRules(formData);
                        const ctl = getControlRules(formData);
                        const sorted = [...formData.gradeScales].sort((a, b) => b.minPercent - a.minPercent);
                        const passMark = getPassMark(formData);
                        return (
                            <div className="space-y-6">
                                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-xs text-emerald-900 leading-relaxed">
                                    <strong>شروط الانتقال بين الفرق وقواعد الكنترول:</strong> يقرأ محرك الترقية ومحرك النتائج هذه القيم مباشرة من اللائحة السارية، لذلك أي تعديل هنا ينعكس فوراً على الترقية وحساب التقديرات.
                                </div>

                                <div className="space-y-3">
                                    <h3 className="font-extrabold text-slate-900 text-sm">شروط الانتقال بين الفرق الدراسية (الساعات المعتمدة المجتازة)</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {[
                                            { label: 'من الأولى إلى الثانية', value: formData.semesterRules.minProgressionHours, onChange: (v) => handleSemesterRulesChange('minProgressionHours', v) },
                                            { label: 'من الثانية إلى الثالثة', value: prog.l2, onChange: (v) => handleProgressionChange('l2', v) },
                                            { label: 'من الثالثة إلى الرابعة', value: prog.l3, onChange: (v) => handleProgressionChange('l3', v) },
                                        ].map(f => (
                                            <div key={f.label} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-2">
                                                <label className="block text-xs font-bold text-slate-800">{f.label}:</label>
                                                <div className="flex items-center gap-2">
                                                    <input type="number" value={f.value} onChange={(e) => f.onChange(e.target.value)} className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-bold text-emerald-700 text-sm" />
                                                    <span className="text-xs text-slate-500 font-bold whitespace-nowrap">ساعة</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <p className="text-[11px] text-slate-500">* يُشترط أيضاً ألا تكون حالة قيد الطالب موقوفة أو مجمدة. الطالب غير المستوفي يبقى بفرقته (إعادة) ويظهر سبب عدم ترقيته بشاشة تتبع الحالات الأكاديمية.</p>
                                </div>

                                <div className="space-y-3">
                                    <h3 className="font-extrabold text-slate-900 text-sm">قواعد الكنترول وتوزيع الدرجات</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-2">
                                            <label className="block text-xs font-bold text-slate-800">أعمال السنة (% من درجة المقرر):</label>
                                            <input type="number" value={ctl.yearWorkMax} onChange={(e) => handleYearWorkChange(e.target.value)} className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-bold text-blue-800 text-sm" />
                                            <p className="text-[11px] text-slate-500">الفاينل = {ctl.finalMax}% تلقائياً (المعتمد: 40% أعمال + 60% فاينل).</p>
                                        </div>
                                        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-2">
                                            <label className="block text-xs font-bold text-slate-800">الحد الأدنى لورقة الفاينل (% من درجتها):</label>
                                            <input type="number" value={ctl.minFinalPercent} onChange={(e) => handleControlChange('minFinalPercent', e.target.value)} className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-bold text-rose-700 text-sm" />
                                            <p className="text-[11px] text-slate-500">= {(ctl.finalMax * ctl.minFinalPercent) / 100} درجة من {ctl.finalMax}. من يقل عنها يرسب مهما بلغ مجموعه.</p>
                                        </div>
                                        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-2">
                                            <label className="block text-xs font-bold text-slate-800">درجات الرأفة المسموحة للنجاح:</label>
                                            <input type="number" value={ctl.graceMarks} onChange={(e) => handleControlChange('graceMarks', e.target.value)} className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-bold text-amber-700 text-sm" />
                                            <p className="text-[11px] text-slate-500">تُمنح لمن يبقى له هذا القدر فقط للوصول لحد النجاح ({passMark}) بعد اجتياز شرط الفاينل.</p>
                                        </div>
                                        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-2">
                                            <label className="block text-xs font-bold text-slate-800">نسبة الغياب المعرضة للحرمان (%):</label>
                                            <input type="number" value={ctl.absenceLimitPercent} onChange={(e) => handleControlChange('absenceLimitPercent', e.target.value)} className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-bold text-slate-800 text-sm" />
                                            <p className="text-[11px] text-slate-500">تُستخدم في ملخص الحضور والغياب العام بالكنترول.</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <h3 className="font-extrabold text-slate-900 text-sm">معاينة سلم التقديرات (نطاق كل تقدير من 100)</h3>
                                    <div className="flex flex-wrap gap-2 text-xs">
                                        {sorted.map((sc, i) => {
                                            const upper = i === 0 ? 100 : sorted[i - 1].minPercent - 1;
                                            return (
                                                <div key={sc.grade + i} className={`px-3 py-2 rounded-xl border font-bold ${sc.points === 0 ? 'bg-rose-50 border-rose-200 text-rose-800' : 'bg-blue-50 border-blue-200 text-blue-900'}`}>
                                                    <span className="font-mono font-black">{sc.grade}</span> · {sc.minPercent}–{upper} · {Number(sc.points).toFixed(1)} نقطة
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <p className="text-[11px] text-slate-500">يُعدَّل السلم من تبويب «سلم التقديرات والدرجات». حد النجاح المستنتج: {passMark}.</p>
                                </div>
                            </div>
                        );
                    })()}

                    {activeTab === 'semester' && (
                        <div className="space-y-6">
                            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-900 leading-relaxed">
                                <strong>محرك شروط وقواعد التسجيل (Semester Rules Configuration):</strong> قيود وضوابط الساعات المعتمدة للفصول الدراسية والتنبيهات الآلية.
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-2">
                                    <label className="block text-xs font-bold text-slate-800">
                                        الحد الأقصى للساعات للطالب المنتظم (CGPA &ge; 2.00):
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="number"
                                            value={formData.semesterRules.maxHoursRegular}
                                            onChange={(e) => handleSemesterRulesChange('maxHoursRegular', e.target.value)}
                                            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-bold text-blue-800 text-sm"
                                        />
                                        <span className="text-xs text-slate-500 font-bold whitespace-nowrap">ساعة معتمدة</span>
                                    </div>
                                    <p className="text-[11px] text-slate-500">* الطالب المستقر يتسجل له 18 ساعة كحد أقصى.</p>
                                </div>

                                <div className="bg-white p-4 rounded-xl border border-rose-200 bg-rose-50/20 shadow-sm space-y-2">
                                    <label className="block text-xs font-bold text-rose-900">
                                        الحد الأقصى للساعات للطالب المحذر (CGPA &lt; 2.00):
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="number"
                                            value={formData.semesterRules.maxHoursWarned}
                                            onChange={(e) => handleSemesterRulesChange('maxHoursWarned', e.target.value)}
                                            className="w-full bg-slate-50 border border-rose-300 rounded-xl px-3 py-2 font-bold text-rose-700 text-sm"
                                        />
                                        <span className="text-xs text-slate-500 font-bold whitespace-nowrap">ساعة معتمدة</span>
                                    </div>
                                    <p className="text-[11px] text-rose-600 font-semibold">* مع التنبيه الآلي بمواد الإعادة أولاً عند فتح التسجيل.</p>
                                </div>

                                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-2">
                                    <label className="block text-xs font-bold text-slate-800">
                                        الحد الأقصى لساعات الترم الصيفي:
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="number"
                                            value={formData.semesterRules.maxHoursSummer}
                                            onChange={(e) => handleSemesterRulesChange('maxHoursSummer', e.target.value)}
                                            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-bold text-slate-800 text-sm"
                                        />
                                        <span className="text-xs text-slate-500 font-bold whitespace-nowrap">ساعات (من 6 إلى 9 ساعات)</span>
                                    </div>
                                </div>

                                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-2">
                                    <label className="block text-xs font-bold text-slate-800">
                                        شرط الترقية للفرقة الأعلى (Progression Threshold):
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="number"
                                            value={formData.semesterRules.minProgressionHours}
                                            onChange={(e) => handleSemesterRulesChange('minProgressionHours', e.target.value)}
                                            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-bold text-emerald-700 text-sm"
                                        />
                                        <span className="text-xs text-slate-500 font-bold whitespace-nowrap">ساعة معتمدة</span>
                                    </div>
                                    <p className="text-[11px] text-slate-500">* حقل إجباري: اجتياز 28 ساعة معتمدة على الأقل للترقية من الفرقة الأولى إلى الثانية.</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="bg-slate-100 px-6 py-4 border-t border-slate-200 flex items-center justify-between">
                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-700 text-xs font-bold hover:bg-slate-50 transition"
                    >
                        إلغاء
                    </button>
                    <button
                        onClick={() => onSave(formData)}
                        className="px-6 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-extrabold shadow-md transition flex items-center gap-2"
                    >
                        <i data-lucide="check" className="w-4 h-4"></i>
                        <span>حفظ وتطبيق تغييرات اللائحة</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
