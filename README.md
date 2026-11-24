# Minecraft Wiki 大全

面向 Minecraft 服主与插件使用者的静态知识库。站点使用纯 HTML、CSS、JavaScript，由 GitHub Pages 部署。

## 在线地址

https://fenlingboy.github.io/minecraft-wiki/

## 目录结构

```text
.
├─ index.html                        Wiki 大全首页
├─ assets/
│  ├─ hub.css                        全站公共样式
│  └─ hub.js                         全站搜索
├─ plugins/
│  ├─ index.html                     插件文档分类
│  └─ flstrengthen/
│     ├─ index.html                  FlStrengthen 独立 Wiki
│     ├─ styles.css
│     └─ app.js
└─ .nojekyll                         关闭 Jekyll 处理
```

## 分支与子分支

站点按知识层级组织，不使用 Git 分支承载每个文档：

```text
Minecraft Wiki 大全
└─ 插件文档
   └─ FlStrengthen
      ├─ 开始使用
      ├─ 配置手册
      └─ 参考
```

这样所有内容可以一次部署，链接稳定，也不会因为切换 Git 分支让某个插件 Wiki 消失。

## 新增一个插件 Wiki

1. 在 `plugins/` 下创建新的项目目录。
2. 把独立的 `index.html`、样式和脚本放入该目录。
3. 在 `plugins/index.html` 增加入口。
4. 在首页 `index.html` 的搜索入口和最近收录区域增加链接。
5. 本地打开页面检查相对路径，再提交到 `main`。

## 本地预览

直接打开 `index.html` 可以浏览。需要模拟网站路径时，可在仓库根目录运行：

```powershell
python -m http.server 8080
```

然后访问 `http://localhost:8080/`。

## 部署

GitHub Pages 发布源：

```text
Branch: main
Folder: /
```

每次推送到 `main` 后，GitHub Pages 会自动重新发布。
