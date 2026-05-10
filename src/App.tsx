import { useEffect, useState } from "react";
import "./index.css";

type PokemonListItem = {
  name: string;
  url: string;
};

type PokemonType = {
  type: {
    name: string;
  };
};

type PokemonAbility = {
  ability: {
    name: string;
  };
};

type PokemonStat = {
  base_stat: number;
  stat: {
    name: string;
  };
};

type Pokemon = {
  id: number;
  name: string;
  height: number;
  weight: number;
  sprites: {
    other: {
      "official-artwork": {
        front_default: string;
      };
    };
  };
  types: PokemonType[];
  abilities: PokemonAbility[];
  stats: PokemonStat[];
};

function App() {
  const [pokemonList, setPokemonList] = useState<Pokemon[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [showFavoritesOnly, setShowFavoritesOnly] = useState<boolean>(false);
  const [selectedPokemon, setSelectedPokemon] = useState<Pokemon | null>(null);

  const [favoriteIds, setFavoriteIds] = useState<number[]>(() => {
    const savedFavorites = localStorage.getItem("favoritePokemonIds");
    return savedFavorites ? JSON.parse(savedFavorites) : [];
  });

  useEffect(() => {
    async function fetchPokemon() {
      try {
        const response = await fetch("https://pokeapi.co/api/v2/pokemon?limit=48");
        const data: { results: PokemonListItem[] } = await response.json();

        const detailedPokemon = await Promise.all(
          data.results.map(async (pokemon) => {
            const res = await fetch(pokemon.url);
            const details: Pokemon = await res.json();
            return details;
          })
        );

        setPokemonList(detailedPokemon);
      } catch (error) {
        console.error("Error fetching Pokémon:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchPokemon();
  }, []);

  useEffect(() => {
    localStorage.setItem("favoritePokemonIds", JSON.stringify(favoriteIds));
  }, [favoriteIds]);

  function toggleFavorite(pokemonId: number) {
    if (favoriteIds.includes(pokemonId)) {
      setFavoriteIds(favoriteIds.filter((id) => id !== pokemonId));
    } else {
      setFavoriteIds([...favoriteIds, pokemonId]);
    }
  }

  function formatPokemonName(name: string) {
    return name.replace("-", " ");
  }

  const filteredPokemon = pokemonList.filter((pokemon) => {
    const matchesSearch = pokemon.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    const matchesFavoriteFilter = showFavoritesOnly
      ? favoriteIds.includes(pokemon.id)
      : true;

    return matchesSearch && matchesFavoriteFilter;
  });

  if (loading) {
    return <h1 className="loading">Loading Pokémon...</h1>;
  }

  return (
    <div className="app">
      <header className="hero">
        <h1>PokéVault</h1>
        <p>Explore Pokémon cards, stats, types, and favorites.</p>

        <input
          className="search-input"
          type="text"
          placeholder="Search Pokémon..."
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
        />

        <div className="filter-buttons">
          <button
            className={!showFavoritesOnly ? "filter-button active" : "filter-button"}
            onClick={() => setShowFavoritesOnly(false)}
          >
            All Pokémon
          </button>

          <button
            className={showFavoritesOnly ? "filter-button active" : "filter-button"}
            onClick={() => setShowFavoritesOnly(true)}
          >
            Favorites Only
          </button>
        </div>
      </header>

      <section className="stats-row">
        <div className="stat-card">
          <h3>{pokemonList.length}</h3>
          <p>Total Loaded</p>
        </div>

        <div className="stat-card">
          <h3>{filteredPokemon.length}</h3>
          <p>Visible Cards</p>
        </div>

        <div className="stat-card">
          <h3>{favoriteIds.length}</h3>
          <p>Favorites</p>
        </div>
      </section>

      {filteredPokemon.length === 0 ? (
        <p className="empty-message">No Pokémon found.</p>
      ) : (
        <section className="card-grid">
          {filteredPokemon.map((pokemon) => {
            const isFavorite = favoriteIds.includes(pokemon.id);

            return (
              <div className="pokemon-card" key={pokemon.id}>
                <button
                  className={isFavorite ? "favorite-button active" : "favorite-button"}
                  onClick={() => toggleFavorite(pokemon.id)}
                >
                  {isFavorite ? "★ Favorited" : "☆ Favorite"}
                </button>

                <img
                  src={pokemon.sprites.other["official-artwork"].front_default}
                  alt={pokemon.name}
                />

                <h2>{formatPokemonName(pokemon.name)}</h2>
                <p>#{pokemon.id}</p>

                <div className="types">
                  {pokemon.types.map((typeInfo) => (
                    <span key={typeInfo.type.name}>{typeInfo.type.name}</span>
                  ))}
                </div>

                <button
                  className="details-button"
                  onClick={() => setSelectedPokemon(pokemon)}
                >
                  View Details
                </button>
              </div>
            );
          })}
        </section>
      )}

      {selectedPokemon && (
        <div className="modal-overlay" onClick={() => setSelectedPokemon(null)}>
          <div className="modal-card" onClick={(event) => event.stopPropagation()}>
            <button
              className="modal-close"
              onClick={() => setSelectedPokemon(null)}
            >
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
      )}
    </div>
  );
}

export default App;