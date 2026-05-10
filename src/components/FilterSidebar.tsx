import type { Page, SortOption } from "../types";

type FilterSidebarProps = {
  activePage: Page;
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  selectedType: string;
  setSelectedType: (value: string) => void;
  sortOption: SortOption;
  setSortOption: (value: SortOption) => void;
  availableTypes: string[];
  clearFilters: () => void;
};

function FilterSidebar({
  activePage,
  searchTerm,
  setSearchTerm,
  selectedType,
  setSelectedType,
  sortOption,
  setSortOption,
  availableTypes,
  clearFilters,
}: FilterSidebarProps) {
  return (
    <aside className="filter-sidebar">
      <div className="sidebar-header">
        <h2>Filters</h2>
        <p>Refine your card collection</p>
      </div>

      <div className="filter-group">
        <label htmlFor="search">Search Pokémon</label>
        <input
          id="search"
          className="sidebar-input"
          type="text"
          placeholder="Example: pikachu"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
        />
      </div>

      <div className="filter-group">
        <label htmlFor="type">Type</label>
        <select
          id="type"
          className="sidebar-select"
          value={selectedType}
          onChange={(event) => setSelectedType(event.target.value)}
        >
          <option value="all">All Types</option>

          {availableTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label htmlFor="sort">Sort By</label>
        <select
          id="sort"
          className="sidebar-select"
          value={sortOption}
          onChange={(event) => setSortOption(event.target.value as SortOption)}
        >
          <option value="id-asc">Lowest ID First</option>
          <option value="id-desc">Highest ID First</option>
          <option value="name-asc">Name A-Z</option>
          <option value="name-desc">Name Z-A</option>
        </select>
      </div>

      <button className="clear-button" onClick={clearFilters}>
        Clear Filters
      </button>

      <div className="sidebar-note">
        <strong>Current View:</strong>
        <span>{activePage === "home" ? "All Pokémon" : "Favorites Only"}</span>
      </div>
    </aside>
  );
}

export default FilterSidebar;