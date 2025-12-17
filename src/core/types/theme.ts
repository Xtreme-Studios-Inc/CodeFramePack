export const rgb = (r: number, g: number, b: number) =>
  `\x1b[38;2;${r};${g};${b}m`;

export const MAGENTA = rgb(205, 0, 205);
export const GREEN = rgb(0, 205, 0);
export const DARK_GREEN = rgb(0, 130, 0);

export const BOLD = "\x1b[1m";
export const RESET = "\x1b[0m";
