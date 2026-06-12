const guiColors = {
    // Primary accent color uses a CSS variable so it can be set at runtime
    'looks-secondary': 'var(--tw-custom-accent, #00cc99)',
    // Transparent/derived variants fall back to reasonable defaults
    'looks-transparent': 'var(--tw-custom-accent-transparent, rgba(0,204,153,0.35))',
    'looks-light-transparent': 'var(--tw-custom-accent-light-transparent, rgba(0,204,153,0.15))',
    'looks-secondary-dark': 'var(--tw-custom-accent-dark, #009973)'
};

const blockColors = {};

export {
    guiColors,
    blockColors
};
