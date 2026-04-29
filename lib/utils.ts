/* eslint-disable no-prototype-builtins */
import { type ClassValue, clsx } from "clsx";
import qs from "query-string";
import { twMerge } from "tailwind-merge";
import { z } from "zod";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatDateTime = (dateString: Date) => {
  const dateTimeOptions: Intl.DateTimeFormatOptions = {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  };

  const dateDayOptions: Intl.DateTimeFormatOptions = {
    weekday: "short",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  };

  const dateOptions: Intl.DateTimeFormatOptions = {
    month: "short",
    year: "numeric",
    day: "numeric",
  };

  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  };

  return {
    dateTime: new Date(dateString).toLocaleString("en-US", dateTimeOptions),
    dateDay: new Date(dateString).toLocaleString("en-US", dateDayOptions),
    dateOnly: new Date(dateString).toLocaleString("en-US", dateOptions),
    timeOnly: new Date(dateString).toLocaleString("en-US", timeOptions),
  };
};

export function formatAmount(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(amount);
}

export const removeSpecialCharacters = (value: string) => {
  return value.replace(/[^\w\s]/gi, "");
};

interface UrlQueryParams {
  params: string;
  key: string;
  value: string;
}

export function formUrlQuery({ params, key, value }: UrlQueryParams) {
  const currentUrl = qs.parse(params);
  currentUrl[key] = value;
  return qs.stringifyUrl(
    { url: window.location.pathname, query: currentUrl },
    { skipNull: true }
  );
}

export function getAccountTypeColors(type: AccountTypes) {
  switch (type) {
    case "depository":
      return {
        bg: "bg-blue-25",
        lightBg: "bg-blue-100",
        title: "text-blue-900",
        subText: "text-blue-700",
      };
    case "credit":
      return {
        bg: "bg-success-25",
        lightBg: "bg-success-100",
        title: "text-success-900",
        subText: "text-success-700",
      };
    default:
      return {
        bg: "bg-green-25",
        lightBg: "bg-green-100",
        title: "text-green-900",
        subText: "text-green-700",
      };
  }
}

export function countTransactionCategories(
  transactions: Transaction[]
): CategoryCount[] {
  const categoryCounts: { [category: string]: number } = {};
  let totalCount = 0;

  transactions &&
    transactions.forEach((transaction) => {
      const category = transaction.category;
      if (categoryCounts.hasOwnProperty(category)) {
        categoryCounts[category]++;
      } else {
        categoryCounts[category] = 1;
      }
      totalCount++;
    });

  const aggregatedCategories: CategoryCount[] = Object.keys(categoryCounts).map(
    (category) => ({
      name: category,
      count: categoryCounts[category],
      totalCount,
    })
  );

  aggregatedCategories.sort((a, b) => b.count - a.count);
  return aggregatedCategories;
}

export function encryptId(id: string) {
  return btoa(id);
}

export function decryptId(id: string) {
  return atob(id);
}

export const parseStringify = (value: unknown) =>
  JSON.parse(JSON.stringify(value));

export const extractCustomerIdFromUrl = (url: string) => {
  const parts = url.split("/");
  return parts[parts.length - 1];
};

export const getTransactionStatus = (date: Date) => {
  const today = new Date();
  const twoDaysAgo = new Date(today);
  twoDaysAgo.setDate(today.getDate() - 2);
  return date > twoDaysAgo ? "Processing" : "Success";
};

export type BankDesign = { gradient: string; shadow: string; hoverShadow: string; cardType: 'visa' | 'mastercard' };

const BANK_DESIGNS: Record<string, BankDesign> = {
  chase:   { gradient: 'from-blue-700 via-blue-600 to-blue-500',       shadow: 'shadow-blue-700/15',   hoverShadow: 'hover:shadow-blue-700/25',  cardType: 'visa' },
  bofa:    { gradient: 'from-red-700 via-red-600 to-rose-500',          shadow: 'shadow-red-700/15',    hoverShadow: 'hover:shadow-red-700/25',   cardType: 'visa' },
  wells:   { gradient: 'from-amber-600 via-orange-500 to-orange-400',   shadow: 'shadow-amber-600/15',  hoverShadow: 'hover:shadow-amber-600/25', cardType: 'visa' },
  citi:    { gradient: 'from-slate-800 via-slate-700 to-blue-800',      shadow: 'shadow-slate-800/15',  hoverShadow: 'hover:shadow-slate-800/25', cardType: 'mastercard' },
  capital: { gradient: 'from-teal-700 via-teal-600 to-emerald-500',     shadow: 'shadow-teal-700/15',   hoverShadow: 'hover:shadow-teal-700/25',  cardType: 'mastercard' },
  default: { gradient: 'from-blue-600 via-blue-500 to-blue-400',        shadow: 'shadow-blue-600/15',   hoverShadow: 'hover:shadow-blue-600/25',  cardType: 'mastercard' },
};

export function getBankDesign(name: string): BankDesign {
  const n = name.toLowerCase();
  if (n.includes('chase')) return BANK_DESIGNS.chase;
  if (n.includes('bank of america') || n.includes('bofa')) return BANK_DESIGNS.bofa;
  if (n.includes('wells fargo') || n.includes('wells')) return BANK_DESIGNS.wells;
  if (n.includes('citi')) return BANK_DESIGNS.citi;
  if (n.includes('capital one') || n.includes('capital')) return BANK_DESIGNS.capital;
  return BANK_DESIGNS.default;
}

export const authFormSchema = (type: string) =>
  z.object({
    firstName: type === "sign-in" ? z.string().optional() : z.string().min(1, "First name is required").max(50),
    lastName: type === "sign-in" ? z.string().optional() : z.string().min(1, "Last name is required").max(50),
    address1: type === "sign-in" ? z.string().optional() : z.string().min(1, "Address is required").max(50),
    city: type === "sign-in" ? z.string().optional() : z.string().min(1, "City is required").max(50),
    state: type === "sign-in" ? z.string().optional() : z.string().length(2, "State must be a 2-letter code"),
    postalCode: type === "sign-in" ? z.string().optional() : z.string().min(3).max(6),
    dateOfBirth: type === "sign-in" ? z.string().optional() : z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD"),
    ssn: type === "sign-in" ? z.string().optional() : z.string().regex(/^\d{4}$/, "Enter the last 4 digits of your SSN (4 digits, no dashes)"),
    email: z.string().email(),
    password:
      type === "sign-in"
        ? z.string().min(1, "Password is required")
        : z
            .string()
            .min(8, "Password must be at least 8 characters")
            .regex(/[A-Z]/, "Must contain at least one uppercase letter")
            .regex(/[a-z]/, "Must contain at least one lowercase letter")
            .regex(/[0-9]/, "Must contain at least one number"),
  });
