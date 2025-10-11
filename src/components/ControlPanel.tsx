import { Filter, Image, Video, VideoOff, Download, ChevronDown } from 'lucide-react';
import { ProcessingMode, ColorChannel, ViewMode } from '../types/frame';

interface ControlPanelProps {
  isStreaming: boolean;
  viewMode: ViewMode;
  processingMode: ProcessingMode;
  colorChannel: ColorChannel;
  onToggleStream: () => void;
  onToggleViewMode: () => void;
  onCaptureSnapshot?: () => void;
  onProcessingModeChange: (mode: ProcessingMode) => void;
  onColorChannelChange: (channel: ColorChannel) => void;
}

export function ControlPanel({
  isStreaming,
  viewMode,
  processingMode,
  colorChannel,
  onToggleStream,
  onToggleViewMode,
  onCaptureSnapshot,
  onProcessingModeChange,
  onColorChannelChange
}: ControlPanelProps) {
  const renderEffectControls = () => {
    if (viewMode !== ViewMode.PROCESSED || !isStreaming) return null;

    return (
      <div className="w-full mt-4 pt-4 border-t border-gray-700">
        <h3 className="text-lg font-semibold text-center mb-3 text-cyan-400">Image Effects</h3>
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
          <div className="relative">
            <select
              value={processingMode}
              onChange={(e) => onProcessingModeChange(e.target.value as ProcessingMode)}
              className="appearance-none w-full sm:w-auto bg-gray-700 border border-gray-600 text-white px-4 py-2 pr-8 rounded-lg focus:outline-none focus:border-cyan-500"
            >
              {Object.values(ProcessingMode).map(mode => (
                <option key={mode} value={mode}>{mode}</option>
              ))}
            </select>
            <ChevronDown className="w-5 h-5 text-gray-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {processingMode === ProcessingMode.COLOR_CHANNEL && (
            <div className="flex items-center gap-3 bg-gray-700 px-3 py-1 rounded-lg">
              {(Object.keys(ColorChannel).filter(k => isNaN(Number(k))) as (keyof typeof ColorChannel)[]).map(key => (
                <label key={key} className="flex items-center gap-2 cursor-pointer p-1 rounded-md">
                  <input
                    type="radio"
                    name="colorChannel"
                    value={ColorChannel[key]}
                    checked={colorChannel === ColorChannel[key]}
                    onChange={() => onColorChannelChange(ColorChannel[key])}
                    className="form-radio"
                  />
                  <span className={`font-semibold text-sm ${
                    key === 'RED' ? 'text-red-400' : key === 'GREEN' ? 'text-green-400' : 'text-blue-400'
                  }`}>{key}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center">
      <div className="flex flex-wrap gap-3 justify-center">
        <button
          onClick={onToggleStream}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
            isStreaming ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
          } text-white`}
        >
          {isStreaming ? <><VideoOff size={20} />Stop Camera</> : <><Video size={20} />Start Camera</>}
        </button>

        <button
          onClick={onToggleViewMode}
          disabled={!isStreaming}
          className="flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-600 disabled:text-gray-400"
        >
          {viewMode === ViewMode.RAW ? <><Filter size={20} />Show Processed</> : <><Image size={20} />Show Raw</>}
        </button>

        {onCaptureSnapshot && (
          <button
            onClick={onCaptureSnapshot}
            disabled={!isStreaming}
            className="flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all bg-cyan-600 hover:bg-cyan-700 text-white disabled:bg-gray-600 disabled:text-gray-400"
          >
            <Download size={20} />
            Capture Snapshot
          </button>
        )}
      </div>
      {renderEffectControls()}
    </div>
  );
}