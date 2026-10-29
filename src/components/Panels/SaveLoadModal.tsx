import React, { useState, useEffect } from 'react';
import { GameState } from '../../types/game';
import { 
  getSavedGamesList, 
  saveGame, 
  loadGame, 
  deleteSave, 
  exportSaveToJSON, 
  validateAndImportSave, 
  SaveMetadata 
} from '../../simulation/storage';
import { sound } from '../../simulation/soundEngine';
import { 
  X, 
  Save, 
  Download, 
  Upload, 
  Trash2, 
  RotateCcw, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';

interface SaveLoadModalProps {
  gameState: GameState;
  onClose: () => void;
  onLoadState: (state: GameState) => void;
  isPersian: boolean;
}

export const SaveLoadModal: React.FC<SaveLoadModalProps> = ({
  gameState,
  onClose,
  onLoadState,
  isPersian,
}) => {
  const [saves, setSaves] = useState<SaveMetadata[]>([]);
  const [saveNameInput, setSaveNameInput] = useState('');
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const refreshList = () => {
    setSaves(getSavedGamesList());
  };

  useEffect(() => {
    refreshList();
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    sound.playTriumph();
    const updatedState: GameState = {
      ...gameState,
      saveName: saveNameInput.trim() || `${gameState.countries[gameState.playerCountryId]?.name} Campaign`,
    };
    saveGame(updatedState);
    setMessage({ text: isPersian ? 'بازی با موفقیت ذخیره گردید.' : 'Campaign saved successfully.', type: 'success' });
    setSaveNameInput('');
    refreshList();
    setTimeout(() => setMessage(null), 3000);
  };

  const handleLoad = (id: string) => {
    sound.playClick(800, 0.04);
    const loaded = loadGame(id);
    if (loaded) {
      onLoadState(loaded);
      onClose();
    } else {
      setMessage({ text: isPersian ? 'بارگذاری با خطا مواجه شد.' : 'Failed to load save state.', type: 'error' });
    }
  };

  const handleDelete = (id: string) => {
    sound.playClick(400, 0.03);
    deleteSave(id);
    refreshList();
  };

  const handleExport = () => {
    sound.playClick(600, 0.03);
    const jsonStr = exportSaveToJSON(gameState);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `openbattle_${gameState.campaignId}_${gameState.currentDate}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const parsed = validateAndImportSave(content);
      if (parsed) {
        sound.playTriumph();
        saveGame(parsed);
        refreshList();
        onLoadState(parsed);
        onClose();
      } else {
        setMessage({ text: isPersian ? 'فرمت فایل ذخیره نامعتبر است.' : 'Corrupted or invalid save file format.', type: 'error' });
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-[#0b1220] border border-sky-500/30 rounded-2xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden text-slate-200 text-xs font-sans">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-700/60 bg-gradient-to-r from-slate-900 to-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-sky-500/10 border border-sky-500/30 rounded-xl">
              <Save className="w-5 h-5 text-sky-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">
                {isPersian ? 'مدیریت فایل‌های ذخیره و بارگذاری' : 'Campaign Persistence & Save Slots'}
              </h2>
              <div className="text-[11px] text-slate-400">
                {isPersian ? 'ذخیره بازی، بارگذاری و خروجی فایل پشتیبان JSON' : 'IndexedDB Slots, Cloud Backups & JSON Save Exporter'}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          
          {message && (
            <div className={`p-3 rounded-xl flex items-center gap-2 ${
              message.type === 'success' ? 'bg-emerald-950/80 border border-emerald-500/60 text-emerald-200' : 'bg-rose-950/80 border border-rose-500/60 text-rose-200'
            }`}>
              {message.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-rose-400" />}
              <span>{message.text}</span>
            </div>
          )}

          {/* New Save Form */}
          <form onSubmit={handleSave} className="p-3 bg-slate-900/80 border border-slate-700/60 rounded-xl flex gap-2">
            <input
              type="text"
              placeholder={isPersian ? 'نام ذخیره (مثال: نبرد پیروزمندانه)...' : 'Save Slot Label (e.g. Operation Northern Dawn)...'}
              value={saveNameInput}
              onChange={(e) => setSaveNameInput(e.target.value)}
              className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
            />
            <button
              type="submit"
              className="px-4 py-1.5 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl flex items-center gap-1.5 transition-colors shadow-md shadow-sky-600/20"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isPersian ? 'ذخیره کنونی' : 'Save Game'}</span>
            </button>
          </form>

          {/* Export / Import Actions */}
          <div className="flex gap-2">
            <button
              onClick={handleExport}
              className="flex-1 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-xl font-bold flex items-center justify-center gap-1.5 text-slate-200 transition-colors"
            >
              <Download className="w-4 h-4 text-sky-400" />
              <span>{isPersian ? 'خروجی فایل JSON' : 'Export JSON File'}</span>
            </button>

            <label className="flex-1 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-xl font-bold flex items-center justify-center gap-1.5 text-slate-200 transition-colors cursor-pointer">
              <Upload className="w-4 h-4 text-emerald-400" />
              <span>{isPersian ? 'بارگذاری فایل JSON' : 'Import JSON File'}</span>
              <input type="file" accept=".json" onChange={handleImport} className="hidden" />
            </label>
          </div>

          {/* Saves List */}
          <div className="space-y-2">
            <div className="font-bold text-slate-300">{isPersian ? 'پرونده‌های ذخیره شده' : 'Saved Campaigns'}</div>
            {saves.length === 0 ? (
              <div className="p-6 text-center text-slate-500 text-xs bg-slate-900/40 rounded-xl">
                {isPersian ? 'هیچ فایل ذخیره‌ای موجود نیست.' : 'No saved games recorded in browser storage.'}
              </div>
            ) : (
              saves.map(s => (
                <div
                  key={s.id}
                  className="p-3 bg-slate-900/90 border border-slate-700/60 rounded-xl flex items-center justify-between transition-all hover:border-sky-500/40"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl">{s.flagEmoji}</span>
                    <div>
                      <div className="font-bold text-slate-100">{s.saveName}</div>
                      <div className="text-[10px] text-slate-400">
                        {isPersian ? s.countryNameFa : s.countryName} · Date: <span className="text-sky-300 font-mono">{s.date}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleLoad(s.id)}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs flex items-center gap-1 transition-colors"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>{isPersian ? 'بارگذاری' : 'Load'}</span>
                    </button>
                    <button
                      onClick={() => handleDelete(s.id)}
                      className="p-1.5 bg-slate-800 hover:bg-rose-900/80 text-slate-400 hover:text-rose-300 rounded-lg transition-colors"
                      title="Delete Save"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
