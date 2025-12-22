# Dynamic Nation Naming

## Problem

Each map in OpenFrontIO has a specific set of nations defined in its `manifest.json` file. However, when you want to dynamically add more nations at game start (beyond what the map provides), you need a way to generate appropriate names for these additional nations.

## Solution

The `generateNationName()` function provides a deterministic way to generate nation names using the existing bot name prefix and suffix lists. This ensures consistency with the game's naming conventions.

### Function Signature

```typescript
function generateNationName(index: number): string;
```

### Parameters

- `index` - A numeric index used to deterministically select a prefix/suffix combination. Different indices produce different nation names.

### Returns

A string containing the generated nation name (e.g., "Roman Empire", "Viking Kingdom"). The returned name is guaranteed to be ≤ 27 characters to comply with the game's nation name length constraint.

## Usage

### Basic Usage

```typescript
import { generateNationName } from "./core/execution/utils/BotNames";
// Or alternatively:
// import { generateNationName } from "./core/Util";

// Generate nation names for additional nations
const nationName1 = generateNationName(0); // e.g., "Akkadian Empire"
const nationName2 = generateNationName(1); // e.g., "Babylonian Dynasty"
const nationName3 = generateNationName(2); // e.g., "Sumerian Kingdom"
```

### Example: Adding Dynamic Nations to a Game

```typescript
import { generateNationName } from "./core/Util";
import { Nation, Cell, PlayerInfo, PlayerType } from "./core/game/Game";
import { PseudoRandom } from "./core/PseudoRandom";

// Assume you have loaded your map and it has some predefined nations
const mapNations = gameMap.nations; // Nations from manifest.json
const numExtraNations = 5; // We want to add 5 more nations

// Create additional nations with dynamically generated names
const extraNations: Nation[] = [];
const random = new PseudoRandom(simpleHash(gameID));

for (let i = 0; i < numExtraNations; i++) {
  const nationName = generateNationName(mapNations.length + i);
  const spawnX = random.nextInt(0, mapWidth);
  const spawnY = random.nextInt(0, mapHeight);

  const nation = new Nation(
    new Cell(spawnX, spawnY),
    new PlayerInfo(
      nationName,
      PlayerType.FakeHuman,
      null,
      random.nextID(),
      2, // default strength
    ),
  );

  extraNations.push(nation);
}

// Combine predefined and dynamically generated nations
const allNations = [...mapNations, ...extraNations];
```

### Integration with GameRunner

To add dynamic nations when creating a game:

```typescript
// In createGameRunner function
const predefinedNations = gameStart.config.disableNPCs
  ? []
  : gameMap.nations.map(
      (n) =>
        new Nation(
          new Cell(n.coordinates[0], n.coordinates[1]),
          new PlayerInfo(
            n.name,
            PlayerType.FakeHuman,
            null,
            random.nextID(),
            n.strength,
          ),
        ),
    );

// Add extra nations dynamically
const extraNationsCount = 3; // Or get from config
const extraNations: Nation[] = [];

for (let i = 0; i < extraNationsCount; i++) {
  const nationName = generateNationName(predefinedNations.length + i);
  const spawn = findValidSpawnLocation(gameMap); // Your spawn logic

  extraNations.push(
    new Nation(
      spawn,
      new PlayerInfo(
        nationName,
        PlayerType.FakeHuman,
        null,
        random.nextID(),
        2, // default strength
      ),
    ),
  );
}

const allNations = [...predefinedNations, ...extraNations];

const game: Game = createGame(
  humans,
  allNations, // Use combined list
  gameMap.gameMap,
  gameMap.miniGameMap,
  config,
);
```

## Implementation Details

### Name Generation Algorithm

1. **Prefix Selection**: The prefix is chosen from `BOT_NAME_PREFIXES` array using `index % BOT_NAME_PREFIXES.length`
2. **Suffix Selection**: The suffix is chosen from `BOT_NAME_SUFFIXES` array using `Math.floor(index / BOT_NAME_PREFIXES.length) % BOT_NAME_SUFFIXES.length`
3. **Combination**: The name is formed as `"${prefix} ${suffix}"`
4. **Length Validation**: If the combined name exceeds 27 characters, fallback logic applies:
   - First tries to use just the prefix
   - If prefix is also too long, truncates to 27 characters

### Deterministic Behavior

The function is deterministic - the same index always produces the same nation name. This is important for:

- Reproducible game states
- Multiplayer synchronization
- Testing and debugging

### Name Diversity

With 182 prefixes and 72 suffixes, the function can generate:

- 182 × 72 = **13,104 unique combinations** before cycling
- This provides more than enough diversity for any practical game scenario

## Testing

The function is thoroughly tested in `tests/DynamicNationNames.test.ts`:

- ✓ Generates valid nation names
- ✓ All names respect 27 character limit
- ✓ Deterministic behavior (same index → same name)
- ✓ High diversity (minimal collisions)
- ✓ Handles large indices
- ✓ Follows expected naming format

## Notes

- Nation names from `manifest.json` should continue to be used for historical/thematic accuracy when available
- Dynamic nation names are intended for additional nations beyond what the map provides
- The 27-character limit is enforced by the game's UI constraints (see `NationNameLength.test.ts`)
