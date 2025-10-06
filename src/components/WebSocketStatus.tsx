import { Wifi, WifiOff } from 'lucide-react';

interface WebSocketStatusProps {
  isConnected: boolean;
  endpoint: string;
}

export function WebSocketStatus({ isConnected, endpoint }: WebSocketStatusProps) {
  return (
    <div className="flex items-center gap-3 bg-gray-800 text-gray-200 px-4 py-3 rounded-lg border border-gray-700">
      <div className="flex items-center gap-2">
        {isConnected ? (
          <>
            <Wifi className="w-5 h-5 text-green-500" />
            <span className="text-green-500 font-semibold">Connected</span>
          </>
        ) : (
          <>
            <WifiOff className="w-5 h-5 text-gray-500" />
            <span className="text-gray-500">Disconnected</span>
          </>
        )}
      </div>
      <div className="h-6 w-px bg-gray-700"></div>
      <div className="text-sm">
        <span className="text-gray-400">Endpoint: </span>
        <span className="font-mono text-cyan-400">{endpoint}</span>
      </div>
    </div>
  );
}
