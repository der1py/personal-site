import { useEffect, useId, useState } from "react";
import frogSpriteUrl from "../assets/frog-icon.png";
import FrogGamePanel from "./FrogGamePanel";
function FrogGameWidget({
  defaultOpen = false,
  position = "bottom-right",
  size = "default"
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const panelId = useId();
  useEffect(() => {
    if (!isOpen) return;
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [isOpen]);
  return <aside
    className={`frog-game-widget frog-game-widget--${position} frog-game-widget--${size}`}
    aria-label="Frog jumping game"
  >
      <div
    id={panelId}
    className={`frog-game-popup${isOpen ? " frog-game-popup--open" : ""}`}
    aria-hidden={!isOpen}
    inert={!isOpen ? true : void 0}
  >
        <FrogGamePanel isActive={isOpen} />
      </div>

      <button
    type="button"
    className={`frog-game-launcher${isOpen ? " frog-game-launcher--open" : ""}`}
    onClick={() => setIsOpen((open) => !open)}
    aria-label={isOpen ? "Close frog game" : "Open frog game"}
    aria-expanded={isOpen}
    aria-controls={panelId}
  >
        <img src={frogSpriteUrl} alt="" aria-hidden="true" />
      </button>
    </aside>;
}
var FrogGameWidget_default = FrogGameWidget;
export {
  FrogGameWidget,
  FrogGameWidget_default as default
};
