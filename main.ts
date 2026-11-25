// 小厨神 · 快炒厨房的交卷程序（Node 22 标准库 only，无安装、无构建）。
// 它把仓库里的 game/（纯静态文件）和 screenshots/（真实渲染图）
// 原样抄到输出目录，再用 kit 的 vendor/makefun-game.ts 写出
// /output/dossier.json —— 截图和源码大纲就是裁判读到的那份。
// 本地验：mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// 评分器里 MAKEFUN_OUTPUT_DIR 不设，默认写 /output。

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

function copyTree(name: string): void {
  const from = join(repoRoot, name);
  if (existsSync(from)) cpSync(from, join(outDir, name), { recursive: true });
}

mkdirSync(outDir, { recursive: true });
copyTree('game');
mkdirSync(join(outDir, 'screenshots'), { recursive: true });
copyTree('screenshots');

// 门限照 kit 的 gate.json：截图最多 4 张、每张 256 KiB；
// game/ 最多 993 项、48 MiB；dossier 正文最多 160 KiB。
// 超了会在这里先报错，和评分器拒绝的理由一致。
writeFileSync(
  join(outDir, 'dossier.json'),
  buildDossier(outDir, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    game_max_files: 993,
    game_max_bytes: 50331648,
    game_path_max_bytes: 1000,
  }),
);
