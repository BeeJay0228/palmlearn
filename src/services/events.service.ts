import {
  getEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
  filterEvents,
  getEventsForLearner,
} from "@/lib/events";
export const eventsService = {
  getAll: () => getEvents(),
  getById: (id: string) => getEvent(id),
  create: (...args: Parameters<typeof createEvent>) => createEvent(...args),
  update: (...args: Parameters<typeof updateEvent>) => updateEvent(...args),
  delete: (id: string) => deleteEvent(id),
  filter: (...args: Parameters<typeof filterEvents>) => filterEvents(...args),
  getForLearner: (learnerId: string) => getEventsForLearner(learnerId),
};
