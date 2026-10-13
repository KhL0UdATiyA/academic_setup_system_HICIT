function RoleBuilderModal({ role, onClose, onSave, existingNames }) {
    const [form, setForm] = useState(role || { name: '', nameAr: '', description: '', color: 'amber', permissions: [] });
    const [error, setError] = useState('');
    const isEdit = !!role;

    const togglePerm = (key) => setForm(prev => ({
        ...prev,
        permissions: prev.permissions.includes(key) ? prev.permissions.filter(k => k !== key) : [...prev.permissions, key]
    }));
    const toggleModule = (group) => {
        const keys = group.items.map(i => i.key);
        const allOn = keys.every(k => form.permissions.includes(k));
        setForm(prev => ({
            ...prev,
            permissions: allOn ? prev.permissions.filter(k => !keys.includes(k)) : Array.from(new Set([...prev.permissions, ...keys]))
        }));
    };

    const submit = (e) => {
        e.preventDefault();
        if (!form.name.trim() || !form.nameAr.trim()) { setError('أدخل اسم الدور بالإنجليزية والعربية.'); return; }
        if (!isEdit && existingNames.includes(form.name.trim())) { setError('اسم الدور موجود بالفعل، اختر اسماً مختلفاً.'); return; }
        if (form.permissions.length === 0) { setError('اختر صلاحية واحدة على الأقل.'); return; }
        onSave({ ...form, name: form.name.trim(), nameAr: form.nameAr.trim() });
    };

    return (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <form onSubmit={submit} className="bg-white rounded-3xl w-full max-w-3xl shadow-2xl border border-slate-200 overflow-hidden my-6">
                <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
                    <div>
                        <h3 className="text-base font-extrabold">{isEdit ? 'تعديل مستوى الصلاحيات' : 'منشئ مستوى صلاحيات جديد (Custom Role Builder)'}</h3>
                        <p className="text-[11px] text-slate-400">حدد اسم المستوى ثم اختر الصلاحيات المسموحة لكل قسم من أقسام النظام.</p>
                    </div>
                    <button type="button" onClick={onClose} title="إغلاق" className="p-1.5 rounded-lg hover:bg-white/10"><i data-lucide="x" className="w-5 h-5"></i></button>
                </div>

                <div className="p-6 space-y-5 text-xs">
                    {error && <div className="bg-rose-50 border border-rose-200 text-rose-800 font-bold p-3 rounded-xl">{error}</div>}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block font-bold mb-1">اسم المستوى (English) *</label>
                            <input value={form.name} disabled={isEdit && role.system} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-semibold font-mono" placeholder="Level 4 Auditor" />
                        </div>
                        <div>
                            <label className="block font-bold mb-1">الاسم بالعربية *</label>
                            <input value={form.nameAr} onChange={e => setForm({ ...form, nameAr: e.target.value })} className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-semibold" placeholder="المستوى الرابع - المراجعة" />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block font-bold mb-1">وصف المستوى</label>
                            <input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-semibold" />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block font-bold mb-1">لون الدور</label>
                            <div className="flex gap-2">
                                {Object.keys(ROLE_COLORS).map(c => (
                                    <button type="button" key={c} onClick={() => setForm({ ...form, color: c })}
                                        className={`w-8 h-8 rounded-full ${ROLE_COLORS[c].dot} ${form.color === c ? 'ring-4 ring-offset-2 ring-slate-300' : ''}`} title={c}></button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <h4 className="font-extrabold text-slate-900 text-sm">الصلاحيات ({form.permissions.length} / {ALL_PERMISSION_KEYS.length})</h4>
                            <div className="flex gap-2">
                                <button type="button" onClick={() => setForm({ ...form, permissions: [...ALL_PERMISSION_KEYS] })} className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 font-bold">تحديد الكل</button>
                                <button type="button" onClick={() => setForm({ ...form, permissions: [] })} className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 font-bold">إلغاء الكل</button>
                            </div>
                        </div>
                        {PERMISSION_CATALOG.map(group => {
                            const allOn = group.items.every(i => form.permissions.includes(i.key));
                            return (
                                <div key={group.module} className="border border-slate-200 rounded-xl overflow-hidden">
                                    <div className="bg-slate-100 px-4 py-2.5 flex items-center justify-between">
                                        <span className="font-extrabold text-slate-800">{group.module}</span>
                                        <button type="button" onClick={() => toggleModule(group)} className="text-blue-700 font-bold hover:underline">{allOn ? 'إلغاء القسم' : 'تحديد القسم'}</button>
                                    </div>
                                    <div className="p-3 grid grid-cols-1 md:grid-cols-2 gap-2">
                                        {group.items.map(item => (
                                            <label key={item.key} className="flex items-center gap-3 p-2.5 bg-slate-50 rounded-lg cursor-pointer hover:bg-blue-50">
                                                <input type="checkbox" checked={form.permissions.includes(item.key)} onChange={() => togglePerm(item.key)} className="w-4 h-4" />
                                                <span className="font-semibold text-slate-800">{item.label}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="bg-slate-100 px-6 py-4 border-t border-slate-200 flex items-center justify-between">
                    <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-700 text-xs font-bold hover:bg-slate-50">إلغاء</button>
                    <button type="submit" className="px-6 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-extrabold shadow-md flex items-center gap-2">
                        <i data-lucide="shield-check" className="w-4 h-4"></i>
                        <span>{isEdit ? 'حفظ التعديلات' : 'إنشاء مستوى الصلاحيات'}</span>
                    </button>
                </div>
            </form>
        </div>
    );
}
