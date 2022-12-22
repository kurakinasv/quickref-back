/**
 * Returns true when string is valid to save on db
 * @param {string} value
 * @returns {boolean}
 */
const checkNotNullStringValue = (value) => {
    const trimmedValue = value ? value.trim() : value;
    return value === undefined || (typeof value === 'string' && trimmedValue !== '');
};

const checkNotNullStringValueOnCreate = (value) => {
    const trimmedValue = value ? value.trim() : value;
    return value && typeof value === 'string' && trimmedValue !== '';
};

const checkStringValue = (value) => {
    return value === undefined || typeof value === 'string';
};

const returnTrimOrNull = (value) => {
    const trimmed = String(value).trim();
    return trimmed ? trimmed : null;
};

const isIdTypeValid = (id) => {
    return typeof id === 'number' || typeof id === 'string' || id === undefined;
};

const isNotNullIdTypeValid = (id) => {
    return id && (typeof id === 'number' || typeof id === 'string');
};

module.exports = {
    checkNotNullStringValue,
    checkStringValue,
    returnTrimOrNull,
    isIdTypeValid,
    isNotNullIdTypeValid,
    checkNotNullStringValueOnCreate,
};
