import './App.css';
import { ArtworkTable } from '../src/components/ArtworkTable';



function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Art Institute of Chicago - Artworks</h1>
      </header>
      <main>
        <ArtworkTable />
      </main>
    </div>
  );
}

export default App;