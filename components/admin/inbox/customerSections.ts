import type { CustomerSection } from "../types";

export const customerSections = [
  "conversations",
  "customers",
  "appointments",
  "campaigns",
  "outbound",
  "calls",
] as const satisfies readonly CustomerSection[];

export function isCustomerSection(value: string): value is CustomerSection {
  return customerSections.includes(value as CustomerSection);
}
