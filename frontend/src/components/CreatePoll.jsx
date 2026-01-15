export function CreatePoll({ onBack }) {
  return (
    <div className="create-poll-container">
      <h2>Nova Enquete</h2>
      <p>Aqui vai o formulário...</p>
      <button onClick={onBack}>Cancelar</button>
    </div>
  );
}
