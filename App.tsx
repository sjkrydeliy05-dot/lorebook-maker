
import React, { useState, useCallback } from 'react';
import { parseTextToTavoJson } from './services/parser';
import { TavoData } from './types';
import { DownloadIcon, LoaderIcon, ConvertIcon, CopyIcon, CheckIcon, InfoIcon } from './components/Icons';
import { SOURCE_TEXT } from './constants';

const FormatGuideModal: React.FC<{ onClose: () => void }> = ({ onClose }) => (
    <div 
        className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-labelledby="format-guide-title"
    >
        <div 
            className="bg-slate-800 border border-slate-700 rounded-lg shadow-xl max-w-2xl w-full p-6 text-slate-300"
            onClick={(e) => e.stopPropagation()}
        >
            <h2 id="format-guide-title" className="text-2xl font-bold text-white mb-4">输入格式指南</h2>
            <p className="mb-4">为确保正确解析，请按以下方式构建您的文本：</p>
            <ul className="list-disc list-inside mb-4 space-y-2">
                <li>使用 <code className="bg-slate-700 px-1 rounded">---</code> 分隔大板块（eg：英国区域文本---分割美国区域文本）。</li>
                <li>每个大板块的标题以 <code className="bg-slate-700 px-1 rounded">## 大板块名称</code> 做母标题。用来制作大板块概述，规则等（eg：## 英国）。</li>
                <li>使用 <code className="bg-slate-700 px-1 rounded">### 小板块名称</code> 做子标题。用于做子条目（eg：### 伦敦）。</li>
            </ul>
            <p className="font-semibold text-white mb-2">示例：</p>
            <pre className="bg-slate-900 rounded p-4 text-sm whitespace-pre-wrap overflow-x-auto">
                {`---
## 中国
*概述：...
*气候：...
*索引：
- 北京
- ...

### 北京
*位置：...
*描述：...
**交通：...

### 上海
*位置：...
*描述：...
`}
            </pre>
            <div className="mt-6 text-right">
                <button
                    onClick={onClose}
                    className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition-colors"
                    aria-label="关闭格式指南"
                >
                    好的
                </button>
            </div>
        </div>
    </div>
);


const App: React.FC = () => {
  const [inputText, setInputText] = useState<string>(SOURCE_TEXT);
  const [jsonOutput, setJsonOutput] = useState<string>('');
  const [plainTextOutput, setPlainTextOutput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'text' | 'json'>('text');
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied'>('idle');
  const [isModalOpen, setIsModalOpen] = useState(false);


  const generatePlainText = (data: TavoData): string => {
    const allEntries = Object.values(data.entries).sort((a, b) => a.uid - b.uid);
    return allEntries
      .map(entry => `[${entry.comment}]\n${entry.content}`)
      .join('\n\n');
  };

  const handleConvert = useCallback(() => {
    setIsLoading(true);
    setError(null);
    setJsonOutput('');
    setPlainTextOutput('');
    try {
      setTimeout(() => { // Simulate processing time for better UX
        const result: TavoData = parseTextToTavoJson(inputText);
        setJsonOutput(JSON.stringify(result, null, 2));
        setPlainTextOutput(generatePlainText(result));
        setIsLoading(false);
      }, 500);
    } catch (e) {
      setError(e instanceof Error ? e.message : '解析过程中发生未知错误。');
      setIsLoading(false);
    }
  }, [inputText]);

  const handleCopy = useCallback(() => {
    if (copyStatus === 'copied') return;

    const textToCopy = activeView === 'text' ? plainTextOutput : jsonOutput;
    if (!textToCopy) return;

    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopyStatus('copied');
      setTimeout(() => {
        setCopyStatus('idle');
      }, 2000);
    }).catch(err => {
      console.error('无法复制文本: ', err);
    });
  }, [activeView, plainTextOutput, jsonOutput, copyStatus]);

  const handleDownload = useCallback(() => {
    if (!jsonOutput) return;

    const blob = new Blob([jsonOutput], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'worldbook.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [jsonOutput]);

  return (
    <>
      {isModalOpen && <FormatGuideModal onClose={() => setIsModalOpen(false)} />}
      <div className="min-h-screen bg-slate-900 text-slate-300 font-sans p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <header className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">Tavo 世界书转换器</h1>
            <p className="mt-2 text-lg text-slate-400">将结构化文本转换为可下载的 Tavo JSON 文件。</p>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Input Section */}
            <div className="flex flex-col">
              <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-semibold text-white">输入文本</h2>
                  <button 
                    onClick={() => setIsModalOpen(true)} 
                    className="flex items-center gap-2 px-3 py-1.5 text-sm bg-slate-800 border border-slate-700 rounded-md text-slate-400 hover:text-white hover:border-slate-600 transition-colors"
                    aria-label="显示格式指南"
                  >
                      <InfoIcon className="w-5 h-5" />
                      <span>格式指南</span>
                  </button>
              </div>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="w-full h-[50vh] lg:h-[60vh] flex-grow p-4 bg-slate-800 border border-slate-700 rounded-lg shadow-inner text-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                placeholder="在此处粘贴您的世界书文本..."
                aria-label="用于转换的输入文本"
              />
            </div>

            {/* Output Section */}
            <div className="flex flex-col">
              <div className="flex border-b border-slate-700">
                  <button
                      onClick={() => { setActiveView('text'); setCopyStatus('idle'); }}
                      className={`px-4 py-2 text-lg font-semibold rounded-t-lg transition-colors focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 ${ activeView === 'text' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-700/50'}`}
                      aria-selected={activeView === 'text'}
                  >
                      纯文本预览
                  </button>
                  <button
                      onClick={() => { setActiveView('json'); setCopyStatus('idle'); }}
                      className={`px-4 py-2 text-lg font-semibold rounded-t-lg transition-colors focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 ${ activeView === 'json' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-700/50'}`}
                      aria-selected={activeView === 'json'}
                  >
                      JSON 预览
                  </button>
              </div>
               <div className="w-full h-[50vh] lg:h-[60vh] flex-grow bg-slate-800 border border-t-0 border-slate-700 rounded-b-lg shadow-inner relative overflow-hidden">
                  <button
                    onClick={handleCopy}
                    className="absolute top-3 right-3 z-10 flex items-center px-3 py-1.5 bg-slate-700 text-slate-300 rounded-md hover:bg-slate-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={copyStatus === 'copied' || isLoading || (activeView === 'text' && !plainTextOutput) || (activeView === 'json' && !jsonOutput)}
                    aria-label={copyStatus === 'copied' ? '内容已复制' : '复制内容到剪贴板'}
                  >
                    {copyStatus === 'copied' ? (
                      <>
                        <CheckIcon className="w-5 h-5 mr-2 text-emerald-400" />
                        已复制!
                      </>
                    ) : (
                      <>
                        <CopyIcon className="w-5 h-5 mr-2" />
                        复制
                      </>
                    )}
                  </button>
                  {isLoading ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-800 bg-opacity-75">
                      <LoaderIcon className="w-12 h-12 animate-spin text-indigo-400" />
                      <p className="mt-4 text-lg">处理中...</p>
                    </div>
                  ) : (
                    <pre className="w-full h-full overflow-auto text-sm whitespace-pre-wrap break-words p-4">
                      {error ? (
                          <span className="text-red-400">{error}</span>
                      ) : (
                          <>
                          {activeView === 'text' && (plainTextOutput || <span className="text-slate-500">纯文本输出将显示在此处...</span>)}
                          {activeView === 'json' && <span className="text-green-300">{jsonOutput || <span className="text-slate-500">JSON 输出将显示在此处...</span>}</span>}
                          </>
                      )}
                    </pre>
                  )}
               </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row justify-center items-center gap-4">
            <button
              onClick={handleConvert}
              disabled={isLoading}
              className="w-full sm:w-auto flex items-center justify-center px-8 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105"
            >
              {isLoading ? <LoaderIcon className="w-5 h-5 mr-2 animate-spin" /> : <ConvertIcon className="w-5 h-5 mr-2" />}
              {isLoading ? '转换中...' : '转换为 JSON'}
            </button>
            
            <button
              onClick={handleDownload}
              disabled={!jsonOutput || isLoading}
              className="w-full sm:w-auto flex items-center justify-center px-8 py-3 bg-emerald-600 text-white font-semibold rounded-lg shadow-md hover:bg-emerald-700 disabled:bg-emerald-400 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105"
            >
              <DownloadIcon className="w-5 h-5 mr-2" />
              下载 JSON 文件
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default App;
