import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
await page.goto('http://localhost:5173/');
await page.waitForTimeout(4500);

// 检查 AMap 内部元素的 GPU 状态
const result = await page.evaluate(() => {
  const out = {};
  out.hasAmapContainer = !!document.querySelector('.amap-container');
  const amap = document.querySelector('.amap-container');
  const canvas = document.querySelector('.amap-container canvas');
  if (amap) {
    const s = getComputedStyle(amap);
    out.amapContainer = {
      transform: s.transform,
      willChange: s.willChange,
      backfaceVisibility: s.backfaceVisibility,
    };
  }
  if (canvas) {
    const s = getComputedStyle(canvas);
    out.canvas = {
      transform: s.transform,
      willChange: s.willChange,
      backfaceVisibility: s.backfaceVisibility,
    };
  }
  return out;
});
console.log(JSON.stringify(result, null, 2));

await browser.close();