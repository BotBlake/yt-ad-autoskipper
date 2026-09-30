import { GO_PREF_HOME } from "../constants/actions";
import { AdsChannelPrefForm } from "./channelPrefForm";

const CSS = `
.channel-pref-header {
  margin-bottom: 1em;
  border-radius: 1em;
  background-color: var(--pref-box-bg);
  padding: 1em;
  display: flex;
  align-items: center;
  text-align: center;
}

.back-btn {
  border: none;
  color: inherit;
  border-radius: 50%;
  background: rgba(255,255,255, 0.1);
  width: 3em;
  aspect-ratio: 1;
  font-family: monospace;
  cursor: pointer;
}

.channel-logo {
  width: 3em;
  aspect-ratio: 1;
  border-radius: 1.5em;
  overflow: hidden;
}

.channel-pref-title {
  flex: 1;
}`;

const TEMPLATE = `
<div class="channel-pref-header">
  <button role="button" class="back-btn">&lt;</button>
  <h2 class="channel-pref-title">
    <slot name="channel-pref-title"></slot>
  </h2>
  <div class="channel-logo">
    <slot name="channel-logo"></slot>
  </div>
</div>
<slot name="channel-pref-form"></slot>
`;

export class AdsChannelPref extends HTMLElement {
  static elementName = "ads-channel-pref";

  constructor() {
    super();

    const style = document.createElement("style");
    style.textContent = CSS;
    const body = document.createElement("template");
    body.innerHTML = TEMPLATE;

    const root = this.attachShadow({ mode: "open" });
    root.append(style, body.content);
  }

  connectedCallback() {
    this.render();
  }

  render = () => {
    if (!this.shadowRoot) return;

    const [channelId, channelName, imageUrl] = [
      this.getAttribute("channel-id") ?? "",
      this.getAttribute("channel-name") ?? "",
      this.getAttribute("image-url") ?? "",
    ];

    this.shadowRoot.querySelector("button")?.addEventListener("click", () => {
      chrome.runtime.sendMessage({
        type: GO_PREF_HOME,
      });
    });

    this.replaceChildren();

    const titleSlot = document.createElement("slot");
    titleSlot.slot = "channel-pref-title";
    titleSlot.textContent = channelName;

    const logo = document.createElement("img");
    logo.slot = "channel-logo";
    logo.src = imageUrl;
    logo.alt = "";

    const form = document.createElement(AdsChannelPrefForm.elementName);
    form.slot = "channel-pref-form";
    form.setAttribute("channel-id", channelId);
    form.setAttribute("channel-name", channelName);
    form.setAttribute("image-url", imageUrl);

    this.append(titleSlot, logo, form);
  };
}

customElements.define(AdsChannelPref.elementName, AdsChannelPref);
