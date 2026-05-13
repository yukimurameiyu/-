# 立海大微信风 · 多引擎/多人物聊天（Netlify 版）

## 部署
1. 把整个 zip 上传到 Netlify（Netlify Drop 或者 连接 Git 仓库）。
2. 在 Netlify 的 **Site settings → Environment variables** 里配置你要用到的 API：
   - `OPENAI_API_KEY`、`OPENAI_BASE`（可选，默认 https://api.openai.com/v1）
   - `QWEN_API_KEY`、`QWEN_BASE`（阿里百炼兼容）
   - `DEEPSEEK_API_KEY`、`DEEPSEEK_BASE`
   - `TOGETHER_API_KEY`、`TOGETHER_BASE`
   - `GROQ_API_KEY`、`GROQ_BASE`
3. 部署后，前端会调用 `/.netlify/functions/llm-proxy`，你可以在“我 → 机器人后端 → 引擎管理”里新增引擎并选择“通过代理”。

> 不建议把真实密钥直接放到前端 localStorage。若一定要直连，前端也提供了“非代理直连”字段，但请自行承担泄露风险。

## 使用
- 在**资料卡**里为每个好友选择“对话引擎”。没有设置的，默认走“全局默认引擎”。
- “我 → 机器人后端 → 引擎管理”：可以新增多个引擎（不同模型/不同提供商）。

## 离线人格 & 记忆
- 每个角色的人设在 `DEFAULT_CONTACTS[*].persona` 里：
  - `voice`（说话风格）、`styleRules`（不OOC/语气规范）、`memory`（长期记忆/设定）
- 内置离线回复会读取这些字段，让角色更贴近人设。
- 你也可以通过“导出/导入 JSON”把更丰富的人设/记忆导入，回复会更贴近，但**复杂推理还是得靠接入模型**。

祝玩得开心！
