# QR Code Generator

A simple QR code generator you can use in the browser. Enter text or a URL, customize colors and size, then download your QR code as a PNG.

## Why I built this

I created this project to show that I understand core JavaScript—working with the DOM, handling events, using `localStorage`, and dealing with async behavior—and how to put together a small front-end with HTML and CSS. It’s a learning project and a portfolio piece.

## Features

- Customizable QR and background colors
- Size from 100px to 2000px
- Optional border on download (matches background)
- Dark / light mode (preference saved in the browser)
- Works offline once loaded
- Download as PNG

## Built with

- HTML, CSS, and vanilla JavaScript (no frameworks)
- [qrcode.js](https://github.com/davidshimjs/qrcodejs) for QR generation (loaded as `js/qrcode.min.js`)

## How to use

- **Live:** After deployment, open `https://<username>.github.io/<repo-name>/` (use your GitHub username and repo name).
- **Locally:** Open `index.html` in a browser to run it offline.

## Project structure

| File | Description |
|------|-------------|
| `index.html` | Main page and structure |
| `app.js` | App logic (QR generation, settings, download) |
| `style.css` | Layout and styling |
| `js/qrcode.min.js` | QR code library (offline-ready) |

## Browser support

Chrome, Firefox, Safari, Edge, and common mobile browsers.

## License

MIT — use and modify as you like.

---

By [Ramanus Netje](https://github.com/RamanusNetje)
