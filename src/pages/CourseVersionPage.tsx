import React, { useEffect, useMemo, useState } from "react";
import { BookOpen, RefreshCw } from "lucide-react";
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
  getCourseVersions,
  getPrograms,
  type CourseVersion,
  type Program,
} from "@/services/programService";

const versionColumns: Column<CourseVersion>[] = [
  { key: "id", header: "ID", sortable: true, width: "70px" },
  {
    key: "versionname",
    header: "Version Name",
    sortable: true,
    render: (row) => (
      <div>
        <span className="font-semibold text-slate-900 dark:text-slate-100">
          {row.versionname}
        </span>
        <span className="block text-[11px] text-slate-400">
          {row.program_admitcard}
        </span>
      </div>
    ),
  },
  {
    key: "program",
    header: "Program Type",
    sortable: true,
  },
  {
    key: "degreefullname",
    header: "Degree",
    sortable: true,
    render: (row) => (
      <span className="text-[11px] text-slate-600 dark:text-slate-300">
        {row.degreefullname}
      </span>
    ),
  },
  {
    key: "department",
    header: "Dept.",
    sortable: true,
    align: "center",
    render: (row) => (
      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
        {row.department}
      </span>
    ),
  },
];

export const CourseVersionPage: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [programs, setPrograms] = useState<Program[]>([]);
  const [selectedProgramId, setSelectedProgramId] = useState("");
  const [isLoadingPrograms, setIsLoadingPrograms] = useState(true);

  const [versions, setVersions] = useState<CourseVersion[]>([]);
  const [isLoadingVersions, setIsLoadingVersions] = useState(false);

  const departmentId = user?.tbl_department_id ?? null;

  // Load programs for the user's department
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

  // Load course versions when a program is picked
  useEffect(() => {
    if (!selectedProgramId) {
      setVersions([]);
      return;
    }
    const load = async () => {
      setIsLoadingVersions(true);
      try {
        const list = await getCourseVersions(Number(selectedProgramId));
        setVersions(list);
      } catch (err) {
        toast.error((err as Error).message || "Failed to load course versions");
        setVersions([]);
      } finally {
        setIsLoadingVersions(false);
      }
    };
    void load();
  }, [selectedProgramId, toast]);

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
    setIsLoadingVersions(true);
    try {
      const list = await getCourseVersions(Number(selectedProgramId));
      setVersions(list);
      toast.success("Course versions refreshed");
    } catch (err) {
      toast.error((err as Error).message || "Failed to refresh");
    } finally {
      setIsLoadingVersions(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Course Versions
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Select a program to view its course versions
            {user?.department ? ` · ${user.department}` : ""}
          </p>
        </div>

        <CustomButton
          variant="outline"
          size="sm"
          leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          onClick={handleRefresh}
          disabled={!selectedProgramId || isLoadingVersions}
          isLoading={isLoadingVersions}>
          Refresh
        </CustomButton>
      </div>

      {/* Selector Card */}
      <CardBox
        title="Select Program"
        subtitle="Choose a program to load its course versions"
        icon={<BookOpen className="w-4 h-4 text-indigo-500" />}>
        <div className="max-w-lg">
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
            helperText={
              !isLoadingPrograms && programs.length === 0
                ? "No programs found for your department"
                : undefined
            }
          />
        </div>
      </CardBox>

      {/* Versions Table */}
      {selectedProgramId ? (
        <DataTable<CourseVersion>
          title="Course Versions"
          columns={versionColumns}
          data={versions}
          isLoading={isLoadingVersions}
          keyField="id"
          selectable={false}
          searchable
          searchPlaceholder="Search versions by name or degree..."
          enableExport
          exportFileName="course-versions"
          defaultPageSize={10}
          pageSizeOptions={[5, 10, 25]}
          emptyMessage="No course versions available for this program."
        />
      ) : (
        <CardBox variant="flat">
          <div className="flex flex-col items-center justify-center py-8 text-center gap-3">
            {isLoadingPrograms ? (
              <SpinLoader size="lg" />
            ) : (
              <>
                <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                  <BookOpen className="w-5 h-5" />
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Select a program above to view its course versions.
                </p>
              </>
            )}
          </div>
        </CardBox>
      )}
    </div>
  );
};

export default CourseVersionPage;
