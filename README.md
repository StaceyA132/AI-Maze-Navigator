# AI Maze Navigator


AI Maze Navigator is an interactive web-based pathfinding simulator. It lets you build custom mazes, place obstacles, and watch an AI agent visually navigate toward a target using classic algorithms (BFS, Dijkstra, A*). The simulation includes animated node exploration, glowing path discovery, algorithm performance metrics, and interactive grid controls.

## How It Works

1. **Grid System:**
	- The main area is a 25×25 grid. Each cell is a node with a position, state, and neighbors.
	- Node states: empty, wall, start, goal, visited, frontier, path.

2. **User Interaction:**
	- Click or drag to draw/remove walls (obstacles).
	- Drag the start (blue) or goal (purple) node to move them.
	- Use the control panel to select algorithms, adjust speed, generate mazes, save/load, and start/reset the simulation.

3. **Algorithms:**
	- **Breadth-First Search (BFS):** Explores the grid layer by layer, guaranteeing the shortest path in an unweighted maze.
	- **Dijkstra:** Tracks distances using a priority set, useful for weighted graphs (here, all edges are equal).
	- **A\* (A-star):** Uses cost-from-start plus a heuristic (Manhattan distance) to find paths efficiently.

4. **Maze Generation:**
	- Choose from random, recursive division, or recursive backtracker maze generation algorithms.
	- Maze creation is animated cell-by-cell for visual feedback.

5. **Visualization & Stats:**
	- Node colors show exploration and path cost (distance from start).
	- A glowing agent animates along the discovered path.
	- Stats panel displays nodes explored, path length, execution time, and selected algorithm.

6. **Controls:**
	- Start, Pause/Resume, Stop, Reset, Generate Maze, Save, Load.
	- Speed slider controls animation speed.

7. **Save/Load:**
	- Save your maze as a JSON file, or load a saved maze to continue.

8. **Touch Support:**
	- Works on mobile: tap/drag to draw walls or move start/goal.

## What Was Implemented

- Interactive grid with node state management and neighbor assignment.
- Mouse and touch controls for wall drawing and node movement.
- BFS, Dijkstra, and A* pathfinding algorithms with animated exploration and path highlighting.
- Animated agent movement along the found path.
- Multiple maze generation algorithms (random, recursive division, recursive backtracker).
- Play/Pause/Stop controls for algorithm runs.
- Save/load maze serialization (JSON export/import).
- Path cost visualization (color gradient by distance).
- Performance stats (nodes explored, path length, execution time, algorithm).
- Modern UI with dark theme, glowing nodes, and smooth transitions.

## Code Structure

- `index.html`: Main layout, control panel, and grid container.
- `styles.css`: Dark theme, grid/cell/agent styling, glowing effects, and transitions.
- `app.js`: All logic for grid, algorithms, animation, controls, maze generation, serialization, and touch support.

No dependencies required: this is a plain HTML/CSS/JavaScript demo that runs directly in the browser.

## Features (What You Can Do)

* **25×25 interactive grid**: the board is a 2D array of node objects. Each node tracks its `row/col`, `state` and a list of orthogonal neighbors.
* **Wall editing**: click/drag to toggle walls (blocked nodes); drag start/goal to reposition them.
* **Algorithms**: run BFS, Dijkstra, or A* and watch the exploration animate node-by-node.
* **Speed control**: slider adjusts the delay used by `await sleep(ms)` in the algorithm loops.
* **Maze builder**: creates randomized wall layouts and animates the wall build process.
* **Statistics**: displays nodes explored, path length, execution time, and selected algorithm.

## Getting Started (Run It)

1. Open `index.html` in a modern browser (no build step required).
2. Click / drag on the grid to draw walls.
3. Drag the start (blue) and goal (purple) nodes to reposition them.
4. Select an algorithm and click **Start** to run the simulation.
5. Use **Reset** to clear visited cells but keep walls.
6. Use **Generate Maze** to randomly populate walls (animated build).

## Development

No dependencies required: this is a plain HTML/CSS/JavaScript demo that runs directly in the browser.

### Commit Style
The repo uses short, easy-to-read commits that describe one clear change per commit.

Examples:
* `add grid layout`
* `implement bfs exploration`
* `add dijkstra and a*`
* `add maze generation and controls`
