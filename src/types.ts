export type Page = "home" | "favorites" | "battle" | "auth";

export type SortOption = "id-asc" | "id-desc" | "name-asc" | "name-desc";

export type BattleMove = "attack" | "defense" | "special-attack" | "special-defense";

export type AppUser = {
  id: string;
  name: string;
  email: string;
  favoritePokemonIds: number[];
};

export type PokemonListItem = {
  name: string;
  url: string;
};

export type PokemonType = {
  type: {
    name: string;
  };
};

export type PokemonAbility = {
  ability: {
    name: string;
  };
};

export type PokemonStat = {
  base_stat: number;
  stat: {
    name: string;
  };
};

export type Pokemon = {
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