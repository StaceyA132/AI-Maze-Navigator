const GRID_SIZE = 25;
const START_POS = { row: 12, col: 6 };
const GOAL_POS = { row: 12, col: 18 };

const algorithmSelect = document.getElementById('algorithmSelect');
const startBtn = document.getElementById('startBtn');
const resetBtn = document.getElementById('resetBtn');
const generateBtn = document.getElementById('generateBtn');
const pauseBtn = document.getElementById('pauseBtn');
const mazeSelect = document.getElementById('mazeSelect');
const saveBtn = document.getElementById('saveBtn');
const loadBtn = document.getElementById('loadBtn');
const loadInput = document.getElementById('loadInput');
const speedRange = document.getElementById('speedRange');
const speedLabel = document.getElementById('speedLabel');

const statAlgorithm = document.getElementById('statAlgorithm');
const statExplored = document.getElementById('statExplored');
const statPathLength = document.getElementById('statPathLength');
const statTime = document.getElementById('statTime');

const gridContainer = document.getElementById('gridContainer');

let grid = [];
let agentElement = null;
let isDragging = false;
let dragMode = null; // 'wall' | 'erase' | 'move-start' | 'move-goal'
let mouseButton = 0;
let currentStart = { ...START_POS };
let currentGoal = { ...GOAL_POS };
let isRunning = false;
let isPaused = false;
let runController = null;

function createGrid() {
  grid = [];
  gridContainer.innerHTML = '';

  if (pauseBtn) {
    pauseBtn.disabled = true;
    pauseBtn.textContent = 'Pause';
  }
  if (stopBtn) {
    stopBtn.disabled = true;
  }

  // Add an agent element to animate movement across the grid.
  agentElement = document.createElement('div');
  agentElement.classList.add('agent');
  gridContainer.appendChild(agentElement);

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
  placeAgent(currentStart);
  updateStats();
  assignNeighbors();
}

function placeAgent(pos) {
  if (!agentElement) return;
  agentElement.style.gridRowStart = pos.row + 1;
  agentElement.style.gridColumnStart = pos.col + 1;
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
  placeAgent(currentStart);
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
  // Clear cost styling when resetting state
  if (state === 'empty' || state === 'wall' || state === 'start' || state === 'goal') {
    el.style.removeProperty('--cost');
  }
}

function setCostVisual(node, cost) {
  if (!node || !node.element) return;
  node.element.style.setProperty('--cost', cost);
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

function createRunController() {
  const listeners = new Set();
  return {
    requestPause() {
      isPaused = true;
      listeners.forEach((cb) => cb(isPaused));
      pauseBtn.textContent = 'Resume';
    },
    resume() {
      isPaused = false;
      listeners.forEach((cb) => cb(isPaused));
      pauseBtn.textContent = 'Pause';
    },
    onPauseChange(cb) {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
  };
}

function waitForUnpause() {
  if (!isPaused) return Promise.resolve();
  return new Promise((resolve) => {
    const off = runController.onPauseChange((paused) => {
      if (!paused) {
        off();
        resolve();
      }
    });
  });
}


function getNodeFromElement(el) {
  if (!el || !el.classList.contains('cell')) return null;
  const row = Number(el.dataset.row);
  const col = Number(el.dataset.col);
  return grid[row]?.[col] ?? null;
}

function serializeMaze() {
  const walls = [];
  for (const row of grid) {
    for (const node of row) {
      if (node.state === 'wall') {
        walls.push([node.row, node.col]);
      }
    }
  }
  return {
    size: GRID_SIZE,
    start: currentStart,
    goal: currentGoal,
    walls,
  };
}

function applyMaze(data) {
  if (!data || !Array.isArray(data.walls)) return;
  clearWalls();
  if (data.start) {
    currentStart = { ...data.start };
  }
  if (data.goal) {
    currentGoal = { ...data.goal };
  }
  resetGridStates();
  for (const [r, c] of data.walls) {
    if (r === currentStart.row && c === currentStart.col) continue;
    if (r === currentGoal.row && c === currentGoal.col) continue;
    setNodeState(r, c, 'wall');
  }
}

function saveMazeToFile() {
  const data = serializeMaze();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = 'maze.json';
  anchor.click();
  URL.revokeObjectURL(url);
}

function handleLoadFile(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result);
      applyMaze(data);
    } catch (err) {
      console.warn('Failed to load maze:', err);
    }
  };
  reader.readAsText(file);
  // reset input so the same file can be re-loaded if needed
  loadInput.value = '';
}

async function runAlgorithm() {
  if (isRunning) return;
  isRunning = true;
  isPaused = false;
  pauseBtn.disabled = false;
  pauseBtn.textContent = 'Pause';
  startBtn.disabled = true;
  runController = createRunController();

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
    await animatePath(path);
    updateStats({ explored: result.explored, pathLength: path.length, time: duration });
  } else {
    updateStats({ explored: 0, pathLength: 0, time: duration });
  }

  isRunning = false;
  startBtn.disabled = false;
  pauseBtn.disabled = true;
  pauseBtn.textContent = 'Pause';

  isRunning = false;
  startBtn.disabled = false;
  pauseBtn.disabled = true;
  pauseBtn.textContent = 'Pause';
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
  const start = performance.now();
  return new Promise(async (resolve) => {
    while (performance.now() - start < ms) {
      if (isPaused) {
        await waitForUnpause();
      }
      await new Promise((r) => setTimeout(r, 10));
    }
    resolve();
  });
}

async function runBFS(startNode, goalNode) {
  const queue = [startNode];
  const visited = new Set();
  visited.add(startNode);
  startNode.distance = 0;
  setCostVisual(startNode, 0);
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
      neighbor.distance = node.distance + 1;
      setCostVisual(neighbor, neighbor.distance);
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
  setCostVisual(startNode, 0);
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
        setCostVisual(neighbor, tentative);
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
  setCostVisual(startNode, 0);
  fScore.set(startNode, heuristic(startNode, goalNode));
  open.add(startNode);

  let explored = 0;

  while (open.size > 0) {
    if (checkCancelled()) return null;
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
        setCostVisual(neighbor, tentativeG);
        fScore.set(neighbor, tentativeG + heuristic(neighbor, goalNode));
        open.add(neighbor);
        explored += 1;
        if (neighbor !== goalNode && neighbor !== startNode) {
          setNodeState(neighbor.row, neighbor.col, 'frontier');
        }
      }
    }

    await sleep(getSpeedDelay());
    if (checkCancelled()) return null;
  }

  return null;
}

async function animatePath(path) {
  placeAgent(currentStart);
  for (const node of path) {
    if (checkCancelled()) return;
    if (node.state === 'start' || node.state === 'goal') continue;
    setNodeState(node.row, node.col, 'path');
    placeAgent({ row: node.row, col: node.col });
    await sleep(getSpeedDelay());
    await waitForUnpause();
  }
}

function wireEvents() {
  document.addEventListener('mouseup', () => {
    isDragging = false;
    dragMode = null;
  });

  gridContainer.addEventListener('touchstart', (event) => {
    const touch = event.touches[0];
    const cellEl = document.elementFromPoint(touch.clientX, touch.clientY);
    const node = getNodeFromElement(cellEl);
    if (!node) return;
    onCellPointerDown({ button: 0 }, node);
    event.preventDefault();
  });

  gridContainer.addEventListener('touchmove', (event) => {
    const touch = event.touches[0];
    const cellEl = document.elementFromPoint(touch.clientX, touch.clientY);
    const node = getNodeFromElement(cellEl);
    if (!node) return;
    onCellPointerEnter({}, node);
    event.preventDefault();
  });

  gridContainer.addEventListener('touchend', () => {
    onCellPointerUp();
  });

  pauseBtn.addEventListener('click', () => {
    if (!isRunning) return;
    if (isPaused) {
      runController.resume();
    } else {
      runController.requestPause();
    }
  });


  startBtn.addEventListener('click', () => runAlgorithm());
  resetBtn.addEventListener('click', () => {
    resetGridStates();
    clearWalls();
    isRunning = false;
    isPaused = false;
    pauseBtn.disabled = true;
    pauseBtn.textContent = 'Pause';
    startBtn.disabled = false;
  });
  generateBtn.addEventListener('click', () => {
    generateMaze();
  });

  saveBtn.addEventListener('click', saveMazeToFile);
  loadBtn.addEventListener('click', () => loadInput.click());
  loadInput.addEventListener('change', handleLoadFile);

  speedRange.addEventListener('input', () => {
    speedLabel.textContent = speedRange.value;
  });

  algorithmSelect.addEventListener('change', () => {
    updateStats({ algorithm: algorithmSelect.value.toUpperCase() });
  });
}

async function generateMaze() {
  clearWalls();
  isRunning = false;
  isPaused = false;
  pauseBtn.disabled = true;

  const mode = mazeSelect?.value || 'random';
  if (mode === 'recursiveDivision') {
    await generateRecursiveDivision();
  } else if (mode === 'backtracker') {
    await generateRecursiveBacktracker();
  } else {
    await generateRandomMaze();
  }
}

async function generateRandomMaze() {
  const rows = GRID_SIZE;
  const cols = GRID_SIZE;
  const cells = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (r === currentStart.row && c === currentStart.col) continue;
      if (r === currentGoal.row && c === currentGoal.col) continue;
      if (Math.random() < 0.35) {
        cells.push({ r, c });
      }
    }
  }
  for (const { r, c } of cells) {
    setNodeState(r, c, 'wall');
    await sleep(getSpeedDelay());
  }
}

function carveMazePassage(r, c, visited) {
  const directions = [
    { dr: -2, dc: 0 },
    { dr: 2, dc: 0 },
    { dr: 0, dc: -2 },
    { dr: 0, dc: 2 },
  ];
  const shuffled = directions.sort(() => Math.random() - 0.5);
  visited.add(`${r},${c}`);

  for (const { dr, dc } of shuffled) {
    const nr = r + dr;
    const nc = c + dc;
    if (nr < 0 || nr >= GRID_SIZE || nc < 0 || nc >= GRID_SIZE) continue;
    if (visited.has(`${nr},${nc}`)) continue;
    const wallR = r + dr / 2;
    const wallC = c + dc / 2;
    if (wallR === currentStart.row && wallC === currentStart.col) continue;
    if (wallR === currentGoal.row && wallC === currentGoal.col) continue;
    setNodeState(wallR, wallC, 'empty');
    carveMazePassage(nr, nc, visited);
  }
}

async function generateRecursiveBacktracker() {
  // Start with full walls, carve out a maze using recursive backtracker.
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (!(r === currentStart.row && c === currentStart.col) && !(r === currentGoal.row && c === currentGoal.col)) {
        setNodeState(r, c, 'wall');
      }
    }
  }
  await sleep(getSpeedDelay());
  const visited = new Set();
  carveMazePassage(1, 1, visited);
}

async function generateRecursiveDivision() {
  // Fill all with walls, then recursively split with passages.
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (!(r === currentStart.row && c === currentStart.col) && !(r === currentGoal.row && c === currentGoal.col)) {
        setNodeState(r, c, 'wall');
      }
    }
  }
  await sleep(getSpeedDelay());

  function divide(r0, c0, r1, c1) {
    const width = c1 - c0;
    const height = r1 - r0;
    if (width < 2 || height < 2) return;

    const horizontal = width < height;
    if (horizontal) {
      const split = Math.floor((r0 + r1) / 2);
      const gap = Math.floor((Math.random() * (c1 - c0)) + c0);
      for (let c = c0; c < c1; c++) {
        if (c === gap) continue;
        if (split === currentStart.row && c === currentStart.col) continue;
        if (split === currentGoal.row && c === currentGoal.col) continue;
        setNodeState(split, c, 'wall');
      }
      divide(r0, c0, split, c1);
      divide(split + 1, c0, r1, c1);
    } else {
      const split = Math.floor((c0 + c1) / 2);
      const gap = Math.floor((Math.random() * (r1 - r0)) + r0);
      for (let r = r0; r < r1; r++) {
        if (r === gap) continue;
        if (r === currentStart.row && split === currentStart.col) continue;
        if (r === currentGoal.row && split === currentGoal.col) continue;
        setNodeState(r, split, 'wall');
      }
      divide(r0, c0, r1, split);
      divide(r0, split + 1, r1, c1);
    }
  }

  divide(0, 0, GRID_SIZE, GRID_SIZE);
}

createGrid();
wireEvents();
