import React from "react";

const IOSLoader = ({ isLoading, message = "Loading..." }) => {
  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden bg-gray-50">
      {/* Animated Background */}
      <div className="absolute inset-0">
        {/* Moving gradient waves */}
        {/* <div className="absolute inset-0 bg-gradient-to-br from-sand-light via-white to-sand-light/50">
          <div className="absolute inset-0 opacity-40">
            <div 
              className="absolute inset-0 bg-gradient-to-r from-transparent via-sand-dark/10 to-transparent"
              style={{
                animation: 'moveWave 3s ease-in-out infinite',
                transform: 'translateX(-100%)'
              }}
            ></div>
            <div 
              className="absolute inset-0 bg-gradient-to-r from-transparent via-wet-sand/15 to-transparent"
              style={{
                animation: 'moveWave 4s ease-in-out infinite reverse',
                transform: 'translateX(100%)'
              }}
            ></div>
          </div>
        </div> */}

        {/* Floating sand particles */}
        {/* <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-sand-dark/20"
              style={{
                width: `${Math.random() * 4 + 2}px`,
                height: `${Math.random() * 4 + 2}px`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animation: `float ${3 + Math.random() * 4}s ease-in-out infinite`,
                animationDelay: `${Math.random() * 2}s`
              }}
            />
          ))}
        </div> */}

        {/* Subtle texture overlay */}
        {/* <div className="absolute inset-0 opacity-30">
          <svg width="100%" height="100%" viewBox="0 0 400 400" className="absolute inset-0">
            <defs>
              <pattern id="loaderTexture" patternUnits="userSpaceOnUse" width="50" height="50">
                <rect width="50" height="50" fill="transparent"/>
                <circle cx="10" cy="10" r="0.5" fill="#C9A77D" opacity="0.3">
                  <animate attributeName="opacity" values="0.1;0.5;0.1" dur="3s" repeatCount="indefinite" />
                </circle>
                <circle cx="40" cy="20" r="0.3" fill="#B8936A" opacity="0.4">
                  <animate attributeName="opacity" values="0.2;0.6;0.2" dur="4s" repeatCount="indefinite" />
                </circle>
                <circle cx="25" cy="35" r="0.8" fill="#E9CBA7" opacity="0.2">
                  <animate attributeName="opacity" values="0.1;0.4;0.1" dur="5s" repeatCount="indefinite" />
                </circle>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#loaderTexture)"/>
          </svg>
        </div> */}
      </div>

      {/* iOS-style content overlay */}
      <div className="relative z-10 flex items-center justify-center">
        {/* Bike Loader */}
        <div className="relative">
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

        {/* Loading message */}
        {/* <div className="text-center">
          <p className="text-gray-700 font-medium text-lg mb-2">{message}</p>
          <p className="text-gray-500 text-sm opacity-75">Please wait...</p>
        </div> */}
      </div>

      {/* Custom animations */}
      <style jsx>{`
        .bike {
          display: block;
          margin: auto;
          width: 16em;
          height: auto;
          color: #3b82f6; /* Blue color for the bike */
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
          stroke: #3b82f6; /* Blue color */
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

        /* Dark theme */
        @media (prefers-color-scheme: dark) {
          :root {
            --bg: hsl(var(--hue), 90%, 10%);
            --fg: hsl(var(--hue), 90%, 90%);
          }
        }

        /* Animations */
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
      `}</style>
    </div>
  );
};

export default IOSLoader;
