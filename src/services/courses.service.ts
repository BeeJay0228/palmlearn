import {
  getCourses,
  createCourse,
  updateCourse,
  deleteCourse,
  duplicateCourse,
  getCourseById,
  addModule,
  updateModule,
  deleteModule,
  addLesson,
  updateLesson,
  deleteLesson,
  reorderModules,
  reorderLessons,
} from "@/lib/courses";

export const coursesService = {
  getAll: () => getCourses(),
  getById: (id: string) => getCourseById(id),
  create: (...args: Parameters<typeof createCourse>) => createCourse(...args),
  update: (...args: Parameters<typeof updateCourse>) => updateCourse(...args),
  delete: (id: string) => deleteCourse(id),
  duplicate: (id: string) => duplicateCourse(id),
  modules: {
    add: (...args: Parameters<typeof addModule>) => addModule(...args),
    update: (...args: Parameters<typeof updateModule>) => updateModule(...args),
    delete: (...args: Parameters<typeof deleteModule>) => deleteModule(...args),
    reorder: (...args: Parameters<typeof reorderModules>) => reorderModules(...args),
  },
  lessons: {
    add: (...args: Parameters<typeof addLesson>) => addLesson(...args),
    update: (...args: Parameters<typeof updateLesson>) => updateLesson(...args),
    delete: (...args: Parameters<typeof deleteLesson>) => deleteLesson(...args),
    reorder: (...args: Parameters<typeof reorderLessons>) => reorderLessons(...args),
  },
};