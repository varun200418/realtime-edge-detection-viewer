import { FrameStats } from '../types/frame';

interface StatsOverlayProps {
  stats: FrameStats;
  viewMode: string;
}

export function StatsOverlay({ stats, viewMode }: StatsOverlayProps) {
  return (
    <div className="absolute top-4 left-4 bg-black bg-opacity-80 text-green-400 p-4 rounded-lg font-mono text-sm space-y-1 backdrop-blur-sm border border-green-500">
      <div className="flex items-center gap-2 mb-2 pb-2 border-b border-green-700">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        <span className="text-green-300 font-semibold">LIVE STATS</span>
      </div>

      <div className="space-y-1">
        <div className="flex justify-between gap-8">
          <span className="text-gray-400">FPS:</span>
          <span className="text-green-400 font-bold">{stats.fps.toFixed(1)}</span>
        </div>

        <div className="flex justify-between gap-8">
          <span className="text-gray-400">Resolution:</span>
          <span className="text-green-400">{stats.resolution}</span>
        </div>

        <div className="flex justify-between gap-8">
          <span className="text-gray-400">Proc. Time:</span>
          <span className="text-green-400">{stats.avgProcessingTime.toFixed(2)}ms</span>
        </div>

        <div className="flex justify-between gap-8">
          <span className="text-gray-400">Frame Count:</span>
          <span className="text-green-400">{stats.frameCount}</span>
        </div>

        <div className="flex justify-between gap-8">
          <span className="text-gray-400">Mode:</span>
          <span className={`font-semibold ${viewMode === 'processed' ? 'text-cyan-400' : 'text-yellow-400'}`}>
            {viewMode.toUpperCase()}
          </span>
        </div>
      </div>
    </div>
  );
}
