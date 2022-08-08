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
const colorSchemeButton = document.querySelector('.color-scheme-switch');
const notificationElement = document.querySelector('.notification');

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

let notificationTimeout = null;

const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b));

const isValidFile = (file) => file && file.type.startsWith('image/');

const showUI = (resolutionContainer, aspectRatioContainer) => {
    resolutionContainer.classList.remove('hidden');
    aspectRatioContainer.classList.remove('hidden');
};

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

const init = () => {
    resolutionXInput.value = DEFAULT_WIDTH;
    resolutionYInput.value = DEFAULT_HEIGHT;

    updateUI(
        Number(resolutionXInput.value),
        Number(resolutionYInput.value),
        imageResolution,
        imageAspectRatio
    );
    showUI(imageResolutionContainer, imageAspectRatioContainer);
};

const getCurrentColorSchemeMode = () =>
    window.localStorage.getItem('ARC:colorSchmeMode') || DEFAULT_COLOR_SCHEME;
const setCurrentColorSchemeMode = (value) => {
    window.localStorage.setItem('ARC:colorSchmeMode', value);
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
        }, 3000);
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
});

resolutionYInput.addEventListener('input', (e) => {
    const value = e.target.value;
    const height = Number(value);
    const width = Number(resolutionXInput.value);
    updateUI(width, height, imageResolution, imageAspectRatio);
});

resolutionXInput.addEventListener('focus', (e) => e.target.select());
resolutionYInput.addEventListener('focus', (e) => e.target.select());

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

imageResolution.addEventListener('click', (e) => {
    copyToClipboard(e.target.textContent);
});

imageAspectRatio.addEventListener('click', (e) => {
    copyToClipboard(e.target.dataset.aspectRatio);
});

init();
