const apiUrl = 'https://spotify-fonts-api-server-production.up.railway.app/api/fonts';

document.addEventListener('DOMContentLoaded', () => {
// font pairs
  fontLockPairs = Array.from(document.getElementsByClassName('lock'))
    .filter(btn => btn.previousElementSibling && btn.previousElementSibling.tagName.match(/H[1-6]|P/))
    .map(button => {
      const target = button.previousElementSibling;
      const className = target.classList[0];
      const elements = document.getElementsByClassName(className);
      return { button, elements };
    });

// color pairs
    colorLockPairs = Array.from(document.querySelectorAll('.colors > div')).map(wrapper => {
    const block = wrapper.querySelector('.color-block');
    const button = wrapper.querySelector('.lock');
    return { block, button };
  });

  fontLockPairs.forEach(({ button }) => initializeLock(button));
  colorLockPairs.forEach(({ button }) => initializeLock(button));

  // randomizer
  document.getElementById('randomizer').addEventListener('click', handleRandomizerClick);
});

// font logic
function getRandomFonts(fontList, count) {
  const array = [...fontList];
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array.slice(0, count);
}

function applyFont(elements, fontObj) {
  if (!elements) return;

  const fontName = fontObj.family;
  const fontHref = `https://fonts.googleapis.com/css2?family=${fontName.replace(/ /g, '+')}&display=swap`;

  if (!document.querySelector(`link[href="${fontHref}"]`)) {
    const linkTag = document.createElement('link');
    linkTag.href = fontHref;
    linkTag.rel = 'stylesheet';
    document.head.appendChild(linkTag);
  }

  Array.from(elements).forEach(el => {
    if (el && el.style) {
      el.style.fontFamily = `'${fontName}', sans-serif`;
    }
  });
}

// === COLOR LOGIC ===
function getColorPalette() {
  const curatedPalettes = [
    ['#12130f', '#5b9279', '#8fcb9b', '#eae6e5', '#8f8073'],
    ['#264653', '#2a9d8f', '#e9c46a', '#f4a261', '#e76f51'],
    ['#0b3954', '#bfd7ea', '#ff6663', '#e0ff4f', '#fe938c'],
    ['#1d3557', '#457b9d', '#a8dadc', '#f1faee', '#e63946'],
    ['#2e4057', '#66a182', '#caffbf', '#fdfcdc', '#f5b461']
  ];

  const base = [...curatedPalettes[Math.floor(Math.random() * curatedPalettes.length)]];
  return shufflePalette(base);
}

function shufflePalette(palette) {
  const copy = [...palette];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function applyColors() {
  const colors = getColorPalette();

  colorLockPairs.forEach(({ block, button }, index) => {
    if (button.dataset.locked !== 'true' && block) {
      const color = colors[index % colors.length];
      block.style.backgroundColor = color;
    }
  });
}

// LOCK
// initialize lock state
function initializeLock(button) {
  if (!button.dataset.locked) button.dataset.locked = 'false';
  button.addEventListener('click', () => toggleLock(button));
}

// lock toggle
function toggleLock(button) {
  const img = button.querySelector('img');
  const isLocked = button.dataset.locked === 'true';

  button.dataset.locked = (!isLocked).toString();
  button.setAttribute('aria-pressed', (!isLocked).toString());

  img.src = isLocked ? 'icons/unlock.svg' : 'icons/lock.svg';
  img.alt = isLocked ? 'unlock icon' : 'lock icon';
}

// randomizer
function handleRandomizerClick() {
  fetch(apiUrl)
    .then(res => res.json())
    .then(data => {
      const fonts = data.items;
      const randomFonts = getRandomFonts(fonts, fontLockPairs.length);

      fontLockPairs.forEach(({ button, elements }, index) => {
        if (button.dataset.locked !== 'true') {
          applyFont(elements, randomFonts[index]);
        }
      });

      applyColors();
    })
    .catch(err => console.error('Font API fetch failed:', err));
}
