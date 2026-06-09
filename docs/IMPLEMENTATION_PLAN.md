# Moyu VS Code Extension Implementation Plan

创建日期：2026-06-09
目标仓库：https://github.com/jiulics/moyu_vscode
项目目录：`C:\Users\she\Desktop\new xiaoshuo\moyu_vscode`

## 目标

开发一个 VS Code 扩展 `Moyu`，定位为“轻量休息工具箱”：在编码间隙阅读本地小说、播放本地音乐，并提供不打扰工作的微休息能力。

产品边界：

- 只处理用户主动选择的本地文件，不上传小说、音乐、播放记录、阅读记录。
- 不集成盗版内容源，不爬取在线小说或音乐平台。
- 不做伪装编辑器、老板键、绕过公司策略等隐藏行为。
- 当前目录中的小说素材不复制进项目，测试数据使用自造短文本。

官方依据：

- VS Code Extension Anatomy：https://code.visualstudio.com/api/get-started/extension-anatomy
- VS Code Webview API：https://code.visualstudio.com/api/extension-guides/webview
- VS Code Testing Extensions：https://code.visualstudio.com/api/working-with-extensions/testing-extension
- VS Code Publishing Extensions：https://code.visualstudio.com/api/working-with-extensions/publishing-extension

## MVP 功能

1. 小说阅读器
   - 命令：`moyu.openReader`、`moyu.addNovel`、`moyu.showNovelLibrary`
   - 支持导入本地 `.txt`、`.md` 文件。
   - 支持 UTF-8、GBK、GB18030 编码识别和解码。
   - 支持章节目录、阅读进度、书签、字体大小、行高、浅色/深色/护眼主题。
   - 大文件保护：超过 30MB 时提示用户确认，超过 80MB 时拒绝一次性载入并给出原因。

2. 本地音乐播放器
   - 命令：`moyu.openMusicPlayer`、`moyu.addMusicFiles`、`moyu.clearPlaylist`
   - 支持用户选择本地 `.mp3`、`.wav`、`.ogg`、`.m4a`、`.flac` 文件。
   - 支持播放/暂停、上一首/下一首、进度条、音量、单曲循环、列表循环、随机播放。
   - 状态栏显示当前播放状态，并提供播放/暂停快捷命令。

3. 微休息工具
   - 命令：`moyu.startBreakTimer`、`moyu.stopBreakTimer`
   - 支持 5/10/15 分钟休息提醒。
   - 支持本地统计：当天休息次数、阅读分钟数、音乐分钟数。
   - 所有统计存储在 VS Code `globalState`，不做云同步。

4. 插件入口
   - Activity Bar 增加 `Moyu` 图标入口。
   - Side Bar 提供三个视图：`小说库`、`播放列表`、`休息计时`。
   - Command Palette 暴露所有核心命令。

## 后续增强

- 小说全文搜索和章节内搜索。
- 阅读器快捷键：上一章、下一章、加入书签、切换主题。
- 播放列表拖拽排序。
- 本地白噪音：雨声、咖啡馆、键盘声，由用户本地导入音频。
- 番茄钟联动：专注 25 分钟后提醒休息 5 分钟。
- 多工作区隔离设置：工作区内只保存与该工作区相关的临时状态。

## 技术栈

- 语言：TypeScript。
- 运行环境：VS Code Extension Host + Webview。
- 包管理：npm。
- 构建：esbuild。
- 单元测试：Vitest。
- 扩展集成测试：`@vscode/test-cli` + `@vscode/test-electron`。
- 代码规范：ESLint + Prettier。
- 打包发布：`@vscode/vsce`。
- 主要运行依赖：`iconv-lite`、`chardet`、`zod`。

选择理由：

- TypeScript 与 VS Code Extension API 匹配，类型边界清晰。
- Webview 适合阅读器和播放器 UI。
- `zod` 用于校验 extension host 与 webview 之间的消息协议。
- `iconv-lite` 和 `chardet` 解决中文小说常见编码问题。

## 目录规范

计划中的项目结构如下：

```text
moyu_vscode/
  .github/
    workflows/
      ci.yml
  .vscode/
    extensions.json
    launch.json
    tasks.json
  docs/
    IMPLEMENTATION_PLAN.md
    ARCHITECTURE.md
    TESTING.md
    RELEASE.md
  media/
    icons/
      moyu.svg
  src/
    extension.ts
    commands/
      addMusicFiles.ts
      addNovel.ts
      clearPlaylist.ts
      openMusicPlayer.ts
      openReader.ts
      showNovelLibrary.ts
      startBreakTimer.ts
      stopBreakTimer.ts
    config/
      settings.ts
    services/
      break/
        breakTimer.ts
        breakStatsStore.ts
      music/
        playlistStore.ts
        supportedAudio.ts
      novel/
        chapterParser.ts
        encodingDetector.ts
        novelLibraryStore.ts
        readingProgressStore.ts
      storage/
        mementoJsonStore.ts
    test/
      integration/
        extension.test.ts
      unit/
        breakTimer.test.ts
        chapterParser.test.ts
        encodingDetector.test.ts
        messageProtocol.test.ts
        playlistStore.test.ts
        readingProgressStore.test.ts
    webview/
      common/
        csp.ts
        html.ts
        messageProtocol.ts
        nonce.ts
      music/
        musicPanel.ts
        musicView.css
        musicView.ts
      reader/
        readerPanel.ts
        readerView.css
        readerView.ts
  test-fixtures/
    novels/
      simple-utf8.txt
      simple-gbk.txt
    audio/
      silent-1s.wav
  .editorconfig
  .eslintignore
  .eslintrc.cjs
  .gitignore
  .prettierignore
  .prettierrc
  CHANGELOG.md
  LICENSE
  README.md
  package-lock.json
  package.json
  tsconfig.json
  vitest.config.ts
```

文件责任：

- `src/extension.ts` 只负责激活、注册命令、注册视图和释放资源。
- `src/commands/` 每个命令一个文件。
- `src/services/` 放纯业务逻辑，尽量不直接依赖 webview。
- `src/webview/` 放 webview HTML、CSS、客户端脚本和消息协议。
- `src/test/unit/` 测纯函数和存储逻辑。
- `src/test/integration/` 测扩展激活、命令注册、配置默认值。
- `test-fixtures/` 只放自造测试素材，不放真实小说或版权音乐。

## Git 版本管理

初始化流程：

```powershell
cd "C:\Users\she\Desktop\new xiaoshuo\moyu_vscode"
git init -b main
git remote add origin https://github.com/jiulics/moyu_vscode.git
git status --short
```

预期输出：

```text
?? docs/
```

分支策略：

- `main`：始终保持可运行、测试通过。
- `feat/bootstrap`：项目脚手架和规范。
- `feat/reader`：小说阅读器。
- `feat/music`：音乐播放器。
- `feat/break-timer`：微休息工具。
- `chore/release`：打包、发布、版本号和 CHANGELOG。

提交规范：

- `docs: add implementation plan`
- `chore: bootstrap vscode extension project`
- `feat: add novel library and parser`
- `feat: add reader webview`
- `feat: add local music playlist`
- `feat: add music player webview`
- `feat: add break timer`
- `test: cover reader and music services`
- `ci: add github actions checks`

每个功能分支合并前必须执行：

```powershell
npm run lint
npm run test:unit
npm run test:integration
npm run package
git status --short
```

预期结果：

```text
lint: 0 errors
unit tests: all pass
integration tests: all pass
package: generated .vsix successfully
git status: no unrelated files staged
```

## 开发任务

### Task 1: 项目脚手架与规范

创建文件：

- `package.json`
- `tsconfig.json`
- `.editorconfig`
- `.gitignore`
- `.eslintrc.cjs`
- `.prettierrc`
- `.vscode/launch.json`
- `.vscode/tasks.json`
- `.vscode/extensions.json`
- `src/extension.ts`
- `README.md`
- `CHANGELOG.md`
- `LICENSE`

关键要求：

- `package.json` 定义 `main` 为 `./dist/extension.js`。
- `activationEvents` 使用命令和视图触发，不使用 `*` 全量激活。
- `contributes.commands` 声明 MVP 中所有命令。
- `contributes.configuration` 声明阅读器字体、主题、音乐音量、休息提醒默认值。
- `scripts` 至少包含 `compile`、`watch`、`lint`、`test:unit`、`test:integration`、`package`。

验收命令：

```powershell
npm install
npm run compile
npm run lint
git add .
git commit -m "chore: bootstrap vscode extension project"
```

### Task 2: 扩展激活与命令骨架

创建文件：

- `src/commands/openReader.ts`
- `src/commands/addNovel.ts`
- `src/commands/showNovelLibrary.ts`
- `src/commands/openMusicPlayer.ts`
- `src/commands/addMusicFiles.ts`
- `src/commands/clearPlaylist.ts`
- `src/commands/startBreakTimer.ts`
- `src/commands/stopBreakTimer.ts`
- `src/config/settings.ts`
- `src/test/integration/extension.test.ts`

关键要求：

- 每个命令返回 `Disposable` 注册函数，便于 `extension.ts` 统一管理。
- 命令失败时用 `vscode.window.showErrorMessage` 给出可理解错误。
- 集成测试验证所有命令已注册。

验收命令：

```powershell
npm run test:integration
git add .
git commit -m "feat: register moyu commands"
```

### Task 3: 小说解析与本地书库

创建文件：

- `src/services/novel/encodingDetector.ts`
- `src/services/novel/chapterParser.ts`
- `src/services/novel/novelLibraryStore.ts`
- `src/services/novel/readingProgressStore.ts`
- `src/services/storage/mementoJsonStore.ts`
- `src/test/unit/encodingDetector.test.ts`
- `src/test/unit/chapterParser.test.ts`
- `src/test/unit/readingProgressStore.test.ts`
- `test-fixtures/novels/simple-utf8.txt`
- `test-fixtures/novels/simple-gbk.txt`

关键要求：

- `encodingDetector` 使用 `chardet` 识别编码，用 `iconv-lite` 解码。
- `chapterParser` 识别 `第1章`、`第一章`、`卷一`、`Chapter 1`。
- `novelLibraryStore` 存储文件 URI、标题、大小、最后打开时间。
- `readingProgressStore` 存储章节索引、滚动百分比、书签。
- 单元测试覆盖 UTF-8、GBK、无章节标题、重复章节标题。

验收命令：

```powershell
npm run test:unit -- chapterParser
npm run test:unit -- encodingDetector
npm run test:unit -- readingProgressStore
git add .
git commit -m "feat: add novel parsing and library storage"
```

### Task 4: 小说阅读 Webview

创建文件：

- `src/webview/common/csp.ts`
- `src/webview/common/html.ts`
- `src/webview/common/nonce.ts`
- `src/webview/common/messageProtocol.ts`
- `src/webview/reader/readerPanel.ts`
- `src/webview/reader/readerView.ts`
- `src/webview/reader/readerView.css`
- `src/test/unit/messageProtocol.test.ts`

关键要求：

- Webview 使用严格 Content Security Policy。
- 所有脚本使用 nonce。
- `localResourceRoots` 只允许扩展自己的 `media` 和当前 webview 资源目录。
- Webview 与 extension host 之间的消息使用 `zod` 校验。
- 阅读器支持章节列表、上一章、下一章、字体大小、行高、主题、保存进度。

验收命令：

```powershell
npm run lint
npm run test:unit -- messageProtocol
npm run test:integration
git add .
git commit -m "feat: add reader webview"
```

### Task 5: 音乐播放列表服务

创建文件：

- `src/services/music/supportedAudio.ts`
- `src/services/music/playlistStore.ts`
- `src/test/unit/playlistStore.test.ts`
- `test-fixtures/audio/silent-1s.wav`

关键要求：

- 只允许支持列表中的音频扩展名。
- `playlistStore` 保存曲目 URI、标题、文件名、时长、添加时间、排序。
- 对不存在的文件给出用户可理解提示，不让扩展崩溃。
- 测试覆盖添加、删除、清空、重复文件、非法扩展名。

验收命令：

```powershell
npm run test:unit -- playlistStore
git add .
git commit -m "feat: add local music playlist service"
```

### Task 6: 音乐播放器 Webview 与状态栏

创建文件：

- `src/webview/music/musicPanel.ts`
- `src/webview/music/musicView.ts`
- `src/webview/music/musicView.css`
- `src/commands/openMusicPlayer.ts`
- `src/commands/addMusicFiles.ts`
- `src/commands/clearPlaylist.ts`

关键要求：

- Webview 使用 HTMLAudioElement 播放 `webview.asWebviewUri` 转换后的本地音频。
- 支持播放/暂停、上一首/下一首、进度、音量、播放模式。
- 状态栏显示 `Moyu: Paused` 或当前歌曲名。
- 关闭 webview 后不保留悬空计时器和事件监听器。

验收命令：

```powershell
npm run lint
npm run test:unit
npm run test:integration
git add .
git commit -m "feat: add music player webview"
```

### Task 7: 微休息计时与本地统计

创建文件：

- `src/services/break/breakTimer.ts`
- `src/services/break/breakStatsStore.ts`
- `src/test/unit/breakTimer.test.ts`

关键要求：

- 支持启动、停止、重置。
- 到点后使用 VS Code notification 提醒，不强制打断用户。
- 本地统计按自然日归档。
- 测试使用 fake timers，不等待真实分钟。

验收命令：

```powershell
npm run test:unit -- breakTimer
npm run test:unit
git add .
git commit -m "feat: add break timer"
```

### Task 8: 文档、CI 与发布准备

创建文件：

- `.github/workflows/ci.yml`
- `docs/ARCHITECTURE.md`
- `docs/TESTING.md`
- `docs/RELEASE.md`

关键要求：

- CI 在 Windows 和 Ubuntu 上运行 `npm ci`、`npm run lint`、`npm run test:unit`、`npm run test:integration`。
- `README.md` 包含功能截图位置、命令列表、配置项、隐私说明。
- `docs/RELEASE.md` 写清楚本地打包和发布步骤。
- 发布前使用 `vsce package` 生成 `.vsix`。

验收命令：

```powershell
npm run lint
npm run test:unit
npm run test:integration
npm run package
git add .
git commit -m "ci: add checks and release docs"
```

## 测试策略

单元测试：

- 章节解析：中文数字、阿拉伯数字、英文章节、无章节兜底。
- 编码解析：UTF-8、GBK、GB18030、无法识别编码时的明确报错。
- 存储逻辑：新增、更新、删除、重复数据、坏数据恢复。
- 消息协议：合法消息通过，未知消息拒绝，缺字段拒绝。
- 计时器：开始、停止、重复开始、到点提醒。

集成测试：

- 扩展可激活。
- 命令全部存在。
- 默认配置可读取。
- 添加小说命令在取消文件选择时不报错。
- 添加音乐命令在取消文件选择时不报错。

手工验证：

- 在 Extension Development Host 中打开插件。
- 导入 `test-fixtures/novels/simple-utf8.txt`。
- 导入 `test-fixtures/audio/silent-1s.wav`。
- 打开阅读器，切换章节、主题、字体大小。
- 打开播放器，播放、暂停、切歌、调节音量。
- 启动 5 分钟休息计时，停止计时。

## 质量门禁

合并到 `main` 前必须满足：

- `npm run lint` 通过。
- `npm run test:unit` 通过。
- `npm run test:integration` 通过。
- `npm run package` 可以生成 `.vsix`。
- `git diff --check` 无空白错误。
- 未提交真实小说、真实音乐、密钥、日志、构建产物。

`.gitignore` 必须包含：

```gitignore
node_modules/
dist/
out/
coverage/
*.vsix
*.log
.DS_Store
Thumbs.db
```

## 发布流程

1. 确认版本号：

```powershell
npm version patch
```

2. 完整检查：

```powershell
npm run lint
npm run test:unit
npm run test:integration
npm run package
```

3. 生成包：

```powershell
npx vsce package
```

4. 打标签：

```powershell
git tag v0.0.1
git push origin main --tags
```

5. 发布到 Marketplace：

```powershell
npx vsce publish
```

## 第一轮完成标准

第一轮开发完成时，仓库应满足：

- 能在 VS Code Extension Development Host 中启动。
- 可以添加并阅读本地小说。
- 可以添加并播放本地音乐。
- 可以启动和停止休息计时器。
- 核心服务有单元测试。
- 扩展激活和命令注册有集成测试。
- CI 可运行。
- 已生成首个 `.vsix` 包。

