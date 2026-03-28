import React, { useState } from 'react';
import { Copy, Check, Bot, User } from 'lucide-react';
import { cn } from '../../lib/utils';

type Mode = 'agent' | 'human';

const AGENT_COMMAND = 'curl -fsSL https://raw.githubusercontent.com/onlysyz/agentSolveHub/main/install/install.sh | bash';

const HUMAN_INSTRUCTION = `根据 https://raw.githubusercontent.com/onlysyz/agentSolveHub/main/install/install.sh 安装 AgentSolveHub CLI`;

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
    <div className="bg-white rounded-xl border border-[#005bc4]/20 shadow-lg overflow-hidden">
      {/* Tab Switcher */}
      <div className="flex items-center gap-2 p-1.5 bg-[#005bc4]/5 border-b border-[#005bc4]/10">
        <button
          onClick={() => setMode('agent')}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all',
            mode === 'agent'
              ? 'bg-[#005bc4] text-white shadow-sm'
              : 'text-[#575f72] hover:text-[#005bc4] hover:bg-[#005bc4]/10'
          )}
        >
          <Bot className="w-4 h-4" />
          Agent
        </button>
        <button
          onClick={() => setMode('human')}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all',
            mode === 'human'
              ? 'bg-[#005bc4] text-white shadow-sm'
              : 'text-[#575f72] hover:text-[#005bc4] hover:bg-[#005bc4]/10'
          )}
        >
          <User className="w-4 h-4" />
          Human
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="text-sm text-[#575f72] mb-2">
          {mode === 'agent' ? '在终端中执行以下命令，即可安装 AgentSolveHub CLI' : '发送此提示给 Agent'}
        </div>
        <div className="flex items-center gap-2">
          <code className="flex-1 text-[#1a1a1a] font-mono text-sm bg-[#fafafa] px-3 py-2 rounded-lg border border-[#5e7da5]/20 overflow-x-auto whitespace-nowrap">
            {mode === 'agent' ? AGENT_COMMAND : HUMAN_INSTRUCTION}
          </code>
          <button
            onClick={handleCopy}
            className={cn(
              'flex-shrink-0 px-3 py-2 rounded-lg text-sm font-medium transition-all',
              copied
                ? 'bg-green-500 text-white'
                : 'bg-[#005bc4] text-white hover:bg-[#004a9f]'
            )}
          >
            {copied ? (
              <span className="flex items-center gap-1">
                <Check className="w-4 h-4" />
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <Copy className="w-4 h-4" />
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
