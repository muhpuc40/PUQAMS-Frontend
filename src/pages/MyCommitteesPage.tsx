import React, { useCallback, useEffect, useMemo, useState } from "react";
import { BookOpen, Crown, RefreshCw, Users } from "lucide-react";
import { CustomButton, DataTable, type Column } from "@/components/ui";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { getMyCommittees, type MyExamCommittee } from "@/services/examService";

/* ─── Page ────────────────────────────────────────────────────── */

export const MyCommitteesPage: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [rows, setRows] = useState<MyExamCommittee[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const teacherId = user?.id ?? null;

  const load = useCallback(
    async (showToast = false) => {
      if (!teacherId) return;
      setIsLoading(true);
      try {
        setRows(await getMyCommittees(teacherId));
        if (showToast) toast.success("Committees refreshed");
      } catch (err) {
        toast.error((err as Error).message || "Failed to load your committees");
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

  const columns: Column<MyExamCommittee>[] = useMemo(
    () => [
      {
        key: "sessionname",
        header: "Session / Exam",
        sortable: true,
        render: (r) => (
          <div className="flex flex-col gap-0.5">
            <span className="font-semibold text-slate-900 dark:text-slate-100">{r.examname || r.sessionname}</span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              {r.sessionname}
              {r.exam_held_in ? ` · ${r.exam_held_in}` : ""}
            </span>
          </div>
        ),
      },
      {
        key: "program",
        header: "Program",
        sortable: true,
        render: (r) => (
          <div className="flex flex-col gap-0.5">
            <span className="text-xs text-slate-800 dark:text-slate-200">{r.program}</span>
            <span className="text-[10px] text-slate-400">{r.department}</span>
          </div>
        ),
      },
      {
        key: "semester",
        header: "Semester",
        sortable: true,
        align: "center",
        width: "90px",
        render: (r) => (
          <span className="inline-flex items-center justify-center min-w-7 h-6 px-2 rounded-md bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 text-xs font-bold">
            {r.semester}
          </span>
        ),
      },
      {
        key: "role",
        header: "Your Role",
        sortable: true,
        align: "center",
        width: "120px",
        render: (r) =>
          r.role === "Chairman" ? (
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">
              <Crown className="w-3 h-3" /> Chairman
            </span>
          ) : (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
              Member
            </span>
          ),
      },
      {
        key: "chairpersons",
        header: "Chairman",
        render: (r) => <span className="text-xs text-slate-700 dark:text-slate-300">{r.chairpersons || "—"}</span>,
      },
      {
        key: "course_count",
        header: "Courses",
        sortable: true,
        align: "center",
        width: "90px",
        render: (r) => <span className="font-mono text-xs font-semibold">{r.course_count}</span>,
      },
      {
        key: "member_count",
        header: "Members",
        sortable: true,
        align: "center",
        width: "90px",
        render: (r) => <span className="font-mono text-xs">{r.member_count}</span>,
      },
    ],
    [],
  );

  const chairCount = rows.filter((r) => r.role === "Chairman").length;
  const courseCount = rows.reduce((s, r) => s + r.course_count, 0);

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">My Committees</h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Exam committees you sit on in running sessions — you moderate their courses' questions
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

      <DataTable<MyExamCommittee>
        title="Committees"
        columns={columns}
        data={rows}
        isLoading={isLoading}
        keyField="id"
        selectable={false}
        searchable
        searchPlaceholder="Search by session, program or role..."
        enableExport={false}
        defaultPageSize={10}
        pageSizeOptions={[10, 25]}
        emptyMessage="You are not on any exam committee in a running session."
        actions={
          <div className="flex flex-wrap items-center gap-2 text-[11px]">
            <span className="inline-flex items-center gap-1 font-semibold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 font-mono tabular-nums">
              <Users className="w-3 h-3" /> {rows.length} committees
            </span>
            <span className="inline-flex items-center gap-1 font-semibold px-2 py-0.5 rounded bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 font-mono tabular-nums">
              <Crown className="w-3 h-3" /> {chairCount} as chairman
            </span>
            <span className="inline-flex items-center gap-1 font-semibold px-2 py-0.5 rounded bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300 font-mono tabular-nums">
              <BookOpen className="w-3 h-3" /> {courseCount} courses
            </span>
          </div>
        }
      />
    </div>
  );
};

export default MyCommitteesPage;
