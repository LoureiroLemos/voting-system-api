import { useEffect, useState } from "react";
import { io } from "socket.io-client";
//import "./PollDetails.css";

export function PollDetails({ pollId, onBack }) {
  const [poll, setPoll] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:3000/polls/${pollId}`)
      .then((response) => response.json())
      .then((data) => setPoll(data))
      .catch((error) => console.error("Erro ao buscar detalhes: ", error));

    const socket = io("http://localhost:3000");

    socket.on("new_vote", (data) => {
      setPoll((currentPoll) => {
        if (!currentPoll) return null;

        const updatedOptions = currentPoll.options.map((option) => {
          if (option.id === data.optionId) {
            return { ...option, votes: option.votes + 1 };
          }
          return option;
        });

        return { ...currentPoll, options: updatedOptions };
      });
    });

    return () => {
      socket.disconnect();
    };
  }, [pollId]);

  async function handleVote(optionId) {
    try {
      const response = await fetch("http://localhost:3000/polls/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ optionId }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Voto registrado!");
      } else {
        alert(data.error || "Erro ao registrar voto.");
      }
    } catch (error) {
      console.error("Erro ao votar: ", error);
      alert("Erro de conexão.");
    }
  }

  if (!poll) {
    return <div className="poll-details-container">Carregando...</div>;
  }

  const isVotable = poll.status === "Em andamento";

  return (
    <div className="poll-details-container">
      <h2>{poll.title}</h2>

      <p
        className={`status-badge ${poll.status === "Em andamento" ? "active" : "inactive"}`}
      >
        Status: {poll.status}
      </p>

      <div className="options-list">
        {poll.options.map((option) => (
          <div key={option.id} className="option-card">
            <span>{option.option_text}</span>
            <div className="vote-info">
              <strong>{option.votes} votos</strong>
              <button
                onClick={() => handleVote(option.id)}
                disabled={!isVotable}
              >
                Votar
              </button>
            </div>
          </div>
        ))}
      </div>

      <button className="back-button" onClick={onBack}>
        Voltar
      </button>
    </div>
  );
}
