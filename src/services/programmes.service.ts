import {
  getProgrammes,
  createProgramme,
  updateProgramme,
  deleteProgramme,
  publishProgramme,
  duplicateProgramme,
  filterProgrammes,
  getProgrammeProgress,
  isProgrammeComplete,
  markProgrammeCompleted,
} from "@/lib/programmes";
export const programmesService = {
  getAll: () => getProgrammes(),
  create: (...args: Parameters<typeof createProgramme>) => createProgramme(...args),
  update: (...args: Parameters<typeof updateProgramme>) => updateProgramme(...args),
  delete: (...args: Parameters<typeof deleteProgramme>) => deleteProgramme(...args),
  publish: (...args: Parameters<typeof publishProgramme>) => publishProgramme(...args),
  duplicate: (...args: Parameters<typeof duplicateProgramme>) => duplicateProgramme(...args),
  filter: (...args: Parameters<typeof filterProgrammes>) => filterProgrammes(...args),
  getProgress: (...args: Parameters<typeof getProgrammeProgress>) => getProgrammeProgress(...args),
  isComplete: (...args: Parameters<typeof isProgrammeComplete>) => isProgrammeComplete(...args),
  markCompleted: (...args: Parameters<typeof markProgrammeCompleted>) => markProgrammeCompleted(...args),
};
