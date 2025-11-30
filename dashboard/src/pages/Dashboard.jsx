export default function Dashboard() {
    return (
        <div>
            <h1 className="text-2xl font-bold text-white mb-6">Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                    <h3 className="text-gray-400 text-sm font-medium">Total Extractions</h3>
                    <p className="text-3xl font-bold text-white mt-2">0</p>
                </div>
                <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                    <h3 className="text-gray-400 text-sm font-medium">Average Score</h3>
                    <p className="text-3xl font-bold text-white mt-2">0%</p>
                </div>
                <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                    <h3 className="text-gray-400 text-sm font-medium">Success Rate</h3>
                    <p className="text-3xl font-bold text-white mt-2">0%</p>
                </div>
            </div>
        </div>
    );
}
