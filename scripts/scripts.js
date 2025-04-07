const apiUrl = 'https://spotify-fonts-api-server-production.up.railway.app/api/fonts';
let fontLockPairs = [];
let colorLockPairs = [];

document.addEventListener('DOMContentLoaded', () => {
  // === FONT PAIRS ===
  const fontLockButtons = Array.from(document.getElementsByClassName('lock'))
    .filter(btn => btn.previousElementSibling && btn.previousElementSibling.tagName.match(/H[1-6]|P/));

  fontLockPairs = fontLockButtons.map(button => {
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

  // === Initialize lock states + attach toggle for all lock buttons ===
  fontLockPairs.forEach(({ button }) => initializeLock(button));
  colorLockPairs.forEach(({ button }) => initializeLock(button));

  // === Randomizer Button ===
  document.getElementById('randomizer').addEventListener('click', () => {
    fetch(apiUrl)
      .then(res => res.json())
      .then(data => {
        const fonts = data.items;
        const randomFonts = getRandomFonts(fonts, fontLockPairs.length);

        // Only update unlocked font groups
        fontLockPairs.forEach(({ button, elements }, index) => {
          if (button.dataset.locked !== 'true') {
            applyFont(elements, randomFonts[index]);
          }
        });

        // Only update unlocked color blocks
        applyColors();
      })
      .catch(err => console.error('Font API fetch failed:', err));
  });
});

// === LOCK INITIALIZATION ===

function initializeLock(button) {
  if (!button.dataset.locked) {
    button.dataset.locked = 'false';
  }
  button.addEventListener('click', () => toggleLock(button));
}

// === FONT LOGIC ===

function getRandomFonts(fontList, count) {
  // Fisher-Yates Shuffle
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

    // Optional: add basic onerror fail-safe
    linkTag.onerror = () => {
      console.error(`Failed to load font: ${fontName}`);
    };

    document.head.appendChild(linkTag);
  }

  // Apply font to all matched elements
  Array.from(elements).forEach(el => {
    if (el && el.style) {
      el.style.fontFamily = `'${fontName}', sans-serif`;
    }
  });
}

// === COLOR LOGIC ===

function getRandomBaseColor() {
  const hue = Math.floor(Math.random() * 360);
  const saturation = 65 + Math.random() * 25;
  const lightness = 45 + Math.random() * 15;
  return { hue, saturation, lightness };
}

function generateColorPalette(baseHue, saturation, lightness) {
  const offsets = [0, 150, 210, 30, 330];
  return offsets.map(offset => {
    const hue = (baseHue + offset) % 360;
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  });
}

function applyColors() {
  const base = getRandomBaseColor();
  const colors = generateColorPalette(base.hue, base.saturation, base.lightness);

  colorLockPairs.forEach(({ block, button }, index) => {
    const isLocked = button.dataset.locked === 'true';
    if (!isLocked && block) {
      const color = colors[index % colors.length];
      block.style.backgroundColor = color;
      block.style.color = getContrastColor(color); // Ensure legibility

      // Optional enhancement: display hex code below or on hover
      // block.dataset.hex = hslToHex(color);
    }
  });
}

function hslToHex(hslString) {
  const [h, s, l] = hslString.match(/\d+/g).map(Number);
  const a = s * Math.min(l, 100 - l) / 100;
  const f = n => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
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
  button.setAttribute('aria-pressed', (!isLocked).toString()); // Accessibility

  img.src = isLocked ? 'icons/unlock.svg' : 'icons/lock.svg';
  img.alt = isLocked ? 'unlock icon' : 'lock icon';
}
