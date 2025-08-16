邮箱密码
    xiaowujiutian@hotmail.com   Xwjt-760707@
SSH 地址：
   git@github.com:xiaowujiutian/GBB.git


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
git commit -m "feat: server\baby-photo-backend端、client\admin-frontend端启动正常admin  admin123"
git push -u origin main

# 创建版本标签
git tag v1.0.2
git push origin v1.0.2
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

#### 1. 查看当前Git配置
git config --list | grep user

#### 2. 如果需要更新为正确的用户名和邮箱
git config --global user.name "xiaowujiutian"
git config --global user.email "xiaowujiutian@hotmail.com"

#### 3. 验证配置是否更新
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

## 1. 基本配置

```bash
git config --global user.name "xiaowujiutian"
git config --global user.email "xiaowujiutian@hotmail.com"
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

（使用 "git add <文件>..." 更新要提交的内容）
 （使用 "git restore <文件>..." 丢弃工作区的改动）

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

### 🔧 SSH密钥冲突问题解决

**❌ 当前问题：**
```bash
ssh -T git@github.com
Hi chinalnhsly! You've successfully authenticated...

git push -u origin main  
ERROR: Permission to xiaowujiutian/GBB.git denied to chinalnhsly.
```

**问题分析：**
- SSH agent中存在多个密钥
- 默认使用了chinalnhsly的密钥而非xiaowujiutian的密钥
- 需要强制指定使用正确的密钥

### ✅ 立即解决方案

**方案1：清理SSH agent并重新添加（推荐）**

```bash
# 1. 清理当前SSH agent中的所有密钥
ssh-add -D

# 2. 只添加xiaowujiutian的密钥
ssh-add ~/.ssh/id_ed25519_xiaowujiutian

# 3. 验证当前加载的密钥
ssh-add -l

# 4. 测试SSH连接（应该显示xiaowujiutian）
ssh -T git@github.com

# 5. 推送代码
git push -u origin main
git push origin v1.0.0
```

**方案2：使用SSH配置文件强制指定密钥**

```bash
# 1. 创建SSH配置文件
mkdir -p ~/.ssh
cat > ~/.ssh/config << 'EOF'
# xiaowujiutian账户专用配置
Host github-xiaowu
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_xiaowujiutian
    IdentitiesOnly yes

# chinalnhsly账户配置
Host github.com
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519
    IdentitiesOnly yes
EOF

# 2. 设置权限
chmod 600 ~/.ssh/config

# 3. 更新Git远程地址使用专用Host
git remote remove origin
git remote add origin git@github-xiaowu:xiaowujiutian/GBB.git

# 4. 测试连接
ssh -T git@github-xiaowu

# 5. 推送代码
git push -u origin main
git push origin v1.0.0
```

**方案3：临时指定SSH密钥推送**

```bash
# 1. 使用GIT_SSH_COMMAND临时指定密钥
GIT_SSH_COMMAND="ssh -i ~/.ssh/id_ed25519_xiaowujiutian" git push -u origin main
GIT_SSH_COMMAND="ssh -i ~/.ssh/id_ed25519_xiaowujiutian" git push origin v1.0.0

# 2. 或者设置环境变量
export GIT_SSH_COMMAND="ssh -i ~/.ssh/id_ed25519_xiaowujiutian"
git push -u origin main
git push origin v1.0.0
```

### 🎯 推荐执行顺序（方案1最简单）

```bash
# 立即执行这些命令：
ssh-add -D
ssh-add ~/.ssh/id_ed25519_xiaowujiutian
ssh -T git@github.com
git push -u origin main
git push origin v1.0.0
```

### 📋 SSH密钥管理状态

**✅ 密钥文件状态：**
```bash
# 查看所有SSH密钥文件
ls -la ~/.ssh/id_*

# xiaowujiutian密钥
~/.ssh/id_ed25519_xiaowujiutian      # 私钥
~/.ssh/id_ed25519_xiaowujiutian.pub  # 公钥

# chinalnhsly密钥  
~/.ssh/id_ed25519      # 私钥
~/.ssh/id_ed25519.pub  # 公钥
```

**✅ SSH Agent状态检查：**
```bash
# 查看当前加载的密钥
ssh-add -l

# 清理所有密钥
ssh-add -D

# 添加特定密钥
ssh-add ~/.ssh/id_ed25519_xiaowujiutian
```

### 💡 验证SSH连接

**正确的SSH测试结果应该显示：**
```bash
liyong@dely:~/gbb$ ssh -T git@github.com
Hi xiaowujiutian! You've successfully authenticated, but GitHub does not provide shell access.
```

**如果显示chinalnhsly，说明仍在使用错误的密钥！**

### 🚨 故障排除

**如果方案1不工作，按顺序尝试：**

1. **检查SSH agent进程：**
   ```bash
   ps aux | grep ssh-agent
   killall ssh-agent
   eval "$(ssh-agent -s)"
   ssh-add ~/.ssh/id_ed25519_xiaowujiutian
   ```

2. **强制重启SSH服务：**
   ```bash
   sudo systemctl restart ssh
   eval "$(ssh-agent -s)"
   ssh-add ~/.ssh/id_ed25519_xiaowujiutian
   ```

3. **使用方案2或方案3作为备选方案**

### 🚀 SSH密钥管理器冲突解决

**❌ 新问题：**
```
ssh -T git@github.com 执行时弹出对话框：
"一个应用程序想要访问chinalnhsly@hotmail.com"
```

**问题原因：**
- 系统密钥管理器（GNOME Keyring）缓存了旧密钥
- SSH agent被系统密钥管理器覆盖
- 需要绕过或清理密钥管理器

### ✅ 彻底解决方案

**方案1：直接使用GIT_SSH_COMMAND强制指定密钥（最可靠）**

```bash
# 1. 不依赖SSH agent，直接指定密钥文件
export GIT_SSH_COMMAND="ssh -i ~/.ssh/id_ed25519_xiaowujiutian -o IdentitiesOnly=yes"

# 2. 测试SSH连接
ssh -i ~/.ssh/id_ed25519_xiaowujiutian -o IdentitiesOnly=yes -T git@github.com

# 3. 推送代码（应该成功）
git push -u origin main
git push origin v1.0.0

# 4. 取消环境变量（可选）
unset GIT_SSH_COMMAND
```

**方案2：禁用密钥管理器并重启SSH agent**

```bash
# 1. 临时禁用GNOME Keyring SSH组件
export SSH_AUTH_SOCK=""

# 2. 杀死所有SSH agent进程
killall ssh-agent 2>/dev/null

# 3. 启动新的SSH agent
eval "$(ssh-agent -s)"

# 4. 只添加xiaowujiutian的密钥
ssh-add ~/.ssh/id_ed25519_xiaowujiutian

# 5. 验证SSH连接
ssh -T git@github.com

# 6. 推送代码
git push -u origin main
git push origin v1.0.0
```

**方案3：创建专用SSH配置避免冲突**

```bash
# 1. 创建专用SSH配置
cat > ~/.ssh/config << 'EOF'
# xiaowujiutian专用主机配置
Host github-xiaowujiutian
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_xiaowujiutian
    IdentitiesOnly yes
    PreferredAuthentications publickey

# 默认GitHub配置（chinalnhsly）
Host github.com
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519
    IdentitiesOnly yes
EOF

# 2. 设置权限
chmod 600 ~/.ssh/config

# 3. 更新Git远程地址
git remote remove origin
git remote add origin git@github-xiaowujiutian:xiaowujiutian/GBB.git

# 4. 测试连接（不应该弹出对话框）
ssh -T git@github-xiaowujiutian

# 5. 推送代码
git push -u origin main
git push origin v1.0.0
```

### 🎯 推荐立即执行（方案1最简单可靠）

```bash
# 强制指定SSH密钥，绕过密钥管理器
export GIT_SSH_COMMAND="ssh -i ~/.ssh/id_ed25519_xiaowujiutian -o IdentitiesOnly=yes"

# 测试连接（应该显示xiaowujiutian，不弹对话框）
ssh -i ~/.ssh/id_ed25519_xiaowujiutian -o IdentitiesOnly=yes -T git@github.com

# 推送代码
git push -u origin main
git push origin v1.0.0
```

### 📋 密钥管理器问题说明

**系统密钥管理器类型：**
- GNOME Keyring（Ubuntu/GNOME桌面）
- KDE Wallet（KDE桌面）
- SSH Agent转发

**识别当前密钥管理器：**
```bash
# 查看SSH_AUTH_SOCK环境变量
echo $SSH_AUTH_SOCK

# 如果包含"keyring"或"gnome"，说明使用GNOME Keyring
# 例如：/run/user/1000/keyring/ssh

# 查看当前SSH agent进程
ps aux | grep -E "(ssh-agent|keyring)"
```

**临时禁用密钥管理器：**
```bash
# 方法1：清空SSH_AUTH_SOCK
export SSH_AUTH_SOCK=""

# 方法2：使用--no-use-agent选项
ssh -o UseAgent=no -i ~/.ssh/id_ed25519_xiaowujiutian -T git@github.com
```

### 💡 长期解决方案

**如果经常需要在多个GitHub账户间切换：**

1. **配置~/.ssh/config文件（推荐）**
2. **使用Git配置管理多个身份**
3. **创建脚本快速切换SSH密钥**

**脚本示例：**
```bash
# 创建密钥切换脚本
cat > ~/switch-git-key.sh << 'EOF'
#!/bin/bash
if [ "$1" == "xiaowujiutian" ]; then
    export GIT_SSH_COMMAND="ssh -i ~/.ssh/id_ed25519_xiaowujiutian -o IdentitiesOnly=yes"
    echo "切换到 xiaowujiutian SSH密钥"
elif [ "$1" == "chinalnhsly" ]; then
    export GIT_SSH_COMMAND="ssh -i ~/.ssh/id_ed25519 -o IdentitiesOnly=yes"  
    echo "切换到 chinalnhsly SSH密钥"
else
    unset GIT_SSH_COMMAND
    echo "使用默认SSH配置"
fi
EOF

chmod +x ~/switch-git-key.sh

# 使用方法：
# source ~/switch-git-key.sh xiaowujiutian
# git push origin main
```

### 🎉 SSH密钥问题解决成功！

**✅ 成功操作记录：**
```bash
liyong@dely:~/gbb$ ssh -i ~/.ssh/id_ed25519_xiaowujiutian -o IdentitiesOnly=yes -T git@github.com
Hi xiaowujiutian! You've successfully authenticated, but GitHub does not provide shell access.

liyong@dely:~/gbb$ git push -u origin main
分支 'main' 设置为跟踪 'origin/main'。
Everything up-to-date
```

**✅ 问题解决方案总结：**
- 使用 `-i` 参数直接指定SSH私钥文件
- 使用 `-o IdentitiesOnly=yes` 强制只使用指定密钥
- 绕过了系统密钥管理器的干扰
- 成功连接到xiaowujiutian GitHub账户

### 🚀 GBB项目推送完成状态

**✅ 当前仓库状态：**
- 远程仓库：https://github.com/xiaowujiutian/GBB.git
- 本地分支：main，已设置跟踪远程 origin/main
- 推送状态：Everything up-to-date（所有内容已同步）

**✅ 项目内容已成功推送：**
- ✅ NestJS后端服务 (baby-photo-backend)
- ✅ React管理前端 (admin-frontend) 
- ✅ 微信小程序框架 (wxapp-frontend)
- ✅ 数据库配置和API文档
- ✅ Git配置和操作文档

### 📋 后续操作建议

**1. 创建版本标签：**
```bash
# 为当前完整功能创建版本标签
git tag v1.0.0 -m "GBB管理系统初始版本：后端+前端管理界面完整功能"
git push origin v1.0.0
```

**2. 设置长期SSH配置（避免每次都手动指定密钥）：**
```bash
# 方案A：设置环境变量（当前会话有效）
export GIT_SSH_COMMAND="ssh -i ~/.ssh/id_ed25519_xiaowujiutian -o IdentitiesOnly=yes"

# 方案B：添加到shell配置文件（永久有效）
echo 'export GIT_SSH_COMMAND="ssh -i ~/.ssh/id_ed25519_xiaowujiutian -o IdentitiesOnly=yes"' >> ~/.bashrc
source ~/.bashrc
```

**3. 验证后续Git操作：**
```bash
# 测试正常的Git工作流
git status
git log --oneline -3
git remote -v

# 测试后续推送（如果有新修改）
# git add .
# git commit -m "docs: 更新Git操作文档"  
# git push origin main
```

### 💡 经验总结

**成功要点：**
1. **强制指定SSH密钥**：使用 `-i ~/.ssh/id_ed25519_xiaowujiutian`
2. **禁用其他身份验证**：使用 `-o IdentitiesOnly=yes`
3. **绕过密钥管理器**：直接指定密钥文件而不依赖SSH agent

**适用场景：**
- 多个GitHub账户需要切换
- 系统密钥管理器干扰SSH连接
- SSH agent缓存了错误的密钥

**推荐做法：**
- 为不同账户使用不同的SSH密钥文件名
- 创建SSH配置文件管理多账户
- 使用环境变量快速切换SSH配置

### 🎯 项目开发继续

现在SSH配置已解决，可以正常进行：

1. **继续开发新功能**
2. **正常提交和推送代码**
3. **创建分支进行功能开发**
4. **与团队协作开发**

**GBB管理系统现已完全部署到GitHub，可以开始正常的Git协作流程！** 🎉


