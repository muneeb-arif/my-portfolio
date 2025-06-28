import React, { useEffect, useRef } from "react";

const RainLoader = ({ isLoading, message = "Loading..." }) => {
  const rainRef = useRef(null);

  useEffect(() => {
    if (isLoading && rainRef.current) {
      // Generate 1000 raindrops
      const rain = rainRef.current;
      rain.innerHTML = ``;
      
      // Adjust number of raindrops based on screen size for performance
      const screenWidth = window.innerWidth;
      let dropCount = 1000; // Default for desktop
      
      if (screenWidth <= 480) {
        dropCount = 300; // Fewer drops for small mobile
      } else if (screenWidth <= 768) {
        dropCount = 600; // Medium amount for tablets/large mobile
      }
      
      for (let i = 0; i < dropCount; i++) {
        const drop = document.createElement('div');
        drop.className = 'drop';
        rain.appendChild(drop);
      }
    }
  }, [isLoading]);

  if (!isLoading) return null;

  return (
    <div className="rain-loader-container">
      <div className="rain" ref={rainRef}>
      </div>
      
      {/* Bicycle loader in center */}
      <div className="bicycle-center">
        <div className="w-16 h-10">
          <svg class="bike" viewBox="0 0 48 30" width="48px" height="30px">
            <g
              fill="none"
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="1"
            >
              <g transform="translate(9.5,19)">
                <circle
                  class="bike__tire"
                  r="9"
                  stroke-dasharray="56.549 56.549"
                />
                <g
                  class="bike__spokes-spin"
                  stroke-dasharray="31.416 31.416"
                  stroke-dashoffset="-23.562"
                >
                  <circle class="bike__spokes" r="5" />
                  <circle
                    class="bike__spokes"
                    r="5"
                    transform="rotate(180,0,0)"
                  />
                </g>
              </g>
              <g transform="translate(24,19)">
                <g
                  class="bike__pedals-spin"
                  stroke-dasharray="25.133 25.133"
                  stroke-dashoffset="-21.991"
                  transform="rotate(67.5,0,0)"
                >
                  <circle class="bike__pedals" r="4" />
                  <circle
                    class="bike__pedals"
                    r="4"
                    transform="rotate(180,0,0)"
                  />
                </g>
              </g>
              <g transform="translate(38.5,19)">
                <circle
                  class="bike__tire"
                  r="9"
                  stroke-dasharray="56.549 56.549"
                />
                <g
                  class="bike__spokes-spin"
                  stroke-dasharray="31.416 31.416"
                  stroke-dashoffset="-23.562"
                >
                  <circle class="bike__spokes" r="5" />
                  <circle
                    class="bike__spokes"
                    r="5"
                    transform="rotate(180,0,0)"
                  />
                </g>
              </g>
              <polyline
                class="bike__seat"
                points="14 3,18 3"
                stroke-dasharray="5 5"
              />
              <polyline
                class="bike__body"
                points="16 3,24 19,9.5 19,18 8,34 7,24 19"
                stroke-dasharray="79 79"
              />
              <path
                class="bike__handlebars"
                d="m30,2h6s1,0,1,1-1,1-1,1"
                stroke-dasharray="10 10"
              />
              <polyline
                class="bike__front"
                points="32.5 2,38.5 19"
                stroke-dasharray="19 19"
              />
            </g>
          </svg>
        </div>
      </div>
      
      <style jsx>{`
        @property --angle {
          syntax: "<angle>";
          inherits: false;
          initial-value: 91deg;
        }

        .rain-loader-container {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          margin: 0;
          padding: 0;
          overflow: hidden;
          background: linear-gradient(180deg, #07131c, #305472);
          z-index: 9999;
        }

        /* Mobile viewport fixes */
        @media (max-width: 768px) {
          .rain-loader-container {
            width: 100dvw;
            height: 100dvh;
            /* Fallback for older browsers */
            width: 100vw;
            height: 100vh;
          }
        }

        .rain-loader-container:after {
          content: "CLICK & HOLD TO CREATE LIGHTNING";
          font-family: Arial, Helvetica, sans-serif;
          font-size: 12px;
          position: absolute;
          width: 100%;
          text-align: center;
          bottom: 18px;
          color: rgba(255, 255, 255, 0.27);
          z-index: -1;
        }

        /* Mobile responsiveness */
        @media (max-width: 768px) {
          .rain-loader-container:after {
            content: "TAP & HOLD TO CREATE LIGHTNING";
            font-size: 10px;
            bottom: 12px;
          }
        }

        @media (max-width: 480px) {
          .rain-loader-container:after {
            font-size: 9px;
            bottom: 10px;
          }
        }

        .rain-loader-container:active:before,
        .rain-loader-container:active:after {
          color: rgba(255, 255, 255, 0);
          transition: all 0.5s ease 0s;
        }

        .rain {
          position: absolute;
          width: 120vw;
          height: 100vh;
          cursor: pointer;
          z-index: 0;
          left: -10vw;
          touch-action: manipulation; /* Optimize touch interactions */
        }

        /* Mobile touch optimizations */
        @media (max-width: 768px) {
          .rain {
            width: 110vw;
            left: -5vw;
          }
        }

        @media (max-width: 480px) {
          .rain {
            width: 105vw;
            left: -2.5vw;
          }
        }

        .rain:active {
          cursor: none;
          animation: lightning 0.1s linear 0s 2, lightning 0.15s ease-out 0.25s 1;
        }

        @keyframes lightning {
          50% {
            background: radial-gradient(
                circle at calc(50% - 10vw) -20%,
                rgba(255, 255, 255, 0.27),
                rgba(255, 255, 255, 0) 20%
              ),
              linear-gradient(180deg, rgba(255, 255, 255, 0.6), rgba(255, 255, 255, 0.2));
          }
        }

        .drop {
          border: 0.25vmin solid transparent;
          border-bottom-color: #abc2e9;
          position: absolute;
          top: -5vmin;
          --angle: 91deg;
        }

        /* Mobile optimized raindrops */
        @media (max-width: 768px) {
          .drop {
            border-width: 0.2vmin;
          }
        }

        @media (max-width: 480px) {
          .drop {
            border-width: 0.15vmin;
          }
          
          /* Optimize specific drop patterns for mobile */
          .drop:nth-child(10n+1) { animation-duration: 0.9s; }
          .drop:nth-child(10n+2) { animation-duration: 0.7s; }
          .drop:nth-child(10n+3) { animation-duration: 0.8s; }
          .drop:nth-child(10n+4) { animation-duration: 0.75s; }
          .drop:nth-child(10n+5) { animation-duration: 1s; }
        }

        .drop:nth-child(10n+1) {
          opacity: 0.8;
          left: 5vw;
          border-left-width: 0.8vmin;
          animation: fall1 0.8s -0.4s ease-in infinite;
        }

        .drop:nth-child(10n+2) {
          opacity: 0.6;
          left: 15vw;
          border-left-width: 0.5vmin;
          animation: fall2 0.6s -0.2s ease-in infinite;
        }

        .drop:nth-child(10n+3) {
          opacity: 0.9;
          left: 25vw;
          border-left-width: 0.3vmin;
          animation: fall3 0.7s -0.5s ease-in infinite;
        }

        .drop:nth-child(10n+4) {
          opacity: 0.7;
          left: 35vw;
          border-left-width: 0.6vmin;
          animation: fall4 0.65s -0.3s ease-in infinite;
        }

        .drop:nth-child(10n+5) {
          opacity: 0.85;
          left: 45vw;
          border-left-width: 0.4vmin;
          animation: fall5 0.9s -0.6s ease-in infinite;
        }

        .drop:nth-child(10n+6) {
          opacity: 0.75;
          left: 55vw;
          border-left-width: 0.7vmin;
          animation: fall1 0.75s -0.1s ease-in infinite;
        }

        .drop:nth-child(10n+7) {
          opacity: 0.9;
          left: 65vw;
          border-left-width: 0.2vmin;
          animation: fall2 0.55s -0.4s ease-in infinite;
        }

        .drop:nth-child(10n+8) {
          opacity: 0.6;
          left: 75vw;
          border-left-width: 0.9vmin;
          animation: fall3 0.85s -0.2s ease-in infinite;
        }

        .drop:nth-child(10n+9) {
          opacity: 0.8;
          left: 85vw;
          border-left-width: 0.4vmin;
          animation: fall4 0.7s -0.6s ease-in infinite;
        }

        .drop:nth-child(10n+10) {
          opacity: 0.95;
          left: 95vw;
          border-left-width: 0.3vmin;
          animation: fall5 0.6s -0.3s ease-in infinite;
        }

        /* Additional random drops for more density */
        .drop:nth-child(17n+1) {
          opacity: 0.7;
          left: 12vw;
          border-left-width: 0.6vmin;
          animation: fall1 0.9s -0.8s ease-in infinite;
        }

        .drop:nth-child(23n+3) {
          opacity: 0.8;
          left: 33vw;
          border-left-width: 0.5vmin;
          animation: fall2 0.7s -0.1s ease-in infinite;
        }

        .drop:nth-child(31n+7) {
          opacity: 0.6;
          left: 67vw;
          border-left-width: 0.8vmin;
          animation: fall3 0.65s -0.7s ease-in infinite;
        }

        .drop:nth-child(37n+11) {
          opacity: 0.9;
          left: 78vw;
          border-left-width: 0.4vmin;
          animation: fall4 0.8s -0.2s ease-in infinite;
        }

        /* Bicycle loader styles */
        .bicycle-center {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          z-index: 10;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* Mobile centering fixes */
        @media (max-width: 768px) {
          .bicycle-center {
            position: fixed;
            top: 50vh;
            left: 50vw;
            transform: translate(-50%, -50%);
            width: 100px;
            height: 100px;
            display: flex;
            align-items: center;
            justify-content: center;
          }
        }

        @media (max-width: 480px) {
          .bicycle-center {
            position: fixed;
            top: calc(50vh - env(safe-area-inset-top) / 2);
            left: 50vw;
            transform: translate(-50%, -50%);
            width: 80px;
            height: 80px;
            display: flex;
            align-items: center;
            justify-content: center;
          }
        }

        /* iPhone specific fixes */
        @media (max-width: 430px) and (max-height: 932px) {
          .bicycle-center {
            position: fixed;
            top: 50dvh; /* Dynamic viewport height for modern browsers */
            left: 50dvw;
            transform: translate(-50%, -50%);
            width: 70px;
            height: 70px;
          }
        }

        /* Additional mobile centering fallback */
        @supports not (height: 100dvh) {
          @media (max-width: 768px) {
            .bicycle-center {
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
              margin: 0;
            }
          }
        }

        /* Ultra-specific iPhone 14 Pro Max fix */
        @media (device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3) {
          .bicycle-center {
            position: fixed;
            top: 466px; /* Exact center of iPhone 14 Pro Max */
            left: 215px;
            transform: translate(-50%, -50%);
            width: 70px;
            height: 70px;
          }
        }

        .bike {
          display: block;
          width: 12em;
          height: auto;
          color: white;
        }

        /* Mobile responsive bicycle */
        @media (max-width: 768px) {
          .bike {
            width: 10em;
          }
        }

        @media (max-width: 480px) {
          .bike {
            width: 8em;
          }
        }

        @media (max-width: 320px) {
          .bike {
            width: 6em;
          }
        }

        /* Landscape orientation adjustments */
        @media (max-height: 500px) and (orientation: landscape) {
          .bike {
            width: 8em;
          }
          
          .rain-loader-container:after {
            font-size: 8px;
            bottom: 8px;
          }
        }

        /* Ultra-wide mobile screens */
        @media (max-width: 320px) {
          .rain-loader-container:after {
            font-size: 8px;
            padding: 0 10px;
          }
        }

        /* High-DPI display optimizations */
        @media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
          .drop {
            border-width: 0.3vmin; /* Slightly thicker for retina */
          }
          
          .bike {
            filter: drop-shadow(0 0 1px rgba(255, 255, 255, 0.3)); /* Subtle glow for crisp edges */
          }
        }

        .bike__body,
        .bike__front,
        .bike__handlebars,
        .bike__pedals,
        .bike__pedals-spin,
        .bike__seat,
        .bike__spokes,
        .bike__spokes-spin,
        .bike__tire {
          animation: bikeBody 3s ease-in-out infinite;
          stroke: white;
          transition: stroke 0.3s ease;
        }

        .bike__front {
          animation-name: bikeFront;
        }

        .bike__handlebars {
          animation-name: bikeHandlebars;
        }

        .bike__pedals {
          animation-name: bikePedals;
        }

        .bike__pedals-spin {
          animation-name: bikePedalsSpin;
        }

        .bike__seat {
          animation-name: bikeSeat;
        }

        .bike__spokes,
        .bike__tire {
          stroke: currentColor;
        }

        .bike__spokes {
          animation-name: bikeSpokes;
        }

        .bike__spokes-spin {
          animation-name: bikeSpokesSpin;
        }

        .bike__tire {
          animation-name: bikeTire;
        }

        /* Bike animations */
        @keyframes bikeBody {
          from {
            stroke-dashoffset: 79;
          }
          33%,
          67% {
            stroke-dashoffset: 0;
          }
          to {
            stroke-dashoffset: -79;
          }
        }

        @keyframes bikeFront {
          from {
            stroke-dashoffset: 19;
          }
          33%,
          67% {
            stroke-dashoffset: 0;
          }
          to {
            stroke-dashoffset: -19;
          }
        }

        @keyframes bikeHandlebars {
          from {
            stroke-dashoffset: 10;
          }
          33%,
          67% {
            stroke-dashoffset: 0;
          }
          to {
            stroke-dashoffset: -10;
          }
        }

        @keyframes bikePedals {
          from {
            animation-timing-function: ease-in;
            stroke-dashoffset: -25.133;
          }
          33%,
          67% {
            animation-timing-function: ease-out;
            stroke-dashoffset: -21.991;
          }
          to {
            stroke-dashoffset: -25.133;
          }
        }

        @keyframes bikePedalsSpin {
          from {
            transform: rotate(0.1875turn);
          }
          to {
            transform: rotate(3.1875turn);
          }
        }

        @keyframes bikeSeat {
          from {
            stroke-dashoffset: 5;
          }
          33%,
          67% {
            stroke-dashoffset: 0;
          }
          to {
            stroke-dashoffset: -5;
          }
        }

        @keyframes bikeSpokes {
          from {
            animation-timing-function: ease-in;
            stroke-dashoffset: -31.416;
          }
          33%,
          67% {
            animation-timing-function: ease-out;
            stroke-dashoffset: -23.562;
          }
          to {
            stroke-dashoffset: -31.416;
          }
        }

        @keyframes bikeSpokesSpin {
          from {
            transform: rotate(0);
          }
          to {
            transform: rotate(3turn);
          }
        }

        @keyframes bikeTire {
          from {
            animation-timing-function: ease-in;
            stroke-dashoffset: 56.549;
            transform: rotate(0);
          }
          33% {
            stroke-dashoffset: 0;
            transform: rotate(0.33turn);
          }
          67% {
            animation-timing-function: ease-out;
            stroke-dashoffset: 0;
            transform: rotate(0.67turn);
          }
          to {
            stroke-dashoffset: -56.549;
            transform: rotate(1turn);
          }
        }

        @keyframes fall1 {
          25% {
            transform: rotate(var(--angle)) translateX(0);
          }
          to {
            transform: rotate(var(--angle)) translateX(calc(100vh + 5vmin));
          }
        }

        @keyframes fall2 {
          15% {
            transform: rotate(var(--angle)) translateX(0);
          }
          to {
            transform: rotate(var(--angle)) translateX(calc(100vh + 5vmin));
          }
        }

        @keyframes fall3 {
          35% {
            transform: rotate(var(--angle)) translateX(0);
          }
          to {
            transform: rotate(var(--angle)) translateX(calc(100vh + 5vmin));
          }
        }

        @keyframes fall4 {
          20% {
            transform: rotate(var(--angle)) translateX(0);
          }
          to {
            transform: rotate(var(--angle)) translateX(calc(100vh + 5vmin));
          }
        }

        @keyframes fall5 {
          30% {
            transform: rotate(var(--angle)) translateX(0);
          }
          to {
            transform: rotate(var(--angle)) translateX(calc(100vh + 5vmin));
          }
        }
      `}</style>
    </div>
  );
};

export default RainLoader; 