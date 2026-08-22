import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
await page.goto('http://localhost:5173/');
await page.waitForTimeout(4500);

const data = await page.evaluate(() => {
  const out = {}
  out.viewport = { w: window.innerWidth, h: window.innerHeight, dpr: window.devicePixelRatio }
  const allCanvas = document.querySelectorAll('canvas')
  out.canvases = Array.from(allCanvas).map(c => ({
    class: c.className,
    width: c.width,
    height: c.height,
    styleW: c.style.width,
    styleH: c.style.height,
  }))
  return out
});
console.log(JSON.stringify(data, null, 2));

await browser.close();