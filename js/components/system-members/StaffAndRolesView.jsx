// =====================================================================
// STAFF & ROLES (RBAC): directory + add-employee form + custom role builder
// =====================================================================
const ADMIN_UNITS = [
    'شؤون الطلاب (Student Affairs)',
    'الكنترول (Control Board)',
    'الإرشاد الأكاديمي (Academic Advising)',
    'مكتب العميد (Dean Office)',
    'الدعم الفني (IT Support)',
    'شؤون العاملين (HR)'
];

function StaffAndRolesView({ staffList, setStaffList, roles, setRoles, departments, showToast }) {
    const [selectedRoleTab, setSelectedRoleTab] = useState('ALL');
    const [activeSubView, setActiveSubView] = useState('directory');
    const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
    const [roleModal, setRoleModal] = useState(null); // null | 'new' | role object

    const roleByName = (name) => roles.find(r => r.name === name);
    const staffCount = (roleName) => staffList.filter(s => s.accessLevel === roleName).length;

    const filteredStaff = useMemo(() => {
        if (selectedRoleTab === 'ALL') return staffList;
        return staffList.filter(s => s.department.includes(selectedRoleTab));
    }, [staffList, selectedRoleTab]);

    const nextStaffId = `STF-${String(staffList.length + 1).padStart(3, '0')}`;

    const handleSaveStaff = (member) => {
        setStaffList([...staffList, member]);
        setIsStaffModalOpen(false);
        showToast(`تمت إضافة الموظف (${member.name}) بكود ${member.staffId} بنجاح.`);
    };

    const togglePermission = (roleId, key) => {
        setRoles(roles.map(r => r.id !== roleId ? r : {
            ...r,
            permissions: r.permissions.includes(key) ? r.permissions.filter(k => k !== key) : [...r.permissions, key]
        }));
        showToast('تم تحديث مصفوفة الصلاحيات (RBAC Permissions) بنجاح');
    };

    const handleSaveRole = (role) => {
        if (roleModal && roleModal !== 'new') {
            setRoles(roles.map(r => r.id === role.id ? role : r));
            showToast(`تم تحديث مستوى الصلاحيات (${role.nameAr}).`);
        } else {
            setRoles([...roles, { ...role, id: `ROLE-${Date.now().toString().slice(-6)}`, system: false }]);
            showToast(`تم إنشاء مستوى الصلاحيات الجديد (${role.nameAr}) ويمكن إسناده للموظفين الآن.`);
        }
        setRoleModal(null);
    };

    const handleDeleteRole = (role) => {
        if (staffCount(role.name) > 0) {
            showToast('لا يمكن حذف مستوى مُسند لموظفين حالياً، أعد إسنادهم أولاً.', 'error');
            return;
        }
        setRoles(roles.filter(r => r.id !== role.id));
        showToast(`تم حذف المستوى (${role.nameAr}).`);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-900">الموظفون وإدارة الصلاحيات (Staff & Roles Management - RBAC)</h1>
                    <p className="text-slate-500 text-sm mt-1">التحكم بنظام الصلاحيات القائم على الأدوار <span className="font-bold text-slate-700">(Role-Based Access Control)</span>، وإضافة الموظفين وبناء مستويات صلاحيات مخصصة.</p>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                    <button onClick={() => setActiveSubView('directory')} className={`px-4 py-2 rounded-xl font-bold text-xs transition ${activeSubView === 'directory' ? 'bg-blue-700 text-white shadow' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>
                        دليل الموظفين (Staff Directory)
                    </button>
                    <button onClick={() => setActiveSubView('matrix')} className={`px-4 py-2 rounded-xl font-bold text-xs transition ${activeSubView === 'matrix' ? 'bg-blue-700 text-white shadow' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>
                        مصفوفة الصلاحيات (Permissions Matrix)
                    </button>
                    {activeSubView === 'directory' ? (
                        <button onClick={() => setIsStaffModalOpen(true)} className="px-4 py-2 rounded-xl font-extrabold text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow flex items-center gap-2">
                            <i data-lucide="user-plus" className="w-4 h-4"></i><span>إضافة موظف جديد</span>
                        </button>
                    ) : (
                        <button onClick={() => setRoleModal('new')} className="px-4 py-2 rounded-xl font-extrabold text-xs bg-amber-500 hover:bg-amber-600 text-slate-950 shadow flex items-center gap-2">
                            <i data-lucide="shield-check" className="w-4 h-4"></i><span>إنشاء مستوى صلاحيات مخصص</span>
                        </button>
                    )}
                </div>
            </div>

            {activeSubView === 'directory' && (
                <div className="space-y-6">
                    <div className="flex items-center gap-3 overflow-x-auto bg-white p-3 rounded-2xl border border-slate-200 text-xs font-bold">
                        {[{ id: 'ALL', label: 'جميع الموظفين' }, ...ADMIN_UNITS.map(u => ({ id: u.split(' (')[1] ? u.split(' (')[1].replace(')', '') : u, label: u }))].map((tab) => (
                            <button key={tab.id} onClick={() => setSelectedRoleTab(tab.id)}
                                className={`px-4 py-2 rounded-xl transition whitespace-nowrap ${selectedRoleTab === tab.id ? 'bg-blue-100 text-blue-900 border border-blue-300 font-extrabold' : 'text-slate-600 hover:bg-slate-100'}`}>
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                        <table className="w-full text-right text-xs">
                            <thead className="bg-slate-100 text-slate-700 font-extrabold border-b border-slate-200">
                                <tr>
                                    <th className="p-4">كود الموظف (Staff ID)</th>
                                    <th className="p-4">الاسم (Name)</th>
                                    <th className="p-4">المسمى الوظيفي (Assigned Role)</th>
                                    <th className="p-4">الإدارة / القسم</th>
                                    <th className="p-4">مستوى الوصول (Access Level)</th>
                                    <th className="p-4 text-center">الحالة (Status)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {filteredStaff.map((s) => {
                                    const r = roleByName(s.accessLevel);
                                    const col = ROLE_COLORS[r?.color || 'slate'];
                                    return (
                                        <tr key={s.id} className="hover:bg-slate-50 transition">
                                            <td className="p-4 font-mono font-bold text-blue-700">{s.staffId}</td>
                                            <td className="p-4 font-bold text-slate-900">
                                                {s.name}
                                                {s.phone && <span className="block text-[10px] text-slate-400 font-mono">{s.phone}</span>}
                                            </td>
                                            <td className="p-4 font-semibold text-slate-800">{s.assignedRole}</td>
                                            <td className="p-4 text-slate-600">{s.department}</td>
                                            <td className="p-4"><span className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border ${col.badge}`}>{s.accessLevel}</span></td>
                                            <td className="p-4 text-center">
                                                <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${s.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : s.status === 'On Leave' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'}`}>
                                                    {s.status === 'Active' ? 'نشط (Active)' : s.status === 'On Leave' ? 'في إجازة' : 'مجمّد'}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeSubView === 'matrix' && (
                <div className="space-y-6">
                    <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-md">
                        <h3 className="text-lg font-bold">مصفوفة تحديد الصلاحيات (Permissions Matrix Builder)</h3>
                        <p className="text-slate-400 text-xs mt-1">حدد الصلاحيات المسموحة لكل مستوى، أو أنشئ مستوى مخصصاً جديداً من الزر أعلاه.</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                        {roles.map((role) => {
                            const col = ROLE_COLORS[role.color] || ROLE_COLORS.slate;
                            return (
                                <div key={role.id} className={`bg-white rounded-2xl border ${col.card} p-5 shadow-sm space-y-4`}>
                                    <div className="flex items-start justify-between border-b border-slate-100 pb-3 gap-2">
                                        <div>
                                            <h4 className={`font-extrabold ${col.head} text-sm`}>{role.name}</h4>
                                            <span className={`inline-block mt-1 text-[10px] px-2 py-0.5 rounded font-bold border ${col.badge}`}>{role.nameAr}</span>
                                        </div>
                                        <div className="text-left shrink-0">
                                            <div className="text-[10px] font-bold text-slate-500">{staffCount(role.name)} موظف</div>
                                            <div className="flex gap-1 mt-1 justify-end">
                                                <button onClick={() => setRoleModal(role)} title="تعديل" className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600"><i data-lucide="sliders" className="w-3.5 h-3.5"></i></button>
                                                {!role.system && (
                                                    <button onClick={() => handleDeleteRole(role)} title="حذف" className="p-1.5 rounded-lg hover:bg-rose-50 text-rose-600"><i data-lucide="trash-2" className="w-3.5 h-3.5"></i></button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-xs text-slate-500">{role.description || 'بدون وصف.'}</p>
                                    <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                                        {PERMISSION_CATALOG.map(group => (
                                            <div key={group.module}>
                                                <div className="text-[10px] font-extrabold text-slate-400 mb-1.5">{group.module}</div>
                                                <div className="space-y-1.5">
                                                    {group.items.map(item => (
                                                        <label key={item.key} className="flex items-center gap-2.5 p-2 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100 text-xs">
                                                            <input type="checkbox" checked={role.permissions.includes(item.key)} onChange={() => togglePermission(role.id, item.key)} className="w-4 h-4" />
                                                            <span className="font-semibold text-slate-800">{item.label}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {isStaffModalOpen && (
                <StaffFormModal roles={roles} nextId={nextStaffId} onClose={() => setIsStaffModalOpen(false)} onSave={handleSaveStaff} />
            )}
            {roleModal && (
                <RoleBuilderModal
                    role={roleModal === 'new' ? null : roleModal}
                    existingNames={roles.map(r => r.name)}
                    onClose={() => setRoleModal(null)}
                    onSave={handleSaveRole}
                />
            )}
        </div>
    );
}
