/**
 * One spin per device IP, enforced even across a page refresh — read by
 * app/api/spins/route.ts (rejects recording a spin once an IP already has
 * one) and app/api/spin-status/route.ts (restores a returning visitor's
 * past result instead of letting them spin again).
 */
export const ENFORCE_ONE_SPIN_PER_DEVICE = true;
