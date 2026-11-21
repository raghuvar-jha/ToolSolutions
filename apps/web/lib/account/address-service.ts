/**
 * Saved addresses (spec 014). Server only; every query is scoped to the user's id.
 * Uses the checkout address rules from packages/shared (without the email field,
 * which belongs to the order, not the address).
 */
import { addressSchema, fieldErrors } from "@repo/shared/checkout";
import { db } from "../db";

export const savedAddressSchema = addressSchema.omit({ email: true });

export type SavedAddress = {
  id: string;
  fullName: string;
  mobile: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  pincode: string;
  instructions: string;
  isDefault: boolean;
};

export type AddressWriteResult = { ok: true } | { ok: false; fields: Partial<Record<string, string>> };

/** Default first, then newest. */
export async function getAddresses(userId: string): Promise<SavedAddress[]> {
  const rows = await db().address.findMany({
    where: { userId },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  });
  return rows.map((r) => ({
    id: r.id,
    fullName: r.fullName,
    mobile: r.phone,
    line1: r.line1,
    line2: r.line2 ?? "",
    city: r.city,
    state: r.state,
    pincode: r.pincode,
    instructions: r.instructions ?? "",
    isDefault: r.isDefault,
  }));
}

/** Creates (id null) or updates the user's address. The first address becomes the default. */
export async function saveAddress(
  userId: string,
  id: string | null,
  input: unknown,
  makeDefault: boolean,
): Promise<AddressWriteResult> {
  const parsed = savedAddressSchema.safeParse(input);
  if (!parsed.success) return { ok: false, fields: fieldErrors(parsed.error) };
  const a = parsed.data;
  const data = {
    fullName: a.fullName,
    phone: a.mobile,
    line1: a.line1,
    line2: a.line2 || null,
    city: a.city,
    state: a.state,
    pincode: a.pincode,
    instructions: a.instructions || null,
  };

  return db().$transaction(async (tx) => {
    const count = await tx.address.count({ where: { userId } });
    const isDefault = makeDefault || count === 0;
    if (isDefault) await tx.address.updateMany({ where: { userId }, data: { isDefault: false } });

    if (id === null) {
      await tx.address.create({ data: { ...data, userId, isDefault } });
    } else {
      const updated = await tx.address.updateMany({
        where: { id, userId },
        data: { ...data, ...(isDefault ? { isDefault: true } : {}) },
      });
      if (updated.count !== 1) return { ok: false, fields: { form: "Address not found." } };
    }
    return { ok: true } as const;
  });
}

/** Deletes the user's address. If it was the default, the newest remaining one becomes the default. */
export async function deleteAddress(userId: string, id: string): Promise<void> {
  await db().$transaction(async (tx) => {
    const address = await tx.address.findFirst({ where: { id, userId }, select: { isDefault: true } });
    if (!address) return;
    await tx.address.deleteMany({ where: { id, userId } });
    if (address.isDefault) {
      const next = await tx.address.findFirst({ where: { userId }, orderBy: { createdAt: "desc" } });
      if (next) await tx.address.update({ where: { id: next.id }, data: { isDefault: true } });
    }
  });
}

export async function setDefaultAddress(userId: string, id: string): Promise<void> {
  await db().$transaction(async (tx) => {
    const exists = await tx.address.count({ where: { id, userId } });
    if (exists !== 1) return;
    await tx.address.updateMany({ where: { userId }, data: { isDefault: false } });
    await tx.address.updateMany({ where: { id, userId }, data: { isDefault: true } });
  });
}
