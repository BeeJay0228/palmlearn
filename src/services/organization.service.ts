import {
  getCategories, createCategory, renameCategory, deleteCategory,
  getSubCategories, createSubCategory, renameSubCategory, deleteSubCategory,
  getRegions, createRegion, renameRegion, deleteRegion,
  getStates, createState, renameState, deleteState,
  createManagedUser, updateManagedUser, deleteManagedUser,
  toggleUserStatus, resetUserPassword,
} from "@/lib/organization";

export const organizationService = {
  categories: {
    getAll: () => getCategories(),
    create: (name: string) => createCategory(name),
    update: (id: string, name: string) => renameCategory(id, name),
    delete: (id: string) => deleteCategory(id),
  },
  subCategories: {
    getAll: (categoryId?: string) => getSubCategories(categoryId),
    create: (name: string, categoryId: string) => createSubCategory(name, categoryId),
    update: (id: string, name: string) => renameSubCategory(id, name),
    delete: (id: string) => deleteSubCategory(id),
  },
  regions: {
    getAll: () => getRegions(),
    create: (name: string) => createRegion(name),
    update: (id: string, name: string) => renameRegion(id, name),
    delete: (id: string) => deleteRegion(id),
  },
  states: {
    getAll: (regionId?: string) => getStates(regionId),
    create: (name: string, regionId: string) => createState(name, regionId),
    update: (id: string, name: string) => renameState(id, name),
    delete: (id: string) => deleteState(id),
  },
  users: {
    create: (data: Parameters<typeof createManagedUser>[0]) => createManagedUser(data),
    update: (...args: Parameters<typeof updateManagedUser>) => updateManagedUser(...args),
    delete: (id: string) => deleteManagedUser(id),
    toggleStatus: (id: string) => toggleUserStatus(id),
    resetPassword: (id: string) => resetUserPassword(id),
  },
};
