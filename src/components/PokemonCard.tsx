import type { Pokemon } from "../types";

type PokemonCardProps = {
  pokemon: Pokemon;
  isFavorite: boolean;
  toggleFavorite: (pokemonId: number) => void;
  openDetails: (pokemon: Pokemon) => void;
  formatPokemonName: (name: string) => string;
};

function PokemonCard({
  pokemon,
  isFavorite,
  toggleFavorite,
  openDetails,
  formatPokemonName,
}: PokemonCardProps) {
  return (
    <div className="pokemon-card">
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

      <button className="details-button" onClick={() => openDetails(pokemon)}>
        View Details
      </button>
    </div>
  );
}

export default PokemonCard;