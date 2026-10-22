import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  ChevronDown,
  ChevronRight,
  Layers,
  Link2,
  RefreshCw,
  Search,
} from "lucide-react";
import {
  CardBox,
  CustomButton,
  Select2,
  SpinLoader,
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
  getPrerequisiteCourses,
  type Course,
  type PrerequisiteCourseGroup,
} from "@/services/courseService";

const COURSE_TYPE_STYLES: Record<string, string> = {
  Theory:
    "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300",
  Lab: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300",
};

const TypeChip: React.FC<{ type: string }> = ({ type }) => (
  <span
    className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
      COURSE_TYPE_STYLES[type] ??
      "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
    }`}>
    {type}
  </span>
);

const MetaChip: React.FC<{ children: React.ReactNode; title?: string }> = ({
  children,
  title,
}) => (
  <span
    title={title}
    className="inline-flex items-center gap-1 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-[10px] font-mono tabular-nums text-slate-600 dark:text-slate-300">
    {children}
  </span>
);

export const PrerequisiteCoursePage: React.FC = () => {
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

  // Data
  const [groups, setGroups] = useState<PrerequisiteCourseGroup[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // UI
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());

  const departmentId = user?.tbl_department_id ?? null;

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

  useEffect(() => {
    setSelectedVersionId("");
    setVersions([]);
    setGroups([]);
    setExpandedIds(new Set());
    setSearchQuery("");

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

  useEffect(() => {
    if (!selectedProgramId || !selectedVersionId) {
      setGroups([]);
      return;
    }
    const load = async () => {
      setIsLoading(true);
      try {
        const list = await getPrerequisiteCourses(
          Number(selectedProgramId),
          Number(selectedVersionId),
        );
        setGroups(list);
        setExpandedIds(
          new Set(
            list
              .filter((g) => g.prerequisiteCourse.length > 0)
              .map((g) => g.oCourse.id),
          ),
        );
      } catch (err) {
        toast.error((err as Error).message || "Failed to load prerequisites");
        setGroups([]);
      } finally {
        setIsLoading(false);
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

  const filteredGroups = useMemo(() => {
    if (!searchQuery.trim()) return groups;
    const q = searchQuery.toLowerCase();
    return groups.filter(
      (g) =>
        g.oCourse.coursecode.toLowerCase().includes(q) ||
        g.oCourse.coursename.toLowerCase().includes(q) ||
        g.prerequisiteCourse.some(
          (e) =>
            e.coursecode.toLowerCase().includes(q) ||
            e.coursename.toLowerCase().includes(q),
        ),
    );
  }, [groups, searchQuery]);

  const toggleExpanded = (id: number) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const expandAll = () => {
    setExpandedIds(
      new Set(
        filteredGroups
          .filter((g) => g.prerequisiteCourse.length > 0)
          .map((g) => g.oCourse.id),
      ),
    );
  };

  const collapseAll = () => setExpandedIds(new Set());

  const handleRefresh = async () => {
    if (!selectedProgramId || !selectedVersionId) return;
    setIsLoading(true);
    try {
      const list = await getPrerequisiteCourses(
        Number(selectedProgramId),
        Number(selectedVersionId),
      );
      setGroups(list);
      toast.success("Prerequisite courses refreshed");
    } catch (err) {
      toast.error((err as Error).message || "Failed to refresh");
    } finally {
      setIsLoading(false);
    }
  };

  const totalPrerequisites = useMemo(
    () => groups.reduce((sum, g) => sum + g.prerequisiteCourse.length, 0),
    [groups],
  );

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Prerequisite Courses
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            View prerequisites required before enrolling in each course
            {user?.department ? ` · ${user.department}` : ""}
          </p>
        </div>

        <CustomButton
          variant="outline"
          size="sm"
          leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          onClick={handleRefresh}
          disabled={!selectedProgramId || !selectedVersionId || isLoading}
          isLoading={isLoading}>
          Refresh
        </CustomButton>
      </div>

      {/* Filters */}
      <CardBox
        title="Filters"
        subtitle="Choose a program and version to load prerequisites"
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
        </div>
      </CardBox>

      {/* Main content */}
      {!selectedVersionId ? (
        <CardBox variant="flat">
          <div className="flex flex-col items-center justify-center py-10 text-center gap-3">
            {isLoadingVersions ? (
              <SpinLoader size="lg" />
            ) : (
              <>
                <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                  <Link2 className="w-5 h-5" />
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Select a program and version above to view prerequisites.
                </p>
              </>
            )}
          </div>
        </CardBox>
      ) : (
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs overflow-hidden">
          {/* Toolbar */}
          <div className="p-4 border-b border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3 flex-wrap">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Prerequisite Chain
              </h3>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                {filteredGroups.length} course
                {filteredGroups.length !== 1 && "s"}
              </span>
              {totalPrerequisites > 0 && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300">
                  {totalPrerequisites} prerequisite
                  {totalPrerequisites !== 1 && "s"}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative min-w-[200px]">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search courses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <CustomButton
                variant="outline"
                size="xs"
                onClick={expandAll}
                disabled={filteredGroups.length === 0}>
                Expand All
              </CustomButton>
              <CustomButton
                variant="ghost"
                size="xs"
                onClick={collapseAll}
                disabled={expandedIds.size === 0}>
                Collapse All
              </CustomButton>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <SpinLoader size="lg" />
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Loading prerequisites...
                </p>
              </div>
            ) : filteredGroups.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                  <BookOpen className="w-5 h-5" />
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {groups.length === 0
                    ? "No prerequisite data for this version."
                    : "No courses match your search."}
                </p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    <th className="py-3 px-4 w-10" />
                    <th className="py-3 px-4">Course</th>
                    <th className="py-3 px-4 w-[120px] text-center">Type</th>
                    <th className="py-3 px-4 w-[100px] text-center">Credit</th>
                    <th className="py-3 px-4 text-right">Prerequisites</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-xs text-slate-700 dark:text-slate-300">
                  {filteredGroups.map((group) => {
                    const { oCourse, prerequisiteCourse } = group;
                    const hasPrerequisites = prerequisiteCourse.length > 0;
                    const isExpanded = expandedIds.has(oCourse.id);

                    return (
                      <React.Fragment key={oCourse.id}>
                        {/* Primary row */}
                        <tr
                          className={`transition-colors ${
                            hasPrerequisites
                              ? "cursor-pointer hover:bg-slate-50/60 dark:hover:bg-slate-800/40"
                              : ""
                          } ${isExpanded ? "bg-slate-50/40 dark:bg-slate-800/20" : ""}`}
                          onClick={() =>
                            hasPrerequisites && toggleExpanded(oCourse.id)
                          }>
                          <td className="py-3 px-4 align-top">
                            {hasPrerequisites ? (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleExpanded(oCourse.id);
                                }}
                                aria-label={isExpanded ? "Collapse" : "Expand"}
                                className="p-1 rounded text-slate-500 hover:text-slate-800 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                                {isExpanded ? (
                                  <ChevronDown className="w-4 h-4" />
                                ) : (
                                  <ChevronRight className="w-4 h-4" />
                                )}
                              </button>
                            ) : (
                              <span className="inline-block w-6" />
                            )}
                          </td>

                          <td className="py-3 px-4">
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-mono text-[11px] font-semibold text-slate-900 dark:text-slate-100">
                                  {oCourse.coursecode}
                                </span>
                                {oCourse.shortname && (
                                  <span className="text-[10px] font-medium text-slate-400">
                                    ({oCourse.shortname})
                                  </span>
                                )}
                              </div>
                              <span className="text-xs font-medium text-slate-800 dark:text-slate-200">
                                {oCourse.coursename}
                              </span>
                              <div className="flex flex-wrap items-center gap-1.5 mt-1">
                                <MetaChip title="Course ID">
                                  #{oCourse.id}
                                </MetaChip>
                                <MetaChip title="Semester">
                                  Sem {oCourse.ex_semester}
                                </MetaChip>
                                {oCourse.course_hr && (
                                  <MetaChip title="Contact hours">
                                    {oCourse.course_hr} hr
                                  </MetaChip>
                                )}
                              </div>
                            </div>
                          </td>

                          <td className="py-3 px-4 text-center align-top">
                            <TypeChip type={oCourse.coursetype} />
                          </td>

                          <td className="py-3 px-4 text-center align-top">
                            <span className="font-mono tabular-nums font-medium text-slate-800 dark:text-slate-200">
                              {oCourse.coursecredit}
                            </span>
                          </td>

                          <td className="py-3 px-4 text-right align-top">
                            {hasPrerequisites ? (
                              <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                                {prerequisiteCourse.length} prerequisite
                                {prerequisiteCourse.length !== 1 && "s"}
                              </span>
                            ) : (
                              <span className="text-[11px] text-slate-400">
                                —
                              </span>
                            )}
                          </td>
                        </tr>

                        {/* Prerequisite rows */}
                        {hasPrerequisites && isExpanded && (
                          <tr>
                            <td
                              colSpan={5}
                              className="px-4 py-0 bg-slate-50/40 dark:bg-slate-900/60">
                              <div className="py-3 pl-14 pr-4">
                                <div className="relative">
                                  <div className="absolute left-0 top-0 bottom-0 w-px bg-slate-200 dark:bg-slate-700" />

                                  <div className="space-y-2">
                                    {prerequisiteCourse.map((pre) => (
                                      <div
                                        key={pre.id}
                                        className="relative flex items-start gap-3 pl-4">
                                        <div className="absolute left-0 top-5 w-4 h-px bg-slate-200 dark:bg-slate-700" />

                                        <div className="flex-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                          <div className="flex flex-col gap-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                              <ArrowRight className="w-3 h-3 text-amber-500 shrink-0" />
                                              <span className="font-mono text-[11px] font-semibold text-slate-900 dark:text-slate-100">
                                                {pre.coursecode}
                                              </span>
                                              {pre.shortname && (
                                                <span className="text-[10px] font-medium text-slate-400">
                                                  ({pre.shortname})
                                                </span>
                                              )}
                                              <TypeChip type={pre.coursetype} />
                                            </div>
                                            <span className="text-xs text-slate-700 dark:text-slate-300">
                                              {pre.coursename}
                                            </span>
                                            <div className="flex flex-wrap items-center gap-1.5 mt-1">
                                              <MetaChip title="Course ID">
                                                #{pre.id}
                                              </MetaChip>
                                              <MetaChip title="Credit">
                                                {pre.coursecredit} cr
                                              </MetaChip>
                                              <MetaChip title="Semester">
                                                Sem {pre.ex_semester}
                                              </MetaChip>
                                              {pre.course_hr && (
                                                <MetaChip title="Contact hours">
                                                  {pre.course_hr} hr
                                                </MetaChip>
                                              )}
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* Footer summary */}
          {!isLoading && filteredGroups.length > 0 && (
            <div className="p-3.5 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/40 dark:bg-slate-900/40 text-[11px] text-slate-500 dark:text-slate-400 font-mono tabular-nums">
              Showing {filteredGroups.length} course
              {filteredGroups.length !== 1 && "s"} · {totalPrerequisites} total
              prerequisite{totalPrerequisites !== 1 && "s"}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PrerequisiteCoursePage;
