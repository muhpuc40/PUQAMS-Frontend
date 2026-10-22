import React, { useEffect, useMemo, useState } from "react";
import { FunctionSquare, Layers, RefreshCw, Target } from "lucide-react";
import {
  CardBox,
  CustomButton,
  DataTable,
  Modal,
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
  getVersionWisePLOs,
  type ProgramLearningOutcome,
} from "@/services/courseService";

export const ProgramLearningOutcomePage: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [programs, setPrograms] = useState<Program[]>([]);
  const [selectedProgramId, setSelectedProgramId] = useState("");
  const [isLoadingPrograms, setIsLoadingPrograms] = useState(true);

  const [versions, setVersions] = useState<CourseVersion[]>([]);
  const [selectedVersionId, setSelectedVersionId] = useState("");
  const [isLoadingVersions, setIsLoadingVersions] = useState(false);

  const [plos, setPlos] = useState<ProgramLearningOutcome[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Attainment equation modal state
  const [equationModalOpen, setEquationModalOpen] = useState(false);
  const [activePlo, setActivePlo] = useState<ProgramLearningOutcome | null>(
    null,
  );

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
    setPlos([]);

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
      setPlos([]);
      return;
    }
    const load = async () => {
      setIsLoading(true);
      try {
        const list = await getVersionWisePLOs(
          Number(selectedProgramId),
          Number(selectedVersionId),
        );
        setPlos(list);
      } catch (err) {
        toast.error((err as Error).message || "Failed to load PLOs");
        setPlos([]);
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

  const handleRefresh = async () => {
    if (!selectedProgramId || !selectedVersionId) return;
    setIsLoading(true);
    try {
      const list = await getVersionWisePLOs(
        Number(selectedProgramId),
        Number(selectedVersionId),
      );
      setPlos(list);
      toast.success("PLOs refreshed");
    } catch (err) {
      toast.error((err as Error).message || "Failed to refresh");
    } finally {
      setIsLoading(false);
    }
  };

  const openEquationModal = (plo: ProgramLearningOutcome) => {
    setActivePlo(plo);
    setEquationModalOpen(true);
  };

  const closeEquationModal = () => {
    setEquationModalOpen(false);
    setActivePlo(null);
  };

  const ploColumns: Column<ProgramLearningOutcome>[] = useMemo(
    () => [
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
        key: "plo_shortname",
        header: "PLO",
        sortable: true,
        width: "110px",
        render: (row) => (
          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
            <Target className="w-3 h-3" />
            {row.plo_shortname}
          </span>
        ),
      },
      {
        key: "plo_description",
        header: "Description",
        sortable: true,
        render: (row) => (
          <span className="text-xs text-slate-800 dark:text-slate-200">
            {row.plo_description}
          </span>
        ),
      },
      {
        key: "status",
        header: "Status",
        sortable: true,
        align: "center",
        width: "110px",
        render: (row) => {
          const isActive = row.status?.toLowerCase() === "active";
          return (
            <span
              className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                isActive
                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400"
                  : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
              }`}>
              {row.status}
            </span>
          );
        },
      },
      {
        key: "attainment_equation",
        header: "Actions",
        align: "center",
        width: "140px",
        render: (row) => {
          const hasEquation = !!row.attainment_equation?.trim();
          return (
            <CustomButton
              variant="outline"
              size="xs"
              leftIcon={<FunctionSquare className="w-3 h-3" />}
              onClick={() => openEquationModal(row)}
              disabled={!hasEquation}
              title={
                hasEquation
                  ? "View attainment equation"
                  : "No attainment equation defined"
              }>
              Equation
            </CustomButton>
          );
        },
      },
    ],
    [],
  );

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Program Learning Outcomes
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            View PLOs defined for a program version
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
        subtitle="Choose a program and version to load PLOs"
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

      {/* Table or empty state */}
      {selectedVersionId ? (
        <DataTable<ProgramLearningOutcome>
          title="Program Learning Outcomes"
          columns={ploColumns}
          data={plos}
          isLoading={isLoading}
          keyField="id"
          selectable={false}
          searchable
          searchPlaceholder="Search by PLO code or description..."
          enableExport
          exportFileName="program-learning-outcomes"
          defaultPageSize={10}
          pageSizeOptions={[10, 25, 50]}
          emptyMessage="No PLOs defined for this program version."
        />
      ) : (
        <CardBox variant="flat">
          <div className="flex flex-col items-center justify-center py-10 text-center gap-3">
            {isLoadingVersions ? (
              <SpinLoader size="lg" />
            ) : (
              <>
                <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                  <Target className="w-5 h-5" />
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Select a program and version above to view PLOs.
                </p>
              </>
            )}
          </div>
        </CardBox>
      )}

      {/* Attainment Equation Modal */}
      <Modal
        isOpen={equationModalOpen}
        onClose={closeEquationModal}
        size="md"
        title={
          activePlo
            ? `Attainment Equation · ${activePlo.plo_shortname}`
            : "Attainment Equation"
        }
        description={activePlo ? activePlo.plo_description : undefined}
        footer={
          <CustomButton
            variant="outline"
            size="sm"
            onClick={closeEquationModal}>
            Close
          </CustomButton>
        }>
        {activePlo && (
          <div className="space-y-4">
            {/* PLO Meta */}
            <div className="flex flex-wrap items-center gap-2 text-[11px]">
              <span className="inline-flex items-center gap-1.5 font-semibold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
                <Target className="w-3 h-3" />
                {activePlo.plo_shortname}
              </span>
              <span className="font-mono text-slate-500 dark:text-slate-400">
                #{activePlo.id}
              </span>
              <span
                className={`font-semibold px-2 py-0.5 rounded ${
                  activePlo.status?.toLowerCase() === "active"
                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400"
                    : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                }`}>
                {activePlo.status}
              </span>
            </div>

            {/* Equation */}
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Attainment Equation
              </p>
              {activePlo.attainment_equation?.trim() ? (
                <pre className="whitespace-pre-wrap break-words rounded-lg bg-slate-100 dark:bg-slate-800 p-3 text-xs font-mono text-slate-800 dark:text-slate-200 leading-relaxed">
                  {activePlo.attainment_equation}
                </pre>
              ) : (
                <p className="text-xs text-slate-500 dark:text-slate-400 italic">
                  No attainment equation defined for this PLO.
                </p>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ProgramLearningOutcomePage;
