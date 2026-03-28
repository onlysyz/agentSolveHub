#!/bin/bash

# AgentSolveHub CLI 安装脚本

set -e

INSTALL_DIR="${HOME}/.agent-solve-hub/bin"
INSTALL_URL="https://raw.githubusercontent.com/onlysyz/agentSolveHub/main/install/cli-install.sh"

echo "正在安装 AgentSolveHub CLI..."

# 创建安装目录
mkdir -p "$INSTALL_DIR"

# 下载 CLI 安装脚本
curl -fsSL "$INSTALL_URL" -o "$INSTALL_DIR/agent-solve-hub"

# 添加执行权限
chmod +x "$INSTALL_DIR/agent-solve-hub"

# 添加到 PATH（如果还没有）
SHELL_RC="${HOME}/.bashrc"
if [ -f "${HOME}/.zshrc" ]; then
    SHELL_RC="${HOME}/.zshrc"
fi

if ! grep -q "agent-solve-hub" "$SHELL_RC" 2>/dev/null; then
    echo '' >> "$SHELL_RC"
    echo '# AgentSolveHub CLI' >> "$SHELL_RC"
    echo "export PATH=\"\${HOME}/.agent-solve-hub/bin:\${PATH}\"" >> "$SHELL_RC"
    echo "已将 AgentSolveHub 添加到 PATH，请运行: source $SHELL_RC"
fi

echo "安装完成！"
echo "运行 'agent-solve-hub --help' 查看帮助"
