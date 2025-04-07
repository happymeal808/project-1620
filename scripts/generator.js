const apiUrl = 'https://spotify-fonts-api-server-production.up.railway.app/api/fonts';
let fontLockPairs = [];
let colorLockPairs = [];

document.addEventListener('DOMContentLoaded', () => {
// === FONT PAIRS ===
  fontLockPairs = Array.from(document.getElementsByClassName('lock'))
    .filter(btn => btn.previousElementSibling && btn.previousElementSibling.tagName.match(/H[1-6]|P/))
    .map(button => {
      const target = button.previousElementSibling;
      const className = target.classList[0];
      const elements = document.getElementsByClassName(className);
      return { button, elements };
    });

// === COLOR PAIRS ===
  colorLockPairs = Array.from(document.querySelectorAll('.colors > div')).map(wrapper => {
    const block = wrapper.querySelector('.color-block');
    const button = wrapper.querySelector('.lock');
    return { block, button };
  });

  fontLockPairs.forEach(({ button }) => initializeLock(button));
  colorLockPairs.forEach(({ button }) => initializeLock(button));

// === Randomizer Button ===
  document.getElementById('randomizer').addEventListener('click', handleRandomizerClick);
});

// === LOCK INITIALIZATION ===
function initializeLock(button) {
  if (!button.dataset.locked) button.dataset.locked = 'false';
  button.addEventListener('click', () => toggleLock(button));
}

// === FONT LOGIC ===
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
function getColorTheoryPalette() {
  const baseHue = Math.floor(Math.random() * 360);
  const saturation = 60 + Math.random() * 30;

  const schemes = {
    complementary: [0, 180, 30, 210, 60],
    triadic: [0, 120, 240, 60, 300],
    analogous: [-30, 0, 30, 60, 90],
    tetradic: [0, 90, 180, 270, 135],
    earthy: [30, 40, 50, 70]
  };

  const schemeNames = Object.keys(schemes);
  const selected = schemes[schemeNames[Math.floor(Math.random() * schemeNames.length)]];

  const palette = selected.map((offset, i) => {
    let hue = (baseHue + offset + 360) % 360;

    if (i === 4) {
      hue = 30 + Math.random() * 20;
    }

    const sat = Math.max(50, Math.min(saturation + (Math.random() * 10 - 5), 100));

    // Lightness
    let light;
    switch (i) {
      case 0:
        light = 5 + Math.random() * 15;
        break;
      case 1:
        light = 80 + Math.random() * 15;
        break;
      case 2:
        light = 35 + Math.random() * 20;
        break;
      case 3:
        light = 40 + Math.random() * 30;
        break;
      default:
        light = 45 + Math.random() * 20;
        break;
    }

    return `hsl(${hue}, ${sat}%, ${light}%)`;
  });

  return [...new Set(palette)];
}


function applyColors() {
  const colors = getColorTheoryPalette();

  colorLockPairs.forEach(({ block, button }, index) => {
    if (button.dataset.locked !== 'true' && block) {
      const color = colors[index % colors.length];
      block.style.backgroundColor = color;
      block.style.color = getContrastColor(color);
    }
  });
}

function getContrastColor(hslString) {
  const lightness = parseInt(hslString.match(/\d+/g)[2]);
  return lightness > 55 ? '#000' : '#fff';
}

// === LOCK TOGGLE ===
function toggleLock(button) {
  const img = button.querySelector('img');
  const isLocked = button.dataset.locked === 'true';

  button.dataset.locked = (!isLocked).toString();
  button.setAttribute('aria-pressed', (!isLocked).toString());

  img.src = isLocked ? 'icons/unlock.svg' : 'icons/lock.svg';
  img.alt = isLocked ? 'unlock icon' : 'lock icon';
}

// === RANDOMIZER HANDLER ===
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