import { Outlet } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { WeeksSelectionProvider } from './contexts/WeeksSelectionContext';

const App = () => {
  return (
    <AuthProvider>
      <WeeksSelectionProvider>
        <Outlet />
      </WeeksSelectionProvider>
    </AuthProvider>
  );
};

export default App;
