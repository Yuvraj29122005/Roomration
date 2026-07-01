import { HiSearch, HiX } from 'react-icons/hi';

export default function SearchBar({ value, onChange, placeholder = 'Search...', className = '' }) {
  return (
    <div className={`relative ${className}`}>
      <HiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="input-field pl-10 pr-9"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 hover:bg-gray-200 dark:hover:bg-dark-600 rounded-full transition-colors"
        >
          <HiX className="w-3.5 h-3.5 text-dark-400" />
        </button>
      )}
    </div>
  );
}
