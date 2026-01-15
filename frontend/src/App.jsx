import { useState } from "react";
import "./index.css";
import { PollList } from "./components/PollList";

function App() {
  const [selectedPollId, setSelectedPollId] = useState(null);

  return (
    <div className="app-container">
      <header>
        <h1>Sistema de Votação</h1>
      </header>

      <main>
        {selectedPollId ? (
        <div>
          <button onClick={() => setSelectedPollId(null)}>Votar</button>
          <h2>Visualizando enquete: {selectedPollId}</h2>
        </div>
        ) : (
          <PollList onSelectPoll={(id) => setSelectedPollId(id)} />
        )}
      </main>
    </div>
  );
}

export default App;
