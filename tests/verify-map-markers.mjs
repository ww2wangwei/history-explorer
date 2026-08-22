// 验证脚本：拖动时间轴后地图 markers 是否可见
// 用法：
//   1. 确保 dev server 跑着（npm run dev）
//   2. 浏览器登录 API Keys 设置好高德地图 key
//   3. node tests/verify-map-markers.mjs
//
// 看 3 张截图：
//   dist/verify-before.png — 拖动前
//   dist/verify-during.png — 拖动中
//   dist/verify-after.png — 拖动后
//
// 正常情况：3 张图都有地图 + markers + 都城名字
// 不正常：拖动后 markers 全部消失（地图空了）
import { chromium } from 'playwright';

const url = process.env.TEST_URL || 'http://localhost:5173/';
const outDir = 'dist';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
page.on('pageerror', err => console.log(`[pageerror] ${err.message}`));

try {
  await page.goto(url);
  // 等 splash + 初始加载
  await page.waitForTimeout(4500);

  // 进入地图视图
  const mapBtn = page.locator('button', { hasText: /地图浏览|地图/ }).first();
  if (await mapBtn.isVisible()) {
    await mapBtn.click();
    await page.waitForTimeout(2500);
    console.log('✓ 进入地图视图');
  } else {
    console.log('⚠ 未找到地图按钮');
  }

  // 截图：拖动前
  await page.screenshot({ path: `${outDir}/verify-before.png` });
  console.log('  📸 verify-before.png');

  // 找 Timeline 拖动
  const footer = page.locator('footer').first();
  await footer.waitFor({ state: 'visible', timeout: 5000 });
  const box = await footer.boundingBox();
  if (!box) throw new Error('footer not found');
  const sx = box.x + box.width * 0.5;
  const sy = box.y + box.height * 0.5;

  await page.mouse.move(sx, sy);
  await page.mouse.down();
  // 拖动 30 帧
  for (let i = 0; i < 30; i++) {
    await page.mouse.move(sx - (i + 1) * 25, sy, { steps: 1 });
    await page.waitForTimeout(20);
  }
  // 截图：拖动中
  await page.screenshot({ path: `${outDir}/verify-during.png` });
  console.log('  📸 verify-during.png');

  await page.mouse.up();
  await page.waitForTimeout(400);

  // 截图：拖动后
  await page.screenshot({ path: `${outDir}/verify-after.png` });
  console.log('  📸 verify-after.png');

  await browser.close();
  console.log('');
  console.log('请对比 3 张图：');
  console.log('  ✓ 都城名 (如「明朝」「罗马」) + 事件圆点 持续可见 → 正常');
  console.log('  ✗ 拖动后地图变空 / 只有底图 → bug 复现');
} catch (e) {
  console.log(`❌ FAIL: ${e.message}`);
  await browser.close();
  process.exit(1);
}