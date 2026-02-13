一个 Material You 风格的 VitePress 主题，基于 Vue3 + MDUI + GSAP 等构建。


## 展示

![](/assets/20240514185649.jpg)


## 演示

[vitepress-theme-akari.vercel.app](https://vitepress-theme-akari.vercel.app)

[stray-soul.com](https://stray-soul.com)（我为自己做了一些定制，你也可以做属于你自己的！）

## 使用方法

克隆本仓库，安装依赖（`npm install`），然后进行一些配置：

### config.ts

我加了一些注释，你可以直接打开查看，应该很容易理解。（大概...）

不过有些字段没有包含在内，以下是详细说明：

#### 访问计数器

```js
const themeConfig: AkariThemeConfig = {
    ...
    viewsCounter: '',
    ...
}

```

这只是一个简单的页面总访问量计数器链接，需要后端支持，所以默认隐藏。

你可以自行部署，参考代码在 `counter.py` 中。


#### 备案

```js
const themeConfig: AkariThemeConfig = {
    ...
    footer: {
        ...
        beian:{
            use: true,
            gongan: {
                icon: '',
                link: '',
                text: ''
            },
            icp: {
                link: '',
                text: ''
            }
        }
        ...
    }
    ...
}

```

如果你的服务器在中国大陆，这些选项可能会用到。:>

### 文章

```md
---
...
cc_license: true
...
---
```

设置为 true 时，页面底部会显示 CC 许可证组件。显示文本可以在 `translation.ts` 中配置。


## 运行与构建

开发：`npm run docs:dev`

构建：`npm run docs:build`

预览构建产物：`npm run docs:preview`

注意，执行构建时会自动运行 content-fixer.mjs 来补全文章中缺失的参数字段，因此无需手动添加 `color`、`color_dark`、`date`。


## 国际化

目前主题支持 `en-US` 和 `zh-CN` 语言，可在 `config.ts` 中配置。

如果你想支持其他语言，欢迎提交 PR。


## 常见问题

### 为什么叫 Akari，不叫 MDxx？

我加入了自己的风格，所以可能并不完全符合 MD3 的设计规范。而且我也想不出什么好名字...就这样吧。

### 你的代码写得好烂...

这是我第一个用 Vue 等技术栈构建的项目，所以...你懂的。不过欢迎提交 PR。

### 动画好多 bug...

我尽力了...抱歉。

### 还有什么想说的吗？

暂时没有了，就这样吧。

## 参考

[MDUI](https://mdui.org/)

[GSAP](https://gsap.com/)

[vitepress-blog-pure](https://github.com/airene/vitepress-blog-pure)

[vitepress-blog-zaun](https://github.com/clark-cui/vitepress-blog-zaun)

[vitepress-theme-trigger](https://github.com/laplacetw/vitepress-theme-trigger)

[bsblog](https://github.com/bsdayo/blog)
