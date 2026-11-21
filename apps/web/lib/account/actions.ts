"use server";

/**
 * Account and address actions (spec 014). Each one loads the user from the
 * session and passes only that user's id to the services.
 */
import { revalidatePath } from "next/cache";
import { nameSchema } from "@repo/shared/auth";
import { getCurrentUser } from "../auth/session";
import { db } from "../db";
import {
  deleteAddress as removeAddress,
  saveAddress as storeAddress,
  setDefaultAddress as markDefault,
  type AddressWriteResult,
} from "./address-service";

const LOGGED_OUT = { ok: false, fields: { form: "Please log in again." } } as const;

export async function updateName(name: unknown): Promise<{ ok: boolean; error?: string }> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Please log in again." };
  const parsed = nameSchema.safeParse(name);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Enter your name" };
  await db().user.update({ where: { id: user.id }, data: { name: parsed.data } });
  revalidatePath("/", "layout"); // header first name
  return { ok: true };
}

export async function saveAddress(
  id: string | null,
  input: unknown,
  makeDefault: boolean,
): Promise<AddressWriteResult> {
  const user = await getCurrentUser();
  if (!user) return LOGGED_OUT;
  const result = await storeAddress(user.id, typeof id === "string" ? id : null, input, makeDefault === true);
  if (result.ok) revalidatePath("/account/addresses");
  return result;
}

export async function deleteAddress(id: unknown): Promise<void> {
  const user = await getCurrentUser();
  if (!user || typeof id !== "string") return;
  await removeAddress(user.id, id);
  revalidatePath("/account/addresses");
}

export async function setDefaultAddress(id: unknown): Promise<void> {
  const user = await getCurrentUser();
  if (!user || typeof id !== "string") return;
  await markDefault(user.id, id);
  revalidatePath("/account/addresses");
}
