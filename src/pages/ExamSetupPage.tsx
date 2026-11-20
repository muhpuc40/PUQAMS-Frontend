import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CalendarClock,
  CalendarDays,
  Crown,
  Lock,
  Pencil,
  Plus,
  RefreshCw,
  Settings2,
  Trash2,
  UserMinus,
  UserPlus,
  Users,
} from "lucide-react";
import {
  CardBox,
  Checkbox,
  ConfirmModal,
  CustomButton,
  DataTable,
  Modal,
  Select2,
  SelectInput,
  SpinLoader,
  TextInput,
  type Column,
  type Select2Option,
  type SelectOption,
} from "@/components/ui";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { getPrograms, type Program } from "@/services/programService";
import { getSessions, type Session } from "@/services/sessionService";
import {
  EXAM_TYPES,
  addCommitteeMember,
  addExamDate,
  createCommittee,
  deleteCommittee,
  deleteCommitteeMember,
  deleteExamDate,
  getAvailableCourses,
  getCommittees,
  getExamSetting,
  getRoutineCourses,
  getTeacherList,
  updateCommitteeMember,
  updateExamDate,
  updateExamGeneralSetting,
  type CommitteeRole,
  type ExamAvailableCourse,
  type ExamCommittee,
  type ExamCommitteeMember,
  type ExamRoutine,
  type ExamSetting,
  type ExamType,
  type TeacherOption,
} from "@/services/examService";

/* ═══════════════════════════════════════════════════════════════
   Small UI pieces
   ═══════════════════════════════════════════════════════════════ */

type Tone = "slate" | "indigo" | "emerald" | "amber" | "rose" | "sky" | "violet";

const Chip: React.FC<{ tone?: Tone; children: React.ReactNode }> = ({ tone = "slate", children }) => {
  const tones: Record<Tone, string> = {
    slate: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
    indigo: "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300",
    emerald: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400",
    amber: "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300",
    rose: "bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300",
    sky: "bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300",
    violet: "bg-violet-50 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300",
  };
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded whitespace-nowrap ${tones[tone]}`}>
      {children}
    </span>
  );
};

const IconButton: React.FC<{
  title: string;
  onClick: () => void;
  danger?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
}> = ({ title, onClick, danger, disabled, children }) => (
  <button
    type="button"
    title={title}
    aria-label={title}
    onClick={onClick}
    disabled={disabled}
    className={`p-1.5 rounded-md transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
      danger
        ? "text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"
        : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
    }`}>
    {children}
  </button>
);

const InfoItem: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div>
    <p className="text-[10px] uppercase tracking-wide font-semibold text-slate-400">{label}</p>
    <div className="text-sm text-slate-800 dark:text-slate-200 mt-0.5">{value || "—"}</div>
  </div>
);

type Tab = "settings" | "schedule" | "committees";

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "settings", label: "Exam Settings", icon: <Settings2 className="w-3.5 h-3.5" /> },
  { id: "schedule", label: "Schedule", icon: <CalendarDays className="w-3.5 h-3.5" /> },
  { id: "committees", label: "Committees", icon: <Users className="w-3.5 h-3.5" /> },
];

/* ═══════════════════════════════════════════════════════════════
   Page
   ═══════════════════════════════════════════════════════════════ */

type ScheduleModal =
  | { mode: "add" }
  | { mode: "edit"; row: ExamRoutine }
  | null;

type ConfirmState =
  | { kind: "schedule"; row: ExamRoutine }
  | { kind: "committee"; committee: ExamCommittee }
  | { kind: "member"; member: ExamCommitteeMember; semester: number }
  | null;

export const ExamSetupPage: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const departmentId = user?.tbl_department_id ?? null;

  // Filters
  const [programs, setPrograms] = useState<Program[]>([]);
  const [programId, setProgramId] = useState("");
  const [sessions, setSessions] = useState<Session[]>([]);
  const [sessionId, setSessionId] = useState("");
  const [isLoadingFilters, setIsLoadingFilters] = useState(true);

  // Data
  const [tab, setTab] = useState<Tab>("settings");
  const [setting, setSetting] = useState<ExamSetting | null>(null);
  const [routine, setRoutine] = useState<ExamRoutine[]>([]);
  const [committees, setCommittees] = useState<ExamCommittee[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [scheduleFilter, setScheduleFilter] = useState<"all" | ExamType>("all");

  // Settings modal
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [examName, setExamName] = useState("");
  const [heldIn, setHeldIn] = useState("");
  const [published, setPublished] = useState(false);

  // Schedule modal
  const [scheduleModal, setScheduleModal] = useState<ScheduleModal>(null);
  const [examType, setExamType] = useState<ExamType>("Mid_Term");
  const [available, setAvailable] = useState<ExamAvailableCourse[]>([]);
  const [isLoadingAvailable, setIsLoadingAvailable] = useState(false);
  const [courseId, setCourseId] = useState("");
  const [examDate, setExamDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  // Member modal
  const [memberModal, setMemberModal] = useState<ExamCommittee | null>(null);
  const [teachers, setTeachers] = useState<TeacherOption[]>([]);
  const [teacherId, setTeacherId] = useState("");
  const [memberRole, setMemberRole] = useState<CommitteeRole>("Member");

  const [confirm, setConfirm] = useState<ConfirmState>(null);
  const [isSaving, setIsSaving] = useState(false);

  const pid = Number(programId);
  const sid = Number(sessionId);
  const ready = pid > 0 && sid > 0;
  const editable = setting?.status === "Running";

  /* ─── Filters ──────────────────────────────────────────────── */

  useEffect(() => {
    if (!departmentId) {
      setIsLoadingFilters(false);
      return;
    }
    const load = async () => {
      try {
        const { programs } = await getPrograms(departmentId);
        setPrograms(programs);
        if (programs.length === 1) setProgramId(String(programs[0].id));
      } catch (err) {
        toast.error((err as Error).message || "Failed to load programs");
      } finally {
        setIsLoadingFilters(false);
      }
    };
    void load();
  }, [departmentId, toast]);

  useEffect(() => {
    setSessionId("");
    setSessions([]);
    if (!programId) return;
    const load = async () => {
      try {
        const list = await getSessions(Number(programId), "All");
        setSessions(list);
        const running = list.find((s) => s.status?.toLowerCase() === "running");
        if (running) setSessionId(String(running.id));
      } catch (err) {
        toast.error((err as Error).message || "Failed to load sessions");
      }
    };
    void load();
  }, [programId, toast]);

  /* ─── Load data ────────────────────────────────────────────── */

  const loadAll = useCallback(
    async (showToast = false) => {
      if (!ready) return;
      setIsLoading(true);
      setLoadError("");
      try {
        const [s, r, c] = await Promise.all([
          getExamSetting(pid, sid),
          getRoutineCourses(pid, sid),
          getCommittees(pid, sid),
        ]);
        setSetting(s);
        setRoutine(r);
        setCommittees(c);
        if (showToast) toast.success("Exam setup refreshed");
      } catch (err) {
        setLoadError((err as Error).message || "Failed to load exam setup");
        setSetting(null);
        setRoutine([]);
        setCommittees([]);
      } finally {
        setIsLoading(false);
      }
    },
    [ready, pid, sid, toast],
  );

  useEffect(() => {
    setSetting(null);
    setRoutine([]);
    setCommittees([]);
    setLoadError("");
    if (ready) void loadAll();
  }, [ready, loadAll]);

  // Teachers for committee picking (loaded once, all departments).
  useEffect(() => {
    if (tab !== "committees" || teachers.length > 0 || !ready || loadError) return;
    getTeacherList()
      .then(setTeachers)
      .catch((err) => toast.error((err as Error).message));
  }, [tab, teachers.length, ready, loadError, toast]);

  /* ─── Options ──────────────────────────────────────────────── */

  const programOptions: Select2Option[] = useMemo(
    () => programs.map((p) => ({ value: String(p.id), label: p.shortName || p.name, description: p.name, badge: p.code })),
    [programs],
  );

  const sessionOptions: Select2Option[] = useMemo(
    () => sessions.map((s) => ({ value: String(s.id), label: s.sessionname, description: s.examname || undefined, badge: s.status })),
    [sessions],
  );

  const courseOptions: Select2Option[] = useMemo(
    () =>
      available.map((c) => ({
        value: String(c.id),
        label: `${c.coursecode} — ${c.coursename}`,
        description: `Semester ${c.semester} · ${c.noofsection} section(s) · ${c.noofstudent} students`,
        badge: c.coursetype,
      })),
    [available],
  );

  const teacherOptions: Select2Option[] = useMemo(() => {
    const taken = new Set(memberModal?.members.map((m) => m.tbl_teacher_id) ?? []);
    return teachers
      .filter((t) => !taken.has(t.id))
      .map((t) => ({
        value: String(t.id),
        label: t.fullname,
        description: [t.designation, t.department].filter(Boolean).join(" · "),
        badge: t.username,
      }));
  }, [teachers, memberModal]);

  const examTypeOptions: SelectOption[] = EXAM_TYPES.map((t) => ({ value: t.value, label: t.label }));
  const roleOptions: SelectOption[] = [
    { value: "Chairman", label: "Chairman" },
    { value: "Member", label: "Member" },
  ];

  const filteredRoutine = useMemo(
    () => (scheduleFilter === "all" ? routine : routine.filter((r) => r.exam_type === scheduleFilter)),
    [routine, scheduleFilter],
  );

  /* ─── Settings ─────────────────────────────────────────────── */

  const openSettings = () => {
    if (!setting) return;
    setExamName(setting.examname);
    setHeldIn(setting.exam_held_in);
    setPublished(setting.isroutinepublished === 1);
    setSettingsOpen(true);
  };

  const saveSettings = async () => {
    if (!examName.trim()) return toast.error("Exam name is required.");
    setIsSaving(true);
    try {
      const res = await updateExamGeneralSetting({
        program_id: pid,
        session_id: sid,
        examName: examName.trim(),
        exam_held_in: heldIn.trim(),
        isroutinepublished: published ? 1 : 0,
      });
      setSetting(res.data);
      toast.success(res.message || "Exam settings updated");
      setSettingsOpen(false);
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setIsSaving(false);
    }
  };

  /* ─── Schedule ─────────────────────────────────────────────── */

  const loadAvailable = useCallback(
    async (type: ExamType) => {
      setIsLoadingAvailable(true);
      setCourseId("");
      try {
        setAvailable(await getAvailableCourses(pid, sid, type));
      } catch (err) {
        toast.error((err as Error).message);
        setAvailable([]);
      } finally {
        setIsLoadingAvailable(false);
      }
    },
    [pid, sid, toast],
  );

  const openAddSchedule = () => {
    const type: ExamType = scheduleFilter === "Final" ? "Final" : "Mid_Term";
    setExamType(type);
    setExamDate("");
    setStartTime("10:00");
    setEndTime(type === "Final" ? "13:00" : "11:30");
    setScheduleModal({ mode: "add" });
    void loadAvailable(type);
  };

  const openEditSchedule = (row: ExamRoutine) => {
    setExamDate(row.exam_date);
    setStartTime(row.start_time);
    setEndTime(row.end_time);
    setScheduleModal({ mode: "edit", row });
  };

  const saveSchedule = async () => {
    if (!scheduleModal) return;
    if (!examDate) return toast.error("Choose the exam date.");
    if (!startTime || !endTime) return toast.error("Choose the start and end time.");
    if (endTime <= startTime) return toast.error("End time must be later than start time.");

    setIsSaving(true);
    try {
      if (scheduleModal.mode === "add") {
        if (!courseId) {
          toast.error("Choose a course.");
          return;
        }
        const res = await addExamDate({
          program_id: pid,
          session_id: sid,
          course_id: Number(courseId),
          exam_type: examType,
          exam_date: examDate,
          start_time: startTime,
          end_time: endTime,
        });
        setRoutine(res.data);
        toast.success(res.message || "Exam date added");
      } else {
        const res = await updateExamDate({
          program_id: pid,
          id: scheduleModal.row.id,
          exam_date: examDate,
          start_time: startTime,
          end_time: endTime,
        });
        setRoutine(res.data);
        toast.success(res.message || "Exam date updated");
      }
      setScheduleModal(null);
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setIsSaving(false);
    }
  };

  /* ─── Committees ───────────────────────────────────────────── */

  const handleCreateCommittee = async (semester: number) => {
    setIsSaving(true);
    try {
      const res = await createCommittee({ program_id: pid, session_id: sid, semester });
      setCommittees(res.data);
      toast.success(`Semester ${semester} committee created — now add its members`);
      const created = res.data.find((c) => c.semester === semester);
      if (created) openAddMember(created);
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setIsSaving(false);
    }
  };

  const openAddMember = (committee: ExamCommittee) => {
    setTeacherId("");
    setMemberRole(committee.members.some((m) => m.role === "Chairman") ? "Member" : "Chairman");
    setMemberModal(committee);
  };

  const saveMember = async () => {
    if (!memberModal) return;
    if (!teacherId) return toast.error("Choose a teacher.");
    setIsSaving(true);
    try {
      const res = await addCommitteeMember({
        program_id: pid,
        committee_id: memberModal.id,
        teacher_id: Number(teacherId),
        role: memberRole,
      });
      setCommittees(res.data);
      toast.success(res.message || "Member added");
      setMemberModal(null);
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setIsSaving(false);
    }
  };

  const toggleRole = async (member: ExamCommitteeMember) => {
    const role: CommitteeRole = member.role === "Chairman" ? "Member" : "Chairman";
    setIsSaving(true);
    try {
      const res = await updateCommitteeMember({ program_id: pid, member_id: member.id, role });
      setCommittees(res.data);
      toast.success(`${member.fullname} is now ${role}`);
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setIsSaving(false);
    }
  };

  /* ─── Delete ───────────────────────────────────────────────── */

  const confirmDelete = async () => {
    if (!confirm) return;
    setIsSaving(true);
    try {
      if (confirm.kind === "schedule") {
        const res = await deleteExamDate(pid, confirm.row.id);
        setRoutine(res.data);
        toast.success(res.message || "Exam date deleted");
      } else if (confirm.kind === "committee") {
        const res = await deleteCommittee(pid, confirm.committee.id);
        setCommittees(res.data);
        toast.success(res.message || "Committee deleted");
      } else {
        const res = await deleteCommitteeMember(pid, confirm.member.id);
        setCommittees(res.data);
        toast.success(res.message || "Member removed");
      }
      setConfirm(null);
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setIsSaving(false);
    }
  };

  /* ─── Columns ──────────────────────────────────────────────── */

  const routineColumns: Column<ExamRoutine>[] = [
    {
      key: "exam_date",
      header: "Date",
      sortable: true,
      width: "150px",
      render: (r) => (
        <div className="flex flex-col gap-0.5">
          <span className="font-semibold text-slate-900 dark:text-slate-100">{r.texamdate}</span>
          <span className="text-[10px] text-slate-400">{r.examDayName}</span>
        </div>
      ),
    },
    {
      key: "examtime",
      header: "Time",
      width: "170px",
      render: (r) => <span className="font-mono text-[11px] text-slate-700 dark:text-slate-300">{r.examtime}</span>,
    },
    {
      key: "exam_type",
      header: "Exam",
      sortable: true,
      align: "center",
      width: "100px",
      render: (r) => <Chip tone={r.exam_type === "Mid_Term" ? "violet" : "indigo"}>{r.exam_type_name}</Chip>,
    },
    {
      key: "coursecode",
      header: "Course",
      sortable: true,
      render: (r) => (
        <div className="flex flex-col gap-0.5">
          <span className="font-semibold text-slate-900 dark:text-slate-100">{r.coursecode}</span>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            {r.coursename} · {r.coursecredit} Cr · {r.coursetype}
          </span>
        </div>
      ),
    },
    {
      key: "semester",
      header: "Semester",
      sortable: true,
      align: "center",
      width: "90px",
      render: (r) => <span className="font-mono text-xs">{r.semester}</span>,
    },
    {
      key: "noofstudent",
      header: "Students",
      sortable: true,
      align: "center",
      width: "110px",
      render: (r) => (
        <div className="flex flex-col items-center">
          <span className="font-mono text-xs font-semibold">{r.noofstudent}</span>
          <span className="text-[10px] text-slate-400">{r.noofsection} section(s)</span>
        </div>
      ),
    },
    {
      key: "actions",
      header: "",
      align: "right",
      width: "90px",
      render: (r) =>
        editable ? (
          <div className="inline-flex items-center gap-1">
            <IconButton title="Edit date" onClick={() => openEditSchedule(r)}>
              <Pencil className="w-3.5 h-3.5" />
            </IconButton>
            <IconButton title="Delete date" danger onClick={() => setConfirm({ kind: "schedule", row: r })}>
              <Trash2 className="w-3.5 h-3.5" />
            </IconButton>
          </div>
        ) : null,
    },
  ];

  /* ─── Render ───────────────────────────────────────────────── */

  const midCount = routine.filter((r) => r.exam_type === "Mid_Term").length;
  const finalCount = routine.length - midCount;

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Exam Setup</h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Exam name, Mid Term / Final schedule and exam committees per session
            {user?.department ? ` · ${user.department}` : ""}
          </p>
        </div>
        <CustomButton
          variant="outline"
          size="sm"
          leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          onClick={() => void loadAll(true)}
          disabled={!ready || isLoading}
          isLoading={isLoading}>
          Refresh
        </CustomButton>
      </div>

      {/* Filters */}
      <CardBox title="Session" subtitle="Choose the program and session to set up" icon={<CalendarClock className="w-4 h-4 text-indigo-500" />}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Select2
            label="Program"
            placeholder={isLoadingFilters ? "Loading programs..." : "Select a program"}
            options={programOptions}
            value={programId}
            onChange={(v) => setProgramId(v as string)}
            disabled={isLoadingFilters || programs.length === 0}
            isSearchable
          />
          <Select2
            label="Session"
            placeholder={programId ? "Select a session" : "Select a program first"}
            options={sessionOptions}
            value={sessionId}
            onChange={(v) => setSessionId(v as string)}
            disabled={!programId}
            isSearchable
          />
        </div>
      </CardBox>

      {!ready ? (
        <CardBox variant="flat">
          <p className="text-center text-xs text-slate-500 py-8">Select a program and session to set up its exam.</p>
        </CardBox>
      ) : isLoading && !setting ? (
        <div className="flex justify-center py-16">
          <SpinLoader size="lg" />
        </div>
      ) : loadError ? (
        <CardBox variant="flat">
          <div className="flex flex-col items-center py-10 gap-3 text-center">
            <AlertTriangle className="w-6 h-6 text-amber-500" />
            <p className="text-xs text-slate-600 dark:text-slate-300">{loadError}</p>
          </div>
        </CardBox>
      ) : setting ? (
        <>
          {/* Tabs */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex rounded-lg border border-slate-200 dark:border-slate-800 p-1 bg-white dark:bg-slate-900">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTab(t.id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                    tab === t.id
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}>
                  {t.icon}
                  {t.label}
                </button>
              ))}
            </div>
            {!editable && (
              <Chip tone="rose">
                <Lock className="w-3 h-3" /> Session {setting.status.toLowerCase()} — read only
              </Chip>
            )}
          </div>

          {/* ─── Settings tab ─── */}
          {tab === "settings" && (
            <CardBox
              title="Exam Settings"
              subtitle="One exam per session, with a Mid Term and a Final sitting"
              icon={<Settings2 className="w-4 h-4 text-indigo-500" />}
              headerAction={
                editable && (
                  <CustomButton size="xs" variant="outline" leftIcon={<Pencil className="w-3 h-3" />} onClick={openSettings}>
                    Edit
                  </CustomButton>
                )
              }>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                <InfoItem label="Session" value={setting.sessionname} />
                <InfoItem label="Exam Name" value={setting.examname} />
                <InfoItem label="Exam Held In" value={setting.exam_held_in} />
                <InfoItem
                  label="Routine"
                  value={
                    setting.isroutinepublished === 1 ? (
                      <Chip tone="emerald">Published</Chip>
                    ) : (
                      <Chip tone="amber">Not published</Chip>
                    )
                  }
                />
                <InfoItem label="Program" value={setting.program} />
                <InfoItem label="Start Date" value={setting.startdate} />
                <InfoItem label="End Date" value={setting.enddate} />
                <InfoItem
                  label="Status"
                  value={<Chip tone={setting.status === "Running" ? "emerald" : "slate"}>{setting.status}</Chip>}
                />
              </div>
              <div className="flex flex-wrap gap-2 mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
                <Chip tone="violet">{midCount} Mid Term dates</Chip>
                <Chip tone="indigo">{finalCount} Final dates</Chip>
                <Chip tone="sky">{committees.filter((c) => c.id > 0).length} / {committees.length} committees</Chip>
              </div>
            </CardBox>
          )}

          {/* ─── Schedule tab ─── */}
          {tab === "schedule" && (
            <DataTable<ExamRoutine>
              title="Exam Schedule"
              columns={routineColumns}
              data={filteredRoutine}
              isLoading={isLoading}
              keyField="id"
              selectable={false}
              searchable
              searchPlaceholder="Search by course, date or exam..."
              enableExport
              exportFileName={`exam-schedule-${sid}`}
              defaultPageSize={25}
              pageSizeOptions={[10, 25, 50]}
              emptyMessage="No exam dates set for this session yet."
              actions={
                <div className="flex flex-wrap items-center gap-2">
                  <div className="inline-flex rounded-md border border-slate-200 dark:border-slate-700 overflow-hidden text-[11px] font-semibold">
                    {(["all", "Mid_Term", "Final"] as const).map((f) => (
                      <button
                        key={f}
                        type="button"
                        onClick={() => setScheduleFilter(f)}
                        className={`px-2.5 py-1 cursor-pointer ${
                          scheduleFilter === f
                            ? "bg-indigo-600 text-white"
                            : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                        }`}>
                        {f === "all" ? `All (${routine.length})` : f === "Mid_Term" ? `Mid Term (${midCount})` : `Final (${finalCount})`}
                      </button>
                    ))}
                  </div>
                  {editable && (
                    <CustomButton size="xs" leftIcon={<Plus className="w-3.5 h-3.5" />} onClick={openAddSchedule}>
                      Add Exam Date
                    </CustomButton>
                  )}
                </div>
              }
            />
          )}

          {/* ─── Committees tab ─── */}
          {tab === "committees" &&
            (committees.length === 0 ? (
              <CardBox variant="flat">
                <p className="text-center text-xs text-slate-500 py-8">
                  No courses are offered in this session yet, so there are no semesters to form committees for.
                </p>
              </CardBox>
            ) : (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {committees.map((c) => (
                  <CardBox
                    key={c.semester}
                    title={`Semester ${c.semester}`}
                    subtitle={`${c.course_count} course${c.course_count === 1 ? "" : "s"} to moderate`}
                    icon={<Users className="w-4 h-4 text-indigo-500" />}
                    headerAction={
                      editable &&
                      (c.id === 0 ? (
                        <CustomButton
                          size="xs"
                          leftIcon={<Plus className="w-3 h-3" />}
                          onClick={() => void handleCreateCommittee(c.semester)}
                          disabled={isSaving}>
                          Create committee
                        </CustomButton>
                      ) : (
                        <div className="flex items-center gap-1">
                          <CustomButton
                            size="xs"
                            variant="outline"
                            leftIcon={<UserPlus className="w-3 h-3" />}
                            onClick={() => openAddMember(c)}>
                            Add member
                          </CustomButton>
                          <IconButton title="Delete committee" danger onClick={() => setConfirm({ kind: "committee", committee: c })}>
                            <Trash2 className="w-3.5 h-3.5" />
                          </IconButton>
                        </div>
                      ))
                    }>
                    {c.id === 0 ? (
                      <p className="text-xs text-slate-400">No committee yet for this semester.</p>
                    ) : c.members.length === 0 ? (
                      <p className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" /> Committee has no members yet.
                      </p>
                    ) : (
                      <>
                        {!c.members.some((m) => m.role === "Chairman") && (
                          <p className="text-[11px] text-amber-600 dark:text-amber-400 mb-2 flex items-center gap-1.5">
                            <AlertTriangle className="w-3.5 h-3.5" /> No chairman assigned.
                          </p>
                        )}
                        <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                          {c.members.map((m) => (
                            <li key={m.id} className="flex items-center justify-between gap-3 py-2.5">
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                                  {m.fullname}
                                  {m.shortname && <span className="ml-1 text-[10px] text-slate-400">({m.shortname})</span>}
                                </p>
                                <p className="text-[11px] text-slate-400 truncate">
                                  {[m.designation, m.department].filter(Boolean).join(" · ")}
                                </p>
                              </div>
                              <div className="flex items-center gap-1 shrink-0">
                                {m.role === "Chairman" ? (
                                  <Chip tone="amber">
                                    <Crown className="w-3 h-3" /> Chairman
                                  </Chip>
                                ) : (
                                  <Chip>Member</Chip>
                                )}
                                {editable && (
                                  <>
                                    <IconButton
                                      title={m.role === "Chairman" ? "Make member" : "Make chairman"}
                                      onClick={() => void toggleRole(m)}
                                      disabled={isSaving}>
                                      <Crown className="w-3.5 h-3.5" />
                                    </IconButton>
                                    <IconButton
                                      title="Remove from committee"
                                      danger
                                      onClick={() => setConfirm({ kind: "member", member: m, semester: c.semester })}>
                                      <UserMinus className="w-3.5 h-3.5" />
                                    </IconButton>
                                  </>
                                )}
                              </div>
                            </li>
                          ))}
                        </ul>
                      </>
                    )}
                  </CardBox>
                ))}
              </div>
            ))}
        </>
      ) : null}

      {/* ─── Settings modal ─── */}
      <Modal
        isOpen={settingsOpen}
        onClose={() => !isSaving && setSettingsOpen(false)}
        size="md"
        title="Edit Exam Settings"
        description={setting ? `${setting.program} · ${setting.sessionname}` : undefined}
        footer={
          <>
            <CustomButton variant="outline" size="sm" onClick={() => setSettingsOpen(false)} disabled={isSaving}>
              Cancel
            </CustomButton>
            <CustomButton size="sm" onClick={() => void saveSettings()} isLoading={isSaving}>
              Save
            </CustomButton>
          </>
        }>
        <div className="space-y-4">
          <TextInput label="Exam Name" value={examName} placeholder="e.g. Fall 2026 Final Examination" onChange={(e) => setExamName(e.target.value)} />
          <TextInput label="Exam Held In" value={heldIn} placeholder="e.g. December 2026" onChange={(e) => setHeldIn(e.target.value)} />
          <Checkbox
            variant="switch"
            label="Routine published"
            description="Make the exam routine visible."
            checked={published}
            onChange={(e) => setPublished(e.target.checked)}
          />
        </div>
      </Modal>

      {/* ─── Schedule modal ─── */}
      <Modal
        isOpen={scheduleModal !== null}
        onClose={() => !isSaving && setScheduleModal(null)}
        size="md"
        title={scheduleModal?.mode === "edit" ? "Edit Exam Date" : "Add Exam Date"}
        description={
          scheduleModal?.mode === "edit"
            ? `${scheduleModal.row.coursecode} · ${scheduleModal.row.exam_type_name}`
            : "All sections of the course sit one common paper."
        }
        footer={
          <>
            <CustomButton variant="outline" size="sm" onClick={() => setScheduleModal(null)} disabled={isSaving}>
              Cancel
            </CustomButton>
            <CustomButton size="sm" onClick={() => void saveSchedule()} isLoading={isSaving}>
              {scheduleModal?.mode === "edit" ? "Save" : "Add"}
            </CustomButton>
          </>
        }>
        <div className="space-y-4">
          {scheduleModal?.mode === "add" && (
            <>
              <SelectInput
                label="Exam"
                value={examType}
                options={examTypeOptions}
                onChange={(e) => {
                  const t = e.target.value as ExamType;
                  setExamType(t);
                  setEndTime(t === "Final" ? "13:00" : "11:30");
                  void loadAvailable(t);
                }}
              />
              <div>
                <Select2
                  label="Course"
                  placeholder={isLoadingAvailable ? "Loading courses..." : "Select a course"}
                  options={courseOptions}
                  value={courseId}
                  onChange={(v) => setCourseId(v as string)}
                  disabled={isLoadingAvailable}
                  isSearchable
                />
                {!isLoadingAvailable && available.length === 0 && (
                  <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-1">
                    Every course with a {examType === "Mid_Term" ? "Mid Term" : "Final"} already has a date.
                  </p>
                )}
              </div>
            </>
          )}
          <TextInput label="Date" type="date" value={examDate} onChange={(e) => setExamDate(e.target.value)} />
          <div className="grid grid-cols-2 gap-4">
            <TextInput label="Start Time" type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
            <TextInput label="End Time" type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
          </div>
        </div>
      </Modal>

      {/* ─── Add member modal ─── */}
      <Modal
        isOpen={memberModal !== null}
        onClose={() => !isSaving && setMemberModal(null)}
        size="md"
        title={memberModal ? `Add Member · Semester ${memberModal.semester}` : ""}
        description="Any teacher can be a committee member, from any department."
        footer={
          <>
            <CustomButton variant="outline" size="sm" onClick={() => setMemberModal(null)} disabled={isSaving}>
              Cancel
            </CustomButton>
            <CustomButton size="sm" onClick={() => void saveMember()} isLoading={isSaving}>
              Add
            </CustomButton>
          </>
        }>
        <div className="space-y-4">
          <Select2
            label="Teacher"
            placeholder={teachers.length === 0 ? "Loading teachers..." : "Search teacher"}
            options={teacherOptions}
            value={teacherId}
            onChange={(v) => setTeacherId(v as string)}
            isSearchable
          />
          <SelectInput
            label="Role"
            value={memberRole}
            options={roleOptions}
            onChange={(e) => setMemberRole(e.target.value as CommitteeRole)}
          />
        </div>
      </Modal>

      {/* ─── Delete confirmation ─── */}
      <ConfirmModal
        isOpen={confirm !== null}
        onClose={() => !isSaving && setConfirm(null)}
        onConfirm={() => void confirmDelete()}
        isLoading={isSaving}
        confirmText={confirm?.kind === "member" ? "Remove" : "Delete"}
        title={
          confirm?.kind === "schedule"
            ? `Delete ${confirm.row.coursecode} ${confirm.row.exam_type_name} date?`
            : confirm?.kind === "committee"
              ? `Delete the semester ${confirm.committee.semester} committee?`
              : confirm?.kind === "member"
                ? `Remove ${confirm.member.fullname}?`
                : ""
        }
        message={
          confirm?.kind === "schedule"
            ? `${confirm.row.texamdate}, ${confirm.row.examtime} will be removed.`
            : confirm?.kind === "committee"
              ? "The committee and all its members will be removed."
              : confirm?.kind === "member"
                ? `They will no longer be on the semester ${confirm.semester} committee.`
                : ""
        }
      />
    </div>
  );
};

export default ExamSetupPage;
