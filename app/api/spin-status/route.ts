import { getDb } from "@/lib/mongodb";
import { getClientIp } from "@/lib/getClientIp";
import { ENFORCE_ONE_SPIN_PER_DEVICE } from "@/lib/config";

/**
 * Lets the page check, on load, whether this device's IP already used its
 * one spin — so a page refresh can't be used to spin again.
 */
export async function GET(request: Request) {
  if (!ENFORCE_ONE_SPIN_PER_DEVICE) {
    return Response.json({ prizeId: null });
  }

  const ip = getClientIp(request);

  try {
    const db = await getDb();
    const spin = await db.collection("spins").findOne({ ip }, { sort: { completedAt: -1 } });
    return Response.json({ prizeId: spin?.prizeId ?? null });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error.";
    console.error("Failed to check spin status:", message);
    // Fail open: a lookup error shouldn't block a new visitor from playing.
    return Response.json({ prizeId: null });
  }
}
