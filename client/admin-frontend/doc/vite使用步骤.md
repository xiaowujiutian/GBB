# Vite 完整使用指南
node -v
nvm use v24.2.0
npm run dev
# 清理 npm 缓存和 node_modules
rm -rf node_modules package-lock.json
npm cache clean --force

# 使用 --legacy-peer-deps 标志安装依赖
npm install --legacy-peer-deps

# 或者使用 --force 标志
npm install --force



## 一、创建新项目步骤 ✅ 已完成
```bash
cd client
npm create vite@latest admin-frontend -- --template react-ts
cd admin-frontend
npm install  # ✅ 已完成
```

### ✅ Node.js 版本问题已解决!
```bash
# 当前版本:
# Node.js: v24.2.0 (npm v11.3.0)
# 
# 状态: ✅ 与 Vite 7.1.1 完全兼容
# crypto.hash 函数问题已解决
```

## 二、下一步操作 🚀

### 现在可以正常启动项目了
```bash
# 1. 确认在项目目录
cd /home/liyong/gbb/client/admin-frontend

# 2. 重新安装依赖 (利用新版本Node.js)
rm -rf node_modules package-lock.json
npm install

# 3. 安装 React 类型声明
npm install --save-dev @types/react@^18.2.0 @types/react-dom@^18.2.0

# 4. 启动开发服务器
npm run dev

# 5. 浏览器访问 http://localhost:5173
```

### 📋 当前项目状态
```bash
# ✅ 已解决:
# - Node.js 升级到 v24.2.0 (完美兼容)
# - npm 升级到 v11.3.0 (最新版本)
# - Vite 7.1.1 兼容性问题已解决

# 🎯 下一步:
# - 重新安装项目依赖
# - 安装 React 类型声明包
# - 启动开发服务器
# - 开始愉快开发!
```

## 三、立即执行命令

### 🎯 一键完成所有设置
```bash
# 复制粘贴以下命令完成项目设置:
cd /home/liyong/gbb/client/admin-frontend && rm -rf node_modules package-lock.json && npm install && npm install --save-dev @types/react@^18.2.0 @types/react-dom@^18.2.0 && npm run dev
```

## 四、验证完整性
```bash
# 检查版本 (应该都正常)
node --version    # ✅ v24.2.0
npm --version     # ✅ v11.3.0

# 检查项目依赖
npm list vite     # ✅ 7.1.1
npm list @types/react @types/react-dom  # ✅ 18.x

# 启动测试
npm run dev       # ✅ 应该正常启动

# 成功标志:
# VITE v7.1.1  ready in xxx ms
# ➜  Local:   http://localhost:5173/
# ➜  Network: use --host to expose
```

## 五、开发环境完成! 🎉

现在您拥有了一个完美的开发环境:
- ✅ 最新的 Node.js v24.2.0
- ✅ 最新的 npm v11.3.0  
- ✅ 最新的 Vite v7.1.1
- ✅ React + TypeScript 项目结构

**您现在可以开始开发管理后台了!** 🚀

## 六、常用开发命令
```bash
# 开发模式
npm run dev

# 构建生产版本
npm run build

# 预览构建结果
npm run preview

# 代码检查
npm run lint
```

## 七、故障排除

### 如果遇到依赖问题
```bash
# 清理并重新安装
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### 如果端口被占用
```bash
# 使用不同端口
npm run dev -- --port 3001
# 或
npx vite --port 3001




# 安装Vite React插件和类型声明
npm install --save-dev @vitejs/plugin-react @types/node

# 安装React类型声明
npm install --save-dev @types/react@^18.2.0 @types/react-dom@^18.2.0

# 重新安装所有依赖
npm install



```
