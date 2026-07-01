# 萌 的分享空间

这是一个使用纯 HTML、CSS 和 GitHub Pages 发布的个人分享网站，用来整理技术实践、学习笔记、工具教程、表达观察和日常文字。

网站已经完成：

- 首页入口：技术分享、言语分享、关于
- 技术分享列表页和独立详情页
- 言语分享列表页和独立详情页
- GitHub Pages 发布
- 自定义域名绑定
- 公开笔记中的私人网址、订阅链接、账号密码脱敏

公开教程里涉及私人地址时，统一使用 `个人的url`、`个人账号`、`个人密码`、`个人的验证码` 等占位写法。

## 当前结构

```text
.
├── index.html
├── styles.css
├── CNAME
├── README.md
├── assets/
│   ├── hero-knowledge-desk.png
│   └── hero-soft-stick-figures.png
├── tech/
│   ├── index.html
│   ├── static-site-launch/
│   │   └── index.html
│   ├── dev-tools-config/
│   │   └── index.html
│   ├── github-cli-network/
│   │   └── index.html
│   ├── clash-codex-guide/
│   │   └── index.html
│   └── project-decisions/
│       └── index.html
├── words/
│   ├── index.html
│   ├── sentence-weight/
│   │   └── index.html
│   ├── reading-aftertaste/
│   │   └── index.html
│   ├── short-writing-practice/
│   │   └── index.html
│   ├── communication-details/
│   │   └── index.html
│   └── future-expectations/
│       └── index.html
├── .gitattributes
└── .nojekyll
```

## 内容模块

### 技术分享

- 静态网站上线清单：记录从本地静态页面到 GitHub Pages、自定义域名的发布流程。
- 常用开发工具配置：整理编辑器、命令行、依赖管理和部署工具。
- GitHub CLI 连接不上 API 的排查记录：记录浏览器授权成功但命令行无法连接 API 的排查过程。
- Clash 与 Codex 使用教程：由本地 Word 教程整理而来，已移除订阅 token、账号密码和私人网址。
- 一次项目的关键决策：记录项目目标、约束和方案取舍。

### 言语分享

- 一句话的重量
- 阅读之后的余味
- 短文练习
- 沟通里的细节
- 对未来的期望

## 发布方式

当前站点使用 GitHub Pages，从 `main` 分支根目录发布。

如果是首次创建类似站点，可以参考：

```powershell
git init
git branch -M main
git add .
git commit -m "Initial personal sharing site"
gh repo create 个人仓库名 --public --source=. --remote=origin --push
gh api --method POST "repos/你的用户名/个人仓库名/pages" -F "source[branch]=main" -F "source[path]=/"
```

自定义域名配置：

- 仓库根目录保留 `CNAME` 文件
- GitHub Pages 的 `Custom domain` 填写 `个人的url`
- 域名服务商添加 GitHub Pages 所需的 A/CNAME/TXT 记录
- 证书正常后开启 `Enforce HTTPS`

## 日常更新命令

每次修改网页后，通常只需要提交并推送：

```powershell
git status
git add .
git commit -m "Update site content"
git push
```

本机如果 GitHub 连接不稳定，可以先在当前 PowerShell 设置代理，再推送：

```powershell
$env:HTTPS_PROXY='个人的url'
$env:HTTP_PROXY='个人的url'
git push
```

## 内容安全约定

- 不把订阅链接、token、邮箱、密码写入公开页面。
- 不把私人域名、私人代理地址直接写入教程正文。
- 示例中的私人地址统一写作 `个人的url`。
- 示例中的账号密码统一写作 `个人账号`、`个人密码`。
- 截图发布前先检查侧边栏、节点、订阅列表和登录信息。

## 验证命令

发布后可以检查首页和关键页面是否返回 `200 OK`：

```powershell
curl.exe -I https://个人的url/
curl.exe -I https://个人的url/tech/
curl.exe -I https://个人的url/words/
curl.exe -I https://个人的url/tech/clash-codex-guide/
```
