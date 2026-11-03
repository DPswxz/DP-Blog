# 部署记录

- 公网入口：https://dpstools02.duckdns.org/
- HTTP 入口：http://dpstools02.duckdns.org/（自动跳转 HTTPS）
- VPS：192.210.206.234
- 静态文件：/var/www/dpblog/current
- 发布目录：/var/www/dpblog/releases/20261021T090733Z
- Caddy 配置：/etc/browsernas/Caddyfile
- 服务：browsernas-caddy.service
- 原配置备份：/etc/browsernas/Caddyfile.bak-dpblog-20261021T090733Z

## 本地运行

```powershell
npm ci
npm run docs:dev
```

生产构建与预览：

```powershell
npm run docs:build
npm run docs:preview -- --host 127.0.0.1 --port 4173
```

当前本地预览地址：http://127.0.0.1:4173/

构建产物位于 docs/.vitepress/dist。构建前置脚本会自动补全 Markdown 元数据，因此构建后可能出现文章文件变动。

## 更新 VPS

在本地完成构建，将 dist 内容上传至 /var/www/dpblog/releases 下的新目录，再将 /var/www/dpblog/current 符号链接切换至新目录。静态内容更新无需重启 Caddy。

更改 Caddy 配置前先备份，然后执行：

```sh
/opt/browsernas/caddy validate --config /etc/browsernas/Caddyfile --adapter caddyfile
/opt/browsernas/caddy reload --config /etc/browsernas/Caddyfile --adapter caddyfile
```

本次仅将 dpstools02.duckdns.org 从 NAS 网关拆分为博客入口，其他域名保留原有配置。DuckDNS 已解析到该 VPS，无需新增 DNS 记录。

验证：首页、gojuon.html、grammar.html、particles.html、verbs.html 和首页引用的静态资源均返回 HTTP 200；HTTP 返回 308 跳转至 HTTPS。

## 2026-10-21：移植上游目录并发布

- 当前发布目录：/var/www/dpblog/releases/20261021T092954Z
- 上一发布目录：/var/www/dpblog/releases/20261021T090733Z
- 上游源码版本及适配记录：THIRD_PARTY.md
- 已验证目录展开/收起、章节跳转、高亮、切换文章后更新、首页隐藏。
- 线上实测：https://dpstools02.duckdns.org/grammar.html
- 回滚时将 /var/www/dpblog/current 符号链接切换到上一发布目录即可。

## 2026-10-21：回到顶部按钮动画

- 发布目录：/var/www/dpblog/releases/20261021T130505Z
- 目录保留宽屏自动显示规则。
- 回到顶部按钮增加上浮回弹、缩小淡出、悬停与点击箭头动画。
- 已通过生产构建、本地与公网点击回顶验证。

## 2026-10-21：采用上游回顶展开按钮

- 发布目录：/var/www/dpblog/releases/20261021T130932Z
- 替换此前自定义动画，使用上游 ClickToTop 源码：滚动回顶时展开文字，结束后收起。
- 移除回顶按钮 tooltip；已完成本地及公网点击、展开、回顶与收起验证。

## 2026-10-21：修复首页卡片进入文章的过渡

- 发布目录：/var/www/dpblog/releases/20261021T132039Z
- 在 VitePress onAfterPageLoad 捕获旧页面，将 View Transition 的更新回调保持到文章 DOM 提交完成。模块加载时保留首页；以选中卡片和文章头部作为共享元素，使用 0.65 秒缓出过渡。
- 删除提前隐藏容器、轮询等待图片和重复正文位移动画；为不支持 View Transition 的浏览器保留 GSAP 降级，并尊重减少动态效果偏好。
- 修复缓存/失败图片的加载计数，以及 UAParser v2 导出导致的初始化报错。
- 验证：生产构建、顶部/滚动后卡片、返回再进入；公网文章加载完成、动画样式清理和浏览器无错误。

## 2026-10-21：日语学习网站图标

- 发布目录：/var/www/dpblog/releases/20261021T132503Z
- 使用浅紫色圆角底、深紫色「あ」字及红色圆点。
- SVG 字形已转路径；提供 favicon.ico、32px PNG 和 Apple Touch 图标。
- 重新生成：node tools/generate-site-icons.mjs
