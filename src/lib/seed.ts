import type { Category, Page } from "../types";

const now = Date.now();

export const seedCategories: Category[] = [
  { id: "cat_care",   name: "Care",   icon: "🌷", order: 0, createdAt: now },
  { id: "cat_growth", name: "Growth", icon: "🌸", order: 1, createdAt: now },
  { id: "cat_faith",  name: "Faith",  icon: "🤍", order: 2, createdAt: now },
];

export const seedPages: Page[] = [
  // Care
  {
    id: "pg_self", title: "Self Care", icon: "🌿",
    parentId: null, categoryId: "cat_care",
    createdAt: now, updatedAt: now, archived: false,
    content: [],
  },
  {
    id: "pg_self_skin", title: "Skin Routine", icon: "🧴",
    parentId: "pg_self", categoryId: "cat_care",
    createdAt: now, updatedAt: now, archived: false,
    content: [],
  },
  {
    id: "pg_reading", title: "Reading List", icon: "📚",
    parentId: null, categoryId: "cat_growth",
    createdAt: now, updatedAt: now, archived: false,
    content: [],
  },
  {
    id: "pg_quran", title: "Quran Study", icon: "📖",
    parentId: null, categoryId: "cat_faith",
    createdAt: now, updatedAt: now, archived: false,
    content: [],
  },
  {
    id: "pg_quran_tafsir", title: "Tafsir", icon: "🕊️",
    parentId: "pg_quran", categoryId: "cat_faith",
    createdAt: now, updatedAt: now, archived: false,
    content: [],
  },
  {
    id: "pg_quran_memo", title: "Memorization", icon: "🧠",
    parentId: "pg_quran", categoryId: "cat_faith",
    createdAt: now, updatedAt: now, archived: false,
    content: [],
  },
];

export function uid(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}${Date.now()
    .toString(36)
    .slice(-4)}`;
}