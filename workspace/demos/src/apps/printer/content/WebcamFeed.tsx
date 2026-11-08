import { loop } from "@studio-baeks/paper-ui";

import { bedLine, bedPlate, carriage as carriageClass, feed, fill, gantry as gantryClass, hotTip, live as liveClass, liveDot, mirror, partFront, partSide, partTop, picture, post, rate, turn } from "./webcam.css";

type Props = {
  x: number;
  y: number;
  z: number;
  progress: number;
  hot: boolean;
  fps: number;
  flipX?: boolean;
  flipY?: boolean;
  rotate?: 0 | 90 | 180 | 270;
  ratio?: string;
  live?: boolean;
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export const WebcamFeed = ({ x, y, z, progress, hot, fps, flipX = false, flipY = false, rotate = 0, ratio = "4 / 3", live = true }: Props) => {
  const carriage = 28 + clamp(x / 230, 0, 1) * 104;
  const gantry = clamp(96 - (z / 110) * 54, 34, 92);
  const shift = ((clamp(y, 0, 230) - 115) / 230) * 8;
  const height = 3 + clamp(progress, 0, 1) * 34;
  const flip = flipX && flipY ? mirror.both : flipX ? mirror.x : flipY ? mirror.y : mirror.none;
  return (
    <div className={feed} style={{ aspectRatio: ratio }}>
      <div className={`${fill} ${flip}`}>
        <svg viewBox="0 0 160 120" preserveAspectRatio="xMidYMid slice" width="100%" height="100%" role="img" aria-label="프린터 웹캠 화면 (모의)" className={`${picture} ${turn[rotate]}`}>
          <g transform={`translate(0 ${shift})`}>
            <polygon points="18,108 142,108 124,52 36,52" strokeWidth={0.6} className={bedPlate} />
            {[0.2, 0.4, 0.6, 0.8].map((t) => (
              <line key={`v${t}`} x1={36 + t * 88} y1={52} x2={18 + t * 124} y2={108} strokeWidth={0.4} className={bedLine} />
            ))}
            {[0.25, 0.5, 0.75].map((t) => (
              <line key={`h${t}`} x1={36 - t * 18} y1={52 + t * 56} x2={124 + t * 18} y2={52 + t * 56} strokeWidth={0.4} className={bedLine} />
            ))}
            <polygon points={`62,${96 - height} 98,${96 - height} 104,${88 - height} 68,${88 - height}`} className={partTop} />
            <rect x="62" y={96 - height} width="36" height={height} className={partFront} />
            <polygon points={`98,${96 - height} 104,${88 - height} 104,88 98,96`} className={partSide} />
          </g>
          <rect x="12" y={gantry} width="136" height="4" rx="1.5" className={gantryClass} />
          <rect x="10" y="22" width="4" height="86" rx="1.5" className={post} />
          <rect x="146" y="22" width="4" height="86" rx="1.5" className={post} />
          <rect x={carriage - 6} y={gantry - 4} width="12" height="12" rx="2" className={carriageClass} />
          <polygon points={`${carriage - 2.5},${gantry + 8} ${carriage + 2.5},${gantry + 8} ${carriage},${gantry + 13}`} className={carriageClass} />
          {hot ? <circle cx={carriage} cy={gantry + 13.5} r="2.2" className={hotTip} /> : null}
        </svg>
      </div>
      {live ? (
        <div className={liveClass}>
          <span className={`${loop.pulse} ${liveDot}`} />
          라이브
        </div>
      ) : null}
      <div className={rate}>FPS: {String(fps).padStart(2, "0")}</div>
    </div>
  );
};
