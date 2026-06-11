import { AdsChannelList } from "./channelsList";
import { logger } from "../utils/logger";
import { AdsChannelPref } from "./channelPref";
import { AdsChannelPrefForm } from "./channelPrefForm";

type State = {
  page: "pref" | "channel";
  pageProps: Record<string, unknown>;
};

const css = `
a:link,
a:visited {
  color: inherit;
}

.container {
  margin: 2em auto;
  max-width: 32em;
  opacity: 1;
  animation: animate-in 0.1s ease-in;
}

@keyframes animate-in {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1
  }
}

.container h1, .container h2 {
  font-weight: normal;
  padding: 0 1.5rem;
}

h2.title {
  font-size: 0.9em;
  opacity: 0.8;
  flex: 1;
  text-transform: uppercase;
}

.container p {
  margin: 0;
  margin-top: 0.5em;
  font-size: 0.8em;
  opacity: 0.5;
  text-transform: none;
}
`;

const template = `
<div class="container">
  <h1>Youtube Ad Auto-skipper</h1>
  <slot name="config">
    <div>
      <h2 class="title">
        Global Preferences
        <p>
          These preferences will be used for all videos unless there is a
          specific configuration for a YouTube channel defined below.
        </p>
      </h2>
      <${AdsChannelPrefForm.elementName} />
    </div>
    <div>
      <h2 class="title">
        Channel Preferences
        <p>
          You can configure Ad-Skipper to have a different behavior in videos
          by your favourite YouTubers.
        </p>
        <p>
          Did you know? YouTubers are paid 50% of the revenue from ads playing
          on their videos. You can support your favorite YouTubers by letting
          ads play longer on their channel.
        </p>
      </h2>
      <${AdsChannelList.elementName} />
    </div>
  </slot>
</div>`;

class AdsSettings extends HTMLElement {
  static elementName = "ads-settings";

  _state: State = {
    page: "pref",
    pageProps: {},
  };

  constructor() {
    super();

    const style = document.createElement("style");
    style.textContent = css;
    const body = document.createElement("template");
    body.innerHTML = template;

    const root = this.attachShadow({ mode: "open" });
    root.append(style, body.content);
  }

  connectedCallback() {
    this.attachListenerForPageChange();

    this.getPageFromStorage().then(({ page, pageProps }) => {
      this.state = {
        page,
        pageProps,
      };
    });
  }

  get state(): State {
    return this._state;
  }

  set state(newState: Partial<State>) {
    this._state = {
      ...this._state,
      ...newState,
    };
    this.render();
  }

  render = () => {
    this.innerHTML = "";

    if (this.state.page === "channel") {
      const { channelId, channelName, imageUrl } = this.state.pageProps;

      const slot = document.createElement("slot");
      slot.slot = "config";

      const channelConfig = document.createElement(AdsChannelPref.elementName);
      channelConfig.setAttribute("channel-id", channelId as string);
      channelConfig.setAttribute("channel-name", channelName as string);
      channelConfig.setAttribute("image-url", imageUrl as string);

      slot.append(channelConfig);

      this.append(slot);

      return;
    }
  };

  getPageFromStorage = async () => {
    const { page, pageProps } = await chrome.storage.local.get([
      "page",
      "pageProps",
    ]);

    if (!page) {
      return {
        page: this.state.page,
        pageProps: this.state.pageProps,
      };
    }

    await chrome.storage.local.remove(["page", "pageProps"]);

    return { page, pageProps };
  };

  attachListenerForPageChange = () => {
    const handlePageChange = async () => {
      const { page, pageProps } = await this.getPageFromStorage();

      logger.debug("Handling page change: ", page, pageProps);

      this.state = {
        page,
        pageProps,
      };
    };

    const handleMessage = (changes: Record<string, unknown>) => {
      if (
        "page" in changes &&
        "newValue" in (changes.page as Record<string, unknown>)
      ) {
        handlePageChange();
      }
    };

    chrome.storage.onChanged.addListener(handleMessage);
  };
}

customElements.define(AdsSettings.elementName, AdsSettings);
