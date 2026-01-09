import React, { useState, useEffect, useRef } from 'react';
import { Pickaxe, Link as LinkIcon, Hash, CheckCircle, Play, Database, ShieldCheck } from 'lucide-react';

interface Block {
  index: number;
  timestamp: string;
  data: string;
  previousHash: string;
  hash: string;
  nonce: number;
}

// Simple SHA-256 wrapper for the browser
const sha256 = async (message: string): Promise<string> => {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

export const BlockchainSimulator: React.FC = () => {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [pendingData, setPendingData] = useState("Alice sent 5 BTC to Bob");
  const [isMining, setIsMining] = useState(false);
  const [miningStatus, setMiningStatus] = useState<string>("");
  const [currentNonce, setCurrentNonce] = useState(0);
  const [currentHash, setCurrentHash] = useState("");
  
  const difficulty = 2; // Number of leading zeros required (keep low for demo speed)
  const targetPrefix = "0".repeat(difficulty);

  // Initialize Genesis Block
  useEffect(() => {
    const initGenesis = async () => {
      const genesisData = "Genesis Block";
      const timestamp = new Date().toLocaleTimeString();
      const prevHash = "0000000000000000000000000000000000000000000000000000000000000000";
      let nonce = 0;
      let hash = "";
      
      // Pre-mine genesis block quickly
      while (true) {
        hash = await sha256(0 + prevHash + timestamp + genesisData + nonce);
        if (hash.startsWith(targetPrefix)) break;
        nonce++;
      }

      setBlocks([{
        index: 0,
        timestamp,
        data: genesisData,
        previousHash: prevHash,
        hash,
        nonce
      }]);
    };

    initGenesis();
  }, []);

  const mineBlock = async () => {
    if (isMining || blocks.length === 0) return;
    setIsMining(true);
    setMiningStatus("Initializing...");

    const prevBlock = blocks[blocks.length - 1];
    const newIndex = prevBlock.index + 1;
    const timestamp = new Date().toLocaleTimeString();
    const data = pendingData;
    const prevHash = prevBlock.hash;
    
    let nonce = 0;
    let hash = "";
    
    const mineLoop = async () => {
      // Process a batch of nonces to keep UI responsive
      const batchSize = 50; 
      
      for (let i = 0; i < batchSize; i++) {
        hash = await sha256(newIndex + prevHash + timestamp + data + nonce);
        
        // Update visuals occasionally
        if (nonce % 10 === 0) {
            setCurrentNonce(nonce);
            setCurrentHash(hash);
        }

        if (hash.startsWith(targetPrefix)) {
          // Block Found!
          const newBlock: Block = {
            index: newIndex,
            timestamp,
            data,
            previousHash: prevHash,
            hash,
            nonce
          };
          
          setBlocks(prev => [...prev, newBlock]);
          setIsMining(false);
          setMiningStatus("Block Mined!");
          setCurrentNonce(0);
          setCurrentHash("");
          setPendingData(`Transaction #${newIndex + 1}...`);
          return;
        }
        nonce++;
      }
      
      // Continue next batch
      if (isMining) return; // safety check
      setMiningStatus(`Mining... Nonce: ${nonce}`);
      requestAnimationFrame(mineLoop);
    };

    mineLoop();
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200 flex items-center">
            <Database className="w-5 h-5 mr-2 text-bitcoin" />
            Blockchain Simulator
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Visualizing how Proof-of-Work links blocks together securely.
          </p>
        </div>
        <div className="flex items-center space-x-2 text-xs font-mono bg-slate-100 dark:bg-slate-900 px-3 py-1 rounded-full text-slate-500">
           <ShieldCheck className="w-3 h-3 text-emerald-500 mr-1" />
           Difficulty: {difficulty} Zeros
        </div>
      </div>

      {/* Chain Visualization */}
      <div className="flex overflow-x-auto pb-6 gap-4 custom-scrollbar snap-x">
        {blocks.map((block, i) => (
          <div key={block.index} className="flex items-center shrink-0 snap-center">
             {/* Block Card */}
            <div className={`w-64 p-4 rounded-lg border-2 ${
                i === blocks.length - 1 && !isMining ? 'border-emerald-500 bg-emerald-50/10' : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50'
              } flex flex-col space-y-2 relative transition-all duration-500`}>
              
              <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-700 pb-2">
                <span className="font-bold text-xs uppercase text-slate-500">Block #{block.index}</span>
                <span className="text-xs text-slate-400">{block.timestamp}</span>
              </div>
              
              <div className="space-y-1">
                <div className="text-xs text-slate-400 uppercase font-semibold">Data</div>
                <div className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate" title={block.data}>
                  {block.data}
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-xs text-slate-400 uppercase font-semibold">Previous Hash</div>
                <div className="text-[10px] font-mono text-slate-500 truncate bg-slate-100 dark:bg-slate-900 p-1 rounded">
                  {block.previousHash.substring(0, 20)}...
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-xs text-slate-400 uppercase font-semibold">Hash</div>
                <div className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 truncate bg-emerald-50 dark:bg-emerald-900/20 p-1 rounded">
                  {block.hash.substring(0, 20)}...
                </div>
              </div>

               <div className="space-y-1">
                <div className="text-xs text-slate-400 uppercase font-semibold">Nonce</div>
                <div className="text-xs font-mono text-slate-600 dark:text-slate-300">
                  {block.nonce}
                </div>
              </div>
            </div>

            {/* Link Icon */}
            {i < blocks.length && (
              <div className="mx-2 text-slate-300 dark:text-slate-600">
                <LinkIcon className="w-5 h-5" />
              </div>
            )}
          </div>
        ))}

        {/* Mining Area (Ghost Block) */}
        <div className="shrink-0 w-64 p-4 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900/30 flex flex-col space-y-3">
          <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-700 pb-2">
            <span className="font-bold text-xs uppercase text-slate-500">New Block</span>
            {isMining && <span className="text-xs text-orange-500 animate-pulse font-bold">Mining...</span>}
          </div>

          <div>
             <label className="text-xs text-slate-400 uppercase font-semibold block mb-1">Data Input</label>
             <input 
                type="text" 
                value={pendingData}
                onChange={(e) => setPendingData(e.target.value)}
                disabled={isMining}
                className="w-full text-sm p-2 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-bitcoin outline-none transition-all"
             />
          </div>

          {isMining ? (
            <div className="space-y-2 animate-pulse">
               <div className="text-xs font-mono text-slate-500 truncate bg-slate-200 dark:bg-slate-800 p-1 rounded">
                  Nonce: {currentNonce}
               </div>
               <div className="text-[10px] font-mono text-slate-400 truncate bg-slate-200 dark:bg-slate-800 p-1 rounded">
                  Trying: {currentHash.substring(0, 20)}...
               </div>
            </div>
          ) : (
            <div className="text-xs text-slate-400 italic py-2">
              Enter data and click mine to secure the block.
            </div>
          )}

          <button
            onClick={mineBlock}
            disabled={isMining}
            className={`w-full py-2 px-4 rounded-lg font-bold text-white text-sm flex items-center justify-center transition-all ${
              isMining 
                ? 'bg-slate-400 cursor-not-allowed' 
                : 'bg-bitcoin hover:bg-orange-600 active:scale-95 shadow-md hover:shadow-lg'
            }`}
          >
            {isMining ? (
               <Pickaxe className="w-4 h-4 mr-2 animate-bounce" />
            ) : (
               <Play className="w-4 h-4 mr-2" />
            )}
            {isMining ? 'Computing...' : 'Mine Block'}
          </button>
        </div>
      </div>
    </div>
  );
};
