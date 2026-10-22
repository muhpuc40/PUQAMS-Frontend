import React, { useEffect, useMemo, useState } from "react";
import { BookOpen, Layers, RefreshCw, Target } from "lucide-react";
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
import {
  getCoursesByVersion,
  getCLOsByCourse,
  type Course,
  type CourseLearningOutcome,
} from "@/services/courseService";

const ploColumns: Column<CourseLearningOutcome>[] = [
  {
    key: "id",
    header: "ID",
    sortable: true,
    width: "70px",
    render: (row) => (
      <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
        #{row.id}
      </span>
    ),
  },
  {
    key: "course_outcome",
    header: "CO",
    sortable: true,
    width: "90px",
    render: (row) => (
      <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
        <Target className="w-3 h-3" />
        {row.course_outcome}
      </span>
    ),
  },
  {
    key: "description",
    header: "Description",
    sortable: true,
    render: (row) => (
      <span className="text-xs text-slate-800 dark:text-slate-200">
        {row.description}
      </span>
    ),
  },
  {
    key: "plos",
    header: "Mapped PLOs",
    sortable: true,
    align: "center",
    width: "180px",
    render: (row) => {
      const plos = row.plos
        ? row.plos
            .split(",")
            .map((p) => p.trim())
            .filter(Boolean)
        : [];
      if (plos.length === 0) {
        return <span className="text-[11px] text-slate-400">—</span>;
      }
      return (
        <div className="flex flex-wrap items-center justify-center gap-1">
          {plos.map((plo) => (
            <span
              key={plo}
              className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
              {plo}
            </span>
          ))}
        </div>
      );
    },
  },
];

export const CourseLearningOutcomePage: React.FC = () => {
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
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [isLoadingCourses, setIsLoadingCourses] = useState(false);

  // CLOs
  const [clos, setClos] = useState<CourseLearningOutcome[]>([]);
  const [isLoadingClos, setIsLoadingClos] = useState(false);

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

  // Load versions when program changes
  useEffect(() => {
    setSelectedVersionId("");
    setVersions([]);
    setSelectedCourseId("");
    setCourses([]);
    setClos([]);

    if (!selectedProgramId) return;

    const load = async () => {
      setIsLoadingVersions(true);
      try {
        const list = await getCourseVersions(Number(selectedProgramId));
        setVersions(list);
      } catch (err) {
        toast.error((err as Error).message || "Failed to load versions");
      } finally {
        setIsLoadingVersions(false);
      }
    };
    void load();
  }, [selectedProgramId, toast]);

  // Load courses when version changes
  useEffect(() => {
    setSelectedCourseId("");
    setCourses([]);
    setClos([]);

    if (!selectedProgramId || !selectedVersionId) return;

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
      } finally {
        setIsLoadingCourses(false);
      }
    };
    void load();
  }, [selectedProgramId, selectedVersionId, toast]);

  // Load CLOs when course changes
  useEffect(() => {
    if (!selectedProgramId || !selectedCourseId) {
      setClos([]);
      return;
    }
    const load = async () => {
      setIsLoadingClos(true);
      try {
        const list = await getCLOsByCourse(
          Number(selectedProgramId),
          Number(selectedCourseId),
        );
        setClos(list);
      } catch (err) {
        toast.error((err as Error).message || "Failed to load CLOs");
        setClos([]);
      } finally {
        setIsLoadingClos(false);
      }
    };
    void load();
  }, [selectedProgramId, selectedCourseId, toast]);

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

  const courseOptions: Select2Option[] = useMemo(
    () =>
      courses.map((c) => ({
        value: String(c.id),
        label: c.coursecode,
        description: c.coursename,
        badge: c.coursetype,
      })),
    [courses],
  );

  const handleRefresh = async () => {
    if (!selectedProgramId || !selectedCourseId) return;
    setIsLoadingClos(true);
    try {
      const list = await getCLOsByCourse(
        Number(selectedProgramId),
        Number(selectedCourseId),
      );
      setClos(list);
      toast.success("CLOs refreshed");
    } catch (err) {
      toast.error((err as Error).message || "Failed to refresh");
    } finally {
      setIsLoadingClos(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Course Learning Outcomes
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            View CLOs and their PLO mappings for a course
            {user?.department ? ` · ${user.department}` : ""}
          </p>
        </div>

        <CustomButton
          variant="outline"
          size="sm"
          leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          onClick={handleRefresh}
          disabled={!selectedProgramId || !selectedCourseId || isLoadingClos}
          isLoading={isLoadingClos}>
          Refresh
        </CustomButton>
      </div>

      {/* Filters */}
      <CardBox
        title="Filters"
        subtitle="Choose a program, version, and course"
        icon={<Layers className="w-4 h-4 text-indigo-500" />}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
          />
          <Select2
            label="Course"
            placeholder={
              !selectedVersionId
                ? "Select a version first"
                : isLoadingCourses
                  ? "Loading courses..."
                  : "Select a course"
            }
            options={courseOptions}
            value={selectedCourseId}
            onChange={(v) => setSelectedCourseId(v as string)}
            disabled={
              !selectedVersionId || isLoadingCourses || courses.length === 0
            }
            isSearchable
            isClearable
          />
        </div>
      </CardBox>

      {/* Table or empty state */}
      {selectedCourseId ? (
        <DataTable<CourseLearningOutcome>
          title="Course Learning Outcomes"
          columns={ploColumns}
          data={clos}
          isLoading={isLoadingClos}
          keyField="id"
          selectable={false}
          searchable
          searchPlaceholder="Search by CO code or description..."
          enableExport
          exportFileName="course-learning-outcomes"
          defaultPageSize={10}
          pageSizeOptions={[10, 25, 50]}
          emptyMessage="No CLOs defined for this course."
        />
      ) : (
        <CardBox variant="flat">
          <div className="flex flex-col items-center justify-center py-10 text-center gap-3">
            {isLoadingCourses ? (
              <SpinLoader size="lg" />
            ) : (
              <>
                <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                  <BookOpen className="w-5 h-5" />
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Select a program, version, and course above to view CLOs.
                </p>
              </>
            )}
          </div>
        </CardBox>
      )}
    </div>
  );
};

export default CourseLearningOutcomePage;
