import { mkdirSync } from 'node:fs'
import { resolve, join } from 'node:path'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const projectRoot = resolve(fileURLToPath(new URL('..', import.meta.url)))
const mediaRoot = join(projectRoot, 'public', 'media')
const outputRoot = join(projectRoot, 'outputs')
const ffmpeg = join(projectRoot, 'node_modules', 'ffmpeg-static', 'ffmpeg.exe')
const output = join(outputRoot, 'portfolio-reel-16x9-30s.mp4')
const font = 'C\\:/Windows/Fonts/arial.ttf'

mkdirSync(outputRoot, { recursive: true })

const segments = [
  { path: join(mediaRoot, '产品设计主视觉图.webp'), duration: 3.8, title: 'PORTFOLIO / 2026', subtitle: 'DESIGN - AI - CONTENT', image: true },
  { path: join(mediaRoot, 'ai-product-design-workflow.webp'), duration: 4.1, title: '01  PRODUCT DESIGN', subtitle: 'CONCEPT - FORM - MATERIAL', image: true },
  { path: join(mediaRoot, 'ai-visual-generation.webp'), duration: 4.1, title: '02  AI EXPLORATION', subtitle: 'GENERATIVE WORKFLOW', image: true },
  { path: join(mediaRoot, 'ai-promo-videos', 'AI宣传视频.webm'), duration: 4.1, title: '03  AI VIDEO', subtitle: 'PRODUCT STORIES IN MOTION' },
  { path: join(mediaRoot, 'ai-assisted-short-video', 'AI开头钩子.webm'), duration: 4.1, title: '04  SHORT VIDEO', subtitle: 'SCRIPT - LIGHT - EDIT' },
  { path: join(mediaRoot, 'daily-videos', '萌耳餐盘.webm'), duration: 4.1, title: '05  PRODUCT CONTENT', subtitle: 'VISUAL CREATION' },
  { path: join(mediaRoot, 'outdoor-product-visual-creation.webp'), duration: 4.1, title: '06  VISUAL STORY', subtitle: 'OUTDOOR PRODUCT CREATION', image: true },
  { path: join(mediaRoot, 'qin-wang-la-mian-brand-visual-design.webp'), duration: 4.4, title: '07  BRAND VISUAL', subtitle: 'SOCIAL MEDIA - CONTENT', image: true },
]

const inputArgs = []
for (const segment of segments) {
  if (segment.image) inputArgs.push('-loop', '1', '-framerate', '30', '-i', segment.path)
  else inputArgs.push('-stream_loop', '-1', '-i', segment.path)
}
inputArgs.push('-stream_loop', '-1', '-i', join(mediaRoot, 'ai-videos', 'AI主题曲1.webm'))

const filterParts = []
for (const [index, segment] of segments.entries()) {
  const input = `${index}:v`
  const label = `seg${index}`
  const title = segment.title.replaceAll("'", "\\'")
  const subtitle = segment.subtitle.replaceAll("'", "\\'")
  filterParts.push(
    `[${input}]trim=duration=${segment.duration},setpts=PTS-STARTPTS,split=2[bg${index}][fg${index}];` +
      `[bg${index}]scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,gblur=sigma=22,eq=brightness=-0.24:saturation=0.82[bgf${index}];` +
      `[fg${index}]scale=1720:968:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2:color=black[fgf${index}];` +
      `[bgf${index}][fgf${index}]overlay=0:0,` +
      `drawbox=x=72:y=72:w=1776:h=936:color=0xd6b06a@0.78:t=2,` +
      `drawbox=x=110:y=812:w=1700:h=190:color=0x050505@0.58:t=fill,` +
      `drawbox=x=120:y=850:w=170:h=3:color=0xd6b06a:t=fill,` +
      `drawtext=fontfile=${font}:text='${title}':x=120:y=878:fontcolor=white:fontsize=42,` +
      `drawtext=fontfile=${font}:text='${subtitle}':x=120:y=938:fontcolor=0xd6b06a:fontsize=23,` +
      `fps=30,format=yuv420p[${label}]`,
  )
}

let current = 'seg0'
let elapsed = segments[0].duration
const transition = 0.4
for (let index = 1; index < segments.length; index += 1) {
  const next = `seg${index}`
  const outputLabel = `mix${index}`
  const offset = elapsed - transition
  filterParts.push(`[${current}][${next}]xfade=transition=fade:duration=${transition}:offset=${offset.toFixed(3)}[${outputLabel}]`)
  current = outputLabel
  elapsed += segments[index].duration - transition
}

const args = [
  '-y',
  ...inputArgs,
  '-filter_complex',
  `${filterParts.join(';')};[${current}]format=yuv420p[vout]`,
  '-map',
  '[vout]',
  '-map',
  `${segments.length}:a:0`,
  '-t',
  '30',
  '-c:v',
  'libx264',
  '-preset',
  'medium',
  '-crf',
  '19',
  '-pix_fmt',
  'yuv420p',
  '-c:a',
  'aac',
  '-b:a',
  '160k',
  '-af',
  'volume=0.18,afade=t=in:st=0:d=1,afade=t=out:st=27:d=3',
  '-movflags',
  '+faststart',
  output,
]

const result = spawnSync(ffmpeg, args, { stdio: 'inherit', windowsHide: true })
if (result.error) throw result.error
if (result.status !== 0) process.exit(result.status ?? 1)
console.log(`Created ${output}`)
