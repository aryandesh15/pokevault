import { useEffect, useState } from "react";
import Navbar from "./components/Navbar";
import FilterSidebar from "./components/FilterSidebar";
import KpiCard from "./components/KpiCard";
import PokemonCard from "./components/PokemonCard";
import PokemonModal from "./components/PokemonModal";
import type { Page, Pokemon, PokemonListItem, SortOption } from "./types";
import "./index.css";

function App() {
  const [pokemonList, setPokemonList] = useState<Pokemon[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activePage, setActivePage] = useState<Page>("home");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [sortOption, setSortOption] = useState<SortOption>("id-asc");
  const [selectedPokemon, setSelectedPokemon] = useState<Pokemon | null>(null);

  const [favoriteIds, setFavoriteIds] = useState<number[]>(() => {
    const savedFavorites = localStorage.getItem("favoritePokemonIds");
    return savedFavorites ? JSON.parse(savedFavorites) : [];
  });

  useEffect(() => {
    async function fetchPokemon() {
      try {
        const response = await fetch("https://pokeapi.co/api/v2/pokemon?limit=50");
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
    return name.replaceAll("-", " ");
  }

  function clearFilters() {
    setSearchTerm("");
    setSelectedType("all");
    setSortOption("id-asc");
  }

  const availableTypes = Array.from(
    new Set(
      pokemonList.flatMap((pokemon) =>
        pokemon.types.map((typeInfo) => typeInfo.type.name)
      )
    )
  ).sort();

  const filteredPokemon = pokemonList
    .filter((pokemon) => {
      const matchesSearch = pokemon.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

      const matchesType =
        selectedType === "all"
          ? true
          : pokemon.types.some((typeInfo) => typeInfo.type.name === selectedType);

      const matchesPage =
        activePage === "favorites" ? favoriteIds.includes(pokemon.id) : true;

      return matchesSearch && matchesType && matchesPage;
    })
    .sort((a, b) => {
      if (sortOption === "id-asc") return a.id - b.id;
      if (sortOption === "id-desc") return b.id - a.id;
      if (sortOption === "name-asc") return a.name.localeCompare(b.name);
      if (sortOption === "name-desc") return b.name.localeCompare(a.name);
      return 0;
    });

  if (loading) {
    return <h1 className="loading">Loading Pokémon...</h1>;
  }

  return (
    <div className="app">
      <Navbar
        activePage={activePage}
        setActivePage={setActivePage}
        favoritesCount={favoriteIds.length}
      />

      <header className="hero">
        <p className="eyebrow">Pokémon Card Explorer</p>
        <h1>
          Discover, filter, and save your favorite{" "}
          <span>Pokémon cards.</span>
        </h1>
        <p>
          Browse Pokémon from the PokéAPI, explore stats, filter by type, and
          build your own favorites collection.
        </p>
      </header>

      <main className="dashboard-layout">
        <FilterSidebar
          activePage={activePage}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          selectedType={selectedType}
          setSelectedType={setSelectedType}
          sortOption={sortOption}
          setSortOption={setSortOption}
          availableTypes={availableTypes}
          clearFilters={clearFilters}
        />

        <section className="content-area">
          <section className="stats-row">
            <KpiCard value={pokemonList.length} label="Total Loaded" />
            <KpiCard value={filteredPokemon.length} label="Visible Cards" />
            <KpiCard value={favoriteIds.length} label="Favorites" />
          </section>

          <div className="section-heading">
            <div>
              <h2>{activePage === "home" ? "All Pokémon" : "Favorite Pokémon"}</h2>
              <p>
                {activePage === "home"
                  ? "Browse all currently loaded Pokémon cards."
                  : "Your saved Pokémon collection."}
              </p>
            </div>
          </div>

          {filteredPokemon.length === 0 ? (
            <p className="empty-message">No Pokémon found.</p>
          ) : (
            <section className="card-grid">
              {filteredPokemon.map((pokemon) => (
                <PokemonCard
                  key={pokemon.id}
                  pokemon={pokemon}
                  isFavorite={favoriteIds.includes(pokemon.id)}
                  toggleFavorite={toggleFavorite}
                  openDetails={setSelectedPokemon}
                  formatPokemonName={formatPokemonName}
                />
              ))}
            </section>
          )}
        </section>
      </main>

      {selectedPokemon && (
        <PokemonModal
          selectedPokemon={selectedPokemon}
          closeModal={() => setSelectedPokemon(null)}
          formatPokemonName={formatPokemonName}
        />
      )}
    </div>
  );
}

export default App;