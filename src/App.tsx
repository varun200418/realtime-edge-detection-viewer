import { Activity, AlertCircle } from 'lucide-react';
import { FrameViewer } from './components/FrameViewer';
import { StatsOverlay } from './components/StatsOverlay';
import { ControlPanel } from './components/ControlPanel';
import { useCameraStream } from './hooks/useCameraStream';

function App() {
  const {
    currentFrame,
    viewMode,
    isStreaming,
    cameraError,
    stats,
    startCamera,
    stopCamera,
    toggleViewMode,
    captureSnapshot
  } = useCameraStream();

  const handleToggleStream = () => {
    if (isStreaming) {
      stopCamera();
    } else {
      startCamera();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Activity className="w-10 h-10 text-cyan-500" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Real-Time Edge Detection Viewer
            </h1>
          </div>
          <p className="text-gray-400 text-lg">
            Live Camera Feed | OpenCV Edge Detection | Performance Monitoring
          </p>
        </header>

        {cameraError && (
          <div className="max-w-2xl mx-auto mb-6 bg-red-900 border border-red-700 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-200 mb-1">Camera Access Error</h3>
              <p className="text-red-300 text-sm">{cameraError}</p>
            </div>
          </div>
        )}

        <div className="max-w-5xl mx-auto">
          <div className="bg-gray-800 rounded-xl p-6 shadow-2xl border border-gray-700 mb-6">
            <div className="relative inline-block mx-auto">
              {currentFrame ? (
                <>
                  <FrameViewer
                    imageUrl={currentFrame.image}
                    width={currentFrame.width}
                    height={currentFrame.height}
                    className="shadow-lg"
                  />
                  <StatsOverlay stats={stats} viewMode={viewMode} />
                </>
              ) : (
                <div className="w-[640px] h-[480px] bg-gray-900 border-2 border-gray-700 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <Activity className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400 text-lg font-semibold">
                      Click "Start Camera" to begin
                    </p>
                    <p className="text-gray-500 text-sm mt-2">
                      Camera access required
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl p-6 shadow-2xl border border-gray-700 mb-6">
            <ControlPanel
              isStreaming={isStreaming}
              viewMode={viewMode}
              onToggleStream={handleToggleStream}
              onToggleViewMode={toggleViewMode}
              onCaptureSnapshot={captureSnapshot}
            />
          </div>

          <div className="bg-gray-800 rounded-xl p-6 shadow-2xl border border-gray-700">
            <h2 className="text-xl font-semibold mb-4 text-cyan-400">Technical Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="bg-gray-900 p-4 rounded-lg border border-gray-700">
                <h3 className="font-semibold text-green-400 mb-2">Processing Pipeline</h3>
                <ul className="text-gray-300 space-y-1">
                  <li>• Browser MediaDevices API camera access</li>
                  <li>• Real-time frame capture via Canvas</li>
                  <li>• JavaScript-based Canny edge detection</li>
                  <li>• Sobel operator gradient computation</li>
                </ul>
              </div>

              <div className="bg-gray-900 p-4 rounded-lg border border-gray-700">
                <h3 className="font-semibold text-blue-400 mb-2">Performance Metrics</h3>
                <ul className="text-gray-300 space-y-1">
                  <li>• Real-time FPS calculation</li>
                  <li>• Per-frame processing time tracking</li>
                  <li>• 30-frame rolling average</li>
                  <li>• Resolution: {stats.resolution}</li>
                </ul>
              </div>

              <div className="bg-gray-900 p-4 rounded-lg border border-gray-700">
                <h3 className="font-semibold text-yellow-400 mb-2">Tech Stack</h3>
                <ul className="text-gray-300 space-y-1">
                  <li>• TypeScript + React</li>
                  <li>• HTML5 Canvas API</li>
                  <li>• MediaDevices WebRTC</li>
                  <li>• Tailwind CSS</li>
                </ul>
              </div>

              <div className="bg-gray-900 p-4 rounded-lg border border-gray-700">
                <h3 className="font-semibold text-purple-400 mb-2">Features</h3>
                <ul className="text-gray-300 space-y-1">
                  <li>• Live camera feed</li>
                  <li>• Real-time edge detection</li>
                  <li>• Raw/Processed view toggle</li>
                  <li>• Snapshot download</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-6 bg-gray-800 rounded-xl p-6 shadow-2xl border border-gray-700">
            <h2 className="text-xl font-semibold mb-3 text-cyan-400">About This Demo</h2>
            <div className="text-gray-300 space-y-2 text-sm">
              <p>
                This web application demonstrates real-time computer vision processing using the browser's camera.
                It captures live video frames and applies edge detection algorithms to visualize image gradients.
              </p>
              <p>
                The edge detection implementation uses Sobel operators to compute horizontal and vertical gradients,
                simulating OpenCV's Canny edge detection algorithm. All processing happens in real-time on the client side.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
