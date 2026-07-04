import { useRef, useEffect } from "react";
import { sound } from "../audio";
import { GAME_HEIGHT, GAME_WIDTH, GAMEPLAY } from "../game/constants";
import { findLandingPad, jumpDistance, jumpDuration, jumpHeight } from "../game/mechanics";
import frogSpriteUrl from "../assets/frog-pixel.png";
import lilyPadSpriteUrl from "../assets/lily-pad-pixel.png";
import waterLilySpriteUrl from "../assets/water-lily-2.png";
function GameCanvas({
  status,
  score,
  highScore,
  isMuted,
  onScoreChange,
  onHighScoreChange,
  onStatusChange,
  onFirstInput,
  isActive = true
}) {
  const canvasRef = useRef(null);
  const stateRef = useRef({
    status,
    score,
    highScore,
    tutorialInputConsumed: false,
    firstJumpHappened: false,
    highScoreAnnounced: false,
    cameraY: 0,
    targetCameraY: 0,
    // Core game entities
    pads: [],
    particles: [],
    ripples: [],
    floatingTexts: [],
    fishList: [],
    // Frog state
    frog: {
      x: 180,
      y: 440,
      angle: -Math.PI / 2,
      // Facing straight up
      state: "IDLE",
      activePadId: 0,
      jumpProgress: 0,
      startX: 180,
      startY: 440,
      targetX: 180,
      targetY: 440,
      chargeRatio: 0,
      squishX: 1,
      squishY: 1
    },
    // Audio/Visual ticking control
    lastTime: 0,
    nextParticleId: 0,
    nextRippleId: 0,
    nextTextId: 0,
    lastChargeTickTime: 0,
    // Timing and touch
    isPointerDown: false,
    pointerDownTime: 0,
    chargeRate: GAMEPLAY.chargeRate,
    minJumpDist: GAMEPLAY.minJumpDistance,
    maxJumpDist: GAMEPLAY.maxJumpDistance,
    isActive,
    gameOverTimer: null,
    sprites: {
      frog: null,
      lilyPad: null,
      waterLily: null
    }
  });
  useEffect(() => {
    stateRef.current.status = status;
    sound.setMute(isMuted);
    stateRef.current.isActive = isActive;
  }, [status, isMuted, isActive]);
  useEffect(() => {
    stateRef.current.score = score;
    stateRef.current.highScore = highScore;
  }, [score, highScore]);
  const resetGame = () => {
    const s = stateRef.current;
    if (s.gameOverTimer) {
      clearTimeout(s.gameOverTimer);
      s.gameOverTimer = null;
    }
    s.score = 0;
    onScoreChange(0);
    s.tutorialInputConsumed = false;
    s.firstJumpHappened = false;
    s.highScoreAnnounced = false;
    s.cameraY = 0;
    s.targetCameraY = 0;
    s.particles = [];
    s.ripples = [];
    s.floatingTexts = [];
    const initialPads = [
      {
        id: 0,
        x: 180,
        y: 440,
        radius: 38,
        angle: 0,
        spinSpeed: 0,
        // Doesn't spin at start
        hasFlower: false,
        flowerColor: "",
        flowerRotation: 0
      },
      {
        id: 1,
        x: 180,
        y: 290,
        radius: 36,
        angle: Math.random() * Math.PI * 2,
        spinSpeed: -0.036,
        // Increased spin speed further (1.7x faster)
        hasFlower: false,
        flowerColor: "#ff9ebb",
        flowerRotation: Math.random() * Math.PI
      }
    ];
    let lastPad = initialPads[1];
    for (let i = 2; i <= 15; i++) {
      lastPad = generateNextPad(lastPad, i, 0);
      initialPads.push(lastPad);
    }
    s.pads = initialPads;
    s.frog = {
      x: 180,
      y: 440,
      angle: -Math.PI / 2,
      state: "IDLE",
      activePadId: 0,
      jumpProgress: 0,
      startX: 180,
      startY: 440,
      targetX: 180,
      targetY: 440,
      chargeRatio: 0,
      squishX: 1,
      squishY: 1
    };
    initialPads.slice(0, 3).forEach((p) => {
      addRipple(p.x, p.y, p.radius, p.radius + 15, 0.2, 1e3);
    });
  };
  useEffect(() => {
    const s = stateRef.current;
    const frogImage = new Image();
    frogImage.src = frogSpriteUrl;
    frogImage.onload = () => {
      s.sprites.frog = frogImage;
    };
    const lilyPadImage = new Image();
    lilyPadImage.src = lilyPadSpriteUrl;
    lilyPadImage.onload = () => {
      s.sprites.lilyPad = lilyPadImage;
    };
    const waterLilyImage = new Image();
    waterLilyImage.src = waterLilySpriteUrl;
    waterLilyImage.onload = () => {
      s.sprites.waterLily = waterLilyImage;
    };
    s.fishList = [
      { id: 1, x: 80, y: 150, angle: 0.2, speed: 0.4, size: 14, tailPhase: 0, color: "#16454a" },
      { id: 2, x: 280, y: 320, angle: -0.8, speed: 0.35, size: 12, tailPhase: 2, color: "#133e42" },
      { id: 3, x: 100, y: 480, angle: 1.4, speed: 0.3, size: 16, tailPhase: 4, color: "#10373c" }
    ];
    resetGame();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let animationId;
    const gameLoop = (timestamp) => {
      if (!stateRef.current.lastTime) {
        stateRef.current.lastTime = timestamp;
      }
      const dt = timestamp - stateRef.current.lastTime;
      stateRef.current.lastTime = timestamp;
      const clampedDt = Math.min(dt, 100);
      if (stateRef.current.isActive) {
        update(clampedDt);
      }
      render(ctx);
      animationId = requestAnimationFrame(gameLoop);
    };
    animationId = requestAnimationFrame(gameLoop);
    const resizeCanvas = () => {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = GAME_WIDTH * dpr;
      canvas.height = GAME_HEIGHT * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.imageSmoothingEnabled = false;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resizeCanvas);
      if (s.gameOverTimer) clearTimeout(s.gameOverTimer);
    };
  }, []);
  useEffect(() => {
    if (status === "START") {
      resetGame();
    }
  }, [status]);
  const generateNextPad = (prev, id, currentScore) => {
    let attempts = 0;
    let x = 180;
    let y = prev.y - 150;
    const radius = Math.max(25, 40 - Math.min(12, currentScore * 0.4));
    while (attempts < 15) {
      const angle = -Math.PI / 2 + (Math.random() - 0.5) * (Math.PI / 2.5);
      const distance = 130 + Math.random() * 80;
      x = prev.x + Math.cos(angle) * distance;
      y = prev.y + Math.sin(angle) * distance;
      if (x > 45 && x < 315) {
        break;
      }
      attempts++;
    }
    if (x < 45) x = 45 + Math.random() * 20;
    if (x > 315) x = 315 - Math.random() * 20;
    const spinDirection = id % 2 === 0 ? 1 : -1;
    const baseSpeed = 0.036;
    const speedIncr = Math.min(0.05, currentScore * 14e-4);
    const spinSpeed = spinDirection * (baseSpeed + speedIncr);
    const hasFlower = id % 5 === 0;
    const flowerColors = ["#ff9ebb", "#fcd5ce", "#ffffff", "#e2afff"];
    const flowerColor = flowerColors[Math.floor(Math.random() * flowerColors.length)];
    return {
      id,
      x,
      y,
      radius,
      angle: Math.random() * Math.PI * 2,
      spinSpeed,
      hasFlower,
      flowerColor,
      flowerRotation: Math.random() * Math.PI
    };
  };
  const addParticleBurst = (x, y, color, count, type = "water") => {
    const s = stateRef.current;
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1 + Math.random() * 3.5;
      const life = 1;
      const decay = 0.015 + Math.random() * 0.02;
      s.particles.push({
        id: s.nextParticleId++,
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - (type === "leaf" ? 0.5 : 0),
        // Slight float for leaves
        color,
        radius: type === "water" ? 2 + Math.random() * 3 : 1.5 + Math.random() * 2,
        alpha: 0.9,
        life,
        decay,
        type
      });
    }
  };
  const addRipple = (x, y, startR, maxR, alpha, duration) => {
    const s = stateRef.current;
    const decay = 1 / (duration / 16.6);
    s.ripples.push({
      id: s.nextRippleId++,
      x,
      y,
      radius: startR,
      maxRadius: maxR,
      alpha,
      life: 1,
      decay,
      lineWidth: 1.5
    });
  };
  const addFloatingText = (x, y, text, color = "#ffffff", fontSize = 18) => {
    const s = stateRef.current;
    s.floatingTexts.push({
      id: s.nextTextId++,
      x,
      y,
      text,
      color,
      fontSize,
      alpha: 1,
      life: 1,
      decay: 0.02,
      vy: -1.2
    });
  };
  const triggerSplashDown = (x, y) => {
    const s = stateRef.current;
    s.frog.state = "FALLING";
    onStatusChange("FALLING");
    s.status = "FALLING";
    sound.playSplash();
    addRipple(x, y, 5, 45, 0.7, 900);
    addRipple(x, y, 5, 25, 0.9, 600);
    addParticleBurst(x, y, "#a2e2fc", 22, "water");
    addFloatingText(x, y - 20, "Splash!", "#a4e8fc", 18);
    s.gameOverTimer = setTimeout(() => {
      onStatusChange("GAME_OVER");
    }, 1e3);
  };
  const handlePointerDown = (e) => {
    if (stateRef.current.status === "GAME_OVER" || stateRef.current.status === "FALLING") {
      return;
    }
    sound.setMute(isMuted);
    const s = stateRef.current;
    if (!s.tutorialInputConsumed) {
      s.tutorialInputConsumed = true;
      onFirstInput();
      return;
    }
    if (s.status === "START") {
      onStatusChange("PLAYING");
      s.status = "PLAYING";
    }
    if (s.frog.state === "IDLE") {
      e.currentTarget.setPointerCapture(e.pointerId);
      s.isPointerDown = true;
      s.pointerDownTime = Date.now();
      s.frog.state = "CHARGING";
      s.frog.chargeRatio = 0;
      s.lastChargeTickTime = Date.now();
      sound.playCharge(0);
    }
  };
  const handlePointerUp = (e) => {
    const s = stateRef.current;
    if (!s.isPointerDown || s.frog.state !== "CHARGING") {
      s.isPointerDown = false;
      return;
    }
    s.isPointerDown = false;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    s.frog.state = "JUMPING";
    s.frog.jumpProgress = 0;
    s.frog.startX = s.frog.x;
    s.frog.startY = s.frog.y;
    const distance = jumpDistance(s.frog.chargeRatio);
    s.frog.targetX = s.frog.x + distance * Math.cos(s.frog.angle);
    s.frog.targetY = s.frog.y + distance * Math.sin(s.frog.angle);
    sound.playJump();
    addRipple(s.frog.x, s.frog.y, 10, 35, 0.4, 400);
    if (!s.firstJumpHappened) {
      s.firstJumpHappened = true;
      if (s.pads[0]) {
        s.pads[0].spinSpeed = 0.045;
      }
    }
  };
  const checkLanding = () => {
    const s = stateRef.current;
    const f = s.frog;
    const landedPad = findLandingPad(f.targetX, f.targetY, s.pads);
    if (landedPad) {
      f.x = landedPad.x;
      f.y = landedPad.y;
      f.state = "IDLE";
      f.squishX = 1.3;
      f.squishY = 0.7;
      const oldActiveId = f.activePadId;
      if (landedPad.id === oldActiveId) {
        sound.playLand();
        addRipple(landedPad.x, landedPad.y, landedPad.radius, landedPad.radius + 15, 0.3, 500);
      } else if (landedPad.id > oldActiveId) {
        const padsSkipped = landedPad.id - oldActiveId;
        let pointsEarned = 1;
        sound.playLand();
        addRipple(landedPad.x, landedPad.y, landedPad.radius, landedPad.radius + 25, 0.5, 600);
        addParticleBurst(landedPad.x, landedPad.y, "#9feaa9", 10, "leaf");
        if (padsSkipped > 1) {
          pointsEarned = padsSkipped;
          addFloatingText(landedPad.x, landedPad.y - 25, `Skip! +${pointsEarned}`, "#ffd166", 20);
          addParticleBurst(landedPad.x, landedPad.y, "#ffd166", 12, "sparkle");
          sound.playHighScore();
        } else {
          addFloatingText(landedPad.x, landedPad.y - 25, `+1`, "#60ff88", 18);
          sound.playScore();
        }
        if (landedPad.hasFlower) {
          pointsEarned += 1;
          addFloatingText(landedPad.x, landedPad.y - 48, `Flower! +1`, "#ff9ebb", 16);
          addParticleBurst(landedPad.x, landedPad.y, landedPad.flowerColor, 15, "sparkle");
          landedPad.hasFlower = false;
          sound.playHighScore();
        }
        const newScore = s.score + pointsEarned;
        s.score = newScore;
        onScoreChange(newScore);
        if (newScore > s.highScore) {
          onHighScoreChange(newScore);
          if (!s.highScoreAnnounced) {
            s.highScoreAnnounced = true;
            addFloatingText(180, landedPad.y - 90, "NEW HIGH SCORE!", "#ffd166", 22);
            sound.playHighScore();
          }
        }
        f.activePadId = landedPad.id;
        s.targetCameraY = landedPad.y - 380;
        const highestPad = s.pads[s.pads.length - 1];
        if (landedPad.id >= s.pads.length - 6) {
          const newPads = [];
          let currentLast = highestPad;
          for (let i = s.pads.length; i < s.pads.length + 10; i++) {
            currentLast = generateNextPad(currentLast, i, newScore);
            newPads.push(currentLast);
          }
          s.pads = [...s.pads, ...newPads];
        }
      } else {
        sound.playLand();
        f.activePadId = landedPad.id;
        s.targetCameraY = landedPad.y - 380;
      }
    } else {
      triggerSplashDown(f.targetX, f.targetY);
    }
  };
  const update = (dt) => {
    const s = stateRef.current;
    if (s.firstJumpHappened && s.status === "PLAYING") {
      const baseScrollSpeed = 0.024;
      const scoreBonus = Math.min(0.04, s.score * 15e-4);
      const scrollSpeed = baseScrollSpeed + scoreBonus;
      s.targetCameraY -= scrollSpeed * dt;
    }
    s.cameraY += (s.targetCameraY - s.cameraY) * 0.08;
    s.fishList.forEach((fish) => {
      fish.tailPhase += fish.speed * 0.18 * (dt / 16.6);
      fish.x += Math.cos(fish.angle) * fish.speed * (dt / 16.6);
      fish.y += Math.sin(fish.angle) * fish.speed * (dt / 16.6);
      const relativeY = fish.y - s.cameraY;
      if (relativeY < -100 || relativeY > 660 || fish.x < -100 || fish.x > 460) {
        fish.x = Math.random() < 0.5 ? -40 : 400;
        fish.y = s.cameraY + 100 + Math.random() * 400;
        fish.angle = fish.x < 0 ? (Math.random() - 0.5) * 1 : Math.PI - (Math.random() - 0.5) * 1;
        fish.speed = 0.25 + Math.random() * 0.25;
      }
    });
    s.pads.forEach((pad) => {
      if (pad.y - s.cameraY > -100 && pad.y - s.cameraY < 660) {
        pad.angle += pad.spinSpeed * (dt / 16.6);
      }
    });
    const f = s.frog;
    if (f.state === "IDLE") {
      const activePad = s.pads.find((p) => p.id === f.activePadId);
      if (activePad) {
        f.x = activePad.x;
        f.y = activePad.y;
        if (s.firstJumpHappened) {
          f.angle = activePad.angle - Math.PI / 2;
        }
      }
      f.squishX += (1 - f.squishX) * 0.12 * (dt / 16.6);
      f.squishY += (1 - f.squishY) * 0.12 * (dt / 16.6);
    } else if (f.state === "CHARGING") {
      if (s.isPointerDown) {
        f.chargeRatio = Math.min(1, f.chargeRatio + s.chargeRate * dt);
        f.squishY = 0.75 + (1 - f.chargeRatio) * 0.15 + Math.sin(Date.now() * 0.05) * 0.02;
        f.squishX = 1.2 - (1 - f.chargeRatio) * 0.1 + Math.sin(Date.now() * 0.05 + Math.PI) * 0.02;
        const chargeAge = Date.now() - s.lastChargeTickTime;
        if (chargeAge > 100) {
          sound.playCharge(f.chargeRatio);
          s.lastChargeTickTime = Date.now();
          addParticleBurst(f.x + Math.cos(f.angle + Math.PI) * 10, f.y + Math.sin(f.angle + Math.PI) * 10, "#ffffff", 2, "bubble");
        }
      }
    } else if (f.state === "JUMPING") {
      const duration = jumpDuration(f.chargeRatio);
      f.jumpProgress = Math.min(1, f.jumpProgress + dt / duration);
      f.x = f.startX + (f.targetX - f.startX) * f.jumpProgress;
      f.y = f.startY + (f.targetY - f.startY) * f.jumpProgress;
      f.squishY = 1.3 - Math.sin(Math.PI * f.jumpProgress) * 0.25;
      f.squishX = 0.85 + Math.sin(Math.PI * f.jumpProgress) * 0.15;
      if (Math.random() < 0.2) {
        addParticleBurst(f.x, f.y - 0.35 * Math.sin(Math.PI * f.jumpProgress) * 120, "#ffffff", 1, "bubble");
      }
      if (f.jumpProgress >= 1) {
        checkLanding();
      }
    } else if (f.state === "FALLING") {
      f.angle += 0.18 * (dt / 16.6);
      f.squishX = Math.max(0, f.squishX - 0.025 * (dt / 16.6));
      f.squishY = Math.max(0, f.squishY - 0.025 * (dt / 16.6));
    }
    if (s.status === "PLAYING" && (f.state === "IDLE" || f.state === "CHARGING")) {
      if (f.y - s.cameraY > 550) {
        triggerSplashDown(f.x, f.y);
      }
    }
    s.particles = s.particles.filter((p) => {
      p.x += p.vx * (dt / 16.6);
      p.y += p.vy * (dt / 16.6);
      p.life -= p.decay * (dt / 16.6);
      p.alpha = Math.max(0, p.life);
      return p.life > 0;
    });
    s.ripples = s.ripples.filter((r) => {
      r.radius += (r.maxRadius - r.radius) * 0.07 * (dt / 16.6);
      r.life -= r.decay * (dt / 16.6);
      r.alpha = Math.max(0, r.life);
      return r.life > 0;
    });
    s.floatingTexts = s.floatingTexts.filter((t) => {
      t.y += t.vy * (dt / 16.6);
      t.life -= t.decay * (dt / 16.6);
      t.alpha = Math.max(0, t.life);
      return t.life > 0;
    });
  };
  const render = (ctx) => {
    const s = stateRef.current;
    ctx.clearRect(0, 0, 360, 560);
    const waterGrad = ctx.createRadialGradient(180, 280, 10, 180, 280, 360);
    waterGrad.addColorStop(0, "#3f65b3");
    waterGrad.addColorStop(1, "#263f78");
    ctx.fillStyle = waterGrad;
    ctx.fillRect(0, 0, 360, 560);
    ctx.save();
    ctx.translate(0, -s.cameraY);
    s.fishList.forEach((fish) => {
      ctx.save();
      ctx.translate(fish.x, fish.y);
      ctx.rotate(fish.angle);
      ctx.fillStyle = fish.color;
      ctx.globalAlpha = 0.16;
      ctx.beginPath();
      ctx.moveTo(-fish.size, 0);
      ctx.quadraticCurveTo(0, -fish.size * 0.35, fish.size, 0);
      ctx.quadraticCurveTo(0, fish.size * 0.35, -fish.size, 0);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(-fish.size, 0);
      const tailWiggle = Math.sin(fish.tailPhase) * (fish.size * 0.25);
      ctx.lineTo(-fish.size * 1.4, tailWiggle - fish.size * 0.2);
      ctx.lineTo(-fish.size * 1.3, tailWiggle);
      ctx.lineTo(-fish.size * 1.4, tailWiggle + fish.size * 0.2);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(-fish.size * 0.1, -fish.size * 0.3, fish.size * 0.3, fish.size * 0.15, -Math.PI / 6, 0, Math.PI * 2);
      ctx.ellipse(-fish.size * 0.1, fish.size * 0.3, fish.size * 0.3, fish.size * 0.15, Math.PI / 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
    ctx.globalAlpha = 1;
    s.ripples.forEach((r) => {
      ctx.save();
      ctx.beginPath();
      ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(164, 226, 252, ${r.alpha})`;
      ctx.lineWidth = r.lineWidth;
      ctx.stroke();
      ctx.restore();
    });
    s.pads.forEach((pad) => {
      if (pad.y - s.cameraY < -80 || pad.y - s.cameraY > 640) {
        return;
      }
      ctx.save();
      ctx.translate(pad.x, pad.y);
      ctx.beginPath();
      ctx.arc(4, 5, pad.radius, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(2, 10, 11, 0.45)";
      ctx.fill();
      ctx.rotate(pad.angle);
      if (s.sprites.lilyPad) {
        const diameter = pad.radius * 2;
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(s.sprites.lilyPad, -pad.radius, -pad.radius, diameter, diameter);
      } else {
        ctx.beginPath();
        ctx.arc(0, 0, pad.radius, 0.14 * Math.PI, 1.86 * Math.PI);
        ctx.lineTo(0, 0);
        ctx.closePath();
        ctx.fillStyle = "#28623d";
        ctx.fill();
      }
      if (pad.hasFlower) {
        ctx.save();
        ctx.rotate(pad.flowerRotation);
        if (s.sprites.waterLily) {
          const flowerSize = pad.radius * 1.5;
          ctx.imageSmoothingEnabled = false;
          ctx.drawImage(
            s.sprites.waterLily,
            -flowerSize / 2,
            -flowerSize / 2,
            flowerSize,
            flowerSize
          );
        }
        ctx.restore();
      }
      ctx.restore();
    });
    const f = s.frog;
    if (f.state === "CHARGING" && f.chargeRatio > 0.02) {
      ctx.save();
      const distance = jumpDistance(f.chargeRatio);
      const dotCount = 8 + Math.floor(8 * f.chargeRatio);
      for (let i = 1; i <= dotCount; i++) {
        const ratio = i / dotCount;
        const currDist = distance * ratio;
        const dotX = f.x + currDist * Math.cos(f.angle);
        const dotY = f.y + currDist * Math.sin(f.angle);
        const hPrev = 0.35 * currDist * Math.sin(Math.PI * ratio);
        ctx.beginPath();
        const dotRadius = 1.8 + 2 * ratio * f.chargeRatio;
        ctx.arc(dotX, dotY, dotRadius, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${120 - f.chargeRatio * 85}, 90%, 65%, ${0.9 - ratio * 0.3})`;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(dotX, dotY, dotRadius * 0.4, 0, Math.PI * 2);
        ctx.fillStyle = "#ffffff";
        ctx.fill();
      }
      const targetX = f.x + distance * Math.cos(f.angle);
      const targetY = f.y + distance * Math.sin(f.angle);
      ctx.beginPath();
      ctx.arc(targetX, targetY, 15 + Math.sin(Date.now() * 0.01) * 3, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(255, 209, 102, ${0.4 + f.chargeRatio * 0.5})`;
      ctx.lineWidth = 1.5;
      ctx.stroke();
      const barW = 34;
      const barH = 5;
      const barX = f.x - barW / 2;
      const barY = f.y - 40;
      ctx.fillStyle = "rgba(0, 0, 0, 0.45)";
      ctx.fillRect(barX, barY, barW, barH);
      const chargedW = barW * f.chargeRatio;
      const barColor = `hsl(${120 - f.chargeRatio * 90}, 85%, 55%)`;
      ctx.fillStyle = barColor;
      ctx.fillRect(barX, barY, chargedW, barH);
      ctx.restore();
    }
    if (f.state !== "FALLING" || f.squishX > 0.05 && f.squishY > 0.05) {
      ctx.save();
      let heightOffset = 0;
      let visualScale = 1;
      if (f.state === "JUMPING") {
        const dist = Math.hypot(f.targetX - f.startX, f.targetY - f.startY);
        heightOffset = jumpHeight(dist, f.jumpProgress);
        visualScale = 1 + 0.28 * f.jumpProgress * (1 - f.jumpProgress);
      }
      ctx.save();
      ctx.translate(f.x, f.y + 6);
      const shadowScaleFactor = f.state === "JUMPING" ? Math.max(0.4, 1 - heightOffset / 120) : 1;
      const shadowAlphaFactor = f.state === "JUMPING" ? Math.max(0.12, 0.45 - heightOffset / 160) : 0.45;
      ctx.scale(f.squishX * shadowScaleFactor, f.squishY * shadowScaleFactor * 0.85);
      ctx.beginPath();
      ctx.arc(0, 0, 16, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(2, 10, 12, ${shadowAlphaFactor})`;
      ctx.fill();
      ctx.restore();
      ctx.translate(f.x, f.y - heightOffset);
      ctx.rotate(f.angle + Math.PI / 2);
      ctx.scale(f.squishX * visualScale, f.squishY * visualScale);
      if (s.sprites.frog) {
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(s.sprites.frog, -32, -32, 64, 64);
        ctx.restore();
      } else {
        ctx.fillStyle = "#4aa352";
        ctx.save();
        ctx.translate(-11, 6);
        ctx.rotate(-0.35);
        ctx.beginPath();
        ctx.ellipse(0, 0, 7, 11, -0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        ctx.save();
        ctx.translate(11, 6);
        ctx.rotate(0.35);
        ctx.beginPath();
        ctx.ellipse(0, 0, 7, 11, 0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        ctx.fillStyle = "#3f9146";
        ctx.save();
        ctx.translate(-14, 15);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(-7, 6);
        ctx.lineTo(-1, 8);
        ctx.lineTo(3, 4);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
        ctx.save();
        ctx.translate(14, 15);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(7, 6);
        ctx.lineTo(1, 8);
        ctx.lineTo(-3, 4);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
        ctx.fillStyle = "#54be5d";
        ctx.save();
        ctx.translate(-10, -5);
        ctx.rotate(0.4);
        ctx.beginPath();
        ctx.ellipse(0, 0, 4, 8, 0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        ctx.save();
        ctx.translate(10, -5);
        ctx.rotate(-0.4);
        ctx.beginPath();
        ctx.ellipse(0, 0, 4, 8, -0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        const bodyGrad = ctx.createRadialGradient(-3, -3, 2, 0, 0, 16);
        bodyGrad.addColorStop(0, "#75e47e");
        bodyGrad.addColorStop(0.7, "#54be5d");
        bodyGrad.addColorStop(1, "#3a8742");
        ctx.beginPath();
        ctx.arc(0, 0, 15, 0, Math.PI * 2);
        ctx.fillStyle = bodyGrad;
        ctx.fill();
        ctx.strokeStyle = "#245a2a";
        ctx.lineWidth = 1.2;
        ctx.stroke();
        ctx.fillStyle = "#edfca1";
        ctx.beginPath();
        ctx.ellipse(0, 4, 9, 8, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.save();
        ctx.fillStyle = "#54be5d";
        ctx.strokeStyle = "#245a2a";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(-8, -13, 5.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(8, -13, 5.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = "#ffea62";
        ctx.beginPath();
        ctx.arc(-8, -13, 4.2, 0, Math.PI * 2);
        ctx.arc(8, -13, 4.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#0f1718";
        let pupilOffsetY = -1.2;
        let pupilOffsetX = 0;
        if (f.state === "CHARGING") {
          pupilOffsetY = -0.3;
        } else if (f.state === "JUMPING") {
          pupilOffsetY = -2.2;
        }
        ctx.beginPath();
        ctx.arc(-8 + pupilOffsetX, -13 + pupilOffsetY, 2.2, 0, Math.PI * 2);
        ctx.arc(8 + pupilOffsetX, -13 + pupilOffsetY, 2.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(-9.2, -14.2, 0.8, 0, Math.PI * 2);
        ctx.arc(6.8, -14.2, 0.8, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        ctx.fillStyle = "rgba(242, 143, 153, 0.6)";
        ctx.beginPath();
        ctx.arc(-9, -4, 2.5, 0, Math.PI * 2);
        ctx.arc(9, -4, 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(0, -3, 3.5, 0, Math.PI);
        ctx.strokeStyle = "#245a2a";
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.restore();
      }
    }
    s.particles.forEach((p) => {
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      if (p.type === "leaf") {
        ctx.translate(p.x, p.y);
        ctx.rotate(p.life * Math.PI * 2);
        ctx.beginPath();
        ctx.moveTo(0, -p.radius);
        ctx.lineTo(p.radius, 0);
        ctx.lineTo(0, p.radius);
        ctx.lineTo(-p.radius, 0);
        ctx.closePath();
        ctx.fill();
      } else if (p.type === "bubble") {
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    });
    ctx.globalAlpha = 1;
    s.floatingTexts.forEach((t) => {
      ctx.save();
      ctx.globalAlpha = t.alpha;
      ctx.fillStyle = t.color;
      ctx.shadowColor = "rgba(0,0,0,0.6)";
      ctx.shadowBlur = 4;
      ctx.shadowOffsetX = 1;
      ctx.shadowOffsetY = 1;
      ctx.font = `bold ${t.fontSize}px Inter, system-ui, sans-serif`;
      ctx.textAlign = "center";
      ctx.fillText(t.text, t.x, t.y);
      ctx.restore();
    });
    ctx.restore();
    if (s.status === "PLAYING" && (f.state === "IDLE" || f.state === "CHARGING")) {
      const dangerDist = f.y - s.cameraY;
      if (dangerDist > 410) {
        const intensity = Math.min(1, (dangerDist - 410) / 140);
        const pulse = 0.6 + 0.4 * Math.sin(Date.now() * 8e-3);
        const alpha = intensity * pulse * 0.45;
        ctx.save();
        const warnGrad = ctx.createLinearGradient(0, 560, 0, 400);
        warnGrad.addColorStop(0, `rgba(239, 68, 68, ${alpha})`);
        warnGrad.addColorStop(1, "rgba(239, 68, 68, 0)");
        ctx.fillStyle = warnGrad;
        ctx.fillRect(0, 400, 360, 160);
        if (dangerDist > 450) {
          ctx.font = "bold 11px JetBrains Mono, monospace";
          ctx.fillStyle = `rgba(254, 226, 226, ${intensity * pulse})`;
          ctx.textAlign = "center";
          ctx.fillText("JUMP!", 180, 532);
        }
        ctx.restore();
      }
    }
  };
  return <div
    className="frog-game-interactive relative w-full h-full cursor-pointer select-none touch-none bg-emerald-950 overflow-hidden"
    onPointerDown={handlePointerDown}
    onPointerUp={handlePointerUp}
    onPointerLeave={(event) => {
      if (event.pointerType === "mouse" && stateRef.current.isPointerDown) handlePointerUp(event);
    }}
    onPointerCancel={(event) => {
      const s = stateRef.current;
      s.isPointerDown = false;
      if (s.frog.state === "CHARGING") s.frog.state = "IDLE";
      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }
    }}
    id="game-container-interactive"
  >
      <canvas
    ref={canvasRef}
    className="frog-game-canvas block w-full h-full aspect-[9/14]"
    id="game-canvas-element"
  />
    </div>;
}
export {
  GameCanvas as default
};
