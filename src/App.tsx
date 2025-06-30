import FlowDemo from './components/FlowDemo'

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          HabitFlow
        </h1>
        <p className="text-gray-600">
          習慣化フローアプリケーション
        </p>
        <div className="mt-8 p-4 bg-white rounded-lg shadow">
          <p className="text-green-600 font-semibold">
            ✅ React + TypeScript
          </p>
          <p className="text-green-600 font-semibold">
            ✅ Tailwind CSS
          </p>
          <p className="text-green-600 font-semibold">
            ✅ React Flow
          </p>
        </div>
        
        <div className="mt-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            React Flow 動作確認
          </h2>
          <div className="bg-white rounded-lg shadow">
            <FlowDemo />
          </div>
        </div>
      </div>
    </div>
  )
}

export default App