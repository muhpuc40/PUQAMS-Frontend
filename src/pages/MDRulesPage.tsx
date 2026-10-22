import React, { useEffect, useMemo, useState } from "react";
import {
  Award,
  Layers,
  ListChecks,
  RefreshCw,
  Repeat,
  ShieldCheck,
  ShieldX,
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
import {
  getCourseTypes,
  getMDRules,
  getMDRuleDetails,
  type CourseType,
  type MDRule,
  type MDRuleDetail,
} from "@/services/mdRuleService";

/* ─── Small boolean chip ──────────────────────────────────────── */

const BoolChip: React.FC<{
  value: number | string;
  yes: string;
  no: string;
}> = ({ value, yes, no }) => {
  const truthy =
    (typeof value === "number" && value === 1) ||
    (typeof value === "string" && value.toLowerCase() === "yes");
  return (
    <span
      className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded ${
        truthy
          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400"
          : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
      }`}>
      {truthy ? (
        <ShieldCheck className="w-3 h-3" />
      ) : (
        <ShieldX className="w-3 h-3" />
      )}
      {truthy ? yes : no}
    </span>
  );
};

/* ─── Columns ────────────────────────────────────────────────── */

const ruleDetailColumns: Column<MDRuleDetail>[] = [
  {
    key: "ordering",
    header: "#",
    sortable: true,
    width: "60px",
    render: (row) => (
      <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
        {row.ordering}
      </span>
    ),
  },
  {
    key: "display_name",
    header: "Component",
    sortable: true,
    render: (row) => (
      <div>
        <span className="font-semibold text-slate-900 dark:text-slate-100">
          {row.display_name}
        </span>
        <span className="block text-[10px] font-mono text-slate-400">
          {row.tbl_sessioncourse_column}
        </span>
      </div>
    ),
  },
  {
    key: "max_mark",
    header: "Max Marks",
    sortable: true,
    align: "center",
    width: "110px",
    render: (row) => (
      <span className="inline-flex items-center gap-1 font-mono tabular-nums text-xs font-semibold text-indigo-600 dark:text-indigo-400">
        <Award className="w-3 h-3" />
        {row.max_mark}
      </span>
    ),
  },
  {
    key: "inRetake",
    header: "In Retake",
    sortable: true,
    align: "center",
    width: "110px",
    render: (row) => <BoolChip value={row.inRetake} yes="Yes" no="No" />,
  },
  {
    key: "allowA",
    header: "Allow A",
    sortable: true,
    align: "center",
    width: "100px",
    render: (row) => <BoolChip value={row.allowA} yes="Allowed" no="—" />,
  },
  {
    key: "allowEXP",
    header: "Allow EXP",
    sortable: true,
    align: "center",
    width: "110px",
    render: (row) => <BoolChip value={row.allowEXP} yes="Allowed" no="—" />,
  },
  {
    key: "failifa",
    header: "Fail if A",
    sortable: true,
    align: "center",
    width: "100px",
    render: (row) => <BoolChip value={row.failifa} yes="Fail" no="Pass" />,
  },
  {
    key: "failifexp",
    header: "Fail if EXP",
    sortable: true,
    align: "center",
    width: "110px",
    render: (row) => <BoolChip value={row.failifexp} yes="Fail" no="Pass" />,
  },
];

/* ─── Page ───────────────────────────────────────────────────── */

export const MDRulesPage: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  // Course types
  const [courseTypes, setCourseTypes] = useState<CourseType[]>([]);
  const [selectedCourseTypeId, setSelectedCourseTypeId] = useState("");
  const [isLoadingTypes, setIsLoadingTypes] = useState(true);

  // Rules
  const [rules, setRules] = useState<MDRule[]>([]);
  const [selectedRuleId, setSelectedRuleId] = useState("");
  const [isLoadingRules, setIsLoadingRules] = useState(false);

  // Rule details
  const [details, setDetails] = useState<MDRuleDetail[]>([]);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  const departmentId = user?.tbl_department_id ?? null;

  // Load course types on mount
  useEffect(() => {
    const load = async () => {
      try {
        const list = await getCourseTypes();
        setCourseTypes(list);
      } catch (err) {
        toast.error((err as Error).message || "Failed to load course types");
      } finally {
        setIsLoadingTypes(false);
      }
    };
    void load();
  }, [toast]);

  // Load rules when course type changes
  useEffect(() => {
    setSelectedRuleId("");
    setRules([]);
    setDetails([]);

    if (!selectedCourseTypeId || !departmentId) return;

    const load = async () => {
      setIsLoadingRules(true);
      try {
        const list = await getMDRules(
          departmentId,
          Number(selectedCourseTypeId),
        );
        setRules(list);
      } catch (err) {
        toast.error((err as Error).message || "Failed to load rules");
      } finally {
        setIsLoadingRules(false);
      }
    };
    void load();
  }, [selectedCourseTypeId, departmentId, toast]);

  // Load details when rule changes
  useEffect(() => {
    if (!selectedRuleId || !departmentId) {
      setDetails([]);
      return;
    }
    const load = async () => {
      setIsLoadingDetails(true);
      try {
        const list = await getMDRuleDetails(
          Number(selectedRuleId),
          departmentId,
        );
        setDetails(list);
      } catch (err) {
        toast.error((err as Error).message || "Failed to load rule details");
        setDetails([]);
      } finally {
        setIsLoadingDetails(false);
      }
    };
    void load();
  }, [selectedRuleId, departmentId, toast]);

  const courseTypeOptions: Select2Option[] = useMemo(
    () =>
      courseTypes.map((t) => ({
        value: String(t.id),
        label: t.name,
      })),
    [courseTypes],
  );

  const ruleOptions: Select2Option[] = useMemo(
    () =>
      rules.map((r) => ({
        value: String(r.id),
        label: r.rulename,
      })),
    [rules],
  );

  const handleRefresh = async () => {
    if (!selectedRuleId || !departmentId) return;
    setIsLoadingDetails(true);
    try {
      const list = await getMDRuleDetails(Number(selectedRuleId), departmentId);
      setDetails(list);
      toast.success("Rule details refreshed");
    } catch (err) {
      toast.error((err as Error).message || "Failed to refresh");
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const totalMarks = useMemo(
    () => details.reduce((sum, d) => sum + (d.max_mark || 0), 0),
    [details],
  );

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Mark Distribution Rules
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            View assessment breakdown for each marking rule
            {user?.department ? ` · ${user.department}` : ""}
          </p>
        </div>

        <CustomButton
          variant="outline"
          size="sm"
          leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          onClick={handleRefresh}
          disabled={!selectedRuleId || isLoadingDetails}
          isLoading={isLoadingDetails}>
          Refresh
        </CustomButton>
      </div>

      {/* Filters */}
      <CardBox
        title="Filters"
        subtitle="Choose a course type, then a rule"
        icon={<Layers className="w-4 h-4 text-indigo-500" />}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl">
          <Select2
            label="Course Type"
            placeholder={
              isLoadingTypes
                ? "Loading course types..."
                : "Select a course type"
            }
            options={courseTypeOptions}
            value={selectedCourseTypeId}
            onChange={(v) => setSelectedCourseTypeId(v as string)}
            disabled={isLoadingTypes || courseTypes.length === 0}
            isSearchable
            isClearable
          />
          <Select2
            label="Rule Name"
            placeholder={
              !selectedCourseTypeId
                ? "Select a course type first"
                : isLoadingRules
                  ? "Loading rules..."
                  : "Select a rule"
            }
            options={ruleOptions}
            value={selectedRuleId}
            onChange={(v) => setSelectedRuleId(v as string)}
            disabled={
              !selectedCourseTypeId || isLoadingRules || rules.length === 0
            }
            isSearchable
            isClearable
            helperText={
              selectedCourseTypeId && !isLoadingRules && rules.length === 0
                ? "No rules found for this course type"
                : undefined
            }
          />
        </div>
      </CardBox>

      {/* Details table or empty state */}
      {selectedRuleId ? (
        <DataTable<MDRuleDetail>
          title="Rule Details"
          columns={ruleDetailColumns}
          data={details}
          isLoading={isLoadingDetails}
          keyField="id"
          selectable={false}
          searchable
          searchPlaceholder="Search by component name..."
          enableExport
          exportFileName="md-rule-details"
          defaultPageSize={10}
          pageSizeOptions={[10, 25, 50]}
          emptyMessage="No detail rows for this rule."
          actions={
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 font-mono tabular-nums">
              Total: {totalMarks} marks
            </span>
          }
        />
      ) : (
        <CardBox variant="flat">
          <div className="flex flex-col items-center justify-center py-10 text-center gap-3">
            {isLoadingRules ? (
              <SpinLoader size="lg" />
            ) : (
              <>
                <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                  <ListChecks className="w-5 h-5" />
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Select a course type and rule above to view its details.
                </p>
              </>
            )}
          </div>
        </CardBox>
      )}

      {/* Summary strip */}
      {!isLoadingDetails && details.length > 0 && (
        <div className="flex flex-wrap items-center gap-3 px-1 text-[11px] text-slate-500 dark:text-slate-400">
          <span className="inline-flex items-center gap-1.5">
            <Repeat className="w-3 h-3" />
            <span className="font-mono tabular-nums">
              {
                details.filter((d) => d.inRetake?.toLowerCase() === "yes")
                  .length
              }
            </span>{" "}
            allowed in retake
          </span>
          <span className="text-slate-300 dark:text-slate-700">·</span>
          <span className="inline-flex items-center gap-1.5">
            <Award className="w-3 h-3" />
            <span className="font-mono tabular-nums">{totalMarks}</span> total
            marks across {details.length} component
            {details.length !== 1 && "s"}
          </span>
        </div>
      )}
    </div>
  );
};

export default MDRulesPage;
