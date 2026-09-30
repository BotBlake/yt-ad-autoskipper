import { mainLoop } from "./helpers";
import { logger } from "./logger";

export enum Events {
  tick = "tick",
  adPlayStarted = "adPlayStarted",
  adChanged = "adChanged",
  adPlayEnded = "adPlayEnded",
  locationChanged = "locationChanged",
}

const EventNames = Object.keys(Events);

type Callback = (
  prev: { ad: string | undefined; location: string },
  next: { ad: string | undefined; location: string }
) => void;

const callbacks: Record<string, Callback[]> = EventNames.reduce(
  (acc, evt) => ({ ...acc, [evt]: [] }),
  {}
);

// Reads the ad label straight from the player's DOM. Returns undefined when
// no ad is currently playing.
const getAdLabel = (): string | undefined =>
  document
    .querySelector(".ytp-ad-visit-advertiser-button")
    ?.getAttribute("aria-label") ??
  document
    .querySelector(".ytp-visit-advertiser-link")
    ?.getAttribute("aria-label") ??
  document.querySelector(".ytp-ad-badge")?.textContent ??
  undefined;

const MIN_EVALUATE_INTERVAL_MS = 200;

const startMainLoop = () => {
  let currentAd: string | undefined;
  let currentLoc = document.location.href;

  const evaluate = () => {
    const nextLoc = document.location.href;
    const adPlaying = getAdLabel();
    const eventsToCall: Events[] = [];
    const cbArg = [
      { ad: currentAd, location: currentLoc },
      { ad: adPlaying, location: nextLoc },
    ] as const;

    if (currentLoc !== nextLoc) {
      // location has changed.
      eventsToCall.push(Events.locationChanged);
      currentLoc = nextLoc;
    }

    if (currentAd !== adPlaying) {
      logger.debug("currentAd", currentAd);
      logger.debug("adPlaying", adPlaying);

      if (adPlaying) {
        // a new ad has started;
        eventsToCall.push(Events.adPlayStarted);
      }

      if (currentAd && adPlaying) {
        // ad has changed;
        eventsToCall.push(Events.adChanged);
      }

      if (currentAd && !adPlaying) {
        // ad has ended;
        eventsToCall.push(Events.adPlayEnded);
      }

      currentAd = adPlaying;
    }

    if (eventsToCall.length) logger.debug("Events", eventsToCall);

    // Dispatch all events
    eventsToCall.forEach((evt) => {
      callbacks[evt].forEach((cb) => {
        cb(cbArg[0], cbArg[1]);
      });
    });
  };

  let lastEvaluateAt = 0;
  let evaluateTimer: ReturnType<typeof setTimeout> | undefined;
  const scheduleEvaluate = () => {
    if (evaluateTimer) return;

    const elapsed = Date.now() - lastEvaluateAt;
    const delay = Math.max(0, MIN_EVALUATE_INTERVAL_MS - elapsed);

    evaluateTimer = setTimeout(() => {
      evaluateTimer = undefined;
      lastEvaluateAt = Date.now();
      evaluate();
    }, delay);
  };

  const observer = new MutationObserver(scheduleEvaluate);
  let observedPlayer = false;
  const observeTarget = () => {
    const player = document.querySelector("#movie_player");

    observer.observe(player ?? document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["aria-label", "class"],
    });
    observedPlayer = !!player;
  };
  observeTarget();

  // Once the player element becomes available, re-attach the observer to it
  // so we stop watching the whole document.
  const upgradeObserverIfNeeded = () => {
    if (!observedPlayer && document.querySelector("#movie_player")) {
      observer.disconnect();
      observeTarget();
    }
  };

  // YouTube's SPA router dispatches these events on navigation; popstate is
  // kept as a fallback for back/forward navigation.
  window.addEventListener("yt-navigate-finish", scheduleEvaluate);
  window.addEventListener("popstate", scheduleEvaluate);

  evaluate();
  lastEvaluateAt = Date.now();

  mainLoop(async () => {
    upgradeObserverIfNeeded();

    callbacks[Events.tick].forEach((cb) => {
      cb(
        { ad: currentAd, location: currentLoc },
        { ad: currentAd, location: currentLoc }
      );
    });
  }, 200);
};

export const YouTubeEvents = {
  isLoopStarted: false,
  startLoop: function () {
    if (this.isLoopStarted) {
      logger.debug("Loop already started.");
      return;
    }

    this.isLoopStarted = true;
    startMainLoop();
    logger.debug("Loop started");
  },
  addListener: (event: Events, cb: Callback): void => {
    if (!EventNames.includes(event as unknown as string)) {
      return;
    }

    callbacks[event].push(cb);
  },
};
