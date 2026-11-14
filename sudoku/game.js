(() => {
  const solution = [
    '534678912', '672195348', '198342567',
    '859761423', '426853791', '713924856',
    '961537284', '287419635', '345286179'
  ];
  const puzzle = [
    '530070000', '600195000', '098000060',
    '800060003', '400803001', '700020006',
    '060000280', '000419005', '000080079'
  ];
  const boardEl = document.querySelector('#board');
  const padEl = document.querySelector('#number-pad');
  const messageEl = document.querySelector('#game-message');
  const patternCanvas = document.querySelector('#pattern-canvas');
  const patternContext = patternCanvas.getContext('2d');
  const history = [];
  let grid;
  let selected = -1;
  let activeDigit = 0;
  let mistakes = 0;
  let startedAt = Date.now();
  let finished = false;
  let selectedPattern = -1;
  let patternStitches = [];

  const patternDesigns = [
    { title: 'A wildflower in bloom', finish: 'Every stitch in place. A little garden, made by you.' },
    { title: 'A hare in the garden', finish: 'Every stitch in place. A little hare, made by you.' },
    { title: 'Tulips in the sunshine', finish: 'Every stitch in place. A little spring garden, made by you.' }
  ];

  const indexFor = (row, col) => row * 9 + col;
  const formatTime = seconds => `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
  const solutionValue = index => Number(solution[Math.floor(index / 9)][index % 9]);
  const givenValue = index => Number(puzzle[Math.floor(index / 9)][index % 9]);

  function makePattern(designIndex) {
    const stitches = new Map();
    const colors = {
      stem: '#667c5d',
      leaf: '#809271',
      leafLight: '#a0a782',
      peach: '#d59a82',
      pink: '#cf838b',
      blush: '#dfa4a3',
      coral: '#c86d68',
      gold: '#c3944d',
      center: '#9e7448'
    };
    const set = (x, y, color) => {
      if (x >= 2 && x < 29 && y >= 2 && y < 29) stitches.set(`${x},${y}`, { x, y, color });
    };
    const ellipse = (cx, cy, rx, ry, color, angle = 0) => {
      const radius = Math.ceil(Math.max(rx, ry));
      for (let y = Math.floor(cy - radius); y <= cy + radius; y++) {
        for (let x = Math.floor(cx - radius); x <= cx + radius; x++) {
          const dx = x - cx, dy = y - cy;
          const rotatedX = dx * Math.cos(angle) + dy * Math.sin(angle);
          const rotatedY = -dx * Math.sin(angle) + dy * Math.cos(angle);
          if ((rotatedX * rotatedX) / (rx * rx) + (rotatedY * rotatedY) / (ry * ry) <= 1) set(x, y, color);
        }
      }
    };
    const line = (x1, y1, x2, y2, color) => {
      const steps = Math.max(Math.abs(x2 - x1), Math.abs(y2 - y1)) * 2;
      for (let step = 0; step <= steps; step++) {
        const ratio = steps ? step / steps : 0;
        set(Math.round(x1 + (x2 - x1) * ratio), Math.round(y1 + (y2 - y1) * ratio), color);
      }
    };
    const flower = (cx, cy, petalColor, centerColor) => {
      for (let petal = 0; petal < 8; petal++) {
        const angle = petal * Math.PI / 4;
        ellipse(cx + Math.cos(angle) * 2.15, cy + Math.sin(angle) * 2.15, 1.3, 1.15, petal % 3 === 0 ? colors.blush : petalColor, angle);
      }
      ellipse(cx, cy, 1.35, 1.35, centerColor);
      set(cx - 1, cy - 1, colors.center);
    };

    if (designIndex === 1) {
      ellipse(14, 19, 7, 5, colors.leafLight);
      ellipse(14, 18, 5.5, 4, '#a7a995');
      ellipse(18, 12, 4.1, 4, '#b7b7a4');
      ellipse(17, 7, 1.4, 4.8, '#b7b7a4', -.17);
      ellipse(20, 6, 1.25, 4.3, '#b7b7a4', .1);
      ellipse(17, 7, .65, 3.2, '#d6cbb7', -.17);
      ellipse(20, 6, .6, 2.8, '#d6cbb7', .1);
      ellipse(10, 23, 3.4, 2.2, '#a7a995', -.18);
      ellipse(19, 23, 3.2, 2.1, '#a7a995', .18);
      ellipse(24, 19, 1.8, 1.8, '#d8d0bc');
      ellipse(19, 11, .38, .38, '#574f48');
      line(21, 14, 22, 14, colors.peach);
      flower(7, 12, colors.pink, colors.gold);
      flower(25, 12, colors.peach, colors.gold);
      line(8, 14, 11, 23, colors.stem);
      line(25, 14, 18, 22, colors.stem);
      ellipse(9, 19, 3.1, 1.15, colors.leaf, -.35);
      ellipse(23, 20, 3, 1.1, colors.leafLight, .45);
      return [...stitches.values()].sort((a, b) => a.y - b.y || a.x - b.x);
    }

    if (designIndex === 2) {
      const tulips = [
        { x: 7, top: 11, petal: colors.coral },
        { x: 15, top: 6, petal: colors.peach },
        { x: 23, top: 10, petal: colors.pink }
      ];
      tulips.forEach(({ x, top, petal }, index) => {
        const bottom = 25;
        line(x, top + 5, 15 + (index - 1) * 2, bottom, colors.stem);
        ellipse(x - 2, 21, 3.7, 1.05, colors.leaf, -.55);
        ellipse(x + 2, 23, 3.5, 1.05, colors.leafLight, .48);
        ellipse(x - 1.5, top + 1, 1.5, 3.4, colors.blush, -.12);
        ellipse(x + 1.5, top + 1, 1.5, 3.4, petal, .12);
        ellipse(x, top + 2, 1.7, 3.7, petal);
        line(x - 3, top + 3, x, top + 5, colors.coral);
        line(x + 3, top + 3, x, top + 5, colors.coral);
      });
      [4, 26].forEach((x, index) => {
        line(x, 21, index ? 17 : 13, 26, colors.stem);
        flower(x, 19, index ? colors.blush : colors.peach, colors.gold);
      });
      ellipse(15, 27, 4, 1.1, colors.leafLight, .08);
      return [...stitches.values()].sort((a, b) => a.y - b.y || a.x - b.x);
    }

    const tie = { x: 15, y: 25 };
    const stems = [
      [8, 8], [19, 7], [13, 13], [7, 17], [22, 16], [25, 10], [10, 12]
    ];
    stems.forEach(([x, y], index) => {
      line(x, y + 2, tie.x + (index % 3) - 1, tie.y - 1, index % 2 ? colors.leaf : colors.stem);
    });

    [
      [9, 15, -0.75], [13, 19, 0.3], [18, 19, -0.4],
      [7, 21, -0.55], [22, 21, 0.65], [12, 22, -0.15], [19, 23, 0.25],
      [5, 18, 0.9], [25, 18, -0.9], [16, 16, 0.65], [11, 12, -0.8]
    ].forEach(([x, y, angle], index) => {
      ellipse(x, y, 2.7, 1.15, index % 2 ? colors.leafLight : colors.leaf, angle);
      set(Math.round(x), Math.round(y), colors.stem);
    });

    flower(8, 7, colors.pink, colors.gold);
    flower(19, 6, colors.peach, colors.gold);
    flower(14, 12, colors.blush, colors.coral);
    flower(6, 16, colors.coral, colors.gold);
    flower(23, 15, colors.pink, colors.gold);
    ellipse(15, 25, 2, 1.4, colors.gold);
    ellipse(11, 25, 3.2, 1.15, colors.peach, -0.55);
    ellipse(19, 25, 3.2, 1.15, colors.pink, 0.55);
    line(14, 26, 12, 28, colors.gold);
    line(16, 26, 18, 28, colors.gold);

    return [...stitches.values()].sort((a, b) => a.y - b.y || a.x - b.x);
  }

  function renderPattern(stitched, total) {
    const context = patternContext;
    const size = patternCanvas.width;
    const cellSize = size / 31;
    const progress = total ? stitched / total : 0;
    const visibleCount = Math.floor(patternStitches.length * progress);

    context.clearRect(0, 0, size, size);
    context.fillStyle = '#f3eddf';
    context.fillRect(0, 0, size, size);

    context.lineWidth = 0.55;
    for (let point = 0; point <= 31; point++) {
      const position = point * cellSize;
      context.strokeStyle = point % 5 === 0 ? 'rgba(147, 125, 99, .15)' : 'rgba(147, 125, 99, .075)';
      context.beginPath();
      context.moveTo(position, 0);
      context.lineTo(position, size);
      context.moveTo(0, position);
      context.lineTo(size, position);
      context.stroke();
    }

    patternStitches.slice(0, visibleCount).forEach(({ x, y, color }) => {
      const centerX = (x + .5) * cellSize;
      const centerY = (y + .5) * cellSize;
      const span = cellSize * .31;
      context.lineCap = 'round';
      context.lineWidth = cellSize * .2;
      context.strokeStyle = 'rgba(66, 51, 40, .18)';
      context.beginPath();
      context.moveTo(centerX - span, centerY + span + .45);
      context.lineTo(centerX + span, centerY - span + .45);
      context.moveTo(centerX - span, centerY - span + .45);
      context.lineTo(centerX + span, centerY + span + .45);
      context.stroke();

      context.strokeStyle = color;
      context.lineWidth = cellSize * .17;
      context.beginPath();
      context.moveTo(centerX - span, centerY + span);
      context.lineTo(centerX + span, centerY - span);
      context.moveTo(centerX - span, centerY - span);
      context.lineTo(centerX + span, centerY + span);
      context.stroke();

      context.strokeStyle = 'rgba(255, 247, 226, .64)';
      context.lineWidth = cellSize * .045;
      context.beginPath();
      context.moveTo(centerX - span * .72, centerY + span * .65);
      context.lineTo(centerX + span * .65, centerY - span * .72);
      context.stroke();
    });

    const percent = Math.round(progress * 100);
    document.querySelector('#pattern-progress').textContent = `${percent}%`;
    document.querySelector('#pattern-progress-fill').style.width = `${percent}%`;
    document.querySelector('#pattern-canvas').setAttribute(
      'aria-label',
      `${patternDesigns[selectedPattern].title} cross-stitch sampler, ${percent}% complete`
    );
    document.querySelector('#pattern-message').textContent = percent === 100
      ? patternDesigns[selectedPattern].finish
      : 'Your stitches will bring it to life.';
    document.querySelector('#pattern-title').textContent = patternDesigns[selectedPattern].title;
  }

  function setMessage(text, kind = '') {
    messageEl.classList.remove('is-success', 'is-error');
    if (kind) messageEl.classList.add(`is-${kind}`);
    messageEl.querySelector('span:last-child').textContent = text;
  }

  function renderBoard() {
    boardEl.replaceChildren();
    grid.forEach((value, index) => {
      const cell = document.createElement('button');
      const given = givenValue(index) !== 0;
      const correct = value !== 0 && value === solutionValue(index);
      cell.type = 'button';
      cell.className = 'cell';
      cell.setAttribute('role', 'gridcell');
      cell.setAttribute('aria-rowindex', String(Math.floor(index / 9) + 1));
      cell.setAttribute('aria-colindex', String(index % 9 + 1));
      if (given) cell.classList.add('given');
      else if (correct) cell.classList.add('stitched');
      else if (value) cell.classList.add('wrong-entry');
      if (selected === index) cell.classList.add('selected');
      if (selected >= 0) {
        const row = Math.floor(index / 9), col = index % 9;
        if (row === Math.floor(selected / 9) || col === selected % 9 ||
            (Math.floor(row / 3) === Math.floor(selected / 9 / 3) && Math.floor(col / 3) === Math.floor(selected % 9 / 3))) {
          cell.classList.add('related');
        }
        if (value && value === grid[selected]) cell.classList.add('same-number');
      }
      if (value) {
        const number = document.createElement('span');
        number.className = 'cell-number';
        number.textContent = String(value);
        cell.append(number);
      }
      cell.setAttribute('aria-label', `Row ${Math.floor(index / 9) + 1}, column ${index % 9 + 1}, ${value ? `number ${value}${given ? ', given' : correct ? ', stitched' : ', incorrect'}` : 'empty'}${given ? ', fixed' : ''}`);
      cell.addEventListener('click', () => selectCell(index));
      boardEl.append(cell);
    });
  }

  function remainingFor(digit) {
    return grid.reduce((total, value, index) => total + (solutionValue(index) === digit && value !== digit ? 1 : 0), 0);
  }

  function renderControls() {
    padEl.replaceChildren();
    for (let digit = 1; digit <= 9; digit++) {
      const remaining = remainingFor(digit);
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'number-choice';
      button.setAttribute('aria-label', `Choose ${digit}, ${remaining} remaining`);
      button.setAttribute('aria-pressed', String(activeDigit === digit));
      if (activeDigit === digit) button.classList.add('active');
      if (!remaining) button.classList.add('complete');
      button.innerHTML = `<span class="number-label">${digit}</span><span class="remaining">${remaining}</span>`;
      button.addEventListener('click', () => enterDigit(digit));
      padEl.append(button);
    }
    const stitched = grid.reduce((total, value, index) => total + (value !== 0 && value === solutionValue(index) && !givenValue(index) ? 1 : 0), 0);
    const total = puzzle.reduce((sum, row) => sum + [...row].filter(value => value === '0').length, 0);
    document.querySelector('#stitched-count').textContent = String(stitched);
    document.querySelector('#progress-percent').textContent = `${Math.round(stitched / total * 100)}%`;
    document.querySelector('#progress-fill').style.width = `${stitched / total * 100}%`;
    renderPattern(stitched, total);
  }

  function selectCell(index) {
    selected = index;
    if (!givenValue(index) && grid[index]) activeDigit = grid[index];
    renderBoard();
    renderControls();
  }

  function enterDigit(digit) {
    activeDigit = digit;
    if (selected < 0) {
      renderControls();
      setMessage(`Number ${digit} selected. Choose a square to stitch.`);
      return;
    }
    if (givenValue(selected)) {
      setMessage('That square is part of the pattern guide. Choose an empty square.');
      return;
    }
    if (grid[selected] === digit) {
      renderControls();
      return;
    }
    history.push({ index: selected, value: grid[selected] });
    const correct = digit === solutionValue(selected);
    finished = false;
    grid[selected] = digit;
    if (correct) {
      setMessage('Lovely stitch. Your sampler is taking shape.', 'success');
    } else {
      mistakes++;
      setMessage(`Not quite that thread. Have another go. (${mistakes} ${mistakes === 1 ? 'tangle' : 'tangles'})`, 'error');
    }
    renderBoard();
    renderControls();
    checkFinished();
  }

  function eraseSelected() {
    if (selected < 0 || givenValue(selected) || !grid[selected]) {
      setMessage('Choose one of your stitched squares to undo it.');
      return;
    }
    history.push({ index: selected, value: grid[selected] });
    finished = false;
    grid[selected] = 0;
    renderBoard();
    renderControls();
    setMessage('A stitch unpicked. No harm done.');
  }

  function undo() {
    const previous = history.pop();
    if (!previous) {
      setMessage('No stitches to undo just yet.');
      return;
    }
    selected = previous.index;
    grid[previous.index] = previous.value;
    finished = false;
    renderBoard();
    renderControls();
    setMessage('One stitch gently undone.');
  }

  function checkFinished() {
    if (grid.every((value, index) => value === solutionValue(index))) {
      finished = true;
      setMessage('Every stitch in place. What a lovely little masterpiece!', 'success');
    }
  }

  function hint() {
    if (finished) return;
    let candidates = [];
    if (selected >= 0 && !givenValue(selected) && grid[selected] !== solutionValue(selected)) candidates.push(selected);
    if (!candidates.length) candidates = grid.map((value, index) => value !== solutionValue(index) && !givenValue(index) ? index : -1).filter(index => index >= 0);
    if (!candidates.length) return checkFinished();
    const index = candidates[Math.floor(Math.random() * candidates.length)];
    selected = index;
    enterDigit(solutionValue(index));
  }

  function permuteGroup(array) {
    const groups = [array.slice(0, 3), array.slice(3, 6), array.slice(6, 9)];
    const shuffledGroups = groups.sort(() => Math.random() - .5).map(group => group.sort(() => Math.random() - .5));
    return shuffledGroups.flat();
  }

  function newGame() {
    let nextPattern = Math.floor(Math.random() * patternDesigns.length);
    if (nextPattern === selectedPattern) {
      nextPattern = (nextPattern + 1 + Math.floor(Math.random() * (patternDesigns.length - 1))) % patternDesigns.length;
    }
    selectedPattern = nextPattern;
    patternStitches = makePattern(selectedPattern);
    const rows = permuteGroup([0, 1, 2, 3, 4, 5, 6, 7, 8]);
    const cols = permuteGroup([0, 1, 2, 3, 4, 5, 6, 7, 8]);
    const digits = [1, 2, 3, 4, 5, 6, 7, 8, 9].sort(() => Math.random() - .5);
    const map = new Map(digits.map((digit, index) => [index + 1, digit]));
    const transformedSolution = rows.map(row => [...cols].map(col => map.get(Number(solution[row][col]))));
    const transformedPuzzle = rows.map(row => [...cols].map(col => {
      const value = Number(puzzle[row][col]);
      return value ? map.get(value) : 0;
    }));
    grid = transformedPuzzle.flat();
    const newSolution = transformedSolution.map(row => row.join(''));
    solution.splice(0, solution.length, ...newSolution);
    puzzle.splice(0, puzzle.length, ...transformedPuzzle.map(row => row.join('')));
    selected = -1;
    activeDigit = 0;
    mistakes = 0;
    finished = false;
    history.length = 0;
    startedAt = Date.now();
    setMessage('Choose a square, then pick a thread below.');
    renderBoard();
    renderControls();
  }

  function moveSelection(key) {
    if (selected < 0) {
      selectCell(0);
      return;
    }
    const row = Math.floor(selected / 9), col = selected % 9;
    const moves = { ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1] };
    const [dr, dc] = moves[key];
    selectCell(indexFor((row + dr + 9) % 9, (col + dc + 9) % 9));
  }

  document.addEventListener('keydown', event => {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    if (event.key.startsWith('Arrow')) {
      event.preventDefault();
      moveSelection(event.key);
    } else if (/^[1-9]$/.test(event.key)) {
      enterDigit(Number(event.key));
    } else if (event.key === 'Backspace' || event.key === 'Delete' || event.key === '0') {
      eraseSelected();
    }
  });
  document.querySelector('#erase').addEventListener('click', eraseSelected);
  document.querySelector('#undo').addEventListener('click', undo);
  document.querySelector('#hint').addEventListener('click', hint);
  document.querySelector('#new-game').addEventListener('click', newGame);
  setInterval(() => {
    if (!finished) document.querySelector('#timer').textContent = formatTime(Math.floor((Date.now() - startedAt) / 1000));
  }, 1000);
  newGame();
})();
