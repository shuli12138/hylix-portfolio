import { execFileSync } from 'node:child_process'
import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, renameSync, rmSync, statSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const outputRoot = path.join(projectRoot, 'outputs')
const packageName = 'hylixportfolio-universal-offline-2026-11-18-final'
const packageRoot = path.join(outputRoot, packageName)
const buildRoot = path.join(projectRoot, 'dist-offline')
const mediaRoot = path.join(buildRoot, 'media')
const archivePath = path.join(outputRoot, `${packageName}.zip`)

if (existsSync(packageRoot) || existsSync(archivePath)) {
  throw new Error(`Output already exists. Move or rename it first: ${packageName}`)
}

mkdirSync(outputRoot, { recursive: true })
execFileSync(process.execPath, [path.join(projectRoot, 'node_modules', 'vite', 'bin', 'vite.js'), 'build', '--mode', 'offline'], {
  cwd: projectRoot,
  stdio: 'inherit',
})

const copiedMedia = []

function copyOfflineImages(sourceDirectory, destinationDirectory) {
  mkdirSync(destinationDirectory, { recursive: true })
  for (const entry of readdirSync(sourceDirectory, { withFileTypes: true })) {
    const sourcePath = path.join(sourceDirectory, entry.name)
    const destinationPath = path.join(destinationDirectory, entry.name)
    if (entry.isDirectory()) {
      copyOfflineImages(sourcePath, destinationPath)
      continue
    }

    if (!['.webp', '.jpg', '.jpeg'].includes(path.extname(entry.name).toLowerCase())) continue
    copyFileSync(sourcePath, destinationPath)
    copiedMedia.push({ path: destinationPath, bytes: statSync(destinationPath).size })
  }
}

function pruneUnusedMedia(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const entryPath = path.join(directory, entry.name)
    if (entry.isDirectory()) {
      pruneUnusedMedia(entryPath)
      if (readdirSync(entryPath).length === 0) rmSync(entryPath, { recursive: true })
      continue
    }

    if (['.png', '.webm'].includes(path.extname(entry.name).toLowerCase())) {
      rmSync(entryPath)
    }
  }
}

function addVideo(sourcePath, relativePath) {
  if (!existsSync(sourcePath)) throw new Error(`Missing original video: ${sourcePath}`)
  const destination = path.join(mediaRoot, relativePath)
  mkdirSync(path.dirname(destination), { recursive: true })
  copyFileSync(sourcePath, destination)
  copiedMedia.push({ path: destination, bytes: statSync(destination).size })
}

copyOfflineImages(path.join(projectRoot, 'public', 'media'), mediaRoot)
pruneUnusedMedia(mediaRoot)

const portfolioRoot = 'E:/作品集/作品集'
const videoSources = [
  ...['刺猬牙胶', '萌耳餐盘', '企鹅牙胶', '拖鞋牙胶', '小鹿摇铃', '小鹿摇铃2'].map(title => ({
    source: path.join(portfolioRoot, '日常工作', '日常视频', `${title}.mp4`),
    destination: `daily-videos/${title}.mp4`,
  })),
  ...['AI主题曲1', 'AI主题曲2', 'AI主题曲3'].map(title => ({
    source: path.join(portfolioRoot, '视频', '01模块', `${title}.mp4`),
    destination: `ai-videos/${title}.mp4`,
  })),
  ...['AI宣传视频', 'AI宣传视频2'].map(title => ({
    source: path.join(portfolioRoot, '视频', '02模块', `${title}.mp4`),
    destination: `ai-promo-videos/${title}.mp4`,
  })),
  ...['AI辅助剪辑', 'AI开头钩子', 'AI开头钩子2', 'AI开头钩子3', 'AI开头钩子4'].map((title, index) => ({
    source: path.join(portfolioRoot, 'AI探索', '03模块', '原图原视频', `${String(index + 1).padStart(2, '0')}.mp4`),
    destination: `ai-assisted-short-video/${title}.mp4`,
  })),
]

for (const video of videoSources) addVideo(video.source, video.destination)

let html = readFileSync(path.join(buildRoot, 'index.html'), 'utf8')
const scriptMatch = html.match(/<script\b[^>]*\bsrc="([^"]+\.js)"[^>]*>\s*<\/script>/i)
const styleMatch = html.match(/<link\b[^>]*\bhref="([^"]+\.css)"[^>]*>/i)

if (!scriptMatch) throw new Error('The offline build did not produce its JavaScript asset.')

const scriptPath = path.resolve(buildRoot, scriptMatch[1])
const script = readFileSync(scriptPath, 'utf8')
const inlineScript = `<script>${script}</script>`
const htmlShell = html.replace(scriptMatch[0], '')

if (/<script\b[^>]*\bsrc=|<link\b[^>]*\bhref=/i.test(htmlShell)) {
  throw new Error('The offline entry HTML still references an external script or stylesheet.')
}

const bodyCloseIndex = htmlShell.toLowerCase().lastIndexOf('</body>')
if (bodyCloseIndex < 0) throw new Error('The offline entry HTML is missing its closing body tag.')
html = `${htmlShell.slice(0, bodyCloseIndex)}${inlineScript}${htmlShell.slice(bodyCloseIndex)}`

mkdirSync(packageRoot, { recursive: true })
renameSync(path.join(buildRoot, 'index.html'), path.join(packageRoot, '打开作品集.html'))
renameSync(mediaRoot, path.join(packageRoot, 'media'))
writeFileSync(path.join(packageRoot, '打开作品集.html'), html, 'utf8')

const instructions = `Hylix Portfolio 通用离线浏览包\n\n使用方式\n1. 将压缩包完整解压到电脑。\n2. 双击“打开作品集.html”，用浏览器打开。\n3. 首次打开可能需要等浏览器读取页面与封面。播放视频时请点击对应作品卡片。\n\n适用环境\n- Windows 10 / 11 与 macOS 12 及以上。\n- 使用电脑已有的 Edge、Chrome、Safari 或 Firefox。\n- 不需要安装 Node.js、React、Python，也不需要联网或启动服务器。\n\n注意事项\n- 请保持“打开作品集.html”和 media 文件夹在同一目录。\n- 压缩包包含原始 MP4，没有转码；实际播放兼容性取决于视频编码与系统浏览器。\n- 浏览器可能限制 file:// 下的视频自动播放；如未自动开始，请在播放器中按播放。\n- 页面内容只在本机打开，不会上传。\n`
writeFileSync(path.join(packageRoot, '使用说明.txt'), instructions, 'utf8')

if (existsSync(archivePath)) throw new Error(`Archive already exists: ${archivePath}`)
execFileSync('powershell.exe', [
  '-NoProfile',
  '-ExecutionPolicy', 'Bypass',
  '-File', path.join(projectRoot, 'scripts', 'create-utf8-archive.ps1'),
  '-SourceDirectory', packageRoot,
  '-ArchivePath', archivePath,
], { stdio: 'inherit' })

const mediaFiles = []
function collectFiles(directory, relative = '') {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const entryPath = path.join(directory, entry.name)
    const entryRelative = path.join(relative, entry.name)
    if (entry.isDirectory()) collectFiles(entryPath, entryRelative)
    else mediaFiles.push({ path: entryRelative, bytes: statSync(entryPath).size })
  }
}
collectFiles(path.join(packageRoot, 'media'))

const videoCount = mediaFiles.filter(file => file.path.toLowerCase().endsWith('.mp4')).length
const imageCount = mediaFiles.length - videoCount
const totalBytes = mediaFiles.reduce((sum, file) => sum + file.bytes, 0)

console.log(`Offline folder: ${packageRoot}`)
console.log(`Offline archive: ${archivePath}`)
console.log(`Videos: ${videoCount}; images: ${imageCount}; media: ${(totalBytes / 1024 ** 3).toFixed(2)} GB`)
console.log(`Archive size: ${(statSync(archivePath).size / 1024 ** 3).toFixed(2)} GB`)
console.log(`Copied media files: ${copiedMedia.length}`)
