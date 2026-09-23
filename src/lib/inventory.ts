import mongoose from "mongoose";
import Product from "@/models/Product";
import InventoryTransaction, { InventoryTransactionType } from "@/models/InventoryTransaction";
import { computeInventoryStatus } from "@/lib/productStatus";

export { computeInventoryStatus };

/**
 * Atomically adjusts a product's stock and records the transaction, using a
 * single conditional findOneAndUpdate (not a multi-document transaction) so
 * this works against a standalone (non-replica-set) local MongoDB instance,
 * as documented in the deployment README. Throws if the adjustment would
 * take stock below zero (prevents overselling under concurrent requests).
 */
export async function adjustStock(params: {
  productId: string | mongoose.Types.ObjectId;
  type: InventoryTransactionType;
  quantityChange: number;
  orderId?: string | mongoose.Types.ObjectId;
  note?: string;
  performedBy?: string | mongoose.Types.ObjectId;
}) {
  const { productId, type, quantityChange, orderId, note, performedBy } = params;

  const filter: Record<string, unknown> = { _id: productId };
  if (quantityChange < 0) {
    // Guard against overselling: only apply the decrement if enough stock exists.
    filter.stock = { $gte: -quantityChange };
  }

  const updated = await Product.findOneAndUpdate(
    filter,
    { $inc: { stock: quantityChange } },
    { new: true }
  );

  if (!updated) {
    const current = await Product.findById(productId).lean();
    if (!current) throw new Error("Product not found for stock adjustment.");
    throw new Error(`Insufficient stock for ${current.name}. Available: ${current.stock}, requested change: ${quantityChange}.`);
  }

  const previousStock = updated.stock - quantityChange;

  await InventoryTransaction.create({
    product: updated._id,
    type,
    quantityChange,
    previousStock,
    newStock: updated.stock,
    order: orderId,
    note,
    performedBy,
  });

  return updated;
}

/**
 * Decrements stock for every line item of an order, one product at a time.
 * If any item has insufficient stock, every prior decrement in this call is
 * rolled back (restocked) before throwing, so an order is never left in a
 * partially-fulfilled inventory state.
 */
export async function reserveStockForOrder(
  items: Array<{ productId: string | mongoose.Types.ObjectId; quantity: number; isPreorder?: boolean }>,
  orderId: string | mongoose.Types.ObjectId
) {
  const applied: Array<{ productId: string | mongoose.Types.ObjectId; quantity: number }> = [];

  try {
    for (const item of items) {
      if (item.isPreorder) continue; // preorder stock isn't deducted from live inventory
      await adjustStock({
        productId: item.productId,
        type: "ORDER",
        quantityChange: -item.quantity,
        orderId,
        note: "Stock reserved for order",
      });
      applied.push({ productId: item.productId, quantity: item.quantity });
    }
  } catch (err) {
    for (const item of applied) {
      await adjustStock({
        productId: item.productId,
        type: "CANCELLATION",
        quantityChange: item.quantity,
        orderId,
        note: "Rollback: order could not be completed",
      });
    }
    throw err;
  }
}

/** Restores stock for every non-preorder line item of a cancelled/returned order. */
export async function restoreStockForOrder(
  items: Array<{ productId: string | mongoose.Types.ObjectId; quantity: number; isPreorder?: boolean }>,
  orderId: string | mongoose.Types.ObjectId,
  type: InventoryTransactionType = "CANCELLATION"
) {
  for (const item of items) {
    if (item.isPreorder) continue;
    await adjustStock({
      productId: item.productId,
      type,
      quantityChange: item.quantity,
      orderId,
      note: `Stock restored (${type.toLowerCase()})`,
    });
  }
}

