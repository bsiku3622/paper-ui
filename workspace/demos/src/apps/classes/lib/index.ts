import type { SubjectData, TermData } from "../data/build";
import type { Day } from "../data/periods";

export type Placed = { day: Day; period: number; room: string; subject: string; section: string; teacher: string; subjectId: number };
export type StudentEntry = { stuId: string; name: string; placed: Placed[]; subjects: string[]; sections: { subject: SubjectData; sectionId: number }[] };
export type TeacherEntry = { name: string; placed: Placed[]; subjects: string[]; sections: number };
export type TermIndex = {
  students: Map<string, StudentEntry>;
  teachers: Map<string, TeacherEntry>;
  rooms: Map<string, Placed[]>;
};

const CACHE = new WeakMap<TermData, TermIndex>();

export const termIndex = (data: TermData): TermIndex => {
  const found = CACHE.get(data);
  if (found) return found;
  const students = new Map<string, StudentEntry>();
  const teachers = new Map<string, TeacherEntry>();
  const rooms = new Map<string, Placed[]>();
  for (const subject of data.subjects) {
    for (const section of subject.sections) {
      const placed = section.times.map((time): Placed => ({ day: time.day, period: time.period, room: time.room, subject: subject.subject, section: section.section, teacher: section.teacher, subjectId: subject.subjectId }));
      const teacher = teachers.get(section.teacher) ?? { name: section.teacher, placed: [], subjects: [], sections: 0 };
      teacher.placed.push(...placed);
      teacher.sections += 1;
      if (!teacher.subjects.includes(subject.subject)) teacher.subjects.push(subject.subject);
      teachers.set(section.teacher, teacher);
      for (const item of placed) rooms.set(item.room, [...(rooms.get(item.room) ?? []), item]);
      for (const student of section.students) {
        const entry = students.get(student.stuId) ?? { stuId: student.stuId, name: student.name, placed: [], subjects: [], sections: [] };
        entry.placed.push(...placed);
        if (!entry.subjects.includes(subject.subject)) entry.subjects.push(subject.subject);
        entry.sections.push({ subject, sectionId: section.id });
        students.set(student.stuId, entry);
      }
    }
  }
  const index = { students, teachers, rooms };
  CACHE.set(data, index);
  return index;
};
