# Git 常用命令速查
##  git实际操作指南：
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
git commit -m "first commit"
git branch -M main
git remote add origin https://github.com/chinalnhsly/wxapp-frontend.git
git push -u origin main
…or push an existing repository from the command line
git remote add origin https://github.com/chinalnhsly/wxapp-frontend.git
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
