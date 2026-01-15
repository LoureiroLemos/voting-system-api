import { useState } from "react";
import { PollList } from "./components/PollList";
import { PollDetails } from "./components/PollDetails";
import { CreatePoll } from "./components/CreatePoll";

import "./index.css";

function App() {
  const [selectedPollId, setSelectedPollId] = useState(null);
  const [isCreating, setIsCreating] = useState(false);

  function renderContent() {
    if (isCreating) {
      return <CreatePoll onBack={() => setIsCreating(false)} />;
    }

    if (selectedPollId) {
      return (
        <PollDetails
          pollId={selectedPollId}
          onBack={() => setSelectedPollId(null)}
        />
      );
    }

    return (
      <>
        <PollList onSelectPoll={(id) => setSelectedPollId(id)} />

        <div style={{ marginTop: "20px", textAlign: "center" }}>
          <button onClick={() => setIsCreating(true)}>Nova Enquete</button>
        </div>
      </>
    );
  }

  return (
    <div className="app-container">
      <header>
        <h1>Sistema de Votação</h1>
      </header>

      <main>{renderContent()}</main>
    </div>
  );
}

export default App;
