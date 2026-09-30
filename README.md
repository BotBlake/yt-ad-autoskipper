# yt-ad-autoskipper

A browser extension that automates skipping ads on YouTube. This is not an ad blocker; it automates the process of clicking the "Skip Ad" button, and also automatically closes overlay (banner) ads on the video player. It does not remove or block ads themselves.

This is useful when you are watching a YouTube video (or a playlist), and an ad starts playing. YouTube allows you to skip some ads after 5 seconds, but if you can't be bothered to click it yourself (or you are AFK), this extension clicks that button for you. Overlay ads that appear on top of the video are closed as soon as they appear, with no delay.

This is a detached fork of [squgeim/yt-ad-autoskipper](https://github.com/squgeim/yt-ad-autoskipper), so please show some love [there](https://paypal.me/squgeim). All premium features of the original Project will be available in this Fork for free.

## Download

Builds are currently not yet available whilst I figure out how to properly target Firefox and Chrome.
In the meantime all you can do is clone this repository and build it from source (see below).

## Building from source

This project uses a fixed Node.js version (see .nvmrc) and a committed package-lock.json to keep builds consistent and reproducible.

Get the source code you want to build:

- For the latest development version, clone the repository.
- For a specific released version, download the Source code (zip) archive from that version's GitHub Release.

Use the Node.js version specified in .nvmrc. If you use nvm, run:`nvm use`
Install the locked dependencies: `npm ci`
Build the extension: `npm run build`

The build creates:

- an unpacked extension in build/
- a `yt-ad-autoskipper-<version>.zip` file in the repository root

## ToDo

I forked the original Project because it was no longer working for me and wanted to look into fixing it myself. I am not very experienced in TypeScript or Browser Plugin development, so please bear with me whilst I'll figure it out. You can see what I have planned for this Project below:

- [X] fully re-enable hidden features (some pro features where hidden behind a paywall)
- [X] Visibility of configuration button within YouTube
- [] migrate to Universal Browser API instead of Chrome-exclusive API (allthough firefox also supports that)
- [X] figure out a proper release process and automate it via GHA
- [] Release on Chrome/Firefox Plugin store (?)
