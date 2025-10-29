import Header from '../components/Header';

export default function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1 w-full max-w-6xl mx-auto p-4 sm:p-6 md:p-8">
        {children}
      </main>
      <footer className="text-center text-gray-500 py-4 text-sm">
        © {new Date().getFullYear()} SwapBay • A Student Marketplace
      </footer>
    </div>
  );
}
