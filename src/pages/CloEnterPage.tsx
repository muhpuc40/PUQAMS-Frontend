import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  AlertTriangle,
  ArrowLeft,
  ClipboardList,
  Lock,
  Pencil,
  Plus,
  RefreshCw,
  Target,
  Trash2,
  X,
} from "lucide-react";
import {
  CardBox,
  ConfirmModal,
  CustomButton,
  Modal,
  SelectInput,
  SpinLoader,
  TextInput,
  type SelectOption,
} from "@/components/ui";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import {
  getSessionCourse,
  type SessionCourse,
} from "@/services/sessionCourseService";
import {
  addQuestion,
  createAssessment,
  deleteAssessment,
  deleteQuestion,
  getAssessments,
  getSectionClos,
  syncSectionClos,
  updateAssessment,
  updateQuestion,
  type Assessment,
  type AssessmentCategory,
  type AssessmentQuestion,
  type QuestionInput,
  type SectionAssessments,
  type SectionClo,
  type StructureResult,
} from "@/services/cloEnterService";

/* ═══════════════════════════════════════════════════════════════
   Draft model (form state) + helpers
   ═══════════════════════════════════════════════════════════════ */

interface DraftClo {
  key: number;
  cloId: string; // section CLO id as string ("" = not chosen)
  marks: string;
}

interface DraftQuestion {
  key: number;
  questionNo: string;
  clos: DraftClo[];
}

let keySeed = 1;
const nextKey = () => keySeed++;

const emptyClo = (): DraftClo => ({ key: nextKey(), cloId: "", marks: "" });

const emptyQuestion = (questionNo = ""): DraftQuestion => ({
  key: nextKey(),
  questionNo,
  clos: [emptyClo()],
});

const draftFromQuestion = (q: AssessmentQuestion): DraftQuestion => ({
  key: nextKey(),
  questionNo: q.original_question_no,
  clos: q.clos.map((c) => ({
    key: nextKey(),
    cloId: String(c.tbl_sessioncourse_clo_id),
    marks: String(Number(c.max_marks)),
  })),
});

const questionTotal = (q: DraftQuestion) =>
  q.clos.reduce((s, c) => s + (parseFloat(c.marks) || 0), 0);

const fmt = (n: number) => String(Number(Number(n).toFixed(2)));

// Mirrors the API rules so most mistakes are caught before the request.
const validateDrafts = (questions: DraftQuestion[]): string | null => {
  if (questions.length === 0) return "Add at least one question.";
  const seen = new Set<string>();
  for (const q of questions) {
    const no = q.questionNo.trim();
    if (!no) return "Every question needs a question number.";
    if (no.length > 20) return `Question "${no}": number is too long (max 20).`;
    if (seen.has(no.toLowerCase())) return `Question number "${no}" is repeated.`;
    seen.add(no.toLowerCase());
    if (q.clos.length === 0) return `Question "${no}": add at least one CLO.`;
    const cloSeen = new Set<string>();
    for (const c of q.clos) {
      if (!c.cloId) return `Question "${no}": choose a CLO for every row.`;
      if (cloSeen.has(c.cloId)) return `Question "${no}": the same CLO is listed twice.`;
      cloSeen.add(c.cloId);
      const m = parseFloat(c.marks);
      if (!(m > 0) || m > 999) return `Question "${no}": marks must be between 0 and 999.`;
    }
  }
  return null;
};

const toInput = (q: DraftQuestion): QuestionInput => ({
  question_no: q.questionNo.trim(),
  clos: q.clos.map((c) => ({
    sessioncourse_clo_id: Number(c.cloId),
    marks: parseFloat(c.marks),
  })),
});

const cloLabel = (c: SectionClo) =>
  c.plosname ? `${c.course_outcome} (${c.plosname})` : c.course_outcome;

/* ═══════════════════════════════════════════════════════════════
   Small UI pieces
   ═══════════════════════════════════════════════════════════════ */

const Chip: React.FC<{
  tone?: "slate" | "indigo" | "emerald" | "amber" | "rose" | "sky";
  children: React.ReactNode;
  className?: string;
}> = ({ tone = "slate", children, className = "" }) => {
  const tones = {
    slate: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
    indigo: "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300",
    emerald: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400",
    amber: "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300",
    rose: "bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300",
    sky: "bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300",
  };
  return (
    <span
      className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded ${tones[tone]} ${className}`}>
      {children}
    </span>
  );
};

const IconButton: React.FC<{
  title: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
  children: React.ReactNode;
}> = ({ title, onClick, disabled, danger, children }) => (
  <button
    type="button"
    title={title}
    aria-label={title}
    onClick={onClick}
    disabled={disabled}
    className={`p-1.5 rounded-md transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
      danger
        ? "text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"
        : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
    }`}>
    {children}
  </button>
);

/* ─── Question editor (shared by both modals) ─────────────────── */

const QuestionEditor: React.FC<{
  question: DraftQuestion;
  index: number;
  cloOptions: SelectOption[];
  onChange: (q: DraftQuestion) => void;
  onRemove?: () => void;
}> = ({ question, index, cloOptions, onChange, onRemove }) => {
  const setClo = (key: number, patch: Partial<DraftClo>) =>
    onChange({
      ...question,
      clos: question.clos.map((c) => (c.key === key ? { ...c, ...patch } : c)),
    });

  return (
    <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-3 space-y-3">
      <div className="flex items-end gap-3">
        <div className="w-36">
          <TextInput
            label="Question No"
            size="sm"
            value={question.questionNo}
            placeholder={`e.g. ${index + 1}a`}
            onChange={(e) => onChange({ ...question, questionNo: e.target.value })}
          />
        </div>
        <div className="flex-1 text-right text-xs text-slate-500 dark:text-slate-400 pb-2">
          Question total:{" "}
          <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
            {fmt(questionTotal(question))}
          </span>
        </div>
        {onRemove && (
          <div className="pb-1">
            <IconButton title="Remove question" onClick={onRemove} danger>
              <Trash2 className="w-4 h-4" />
            </IconButton>
          </div>
        )}
      </div>

      <div className="space-y-2">
        {question.clos.map((c) => (
          <div key={c.key} className="flex items-center gap-2">
            <div className="flex-1">
              <SelectInput
                size="sm"
                value={c.cloId}
                onChange={(e) => setClo(c.key, { cloId: e.target.value })}
                placeholder="Select CLO"
                options={cloOptions}
              />
            </div>
            <div className="w-28">
              <TextInput
                size="sm"
                type="number"
                min="0"
                step="0.5"
                value={c.marks}
                placeholder="Marks"
                onChange={(e) => setClo(c.key, { marks: e.target.value })}
              />
            </div>
            <IconButton
              title="Remove CLO"
              danger
              disabled={question.clos.length === 1}
              onClick={() =>
                onChange({
                  ...question,
                  clos: question.clos.filter((x) => x.key !== c.key),
                })
              }>
              <X className="w-4 h-4" />
            </IconButton>
          </div>
        ))}
      </div>

      <CustomButton
        variant="ghost"
        size="xs"
        leftIcon={<Plus className="w-3.5 h-3.5" />}
        onClick={() => onChange({ ...question, clos: [...question.clos, emptyClo()] })}>
        Add CLO
      </CustomButton>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   Page
   ═══════════════════════════════════════════════════════════════ */

type AssessmentModalState =
  | { mode: "create"; categoryId: string }
  | { mode: "edit"; assessment: Assessment }
  | null;

type QuestionModalState =
  | { mode: "add"; assessment: Assessment }
  | { mode: "edit"; assessment: Assessment; question: AssessmentQuestion }
  | null;

type ConfirmState =
  | { kind: "assessment"; assessment: Assessment }
  | { kind: "question"; question: AssessmentQuestion }
  | null;

export const CloEnterPage: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const sessionCourseId = Number(params.get("sessioncourse_id")) || 0;
  const teacherId = user?.id ?? 0;

  const [section, setSection] = useState<SessionCourse | null>(null);
  const [clos, setClos] = useState<SectionClo[]>([]);
  const [tree, setTree] = useState<SectionAssessments | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);

  // Modals
  const [assessmentModal, setAssessmentModal] = useState<AssessmentModalState>(null);
  const [examName, setExamName] = useState("");
  const [totalMark, setTotalMark] = useState("");
  const [draftQuestions, setDraftQuestions] = useState<DraftQuestion[]>([]);
  const [questionModal, setQuestionModal] = useState<QuestionModalState>(null);
  const [draftQuestion, setDraftQuestion] = useState<DraftQuestion>(emptyQuestion());
  const [confirm, setConfirm] = useState<ConfirmState>(null);
  const [isSaving, setIsSaving] = useState(false);

  const editable = tree?.is_editable === 1;

  /* ─── Loading ──────────────────────────────────────────────── */

  const loadAll = useCallback(
    async (showToast = false) => {
      if (!sessionCourseId || !teacherId) return;
      setIsLoading(true);
      setLoadError("");
      try {
        // Structure first: it also checks the section belongs to this teacher.
        const structure = await getAssessments(sessionCourseId, teacherId);
        const [cloList, info] = await Promise.all([
          getSectionClos(sessionCourseId, teacherId),
          getSessionCourse(sessionCourseId).catch(() => null),
        ]);
        setTree(structure);
        setClos(cloList);
        setSection(info);
        if (showToast) toast.success("CLO entry refreshed");
      } catch (err) {
        setLoadError((err as Error).message || "Failed to load CLO entry");
      } finally {
        setIsLoading(false);
      }
    },
    [sessionCourseId, teacherId, toast],
  );

  useEffect(() => {
    void loadAll();
  }, [loadAll]);

  // After every write: take the returned structure, refresh "in use" on CLOs.
  const applyResult = async (result: StructureResult, successText: string) => {
    setTree(result.data);
    if (result.message && result.message !== "Success" && result.message.startsWith("Success.")) {
      toast.warning(result.message.replace(/^Success\.\s*/, ""));
    } else {
      toast.success(successText);
    }
    try {
      setClos(await getSectionClos(sessionCourseId, teacherId));
    } catch {
      /* non-critical */
    }
  };

  /* ─── Options ──────────────────────────────────────────────── */

  const activeCloOptions: SelectOption[] = useMemo(
    () =>
      clos
        .filter((c) => c.status === "Active")
        .map((c) => ({ value: String(c.id), label: cloLabel(c) })),
    [clos],
  );

  // When editing, CLOs already on the question stay selectable even if inactive.
  const questionCloOptions: SelectOption[] = useMemo(() => {
    if (questionModal?.mode !== "edit") return activeCloOptions;
    const used = new Set(
      questionModal.question.clos.map((c) => c.tbl_sessioncourse_clo_id),
    );
    return clos
      .filter((c) => c.status === "Active" || used.has(c.id))
      .map((c) => ({
        value: String(c.id),
        label: c.status === "Active" ? cloLabel(c) : `${cloLabel(c)} — inactive`,
      }));
  }, [questionModal, clos, activeCloOptions]);

  const categoryOptions: SelectOption[] = useMemo(
    () =>
      (tree?.categories ?? []).map((c) => ({
        value: String(c.id),
        label: `${c.display_name} (Max: ${c.max_mark})`,
      })),
    [tree],
  );

  /* ─── Assessment modal ─────────────────────────────────────── */

  const openCreate = (category?: AssessmentCategory) => {
    if (activeCloOptions.length === 0) {
      toast.error("This section has no active CLOs. Add CLOs to the course first.");
      return;
    }
    setExamName("");
    setTotalMark("");
    setDraftQuestions([emptyQuestion("1")]);
    setAssessmentModal({ mode: "create", categoryId: category ? String(category.id) : "" });
  };

  const openEditAssessment = (assessment: Assessment) => {
    setExamName(assessment.exam);
    setTotalMark(String(Number(assessment.totalMark)));
    setAssessmentModal({ mode: "edit", assessment });
  };

  const submitAssessment = async () => {
    if (!assessmentModal) return;
    const name = examName.trim();
    const total = parseFloat(totalMark);
    if (!name) return toast.error("Exam name is required.");
    if (!(total > 0) || total > 999) return toast.error("Total marks must be between 0 and 999.");

    setIsSaving(true);
    try {
      if (assessmentModal.mode === "create") {
        if (!assessmentModal.categoryId) {
          toast.error("Choose a marks distribution category.");
          return;
        }
        const problem = validateDrafts(draftQuestions);
        if (problem) {
          toast.error(problem);
          return;
        }
        const res = await createAssessment({
          teacher_id: teacherId,
          sessioncourse_id: sessionCourseId,
          mdr_detail_id: Number(assessmentModal.categoryId),
          exam_name: name,
          total_mark: total,
          questions: draftQuestions.map(toInput),
        });
        await applyResult(res, `"${name}" created`);
      } else {
        const res = await updateAssessment({
          teacher_id: teacherId,
          assessment_id: assessmentModal.assessment.id,
          exam_name: name,
          total_mark: total,
        });
        await applyResult(res, `"${name}" updated`);
      }
      setAssessmentModal(null);
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setIsSaving(false);
    }
  };

  /* ─── Question modal ───────────────────────────────────────── */

  const openAddQuestion = (assessment: Assessment) => {
    if (activeCloOptions.length === 0) {
      toast.error("This section has no active CLOs. Add CLOs to the course first.");
      return;
    }
    setDraftQuestion(emptyQuestion(String(assessment.questions.length + 1)));
    setQuestionModal({ mode: "add", assessment });
  };

  const openEditQuestion = (assessment: Assessment, question: AssessmentQuestion) => {
    setDraftQuestion(draftFromQuestion(question));
    setQuestionModal({ mode: "edit", assessment, question });
  };

  const submitQuestion = async () => {
    if (!questionModal) return;
    const problem = validateDrafts([draftQuestion]);
    if (problem) return toast.error(problem);

    const input = toInput(draftQuestion);
    setIsSaving(true);
    try {
      const res =
        questionModal.mode === "add"
          ? await addQuestion({
              teacher_id: teacherId,
              assessment_id: questionModal.assessment.id,
              ...input,
            })
          : await updateQuestion({
              teacher_id: teacherId,
              question_id: questionModal.question.id,
              ...input,
            });
      await applyResult(
        res,
        `Question ${input.question_no} ${questionModal.mode === "add" ? "added" : "updated"}`,
      );
      setQuestionModal(null);
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setIsSaving(false);
    }
  };

  /* ─── Delete ───────────────────────────────────────────────── */

  const confirmDelete = async () => {
    if (!confirm) return;
    setIsSaving(true);
    try {
      if (confirm.kind === "assessment") {
        const res = await deleteAssessment(confirm.assessment.id, teacherId);
        await applyResult(res, `"${confirm.assessment.exam}" deleted`);
      } else {
        const res = await deleteQuestion(confirm.question.id, teacherId);
        await applyResult(res, `Question ${confirm.question.original_question_no} deleted`);
      }
      setConfirm(null);
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setIsSaving(false);
    }
  };

  /* ─── CLO re-sync ──────────────────────────────────────────── */

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      setClos(await syncSectionClos(sessionCourseId, teacherId));
      toast.success("CLOs re-synced from the course");
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setIsSyncing(false);
    }
  };

  /* ─── Render ───────────────────────────────────────────────── */

  const backButton = (
    <CustomButton
      variant="outline"
      size="sm"
      leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}
      onClick={() => navigate("/my-courses")}>
      My Courses
    </CustomButton>
  );

  if (!sessionCourseId) {
    return (
      <CardBox variant="flat">
        <div className="flex flex-col items-center py-10 gap-3 text-center">
          <p className="text-xs text-slate-500">No section selected.</p>
          {backButton}
        </div>
      </CardBox>
    );
  }

  if (isLoading && !tree) {
    return (
      <div className="flex justify-center py-20">
        <SpinLoader size="lg" />
      </div>
    );
  }

  if (loadError) {
    return (
      <CardBox variant="flat">
        <div className="flex flex-col items-center py-10 gap-3 text-center">
          <AlertTriangle className="w-6 h-6 text-amber-500" />
          <p className="text-xs text-slate-600 dark:text-slate-300">{loadError}</p>
          {backButton}
        </div>
      </CardBox>
    );
  }

  const totalExams = tree?.categories.reduce((s, c) => s + c.exams.length, 0) ?? 0;
  const assessmentTotal =
    assessmentModal?.mode === "create"
      ? draftQuestions.reduce((s, q) => s + questionTotal(q), 0)
      : 0;

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-slate-800">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            CLO Entry{section ? ` · ${section.coursename}` : ""}
          </h1>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            {section && (
              <>
                <Chip tone="indigo">{section.coursecode}</Chip>
                <Chip tone="indigo">Section {section.section}</Chip>
                <Chip>{section.sessionname}</Chip>
                <Chip tone={section.coursetype === "Lab" ? "amber" : "sky"}>
                  {section.coursetype}
                </Chip>
              </>
            )}
            {tree && <Chip>MD Rule: {tree.rulename}</Chip>}
            {!editable && (
              <Chip tone="rose">
                <Lock className="w-3 h-3" /> Session not running — read only
              </Chip>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {backButton}
          <CustomButton
            variant="outline"
            size="sm"
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
            onClick={() => void loadAll(true)}
            isLoading={isLoading}>
            Refresh
          </CustomButton>
          {editable && (
            <CustomButton
              size="sm"
              leftIcon={<Plus className="w-3.5 h-3.5" />}
              onClick={() => openCreate()}>
              Create Assessment
            </CustomButton>
          )}
        </div>
      </div>

      {/* Section CLOs */}
      <CardBox
        title="Section CLOs"
        subtitle="Course outcomes available to tag questions with"
        icon={<Target className="w-4 h-4 text-emerald-500" />}
        headerAction={
          editable && (
            <CustomButton
              variant="outline"
              size="xs"
              leftIcon={<RefreshCw className="w-3 h-3" />}
              onClick={() => void handleSync()}
              isLoading={isSyncing}>
              Re-sync from course
            </CustomButton>
          )
        }>
        {clos.length === 0 ? (
          <p className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            This course has no CLOs yet. CLOs must be added to the course before
            questions can be tagged.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left text-[10px] uppercase tracking-wide text-slate-400 border-b border-slate-100 dark:border-slate-800">
                  <th className="py-2 pr-3 font-semibold w-16">CLO</th>
                  <th className="py-2 pr-3 font-semibold w-32">PLOs</th>
                  <th className="py-2 pr-3 font-semibold">Description</th>
                  <th className="py-2 font-semibold w-28 text-right">Status</th>
                </tr>
              </thead>
              <tbody>
                {clos.map((c) => (
                  <tr
                    key={c.id}
                    className="border-b last:border-0 border-slate-100 dark:border-slate-800/70">
                    <td className="py-2 pr-3 font-semibold text-slate-900 dark:text-slate-100">
                      {c.course_outcome}
                    </td>
                    <td className="py-2 pr-3 font-mono text-[11px] text-slate-600 dark:text-slate-300">
                      {c.plosname || "—"}
                    </td>
                    <td className="py-2 pr-3 text-slate-600 dark:text-slate-300">
                      {c.description}
                    </td>
                    <td className="py-2 text-right space-x-1 whitespace-nowrap">
                      {c.in_use === 1 && <Chip tone="emerald">In use</Chip>}
                      {c.status !== "Active" && <Chip tone="rose">Inactive</Chip>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardBox>

      {/* Categories */}
      {tree?.categories.map((category) => (
        <CardBox
          key={category.id}
          title={category.display_name}
          subtitle={`${category.tbl_sessioncourse_column} · MDR max ${category.max_mark} · ${category.exams.length} exam${category.exams.length === 1 ? "" : "s"}`}
          icon={<ClipboardList className="w-4 h-4 text-indigo-500" />}
          headerAction={
            editable && (
              <CustomButton
                variant="outline"
                size="xs"
                leftIcon={<Plus className="w-3 h-3" />}
                onClick={() => openCreate(category)}>
                Add exam
              </CustomButton>
            )
          }>
          {category.exams.length === 0 ? (
            <p className="text-xs text-slate-400">No exams declared in this category yet.</p>
          ) : (
            <div className="space-y-4">
              {category.exams.map((exam) => {
                const over = Number(exam.question_marks) > Number(exam.totalMark);
                return (
                  <div
                    key={exam.id}
                    className="rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
                    {/* Exam header */}
                    <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 bg-slate-50/80 dark:bg-slate-800/40">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                          {exam.exam}
                        </span>
                        <Chip tone="indigo">Total {fmt(exam.totalMark)}</Chip>
                        <Chip tone={over ? "amber" : "emerald"}>
                          Questions {fmt(exam.question_marks)}
                        </Chip>
                        {over && (
                          <span className="text-[10px] text-amber-600 dark:text-amber-400">
                            includes optional questions
                          </span>
                        )}
                        {exam.is_locked === 1 && (
                          <Chip tone="rose">
                            <Lock className="w-3 h-3" /> Has locked questions
                          </Chip>
                        )}
                      </div>
                      {editable && (
                        <div className="flex items-center gap-1">
                          <CustomButton
                            variant="ghost"
                            size="xs"
                            leftIcon={<Plus className="w-3 h-3" />}
                            onClick={() => openAddQuestion(exam)}>
                            Question
                          </CustomButton>
                          <IconButton
                            title={exam.is_locked ? "Locked questions — cannot edit exam" : "Edit exam"}
                            disabled={exam.is_locked === 1}
                            onClick={() => openEditAssessment(exam)}>
                            <Pencil className="w-3.5 h-3.5" />
                          </IconButton>
                          <IconButton
                            title={exam.is_locked ? "Locked questions — cannot delete exam" : "Delete exam"}
                            danger
                            disabled={exam.is_locked === 1}
                            onClick={() => setConfirm({ kind: "assessment", assessment: exam })}>
                            <Trash2 className="w-3.5 h-3.5" />
                          </IconButton>
                        </div>
                      )}
                    </div>

                    {/* Questions */}
                    {exam.questions.length === 0 ? (
                      <p className="px-4 py-3 text-xs text-slate-400">No questions yet.</p>
                    ) : (
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="text-left text-[10px] uppercase tracking-wide text-slate-400 border-b border-slate-100 dark:border-slate-800">
                            <th className="py-2 px-4 font-semibold w-24">Question</th>
                            <th className="py-2 pr-3 font-semibold">CLO · Marks</th>
                            <th className="py-2 pr-3 font-semibold w-20 text-center">Marks</th>
                            <th className="py-2 pr-4 font-semibold w-28 text-right"></th>
                          </tr>
                        </thead>
                        <tbody>
                          {exam.questions.map((q) => (
                            <tr
                              key={q.id}
                              className="border-b last:border-0 border-slate-100 dark:border-slate-800/70">
                              <td className="py-2 px-4 font-semibold text-slate-900 dark:text-slate-100">
                                {q.original_question_no}
                              </td>
                              <td className="py-2 pr-3">
                                <div className="flex flex-wrap gap-1">
                                  {q.clos.map((c) => (
                                    <Chip key={c.id} tone="sky">
                                      {c.clo}
                                      <span className="font-mono text-sky-900 dark:text-sky-100">
                                        · {fmt(c.max_marks)}
                                      </span>
                                    </Chip>
                                  ))}
                                </div>
                              </td>
                              <td className="py-2 pr-3 text-center font-mono font-semibold text-slate-800 dark:text-slate-200">
                                {fmt(q.max_marks)}
                              </td>
                              <td className="py-2 pr-4 text-right">
                                {q.is_locked === 1 ? (
                                  <Chip tone="rose">
                                    <Lock className="w-3 h-3" /> Locked
                                  </Chip>
                                ) : (
                                  editable && (
                                    <div className="inline-flex items-center gap-1">
                                      <IconButton
                                        title="Edit question"
                                        onClick={() => openEditQuestion(exam, q)}>
                                        <Pencil className="w-3.5 h-3.5" />
                                      </IconButton>
                                      <IconButton
                                        title="Delete question"
                                        danger
                                        onClick={() => setConfirm({ kind: "question", question: q })}>
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </IconButton>
                                    </div>
                                  )
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardBox>
      ))}

      {totalExams === 0 && editable && (
        <p className="text-center text-xs text-slate-400">
          Start with <span className="font-semibold">Create Assessment</span> — pick a category,
          name the exam, then add its questions with CLOs and marks.
        </p>
      )}

      {/* ─── Create / edit assessment modal ─── */}
      <Modal
        isOpen={assessmentModal !== null}
        onClose={() => !isSaving && setAssessmentModal(null)}
        size={assessmentModal?.mode === "create" ? "xl" : "md"}
        title={assessmentModal?.mode === "create" ? "Create Assessment" : "Edit Exam"}
        description={
          assessmentModal?.mode === "create"
            ? "Choose a category, name the exam, then add questions with their CLOs and marks."
            : "Rename the exam or change its total marks."
        }
        footer={
          <>
            <CustomButton
              variant="outline"
              size="sm"
              onClick={() => setAssessmentModal(null)}
              disabled={isSaving}>
              Cancel
            </CustomButton>
            <CustomButton size="sm" onClick={() => void submitAssessment()} isLoading={isSaving}>
              {assessmentModal?.mode === "create" ? "Create" : "Save"}
            </CustomButton>
          </>
        }>
        {assessmentModal && (
          <div className="space-y-4">
            {assessmentModal.mode === "create" && (
              <SelectInput
                label="Marks Distribution Category"
                value={assessmentModal.categoryId}
                placeholder="Select category"
                options={categoryOptions}
                onChange={(e) =>
                  setAssessmentModal({ mode: "create", categoryId: e.target.value })
                }
              />
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <TextInput
                label="Exam / Task Name"
                value={examName}
                placeholder="e.g. Mid Term, CT1, Assignment 1"
                onChange={(e) => setExamName(e.target.value)}
              />
              <TextInput
                label="Total Marks"
                type="number"
                min="0"
                value={totalMark}
                placeholder="e.g. 30"
                onChange={(e) => setTotalMark(e.target.value)}
              />
            </div>

            {assessmentModal.mode === "create" && (
              <>
                <div className="space-y-3">
                  {draftQuestions.map((q, i) => (
                    <QuestionEditor
                      key={q.key}
                      question={q}
                      index={i}
                      cloOptions={activeCloOptions}
                      onChange={(next) =>
                        setDraftQuestions((list) =>
                          list.map((x) => (x.key === q.key ? next : x)),
                        )
                      }
                      onRemove={
                        draftQuestions.length > 1
                          ? () =>
                              setDraftQuestions((list) => list.filter((x) => x.key !== q.key))
                          : undefined
                      }
                    />
                  ))}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3">
                  <CustomButton
                    variant="outline"
                    size="sm"
                    leftIcon={<Plus className="w-3.5 h-3.5" />}
                    onClick={() =>
                      setDraftQuestions((list) => [
                        ...list,
                        emptyQuestion(String(list.length + 1)),
                      ])
                    }>
                    Add Question
                  </CustomButton>
                  <div className="text-xs text-slate-600 dark:text-slate-300">
                    Total question marks:{" "}
                    <span className="font-mono font-semibold">{fmt(assessmentTotal)}</span>
                    {totalMark && (
                      <>
                        {" "}/ target <span className="font-mono font-semibold">{totalMark}</span>
                      </>
                    )}
                    {parseFloat(totalMark) > 0 && assessmentTotal > parseFloat(totalMark) && (
                      <span className="block text-[11px] text-amber-600 dark:text-amber-400">
                        More than the total — fine if some questions are optional.
                      </span>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </Modal>

      {/* ─── Add / edit question modal ─── */}
      <Modal
        isOpen={questionModal !== null}
        onClose={() => !isSaving && setQuestionModal(null)}
        size="lg"
        title={
          questionModal
            ? `${questionModal.mode === "add" ? "Add Question" : "Edit Question"} · ${questionModal.assessment.exam}`
            : ""
        }
        description="A question can test more than one CLO; split its marks between them."
        footer={
          <>
            <CustomButton
              variant="outline"
              size="sm"
              onClick={() => setQuestionModal(null)}
              disabled={isSaving}>
              Cancel
            </CustomButton>
            <CustomButton size="sm" onClick={() => void submitQuestion()} isLoading={isSaving}>
              {questionModal?.mode === "add" ? "Add" : "Save"}
            </CustomButton>
          </>
        }>
        {questionModal && (
          <QuestionEditor
            question={draftQuestion}
            index={questionModal.assessment.questions.length}
            cloOptions={questionCloOptions}
            onChange={setDraftQuestion}
          />
        )}
      </Modal>

      {/* ─── Delete confirmation ─── */}
      <ConfirmModal
        isOpen={confirm !== null}
        onClose={() => !isSaving && setConfirm(null)}
        onConfirm={() => void confirmDelete()}
        isLoading={isSaving}
        confirmText="Delete"
        title={
          confirm?.kind === "assessment"
            ? `Delete "${confirm.assessment.exam}"?`
            : `Delete question ${confirm?.kind === "question" ? confirm.question.original_question_no : ""}?`
        }
        message={
          confirm?.kind === "assessment"
            ? "The exam and all of its questions will be removed."
            : "The question and its CLO marks will be removed."
        }
      />
    </div>
  );
};

export default CloEnterPage;
