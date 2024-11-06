import './App.css';
import { Grid } from './components/Grid.tsx';
import 'ag-grid-enterprise';

function App() {
  return (
    <div className="container">
      <div className="header">
        <img src="logo.svg" alt="Land Stats Logo" style={{ width: '100px' }} />
        <h1>Land Stats AG Grid POC</h1>
      </div>
      <div className="content">
        <Grid />
      </div>
    </div>
  );
}

export default App;
