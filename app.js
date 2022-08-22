const root = document.querySelector(':root');
const imageResolution = document.querySelector('.image-resolution');
const imageAspectRatio = document.querySelector('.image-aspect-ratio');
const imageResolutionContainer = document.querySelector(
    '.image-resolution-container'
);
const imageAspectRatioContainer = document.querySelector(
    '.image-aspect-ratio-container'
);
const resolutionXInput = document.querySelector('.resolution-x');
const resolutionYInput = document.querySelector('.resolution-y');
const resetButton = document.querySelector('.reset-button');
const historyButton = document.querySelector('.history-button');
const colorSchemeButton = document.querySelector('.color-scheme-switch');
const notificationElement = document.querySelector('.notification');
const overlay = document.querySelector('.overlay');
const overlayHeadline = document.querySelector('.overlay-headline');
const overlayContent = document.querySelector('.overlay-content');
const closeOverlayButton = document.querySelector('.close-overlay-button');

const resolutionXGeneratedInput = document.querySelector(
    '.resolution-x-generated'
);
const resolutionYGeneratedInput = document.querySelector(
    '.resolution-y-generated'
);
const DEFAULT_WIDTH = 1920;
const DEFAULT_HEIGHT = 1080;
const COLOR_SCHEME_MAP = {
    dark: {
        name: 'dark',
        className: 'color-scheme-dark',
    },
    light: {
        name: 'light',
        className: 'color-scheme-light',
    },
};
const DEFAULT_COLOR_SCHEME = COLOR_SCHEME_MAP.dark.name;
const NOTIFICATION_SHOW_TIME = 2000;
const RESOLUTION_PERSIS_TIME = 2000;
let notificationTimeout = null;
let inputResolutionChangeTimeout = null;

const StorageProvider = {
    get: (key) => window.localStorage.getItem(key),
    set: (key, value) => window.localStorage.setItem(key, value),
};

const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b));

const updateUI = (width, height, resolutionElement, aspectRatioElement) => {
    const aspectRatio = (width / height).toFixed(3);
    const imageGcd = gcd(width, height);
    const minWidth = Number(width / imageGcd);
    const minHeight = Number(height / imageGcd);

    const minAspectRatio = `${Number(aspectRatio)}:1`;
    const prettyAspectRatio =
        minWidth !== width && minHeight !== height
            ? `(${minWidth}:${minHeight})`
            : '';

    resolutionElement.textContent = `${width} x ${height}`;
    aspectRatioElement.textContent = `${minAspectRatio} ${prettyAspectRatio}`;
    aspectRatioElement.dataset.aspectRatio = minAspectRatio;

    resolutionXGeneratedInput.value = '';
    resolutionYGeneratedInput.value = '';
};

const loadResolutionHistory = () => {
    const historyString = StorageProvider.get('ARC:resolutionHistory');
    if (!historyString) {
        return [];
    }

    try {
        const history = JSON.parse(historyString);
        return history;
    } catch (e) {
        console.log(e);
        return [];
    }
};

const addResolutionToHistory = (width, height) => {
    const history = loadResolutionHistory();
    const entry = { width, height, key: width + 'x' + height };
    StorageProvider.set(
        'ARC:resolutionHistory',
        JSON.stringify([
            entry,
            ...history.filter((item) => item.key !== entry.key),
        ])
    );
};

const init = () => {
    resolutionXInput.value = DEFAULT_WIDTH;
    resolutionYInput.value = DEFAULT_HEIGHT;

    updateUI(
        Number(resolutionXInput.value),
        Number(resolutionYInput.value),
        imageResolution,
        imageAspectRatio
    );

    resolutionXInput.focus();
};

const getCurrentColorSchemeMode = () =>
    StorageProvider.get('ARC:colorSchmeMode') || DEFAULT_COLOR_SCHEME;

const setCurrentColorSchemeMode = (value) => {
    StorageProvider.set('ARC:colorSchmeMode', value);
    root.classList.remove(
        ...[COLOR_SCHEME_MAP.dark.className, COLOR_SCHEME_MAP.light.className]
    );
    root.classList.add(
        getCurrentColorSchemeMode() === COLOR_SCHEME_MAP.dark.name
            ? COLOR_SCHEME_MAP.dark.className
            : COLOR_SCHEME_MAP.light.className
    );
};

const copyToClipboard = (value) => {
    navigator.clipboard.writeText(value).then(() => {
        notificationElement.textContent = `Copied "${value}" to clipboard!`;
        notificationElement.classList.remove('hide');
        notificationElement.classList.add('show');

        if (notificationTimeout) clearTimeout(notificationTimeout);

        notificationTimeout = setTimeout(() => {
            notificationElement.classList.remove('show');
            notificationElement.classList.add('hide');
            notificationTimeout = null;
        }, NOTIFICATION_SHOW_TIME);
    });
};

setCurrentColorSchemeMode(getCurrentColorSchemeMode());

colorSchemeButton.addEventListener('click', () => {
    const currentScheme = getCurrentColorSchemeMode();
    setCurrentColorSchemeMode(
        currentScheme === COLOR_SCHEME_MAP.dark.name
            ? COLOR_SCHEME_MAP.light.name
            : COLOR_SCHEME_MAP.dark.name
    );
});

resolutionXInput.addEventListener('input', (e) => {
    const value = e.target.value;
    const width = Number(value);
    const height = Number(resolutionYInput.value);
    updateUI(width, height, imageResolution, imageAspectRatio);
    clearTimeout(inputResolutionChangeTimeout);
    inputResolutionChangeTimeout = setTimeout(() => {
        console.log(
            Number(resolutionXInput.value),
            Number(resolutionYInput.value)
        );
        addResolutionToHistory(width, height);
    }, RESOLUTION_PERSIS_TIME);
});

resolutionYInput.addEventListener('input', (e) => {
    const value = e.target.value;
    const height = Number(value);
    const width = Number(resolutionXInput.value);
    updateUI(width, height, imageResolution, imageAspectRatio);
    clearTimeout(inputResolutionChangeTimeout);
    inputResolutionChangeTimeout = setTimeout(() => {
        console.log(
            Number(resolutionXInput.value),
            Number(resolutionYInput.value)
        );
        addResolutionToHistory(width, height);
    }, RESOLUTION_PERSIS_TIME);
});

[
    resolutionXInput,
    resolutionYInput,
    resolutionXGeneratedInput,
    resolutionYGeneratedInput,
].map((element) => element.addEventListener('focus', (e) => e.target.select()));

const getAspectRatio = (aspectRatio) => aspectRatio.split(':').map(Number);

const getYValue = (x, aspectRatio) => {
    const [xRatio, yRatio] = getAspectRatio(aspectRatio);
    return Math.round((x * yRatio) / xRatio);
};

const getXValue = (y, aspectRatio) => {
    const [xRatio, yRatio] = getAspectRatio(aspectRatio);
    console.log(xRatio, yRatio);
    return Math.round((y * xRatio) / yRatio);
};

resolutionXGeneratedInput.addEventListener('input', (e) => {
    resolutionYGeneratedInput.value = getYValue(
        e.target.value,
        imageAspectRatio.dataset.aspectRatio
    );
});

resolutionYGeneratedInput.addEventListener('input', (e) => {
    resolutionXGeneratedInput.value = getXValue(
        e.target.value,
        imageAspectRatio.dataset.aspectRatio
    );
});

resetButton.addEventListener('click', () => init());

overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
        overlay.classList.add('hide');
    }
});

historyButton.addEventListener('click', () => {
    const history = loadResolutionHistory();
    overlay.classList.remove('hide');
    const historyList = document.createElement('ul');
    historyList.classList.add('history-list');
    history.forEach((entry) => {
        const li = document.createElement('li');
        li.textContent = `${entry.width} x ${entry.height}`;
        li.addEventListener('click', () => {
            resolutionXInput.value = entry.width;
            resolutionYInput.value = entry.height;
            updateUI(
                entry.width,
                entry.height,
                imageResolution,
                imageAspectRatio
            );
            overlay.classList.add('hide');
        });
        historyList.appendChild(li);
    });
    overlayContent.replaceChildren(historyList);
});

closeOverlayButton.addEventListener('click', () =>
    overlay.classList.add('hide')
);

imageResolution.addEventListener('click', (e) => {
    copyToClipboard(e.target.textContent);
});

imageAspectRatio.addEventListener('click', (e) => {
    copyToClipboard(e.target.dataset.aspectRatio);
});

init();
