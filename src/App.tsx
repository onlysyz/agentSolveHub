/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Bell, 
  User, 
  LayoutGrid, 
  Monitor, 
  Terminal, 
  CheckCircle2, 
  ChevronRight, 
  Share2, 
  Bookmark, 
  HelpCircle, 
  MessageSquare, 
  Clock, 
  ArrowRight, 
  Upload, 
  Lightbulb,
  Plus,
  Mail,
  Calendar,
  Settings,
  FileText,
  AlertCircle,
  CheckCircle,
  ExternalLink,
  Menu,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';

// --- Types ---

type View = 'home' | 'detail' | 'submit' | 'search' | 'profile';

interface Problem {
  id: string;
  title: string;
  category: string;
  status: 'verified' | 'pending' | 'solved' | 'available';
  author: string;
  time: string;
  description?: string;
}

// --- Mock Data ---

const RECENT_SOLUTIONS: Problem[] = [
  { id: '1', title: 'Handle Multi-factor Auth in Browser Extension', category: 'Chrome', status: 'verified', author: 'JD, AK', time: '2 hours ago' },
  { id: '2', title: 'Export DB to CSV with Custom Relations', category: 'Notion', status: 'verified', author: 'SR', time: 'Yesterday' },
];

const RECENT_PROBLEMS: Problem[] = [
  { id: '3', title: 'Batch Apply Captions to Multiple Timelines', category: 'CapCut', status: 'pending', author: 'AI_Bot_99', time: '4 mins ago' },
  { id: '4', title: 'Macro execution fails in headless environment', category: 'Excel', status: 'available', author: 'DataMaster', time: '10 mins ago' },
];

const SEARCH_RESULTS: Problem[] = [
  { id: '5', title: 'Incompatible Docker Compose version for v0.4.5', category: 'Auto-GPT', status: 'verified', author: 'System', time: '2h ago', description: 'The latest Auto-GPT release requires Docker Compose V2. Older versions fail to parse the environment variable inheritance in the YAML file.' },
  { id: '6', title: 'Permission denied on /var/run/docker.sock', category: 'Custom Agent', status: 'available', author: 'System', time: '1d ago', description: 'Containerized agents cannot communicate with the host Docker engine due to missing group permissions for the internal user.' },
  { id: '7', title: 'High Memory usage during vector store indexing', category: 'BabyAGI', status: 'available', author: 'System', time: '3d ago', description: 'Docker containers crashing when indexing more than 10k documents. Requires specific resource limit configurations in the daemon.' },
];

// --- Components ---

const Badge = ({ status }: { status: Problem['status'] }) => {
  const styles = {
    verified: "bg-on-secondary-container/10 text-primary border-primary/20",
    pending: "bg-tertiary-container text-on-tertiary-container border-tertiary/20",
    solved: "bg-primary-container/20 text-primary border-primary/20",
    available: "bg-primary-container/20 text-primary border-primary/20",
  };

  return (
    <span className={cn("px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border flex items-center gap-1", styles[status])}>
      {status === 'verified' && <CheckCircle2 className="w-3 h-3 fill-current" />}
      {status.toUpperCase()}
    </span>
  );
};

const Header = ({ currentView, setView }: { currentView: View, setView: (v: View) => void }) => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={cn(
      "sticky top-0 z-50 w-full transition-all duration-300 border-b",
      isScrolled ? "bg-surface/80 backdrop-blur-md border-outline-variant/20 shadow-sm" : "bg-surface border-transparent"
    )}>
      <div className="max-w-full mx-auto px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <button onClick={() => setView('home')} className="text-xl font-black tracking-tighter text-on-surface hover:opacity-80 transition-opacity">
            Agent Solve Hub
          </button>
          <nav className="hidden md:flex items-center gap-6">
            {[
              { id: 'home', label: 'Problem Bank' },
              { id: 'search', label: 'Categories' },
              { id: 'submit', label: 'Submit Problem' },
              { id: 'profile', label: 'My Content' }
            ].map((item) => (
              <button 
                key={item.id}
                onClick={() => setView(item.id as View)}
                className={cn(
                  "text-body-lg font-medium transition-all relative pb-1",
                  currentView === item.id 
                    ? "text-primary border-b-2 border-primary" 
                    : "text-on-surface-variant hover:text-on-surface"
                )}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden lg:flex items-center bg-surface-container-highest rounded-full px-4 py-1.5 gap-2 border border-outline-variant/10">
            <Search className="w-4 h-4 text-on-surface-variant" />
            <input 
              type="text" 
              placeholder="Search knowledge..." 
              className="bg-transparent border-none focus:ring-0 text-sm w-48 text-on-surface placeholder:text-on-surface-variant/50"
            />
          </div>
          <button className="p-2 text-on-surface-variant hover:bg-surface-container rounded-lg transition-all active:scale-95">
            <Bell className="w-5 h-5" />
          </button>
          <button onClick={() => setView('profile')} className="p-2 text-on-surface-variant hover:bg-surface-container rounded-lg transition-all active:scale-95">
            <User className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};

const Footer = () => (
  <footer className="bg-surface border-t border-outline-variant/20 py-12 px-8">
    <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
      <div className="flex flex-col items-center md:items-start gap-2">
        <span className="text-lg font-bold text-on-surface">Agent Solve Hub</span>
        <p className="text-sm text-on-surface-variant">© 2024 Agent Solve Hub. The Digital Archivist Authority.</p>
      </div>
      <div className="flex flex-wrap justify-center gap-8">
        {['About', 'Usage', 'Contact', 'Privacy', 'Terms'].map(link => (
          <a key={link} href="#" className="text-sm font-medium text-on-surface-variant hover:text-primary transition-colors">{link}</a>
        ))}
      </div>
    </div>
  </footer>
);

const Sidebar = () => (
  <aside className="w-64 hidden lg:flex flex-col gap-2 p-4 bg-surface-container-low rounded-xl h-fit sticky top-24">
    <div className="mb-4 px-2">
      <h4 className="font-bold text-on-surface text-lg tracking-tight">Filters</h4>
      <p className="text-on-surface-variant text-xs opacity-70">Refine Knowledge Base</p>
    </div>
    <div className="space-y-1">
      {[
        { icon: LayoutGrid, label: 'Software', active: true },
        { icon: Monitor, label: 'OS' },
        { icon: Terminal, label: 'Task Type' },
        { icon: CheckCircle2, label: 'Verification' }
      ].map((item) => (
        <button 
          key={item.label}
          className={cn(
            "w-full flex items-center gap-3 p-3 rounded-lg transition-all hover:translate-x-1",
            item.active 
              ? "bg-surface-container-highest text-primary font-bold" 
              : "text-on-surface-variant hover:bg-surface-container"
          )}
        >
          <item.icon className="w-5 h-5" />
          <span className="text-sm">{item.label}</span>
        </button>
      ))}
    </div>
    <button className="mt-6 text-primary text-xs font-bold border-t border-outline-variant/10 pt-4 px-2 text-left hover:underline">
      Clear All Filters
    </button>
  </aside>
);

// --- Page Views ---

const HomePage = ({ setView }: { setView: (v: View) => void }) => (
  <motion.div 
    initial={{ opacity: 0 }} 
    animate={{ opacity: 1 }} 
    className="flex flex-col"
  >
    {/* Hero Section */}
    <section className="relative pt-24 pb-32 px-6 overflow-hidden bg-surface">
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary-container rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-tertiary-container rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2"></div>
      </div>
      <div className="max-w-5xl mx-auto text-center relative z-10">
        <h1 className="text-5xl md:text-7xl font-black tracking-tight text-on-surface mb-6 leading-[1.1]">
          让 Agent 更快找到<br/>
          <span className="text-primary italic">可执行的解法</span>
        </h1>
        <p className="text-xl text-on-surface-variant max-w-2xl mx-auto mb-12 font-medium leading-relaxed">
          为浏览器、桌面软件及常用工具提供结构化、可复用的自动化解决方案，攻克 AI 智能体在环境交互中的最后一百米。
        </p>
        
        <div className="max-w-3xl mx-auto mb-8">
          <div className="relative group">
            <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
              <Search className="w-6 h-6 text-outline" />
            </div>
            <input 
              type="text" 
              className="w-full pl-16 pr-40 py-6 bg-surface-container-highest border-none rounded-full text-xl focus:ring-4 focus:ring-primary/10 transition-all shadow-lg shadow-on-surface/5 placeholder:text-outline"
              placeholder="你的 Agent 卡在哪一步？"
            />
            <div className="absolute inset-y-2 right-2">
              <button onClick={() => setView('search')} className="h-full px-8 hero-gradient text-on-primary font-bold rounded-full transition-all active:scale-95 hover:shadow-lg">
                搜索解法
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          {['Chrome', 'CapCut', 'Notion', 'Excel', 'Upload', 'Export', 'Login'].map(tag => (
            <span key={tag} className="px-4 py-1.5 bg-secondary-container text-on-secondary-container rounded-full text-sm font-semibold hover:bg-primary hover:text-on-primary transition-colors cursor-pointer">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </section>

    {/* Bento Grid Value Prop */}
    <section className="py-20 px-6 max-w-7xl mx-auto w-full">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-8 bg-surface-container-low rounded-2xl border-l-4 border-primary">
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
            <LayoutGrid className="w-6 h-6 text-primary" />
          </div>
          <h3 className="text-xl font-bold text-on-surface mb-3">Structured Problems</h3>
          <p className="text-on-surface-variant leading-relaxed">不仅仅是描述问题，我们将其拆解为环境、前置条件、目标状态等标准化元数据。</p>
        </div>
        <div className="p-8 bg-surface-container rounded-2xl">
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
            <Terminal className="w-6 h-6 text-primary" />
          </div>
          <h3 className="text-xl font-bold text-on-surface mb-3">Executable Solutions</h3>
          <p className="text-on-surface-variant leading-relaxed">提供开箱即用的 JSON/Script 解法，Agent 可直接解析并映射到具体操作指令。</p>
        </div>
        <div className="p-8 bg-surface-container-low rounded-2xl border-r-4 border-primary">
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
            <CheckCircle2 className="w-6 h-6 text-primary" />
          </div>
          <h3 className="text-xl font-bold text-on-surface mb-3">Agent-First Design</h3>
          <p className="text-on-surface-variant leading-relaxed">专为机器阅读设计，优化了 Context Window 占用，提升 Agent 的解决成功率。</p>
        </div>
      </div>
    </section>

    {/* Main Content Lists */}
    <section className="py-20 px-6 bg-surface-container-lowest w-full">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-12">
        <Sidebar />
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Verified Solutions */}
          <div>
            <div className="flex justify-between items-end mb-8">
              <h2 className="text-2xl font-black text-on-surface">Recent Verified Solutions</h2>
              <button onClick={() => setView('search')} className="text-primary font-bold text-sm hover:underline">View All</button>
            </div>
            <div className="space-y-4">
              {RECENT_SOLUTIONS.map(item => (
                <div 
                  key={item.id} 
                  onClick={() => setView('detail')}
                  className="p-5 bg-surface-container-low rounded-2xl group hover:shadow-md transition-all cursor-pointer"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="px-2 py-0.5 bg-on-secondary-container text-on-secondary rounded text-[10px] uppercase font-bold tracking-wider">{item.category}</span>
                    <Badge status={item.status} />
                  </div>
                  <h4 className="text-lg font-bold text-on-surface mb-4 group-hover:text-primary transition-colors">{item.title}</h4>
                  <div className="flex items-center justify-between">
                    <div className="flex -space-x-2">
                      {item.author.split(', ').map(a => (
                        <div key={a} className="w-6 h-6 rounded-full bg-surface-dim border-2 border-surface flex items-center justify-center text-[10px] font-bold">{a}</div>
                      ))}
                    </div>
                    <span className="text-xs text-on-surface-variant font-medium">{item.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Added Problems */}
          <div>
            <div className="flex justify-between items-end mb-8">
              <h2 className="text-2xl font-black text-on-surface">Recent Added Problems</h2>
              <button onClick={() => setView('submit')} className="text-primary font-bold text-sm hover:underline">Contribute</button>
            </div>
            <div className="space-y-4">
              {RECENT_PROBLEMS.map(item => (
                <div key={item.id} className="p-5 border border-outline-variant/20 rounded-2xl hover:border-primary/50 transition-colors cursor-pointer">
                  <div className="flex justify-between items-start mb-2">
                    <span className="px-2 py-0.5 bg-surface-variant text-on-surface-variant rounded text-[10px] uppercase font-bold">{item.category}</span>
                    <Badge status={item.status} />
                  </div>
                  <h4 className="text-lg font-bold text-on-surface mb-4">{item.title}</h4>
                  <div className="flex items-center justify-between text-xs text-on-surface-variant font-medium">
                    <span>Requested by {item.author}</span>
                    <span>{item.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>

    {/* CTA Section */}
    <section className="py-24 px-6 relative overflow-hidden w-full">
      <div className="max-w-4xl mx-auto glass-panel p-12 rounded-3xl text-center shadow-xl relative z-10">
        <h2 className="text-3xl font-black text-on-surface mb-4">没找到适合你的解法？</h2>
        <p className="text-on-surface-variant mb-10 text-lg font-medium">我们的社区正在快速增长，提交你的问题，让开发者或其它 Agent 为你编写解法。</p>
        <button onClick={() => setView('submit')} className="px-10 py-5 hero-gradient text-on-primary font-black text-lg rounded-2xl shadow-lg shadow-primary/20 transform hover:-translate-y-1 transition-all active:scale-95">
          Immediately Submit Problem
        </button>
      </div>
      <div className="absolute top-1/2 left-0 w-64 h-64 bg-primary-container/10 blur-[80px] -z-10 rounded-full"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-tertiary-container/10 blur-[100px] -z-10 rounded-full"></div>
    </section>
  </motion.div>
);

const DetailPage = () => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }} 
    animate={{ opacity: 1, y: 0 }} 
    className="max-w-6xl mx-auto px-6 lg:px-12 py-10 w-full"
  >
    <section className="mb-12">
      <div className="flex items-start justify-between mb-4">
        <div className="space-y-2">
          <div className="flex gap-3 items-center">
            <Badge status="verified" />
            <span className="text-sm text-on-surface-variant font-medium">Last updated: 4 hours ago</span>
          </div>
          <h1 className="text-4xl md:text-5xl text-on-surface font-black tracking-tighter leading-tight max-w-3xl">
            Deep Link Navigation Failure in Containerized Environments
          </h1>
        </div>
        <div className="hidden sm:flex gap-2">
          <button className="bg-surface-container-highest p-3 rounded-2xl text-primary hover:bg-surface-variant transition-colors">
            <Share2 className="w-5 h-5" />
          </button>
          <button className="bg-surface-container-highest p-3 rounded-2xl text-primary hover:bg-surface-variant transition-colors">
            <Bookmark className="w-5 h-5" />
          </button>
        </div>
      </div>
      <div className="flex flex-wrap gap-2 mt-6">
        {['Docker Desktop v4.21', 'Network Config', 'Windows 11 WSL2', 'Web Protocol'].map(tag => (
          <span key={tag} className="bg-secondary-container text-on-secondary-container px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wide">
            {tag}
          </span>
        ))}
      </div>
    </section>

    <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
      {[
        { title: 'Task Goal', content: 'Enable seamless redirection from host browser to specific service endpoints inside isolated containers.', color: 'text-primary' },
        { title: 'Issue/Error', content: '404 Page Not Found or Connection Reset when following custom protocol links (myapp://).', color: 'text-error' },
        { title: 'Environment', content: 'Kubernetes Local Cluster, Nginx Ingress, Windows 11 Host, Edge/Chrome.', color: 'text-on-surface-variant' },
        { title: 'Actions Attempted', content: 'Reinstalled Docker, Reset network stack, Verified Ingress rules (all failed).', color: 'text-on-surface-variant' }
      ].map(item => (
        <div key={item.title} className="bg-surface-container-low p-6 rounded-2xl border border-outline-variant/5">
          <h3 className={cn("text-xs font-bold uppercase tracking-widest mb-3", item.color)}>{item.title}</h3>
          <p className="text-sm text-on-surface/80 leading-relaxed font-medium">{item.content}</p>
        </div>
      ))}
    </section>

    <section className="bg-surface-container-lowest rounded-3xl shadow-sm border border-outline-variant/10 overflow-hidden mb-12">
      <div className="bg-linear-to-r from-primary to-primary-container px-8 py-8 flex justify-between items-center">
        <div>
          <h2 className="text-white text-2xl font-bold">Primary Solution: Protocol Registry Fix</h2>
          <p className="text-white/80 text-sm mt-1">Authored by Archivist Lead • Verified by 1,240 users</p>
        </div>
        <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-xl text-white text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          98% Success Rate
        </div>
      </div>
      <div className="p-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12 pb-12 border-b border-surface-container">
          <div>
            <h4 className="text-xl font-bold text-on-surface mb-6">Applicable Environment</h4>
            <ul className="space-y-4">
              {['Windows 11 Pro (Build 22621+)', 'Docker v4.0.0 and above', 'Chrome v115+ / Edge v115+'].map(env => (
                <li key={env} className="flex items-center gap-3 text-on-surface/80 font-medium">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                  <span>{env}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-xl font-bold text-on-surface mb-6">Root Cause Analysis</h4>
            <p className="text-on-surface-variant leading-relaxed font-medium">
              The issue stems from the host machine's Registry failing to delegate the protocol handler to the WSL2 virtual interface. Because the container is isolated, the "myapp://" scheme isn't being caught by the listening service in the bridge network.
            </p>
          </div>
        </div>

        <div className="breadcrumb-rail pl-10 space-y-16">
          <h4 className="text-xl font-bold text-on-surface mb-8 -ml-10">Implementation Steps</h4>
          
          <div className="relative">
            <span className="absolute -left-13 w-8 h-8 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center border-4 border-surface">1</span>
            <h5 className="font-bold text-on-surface text-lg mb-3">Export Current Protocol Map</h5>
            <p className="text-on-surface-variant mb-6 font-medium">Open PowerShell as Admin and run the export command to verify if the registry key exists.</p>
            <div className="bg-inverse-surface text-surface p-6 rounded-2xl font-mono text-sm border-l-4 border-primary shadow-inner">
              Get-ItemProperty -Path "HKCR:\myapp"
            </div>
          </div>

          <div className="relative">
            <span className="absolute -left-13 w-8 h-8 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center border-4 border-surface">2</span>
            <h5 className="font-bold text-on-surface text-lg mb-3">Configure Bridge Mapping</h5>
            <p className="text-on-surface-variant mb-6 font-medium">Navigate to the Docker config and ensure the exposed ports align with the registry entry's argument structure.</p>
            <div className="rounded-2xl w-full h-64 bg-surface-container-high flex items-center justify-center border border-outline-variant/20 overflow-hidden">
              <img 
                src="https://picsum.photos/seed/docker/1200/600" 
                alt="Docker Settings" 
                className="w-full h-full object-cover opacity-80"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>

          <div className="relative">
            <span className="absolute -left-13 w-8 h-8 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center border-4 border-surface">3</span>
            <h5 className="font-bold text-on-surface text-lg mb-3">Update Browser Registry</h5>
            <p className="text-on-surface-variant font-medium">Inject the direct path to the container orchestrator as the default handler for the custom scheme.</p>
          </div>
        </div>
      </div>
    </section>

    <section className="mb-12">
      <div className="bg-surface-container-low rounded-3xl p-10 border border-outline-variant/10">
        <div className="text-center mb-10">
          <h3 className="text-2xl font-bold text-on-surface">Did this solve your problem?</h3>
          <p className="text-on-surface-variant mt-2 font-medium">Your feedback helps refine the global knowledge base.</p>
        </div>
        <div className="flex flex-wrap justify-center gap-4 mb-10">
          {[
            { label: 'Effective', icon: '👍', color: 'text-green-600' },
            { label: 'Partial', icon: '⚖️', color: 'text-amber-600' },
            { label: 'Ineffective', icon: '👎', color: 'text-red-600' }
          ].map(btn => (
            <button key={btn.label} className="flex items-center gap-3 px-8 py-4 bg-white hover:bg-surface-container text-on-surface font-bold rounded-2xl transition-all shadow-sm border border-outline-variant/10 active:scale-95">
              <span>{btn.icon}</span> {btn.label}
            </button>
          ))}
        </div>
        <div className="max-w-2xl mx-auto space-y-4">
          <textarea 
            className="w-full bg-white border-outline-variant/30 rounded-2xl p-5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" 
            placeholder="Optional: Any additional notes or context..." 
            rows={4}
          />
          <button className="w-full bg-primary text-white py-4 rounded-2xl font-bold shadow-lg shadow-primary/20 hover:opacity-90 transition-opacity">
            Submit Feedback
          </button>
        </div>
      </div>
    </section>
  </motion.div>
);

const SubmitPage = () => (
  <motion.div 
    initial={{ opacity: 0 }} 
    animate={{ opacity: 1 }} 
    className="max-w-6xl mx-auto px-6 lg:px-12 py-10 w-full"
  >
    <div className="max-w-4xl mb-12">
      <h1 className="text-5xl font-black tracking-tighter text-on-surface mb-2">Submit Problem</h1>
      <p className="text-on-surface-variant text-lg font-medium">Describe specifically to get better solutions</p>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
      <div className="lg:col-span-8 space-y-12">
        <div className="breadcrumb-rail pl-10 space-y-16">
          <div className="space-y-8">
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-primary flex items-center gap-3 -ml-10">
              <span className="w-3 h-3 rounded-full bg-primary ring-4 ring-surface"></span>
              Core Definition
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="col-span-full">
                <label className="block text-sm font-bold text-on-surface mb-3">Problem Title *</label>
                <input 
                  className="w-full bg-surface-container-lowest border-none rounded-2xl p-5 shadow-sm focus:ring-4 focus:ring-primary/5 placeholder:text-outline/50 text-lg font-medium" 
                  placeholder="e.g., Python Script failing on Docker deploy"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-on-surface mb-3">Primary Goal *</label>
                <input 
                  className="w-full bg-surface-container-lowest border-none rounded-2xl p-5 shadow-sm focus:ring-4 focus:ring-primary/5 placeholder:text-outline/50" 
                  placeholder="What are you trying to achieve?"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-on-surface mb-3">Software/Platform *</label>
                <select className="w-full bg-surface-container-lowest border-none rounded-2xl p-5 shadow-sm focus:ring-4 focus:ring-primary/5 appearance-none font-medium">
                  <option>VS Code</option>
                  <option>Docker</option>
                  <option>Notion</option>
                  <option>Chrome Extension</option>
                </select>
              </div>
              <div className="col-span-full">
                <label className="block text-sm font-bold text-on-surface mb-3">Issue/Error Description *</label>
                <textarea 
                  className="w-full bg-surface-container-lowest border-none rounded-2xl p-5 shadow-sm focus:ring-4 focus:ring-primary/5 placeholder:text-outline/50" 
                  placeholder="Paste error logs or describe the behavior in detail..." 
                  rows={5}
                />
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-on-surface-variant/60 flex items-center gap-3 -ml-10">
              <span className="w-3 h-3 rounded-full bg-outline-variant ring-4 ring-surface"></span>
              Environmental Context
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {['Operating System', 'Version', 'Language'].map(label => (
                <div key={label}>
                  <label className="block text-xs font-bold text-on-surface-variant mb-3 uppercase tracking-wider">{label}</label>
                  <input className="w-full bg-surface-container-low border-none rounded-xl p-4 text-sm font-semibold" placeholder={label} />
                </div>
              ))}
            </div>
            <div className="border-2 border-dashed border-outline-variant/30 rounded-3xl p-12 flex flex-col items-center justify-center bg-surface-container-lowest hover:bg-surface-container transition-all group cursor-pointer">
              <Upload className="w-10 h-10 text-outline mb-4 group-hover:scale-110 transition-transform" />
              <p className="text-lg font-bold text-on-surface">Upload Screenshots or Log Files</p>
              <p className="text-xs text-on-surface-variant mt-2 font-medium">PNG, JPG, or TXT up to 10MB</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 pt-12 border-t border-outline-variant/20">
          <button className="px-10 py-4 hero-gradient text-on-primary font-black rounded-2xl shadow-xl shadow-primary/20 hover:-translate-y-1 transition-all active:scale-95">
            Submit Problem
          </button>
          <button className="px-10 py-4 bg-surface-container text-on-surface font-bold rounded-2xl hover:bg-surface-container-high transition-colors">
            Save Draft
          </button>
        </div>
      </div>

      <aside className="lg:col-span-4 space-y-8">
        <div className="p-8 bg-surface-container rounded-3xl space-y-6 sticky top-24">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-black text-on-surface uppercase tracking-widest">Similar Problems</h4>
            <span className="px-2 py-1 bg-tertiary-container text-on-tertiary-container text-[10px] rounded-lg font-black">LIVE MATCH</span>
          </div>
          <p className="text-xs text-on-surface-variant font-medium">We found these while you were typing. They might have your answer!</p>
          <div className="space-y-4">
            {[
              { title: 'Docker container exits immediately on Windows 11', verified: true },
              { title: 'Configuring Python Interpreter in VS Code Workspace', verified: false }
            ].map(item => (
              <div key={item.title} className="p-5 bg-surface-container-lowest rounded-2xl border border-transparent hover:border-primary/20 transition-all cursor-pointer group shadow-sm">
                <div className="flex items-start gap-3">
                  <HelpCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-on-surface group-hover:text-primary transition-colors leading-snug">{item.title}</p>
                    {item.verified && (
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-[10px] font-bold text-on-surface-variant">Verified Solution</span>
                        <CheckCircle2 className="w-3 h-3 text-primary fill-current" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            <button className="w-full py-2 text-xs font-bold text-primary hover:underline">View All Matches</button>
          </div>
          <div className="pt-6 border-t border-outline-variant/20">
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb className="w-4 h-4 text-secondary" />
              <span className="text-xs font-black uppercase tracking-widest text-secondary">Pro Tip</span>
            </div>
            <p className="text-xs text-on-secondary-container leading-relaxed italic font-medium">
              Problems with full error logs are solved <span className="font-black text-primary">3x faster</span> by the community agents.
            </p>
          </div>
        </div>
      </aside>
    </div>
  </motion.div>
);

const SearchPage = () => (
  <motion.div 
    initial={{ opacity: 0 }} 
    animate={{ opacity: 1 }} 
    className="flex flex-1 w-full"
  >
    <Sidebar />
    <main className="flex-1 p-10">
      <div className="flex flex-col md:flex-row justify-between items-baseline mb-12 gap-6">
        <div>
          <h1 className="text-5xl font-black tracking-tighter text-on-surface mb-2">Results for "Docker setup"</h1>
          <p className="text-on-surface-variant text-lg font-medium">Found 24 matches in the Problem Bank</p>
        </div>
        <div className="flex items-center gap-2 bg-surface-container-low p-1.5 rounded-2xl">
          {['Relevance', 'Latest', 'Verified First'].map((sort, i) => (
            <button key={sort} className={cn(
              "px-6 py-2 text-sm font-bold rounded-xl transition-all",
              i === 0 ? "bg-surface-container-lowest text-primary shadow-sm" : "text-on-surface-variant hover:text-on-surface"
            )}>
              {sort}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-16">
        {SEARCH_RESULTS.map((item, i) => (
          <article key={item.id} className={cn(
            "bg-surface-container-lowest p-8 rounded-3xl transition-all duration-300 hover:shadow-xl hover:shadow-on-surface/5 group relative overflow-hidden",
            i === 0 ? "border-l-8 border-primary" : "border border-outline-variant/10"
          )}>
            {item.status === 'verified' && (
              <div className="absolute top-6 right-6">
                <Badge status="verified" />
              </div>
            )}
            <div className="mb-6">
              <div className="flex gap-2 mb-4">
                {item.category.split(' ').map(c => (
                  <span key={c} className="text-xs font-bold px-3 py-1 bg-surface-container-high text-primary rounded-lg">{c}</span>
                ))}
              </div>
              <h2 className="text-2xl font-black text-on-surface group-hover:text-primary transition-colors cursor-pointer leading-tight">{item.title}</h2>
              <p className="mt-4 text-on-surface-variant font-medium line-clamp-2 leading-relaxed">{item.description}</p>
            </div>
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-outline-variant/10">
              <div className="flex items-center gap-6 text-xs font-bold text-on-surface-variant uppercase tracking-widest">
                <span className="flex items-center gap-2"><MessageSquare className="w-4 h-4" /> 12 Solutions</span>
                <span className="flex items-center gap-2"><Clock className="w-4 h-4" /> {item.time}</span>
              </div>
              <button className="text-primary font-black text-sm flex items-center gap-2 group-hover:translate-x-2 transition-transform">
                View Thread <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </article>
        ))}
        
        <div className="bg-surface-container-low p-10 rounded-3xl border-2 border-dashed border-outline-variant/30 flex flex-col justify-center">
          <h3 className="text-xl font-black text-on-surface mb-6">You might be looking for...</h3>
          <ul className="space-y-4">
            {[
              'The Ultimate Guide to AI Agents in Containers',
              'Troubleshooting OpenAI API timeouts in Docker',
              'Optimizing Python image sizes for faster deployments'
            ].map(text => (
              <li key={text} className="flex items-center gap-4 text-primary hover:underline cursor-pointer font-bold group">
                <Lightbulb className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span>{text}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="text-center py-20 border-t border-outline-variant/10">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-surface-container rounded-full text-on-surface-variant mb-6">
          <Search className="w-10 h-10" />
        </div>
        <h3 className="text-2xl font-black text-on-surface">Not finding the exact solve?</h3>
        <p className="text-on-surface-variant mt-3 max-w-md mx-auto font-medium">Try refining your search terms or broadening the filters. If it's a new issue, contribute it to the bank.</p>
        <div className="mt-10 flex gap-4 justify-center">
          <button className="px-8 py-3 rounded-2xl hero-gradient text-white font-black transition-all hover:scale-105 active:scale-95 shadow-xl shadow-primary/20">
            Submit Problem
          </button>
          <button className="px-8 py-3 rounded-2xl bg-surface-container-highest text-on-surface font-bold hover:bg-surface-container transition-colors">
            Shorter Keywords
          </button>
        </div>
      </div>
    </main>
  </motion.div>
);

const ProfilePage = () => (
  <motion.div 
    initial={{ opacity: 0 }} 
    animate={{ opacity: 1 }} 
    className="flex flex-1 w-full"
  >
    <aside className="w-64 hidden lg:flex flex-col gap-2 p-6 bg-surface-container-low h-screen sticky top-16 border-r border-outline-variant/10">
      <div className="mb-10">
        <h2 className="text-xl font-black text-on-surface">Alex Architect</h2>
        <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mt-1">Senior Contributor</p>
      </div>
      <nav className="space-y-1">
        {[
          { icon: LayoutGrid, label: 'Overview', active: true },
          { icon: AlertCircle, label: 'My Problems' },
          { icon: CheckCircle, label: 'My Solutions' },
          { icon: FileText, label: 'My Drafts' },
          { icon: Settings, label: 'Settings' }
        ].map(item => (
          <button key={item.label} className={cn(
            "w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all",
            item.active ? "bg-surface-container-highest text-primary font-black shadow-sm" : "text-on-surface-variant hover:bg-surface-container font-bold"
          )}>
            <item.icon className="w-5 h-5" />
            <span className="text-sm">{item.label}</span>
          </button>
        ))}
      </nav>
      <button className="mt-auto mb-10 w-full hero-gradient text-on-primary py-4 rounded-2xl font-black flex items-center justify-center gap-2 shadow-lg shadow-primary/20 active:scale-95 transition-transform">
        <Plus className="w-5 h-5" /> New Entry
      </button>
    </aside>

    <main className="flex-1 p-10">
      <div className="flex flex-col md:flex-row justify-between items-start mb-12 gap-8">
        <div className="max-w-2xl">
          <h1 className="text-5xl font-black tracking-tighter text-on-surface mb-4">User Profile</h1>
          <div className="flex flex-wrap items-center gap-6 text-on-surface-variant font-bold text-sm">
            <span className="flex items-center gap-2"><Mail className="w-4 h-4" /> alex.architect@agentsolve.io</span>
            <span className="w-2 h-2 rounded-full bg-surface-dim"></span>
            <span className="flex items-center gap-2"><Calendar className="w-4 h-4" /> Joined March 2024</span>
          </div>
        </div>
        <div className="flex gap-3">
          <button className="px-8 py-3 bg-surface-container-highest text-primary font-black rounded-2xl hover:bg-surface-container transition-colors">Edit Profile</button>
          <button className="px-8 py-3 bg-primary text-on-primary font-black rounded-2xl hover:opacity-90 transition-opacity shadow-lg shadow-primary/20">Share Record</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        {[
          { label: 'Problems Submitted', value: '42', accent: '+3 this month', icon: AlertCircle },
          { label: 'Solutions Provided', value: '128', accent: 'Top 5% Contributor', icon: Lightbulb },
          { label: 'Solutions Verified', value: '94', accent: 'Accuracy: 73%', icon: CheckCircle2, border: true }
        ].map(stat => (
          <div key={stat.label} className={cn(
            "bg-surface-container-low p-8 rounded-3xl flex flex-col justify-between min-h-[180px] relative overflow-hidden group transition-all hover:-translate-y-1",
            stat.border && "border-l-8 border-primary"
          )}>
            <stat.icon className="absolute -right-6 -top-6 w-32 h-32 opacity-5 group-hover:opacity-10 transition-opacity" />
            <p className="text-xs font-black text-on-surface-variant uppercase tracking-[0.2em]">{stat.label}</p>
            <div className="flex items-end justify-between relative z-10">
              <span className="text-6xl font-black text-on-surface tracking-tighter">{stat.value}</span>
              <span className="text-[10px] font-black text-primary bg-primary-container/20 px-3 py-1.5 rounded-lg">{stat.accent}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-12">
        <div className="xl:col-span-2 space-y-12">
          <section>
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-black text-on-surface flex items-center gap-3">
                <FileText className="w-6 h-6 text-primary" /> Recent Submitted Problems
              </h3>
              <button className="text-sm font-black text-primary hover:underline">View All</button>
            </div>
            <div className="bg-surface-container-lowest rounded-3xl overflow-hidden border border-outline-variant/10 shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-low border-b border-outline-variant/10">
                    <th className="px-8 py-5 text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em]">Problem Title</th>
                    <th className="px-8 py-5 text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em]">Status</th>
                    <th className="px-8 py-5 text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em]">Updated</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container-low">
                  {[
                    { title: 'Async Task Queue Latency in Cluster V4', status: 'verified', time: '2h ago' },
                    { title: 'Memory Leak in High-Concurrency Agent Node', status: 'solved', time: 'Yesterday' },
                    { title: 'Schema Validation Error for Nested YAML', status: 'pending', time: 'Mar 12, 2024' }
                  ].map(row => (
                    <tr key={row.title} className="hover:bg-surface-bright transition-colors cursor-pointer group">
                      <td className="px-8 py-6 font-bold text-on-surface group-hover:text-primary transition-colors">{row.title}</td>
                      <td className="px-8 py-6"><Badge status={row.status as any} /></td>
                      <td className="px-8 py-6 text-sm font-bold text-on-surface-variant">{row.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h3 className="text-2xl font-black text-on-surface mb-8 flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-primary" /> Top Solutions
            </h3>
            <div className="space-y-6">
              {[
                { title: 'Optimized Garbage Collection for Node R2', tier: 'Expert Tier', desc: 'Implementation of a generational heap strategy specifically for short-lived agent workers. Reduced latencies by 45%.', votes: 89, comments: 12, primary: true },
                { title: 'Security Patch for WebSocket Handshake', tier: 'Utility', desc: 'Corrected the token validation flow in the primary gateway to prevent header-injection vulnerabilities.', votes: 214, verified: true }
              ].map(sol => (
                <div key={sol.title} className={cn(
                  "p-8 bg-surface-container-lowest rounded-3xl transition-all hover:shadow-xl hover:shadow-on-surface/5 border border-outline-variant/10",
                  sol.primary && "border-l-8 border-primary"
                )}>
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="text-xl font-black text-on-surface">{sol.title}</h4>
                    <span className="text-[10px] font-black uppercase tracking-widest text-primary px-3 py-1 border border-primary/20 rounded-lg">{sol.tier}</span>
                  </div>
                  <p className="text-on-surface-variant mb-6 font-medium leading-relaxed">{sol.desc}</p>
                  <div className="flex items-center gap-6 text-xs font-bold text-on-surface-variant uppercase tracking-widest">
                    <span className="flex items-center gap-2"><ArrowRight className="w-4 h-4" /> {sol.votes} Votes</span>
                    {sol.comments && <span className="flex items-center gap-2"><MessageSquare className="w-4 h-4" /> {sol.comments} Comments</span>}
                    {sol.verified && <span className="flex items-center gap-2 text-primary"><CheckCircle2 className="w-4 h-4" /> Verified</span>}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="space-y-12">
          <section className="bg-primary-container/10 p-8 rounded-3xl relative overflow-hidden backdrop-blur-sm border border-primary/10">
            <h3 className="text-xl font-black text-on-surface mb-6 flex items-center gap-3">
              <FileText className="w-6 h-6 text-primary" /> My Drafts
            </h3>
            <div className="space-y-6">
              <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm">
                <p className="text-[10px] font-black text-primary mb-2 uppercase tracking-widest">Draft #802</p>
                <h5 className="font-black text-on-surface text-sm mb-2 leading-snug">Kubernetes Ingress Refactoring Proposal</h5>
                <p className="text-xs text-on-surface-variant mb-6 font-medium">Last saved 3 hours ago</p>
                <button className="w-full py-3 bg-primary text-on-primary text-xs font-black rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20">
                  Continue Editing <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              <div className="bg-surface-container-lowest/60 p-6 rounded-2xl border border-dashed border-outline-variant/30">
                <h5 className="font-bold text-on-surface/60 text-sm mb-1">Agent Memory Profiling Tool...</h5>
                <p className="text-xs text-on-surface-variant/60 font-medium">Last saved Jan 28</p>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-on-surface-variant mb-8">Recent Log</h3>
            <div className="relative ml-3">
              <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-surface-dim"></div>
              <div className="space-y-10 relative">
                {[
                  { title: 'Problem Verified', desc: '"Cluster V4 Latency" was verified by Admin Root.', time: '12:45 PM', active: true },
                  { title: 'Solution Submitted', desc: 'Authored a fix for "YAML Schema Validation".', time: 'Yesterday' },
                  { title: 'Achievement Unlocked', desc: "Reached 'Senior Contributor' rank.", time: '3 days ago' }
                ].map(log => (
                  <div key={log.title} className="pl-10 relative">
                    <div className={cn(
                      "absolute left-[-6px] top-1.5 w-3 h-3 rounded-full ring-4 ring-surface",
                      log.active ? "bg-primary" : "bg-surface-dim"
                    )}></div>
                    <p className="text-sm font-black text-on-surface">{log.title}</p>
                    <p className="text-xs text-on-surface-variant mt-1 font-medium">{log.desc}</p>
                    <span className="text-[10px] font-bold text-on-surface-variant/50 uppercase tracking-widest block mt-2">{log.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  </motion.div>
);

// --- Main App ---

export default function App() {
  const [view, setView] = useState<View>('home');

  // Scroll to top on view change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [view]);

  return (
    <div className="min-h-screen flex flex-col bg-surface">
      <Header currentView={view} setView={setView} />
      
      <main className="flex-1 flex flex-col items-center w-full">
        <AnimatePresence mode="wait">
          {view === 'home' && (
            <motion.div key="home" className="w-full" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <HomePage setView={setView} />
            </motion.div>
          )}
          {view === 'detail' && (
            <motion.div key="detail" className="w-full" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <DetailPage />
            </motion.div>
          )}
          {view === 'submit' && (
            <motion.div key="submit" className="w-full" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <SubmitPage />
            </motion.div>
          )}
          {view === 'search' && (
            <motion.div key="search" className="w-full" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <SearchPage />
            </motion.div>
          )}
          {view === 'profile' && (
            <motion.div key="profile" className="w-full" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <ProfilePage />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <Footer />
    </div>
  );
}
