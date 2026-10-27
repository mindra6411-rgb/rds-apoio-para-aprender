// Ícones de traço próprio, sem dependência de fontes ou serviços externos.
const paths = {
  home: '<path d="m3 10 9-7 9 7v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 21v-7h6v7"/>',
  grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
  library: '<path d="M4 5h4v15H4zM10 4h4v16h-4zM16 6l3-.8L22 19l-3 .8z"/>',
  cards: '<rect x="4" y="4" width="13" height="16" rx="2"/><path d="M8 8h5M8 12h5M8 16h3M17 7h1a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-9"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4M17 3v4M3 10h18M7 14h2M12 14h2M17 14h.01M7 18h2M12 18h2"/>',
  note: '<path d="M5 3h10l4 4v14H5z"/><path d="M15 3v5h4M8 12h8M8 16h8"/>',
  code: '<path d="m8 8-4 4 4 4M16 8l4 4-4 4M14 4l-4 16"/>',
  heart: '<path d="M20.8 5.7a5.2 5.2 0 0 0-7.4 0L12 7.1l-1.4-1.4a5.2 5.2 0 0 0-7.4 7.4L12 22l8.8-8.9a5.2 5.2 0 0 0 0-7.4Z"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/>',
  settings: '<path d="M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Z"/><path d="M19 13.7v-3.4l-2-.5a7 7 0 0 0-.6-1.5l1-1.8L15 4.1l-1.8 1a7 7 0 0 0-1.5-.6l-.5-2H8.8l-.5 2a7 7 0 0 0-1.5.6l-1.8-1-2.4 2.4 1 1.8A7 7 0 0 0 3 9.8l-2 .5v3.4l2 .5a7 7 0 0 0 .6 1.5l-1 1.8L5 19.9l1.8-1a7 7 0 0 0 1.5.6l.5 2h2.4l.5-2a7 7 0 0 0 1.5-.6l1.8 1 2.4-2.4-1-1.8a7 7 0 0 0 .6-1.5z" transform="translate(2 0) scale(.86 1)"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 4 4"/>',
  arrow: '<path d="M5 12h14M14 7l5 5-5 5"/>',
  arrowUp: '<path d="M7 17 17 7M8 7h9v9"/>',
  chevronLeft: '<path d="m14 6-6 6 6 6"/>',
  chevronRight: '<path d="m10 6 6 6-6 6"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  close: '<path d="m6 6 12 12M18 6 6 18"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  spark: '<path d="m12 2 1.7 6.3L20 10l-6.3 1.7L12 18l-1.7-6.3L4 10l6.3-1.7zM19 16l.7 2.3L22 19l-2.3.7L19 22l-.7-2.3L16 19l2.3-.7z"/>',
  moon: '<path d="M20 15.5A8.5 8.5 0 0 1 8.5 4 8.5 8.5 0 1 0 20 15.5Z"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.65 17.65l1.42 1.42M2 12h2M20 12h2M4.93 19.07l1.42-1.42M17.65 6.35l1.42-1.42"/>',
  list: '<path d="M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01"/>',
  download: '<path d="M12 3v12M8 11l4 4 4-4M4 17v3h16v-3"/>',
  edit: '<path d="m4 16 11-11 4 4L8 20H4zM13 7l4 4"/>',
  trash: '<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v5M14 11v5"/>',
  book: '<path d="M12 6c-2-2-5-2-8-1v14c3-1 6-1 8 1 2-2 5-2 8-1V5c-3-1-6-1-8 1zM12 6v14"/>',
  layers: '<path d="m12 3 9 5-9 5-9-5zM3 12l9 5 9-5M3 16l9 5 9-5"/>',
  target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
  link: '<path d="M10 13a4 4 0 0 0 5.7 0l2.6-2.6a4 4 0 1 0-5.7-5.7l-1.5 1.5M14 11a4 4 0 0 0-5.7 0l-2.6 2.6a4 4 0 0 0 5.7 5.7l1.5-1.5"/>',
  calculator: '<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M8 7h8M8 11h.01M12 11h.01M16 11h.01M8 15h.01M12 15h.01M16 15v2M8 18h.01M12 18h.01"/>',
  users: '<path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M10 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM17 4a4 4 0 0 1 0 7M20 21v-2a4 4 0 0 0-3-3.9"/>',
  chart: '<path d="M4 20h16M7 17v-5M12 17V7M17 17V4"/>',
  megaphone: '<path d="M4 10v4h4l9 4V6L8 10zM8 14l1 5h3l-1-4M20 9v6"/>',
};

export function icon(name, className = '') {
  const path = paths[name] || paths.spark;
  return `<svg class="icon ${className}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${path}</svg>`;
}
