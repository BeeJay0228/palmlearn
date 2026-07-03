import {
  getAssignments,
  createAssignment,
  updateAssignment,
  deleteAssignment,
  filterAssignments,
  publishAssignment,
  duplicateAssignment,
  bulkActionAssignment,
} from "@/lib/assignments";
import {
  getLearnerAssignments as libGetLearnerAssignments,
  createLearnerAssignment,
  updateLearnerAssignment,
  markAssignmentInProgress,
  markAssignmentCompleted,
  bulkCreateFromAssignment,
  checkAndUpdateOverdueStatus,
} from "@/lib/learner-assignments";

export const assignmentsService = {
  getAll: () => getAssignments(),
  create: (...args: Parameters<typeof createAssignment>) => createAssignment(...args),
  update: (...args: Parameters<typeof updateAssignment>) => updateAssignment(...args),
  delete: (id: string) => deleteAssignment(id),
  filter: (...args: Parameters<typeof filterAssignments>) => filterAssignments(...args),
  publish: (...args: Parameters<typeof publishAssignment>) => publishAssignment(...args),
  duplicate: (id: string) => duplicateAssignment(id),
  bulkAction: (...args: Parameters<typeof bulkActionAssignment>) => bulkActionAssignment(...args),
  learner: {
    getAll: () => libGetLearnerAssignments(),
    create: (...args: Parameters<typeof createLearnerAssignment>) => createLearnerAssignment(...args),
    update: (...args: Parameters<typeof updateLearnerAssignment>) => updateLearnerAssignment(...args),
    markInProgress: (id: string) => markAssignmentInProgress(id),
    markCompleted: (id: string) => markAssignmentCompleted(id),
    bulkCreateFromAssignment: (...args: Parameters<typeof bulkCreateFromAssignment>) => bulkCreateFromAssignment(...args),
    checkOverdue: (...args: Parameters<typeof checkAndUpdateOverdueStatus>) => checkAndUpdateOverdueStatus(...args),
  },
};
