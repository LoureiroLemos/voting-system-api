import { useState, useEffect } from "react";
//import "./PollList.css";
export function PollList({ onSelectPoll }) {
  const [polls, setPolls] = useState([]);

  useEffect(() => {
    fetch("http://localhost:3000/polls")
      .then((response) => response.json())
      .then((data) => setPolls(data))
      .catch((error) => console.error("Erro ao buscar enquetes: ", error));
  }, []);

  return (
    <div className="poll-list-container">
      <h2>Enquetes Disponíveis</h2>

      <div className="poll-grid">
        {polls.map((poll) => (
          <div key={poll.id} className="poll-card">
            <h3>{poll.title}</h3>
            <p
              className={`status ${
                poll.status == "Em andamento" ? "active" : ""
              }`}
            >
              {poll.status}
            </p>
            <p>Início: {new Date(poll.start_date).toLocaleDateString()}</p>
            <p>Fim: {new Date(poll.end_date).toLocaleDateString()}</p>

            <button onClick={() => onSelectPoll(poll.id)}>Ver Detalhes</button>
          </div>
        ))}
      </div>
    </div>
  );
}
