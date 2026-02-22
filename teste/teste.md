import React, { useState, useCallback, useEffect, useRef } from 'react';

// --- Interfaces ---
type FileCategory = 'image' | 'video' | 'audio' | 'pdf' | 'text' | 'unsupported';

interface MediaRendererProps {
  url: string;
  fileType: FileCategory;
  onLog: (level: LogLevel, message: string) => void;
}

interface FileData {
  path: string;
  url: string;
  type: FileCategory;
}

type LogLevel = 'info' | 'success' | 'error' | 'warning';

interface LogEntry {
  id: string;
  timestamp: string;
  level: LogLevel;
  message: string;
}

interface GitHubNode {
  name: string;
  path: string;
  sha: string;
  size: number;
  url: string;
  html_url: string;
  git_url: string;
  download_url: string | null;
  type: 'file' | 'dir';
}

interface FileExplorerProps {
  owner: string;
  repo: string;
  branch: string;
  onSelectFile: (path: string) => void;
  onLog: (level: LogLevel, message: string) => void;
}

// --- Constants ---
const GITHUB_OWNER = 'SandroBreaker';
const GITHUB_REPO = 'banco-de-dados';
const GITHUB_BRANCH = 'main';

// --- Utility Functions ---
const getFileType = (path: string): FileCategory => {
  const lowerPath = path.toLowerCase();
  if (lowerPath.match(/\.(jpeg|jpg|gif|png|webp|svg|ico)$/)) return 'image';
  if (lowerPath.match(/\.(mp4|webm|ogg|mov)$/)) return 'video';
  if (lowerPath.match(/\.(mp3|wav|m4a|aac|flac)$/)) return 'audio';
  if (lowerPath.match(/\.(pdf)$/)) return 'pdf';
  if (lowerPath.match(/\.(txt|md|json|js|jsx|ts|tsx|css|html|csv|yml|yaml|xml)$/)) return 'text';
  return 'unsupported';
};

const buildCdnUrl = (path: string): string => {
  const cleanPath = path.replace(/^\/+/, '');
  return `https://cdn.jsdelivr.net/gh/${GITHUB_OWNER}/${GITHUB_REPO}@${GITHUB_BRANCH}/${cleanPath}`;
};

const generateId = (): string => Math.random().toString(36).substring(2, 9);

// --- Components ---

const CustomConsole: React.FC<{ logs: LogEntry[], onClear: () => void }> = React.memo(({ logs, onClear }) => {
  const bottomRef = useRef<HTMLDivElement>(null);
  const [copyStatus, setCopyStatus] = useState<string>('Copiar Logs');

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const handleCopyLogs = () => {
    if (logs.length === 0) return;
    const textToCopy = logs.map(l => `[${l.timestamp}] [${l.level.toUpperCase()}] ${l.message}`).join('\n');
    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopyStatus('Copiado!');
      setTimeout(() => setCopyStatus('Copiar Logs'), 2000);
    }).catch(() => setCopyStatus('Erro ao copiar'));
  };

  return (
    <div className="bg-gray-950 rounded-lg shadow-inner overflow-hidden flex flex-col h-full border border-gray-800">
      <div className="bg-gray-900 px-4 py-2 flex justify-between items-center border-b border-gray-800 shrink-0 gap-2">
        <span className="text-gray-300 font-mono text-sm font-bold">Terminal de Debug</span>
        <div className="flex gap-2">
          <button 
            onClick={handleCopyLogs}
            disabled={logs.length === 0}
            className="text-xs bg-blue-900/30 hover:bg-blue-900/50 text-blue-300 px-3 py-1 rounded border border-blue-900/50 transition-colors disabled:opacity-50"
          >
            {copyStatus}
          </button>
          <button 
            onClick={onClear}
            className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-1 rounded border border-gray-700 transition-colors"
          >
            Limpar
          </button>
        </div>
      </div>
      <div className="p-3 overflow-y-auto flex-1 font-mono text-xs space-y-1 select-all custom-scrollbar">
        {logs.length === 0 && (
          <div className="text-gray-600 italic">Aguardando eventos...</div>
        )}
        {logs.map((log) => (
          <div key={log.id} className="flex gap-2 border-b border-gray-800/50 pb-1 break-words">
            <span className="text-gray-500 shrink-0">[{log.timestamp}]</span>
            <span className={`shrink-0 font-bold ${
              log.level === 'error' ? 'text-red-400' : 
              log.level === 'success' ? 'text-green-400' : 
              log.level === 'warning' ? 'text-yellow-400' :
              'text-blue-400'
            }`}>
              [{log.level.toUpperCase()}]
            </span>
            <span className={
              log.level === 'error' ? 'text-red-300' : 
              log.level === 'warning' ? 'text-yellow-300' : 
              'text-gray-300'
            }>
              {log.message}
            </span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
});
CustomConsole.displayName = 'CustomConsole';

const FileExplorer: React.FC<FileExplorerProps> = ({ owner, repo, branch, onSelectFile, onLog }) => {
  const [currentPath, setCurrentPath] = useState<string>('');
  const [items, setItems] = useState<GitHubNode[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchDirectory = useCallback(async (path: string) => {
    setIsLoading(true);
    onLog('info', `Buscando diretório via API REST: /${path || 'root'}`);
    
    try {
      const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`;
      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        if (response.status === 403) throw new Error('Limite API GitHub (Rate Limit) atingido.');
        if (response.status === 404) throw new Error(`Diretório não encontrado: ${path}`);
        throw new Error(`Erro API: ${response.statusText}`);
      }

      const data: unknown = await response.json();
      
      if (!Array.isArray(data)) {
         throw new Error('Resposta não é um diretório válido.');
      }

      const sortedItems = (data as GitHubNode[]).sort((a, b) => {
        if (a.type === b.type) return a.name.localeCompare(b.name);
        return a.type === 'dir' ? -1 : 1;
      });

      setItems(sortedItems);
      setCurrentPath(path);
      onLog('success', `Diretório carregado com sucesso (${sortedItems.length} itens).`);
    } catch (err: unknown) {
      if (err instanceof Error) {
        onLog('error', err.message);
      } else {
        onLog('error', 'Erro desconhecido ao buscar diretório.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [owner, repo, branch, onLog]);

  useEffect(() => {
    fetchDirectory('');
  }, [fetchDirectory]);

  const handleNavigateUp = () => {
    if (!currentPath) return;
    const pathParts = currentPath.split('/').filter(Boolean);
    pathParts.pop();
    fetchDirectory(pathParts.join('/'));
  };

  return (
    <div className="border border-gray-700 rounded-lg bg-gray-800 shadow-sm flex flex-col h-full min-h-0">
      <div className="bg-gray-800/50 px-3 py-2 border-b border-gray-700 flex items-center gap-2 shrink-0">
        <button 
          onClick={handleNavigateUp}
          disabled={!currentPath || isLoading}
          className="p-1 rounded bg-gray-700 border border-gray-600 text-gray-200 disabled:opacity-30 hover:bg-gray-600 transition-colors"
          title="Subir um diretório"
        >
          ⬆️
        </button>
        <span className="font-mono text-xs text-gray-300 break-all leading-tight flex-1">
          /{currentPath}
        </span>
      </div>
      
      <div className="overflow-y-auto p-2 flex-1 custom-scrollbar">
        {isLoading ? (
          <div className="text-center text-xs text-gray-400 mt-4">Carregando API...</div>
        ) : items.length === 0 ? (
          <div className="text-center text-xs text-gray-400 mt-4">Vazio.</div>
        ) : (
          <ul className="space-y-1">
            {items.map(item => (
              <li key={item.sha}>
                <button
                  onClick={() => item.type === 'dir' ? fetchDirectory(item.path) : onSelectFile(item.path)}
                  className="w-full text-left px-2 py-1.5 text-xs text-gray-300 rounded hover:bg-gray-700 focus:bg-gray-600 focus:outline-none transition-colors flex items-start gap-2"
                >
                  <span className="shrink-0 mt-0.5">{item.type === 'dir' ? '📁' : '📄'}</span>
                  <span className="break-words whitespace-normal leading-tight">{item.name}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

const MediaRenderer: React.FC<MediaRendererProps> = React.memo(({ url, fileType, onLog }) => {
  const [textContent, setTextContent] = useState<string | null>(null);
  const [isLoadingText, setIsLoadingText] = useState(false);

  useEffect(() => {
    if (fileType === 'text') {
      setIsLoadingText(true);
      onLog('info', 'Iniciando fetch assíncrono do conteúdo de texto...');
      
      fetch(url)
        .then(res => {
          if (!res.ok) throw new Error(`HTTP ${res.status} - Falha ao ler CDN.`);
          return res.text();
        })
        .then(text => {
          setTextContent(text);
          onLog('success', `Arquivo de código/texto renderizado (${text.length} bytes).`);
        })
        .catch(err => {
          setTextContent(`Erro de leitura: ${err.message}`);
          onLog('error', `Falha no fetch: ${err.message}`);
        })
        .finally(() => setIsLoadingText(false));
    } else {
      setTextContent(null);
    }
  }, [url, fileType, onLog]);

  if (fileType === 'image') {
    return (
      <img 
        src={url} 
        alt="Rendered content" 
        className="w-full h-full object-contain rounded"
        loading="lazy"
        onLoad={() => onLog('success', 'Imagem renderizada nativamente com sucesso.')}
        onError={() => onLog('error', 'Tag <img> falhou ao carregar a URL.')}
      />
    );
  }

  if (fileType === 'video') {
    return (
      <video 
        src={url} 
        controls 
        className="w-full h-full object-contain rounded"
        preload="metadata"
        onLoadedData={() => onLog('success', 'Metadados e stream de vídeo estabelecidos.')}
        onError={() => onLog('error', 'Tag <video> rejeitou o formato ou URL.')}
      >
        Navegador sem suporte a vídeo.
      </video>
    );
  }

  if (fileType === 'audio') {
    return (
      <div className="w-full p-6 flex flex-col items-center justify-center h-full gap-4">
        <span className="text-6xl">🎵</span>
        <audio 
          src={url} 
          controls 
          className="w-full max-w-md"
          onLoadedData={() => onLog('success', 'Stream de áudio montado e pronto para play.')}
          onError={() => onLog('error', 'Falha ao decodificar arquivo de áudio.')}
        />
      </div>
    );
  }

  if (fileType === 'pdf') {
    return (
      <iframe 
        src={url} 
        className="w-full h-full rounded border-0"
        title="PDF Viewer"
        onLoad={() => onLog('info', 'Iframe carregou o contêiner do PDF.')}
        onError={() => onLog('error', 'Iframe falhou ao abrir o documento PDF.')}
      />
    );
  }

  if (fileType === 'text') {
    if (isLoadingText) {
      return <div className="animate-pulse text-gray-400 m-auto font-mono text-sm">Baixando buffer de texto...</div>;
    }
    return (
      <pre className="w-full h-full overflow-auto text-xs font-mono bg-gray-950 text-gray-300 p-4 rounded text-left custom-scrollbar whitespace-pre-wrap break-words border border-gray-800 shadow-inner">
        {textContent}
      </pre>
    );
  }

  return (
    <div className="p-4 bg-yellow-900/30 text-yellow-500 border border-yellow-800/50 rounded-md text-sm font-medium text-center m-auto">
      MIME Type detectado não possui renderizador configurado nesta arquitetura.
    </div>
  );
});
MediaRenderer.displayName = 'MediaRenderer';

// --- Main Application ---
export default function InteractiveMediaViewer() {
  const [filePath, setFilePath] = useState<string>('');
  const [fileData, setFileData] = useState<FileData | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);

  const addLog = useCallback((level: LogLevel, message: string) => {
    const timestamp = new Date().toLocaleTimeString('pt-BR', { hour12: false, fractionalSecondDigits: 3 });
    setLogs(prev => [...prev, { id: generateId(), timestamp, level, message }]);
  }, []);

  const processFile = useCallback((path: string) => {
    addLog('info', '--- Nova Requisição de Renderização ---');
    addLog('info', `Alvo apontado: ${path}`);
    try {
      if (!path.trim()) throw new Error('Caminho de arquivo enviado está vazio.');
      
      const type = getFileType(path);
      addLog('info', `Extensão analisada. Categoria atribuída: [${type.toUpperCase()}]`);
      
      if (type === 'unsupported') {
        addLog('warning', 'O sistema não possui um componente visual para este tipo de arquivo.');
      }

      const url = buildCdnUrl(path);
      addLog('info', `URL jsDelivr gerada com sucesso para contornar headers do GitHub.`);
      addLog('success', `Pipeline pronta. Disparando renderização...`);
      
      setFilePath(path);
      setFileData({ path, url, type });
    } catch (err: unknown) {
      addLog('error', err instanceof Error ? err.message : 'Falha catastrófica no motor de processamento.');
      setFileData(null);
    }
  }, [addLog]);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    processFile(filePath);
  };

  return (
    <div className="h-screen w-screen bg-gray-950 p-2 sm:p-4 overflow-hidden flex flex-col font-sans text-gray-200">
      <div className="bg-gray-900 rounded-xl shadow-2xl border border-gray-800 flex-1 flex flex-col min-h-0 overflow-hidden">
        
        {/* Header Congelado */}
        <header className="px-6 py-4 border-b border-gray-800 flex justify-between items-center shrink-0">
          <div>
            <h1 className="text-xl font-bold text-gray-100 leading-tight">GitHub Media Lab</h1>
            <p className="text-xs text-gray-500">Multiformat Engine • Auto-Wrapping</p>
          </div>
          <div className="text-xs font-mono text-blue-400 bg-blue-900/20 border border-blue-900/50 px-3 py-1 rounded-full hidden sm:block">
            {GITHUB_OWNER}/{GITHUB_REPO}@{GITHUB_BRANCH}
          </div>
        </header>

        {/* Corpo Principal (Encolhe/Estica dinamicamente) */}
        <div className="flex-1 min-h-0 p-4 flex flex-col md:flex-row gap-4">
          
          {/* Coluna Esquerda: Controles */}
          <div className="w-full md:w-1/3 flex flex-col gap-4 min-h-0 shrink-0">
            <form onSubmit={handleManualSubmit} className="bg-gray-800 p-3 rounded-lg border border-gray-700 shrink-0">
              <label className="block text-xs font-semibold text-gray-300 mb-2">Inserção Manual</label>
              <div className="flex flex-col gap-2">
                <input
                  type="text"
                  value={filePath}
                  onChange={(e) => setFilePath(e.target.value)}
                  placeholder="teste/arquivo.js"
                  className="w-full p-2 text-xs bg-gray-900 border border-gray-700 rounded focus:ring-1 focus:ring-blue-500 text-gray-200 outline-none transition-all placeholder-gray-600"
                />
                <button type="submit" className="w-full py-1.5 bg-blue-600 text-white text-xs font-bold rounded hover:bg-blue-500 transition-colors">
                  Renderizar
                </button>
              </div>
            </form>

            <div className="flex-1 flex flex-col min-h-0">
              <h2 className="text-xs font-semibold text-gray-400 mb-2 shrink-0">Explorador (API REST)</h2>
              <FileExplorer owner={GITHUB_OWNER} repo={GITHUB_REPO} branch={GITHUB_BRANCH} onSelectFile={processFile} onLog={addLog} />
            </div>
          </div>

          {/* Coluna Direita: Viewport de Renderização */}
          <div className="w-full md:w-2/3 flex flex-col min-h-0">
            <h2 className="text-xs font-semibold text-gray-400 mb-2 shrink-0">Visualização Interativa</h2>
            <div className="flex-1 border border-gray-800 rounded-lg bg-black/50 flex flex-col min-h-0 p-2">
              {fileData ? (
                <div className="w-full h-full flex flex-col gap-2 animate-in fade-in duration-300 min-h-0">
                  {/* Caixa de URL com break-all aplicado para não cortar textos grandes */}
                  <div className="bg-gray-900 p-3 rounded border border-gray-800 shrink-0 text-center">
                    <a href={fileData.url} target="_blank" rel="noopener noreferrer" className="text-[10px] sm:text-xs text-blue-400 hover:text-blue-300 hover:underline font-mono break-all leading-relaxed block">
                      {fileData.url}
                    </a>
                  </div>
                  <div className="flex-1 min-h-0 relative flex justify-center items-center overflow-hidden">
                    <MediaRenderer url={fileData.url} fileType={fileData.type} onLog={addLog} />
                  </div>
                </div>
              ) : (
                <div className="m-auto text-gray-600 flex flex-col items-center">
                  <span className="text-3xl mb-1">⚙️</span>
                  <p className="text-xs">Aguardando comando de renderização.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Console Fixado no Rodapé */}
        <div className="h-32 sm:h-48 p-4 pt-0 shrink-0">
          <CustomConsole logs={logs} onClear={() => setLogs([])} />
        </div>
        
      </div>
    </div>
  );
}
