import { Filter, Image, Video, VideoOff, Download } from 'lucide-react';

interface ControlPanelProps {
  isStreaming: boolean;
  viewMode: string;
  onToggleStream: () => void;
  onToggleViewMode: () => void;
  onCaptureSnapshot?: () => void;
}

export function ControlPanel({
  isStreaming,
  viewMode,
  onToggleStream,
  onToggleViewMode,
  onCaptureSnapshot
}: ControlPanelProps) {
  return (
    <div className="flex flex-wrap gap-3 justify-center">
      <button
        onClick={onToggleStream}
        className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
          isStreaming
            ? 'bg-red-600 hover:bg-red-700 text-white'
            : 'bg-green-600 hover:bg-green-700 text-white'
        }`}
      >
        {isStreaming ? (
          <>
            <VideoOff className="w-5 h-5" />
            Stop Camera
          </>
        ) : (
          <>
            <Video className="w-5 h-5" />
            Start Camera
          </>
        )}
      </button>

      <button
        onClick={onToggleViewMode}
        disabled={!isStreaming}
        className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
          isStreaming
            ? 'bg-blue-600 hover:bg-blue-700 text-white'
            : 'bg-gray-600 text-gray-400 cursor-not-allowed'
        }`}
      >
        {viewMode === 'raw' ? (
          <>
            <Filter className="w-5 h-5" />
            Show Processed
          </>
        ) : (
          <>
            <Image className="w-5 h-5" />
            Show Raw
          </>
        )}
      </button>

      {onCaptureSnapshot && (
        <button
          onClick={onCaptureSnapshot}
          disabled={!isStreaming}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
            isStreaming
              ? 'bg-cyan-600 hover:bg-cyan-700 text-white'
              : 'bg-gray-600 text-gray-400 cursor-not-allowed'
          }`}
        >
          <Download className="w-5 h-5" />
          Capture Snapshot
        </button>
      )}
    </div>
  );
}
