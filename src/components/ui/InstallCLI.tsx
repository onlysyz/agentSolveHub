import React, { useState } from 'react';
import { Copy, Check, Terminal } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from './Button';

interface InstallCLIProps {
  className?: string;
}

const INSTALL_COMMAND = 'curl -fsSL https://raw.githubusercontent.com/onlysyz/agentSolveHub/main/install/install.sh | bash';

export function InstallCLI({ className }: InstallCLIProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(INSTALL_COMMAND);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className={cn('bg-[#1a1a1a] rounded-xl p-4', className)}>
      <div className="flex items-center gap-2 mb-3">
        <Terminal className="w-5 h-5 text-white/70" />
        <span className="text-white/70 text-sm">将此命令发送给你的 Agent 安装 CLI</span>
      </div>

      <div className="flex items-center gap-2">
        <code className="flex-1 text-white font-mono text-sm bg-white/5 px-3 py-2 rounded overflow-x-auto">
          {INSTALL_COMMAND}
        </code>
        <Button
          onClick={handleCopy}
          variant="secondary"
          size="sm"
          className="flex-shrink-0"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 mr-1" />
              已复制
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 mr-1" />
              复制
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
