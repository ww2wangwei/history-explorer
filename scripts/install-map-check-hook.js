#!/usr/bin/env node
// Git post-commit hook：提醒检查时间轴拖动地图功能
// 安装方法（在项目根目录运行一次）：
//   node scripts/install-map-check-hook.js
import { execSync } from 'child_process';

try {
  // 配置 post-commit hook
  execSync(
    `git config core.hooksPath .git-hooks`,
    { stdio: 'inherit' }
  );
  console.log('✓ 已配置 git hook: core.hooksPath = .git-hooks');
  console.log('');
  console.log('以后每次 git commit 后会自动提醒运行：');
  console.log('  npm run verify:map');
} catch (e) {
  console.error('失败：', e.message);
  process.exit(1);
}