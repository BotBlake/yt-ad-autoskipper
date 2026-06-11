# yt-ad-autoskipper

A browser extension that automates skipping ad on YouTube. This is not an ad blocker, it just automates the process of clicking on the "Skip Ad" button on YouTube.

This is useful when you are watching a YouTube video (or a playlist), and an ad starts playing. YouTube allows you to skip the ad after 5 seconds, but if you can't be bothered to click it yourself (or you are AFK), this extension clicks that button for you.

This is a detached fork of [squgeim/yt-ad-autoskipper](https://github.com/squgeim/yt-ad-autoskipper), so please show some love [there](https://paypal.me/squgeim). All premium features of the original Project will be available in this Fork for free.

## Download

Builds are currently not yet available whilst I figure out how to properly target Firefox and Chrome.
In the meantime all you can do is clone this repository and run `npm build`.

## ToDo

I forked the original Project because it was no longer working for me and wanted to look into fixing it myself. I am not very experienced in TypeScript or Browser Plugin development, so please bear with me whilst I'll figure it out. You can see what I have planned for this Project below:

- [] fully re-enable subscribtion service (some pro features where hidden behind a paywall) https://github.com/BotBlake/yt-ad-autoskipper/pull/5
- Fix some issues caused by new YouTube layout
- [] migrate to Universal Browser API instead of Chrome-exclusive API (allthough firefox also supports that)
- [] figure out a proper release process and automate it via GHA
- [] Release on Chrome/Firefox Plugin store (?)
