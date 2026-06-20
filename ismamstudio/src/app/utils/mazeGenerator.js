export const generateMazeSVG = (gridSize = 32, shape = 'heart', showSolution = false) => {
  const cellSize = 16;
  
  // 1. Shape Masks
  const masks = {
    square: (r, c) => r >= 2 && r < gridSize - 2 && c >= 2 && c < gridSize - 2,
    
    circle: (r, c) => {
      const cx = gridSize / 2, cy = gridSize / 2;
      const radius = gridSize / 2 - 2;
      return Math.pow(r - cy, 2) + Math.pow(c - cx, 2) <= Math.pow(radius, 2);
    },
    
    heart: (r, c) => {
      const x = (c - gridSize / 2) / (gridSize / 2.7);
      const y = (gridSize / 2 - r) / (gridSize / 2.7) + 0.15;
      return Math.pow(Math.pow(x, 2) + Math.pow(y, 2) - 1, 3) - Math.pow(x, 2) * Math.pow(y, 3) <= 0;
    },

    triangle: (r, c) => {
      const padding = 2;
      // Cut off the top and bottom padding
      if (r < padding || r > gridSize - padding) return false;
      
      const cx = gridSize / 2;
      // Calculate how wide the triangle should be at the current row
      const widthAtRow = ((r - padding) / (gridSize - padding * 2)) * (gridSize / 2 - padding);
      
      return Math.abs(c - cx) <= widthAtRow;
    }
  };

  const isMasked = masks[shape] || masks['square'];
  const validCells = [];
  const validSet = new Set();

  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      if (isMasked(r, c)) {
        validCells.push([r, c]);
        validSet.add(`${r},${c}`);
      }
    }
  }

  if (validCells.length === 0) return null;

  // 2. Initialize Walls
  const walls = {};
  validCells.forEach(([r, c]) => {
    walls[`${r},${c}`] = { N: true, S: true, E: true, W: true };
  });

  // Sort to find start (top-leftmost) and end (bottom-rightmost)
  validCells.sort((a, b) => (a[0] !== b[0] ? a[0] - b[0] : a[1] - b[1]));
  const startCell = validCells[0];
  const endCell = validCells[validCells.length - 1];

  // 3. Recursive Backtracking
  const visited = new Set();
  const stack = [startCell];
  visited.add(`${startCell[0]},${startCell[1]}`);

  const directions = [
    [-1, 0, 'N', 'S'], [1, 0, 'S', 'N'], 
    [0, 1, 'E', 'W'], [0, -1, 'W', 'E']
  ];

  while (stack.length > 0) {
    const curr = stack[stack.length - 1];
    const [r, c] = curr;
    const neighbors = [];

    for (const [dr, dc, d, opp] of directions) {
      const nr = r + dr, nc = c + dc;
      const neighborKey = `${nr},${nc}`;
      if (validSet.has(neighborKey) && !visited.has(neighborKey)) {
        neighbors.push([[nr, nc], d, opp]);
      }
    }

    if (neighbors.length > 0) {
      // Randomly pick a neighbor
      const [[nr, nc], d, opp] = neighbors[Math.floor(Math.random() * neighbors.length)];
      walls[`${r},${c}`][d] = false;
      walls[`${nr},${nc}`][opp] = false;
      
      visited.add(`${nr},${nc}`);
      stack.push([nr, nc]);
    } else {
      stack.pop();
    }
  }

  // Open Start and End outer walls
  walls[`${startCell[0]},${startCell[1]}`]['N'] = false;
  walls[`${endCell[0]},${endCell[1]}`]['S'] = false;

  // 4. BFS for Solution Path
  let path = [];
  if (showSolution) {
    const queue = [startCell];
    const parent = { [`${startCell[0]},${startCell[1]}`]: null };
    const solveVisited = new Set([`${startCell[0]},${startCell[1]}`]);

    while (queue.length > 0) {
      const curr = queue.shift();
      const [r, c] = curr;
      
      if (r === endCell[0] && c === endCell[1]) break;

      for (const [dr, dc, d] of directions) {
        if (!walls[`${r},${c}`][d]) {
          const nr = r + dr, nc = c + dc;
          const nextKey = `${nr},${nc}`;
          if (validSet.has(nextKey) && !solveVisited.has(nextKey)) {
            solveVisited.add(nextKey);
            parent[nextKey] = curr;
            queue.push([nr, nc]);
          }
        }
      }
    }

    let currNode = endCell;
    while (currNode) {
      path.push(currNode);
      currNode = parent[`${currNode[0]},${currNode[1]}`];
    }
    path.reverse();
  }

  // 5. Render SVG String
  const width = gridSize * cellSize;
  const height = gridSize * cellSize;
  let svg = `<svg width="100%" height="100%" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">\n`;
  svg += `<g stroke="#1a1a1a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none">\n`;

  validCells.forEach(([r, c]) => {
    const x1 = c * cellSize, y1 = r * cellSize;
    const x2 = x1 + cellSize, y2 = y1 + cellSize;
    const cellWalls = walls[`${r},${c}`];

    if (cellWalls['N']) svg += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y1}" />\n`;
    if (cellWalls['S']) svg += `<line x1="${x1}" y1="${y2}" x2="${x2}" y2="${y2}" />\n`;
    if (cellWalls['E']) svg += `<line x1="${x2}" y1="${y1}" x2="${x2}" y2="${y2}" />\n`;
    if (cellWalls['W']) svg += `<line x1="${x1}" y1="${y1}" x2="${x1}" y2="${y2}" />\n`;
  });
  svg += `</g>\n`;

  // Draw Solution Path
  if (showSolution && path.length > 0) {
    svg += `<g stroke="#d9534f" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none" opacity="0.85">\n`;
    let pathD = [];
    path.forEach(([r, c], i) => {
      const cx = c * cellSize + cellSize / 2;
      const cy = r * cellSize + cellSize / 2;
      if (i === 0) {
        pathD.push(`M ${cx} ${cy - cellSize / 2}`, `L ${cx} ${cy}`);
      } else {
        pathD.push(`L ${cx} ${cy}`);
      }
      if (i === path.length - 1) {
        pathD.push(`L ${cx} ${cy + cellSize / 2}`);
      }
    });
    svg += `<path d="${pathD.join(' ')}" />\n</g>\n`;
  }

  svg += `</svg>`;
  return svg;
};