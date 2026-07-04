/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { useState, useEffect } from "react";
import {
  Volume2,
  VolumeX,
  Trophy,
  RefreshCcw,
  Star
} from "lucide-react";
import GameCanvas from "./GameCanvas";
import { sound } from "../audio";
import githubIcon from "../assets/github.svg";
const GITHUB_REPOSITORY_URL = "https://github.com/der1py/frog-game";
function FrogGamePanel({ isActive = true }) {
  const [status, setStatus] = useState("START");
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [tutorialDismissed, setTutorialDismissed] = useState(false);
  const [tutorialExiting, setTutorialExiting] = useState(false);
  useEffect(() => {
    try {
      const savedHighScore = localStorage.getItem("frog_jumper_highscore");
      if (savedHighScore) {
        setHighScore(parseInt(savedHighScore, 10));
      }
      const savedMute = localStorage.getItem("frog_jumper_muted");
      if (savedMute) {
        const muted = savedMute === "true";
        setIsMuted(muted);
        sound.setMute(muted);
      }
    } catch (e) {
      console.warn("LocalStorage is not accessible:", e);
    }
  }, []);
  const handleHighScoreChange = (newHigh) => {
    setHighScore(newHigh);
    try {
      localStorage.setItem("frog_jumper_highscore", newHigh.toString());
    } catch (e) {
      console.warn("LocalStorage is not accessible:", e);
    }
  };
  const toggleMute = (e) => {
    e.stopPropagation();
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    sound.setMute(newMuted);
    try {
      localStorage.setItem("frog_jumper_muted", newMuted.toString());
    } catch (e2) {
      console.warn("LocalStorage is not accessible:", e2);
    }
  };
  const restartGame = () => {
    setScore(0);
    setTutorialDismissed(false);
    setTutorialExiting(false);
    setStatus("START");
  };
  const dismissTutorial = () => {
    if (!tutorialDismissed) {
      setTutorialExiting(true);
      setTutorialDismissed(true);
    }
  };
  return <div className="frog-game-panel-shell w-full flex flex-col items-center overflow-hidden relative font-sans">

      {
    /* ARCADE CABINET CASING FRAME */
  }
      <div
    className="frog-game-console relative w-full aspect-[9/14] z-10"
    id="arcade-console-body"
  >
        {
    /* INNER SCREEN CONTAINER (Exactly 360x560-like screen ratio frame) */
  }
        <div className="frog-game-screen relative w-full h-full overflow-hidden bg-[#3f65b3]">
          
          {
    /* THE GAME CANVAS WORLD */
  }
          <GameCanvas
    status={status}
    score={score}
    highScore={highScore}
    isMuted={isMuted}
    onScoreChange={setScore}
    onHighScoreChange={handleHighScoreChange}
    onStatusChange={setStatus}
    onFirstInput={dismissTutorial}
    isActive={isActive}
  />

          {
    /* HEADS-UP DISPLAY Overlay (Persistent top-left & top-right dashboard) */
  }
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none z-20">
            {
    /* External link and audio controls */
  }
            <div className="flex items-center gap-2 pointer-events-auto">
              <a
    href={GITHUB_REPOSITORY_URL}
    target="_blank"
    rel="noopener noreferrer"
    className="frog-game-ui-button"
    title="View on GitHub"
    aria-label="View the GitHub repository"
    onClick={(event) => event.stopPropagation()}
  >
                <img src={githubIcon} alt="" className="frog-game-github-icon w-4 h-4" />
              </a>

              <button
    onClick={toggleMute}
    className="frog-game-ui-button"
    title={isMuted ? "Unmute" : "Mute"}
    id="sound-toggle-btn"
  >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
            </div>

            {
    /* Scoreboard Block */
  }
            <div className="flex items-center gap-2">
              {
    /* High Score Panel */
  }
              <div className="frog-game-score text-amber-300">
                <Trophy className="w-3.5 h-3.5 fill-amber-300/20" />
                <span className="text-[10px] font-mono tracking-wider font-semibold">HI:</span>
                <span className="text-xs font-mono font-bold">{highScore}</span>
              </div>

              {
    /* Current Score Panel */
  }
              <div className="frog-game-score frog-game-score--current font-bold">
                <Star className="w-3.5 h-3.5 fill-emerald-950/20" />
                <span className="text-sm font-mono tracking-tight leading-none">{score}</span>
              </div>
            </div>
          </div>

          {
    /* TUTORIAL TEXT Overlay (disappears on first input) */
  }
          {(status === "START" || status === "PLAYING") && (!tutorialDismissed || tutorialExiting) && <div
    className={`frog-game-tutorial-wrap absolute bottom-28 left-0 right-0 flex flex-col items-center text-center pointer-events-none z-20 select-none px-6${tutorialExiting ? " frog-game-tutorial-wrap--exiting" : ""}`}
    onAnimationEnd={(event) => {
      if (event.target === event.currentTarget && tutorialExiting) {
        setTutorialExiting(false);
      }
    }}
  >
              <div className="frog-game-tutorial flex flex-col items-center gap-1">
                {
    /* Visual gesture tip */
  }
                <div className="relative w-8 h-8 mb-1">
                  <div className="absolute inset-0 rounded-full border-2 border-emerald-400 animate-pulse-ring" />
                  <div className="absolute inset-2 rounded-full bg-emerald-400 animate-ping" />
                </div>
                
                <h3 className="text-[13px] font-display font-semibold tracking-wider text-emerald-300 uppercase">
                  Tap to Jump
                </h3>
                <p className="text-[11px] text-emerald-500/80 tracking-wide font-mono">
                  Hold to jump longer
                </p>
                <p className="text-[11px] text-emerald-500/80 tracking-wide font-mono">
                  Touch anywhere to begin
                </p>
              </div>
            </div>}

          {
    /* GAME OVER OVERLAY */
  }
          {status === "GAME_OVER" && <div
    className="absolute top-[54%] left-0 right-0 -translate-y-1/2 flex justify-center px-6 pointer-events-none z-30 animate-fade-in"
    id="game-over-overlay"
  >
              {
    /* Mossy stone panel card */
  }
              <div className="frog-game-dialog pointer-events-auto text-center flex flex-col items-center">

                <h3 className="text-xl font-display font-extrabold tracking-wider text-red-400 uppercase mb-4">
                  Splash!
                </h3>

                {
    /* Scores Stats Board */
  }
                <div className="frog-game-stat-list w-full mb-5 flex flex-col gap-2 font-mono">
                  <div className="flex items-center justify-between text-xs text-emerald-400">
                    <span>Score</span>
                    <span className="text-base font-bold text-white font-sans">{score}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-emerald-600">
                    <span>High Score</span>
                    <span className="text-sm font-semibold text-white font-sans">{highScore}</span>
                  </div>
                </div>

                {
    /* New Record Text */
  }
                {score >= highScore && score > 0 && <div className="mb-5 text-amber-300 text-[10px] uppercase font-mono tracking-widest font-bold">
                    New High Score!
                  </div>}

                {
    /* Restart Button */
  }
                <button
    onClick={restartGame}
    className="frog-game-primary flex items-center justify-center gap-2"
    id="restart-action-btn"
  >
                  <RefreshCcw className="w-4 h-4" />
                  Jump Again
                </button>
              </div>
            </div>}

        </div>
      </div>

    </div>;
}
export {
  FrogGamePanel as default
};
