import React, { useState } from 'react';
import { motion } from 'framer-motion';

const ArchitectureDiagram = () => {
  const [selectedLayer, setSelectedLayer] = useState(null);

  const layers = {
    presentation: {
      title: 'Camada de Apresentação',
      color: 'from-pink-500 to-rose-600',
      items: [
        { name: 'App.tsx', desc: 'Orquestrador principal, gerencia estado global, presença online, auto-lock' },
        { name: 'ChatInterface', desc: 'Chat em tempo real com paginação infinita, typing indicators' },
        { name: 'Profile', desc: 'Gerenciamento de avatar e perfil' },
        { name: 'AuthScreen', desc: 'Autenticação via PIN' },
        { name: 'LoveAnimation', desc: 'Animações românticas com Framer Motion' }
      ]
    },
    business: {
      title: 'Camada de Negócio',
      color: 'from-blue-500 to-indigo-600',
      items: [
        { name: 'Realtime Sync', desc: 'Sincronização bidirecional via Supabase Realtime' },
        { name: 'Presence System', desc: 'Heartbeat de 10s para status online/offline preciso' },
        { name: 'Message Queue', desc: 'Paginação (30 msgs/página), cache em memória' },
        { name: 'Avatar Caching', desc: 'TTL de 5min para reduzir latência no Storage' },
        { name: 'Auto-Lock', desc: 'Trava app após 3min de inatividade' }
      ]
    },
    data: {
      title: 'Camada de Dados',
      color: 'from-emerald-500 to-teal-600',
      items: [
        { name: 'Supabase Client', desc: 'PostgreSQL com RLS, auth persistente, auto-refresh' },
        { name: 'Storage (avatars)', desc: 'Bucket público para imagens de perfil' },
        { name: 'Realtime Channel', desc: 'WebSocket para mensagens e typing status' },
        { name: 'Edge Functions', desc: 'Push notifications via OneSignal' }
      ]
    },
    external: {
      title: 'Serviços Externos',
      color: 'from-purple-500 to-violet-600',
      items: [
        { name: 'OneSignal', desc: 'Push notifications agrupadas por conversa' },
        { name: 'Capacitor', desc: 'Deploy iOS/Android nativo' },
        { name: 'Supabase Cloud', desc: 'Backend-as-a-Service completo' }
      ]
    }
  };

  const patterns = [
    { name: 'Clean Architecture', desc: 'Separação clara entre UI, lógica e dados' },
    { name: 'Observer Pattern', desc: 'Supabase Realtime subscriptions' },
    { name: 'Cache-Aside', desc: 'Avatar cache com TTL de 5min' },
    { name: 'Optimistic UI', desc: 'Mensagens aparecem imediatamente' },
    { name: 'Singleton', desc: 'Supabase client único na aplicação' }
  ];

  const dataFlow = [
    { from: 'User Input', to: 'ChatInterface', action: 'digita mensagem' },
    { from: 'ChatInterface', to: 'Supabase Client', action: 'INSERT na tabela messages' },
    { from: 'Supabase', to: 'Edge Function', action: 'Database Trigger' },
    { from: 'Edge Function', to: 'OneSignal', action: 'envia push notification' },
    { from: 'Supabase Realtime', to: 'Partner App', action: 'broadcast da nova mensagem' },
    { from: 'Partner App', to: 'ChatInterface', action: 'renderiza mensagem' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8 text-white">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold mb-3 bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
            CapyBook Architecture
          </h1>
          <p className="text-slate-300 text-lg">Real-time Couple Chat App • React + TypeScript + Supabase</p>
        </motion.div>

        {/* Tech Stack Pills */}
        <div className="flex flex-wrap gap-2 justify-center mb-12">
          {['React 18', 'TypeScript', 'Supabase', 'Capacitor', 'Framer Motion', 'OneSignal', 'Vite'].map((tech) => (
            <span key={tech} className="px-4 py-2 bg-white/10 rounded-full text-sm backdrop-blur-sm border border-white/20">
              {tech}
            </span>
          ))}
        </div>

        {/* Architecture Layers */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {Object.entries(layers).map(([key, layer]) => (
            <motion.div
              key={key}
              whileHover={{ scale: 1.02 }}
              onClick={() => setSelectedLayer(selectedLayer === key ? null : key)}
              className={`bg-gradient-to-br ${layer.color} p-6 rounded-2xl cursor-pointer shadow-2xl border border-white/20`}
            >
              <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <span className="text-3xl">
                  {key === 'presentation' && '🎨'}
                  {key === 'business' && '⚙️'}
                  {key === 'data' && '💾'}
                  {key === 'external' && '🌐'}
                </span>
                {layer.title}
              </h3>
              <div className="space-y-3">
                {layer.items.map((item) => (
                  <div key={item.name} className="bg-black/20 p-3 rounded-lg backdrop-blur-sm">
                    <div className="font-semibold text-sm mb-1">{item.name}</div>
                    <div className="text-xs text-white/80">{item.desc}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Data Flow */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-8 mb-12 border border-purple-500/30"
        >
          <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <span className="text-3xl">📡</span>
            Fluxo de Mensagem em Tempo Real
          </h3>
          <div className="space-y-4">
            {dataFlow.map((flow, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * idx }}
                className="flex items-center gap-4 text-sm"
              >
                <div className="bg-gradient-to-r from-pink-500 to-purple-500 px-4 py-2 rounded-lg font-semibold min-w-[140px] text-center">
                  {flow.from}
                </div>
                <div className="text-2xl">→</div>
                <div className="bg-purple-500/30 px-3 py-1 rounded-md text-xs italic flex-1">
                  {flow.action}
                </div>
                <div className="text-2xl">→</div>
                <div className="bg-gradient-to-r from-indigo-500 to-blue-500 px-4 py-2 rounded-lg font-semibold min-w-[140px] text-center">
                  {flow.to}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Design Patterns */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-8 border border-emerald-500/30"
        >
          <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <span className="text-3xl">🏗️</span>
            Design Patterns Aplicados
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {patterns.map((pattern) => (
              <div key={pattern.name} className="bg-gradient-to-br from-emerald-500/20 to-teal-500/20 p-4 rounded-xl border border-emerald-500/30">
                <div className="font-bold text-emerald-300 mb-2">{pattern.name}</div>
                <div className="text-xs text-slate-300">{pattern.desc}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Key Metrics */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12"
        >
          {[
            { label: 'Heartbeat', value: '10s', icon: '💓' },
            { label: 'Auto-Lock', value: '3min', icon: '🔒' },
            { label: 'Page Size', value: '30 msgs', icon: '📄' },
            { label: 'Cache TTL', value: '5min', icon: '⚡' }
          ].map((metric) => (
            <div key={metric.label} className="bg-gradient-to-br from-slate-700 to-slate-800 p-6 rounded-xl text-center border border-slate-600">
              <div className="text-3xl mb-2">{metric.icon}</div>
              <div className="text-2xl font-bold text-purple-400">{metric.value}</div>
              <div className="text-sm text-slate-400">{metric.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Footer */}
        <div className="text-center mt-12 text-slate-400 text-sm">
          <p>💜 Arquitetura otimizada para performance, segurança e experiência romântica</p>
        </div>
      </div>
    </div>
  );
};

export default ArchitectureDiagram;
