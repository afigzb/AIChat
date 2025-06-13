# AI 聊天助手 - 项目结构

## 📁 目录结构

```
src/
├── components/          # UI组件
│   ├── HomePage.tsx     # 首页组件
│   ├── ApiKeySetup.tsx  # API Key设置组件 ⚠️ 重要安全提醒
│   ├── ChatMessage.tsx  # 聊天消息组件
│   ├── LoadingIndicator.tsx # 加载指示器组件
│   └── index.ts         # 组件统一导出
│
├── hooks/               # 自定义Hooks
│   ├── useUserData.ts   # 用户数据管理
│   ├── useApiKeyValidation.ts # API Key验证
│   ├── useChat.ts       # 聊天功能
│   └── index.ts         # Hooks统一导出
│
├── types/               # TypeScript类型定义
│   └── index.ts         # 类型统一导出
│
├── assets/              # 静态资源
│   └── react.svg
│
├── App.tsx              # 主应用组件
├── ChatPage.tsx         # 聊天页面组件
├── utils.ts             # 工具函数（localStorage操作）
├── main.tsx             # 应用入口
├── index.css            # 全局样式
└── vite-env.d.ts        # Vite类型声明
```

## ⚠️ **API Key 安全提醒**

### 📍 **关于 `ApiKeySetup.tsx` 组件**

> **重要提醒**: 此组件用于设置 DeepSeek API Key

#### **安全注意事项**:
- 🔒 **本地存储**: API Key 仅保存在浏览器的 localStorage 中
- 🚫 **不会上传**: API Key 永远不会发送到除 DeepSeek 官方服务器外的任何地方
- ⚠️ **数据风险**: 清除浏览器数据会导致 API Key 丢失，需要重新输入
- 🔐 **访问权限**: 同一浏览器的其他网站无法访问你的 API Key
- 💡 **建议**: 请妥善保管你的原始 API Key，以防数据丢失

#### **如何获取 DeepSeek API Key**:
1. 访问 [DeepSeek 官网](https://platform.deepseek.com/)
2. 注册/登录账户
3. 在控制台中创建 API Key
4. 复制 API Key 并在此应用中设置

## 🎯 后续扩展建议

1. **路由管理**: 考虑使用React Router
2. **状态管理**: 大型应用可考虑Redux/Zustand
3. **测试**: 添加单元测试和集成测试
4. **国际化**: 支持多语言
5. **主题系统**: 支持暗色/亮色主题切换 