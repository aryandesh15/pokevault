import type { AppUser, Page } from "../types";

type NavbarProps = {
  activePage: Page;
  setActivePage: (page: Page) => void;
  favoritesCount: number;
  currentUser: AppUser | null;
  handleLogout: () => void;
};

function Navbar({
  activePage,
  setActivePage,
  favoritesCount,
  currentUser,
  handleLogout,
}: NavbarProps) {
  return (
    <nav className="navbar">
      <div className="nav-brand">
        <span className="brand-icon">⚡</span>
        <span>PokéVault</span>
      </div>

      <div className="nav-links">
        <button
          className={activePage === "home" ? "nav-link active" : "nav-link"}
          onClick={() => setActivePage("home")}
        >
          Home
        </button>

        <button
          className={activePage === "favorites" ? "nav-link active" : "nav-link"}
          onClick={() => setActivePage("favorites")}
        >
          Favorites
          <span className="nav-badge">{favoritesCount}</span>
        </button>

        <button
          className={activePage === "battle" ? "nav-link active" : "nav-link"}
          onClick={() => setActivePage("battle")}
        >
          Battle
        </button>

        {currentUser ? (
          <>
            <span className="nav-user">Hi, {currentUser.name}</span>
            <button className="nav-link logout-link" onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : (
          <button
            className={activePage === "auth" ? "nav-link active" : "nav-link"}
            onClick={() => setActivePage("auth")}
          >
            Login
          </button>
        )}
      </div>
    </nav>
  );
}

export default Navbar;