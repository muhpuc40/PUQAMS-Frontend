import React, { useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  Layers,
  RefreshCw,
  Users,
  UserRound,
  Armchair,
} from "lucide-react";
import {
  CardBox,
  CustomButton,
  DataTable,
  Select2,
  SpinLoader,
  type Column,
  type Select2Option,
} from "@/components/ui";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { getPrograms, type Program } from "@/services/programService";
import { getSessions, type Session } from "@/services/sessionService";
import {
  getSessionCourses,
  type SessionCourse,
} from "@/services/sessionCourseService";

/* ─── Chips ───────────────────────────────────────────────────── */

const CourseTypeChip: React.FC<{ type: string }> = ({ type }) => {
  const t = type?.toLowerCase() ?? "";
  const styles =
    t === "lab"
      ? "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300"
      : t === "theory"
        ? "bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300"
        : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400";
  return (
    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${styles}`}>
      {type || "—"}
    </span>
  );
};

const SectionChip: React.FC<{ section: string }> = ({ section }) => (
  <span className="inline-flex items-center justify-center min-w-7 h-6 px-2 rounded-md bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 text-xs font-bold">
    {section}
  </span>
);

/* ─── Columns ─────────────────────────────────────────────────── */

const sessionCourseColumns: Column<SessionCourse>[] = [
  {
    key: "id",
    header: "ID",
    sortable: true,
    width: "80px",
    render: (row) => (
      <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
        #{row.id}
      </span>
    ),
  },
  {
    key: "coursecode",
    header: "Course",
    sortable: true,
    render: (row) => (
      <div className="flex flex-col gap-0.5">
        <span className="font-semibold text-slate-900 dark:text-slate-100">
          {row.coursecode}
        </span>
        <span className="text-[11px] text-slate-500 dark:text-slate-400">
          {row.coursename}
        </span>
      </div>
    ),
  },
  {
    key: "section",
    header: "Section",
    sortable: true,
    align: "center",
    width: "90px",
    render: (row) => <SectionChip section={row.section} />,
  },
  {
    key: "coursetype",
    header: "Type",
    sortable: true,
    align: "center",
    width: "90px",
    render: (row) => <CourseTypeChip type={row.coursetype} />,
  },
  {
    key: "coursecredit",
    header: "Credit",
    sortable: true,
    align: "center",
    width: "80px",
    render: (row) => (
      <span className="font-mono tabular-nums text-xs text-slate-700 dark:text-slate-300">
        {row.coursecredit}
      </span>
    ),
  },
  {
    key: "teacher_fullname",
    header: "Teacher",
    sortable: true,
    render: (row) => (
      <div className="flex flex-col gap-0.5">
        <span className="text-xs font-medium text-slate-800 dark:text-slate-200">
          {row.teacher_fullname}
          {row.teacher_shortname && (
            <span className="ml-1 text-[10px] text-slate-400">
              ({row.teacher_shortname})
            </span>
          )}
        </span>
        <span className="text-[10px] text-slate-400">
          {[row.teacher_designation, row.teacher_department]
            .filter(Boolean)
            .join(" · ")}
        </span>
      </div>
    ),
  },
  {
    key: "rulename",
    header: "MD Rule",
    sortable: true,
    render: (row) => (
      <span className="text-[11px] font-mono text-slate-600 dark:text-slate-300">
        {row.rulename || "—"}
      </span>
    ),
  },
  {
    key: "size",
    header: "Capacity",
    sortable: true,
    align: "center",
    width: "100px",
    render: (row) => (
      <span className="font-mono tabular-nums text-xs font-semibold text-slate-800 dark:text-slate-200">
        {row.size}
      </span>
    ),
  },
];

/* ─── Page ────────────────────────────────────────────────────── */

export const SessionCoursePage: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [programs, setPrograms] = useState<Program[]>([]);
  const [selectedProgramId, setSelectedProgramId] = useState("");
  const [isLoadingPrograms, setIsLoadingPrograms] = useState(true);

  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState("");
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);

  const [rows, setRows] = useState<SessionCourse[]>([]);
  const [isLoadingRows, setIsLoadingRows] = useState(false);

  // Client-side filters, built from the loaded rows
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [selectedTeacherId, setSelectedTeacherId] = useState("");

  const departmentId = user?.tbl_department_id ?? null;

  // Load programs
  useEffect(() => {
    if (!departmentId) {
      setIsLoadingPrograms(false);
      return;
    }
    const load = async () => {
      try {
        const { programs } = await getPrograms(departmentId);
        setPrograms(programs);
      } catch (err) {
        toast.error((err as Error).message || "Failed to load programs");
      } finally {
        setIsLoadingPrograms(false);
      }
    };
    void load();
  }, [departmentId, toast]);

  // Load sessions when program changes
  useEffect(() => {
    setSelectedSessionId("");
    setSessions([]);
    if (!selectedProgramId) return;
    const load = async () => {
      setIsLoadingSessions(true);
      try {
        const list = await getSessions(Number(selectedProgramId), "All");
        setSessions(list);
        // Pre-select the running session, if there is one
        const running = list.find(
          (s) => s.status?.toLowerCase() === "running",
        );
        if (running) setSelectedSessionId(String(running.id));
      } catch (err) {
        toast.error((err as Error).message || "Failed to load sessions");
      } finally {
        setIsLoadingSessions(false);
      }
    };
    void load();
  }, [selectedProgramId, toast]);

  // Load sections when session changes
  const loadRows = async (showToast = false) => {
    if (!selectedProgramId || !selectedSessionId) return;
    setIsLoadingRows(true);
    try {
      const list = await getSessionCourses(
        Number(selectedProgramId),
        Number(selectedSessionId),
      );
      setRows(list);
      if (showToast) toast.success("Session courses refreshed");
    } catch (err) {
      toast.error((err as Error).message || "Failed to load session courses");
      setRows([]);
    } finally {
      setIsLoadingRows(false);
    }
  };

  useEffect(() => {
    setSelectedCourseId("");
    setSelectedTeacherId("");
    setRows([]);
    if (!selectedProgramId || !selectedSessionId) return;
    void loadRows();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProgramId, selectedSessionId]);

  /* ─── Options ─────────────────────────────────────────────── */

  const programOptions: Select2Option[] = useMemo(
    () =>
      programs.map((p) => ({
        value: String(p.id),
        label: p.shortName || p.name,
        description: p.name,
        badge: p.code,
      })),
    [programs],
  );

  const sessionOptions: Select2Option[] = useMemo(
    () =>
      sessions.map((s) => ({
        value: String(s.id),
        label: s.sessionname,
        description: s.examname || undefined,
        badge: s.status,
      })),
    [sessions],
  );

  const courseOptions: Select2Option[] = useMemo(() => {
    const map = new Map<number, SessionCourse>();
    rows.forEach((r) => {
      if (!map.has(r.tbl_course_id)) map.set(r.tbl_course_id, r);
    });
    return [...map.values()]
      .sort((a, b) => a.coursecode.localeCompare(b.coursecode))
      .map((r) => ({
        value: String(r.tbl_course_id),
        label: r.coursecode,
        description: r.coursename,
        badge: r.coursetype,
      }));
  }, [rows]);

  const teacherOptions: Select2Option[] = useMemo(() => {
    const map = new Map<number, SessionCourse>();
    rows.forEach((r) => {
      if (!map.has(r.tbl_teacher_id)) map.set(r.tbl_teacher_id, r);
    });
    return [...map.values()]
      .sort((a, b) => a.teacher_fullname.localeCompare(b.teacher_fullname))
      .map((r) => ({
        value: String(r.tbl_teacher_id),
        label: r.teacher_fullname,
        description: [r.teacher_designation, r.teacher_department]
          .filter(Boolean)
          .join(" · "),
      }));
  }, [rows]);

  const filteredRows = useMemo(
    () =>
      rows.filter(
        (r) =>
          (!selectedCourseId ||
            r.tbl_course_id === Number(selectedCourseId)) &&
          (!selectedTeacherId ||
            r.tbl_teacher_id === Number(selectedTeacherId)),
      ),
    [rows, selectedCourseId, selectedTeacherId],
  );

  const counts = useMemo(() => {
    const courses = new Set(filteredRows.map((r) => r.tbl_course_id)).size;
    const teachers = new Set(filteredRows.map((r) => r.tbl_teacher_id)).size;
    const seats = filteredRows.reduce((sum, r) => sum + (r.size || 0), 0);
    return { sections: filteredRows.length, courses, teachers, seats };
  }, [filteredRows]);

  const selectedSession = sessions.find(
    (s) => String(s.id) === selectedSessionId,
  );

  const ready = Boolean(selectedProgramId && selectedSessionId);

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Session Courses
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Sections, assigned teachers and mark distribution rules per session
            {user?.department ? ` · ${user.department}` : ""}
          </p>
        </div>

        <CustomButton
          variant="outline"
          size="sm"
          leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          onClick={() => void loadRows(true)}
          disabled={!ready || isLoadingRows}
          isLoading={isLoadingRows}>
          Refresh
        </CustomButton>
      </div>

      {/* Filters */}
      <CardBox
        title="Filters"
        subtitle="Choose a program and session, then narrow by course or teacher"
        icon={<Layers className="w-4 h-4 text-indigo-500" />}>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
          <Select2
            label="Program"
            placeholder={
              isLoadingPrograms ? "Loading programs..." : "Select a program"
            }
            options={programOptions}
            value={selectedProgramId}
            onChange={(v) => setSelectedProgramId(v as string)}
            disabled={isLoadingPrograms || programs.length === 0}
            isSearchable
            isClearable
          />

          <Select2
            label="Session"
            placeholder={
              isLoadingSessions
                ? "Loading sessions..."
                : selectedProgramId
                  ? "Select a session"
                  : "Select a program first"
            }
            options={sessionOptions}
            value={selectedSessionId}
            onChange={(v) => setSelectedSessionId(v as string)}
            disabled={!selectedProgramId || isLoadingSessions}
            isSearchable
            isClearable
          />

          <Select2
            label="Course"
            placeholder={ready ? "All courses" : "Select a session first"}
            options={courseOptions}
            value={selectedCourseId}
            onChange={(v) => setSelectedCourseId(v as string)}
            disabled={!ready || rows.length === 0}
            isSearchable
            isClearable
          />

          <Select2
            label="Teacher"
            placeholder={ready ? "All teachers" : "Select a session first"}
            options={teacherOptions}
            value={selectedTeacherId}
            onChange={(v) => setSelectedTeacherId(v as string)}
            disabled={!ready || rows.length === 0}
            isSearchable
            isClearable
          />
        </div>
      </CardBox>

      {/* Table or empty state */}
      {ready ? (
        <DataTable<SessionCourse>
          title={
            selectedSession
              ? `Sections · ${selectedSession.sessionname}`
              : "Sections"
          }
          columns={sessionCourseColumns}
          data={filteredRows}
          isLoading={isLoadingRows}
          keyField="id"
          selectable={false}
          searchable
          searchPlaceholder="Search by course, section, teacher or rule..."
          enableExport
          exportFileName={`session-courses-${selectedSessionId}`}
          defaultPageSize={10}
          pageSizeOptions={[10, 25, 50]}
          emptyMessage="No sections assigned in this session."
          actions={
            <div className="flex flex-wrap items-center gap-2 text-[11px]">
              <span className="inline-flex items-center gap-1 font-semibold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 font-mono tabular-nums">
                <Layers className="w-3 h-3" />
                {counts.sections} sections
              </span>
              <span className="inline-flex items-center gap-1 font-semibold px-2 py-0.5 rounded bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300 font-mono tabular-nums">
                <BookOpen className="w-3 h-3" />
                {counts.courses} courses
              </span>
              <span className="inline-flex items-center gap-1 font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 font-mono tabular-nums">
                <UserRound className="w-3 h-3" />
                {counts.teachers} teachers
              </span>
              <span className="inline-flex items-center gap-1 font-semibold px-2 py-0.5 rounded bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 font-mono tabular-nums">
                <Armchair className="w-3 h-3" />
                {counts.seats} seats
              </span>
            </div>
          }
        />
      ) : (
        <CardBox variant="flat">
          <div className="flex flex-col items-center justify-center py-10 text-center gap-3">
            {isLoadingPrograms || isLoadingSessions ? (
              <SpinLoader size="lg" />
            ) : (
              <>
                <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                  <Users className="w-5 h-5" />
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {selectedProgramId
                    ? "Select a session to view its sections."
                    : "Select a program above to view its session courses."}
                </p>
              </>
            )}
          </div>
        </CardBox>
      )}
    </div>
  );
};

export default SessionCoursePage;
