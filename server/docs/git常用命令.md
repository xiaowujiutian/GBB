旧的公钥liyong@dely:~/gbb$ cat ~/.ssh/id_ed25519.pub
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIL8hbLkVt7/E1W6gUt5rQF/Dg+QC4yAy20izjThGcqOj chinalnhsly@hotmail.com
旧的私钥lnhsly66


# Git 常用命令速查

新库公钥liyong@dely:~/gbb$ cat ~/.ssh/id_ed25519_xiaowujiutian.pub
新库私钥  空的

ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIBYSZ9WvTzD1QZIgxLN8h0T3V+jDbhD65sAK6uEeebZe xiaowujiutian@hotmail.com

邮箱密码
    xiaowujiutian@hotmail.com   Xwjt-760707@
SSH 地址：
   git@github.com:xiaowujiutian/GBB.git

echo "# GBB" >> README.md
git init
git add README.md
git commit -m "first commit"
git branch -M main
git remote add origin https://github.com/xiaowujiutian/GBB.git
git push -u origin main
git push origin v1.0.0
##  git实际操作指南：
# Git 常用命令速查

## GBB项目Git操作记录

### 项目初始化（已完成）
```bash
git init
git add .gitignore README.md
git commit -m "feat: 初始化GBB管理系统项目"
git branch -M main
git remote add origin https://github.com/xiaowujiutian/GBB.git
```

### 解决嵌套Git仓库问题（当前操作）
```bash
# 检查嵌套仓库
find . -name ".git" -type d

# 清理子仓库.git目录
rm -rf ./client/wxapp-frontend/.git
rm -rf ./server/.git  
rm -rf ./server/baby-photo-backend/.git

# 重新添加所有文件
git add .
git commit -m "feat: 整合所有子项目到统一仓库"
git push -u origin main

# 创建版本标签
git tag v1.0.0
git push origin v1.0.0
```

### 日常开发工作流
```bash
# 开发前
git status                  # 检查状态
git pull origin main        # 拉取最新代码

# 开发中
git add .                   # 添加修改文件
git commit -m "feat: 功能描述"  # 提交修改

# 开发后  
git push origin main        # 推送代码
git tag v1.0.1             # 更新版本标签
git push origin v1.0.1     # 推送标签
```

## 常用命令速查
<!-- ...existing code... -->



# 1. 查看当前Git配置
git config --list | grep user

# 2. 如果需要更新为正确的用户名和邮箱
git config --global user.name "xiaowujiutian"
git config --global user.email "xiaowujiutian@hotmail.com"

# 3. 验证配置是否更新
git config --global user.name
git config --global user.email






#### 新项目git命令，初始化、创建、推送的实际操作：
git status                             # 查看当前状态
git init                               # 初始化本地仓库
git status                             # 查看当前状态
git branch                             # 查看分支列表
git branch <分支名>                    # 创建新分支
git status                             # 查看当前状态
git branch                             # 查看分支列表
git add .                              # 添加所有文件到暂存区
git commit -m "影楼微信小程序端"       # 提交暂存区到本地仓库
git tag                                # 查看标签
git tag 1.0.0                          # 创建标签
git remote -v                          # 查看远程仓库
git branch -M main                     # 创建远程 主 (main) 分支
git remote add origin https://github.com/chinalnhsly/wxapp-frontend.git    # 添加远程目标仓库的地址
git push -u origin main                # 推送文件到远程仓库
git push origin 1.0.0                  # 推送标签到远程仓库

#### 平时使用,注意更新标签
git add .
git tag 1.0.1
git push -u origin  main
git push origin 1.0.1

#### 官方的命令提示：
git init
git add README.md
git commit -m "GBB管理系统的根目录"
git branch -M main
git remote add origin https://github.com/xiaowujiutian/GBB.git
git push -u origin main
…or push an existing repository from the command line
###### git remote add origin https://github.com/chinalnhsly/wxapp-frontend.git  旧仓库
git branch -M main
git push -u origin main
## 1. 基本配置

```bash
git config --global user.name "你的名字"
git config --global user.email "你的邮箱"
git config --list
```

## 2. 仓库操作

```bash
git init                # 初始化本地仓库
git clone <仓库地址>     # 克隆远程仓库
```

## 3. 文件操作

```bash
git status              # 查看当前状态
git add <文件>          # 添加文件到暂存区
git add .               # 添加所有文件到暂存区
git rm <文件>           # 删除文件
git mv <旧名> <新名>    # 重命名文件
```

## 4. 提交与日志

```bash
git commit -m "提交说明"         # 提交暂存区到本地仓库
git log                        # 查看提交历史
git log --oneline              # 简洁历史
git show <commit_id>           # 查看某次提交详情
```

## 5. 分支管理

```bash
git branch                     # 查看分支列表
git branch <分支名>            # 创建新分支
git checkout <分支名>          # 切换分支
git checkout -b <分支名>       # 创建并切换新分支
git merge <分支名>             # 合并分支
git branch -d <分支名>         # 删除分支
```

## 6. 远程操作

```bash
git remote -v                  # 查看远程仓库
git remote add origin <地址>   # 添加远程仓库
git fetch origin               # 拉取远程更新
git pull origin <分支名>       # 拉取并合并远程分支
git push origin <分支名>       # 推送本地分支到远程
```

## 7. 标签管理

```bash
git tag                        # 查看标签
git tag <标签名>               # 创建标签
git tag -d <标签名>            # 删除标签
git push origin <标签名>       # 推送标签到远程
```

## 8. 撤销与恢复

```bash
git checkout -- <文件>         # 撤销工作区修改
git reset HEAD <文件>          # 取消暂存区文件
git revert <commit_id>         # 撤销某次提交（生成新提交）
git reset --hard <commit_id>   # 回退到指定提交（慎用）
```

## 9. 其他常用命令

```bash
git stash                      # 暂存当前修改
git stash pop                  # 恢复暂存内容
git cherry-pick <commit_id>    # 应用指定提交到当前分支
```

## 10. 前端项目协作建议

- **分支命名规范**  
  - `main` 或 `master`：主分支，保持稳定可部署  
  - `dev`：开发分支，集成所有开发功能  
  - `feature/xxx`：新功能开发分支，如 `feature/login`  
  - `fix/xxx`：bug修复分支，如 `fix/login-error`  
  - `release/xxx`：发布分支，如 `release/v1.0.0`  

- **前端管理系统与微信小程序建议**
  - 管理系统建议使用独立仓库或主仓库下 `admin-frontend` 目录
  - 微信小程序建议使用独立仓库或主仓库下 `wxapp-frontend` 目录
  - 各前端项目可独立维护分支，定期合并到主分支

- **协作流程**
  1. 从 `dev` 或主分支拉取新分支进行开发
  2. 完成功能后提交并推送到远程
  3. 创建合并请求（Pull Request），由团队成员评审
  4. 通过评审后合并到 `dev` 或主分支
  5. 发布前建议打标签并创建 `release` 分支

---

> 前端开发建议：每次开发前先 `git pull`，开发完成后及时 `git push`，保持分支同步。
# 更改git仓库和公钥
我看到您的SSH测试显示连接的是 `chinalnhsly` 账户，而不是 `xiaowujiutian` 账户。这说明您的SSH密钥关联的是 `chinalnhsly` 的GitHub账户，但您要推送的仓库是 `xiaowujiutian/GBB.git`。

这里有几个解决方案：

## 方案1：为xiaowujiutian账户生成新的SSH密钥（推荐）

````bash
# 1. 为xiaowujiutian账户生成新的SSH密钥
ssh-keygen -t ed25519 -C "xiaowujiutian@hotmail.com" -f ~/.ssh/id_ed25519_xiaowujiutian

# 2. 启动ssh-agent并添加新密钥
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519_xiaowujiutian

# 3. 查看新生成的公钥
cat ~/.ssh/id_ed25519_xiaowujiutian.pub
````

然后您需要：
1. 复制新公钥内容
2. 登录 `xiaowujiutian` 的GitHub账户
3. 前往 Settings → SSH and GPG keys → New SSH key
4. 粘贴公钥内容并保存

## 方案2：配置SSH使用特定密钥

````bash
# 创建或编辑SSH配置文件
nano ~/.ssh/config
````

在配置文件中添加：

````
# xiaowujiutian账户配置
Host github-xiaowujiutian
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_xiaowujiutian

# chinalnhsly账户配置（原有）
Host github.com
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519
````

然后更新远程仓库地址：

````bash
git remote remove origin
git remote add origin git@github-xiaowujiutian:xiaowujiutian/GBB.git
````

## 方案3：使用chinalnhsly账户的仓库（最简单）

如果您更愿意使用现有的 `chinalnhsly` 账户：

````bash
# 更改为chinalnhsly的仓库
git remote remove origin
git remote add origin git@github.com:chinalnhsly/GBB.git

# 推送代码
git push -u origin main
git push origin v1.0.0
````

## 更新您的Git文档

````markdown
# Git 常用命令速查

## 账户信息
- 当前Git用户: xiaowujiutian@hotmail.com
- GitHub SSH密钥: 关联到chinalnhsly账户
- 仓库地址: git@github.com:xiaowujiutian/GBB.git

## GBB项目Git操作记录

### 解决SSH密钥账户不匹配问题

#### 方案1：生成新SSH密钥（推荐）
```bash
# 1. 为xiaowujiutian生成新SSH密钥
ssh-keygen -t ed25519 -C "xiaowujiutian@hotmail.com" -f ~/.ssh/id_ed25519_xiaowujiutian

# 2. 添加新密钥到ssh-agent
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519_xiaowujiutian

# 3. 查看并添加公钥到GitHub
cat ~/.ssh/id_ed25519_xiaowujiutian.pub
```

#### 方案2：SSH多账户配置
```bash
# 编辑SSH配置
nano ~/.ssh/config

# 配置内容：
# Host github-xiaowujiutian
#     HostName github.com
#     User git
#     IdentityFile ~/.ssh/id_ed25519_xiaowujiutian

# 更新远程仓库
git remote remove origin
git remote add origin git@github-xiaowujiutian:xiaowujiutian/GBB.git
```

#### 当前临时解决方案
```bash
# 使用现有chinalnhsly账户
git remote remove origin
git remote add origin git@github.com:chinalnhsly/GBB.git
git push -u origin main
git push origin v1.0.0
```

### 验证SSH连接
```bash
# 测试SSH连接
ssh -T git@github.com
# 应该显示: Hi xiaowujiutian! You've successfully authenticated...

# 如果使用多账户配置
ssh -T git@github-xiaowujiutian
```

<!-- ...existing code... -->
````

## 建议

考虑到您目前的情况，我建议您选择**方案3**作为临时解决方案，快速完成项目推送。如果后续需要使用 `xiaowujiutian` 账户，再按照方案1生成新的SSH密钥。

您现在可以执行：

````bash
git remote remove origin
git remote add origin git@github.com:chinalnhsly/GBB.git
git push -u origin main
git push origin v1.0.0
````

这样您就能立即完成代码推送了。