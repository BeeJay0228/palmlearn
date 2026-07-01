import type { Category, SubCategory, Region, StateEntity, User, Gender, UserRole } from "@/types";
import { hashMockPassword, saveUsersToStore, getRawUsers, type StoredUser } from "./auth";

const CATEGORIES_KEY = "palmlearn-categories";
const SUB_CATEGORIES_KEY = "palmlearn-subcategories";
const REGIONS_KEY = "palmlearn-regions";
const STATES_KEY = "palmlearn-states";

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
}

function getStore<T>(key: string): T[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(key);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as T[];
  } catch {
    return [];
  }
}

function setStore<T>(key: string, data: T[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(data));
}

function seedIfEmpty(): void {
  const cats = getStore<Category>(CATEGORIES_KEY);
  if (cats.length > 0) return;

  const categoryNames = [
    "POS Sales", "BNPL", "ATM", "Loan Sales", "Smart Lending", "Merchant Acquisition",
  ];
  const createdCategories: Category[] = categoryNames.map((name) => ({
    id: generateId(),
    name,
    createdAt: new Date().toISOString(),
  }));
  setStore(CATEGORIES_KEY, createdCategories);

  const subMap: Record<string, string[]> = {
    "POS Sales": ["Senior BD", "Junior BD", "Aggregator", "Dealer", "Merchant", "Trainer"],
    "BNPL": ["Field Agent", "Team Lead", "Regional Manager"],
    "ATM": ["Technician", "Supervisor", "Operations"],
    "Loan Sales": ["Loan Officer", "Senior Officer", "Team Lead"],
    "Smart Lending": ["Product Specialist", "Analyst", "Manager"],
    "Merchant Acquisition": ["Acquisition Officer", "Account Manager", "Regional Lead"],
  };

  const createdSubs: SubCategory[] = [];
  for (const cat of createdCategories) {
    const subs = subMap[cat.name] || [];
    for (const subName of subs) {
      createdSubs.push({
        id: generateId(),
        name: subName,
        categoryId: cat.id,
        createdAt: new Date().toISOString(),
      });
    }
  }
  setStore(SUB_CATEGORIES_KEY, createdSubs);

  const regionNames = ["Lagos Mainland", "Lagos Island", "South West", "North Central", "South South"];
  const createdRegions: Region[] = regionNames.map((name) => ({
    id: generateId(),
    name,
    createdAt: new Date().toISOString(),
  }));
  setStore(REGIONS_KEY, createdRegions);

  const stateMap: Record<string, string[]> = {
    "Lagos Mainland": ["Ikeja", "Mushin", "Oshodi", "Surulere", "Yaba"],
    "Lagos Island": ["Victoria Island", "Ikoyi", "Lekki", "Apapa", "Eko"],
    "South West": ["Ibadan", "Abeokuta", "Akure", "Osogbo", "Ado-Ekiti"],
    "North Central": ["Abuja", "Lokoja", "Ilorin", "Minna", "Jos"],
    "South South": ["Port Harcourt", "Calabar", "Uyo", "Benin City", "Warri"],
  };

  const createdStates: StateEntity[] = [];
  for (const region of createdRegions) {
    const states = stateMap[region.name] || [];
    for (const stateName of states) {
      createdStates.push({
        id: generateId(),
        name: stateName,
        regionId: region.id,
        createdAt: new Date().toISOString(),
      });
    }
  }
  setStore(STATES_KEY, createdStates);
}

function ensureSeeded(): void {
  seedIfEmpty();
}

export function getCategories(): Category[] {
  ensureSeeded();
  return getStore<Category>(CATEGORIES_KEY);
}

export function createCategory(name: string): Category {
  ensureSeeded();
  const cats = getStore<Category>(CATEGORIES_KEY);
  const cat: Category = { id: generateId(), name, createdAt: new Date().toISOString() };
  cats.push(cat);
  setStore(CATEGORIES_KEY, cats);
  return cat;
}

export function renameCategory(id: string, name: string): Category | null {
  ensureSeeded();
  const cats = getStore<Category>(CATEGORIES_KEY);
  const idx = cats.findIndex((c) => c.id === id);
  if (idx === -1) return null;
  cats[idx].name = name;
  setStore(CATEGORIES_KEY, cats);
  return cats[idx];
}

export function deleteCategory(id: string): boolean {
  const cats = getStore<Category>(CATEGORIES_KEY);
  const filtered = cats.filter((c) => c.id !== id);
  if (filtered.length === cats.length) return false;
  setStore(CATEGORIES_KEY, filtered);
  const subs = getStore<SubCategory>(SUB_CATEGORIES_KEY);
  setStore(SUB_CATEGORIES_KEY, subs.filter((s) => s.categoryId !== id));
  return true;
}

export function getSubCategories(categoryId?: string): SubCategory[] {
  ensureSeeded();
  const all = getStore<SubCategory>(SUB_CATEGORIES_KEY);
  return categoryId ? all.filter((s) => s.categoryId === categoryId) : all;
}

export function createSubCategory(name: string, categoryId: string): SubCategory {
  ensureSeeded();
  const subs = getStore<SubCategory>(SUB_CATEGORIES_KEY);
  const sub: SubCategory = { id: generateId(), name, categoryId, createdAt: new Date().toISOString() };
  subs.push(sub);
  setStore(SUB_CATEGORIES_KEY, subs);
  return sub;
}

export function renameSubCategory(id: string, name: string): SubCategory | null {
  ensureSeeded();
  const subs = getStore<SubCategory>(SUB_CATEGORIES_KEY);
  const idx = subs.findIndex((s) => s.id === id);
  if (idx === -1) return null;
  subs[idx].name = name;
  setStore(SUB_CATEGORIES_KEY, subs);
  return subs[idx];
}

export function deleteSubCategory(id: string): boolean {
  const subs = getStore<SubCategory>(SUB_CATEGORIES_KEY);
  const filtered = subs.filter((s) => s.id !== id);
  if (filtered.length === subs.length) return false;
  setStore(SUB_CATEGORIES_KEY, filtered);
  return true;
}

export function getRegions(): Region[] {
  ensureSeeded();
  return getStore<Region>(REGIONS_KEY);
}

export function createRegion(name: string): Region {
  ensureSeeded();
  const regions = getStore<Region>(REGIONS_KEY);
  const region: Region = { id: generateId(), name, createdAt: new Date().toISOString() };
  regions.push(region);
  setStore(REGIONS_KEY, regions);
  return region;
}

export function renameRegion(id: string, name: string): Region | null {
  ensureSeeded();
  const regions = getStore<Region>(REGIONS_KEY);
  const idx = regions.findIndex((r) => r.id === id);
  if (idx === -1) return null;
  regions[idx].name = name;
  setStore(REGIONS_KEY, regions);
  return regions[idx];
}

export function deleteRegion(id: string): boolean {
  const regions = getStore<Region>(REGIONS_KEY);
  const filtered = regions.filter((r) => r.id !== id);
  if (filtered.length === regions.length) return false;
  setStore(REGIONS_KEY, filtered);
  const states = getStore<StateEntity>(STATES_KEY);
  setStore(STATES_KEY, states.filter((s) => s.regionId !== id));
  return true;
}

export function getStates(regionId?: string): StateEntity[] {
  ensureSeeded();
  const all = getStore<StateEntity>(STATES_KEY);
  return regionId ? all.filter((s) => s.regionId === regionId) : all;
}

export function createState(name: string, regionId: string): StateEntity {
  ensureSeeded();
  const states = getStore<StateEntity>(STATES_KEY);
  const state: StateEntity = { id: generateId(), name, regionId, createdAt: new Date().toISOString() };
  states.push(state);
  setStore(STATES_KEY, states);
  return state;
}

export function renameState(id: string, name: string): StateEntity | null {
  ensureSeeded();
  const states = getStore<StateEntity>(STATES_KEY);
  const idx = states.findIndex((s) => s.id === id);
  if (idx === -1) return null;
  states[idx].name = name;
  setStore(STATES_KEY, states);
  return states[idx];
}

export function deleteState(id: string): boolean {
  const states = getStore<StateEntity>(STATES_KEY);
  const filtered = states.filter((s) => s.id !== id);
  if (filtered.length === states.length) return false;
  setStore(STATES_KEY, filtered);
  return true;
}

export interface CreateUserData {
  name: string;
  email: string;
  role: UserRole;
  password?: string;
  gender?: Gender;
  phone?: string;
  officeAddress?: string;
  homeAddress?: string;
  bio?: string;
  categoryId?: string;
  subCategoryId?: string;
  regionId?: string;
  stateId?: string;
}

export function getManagedUsers(): User[] {
  const raw = getRawUsers();
  return raw.map((s) => ({
    id: s.id,
    email: s.email,
    name: s.name,
    role: s.role,
    avatar: s.avatar,
    bio: s.bio,
    phone: s.phone,
    officeAddress: s.officeAddress,
    homeAddress: s.homeAddress,
    mustChangePassword: s.mustChangePassword,
    createdAt: s.createdAt,
    gender: s.gender,
    categoryId: s.categoryId,
    subCategoryId: s.subCategoryId,
    regionId: s.regionId,
    stateId: s.stateId,
    status: s.status || "active",
  }));
}

export function getUserById(id: string): User | null {
  return getManagedUsers().find((u) => u.id === id) || null;
}

export function createManagedUser(data: CreateUserData): { success: boolean; user?: User; error?: string } {
  const users = getRawUsers();
  if (users.some((u) => u.email === data.email)) {
    return { success: false, error: "A user with this email already exists." };
  }

  const tempPassword = data.password || generateId().slice(0, 8);
  const now = new Date().toISOString();
  const newUser: StoredUser = {
    id: generateId(),
    email: data.email,
    name: data.name,
    role: data.role,
    gender: data.gender,
    phone: data.phone,
    officeAddress: data.officeAddress,
    homeAddress: data.homeAddress,
    bio: data.bio,
    categoryId: data.categoryId,
    subCategoryId: data.subCategoryId,
    regionId: data.regionId,
    stateId: data.stateId,
    status: "active",
    mustChangePassword: true,
    password: hashMockPassword(tempPassword),
    createdAt: now,
  };
  users.push(newUser);
  saveUsersToStore(users);

  return {
    success: true,
    user: {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
      gender: newUser.gender,
      phone: newUser.phone,
      officeAddress: newUser.officeAddress,
      homeAddress: newUser.homeAddress,
      bio: newUser.bio,
      categoryId: newUser.categoryId,
      subCategoryId: newUser.subCategoryId,
      regionId: newUser.regionId,
      stateId: newUser.stateId,
      status: "active",
      mustChangePassword: true,
      createdAt: now,
    },
  };
}

export function updateManagedUser(id: string, data: Partial<CreateUserData>): { success: boolean; user?: User; error?: string } {
  const users = getRawUsers();
  const idx = users.findIndex((u) => u.id === id);
  if (idx === -1) return { success: false, error: "User not found." };

  if (data.name !== undefined) users[idx].name = data.name;
  if (data.email !== undefined) users[idx].email = data.email;
  if (data.role !== undefined) users[idx].role = data.role;
  if (data.gender !== undefined) users[idx].gender = data.gender;
  if (data.phone !== undefined) users[idx].phone = data.phone;
  if (data.officeAddress !== undefined) users[idx].officeAddress = data.officeAddress;
  if (data.homeAddress !== undefined) users[idx].homeAddress = data.homeAddress;
  if (data.bio !== undefined) users[idx].bio = data.bio;
  if (data.categoryId !== undefined) users[idx].categoryId = data.categoryId;
  if (data.subCategoryId !== undefined) users[idx].subCategoryId = data.subCategoryId;
  if (data.regionId !== undefined) users[idx].regionId = data.regionId;
  if (data.stateId !== undefined) users[idx].stateId = data.stateId;

  saveUsersToStore(users);

  return {
    success: true,
    user: {
      id: users[idx].id,
      email: users[idx].email,
      name: users[idx].name,
      role: users[idx].role,
      gender: users[idx].gender,
      phone: users[idx].phone,
      officeAddress: users[idx].officeAddress,
      homeAddress: users[idx].homeAddress,
      bio: users[idx].bio,
      categoryId: users[idx].categoryId,
      subCategoryId: users[idx].subCategoryId,
      regionId: users[idx].regionId,
      stateId: users[idx].stateId,
      status: users[idx].status || "active",
      mustChangePassword: users[idx].mustChangePassword,
      createdAt: users[idx].createdAt,
    },
  };
}

export function deleteManagedUser(id: string): { success: boolean; error?: string } {
  const users = getRawUsers();
  const filtered = users.filter((u) => u.id !== id);
  if (filtered.length === users.length) {
    return { success: false, error: "User not found." };
  }
  saveUsersToStore(filtered);
  return { success: true };
}

export function toggleUserStatus(id: string): { success: boolean; user?: User; error?: string } {
  const users = getRawUsers();
  const idx = users.findIndex((u) => u.id === id);
  if (idx === -1) return { success: false, error: "User not found." };

  users[idx].status = users[idx].status === "active" ? "inactive" : "active";
  saveUsersToStore(users);

  return {
    success: true,
    user: {
      id: users[idx].id,
      email: users[idx].email,
      name: users[idx].name,
      role: users[idx].role,
      status: users[idx].status,
      mustChangePassword: users[idx].mustChangePassword,
      createdAt: users[idx].createdAt,
    } as User,
  };
}

export function resetUserPassword(id: string): { success: boolean; password?: string; error?: string } {
  const users = getRawUsers();
  const idx = users.findIndex((u) => u.id === id);
  if (idx === -1) return { success: false, error: "User not found." };

  const newPassword = generateId().slice(0, 8);
  users[idx].password = hashMockPassword(newPassword);
  users[idx].mustChangePassword = true;
  saveUsersToStore(users);

  return { success: true, password: newPassword };
}
