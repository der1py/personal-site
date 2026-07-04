import { GAMEPLAY } from "./constants";
function clampCharge(charge) {
  return Math.max(0, Math.min(1, charge));
}
function jumpDistance(charge) {
  return GAMEPLAY.minJumpDistance + (GAMEPLAY.maxJumpDistance - GAMEPLAY.minJumpDistance) * clampCharge(charge);
}
function jumpDuration(charge) {
  return GAMEPLAY.minJumpDuration + GAMEPLAY.jumpDurationRange * clampCharge(charge);
}
function jumpHeight(distance, progress) {
  const normalizedProgress = clampCharge(progress);
  return distance * GAMEPLAY.jumpArcHeightRatio * 4 * normalizedProgress * (1 - normalizedProgress);
}
function findLandingPad(targetX, targetY, pads) {
  let landedPad = null;
  let minDistance = Infinity;
  for (const pad of pads) {
    const distance = Math.hypot(targetX - pad.x, targetY - pad.y);
    if (distance <= pad.radius + GAMEPLAY.landingTolerance && distance < minDistance) {
      minDistance = distance;
      landedPad = pad;
    }
  }
  return landedPad;
}
export {
  clampCharge,
  findLandingPad,
  jumpDistance,
  jumpDuration,
  jumpHeight
};
