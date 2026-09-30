import { logger } from "../../utils/logger";
import { getShouldMuteAd } from "../../utils/config";
import {
  clickMuteBtn,
  getChannelInfo,
  isVideoMuted,
} from "../../utils/youtubeDOM";
import { Events, YouTubeEvents } from "../../utils/youtubeEvents";
import { EventHandler } from "../../utils/types";

export class AdMuter implements EventHandler {
  #mutedByExtension = false;

  public setupListeners(): void {
    YouTubeEvents.addListener(Events.adPlayStarted, () =>
      this.handleAdPlaybackStart()
    );
    YouTubeEvents.addListener(Events.adPlayEnded, () => this.resetSound());
  }

  private async handleAdPlaybackStart() {
    if (isVideoMuted()) {
      return;
    }

    const { channelId } = getChannelInfo();

    if (await getShouldMuteAd(channelId)) {
      logger.debug("video is NOT muted. Click button.");
      clickMuteBtn();
      this.#mutedByExtension = true;
    } else {
      logger.debug("Not muting ad for this channel: ", channelId);
    }
  }

  private resetSound(): void {
    if (this.#mutedByExtension && isVideoMuted()) {
      logger.debug("resetting audio.");
      clickMuteBtn();
    }

    this.#mutedByExtension = false;
  }
}
