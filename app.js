const root = document.querySelector(':root');
const dropZone = document.querySelector('.drop-zone-text');
const dropZoneText = document.querySelector('.drop-zone-text');
const imageCanvas = document.querySelector('.image-canvas');
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
const fileUploadInput = document.querySelector('.file-upload-input');
const colorSchemeButton = document.querySelector('.color-scheme-switch');

const DEFAULT_WIDTH = 1920;
const DEFAULT_HEIGHT = 1080;
const DEFAULT_COLOR_SCHEME = 'dark';

const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b));

const isValidFile = (file) => file && file.type.startsWith('image/');

const readImageFile = (file) =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.addEventListener('load', () => resolve(reader.result), false);
        reader.addEventListener(
            'error',
            () => {
                reject(reader.error);
                reader.abort();
            },
            false
        );

        reader.readAsDataURL(file);
    });

const loadImage = (data) =>
    new Promise((resolve, reject) => {
        const image = new Image();
        image.crossOrigin = 'Anonymous';
        image.src = data;
        image.onload = () => resolve(image);
        image.onerror = (e) => reject(e);
    });

const drawImage = (image, canvas) => {
    const ctx = canvas.getContext('2d');
    const width = image.width;
    const height = image.height;
    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(image, 0, 0);

    canvas.classList.remove('hidden');
};

const showUI = (resolutionContainer, aspectRatioContainer) => {
    resolutionContainer.classList.remove('hidden');
    aspectRatioContainer.classList.remove('hidden');
};

const updateUI = (width, height, resolutionElement, aspectRatioElement) => {
    const aspectRatio = (width / height).toFixed(2);
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
};

const processFiles = async (files) => {
    for (const file of files) {
        if (isValidFile(file)) {
            const imageData = await readImageFile(file);
            const image = await loadImage(imageData);

            dropZoneText.classList.add('hidden');
            drawImage(image, imageCanvas);
            updateUI(
                image.width,
                image.height,
                imageResolution,
                imageAspectRatio
            );
            showUI(imageResolutionContainer, imageAspectRatioContainer);
        }
    }
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
    dropZoneText.classList.remove('hidden');
    imageCanvas.classList.add('hidden');
};

const getCurrentColorSchemeMode = () =>
    window.localStorage.getItem('ARC:colorSchmeMode') || DEFAULT_COLOR_SCHEME;
const setCurrentColorSchemeMode = (value) => {
    window.localStorage.setItem('ARC:colorSchmeMode', value);
    root.classList.remove(...['color-scheme-dark', 'color-scheme-light']);
    root.classList.add(
        getCurrentColorSchemeMode() === 'dark'
            ? 'color-scheme-dark'
            : 'color-scheme-light'
    );
};

setCurrentColorSchemeMode(getCurrentColorSchemeMode());

colorSchemeButton.addEventListener('click', () => {
    console.log('click', getCurrentColorSchemeMode());
    const currentScheme = getCurrentColorSchemeMode();
    setCurrentColorSchemeMode(currentScheme === 'dark' ? 'light' : 'dark');
});

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    dropZoneText.classList.remove('file-hover');
    processFiles(files);
});
dropZone.addEventListener('dragenter', (e) => {
    e.preventDefault();
    dropZoneText.classList.add('file-hover');
});
dropZone.addEventListener('dragover', (e) => e.preventDefault());
dropZone.addEventListener('dragleave', (e) => {
    e.preventDefault();
    dropZoneText.classList.remove('file-hover');
});

fileUploadInput.addEventListener('change', (e) => {
    e.preventDefault();
    processFiles(e.target.files);
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

resetButton.addEventListener('click', () => init());

init();
