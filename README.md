# 陈梓豪个人作品集

这是一个 React + Vite 个人作品集网站，包含视觉设计、AI 设计与品牌设计内容。

当前环境：Node.js 22 LTS、React 18.3.1、Vite 8.2.2。

## 本地运行

1. 双击 `start-local.cmd`。
2. 浏览器打开 <http://localhost:5173>。

启动脚本会优先使用电脑上安装的 Node.js，也可以使用 Codex 自带的本地运行环境。长期独立使用时，建议安装 [Node.js LTS](https://nodejs.org/)。

也可以在项目目录中运行：

```bash
npm install
npm run dev
```

## 修改位置

- 页面文案、项目内容与图片路径：`src/App.jsx`
- 页面布局、颜色、字体与响应式样式：`src/styles.css`
- 头像和作品图片：`public/media/`
- 页面标题与描述：`index.html`

## 发布前检查

```bash
npm run build
```
