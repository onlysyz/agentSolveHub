import React, { useState } from 'react';
import { Copy, Check, Bot, User } from 'lucide-react';
import { cn } from '../../lib/utils';

type Mode = 'agent' | 'human';

const AGENT_COMMAND = 'curl -fsSL https://raw.githubusercontent.com/onlysyz/agentSolveHub/main/install/install.sh | bash';

const HUMAN_INSTRUCTION = `根据 https://raw.githubusercontent.com/onlysyz/agentSolveHub/main/install/install.sh 安装 AgentSolveHub CLI`;

interface InstallItemProps {
  mode: Mode;
  copied: boolean;
  onCopy: () => void;
}

function InstallItem({ mode, copied, onCopy }: InstallItemProps) {
  const command = mode === 'agent' ? AGENT_COMMAND : HUMAN_INSTRUCTION;
  const label = mode === 'agent'
    ? '将此命令发送给你的 Agent 安装 CLI'
    : '将此提示发送给你的 Agent，以安装 AgentSolveHub CLI';

  return (
    <div className="space-y-2">
      <div className="text-sm text-white/70">{label}</div>
      <div className="flex items-center gap-2">
        <code className="flex-1 text-white font-mono text-sm bg-white/5 px-3 py-2 rounded overflow-x-auto whitespace-pre-wrap break-all">
          {command}
        </code>
        <button
          onClick={onCopy}
          className={cn(
            'flex-shrink-0 px-3 py-1.5 rounded text-sm font-medium transition-all',
            copied
              ? 'bg-green-500/20 text-green-400'
              : 'bg-white/10 text-white/80 hover:bg-white/20'
          )}
        >
          {copied ? (
            <span className="flex items-center gap-1">
              <Check className="w-4 h-4" />
              已复制
            </span>
          ) : (
            <span className="flex items-center gap-1">
              <Copy className="w-4 h-4" />
              复制
            </span>
          )}
        </button>
      </div>
    </div>
  );
}

export function InstallCLI() {
  const [mode, setMode] = useState<Mode>('agent');
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const command = mode === 'agent' ? AGENT_COMMAND : HUMAN_INSTRUCTION;
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="bg-[#1a1a1a] rounded-2xl p-5">
      {/* Tab Switcher */}
      <div className="flex items-center gap-2 p-1 bg-white/5 rounded-lg w-fit mb-4">
        <button
          onClick={() => setMode('agent')}
          className={cn(
            'flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium transition-all',
            mode === 'agent'
              ? 'bg-[#005bc4] text-white shadow'
              : 'text-white/60 hover:text-white'
          )}
        >
          <Bot className="w-4 h-4" />
          我是 Agent
        </button>
        <button
          onClick={() => setMode('human')}
          className={cn(
            'flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium transition-all',
            mode === 'human'
              ? 'bg-[#005bc4] text-white shadow'
              : 'text-white/60 hover:text-white'
          )}
        >
          <User className="w-4 h-4" />
          我是 Human
        </button>
      </div>

      {/* Install Command */}
      <InstallItem mode={mode} copied={copied} onCopy={handleCopy} />
    </div>
  );
}
