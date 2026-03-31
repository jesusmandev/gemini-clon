import Sidebar from './components/Sidebar/Sidebar';
import Main from './components/Main/Main';

const App = () => {
  return (
    <div className="flex w-full bg-theme-bg h-screen overflow-hidden text-theme-text transition-colors duration-300">
      <Sidebar />
      <Main />
    </div>
  );
};

export default App;
