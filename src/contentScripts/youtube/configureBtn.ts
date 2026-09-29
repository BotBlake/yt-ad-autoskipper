import { CONFIGURE_CHANNEL } from "../../constants/actions";
import { logger } from "../../utils/logger";
import { EventHandler } from "../../utils/types";
import { isVideoPage, getChannelInfo } from "../../utils/youtubeDOM";
import { YouTubeEvents, Events } from "../../utils/youtubeEvents";

export class ConfigureChannelBtn implements EventHandler {
  tryAgain = false;

  public setupListeners(): void {
    YouTubeEvents.addListener(Events.locationChanged, (_, { location }) => {
      logger.debug("location change: ", location);
      this.handleLocation();
    });
    YouTubeEvents.addListener(Events.tick, () => {
      if (!this.hasButton()) {
        logger.debug("trying to create config button again.");
        this.tryAgain = false;
        this.createButton();
      }
    });
    this.createButton();
  }

  private handleLocation() {
    if (!isVideoPage()) {
      return;
    }

    this.createButton();
  }

  private hasButton() {
    return !!document.querySelector("#yas_config_channel_btn");
  }

  private createButton() {
    if (this.hasButton()) {
      return;
    }

    const metadata = document.querySelector("ytd-watch-metadata");

    if (!metadata) {
      logger.debug("Could not palce config button. Will try again next tick.");

      return;
    }

    const div = document.createElement("div");
    div.style.display = "flex";
    div.style.alignItems = "center";
    div.style.justifyContent = "center";

    const isDarkTheme = document.documentElement.hasAttribute("dark");
    const background = isDarkTheme ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)";
    const backgroundHover = isDarkTheme ? "rgba(255, 255, 255, 0.2)" : "rgba(0, 0, 0, 0.1)";
    const textColor = isDarkTheme ? "#f1f1f1" : "#0f0f0f";

    const btn = document.createElement("button");
    btn.type = "button";
    btn.id = "yas_config_channel_btn";
    btn.title = "Configure ad skipping for this channel";
    btn.textContent = "Configure Ads for this channel";
    btn.style.cursor = "pointer";
    btn.style.border = "none";
    btn.style.borderRadius = "18px";
    btn.style.padding = "0 16px";
    btn.style.height = "36px";
    btn.style.fontFamily = "Roboto, Arial, sans-serif";
    btn.style.fontSize = "14px";
    btn.style.fontWeight = "500";
    btn.style.color = textColor;
    btn.style.backgroundColor = background;
    btn.style.marginBottom = "1em";
    btn.onmouseenter = () => {
      btn.style.backgroundColor = backgroundHover;
    };
    btn.onmouseleave = () => {
      btn.style.backgroundColor = background;
    };

    btn.onclick = () => {
      const { channelId, channelName, imageUrl } = getChannelInfo();
      logger.debug("configure channel: ", channelId);

      chrome.runtime.sendMessage({
        type: CONFIGURE_CHANNEL,
        channel: {
          channelId,
          channelName,
          imageUrl,
        },
      });
    };

    div.append(btn);

    metadata.insertAdjacentElement("afterend", div);
  }
}
