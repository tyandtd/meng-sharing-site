# Meng 的分享空间

这是一个可直接发布到 GitHub Pages 的静态网站。当前包含两个主要模块：

- `tech/`：技术分享
- `words/`：言语分享

## 文件结构

```text
.
├── index.html
├── styles.css
├── assets/
│   └── hero-knowledge-desk.png
├── tech/
│   └── index.html
├── words/
│   └── index.html
├── .gitattributes
└── .nojekyll
```

## 发布到 GitHub Pages

如果你已经安装并登录 GitHub CLI，可以在本目录执行：

```powershell
git init
git branch -M main
git add .
git commit -m "Initial personal sharing site"
gh repo create meng-sharing-site --public --source=. --remote=origin --push
gh api --method POST "repos/{owner}/{repo}/pages" -F "source[branch]=main" -F "source[path]=/"
```

发布成功后，访问地址通常是：

```text
https://你的用户名.github.io/meng-sharing-site/
```

如果仓库名使用 `你的用户名.github.io`，访问地址通常是：

```text
https://你的用户名.github.io/
```

## 后续绑定域名

购买域名后，在 GitHub Pages 的 Custom domain 中填写域名；同时到域名服务商处配置 DNS。常见做法是：

- 根域名使用 A 记录指向 GitHub Pages 的 IP
- `www` 子域名使用 CNAME 指向 `你的用户名.github.io`

配置完成后，等待 DNS 生效，再开启 Enforce HTTPS。
