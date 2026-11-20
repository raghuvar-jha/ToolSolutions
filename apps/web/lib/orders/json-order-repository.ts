/**
 * v1 order storage: one JSON file at apps/web/data/orders.json (gitignored;
 * a temp folder on Vercel, see ORDERS_FILE).
 * Writes are serialised in-process and written atomically (temp file + rename).
 * Suitable for a single server; replace with a database before scaling out.
 */
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import type { Order, OrderRepository, TransactionResult } from "./order-repository";

class JsonOrderRepository implements OrderRepository {
  private queue: Promise<unknown> = Promise.resolve();

  constructor(private readonly file: string) {}

  private async readAll(): Promise<Order[]> {
    try {
      const parsed: unknown = JSON.parse(await readFile(this.file, "utf8"));
      return Array.isArray(parsed) ? (parsed as Order[]) : [];
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
      throw error;
    }
  }

  private async writeAll(orders: Order[]) {
    await mkdir(path.dirname(this.file), { recursive: true });
    const temp = `${this.file}.${process.pid}.tmp`;
    await writeFile(temp, JSON.stringify(orders, null, 2), "utf8");
    await rename(temp, this.file);
  }

  async findById(id: string) {
    return (await this.readAll()).find((o) => o.id === id) ?? null;
  }

  async findByIds(ids: string[]) {
    const wanted = new Set(ids);
    return (await this.readAll()).filter((o) => wanted.has(o.id));
  }

  transact<T>(
    fn: (orders: readonly Order[]) => Promise<TransactionResult<T>> | TransactionResult<T>,
  ): Promise<T> {
    const run = async () => {
      const orders = await this.readAll();
      const { result, save } = await fn(orders);
      if (save) {
        const index = orders.findIndex((o) => o.id === save.id);
        if (index === -1) orders.push(save);
        else orders[index] = save;
        await this.writeAll(orders);
      }
      return result;
    };
    // One transaction at a time; a failed one doesn't block the next.
    const next = this.queue.then(run, run);
    this.queue = next.catch(() => undefined);
    return next;
  }
}

/**
 * Where the file lives. On Vercel the app folder is read-only, so orders go to
 * the instance's temp folder: checkout works, but orders are lost when the
 * instance is recycled and are not shared between instances. A database is
 * needed before taking real orders there.
 */
const ORDERS_FILE = process.env.VERCEL
  ? path.join(tmpdir(), "tools-store", "orders.json")
  : path.join(process.cwd(), "data", "orders.json");

export const orderRepository: OrderRepository = new JsonOrderRepository(ORDERS_FILE);
