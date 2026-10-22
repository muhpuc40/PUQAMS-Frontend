import apiClient from '@/Axios/axiosConfig';

export interface Course {
    id: number;
    coursecode: string;
    coursename: string;
    coursecredit: number;
    coursetype: string;
    shortname: string;
    ex_semester: number;
    program: string;
    course_hr: string | number;
    major_name: string;
    transcript_course_code: string;
}

interface CourseListResponse {
    messageCode: number;
    message: string;
    data: Course[];
}

export const getCoursesByVersion = async (
    programId: number,
    versionId: number
): Promise<Course[]> => {
    const { data } = await apiClient.get<CourseListResponse>(
        `Course/get_versionwise_course_list?program_id=${programId}&version_id=${versionId}`
    );
    return data.data ?? [];
};


// ─── Equivalent Courses ────────────────────────────────────────

export interface EquivalentCourseGroup {
    oCourse: Course;
    equivalentCourse: Course[];
}

interface EquivalentCourseResponse {
    messageCode: number;
    message: string;
    data: EquivalentCourseGroup[];
}

export const getEquivalentCourses = async (
    programId: number,
    versionId: number
): Promise<EquivalentCourseGroup[]> => {
    const { data } = await apiClient.get<EquivalentCourseResponse>(
        `Course/get_equivalent_courses?program_id=${programId}&version_id=${versionId}`
    );
    return data.data ?? [];
};


// ─── Prerequisite Courses ──────────────────────────────────────

export interface PrerequisiteCourseGroup {
    oCourse: Course;
    prerequisiteCourse: Course[];
}

interface PrerequisiteCourseResponse {
    messageCode: number;
    message: string;
    data: PrerequisiteCourseGroup[];
}

export const getPrerequisiteCourses = async (
    programId: number,
    versionId: number
): Promise<PrerequisiteCourseGroup[]> => {
    const { data } = await apiClient.get<PrerequisiteCourseResponse>(
        `Course/get_prerequisite_courses?program_id=${programId}&version_id=${versionId}`
    );
    return data.data ?? [];
};


// ─── Dominant Courses ──────────────────────────────────────────

export interface DominantCourseGroup {
    oCourse: Course;
    dominantCourse: Course[];
}

interface DominantCourseResponse {
    messageCode: number;
    message: string;
    data: DominantCourseGroup[];
}

export const getDominantCourses = async (
    programId: number,
    versionId: number
): Promise<DominantCourseGroup[]> => {
    const { data } = await apiClient.get<DominantCourseResponse>(
        `Course/get_dominant_courses?program_id=${programId}&version_id=${versionId}`
    );
    return data.data ?? [];
};


// ─── Program Learning Outcomes (PLOs) ──────────────────────────

export interface ProgramLearningOutcome {
    id: number;
    plo_shortname: string;
    plo_description: string;
    status: string;
    deleted: number;
    program_id: number;
    attainment_equation: string;
}

interface PLOListResponse {
    messageCode: number;
    message: string;
    data: ProgramLearningOutcome[];
}

export const getVersionWisePLOs = async (
    programId: number,
    versionId: number
): Promise<ProgramLearningOutcome[]> => {
    const { data } = await apiClient.get<PLOListResponse>(
        `Course/get_versionwise_plos?program_id=${programId}&version_id=${versionId}`
    );
    return data.data ?? [];
};


// ─── Course Learning Outcomes (CLOs) ───────────────────────────

export interface CourseLearningOutcome {
  id: number;
  course_outcome: string;
  description: string;
  course: string;
  tbl_course_id: number;
  plos: string;
}

interface CLOListResponse {
  messageCode: number;
  message: string;
  data: CourseLearningOutcome[];
}

export const getCLOsByCourse = async (
  programId: number,
  courseId: number
): Promise<CourseLearningOutcome[]> => {
  const { data } = await apiClient.get<CLOListResponse>(
    `CourseManagement/get_clos_by_course?program_id=${programId}&course_id=${courseId}`
  );
  return data.data ?? [];
};