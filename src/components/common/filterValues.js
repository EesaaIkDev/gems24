export const values = (value) => Array.isArray(value) ? value : value ? [value] : [];
export const selected = (value, option) => values(value).includes(option);
export const toggle = (value, option) => selected(value, option) ? values(value).filter((v) => v !== option) : [...values(value), option];
export const matches = (value, option) => !values(value).length || selected(value, option);