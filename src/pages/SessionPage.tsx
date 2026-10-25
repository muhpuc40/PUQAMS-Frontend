import React, { useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  CalendarDays,
  RefreshCw,
  CalendarCheck,
  CalendarX,
} from "lucide-react";
import {
  CardBox,
  CustomButton,
  DataTable,
  RadioButtonInput,
  Select2,
  SpinLoader,
  type Column,
  type Select2Option,
} from "@/components/ui";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { getPrograms, type Program } from "@/services/programService";
import {
  getSessions,
  type Session,
  type SessionStatus,
} from "@/services/sessionService";

/* ─── Format helpers ──────────────────────────────────────────── */

const formatDate = (value: string) => {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
};

const YesNoChip: React.FC<{
  value: string | number;
  yes?: string;
  no?: string;
}> = ({ value, yes = "Yes", no = "No" }) => {
  const truthy =
    (typeof value === "number" && value === 1) ||
    (typeof value === "string" && value === "1");
  return (
    <span
      className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
        truthy
          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400"
          : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
      }`}>
      {truthy ? yes : no}
    </span>
  );
};

const StatusChip: React.FC<{ status: string }> = ({ status }) => {
  const s = status?.toLowerCase() ?? "";
  const styles =
    s === "running"
      ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300"
      : s === "completed"
        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400"
        : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400";
  return (
    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${styles}`}>
      {status}
    </span>
  );
};

/* ─── Columns ─────────────────────────────────────────────────── */

const sessionColumns: Column<Session>[] = [
  {
    key: "id",
    header: "ID",
    sortable: true,
    width: "90px",
    render: (row) => (
      <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
        #{row.id}
      </span>
    ),
  },
  {
    key: "sessionname",
    header: "Session",
    sortable: true,
    render: (row) => (
      <div className="flex flex-col gap-0.5">
        <span className="font-semibold text-slate-900 dark:text-slate-100">
          {row.sessionname}
        </span>
        {row.iscredit_transfer && (
          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 w-fit">
            Credit Transfer
          </span>
        )}
      </div>
    ),
  },
  {
    key: "status",
    header: "Status",
    sortable: true,
    align: "center",
    width: "110px",
    render: (row) => <StatusChip status={row.status} />,
  },
  {
    key: "startdate",
    header: "Start Date",
    sortable: true,
    width: "130px",
    render: (row) => (
      <span className="font-mono tabular-nums text-[11px] text-slate-700 dark:text-slate-300">
        {formatDate(row.startdate)}
      </span>
    ),
  },
  {
    key: "enddate",
    header: "End Date",
    sortable: true,
    width: "130px",
    render: (row) => (
      <span className="font-mono tabular-nums text-[11px] text-slate-700 dark:text-slate-300">
        {formatDate(row.enddate)}
      </span>
    ),
  },
  {
    key: "examname",
    header: "Exam",
    sortable: true,
    render: (row) => (
      <div className="flex flex-col gap-0.5">
        <span className="text-xs text-slate-800 dark:text-slate-200">
          {row.examname || "—"}
        </span>
        {row.exam_held_in && (
          <span className="text-[10px] text-slate-400">{row.exam_held_in}</span>
        )}
      </div>
    ),
  },
  {
    key: "isenrollmentopen",
    header: "Enrollment",
    sortable: true,
    align: "center",
    width: "110px",
    render: (row) => (
      <YesNoChip value={row.isenrollmentopen} yes="Open" no="Closed" />
    ),
  },
  {
    key: "isenrollmentopen_stu",
    header: "Student Portal",
    sortable: true,
    align: "center",
    width: "130px",
    render: (row) => (
      <YesNoChip value={row.isenrollmentopen_stu} yes="Open" no="Closed" />
    ),
  },
  {
    key: "isroutinepublished",
    header: "Routine",
    sortable: true,
    align: "center",
    width: "110px",
    render: (row) => (
      <YesNoChip value={row.isroutinepublished} yes="Published" no="Draft" />
    ),
  },
];

/* ─── Page ────────────────────────────────────────────────────── */

const statusOptions = [
  { value: "All", label: "All Sessions" },
  { value: "Running", label: "Running" },
  { value: "Completed", label: "Completed" },
];

export const SessionPage: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [programs, setPrograms] = useState<Program[]>([]);
  const [selectedProgramId, setSelectedProgramId] = useState("");
  const [isLoadingPrograms, setIsLoadingPrograms] = useState(true);

  const [status, setStatus] = useState<SessionStatus>("All");

  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);

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

  // Load sessions when program or status changes
  useEffect(() => {
    if (!selectedProgramId) {
      setSessions([]);
      return;
    }
    const load = async () => {
      setIsLoadingSessions(true);
      try {
        const list = await getSessions(Number(selectedProgramId), status);
        setSessions(list);
      } catch (err) {
        toast.error((err as Error).message || "Failed to load sessions");
        setSessions([]);
      } finally {
        setIsLoadingSessions(false);
      }
    };
    void load();
  }, [selectedProgramId, status, toast]);

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

  const handleRefresh = async () => {
    if (!selectedProgramId) return;
    setIsLoadingSessions(true);
    try {
      const list = await getSessions(Number(selectedProgramId), status);
      setSessions(list);
      toast.success("Sessions refreshed");
    } catch (err) {
      toast.error((err as Error).message || "Failed to refresh");
    } finally {
      setIsLoadingSessions(false);
    }
  };

  const counts = useMemo(() => {
    const running = sessions.filter(
      (s) => s.status?.toLowerCase() === "running",
    ).length;
    const completed = sessions.filter(
      (s) => s.status?.toLowerCase() === "completed",
    ).length;
    return { running, completed, total: sessions.length };
  }, [sessions]);

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Sessions
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Browse academic sessions by program and status
            {user?.department ? ` · ${user.department}` : ""}
          </p>
        </div>

        <CustomButton
          variant="outline"
          size="sm"
          leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          onClick={handleRefresh}
          disabled={!selectedProgramId || isLoadingSessions}
          isLoading={isLoadingSessions}>
          Refresh
        </CustomButton>
      </div>

      {/* Filters */}
      <CardBox
        title="Filters"
        subtitle="Choose a program and filter by session status"
        icon={<CalendarDays className="w-4 h-4 text-indigo-500" />}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-3xl">
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

          <RadioButtonInput
            name="session-status"
            label="Status"
            orientation="horizontal"
            value={status}
            onChange={(v) => setStatus(v as SessionStatus)}
            options={statusOptions}
          />
        </div>
      </CardBox>

      {/* Table or empty state */}
      {selectedProgramId ? (
        <>
          <DataTable<Session>
            title="Academic Sessions"
            columns={sessionColumns}
            data={sessions}
            isLoading={isLoadingSessions}
            keyField="id"
            selectable={false}
            searchable
            searchPlaceholder="Search by session name or exam..."
            enableExport
            exportFileName={`sessions-${status.toLowerCase()}`}
            defaultPageSize={10}
            pageSizeOptions={[10, 25, 50]}
            emptyMessage={`No ${status === "All" ? "" : status.toLowerCase() + " "}sessions found.`}
            actions={
              <div className="flex items-center gap-2 text-[11px]">
                <span className="inline-flex items-center gap-1 font-semibold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 font-mono tabular-nums">
                  <CalendarCheck className="w-3 h-3" />
                  {counts.running} running
                </span>
                <span className="inline-flex items-center gap-1 font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 font-mono tabular-nums">
                  <CalendarX className="w-3 h-3" />
                  {counts.completed} completed
                </span>
              </div>
            }
          />
        </>
      ) : (
        <CardBox variant="flat">
          <div className="flex flex-col items-center justify-center py-10 text-center gap-3">
            {isLoadingPrograms ? (
              <SpinLoader size="lg" />
            ) : (
              <>
                <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                  <BookOpen className="w-5 h-5" />
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Select a program above to view its sessions.
                </p>
              </>
            )}
          </div>
        </CardBox>
      )}
    </div>
  );
};

export default SessionPage;
