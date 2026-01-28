import { useState } from "react";

export function CreatePoll({ onBack }) {
  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [options, setOptions] = useState(["", "", ""]);

  function handleOptionChange(index, value) {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  }

  function addOption() {
    setOptions([...options, ""]);
  }

  function removeOption(index) {
    if (options.length <= 3) {
      alert("A enquete precisa ter no mínimo 3 opções.");
      return;
    }
    const newOptions = options.filter((_, i) => i !== index);
    setOptions(newOptions);
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!title || !startDate || !endDate) {
      alert("Preencha todos os campos obrigatórios.");
      return;
    }

    if (options.some((opt) => opt.trim() === "")) {
      alert("Preencha todas as opções de resposta.");
      return;
    }

    const payload = {
      title,
      start_date: startDate,
      end_date: endDate,
      options,
    };

    try {
      const response = await fetch("http://localhost:3000/polls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        alert("Enquete criada com sucesso.");
        onBack();
      } else {
        const data = await response.json();
        alert(data.error || "Erro ao criar enquete.");
      }
    } catch (error) {
      console.error("Erro: ", error);
      alert("Erro de conexão com o servidor.");
    }
  }

  return (
    <div className="create-poll-container">
      <h2>Nova Enquete</h2>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Título da Pergunta:</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex: Qual a melhor linguagem?"
          />
        </div>

        <div className="dates-row">
          <div className="form-group">
            <label>Inicio:</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Fim:</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>

        <div className="options-section">
          <h3>Opções de Resposta</h3>
          {options.map((option, index) => (
            <div key={index} className="option-input-group">
              <input
                type="text"
                value={option}
                onChange={(e) => handleOptionChange(index, e.target.value)}
                placeholder={`Opção ${index + 1}`}
              />

              {options.length > 3 && (
                <button
                  type="button"
                  className="remove_btn"
                  onClick={() => removeOption(index)}
                >
                  X
                </button>
              )}
            </div>
          ))}

          <button type="button" className="add-btn" onClick={addOption}>
            + Adicionar Opção
          </button>
        </div>

        <div className="actions">
          <button type="button" className="cancel-btn" onClick={onBack}>
            Cancelar
          </button>

          <button type="submit" className="submit-btn">
            Criar Enquete
          </button>
        </div>
      </form>
    </div>
  );
}
