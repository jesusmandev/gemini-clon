import Sidebar from './components/Sidebar/Sidebar';
import Main from './components/Main/Main';

const App = () => {
  return (
    <div className="flex w-full bg-black h-screen overflow-hidden text-gray-200">
      <Sidebar />
      <Main />
    </div>
  );
};

export default App;
