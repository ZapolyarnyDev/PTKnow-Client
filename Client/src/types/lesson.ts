import type { CourseSummaryDTO, FileMetaDTO } from './CourseCard';
import type { UserSummaryDTO } from './user';

export type LessonState = 'PLANNED' | 'ONGOING' | 'CANCELLED' | 'FINISHED';

export interface LessonDTO {
  id: number;
  name: string;
  description: string;
  contentMd: string;
  beginAt: string;
  endsAt: string;
  state: LessonState;
  courseId: number;
  course: CourseSummaryDTO;
  type: string;
  owner: UserSummaryDTO;
  materials: FileMetaDTO[];
}

export interface CreateLessonDTO {
  name: string;
  description: string;
  contentMd: string;
  beginAt: string;
  endsAt: string;
  type: string;
}

export interface UpdateLessonDTO {
  name: string;
  description: string;
  contentMd: string;
  beginAt: string;
  endsAt: string;
  type: string;
  timeRangeValid: boolean;
}

export interface UpdateLessonStateDTO {
  state: string;
}
