const GRID_SIZE = 25;
const START_POS = { row: 12, col: 6 };
const GOAL_POS = { row: 12, col: 18 };

const algorithmSelect = document.getElementById('algorithmSelect');
const startBtn = document.getElementById('startBtn');
const resetBtn = document.getElementById('resetBtn');
const generateBtn = document.getElementById('generateBtn');
const speedRange = document.getElementById('speedRange');
const speedLabel = document.getElementById('speedLabel');

const statAlgorithm = document.getElementById('statAlgorithm');
const statExplored = document.getElementById('statExplored');
const statPathLength = document.getElementById('statPathLength');
const statTime = document.getElementById('statTime');

const gridContainer = document.getElementById('gridContainer');

let grid = [];
let isDragging = false;
let dragMode = null; // 'wall' | 'erase' | 'move-start' | 'move-goal'
let mouseButton = 0;
let currentStart = { ...START_POS };
let currentGoal = { ...GOAL_POS };

function createGrid() {
  grid = [];
  gridContainer.innerHTML = '';

  for (let row = 0; row < GRID_SIZE; row++) {
    const rowData = [];
    for (let col = 0; col < GRID_SIZE; col++) {
      const cell = document.createElement('div');
      cell.classList.add('cell');
      cell.dataset.row = row;
      cell.dataset.col = col;

      const node = {
        row,
        col,
        state: 'empty',
        neighbors: [],
        element: cell,
        previous: null,
        distance: Infinity,
      };

      cell.addEventListener('mousedown', (event) => onCellPointerDown(event, node));
      cell.addEventListener('mouseenter', (event) => onCellPointerEnter(event, node));
      cell.addEventListener('mouseup', () => onCellPointerUp());

      gridContainer.appendChild(cell);
      rowData.push(node);
    }
    grid.push(rowData);
  }

  setNodeState(currentStart.row, currentStart.col, 'start');
  setNodeState(currentGoal.row, currentGoal.col, 'goal');
  updateStats();
  assignNeighbors();
}

function assignNeighbors() {
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      const node = grid[row][col];
      node.neighbors = [];
      const directions = [
        { dr: -1, dc: 0 },
        { dr: 1, dc: 0 },
        { dr: 0, dc: -1 },
        { dr: 0, dc: 1 },
      ];
      for (const dir of directions) {
        const r = row + dir.dr;
        const c = col + dir.dc;
        if (r >= 0 && r < GRID_SIZE && c >= 0 && c < GRID_SIZE) {
          node.neighbors.push(grid[r][c]);
        }
      }
    }
  }
}

function resetGridStates() {
  for (const row of grid) {
    for (const node of row) {
      node.previous = null;
      node.distance = Infinity;
      if (node.state === 'visited' || node.state === 'path' || node.state === 'frontier') {
        setNodeState(node.row, node.col, 'empty');
      }
    }
  }
  setNodeState(currentStart.row, currentStart.col, 'start');
  setNodeState(currentGoal.row, currentGoal.col, 'goal');
  updateStats();
}

function clearWalls() {
  for (const row of grid) {
    for (const node of row) {
      if (node.state === 'wall') {
        setNodeState(node.row, node.col, 'empty');
      }
    }
  }
}

function setNodeState(row, col, state) {
  const node = grid[row][col];
  const el = node.element;
  const previousState = node.state;

  if (previousState) {
    el.classList.remove(previousState);
  }

  node.state = state;
  el.classList.add(state);
}

function onCellPointerDown(event, node) {
  mouseButton = event.button;
  isDragging = true;

  if (node.state === 'start') {
    dragMode = 'move-start';
    return;
  }

  if (node.state === 'goal') {
    dragMode = 'move-goal';
    return;
  }

  if (node.state === 'wall') {
    dragMode = 'erase';
    toggleWall(node, false);
    return;
  }

  dragMode = 'wall';
  toggleWall(node, true);
}

function onCellPointerEnter(event, node) {
  if (!isDragging) return;

  if (dragMode === 'wall') {
    toggleWall(node, true);
  } else if (dragMode === 'erase') {
    toggleWall(node, false);
  } else if (dragMode === 'move-start' && node.state !== 'goal') {
    setNodeState(currentStart.row, currentStart.col, 'empty');
    currentStart = { row: node.row, col: node.col };
    setNodeState(node.row, node.col, 'start');
  } else if (dragMode === 'move-goal' && node.state !== 'start') {
    setNodeState(currentGoal.row, currentGoal.col, 'empty');
    currentGoal = { row: node.row, col: node.col };
    setNodeState(node.row, node.col, 'goal');
  }
}

function onCellPointerUp() {
  isDragging = false;
  dragMode = null;
}

function toggleWall(node, shouldBeWall) {
  if (node.state === 'start' || node.state === 'goal') return;
  setNodeState(node.row, node.col, shouldBeWall ? 'wall' : 'empty');
}

function updateStats({ explored = 0, pathLength = 0, time = 0, algorithm = null } = {}) {
  if (algorithm !== null) {
    statAlgorithm.textContent = algorithm;
  } else {
    statAlgorithm.textContent = algorithmSelect.value.toUpperCase();
  }
  statExplored.textContent = explored;
  statPathLength.textContent = pathLength;
  statTime.textContent = `${time}ms`;
}

function getSpeedDelay() {
  const value = Number(speedRange.value);
  // Range 1..10 -> 130ms..10ms
  return Math.max(10, 140 - value * 13);
}

async function runAlgorithm() {
  resetGridStates();
  const algorithm = algorithmSelect.value;
  updateStats({ algorithm: algorithm.toUpperCase() });

  const startNode = grid[currentStart.row][currentStart.col];
  const goalNode = grid[currentGoal.row][currentGoal.col];

  const t0 = performance.now();

  let result;
  if (algorithm === 'bfs') {
    result = await runBFS(startNode, goalNode);
  } else if (algorithm === 'dijkstra') {
    result = await runDijkstra(startNode, goalNode);
  } else if (algorithm === 'astar') {
    result = await runAStar(startNode, goalNode);
  }

  const t1 = performance.now();
  const duration = Math.round(t1 - t0);

  if (result) {
    const path = reconstructPath(goalNode);
    animatePath(path);
    updateStats({ explored: result.explored, pathLength: path.length, time: duration });
  } else {
    updateStats({ explored: 0, pathLength: 0, time: duration });
  }
}

function isBlocked(node) {
  return node.state === 'wall';
}

function reconstructPath(goalNode) {
  const path = [];
  let current = goalNode;
  while (current && current.previous) {
    path.push(current);
    current = current.previous;
  }
  return path.reverse();
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runBFS(startNode, goalNode) {
  const queue = [startNode];
  const visited = new Set();
  visited.add(startNode);
  let explored = 0;

  while (queue.length > 0) {
    const node = queue.shift();
    if (node === goalNode) {
      return { explored };
    }

    for (const neighbor of node.neighbors) {
      if (visited.has(neighbor) || isBlocked(neighbor)) continue;
      visited.add(neighbor);
      neighbor.previous = node;
      queue.push(neighbor);
      explored += 1;

      if (neighbor !== goalNode && neighbor !== startNode) {
        setNodeState(neighbor.row, neighbor.col, 'frontier');
      }
    }

    if (node !== startNode && node !== goalNode) {
      setNodeState(node.row, node.col, 'visited');
    }

    await sleep(getSpeedDelay());
  }

  return null;
}

async function runDijkstra(startNode, goalNode) {
  const open = new Set();
  startNode.distance = 0;
  open.add(startNode);
  let explored = 0;

  while (open.size > 0) {
    const current = [...open].reduce((a, b) => (a.distance < b.distance ? a : b));
    open.delete(current);

    if (current === goalNode) {
      return { explored };
    }

    if (current !== startNode && current !== goalNode) {
      setNodeState(current.row, current.col, 'visited');
    }

    for (const neighbor of current.neighbors) {
      if (isBlocked(neighbor)) continue;
      const tentative = current.distance + 1;
      if (tentative < neighbor.distance) {
        neighbor.distance = tentative;
        neighbor.previous = current;
        open.add(neighbor);
        explored += 1;
        if (neighbor !== goalNode && neighbor !== startNode) {
          setNodeState(neighbor.row, neighbor.col, 'frontier');
        }
      }
    }

    await sleep(getSpeedDelay());
  }

  return null;
}

function heuristic(a, b) {
  return Math.abs(a.row - b.row) + Math.abs(a.col - b.col);
}

async function runAStar(startNode, goalNode) {
  const open = new Set();
  const gScore = new Map();
  const fScore = new Map();

  gScore.set(startNode, 0);
  fScore.set(startNode, heuristic(startNode, goalNode));
  open.add(startNode);

  let explored = 0;

  while (open.size > 0) {
    const current = [...open].reduce((a, b) =>
      (fScore.get(a) || Infinity) < (fScore.get(b) || Infinity) ? a : b
    );

    if (current === goalNode) {
      return { explored };
    }

    open.delete(current);

    if (current !== startNode && current !== goalNode) {
      setNodeState(current.row, current.col, 'visited');
    }

    for (const neighbor of current.neighbors) {
      if (isBlocked(neighbor)) continue;
      const tentativeG = (gScore.get(current) || Infinity) + 1;
      if (tentativeG < (gScore.get(neighbor) || Infinity)) {
        neighbor.previous = current;
        gScore.set(neighbor, tentativeG);
        fScore.set(neighbor, tentativeG + heuristic(neighbor, goalNode));
        open.add(neighbor);
        explored += 1;
        if (neighbor !== goalNode && neighbor !== startNode) {
          setNodeState(neighbor.row, neighbor.col, 'frontier');
        }
      }
    }

    await sleep(getSpeedDelay());
  }

  return null;
}

async function animatePath(path) {
  for (const node of path) {
    if (node.state === 'start' || node.state === 'goal') continue;
    setNodeState(node.row, node.col, 'path');
    await sleep(getSpeedDelay());
  }
}

function wireEvents() {
  document.addEventListener('mouseup', () => {
    isDragging = false;
    dragMode = null;
  });

  startBtn.addEventListener('click', () => runAlgorithm());
  resetBtn.addEventListener('click', () => {
    resetGridStates();
    clearWalls();
  });
  generateBtn.addEventListener('click', () => {
    generateMaze();
  });

  speedRange.addEventListener('input', () => {
    speedLabel.textContent = speedRange.value;
  });

  algorithmSelect.addEventListener('change', () => {
    updateStats({ algorithm: algorithmSelect.value.toUpperCase() });
  });
}

function generateMaze() {
  clearWalls();
  const rows = GRID_SIZE;
  const cols = GRID_SIZE;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (Math.random() < 0.35 && !(r === currentStart.row && c === currentStart.col) && !(r === currentGoal.row && c === currentGoal.col)) {
        setNodeState(r, c, 'wall');
      }
    }
  }
}

createGrid();
wireEvents();
