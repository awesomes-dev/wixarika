import { render } from 'preact';

import { AppBar } from './components/AppBar';
import { MainContent } from './components/MainContent';
import { Toolbar } from './components/Toolbar';
import { useLayoutStore } from './store/layout';
import './style.css';

const TOOLS_DRAWER_ID = 'tools-drawer';

export function App() {
  const { toolbarOpen, toggleToolbar } = useLayoutStore();

    return (
    <div class="drawer drawer-end h-full lg:flex lg:flex-row">
      <input
        id={TOOLS_DRAWER_ID}
        type="checkbox"
        class="drawer-toggle"
        checked={toolbarOpen}
        onChange={toggleToolbar}
      />
      <div class="drawer-content flex flex-col h-full min-h-0 flex-1 min-w-0">
        <AppBar />
        <MainContent />
      </div>
      <Toolbar drawerId={TOOLS_DRAWER_ID} />
    </div>
  );
}

render(<App />, document.getElementById('app'));