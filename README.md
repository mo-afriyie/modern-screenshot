<h1 align="center">modern-screenshot</h1>

<p align="center">
  <a href="https://unpkg.com/modern-screenshot">
    <img src="https://img.shields.io/bundlephobia/minzip/modern-screenshot" alt="Minzip">
  </a>
  <a href="https://www.npmjs.com/package/modern-screenshot">
    <img src="https://img.shields.io/npm/v/modern-screenshot.svg" alt="Version">
  </a>
  <a href="https://www.npmjs.com/package/modern-screenshot">
    <img src="https://img.shields.io/npm/dm/modern-screenshot" alt="Downloads">
  </a>
  <a href="https://github.com/qq15725/modern-screenshot/issues">
    <img src="https://img.shields.io/github/issues/qq15725/modern-screenshot" alt="Issues">
  </a>
  <a href="https://github.com/qq15725/modern-screenshot/blob/master/LICENSE">
    <img src="https://img.shields.io/npm/l/modern-screenshot.svg" alt="License">
  </a>
</p>

<p align="center">Quickly generate image or HTML from DOM node using HTML5 canvas and SVG</p>

<p align="center">Fork from <a href="https://github.com/bubkoo/html-to-image">html-to-image</a></p>

<p align="center">English | <a href="README.zh-CN.md">简体中文</a></p>

## 📦 Install

```sh
npm i modern-screenshot
```

## 🦄 Usage

```ts
import { domToHtml, domToPng } from 'modern-screenshot'

// Export as PNG image
domToPng(document.querySelector('#app')).then((dataUrl) => {
  const link = document.createElement('a')
  link.download = 'screenshot.png'
  link.href = dataUrl
  link.click()
})

// Export as clean HTML (new!)
domToHtml(document.querySelector('#app')).then((html) => {
  const blob = new Blob([html], { type: 'text/html' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'export.html'
  link.click()
})
```

<details>
<summary>CDN</summary><br>

```html
<script src="https://unpkg.com/modern-screenshot"></script>
<script>
  // Export as PNG
  modernScreenshot.domToPng(document.querySelector('body')).then(dataUrl => {
    const link = document.createElement('a')
    link.download = 'screenshot.png'
    link.href = dataUrl
    link.click()
  })

  // Export as clean HTML
  modernScreenshot.domToHtml(document.querySelector('body')).then(html => {
    const blob = new Blob([html], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'export.html'
    link.click()
  })
</script>
```

<br></details>

<details>
<summary>Browser Console</summary><br>

> ⚠️ Partial embedding will fail due to CORS

```js
const script = document.createElement('script')
script.src = 'https://unpkg.com/modern-screenshot/dist/index.js'
document.getElementsByTagName('head')[0].appendChild(script)

script.onload = () => {
  modernScreenshot
    .domToImage(document.querySelector('body'), {
      debug: true,
      progress: (current, total) => {
        console.log(`${current}/${total}`)
      }
    })
    .then((img) => {
      const width = 600
      const height = img.height * (width / img.width)
      console.log('%c ', [
        `padding: 0 ${width / 2}px;`,
        `line-height: ${height}px;`,
        `background-image: url('${img.src}');`,
        `background-size: 100% 100%;`,
      ].join(''))
    })
}
```

<br></details>

## Methods

> `method(node: Node, options?: Options)`

DOM to dataURL

- [domToPng](src/converts/dom-to-png.ts)
- [domToSvg](src/converts/dom-to-svg.ts)
- [domToJpeg](src/converts/dom-to-jpeg.ts)
- [domToWebp](src/converts/dom-to-webp.ts)
- [domToDataUrl](src/converts/dom-to-data-url.ts)

DOM to data

- [domToBlob](src/converts/dom-to-blob.ts)
- [domToPixel](src/converts/dom-to-pixel.ts)

DOM to HTMLElement

- [domToForeignObjectSvg](src/converts/dom-to-foreign-object-svg.ts)
- [domToImage](src/converts/dom-to-image.ts)
- [domToCanvas](src/converts/dom-to-canvas.ts)

DOM to HTML

- [domToHtml](src/converts/dom-to-html.ts)

## HTML Export

Export DOM elements as clean HTML with preserved image URLs for smaller file sizes and better performance.

```ts
import { domToHtml } from 'modern-screenshot'

// Clean HTML export (preserves original image URLs)
domToHtml(document.querySelector('#app')).then((html) => {
  console.log(html) // Clean HTML with original image URLs

  // Download the HTML file
  const blob = new Blob([html], { type: 'text/html' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'export.html'
  link.click()
})

// HTML export with embedded images (larger file size)
domToHtml(document.querySelector('#app'), {
  embedImages: true
}).then((html) => {
  console.log(html) // HTML with images converted to data URLs
})
```

### `embedImages` Option

Control whether images should be embedded as data URLs in the HTML export:

- **`embedImages: false`** (default for `domToHtml`) - Preserves original image URLs
  - ✅ Smaller file size
  - ✅ Faster processing
  - ✅ Cleaner HTML output
  - ✅ Removes `crossorigin` attributes to prevent CORS issues
  - ⚠️ Requires external images to be accessible

- **`embedImages: true`** (default for other exports) - Converts images to data URLs
  - ✅ Self-contained HTML
  - ✅ Works offline
  - ❌ Larger file size
  - ❌ Slower processing

```ts
// Clean HTML (recommended for most use cases)
const cleanHtml = await domToHtml(element, { embedImages: false })

// Embedded HTML (for offline/self-contained files)
const embeddedHtml = await domToHtml(element, { embedImages: true })

// Other export methods still embed images by default
const png = await domToPng(element) // embedImages: true by default
const svg = await domToSvg(element) // embedImages: true by default
```

## Options

See the [options.ts](src/options.ts)

## Singleton context and web worker

Quick screenshots per second by reusing context and web worker

```ts
import { createContext, destroyContext, domToPng } from 'modern-screenshot'
// use vite
import workerUrl from 'modern-screenshot/worker?url'

async function screenshotsPerSecond() {
  const context = await createContext(document.querySelector('#app'), {
    workerUrl,
    workerNumber: 1,
  })
  for (let i = 0; i < 10; i++) {
    domToPng(context).then((dataUrl) => {
      const link = document.createElement('a')
      link.download = `screenshot-${i + 1}.png`
      link.href = dataUrl
      link.click()
      if (i + 1 === 10) {
        destroyContext(context)
      }
    })
    await new Promise(resolve => setTimeout(resolve, 1000))
  }
}

screenshotsPerSecond()
```

See the [context.ts](src/context.ts)

## TODO

- [ ] unable to clone [css counters](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Counter_Styles/Using_CSS_counters)

  `content: counter(step);`
