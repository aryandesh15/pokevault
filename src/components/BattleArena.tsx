import { useEffect, useState } from "react";
import type { BattleMove, Pokemon } from "../types";

type BattleArenaProps = {
  pokemonList: Pokemon[];
  formatPokemonName: (name: string) => string;
};

type BattleStatus = "setup" | "battling" | "finished";

function BattleArena({ pokemonList, formatPokemonName }: BattleArenaProps) {
  const [firstPokemonId, setFirstPokemonId] = useState<number>(
    pokemonList[0]?.id || 1
  );
  const [secondPokemonId, setSecondPokemonId] = useState<number>(
    pokemonList[1]?.id || 2
  );

  const [firstHp, setFirstHp] = useState<number>(0);
  const [secondHp, setSecondHp] = useState<number>(0);

  const [firstMove, setFirstMove] = useState<BattleMove>("attack");
  const [secondMove, setSecondMove] = useState<BattleMove>("attack");

  const [battleStatus, setBattleStatus] = useState<BattleStatus>("setup");
  const [winner, setWinner] = useState<string>("");
  const [battleLog, setBattleLog] = useState<string[]>([]);

  const firstPokemon = pokemonList.find((pokemon) => pokemon.id === firstPokemonId);
  const secondPokemon = pokemonList.find(
    (pokemon) => pokemon.id === secondPokemonId
  );

  function getStat(pokemon: Pokemon, statName: string) {
    return (
      pokemon.stats.find((statInfo) => statInfo.stat.name === statName)
        ?.base_stat || 0
    );
  }

  function getMaxHp(pokemon: Pokemon) {
    return getStat(pokemon, "hp") * 10;
  }

  function getMoveInterval(pokemon: Pokemon) {
    const speed = getStat(pokemon, "speed");
    const seconds = Math.max(0.3, 1.5 - speed / 100);
    return seconds * 1000;
  }

  function getRandomMove(): BattleMove {
    const moves: BattleMove[] = [
      "attack",
      "attack",
      "attack",
      "attack",
      "defense",
      "defense",
      "defense",
      "defense",
      "special-attack",
      "special-defense",
    ];

    const randomIndex = Math.floor(Math.random() * moves.length);
    return moves[randomIndex];
  }

  function formatMove(move: BattleMove) {
    return move.replace("-", " ");
  }

  function calculateDamage(
    attacker: Pokemon,
    defender: Pokemon,
    attackerMove: BattleMove,
    defenderMove: BattleMove
  ) {
    if (attackerMove === "attack") {
      const attack = getStat(attacker, "attack");
      const defense = getStat(defender, "defense");
      const defenseBonus = defenderMove === "defense" ? 18 : 0;

      return Math.max(5, Math.round((attack - defense / 2 - defenseBonus) / 2));
    }

    if (attackerMove === "special-attack") {
      const specialAttack = getStat(attacker, "special-attack");
      const specialDefense = getStat(defender, "special-defense");
      const defenseBonus = defenderMove === "special-defense" ? 18 : 0;

      return Math.max(
        8,
        Math.round((specialAttack - specialDefense / 2 - defenseBonus) / 2)
      );
    }

    return 0;
  }

  function startBattle() {
    if (!firstPokemon || !secondPokemon) return;

    if (firstPokemon.id === secondPokemon.id) {
      alert("Please choose two different Pokémon.");
      return;
    }

    setFirstHp(getMaxHp(firstPokemon));
    setSecondHp(getMaxHp(secondPokemon));
    setFirstMove("attack");
    setSecondMove("attack");
    setWinner("");
    setBattleLog([
      `${formatPokemonName(firstPokemon.name)} vs ${formatPokemonName(
        secondPokemon.name
      )} begins!`,
    ]);
    setBattleStatus("battling");
  }

  function resetBattle() {
    setBattleStatus("setup");
    setWinner("");
    setBattleLog([]);
    setFirstMove("attack");
    setSecondMove("attack");

    if (firstPokemon) setFirstHp(getMaxHp(firstPokemon));
    if (secondPokemon) setSecondHp(getMaxHp(secondPokemon));
  }

  useEffect(() => {
    if (battleStatus !== "battling" || !firstPokemon || !secondPokemon) return;

    const firstInterval = window.setInterval(() => {
      const newMove = getRandomMove();
      setFirstMove(newMove);

      setSecondHp((currentHp) => {
        const damage = calculateDamage(
          firstPokemon,
          secondPokemon,
          newMove,
          secondMove
        );

        const updatedHp = Math.max(0, currentHp - damage);

        setBattleLog((previousLog) => [
          `${formatPokemonName(firstPokemon.name)} used ${formatMove(
            newMove
          )} and dealt ${damage} damage.`,
          ...previousLog.slice(0, 7),
        ]);

        return updatedHp;
      });
    }, getMoveInterval(firstPokemon));

    const secondInterval = window.setInterval(() => {
      const newMove = getRandomMove();
      setSecondMove(newMove);

      setFirstHp((currentHp) => {
        const damage = calculateDamage(
          secondPokemon,
          firstPokemon,
          newMove,
          firstMove
        );

        const updatedHp = Math.max(0, currentHp - damage);

        setBattleLog((previousLog) => [
          `${formatPokemonName(secondPokemon.name)} used ${formatMove(
            newMove
          )} and dealt ${damage} damage.`,
          ...previousLog.slice(0, 7),
        ]);

        return updatedHp;
      });
    }, getMoveInterval(secondPokemon));

    return () => {
      window.clearInterval(firstInterval);
      window.clearInterval(secondInterval);
    };
  }, [battleStatus, firstPokemon, secondPokemon, firstMove, secondMove]);

  useEffect(() => {
    if (battleStatus !== "battling" || !firstPokemon || !secondPokemon) return;

    if (firstHp <= 0 && secondHp <= 0) {
      setWinner("It is a draw!");
      setBattleStatus("finished");
      return;
    }

    if (firstHp <= 0) {
      setWinner(`${formatPokemonName(secondPokemon.name)} wins!`);
      setBattleStatus("finished");
      return;
    }

    if (secondHp <= 0) {
      setWinner(`${formatPokemonName(firstPokemon.name)} wins!`);
      setBattleStatus("finished");
    }
  }, [firstHp, secondHp, battleStatus, firstPokemon, secondPokemon]);

  if (!firstPokemon || !secondPokemon) {
    return <p className="empty-message">Pokémon data is still loading.</p>;
  }

  const firstMaxHp = getMaxHp(firstPokemon);
  const secondMaxHp = getMaxHp(secondPokemon);

  const firstDisplayHp = battleStatus === "setup" ? firstMaxHp : firstHp;
  const secondDisplayHp = battleStatus === "setup" ? secondMaxHp : secondHp;

  const firstHpPercent = Math.max(0, (firstDisplayHp / firstMaxHp) * 100);
  const secondHpPercent = Math.max(0, (secondDisplayHp / secondMaxHp) * 100);

  return (
    <section className="battle-page">
      <div className="battle-header">
        <div>
          <p className="eyebrow">Battle Simulator</p>
          <h2>Choose two Pokémon and let them battle.</h2>
          <p>
            HP is 10× the base HP stat. Speed decides how quickly each Pokémon
            changes move. Attack and defense are common, while special moves are
            rarer.
          </p>
        </div>

        <button
          className="battle-button"
          onClick={battleStatus === "battling" ? resetBattle : startBattle}
        >
          {battleStatus === "battling" ? "Reset" : "Battle"}
        </button>
      </div>

      <div className="battle-selectors">
        <div className="battle-select-box">
          <label>First Pokémon</label>
          <select
            value={firstPokemonId}
            disabled={battleStatus === "battling"}
            onChange={(event) => setFirstPokemonId(Number(event.target.value))}
          >
            {pokemonList.map((pokemon) => (
              <option key={pokemon.id} value={pokemon.id}>
                {formatPokemonName(pokemon.name)}
              </option>
            ))}
          </select>
        </div>

        <div className="battle-select-box">
          <label>Second Pokémon</label>
          <select
            value={secondPokemonId}
            disabled={battleStatus === "battling"}
            onChange={(event) => setSecondPokemonId(Number(event.target.value))}
          >
            {pokemonList.map((pokemon) => (
              <option key={pokemon.id} value={pokemon.id}>
                {formatPokemonName(pokemon.name)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {winner && <div className="winner-banner">{winner}</div>}

      <div className="battle-arena">
        <div className="battle-card">
          <img
            src={firstPokemon.sprites.other["official-artwork"].front_default}
            alt={firstPokemon.name}
          />

          <h3>{formatPokemonName(firstPokemon.name)}</h3>
          <p>Current Move: {formatMove(firstMove)}</p>

          <div className="hp-info">
            <span>HP</span>
            <strong>
              {firstDisplayHp} / {firstMaxHp}
            </strong>
          </div>

          <div className="hp-bar">
            <div className="hp-fill" style={{ width: `${firstHpPercent}%` }}></div>
          </div>
        </div>

        <div className="versus-badge">VS</div>

        <div className="battle-card">
          <img
            src={secondPokemon.sprites.other["official-artwork"].front_default}
            alt={secondPokemon.name}
          />

          <h3>{formatPokemonName(secondPokemon.name)}</h3>
          <p>Current Move: {formatMove(secondMove)}</p>

          <div className="hp-info">
            <span>HP</span>
            <strong>
              {secondDisplayHp} / {secondMaxHp}
            </strong>
          </div>

          <div className="hp-bar">
            <div className="hp-fill" style={{ width: `${secondHpPercent}%` }}></div>
          </div>
        </div>
      </div>

      <div className="battle-log">
        <h3>Battle Log</h3>

        {battleLog.length === 0 ? (
          <p>No battle actions yet.</p>
        ) : (
          battleLog.map((logItem, index) => <p key={index}>{logItem}</p>)
        )}
      </div>
    </section>
  );
}

export default BattleArena;