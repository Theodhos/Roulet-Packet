import { getDb } from "@/lib/mongodb";
import { getClientIp } from "@/lib/getClientIp";
import { PRIZES } from "@/lib/roulette";
import { ENFORCE_ONE_SPIN_PER_DEVICE } from "@/lib/config";

interface SpinPayload {
  prizeId?: unknown;
}

/** Records a completed spin — no personal data, just device IP + prize + when. */
export async function POST(request: Request) {
  let payload: SpinPayload;
  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  const prizeId = payload.prizeId;
  if (typeof prizeId !== "number" || !Number.isInteger(prizeId)) {
    return Response.json({ error: "prizeId must be an integer." }, { status: 400 });
  }

  const prize = PRIZES.find((p) => p.id === prizeId);
  if (!prize) {
    return Response.json({ error: "Unknown prize." }, { status: 400 });
  }

  const ip = getClientIp(request);

  try {
    const db = await getDb();

    if (ENFORCE_ONE_SPIN_PER_DEVICE) {
      const alreadyPlayed = await db.collection("spins").findOne({ ip });
      if (alreadyPlayed) {
        return Response.json({ error: "This device has already used its spin." }, { status: 403 });
      }
    }

    await db.collection("spins").insertOne({
      ip,
      prizeId: prize.id,
      prizeName: prize.title,
      completedAt: new Date(),
    });
    return Response.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error.";
    console.error("Failed to record spin:", message);
    return Response.json({ error: "Could not save your result." }, { status: 503 });
  }
}
