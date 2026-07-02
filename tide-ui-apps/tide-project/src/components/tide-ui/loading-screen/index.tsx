import { useRef, useEffect, useState, useCallback } from "react";
import { LoadingScene } from "./LoadingScene";
import "./style.scss";

interface LoadingScreenProps {
  onFinished?: () => void;
  minDuration?: number;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({
  onFinished,
  minDuration = 2500,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<LoadingScene | null>(null);
  const [fadeOut, setFadeOut] = useState(false);
  const [showEnter, setShowEnter] = useState(false);

  const finish = useCallback(() => {
    setFadeOut(true);
    setTimeout(() => {
      onFinished?.();
    }, 600);
  }, [onFinished]);

  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new LoadingScene(containerRef.current);
    sceneRef.current = scene;
    scene.start();

    const enterTimer = setTimeout(() => {
      setShowEnter(true);
    }, 6000);

    return () => {
      clearTimeout(enterTimer);
      scene.dispose();
      sceneRef.current = null;
    };
  }, [finish, minDuration]);

  return (
    <div className={`loading-overlay${fadeOut ? " fade-out" : ""}`}>
      <div ref={containerRef} className="loading-canvas" />
      <div className="loading-content">
        <div className="loading-logo">
          <span className="logo-tide">Tide </span>
          <span className="logo-project">Project</span>
        </div>
        <div className="loading-progress">
          <div className="loading-bar" />
        </div>
        <span className="loading-subtitle">Initialize Project</span>
        {showEnter && (
          <button className={`loading-enter${showEnter ? " visible" : ""}`} onClick={finish}>
            Enter Project
          </button>
        )}
      </div>
    </div>
  );
};

export default LoadingScreen;