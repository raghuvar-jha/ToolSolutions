/**
 * Saved items (spec 014). Server only; every query is scoped to the user's id.
 */
import { db } from "../db";

/** Saved product ids, newest first (active products only). */
export async function getSavedProductIds(userId: string): Promise<string[]> {
  const rows = await db().savedItem.findMany({
    where: { userId, product: { isActive: true } },
    orderBy: { createdAt: "desc" },
    select: { productId: true },
  });
  return rows.map((r) => r.productId);
}

/** Saves or un-saves a product. Returns true when it is now saved. */
export async function setSaved(userId: string, productId: string, saved: boolean): Promise<boolean> {
  if (!saved) {
    await db().savedItem.deleteMany({ where: { userId, productId } });
    return false;
  }
  const product = await db().product.findFirst({ where: { id: productId, isActive: true }, select: { id: true } });
  if (!product) return false;
  await db().savedItem.upsert({
    where: { userId_productId: { userId, productId } },
    create: { userId, productId },
    update: {},
  });
  return true;
}
