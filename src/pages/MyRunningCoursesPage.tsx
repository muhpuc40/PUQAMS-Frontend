import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  ClipboardList,
  FileQuestion,
  Layers,
  RefreshCw,
} from "lucide-react";
import {
  CustomButton,
  DataTable,
  type Column,
} from "@/components/ui";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import {
  getMyRunningCourses,
  type RunningCourse,
} from "@/services/cloEnterService";

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

const ProgressChip: React.FC<{ exams: number; questions: number }> = ({
  exams,
  questions,
}) =>
  exams === 0 ? (
    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
      Not started
    </span>
  ) : (
    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 font-mono tabular-nums">
      {exams} exam{exams === 1 ? "" : "s"} · {questions} Q
    </span>
  );

/* ─── Page ────────────────────────────────────────────────────── */

export const MyRunningCoursesPage: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [rows, setRows] = useState<RunningCourse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const teacherId = user?.id ?? null;

  const load = useCallback(
    async (showToast = false) => {
      if (!teacherId) return;
      setIsLoading(true);
      try {
        const list = await getMyRunningCourses(teacherId);
        setRows(list);
        if (showToast) toast.success("Courses refreshed");
      } catch (err) {
        toast.error((err as Error).message || "Failed to load your courses");
        setRows([]);
      } finally {
        setIsLoading(false);
      }
    },
    [teacherId, toast],
  );

  useEffect(() => {
    void load();
  }, [load]);

  const columns: Column<RunningCourse>[] = useMemo(
    () => [
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
        key: "sectionname",
        header: "Section",
        sortable: true,
        align: "center",
        width: "90px",
        render: (row) => (
          <span className="inline-flex items-center justify-center min-w-7 h-6 px-2 rounded-md bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 text-xs font-bold">
            {row.sectionname}
          </span>
        ),
      },
      {
        key: "sessionname",
        header: "Session",
        sortable: true,
        render: (row) => (
          <div className="flex flex-col gap-0.5">
            <span className="text-xs text-slate-800 dark:text-slate-200">
              {row.sessionname}
            </span>
            <span className="text-[10px] text-slate-400">
              {row.program} · Semester {row.semester}
            </span>
          </div>
        ),
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
        key: "size",
        header: "Capacity",
        sortable: true,
        align: "center",
        width: "90px",
        render: (row) => (
          <span className="font-mono tabular-nums text-xs text-slate-700 dark:text-slate-300">
            {row.size}
          </span>
        ),
      },
      {
        key: "assessment_count",
        header: "CLO Entry",
        sortable: true,
        align: "center",
        width: "130px",
        render: (row) => (
          <ProgressChip
            exams={row.assessment_count}
            questions={row.question_count}
          />
        ),
      },
      {
        key: "actions",
        header: "",
        align: "right",
        width: "130px",
        render: (row) => (
          <CustomButton
            size="xs"
            leftIcon={<ClipboardList className="w-3.5 h-3.5" />}
            onClick={() => navigate(`/clo-enter?sessioncourse_id=${row.id}`)}>
            CLO Enter
          </CustomButton>
        ),
      },
    ],
    [navigate],
  );

  const counts = useMemo(
    () => ({
      sections: rows.length,
      started: rows.filter((r) => r.assessment_count > 0).length,
      questions: rows.reduce((s, r) => s + r.question_count, 0),
    }),
    [rows],
  );

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            My Running Courses
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Sections assigned to you in running sessions
            {user?.fullname ? ` · ${user.fullname}` : ""}
          </p>
        </div>

        <CustomButton
          variant="outline"
          size="sm"
          leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          onClick={() => void load(true)}
          disabled={isLoading}
          isLoading={isLoading}>
          Refresh
        </CustomButton>
      </div>

      <DataTable<RunningCourse>
        title="Assigned Sections"
        columns={columns}
        data={rows}
        isLoading={isLoading}
        keyField="id"
        selectable={false}
        searchable
        searchPlaceholder="Search by course, section or session..."
        enableExport={false}
        defaultPageSize={10}
        pageSizeOptions={[10, 25, 50]}
        emptyMessage="No sections are assigned to you in a running session."
        actions={
          <div className="flex flex-wrap items-center gap-2 text-[11px]">
            <span className="inline-flex items-center gap-1 font-semibold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 font-mono tabular-nums">
              <Layers className="w-3 h-3" />
              {counts.sections} sections
            </span>
            <span className="inline-flex items-center gap-1 font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 font-mono tabular-nums">
              <BookOpen className="w-3 h-3" />
              {counts.started} started
            </span>
            <span className="inline-flex items-center gap-1 font-semibold px-2 py-0.5 rounded bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300 font-mono tabular-nums">
              <FileQuestion className="w-3 h-3" />
              {counts.questions} questions
            </span>
          </div>
        }
      />
    </div>
  );
};

export default MyRunningCoursesPage;
