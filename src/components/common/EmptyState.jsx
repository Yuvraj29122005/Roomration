export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      {Icon && (
        <div className="w-16 h-16 bg-gray-100 dark:bg-dark-700 rounded-2xl flex items-center justify-center mb-4">
          <Icon className="w-8 h-8 text-dark-400" />
        </div>
      )}
      <h3 className="text-lg font-semibold text-dark-700 dark:text-dark-300 mb-1">{title}</h3>
      <p className="text-dark-400 dark:text-dark-500 text-sm text-center max-w-xs mb-6">{description}</p>
      {action}
    </div>
  );
}
