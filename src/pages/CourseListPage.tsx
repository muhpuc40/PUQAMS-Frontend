import React, { useEffect, useMemo, useState } from "react";
import { BookOpen, Layers, RefreshCw } from "lucide-react";
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
  getPrograms,
  getCourseVersions,
  type CourseVersion,
  type Program,
} from "@/services/programService";
import { getCoursesByVersion, type Course } from "@/services/courseService";

const COURSE_TYPE_STYLES: Record<string, string> = {
  Theory:
    "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300",
  Lab: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300",
};

const courseColumns: Column<Course>[] = [
  { key: "id", header: "ID", sortable: true, width: "70px" },
  {
    key: "coursecode",
    header: "Course Code",
    sortable: true,
    render: (row) => (
      <span className="font-mono text-[11px] font-semibold text-slate-900 dark:text-slate-100">
        {row.coursecode}
      </span>
    ),
  },
  {
    key: "coursename",
    header: "Course Name",
    sortable: true,
    render: (row) => (
      <div>
        <span className="font-semibold text-slate-900 dark:text-slate-100">
          {row.coursename}
        </span>
        {row.shortname && (
          <span className="block text-[11px] text-slate-400">
            {row.shortname}
          </span>
        )}
      </div>
    ),
  },
  {
    key: "coursecredit",
    header: "Credit",
    sortable: true,
    align: "center",
    render: (row) => (
      <span className="font-mono tabular-nums font-medium text-slate-800 dark:text-slate-200">
        {row.coursecredit}
      </span>
    ),
  },
  {
    key: "coursetype",
    header: "Type",
    sortable: true,
    align: "center",
    render: (row) => (
      <span
        className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
          COURSE_TYPE_STYLES[row.coursetype] ??
          "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
        }`}>
        {row.coursetype}
      </span>
    ),
  },
  {
    key: "ex_semester",
    header: "Semester",
    sortable: true,
    align: "center",
    render: (row) => (
      <span className="font-mono tabular-nums text-slate-700 dark:text-slate-300">
        {row.ex_semester}
      </span>
    ),
  },
  {
    key: "course_hr",
    header: "Hours",
    sortable: true,
    align: "center",
    render: (row) => (
      <span className="font-mono tabular-nums text-slate-500 dark:text-slate-400">
        {row.course_hr || "—"}
      </span>
    ),
  },
];

export const CourseListPage: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  // Programs
  const [programs, setPrograms] = useState<Program[]>([]);
  const [selectedProgramId, setSelectedProgramId] = useState("");
  const [isLoadingPrograms, setIsLoadingPrograms] = useState(true);

  // Versions
  const [versions, setVersions] = useState<CourseVersion[]>([]);
  const [selectedVersionId, setSelectedVersionId] = useState("");
  const [isLoadingVersions, setIsLoadingVersions] = useState(false);

  // Courses
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoadingCourses, setIsLoadingCourses] = useState(false);

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

  // When a program is chosen: load versions, reset version + courses
  useEffect(() => {
    setSelectedVersionId("");
    setVersions([]);
    setCourses([]);

    if (!selectedProgramId) return;

    const load = async () => {
      setIsLoadingVersions(true);
      try {
        const list = await getCourseVersions(Number(selectedProgramId));
        setVersions(list);
      } catch (err) {
        toast.error((err as Error).message || "Failed to load course versions");
      } finally {
        setIsLoadingVersions(false);
      }
    };
    void load();
  }, [selectedProgramId, toast]);

  // When a version is chosen: load courses
  useEffect(() => {
    if (!selectedProgramId || !selectedVersionId) {
      setCourses([]);
      return;
    }
    const load = async () => {
      setIsLoadingCourses(true);
      try {
        const list = await getCoursesByVersion(
          Number(selectedProgramId),
          Number(selectedVersionId),
        );
        setCourses(list);
      } catch (err) {
        toast.error((err as Error).message || "Failed to load courses");
        setCourses([]);
      } finally {
        setIsLoadingCourses(false);
      }
    };
    void load();
  }, [selectedProgramId, selectedVersionId, toast]);

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

  const versionOptions: Select2Option[] = useMemo(
    () =>
      versions.map((v) => ({
        value: String(v.id),
        label: v.versionname,
        description: v.degreefullname,
        badge: v.program_admitcard,
      })),
    [versions],
  );

  const handleRefresh = async () => {
    if (!selectedProgramId || !selectedVersionId) return;
    setIsLoadingCourses(true);
    try {
      const list = await getCoursesByVersion(
        Number(selectedProgramId),
        Number(selectedVersionId),
      );
      setCourses(list);
      toast.success("Course list refreshed");
    } catch (err) {
      toast.error((err as Error).message || "Failed to refresh");
    } finally {
      setIsLoadingCourses(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Course List
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Select a program and version to view its courses
            {user?.department ? ` · ${user.department}` : ""}
          </p>
        </div>

        <CustomButton
          variant="outline"
          size="sm"
          leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          onClick={handleRefresh}
          disabled={
            !selectedProgramId || !selectedVersionId || isLoadingCourses
          }
          isLoading={isLoadingCourses}>
          Refresh
        </CustomButton>
      </div>

      {/* Filters */}
      <CardBox
        title="Filters"
        subtitle="Choose a program, then a version"
        icon={<Layers className="w-4 h-4 text-indigo-500" />}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl">
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

          <Select2
            label="Course Version"
            placeholder={
              !selectedProgramId
                ? "Select a program first"
                : isLoadingVersions
                  ? "Loading versions..."
                  : "Select a version"
            }
            options={versionOptions}
            value={selectedVersionId}
            onChange={(v) => setSelectedVersionId(v as string)}
            disabled={
              !selectedProgramId || isLoadingVersions || versions.length === 0
            }
            isSearchable
            isClearable
            helperText={
              selectedProgramId && !isLoadingVersions && versions.length === 0
                ? "No course versions found for this program"
                : undefined
            }
          />
        </div>
      </CardBox>

      {/* Table or empty state */}
      {selectedVersionId ? (
        <DataTable<Course>
          title="Courses"
          columns={courseColumns}
          data={courses}
          isLoading={isLoadingCourses}
          keyField="id"
          selectable={false}
          searchable
          searchPlaceholder="Search by code, name, or type..."
          enableExport
          exportFileName="course-list"
          defaultPageSize={10}
          pageSizeOptions={[5, 10, 25, 50]}
          emptyMessage="No courses found for this version."
        />
      ) : (
        <CardBox variant="flat">
          <div className="flex flex-col items-center justify-center py-8 text-center gap-3">
            {isLoadingVersions || isLoadingCourses ? (
              <SpinLoader size="lg" />
            ) : (
              <>
                <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                  <BookOpen className="w-5 h-5" />
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Select a program and version above to view its courses.
                </p>
              </>
            )}
          </div>
        </CardBox>
      )}
    </div>
  );
};

export default CourseListPage;
