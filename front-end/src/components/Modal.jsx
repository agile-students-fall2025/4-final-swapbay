export default function Modal({ title, isOpen, onClose, children }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-11/12 sm:w-96 rounded-2xl shadow-lg p-6 relative animate-fadeIn">
        <button
          onClick={onClose}
          className="absolute right-4 top-3 text-gray-400 hover:text-gray-600 text-xl"
        >
          ×
        </button>
        <h2 className="text-xl font-bold mb-4 text-blue-600">{title}</h2>
        {children}
      </div>
    </div>
  );
}

