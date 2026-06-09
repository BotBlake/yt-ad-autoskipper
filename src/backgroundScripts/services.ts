import { logger } from "../utils/logger";

export function configureChannel({
  channelId,
  channelName,
  imageUrl,
}: {
  channelId: string;
  channelName: string;
  imageUrl: string;
}): void {
  logger.debug("ChannelId: ", channelId);
  chrome.storage.local
    .set({
      page: `channel`,
      pageProps: {
        channelId,
        channelName,
        imageUrl,
      },
    })
    .then(() => {
      chrome.runtime.openOptionsPage();
    });
}

export function goPrefHome(): void {
  logger.debug("Going home");
  chrome.storage.local
    .set({
      page: `pref`,
      pageProps: {},
    })
    .then(() => {
      return chrome.runtime.openOptionsPage();
    });
}
