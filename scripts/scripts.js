const apiUrl = 'http://localhost:3001/api/fonts';

// Global lock pairs
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

  // === Initialize lock states + attach toggle ===
  [...fontLockPairs, ...colorLockPairs].forEach(({ button }) => {
    if (!button.dataset.locked) {
      button.dataset.locked = 'false';
    }


    button.addEventListener('click', () => toggleLock(button));
  });

  colorLockPairs.forEach(({ button }) => {
  if (!button.dataset.locked) {
    button.dataset.locked = 'false';
  }

  button.addEventListener('click', (e) => toggleLock(e.currentTarget));
});

  // === Randomizer Button ===
  document.getElementById('randomizer').addEventListener('click', () => {
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
      });
  });
});

// === FONT LOGIC ===

function getRandomFonts(fontList, count) {
  const shuffled = fontList.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
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
      block.textContent = hslToHex(color);
      block.style.color = getContrastColor(color);
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
    img.src = isLocked ? 'icons/unlock.svg' : 'icons/lock.svg';
    img.alt = isLocked ? 'unlock icon' : 'lock icon';
  }