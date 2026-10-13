function StaffFormModal({ roles, onClose, onSave, nextId }) {
    const [form, setForm] = useState({
        name: '', nationalId: '', phone: '', email: '', dob: '', hireDate: '',
        department: ADMIN_UNITS[0], assignedRole: '', accessLevel: roles[0]?.name || '', status: 'Active', notes: ''
    });
    const [errors, setErrors] = useState({});
    const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

    const validate = () => {
        const e = {};
        if (form.name.trim().split(/\s+/).length < 3) e.name = 'أدخل الاسم ثلاثياً على الأقل';
        if (!/^\d{14}$/.test(form.nationalId)) e.nationalId = 'الرقم القومي يجب أن يتكون من 14 رقماً';
        if (!/^01\d{9}$/.test(form.phone)) e.phone = 'رقم الهاتف يبدأ بـ 01 ويتكون من 11 رقماً';
        if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'بريد إلكتروني غير صالح';
        if (!form.assignedRole.trim()) e.assignedRole = 'حدد المسمى الوظيفي';
        if (!form.hireDate) e.hireDate = 'حدد تاريخ التعيين';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const submit = (ev) => {
        ev.preventDefault();
        if (!validate()) return;
        onSave({ id: nextId, staffId: nextId, ...form, name: form.name.trim() });
    };

    const inputCls = (k) => `w-full bg-slate-50 border ${errors[k] ? 'border-rose-400' : 'border-slate-300'} rounded-xl px-3 py-2 text-xs font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500`;
    const Err = ({ k }) => errors[k] ? <span className="text-[10px] text-rose-600 font-bold block mt-1">{errors[k]}</span> : null;

    return (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <form onSubmit={submit} className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl border border-slate-200 overflow-hidden my-6">
                <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
                    <div>
                        <h3 className="text-base font-extrabold">إضافة موظف جديد (New Staff Member)</h3>
                        <p className="text-[11px] text-slate-400">كود الموظف التلقائي: <span className="font-mono text-amber-300">{nextId}</span></p>
                    </div>
                    <button type="button" onClick={onClose} title="إغلاق" className="p-1.5 rounded-lg hover:bg-white/10"><i data-lucide="x" className="w-5 h-5"></i></button>
                </div>

                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="md:col-span-2">
                        <label className="block font-bold mb-1">الاسم الكامل *</label>
                        <input value={form.name} onChange={e => set('name', e.target.value)} className={inputCls('name')} placeholder="مثال: محمد أحمد إبراهيم السيد" />
                        <Err k="name" />
                    </div>
                    <div>
                        <label className="block font-bold mb-1">الرقم القومي *</label>
                        <input value={form.nationalId} onChange={e => set('nationalId', e.target.value.replace(/\D/g, '').slice(0, 14))} className={`${inputCls('nationalId')} font-mono`} placeholder="14 رقماً" />
                        <Err k="nationalId" />
                    </div>
                    <div>
                        <label className="block font-bold mb-1">تاريخ الميلاد</label>
                        <input type="date" value={form.dob} onChange={e => set('dob', e.target.value)} className={inputCls('dob')} />
                    </div>
                    <div>
                        <label className="block font-bold mb-1">رقم الهاتف *</label>
                        <input value={form.phone} onChange={e => set('phone', e.target.value.replace(/\D/g, '').slice(0, 11))} className={`${inputCls('phone')} font-mono`} placeholder="01xxxxxxxxx" />
                        <Err k="phone" />
                    </div>
                    <div>
                        <label className="block font-bold mb-1">البريد الإلكتروني *</label>
                        <input type="email" value={form.email} onChange={e => set('email', e.target.value)} className={`${inputCls('email')} font-mono`} placeholder="name@hicit.edu.eg" />
                        <Err k="email" />
                    </div>
                    <div>
                        <label className="block font-bold mb-1">الإدارة / القسم الإداري *</label>
                        <select value={form.department} onChange={e => set('department', e.target.value)} className={inputCls('department')}>
                            {ADMIN_UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block font-bold mb-1">المسمى الوظيفي *</label>
                        <input value={form.assignedRole} onChange={e => set('assignedRole', e.target.value)} className={inputCls('assignedRole')} placeholder="مثال: أخصائي شؤون طلاب" />
                        <Err k="assignedRole" />
                    </div>
                    <div>
                        <label className="block font-bold mb-1">مستوى الوصول (الدور) *</label>
                        <select value={form.accessLevel} onChange={e => set('accessLevel', e.target.value)} className={inputCls('accessLevel')}>
                            {roles.map(r => <option key={r.id} value={r.name}>{r.name} - {r.nameAr}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block font-bold mb-1">تاريخ التعيين *</label>
                        <input type="date" value={form.hireDate} onChange={e => set('hireDate', e.target.value)} className={inputCls('hireDate')} />
                        <Err k="hireDate" />
                    </div>
                    <div>
                        <label className="block font-bold mb-1">حالة الحساب</label>
                        <select value={form.status} onChange={e => set('status', e.target.value)} className={inputCls('status')}>
                            <option value="Active">نشط (Active)</option>
                            <option value="On Leave">في إجازة (On Leave)</option>
                            <option value="Suspended">مجمّد (Suspended)</option>
                        </select>
                    </div>
                    <div className="md:col-span-2">
                        <label className="block font-bold mb-1">ملاحظات</label>
                        <textarea rows="2" value={form.notes} onChange={e => set('notes', e.target.value)} className={inputCls('notes')}></textarea>
                    </div>
                </div>

                <div className="bg-slate-100 px-6 py-4 border-t border-slate-200 flex items-center justify-between">
                    <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-700 text-xs font-bold hover:bg-slate-50">إلغاء</button>
                    <button type="submit" className="px-6 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-extrabold shadow-md flex items-center gap-2">
                        <i data-lucide="user-plus" className="w-4 h-4"></i>
                        <span>حفظ الموظف</span>
                    </button>
                </div>
            </form>
        </div>
    );
}
