import { MoreVertical } from 'lucide-preact';
import { useLayoutStore } from '../store/layout';

export function AppBar() {
  const { toolbarOpen, toggleToolbar } = useLayoutStore();

  return (
    <div class="navbar bg-base-600 border-b border-base-300 px-4 min-h-0 h-14 shrink-0">
      <div class="navbar-start">
        <span class="font-semibold text-lg">Wixarika</span>
      </div>
      <div class="navbar-center">{/* Optional center content */}</div>
      <div class="navbar-end">
        <button
          type="button"
          class="btn btn-ghost btn-sm btn-square lg:hidden"
          onClick={toggleToolbar}
          title={toolbarOpen ? 'Close tools' : 'Open tools'}
          aria-label={toolbarOpen ? 'Close tools' : 'Open tools'}
        >
          <MoreVertical size={20} />
        </button>
      </div>
    </div>
  );
}
