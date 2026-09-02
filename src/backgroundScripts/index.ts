import { CONFIGURE_CHANNEL, GO_PREF_HOME } from "../constants/actions";
import { logger } from "../utils/logger";
import { configureChannel, goPrefHome } from "./services";

chrome.runtime.onMessage.addListener((message) => {
  if (!("type" in message)) {
    return;
  }

  logger.debug("Message received: ", message);

  switch (message.type) {
    case CONFIGURE_CHANNEL:
      configureChannel(message.channel);
      break;
    case GO_PREF_HOME:
      goPrefHome();
      break;
  }
});

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === "install") {
    chrome.runtime.openOptionsPage();

    return;
  }
});

chrome.action.onClicked.addListener(() => {
  chrome.runtime.openOptionsPage();
});
