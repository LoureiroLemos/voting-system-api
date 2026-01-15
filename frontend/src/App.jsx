import { useState } from "react";
import "./index.css";
import { PollList } from "./components/PollList";
import { PollDetails } from "./components/PollDetails";

function App() {
  const [selectedPollId, setSelectedPollId] = useState(null);

  return (
    <div className="app-container">
      <header>
        <h1>Sistema de Votação</h1>
      </header>

      <main>
        {selectedPollId ? (
          <PollDetails
            pollId={selectedPollId}
            onBack={() => setSelectedPollId(null)}
          />
        ) : (
          <PollList onSelectPoll={(id) => setSelectedPollId(id)} />
        )}
      </main>
    </div>
  );
}

export default App;
