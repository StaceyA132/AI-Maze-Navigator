# AI Maze Navigator

A web-based pathfinding visualization demo built with vanilla HTML/CSS/JS. It lets you build a maze, place obstacles, and watch an AI agent explore the grid using BFS, Dijkstra, or A*.

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
