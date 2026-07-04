const GAME_WIDTH = 360;
const GAME_HEIGHT = 560;
const GAMEPLAY = {
  chargeRate: 12e-4,
  minJumpDistance: 50,
  maxJumpDistance: 260,
  minJumpDuration: 400,
  jumpDurationRange: 250,
  jumpArcHeightRatio: 0.38,
  landingTolerance: 4,
  minPadSpacing: 130,
  padSpacingRange: 80,
  baseCameraScrollSpeed: 0.024,
  maxCameraScoreBonus: 0.04,
  cameraScoreRate: 15e-4,
  drownViewportY: 550
};
export {
  GAMEPLAY,
  GAME_HEIGHT,
  GAME_WIDTH
};
