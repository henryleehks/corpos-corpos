export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-900">
      <nav className="bg-gray-800 text-white p-4">
        <div className="container mx-auto">
          <a href="/challenge" className="text-xl font-semibold hover:text-blue-300 transition-colors">
            Challenge
          </a>
        </div>
      </nav>
      <main className="flex flex-col flex-grow items-center justify-center p-8 text-center">
        <h1 className="text-5xl font-bold mb-6 text-white">Debug Racer</h1>
        <p className="text-2xl text-white mb-12">Can you debug faster than LLMs?</p>
        <a
          href="/challenge"
          className="bg-blue-600 text-white px-8 py-4 rounded-lg text-xl font-semibold hover:bg-blue-700 transition-colors transform hover:scale-105 duration-200"
        >
          Take the Challenge
        </a>
      </main>
      <footer className="p-4 text-center text-gray-600">
        <p>Test your debugging skills against leading AI models</p>
      </footer>
    </div>
  );
}
