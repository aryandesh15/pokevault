import type { Pokemon } from "../types";

type PokemonModalProps = {
  selectedPokemon: Pokemon;
  closeModal: () => void;
  formatPokemonName: (name: string) => string;
};

function PokemonModal({
  selectedPokemon,
  closeModal,
  formatPokemonName,
}: PokemonModalProps) {
  return (
    <div className="modal-overlay" onClick={closeModal}>
      <div className="modal-card" onClick={(event) => event.stopPropagation()}>
        <button className="modal-close" onClick={closeModal}>
          ×
        </button>

        <img
          className="modal-image"
          src={selectedPokemon.sprites.other["official-artwork"].front_default}
          alt={selectedPokemon.name}
        />

        <h2>{formatPokemonName(selectedPokemon.name)}</h2>
        <p className="modal-id">#{selectedPokemon.id}</p>

        <div className="modal-types">
          {selectedPokemon.types.map((typeInfo) => (
            <span key={typeInfo.type.name}>{typeInfo.type.name}</span>
          ))}
        </div>

        <div className="detail-grid">
          <div className="detail-box">
            <h4>Height</h4>
            <p>{selectedPokemon.height / 10} m</p>
          </div>

          <div className="detail-box">
            <h4>Weight</h4>
            <p>{selectedPokemon.weight / 10} kg</p>
          </div>
        </div>

        <div className="modal-section">
          <h3>Abilities</h3>
          <div className="ability-list">
            {selectedPokemon.abilities.map((abilityInfo) => (
              <span key={abilityInfo.ability.name}>
                {formatPokemonName(abilityInfo.ability.name)}
              </span>
            ))}
          </div>
        </div>

        <div className="modal-section">
          <h3>Base Stats</h3>

          <div className="stats-list">
            {selectedPokemon.stats.map((statInfo) => (
              <div className="stat-line" key={statInfo.stat.name}>
                <div className="stat-label">
                  <span>{formatPokemonName(statInfo.stat.name)}</span>
                  <strong>{statInfo.base_stat}</strong>
                </div>

                <div className="stat-bar">
                  <div
                    className="stat-bar-fill"
                    style={{
                      width: `${Math.min(statInfo.base_stat, 100)}%`,
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default PokemonModal;