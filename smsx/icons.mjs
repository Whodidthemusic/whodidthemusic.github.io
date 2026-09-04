const paths={
  discover:'<circle cx="12" cy="12" r="9"/><path d="m16 8-2.5 5.5L8 16l2.5-5.5Z"/>',
  markets:'<path d="m3 17 6-7 4 4 8-10M15 4h6v6"/>',
  events:'<path d="M4 5h16v5a2 2 0 0 0 0 4v5H4v-5a2 2 0 0 0 0-4Z"/><path d="m12 8 1.2 2.4 2.6.4-1.9 1.8.5 2.6-2.4-1.2-2.4 1.2.5-2.6-1.9-1.8 2.6-.4Z"/>',
  challenges:'<path d="M8 3h8v8a4 4 0 0 1-8 0ZM8 5H4v4a4 4 0 0 0 4 4m8-8h4v4a4 4 0 0 1-4 4M12 15v5m-5 1h10"/>',
  city:'<path d="M3 21h18M5 21V9l5-3v15m0-15V3l6 3v15m0-10 4 2v8M7 11v1m0 3v1m6-8v1m0 3v1m0 3v1"/>',
  portfolio:'<path d="M11 3a9 9 0 1 0 10 10H11Z"/><path d="M15 3v6h6a8 8 0 0 0-6-6Z"/>',
  search:'<circle cx="10" cy="10" r="7"/><path d="m15 15 6 6"/>',
  arrow:'<path d="M4 12h16m-6-6 6 6-6 6"/>',
  close:'<path d="m6 6 12 12M18 6 6 18"/>',
  star:'<path d="m12 3 2.8 5.7 6.3.9-4.6 4.5 1.1 6.3-5.6-3-5.6 3 1.1-6.3L3 9.6l6.3-.9Z"/>',
  volume:'<path d="M4 21V12h4v9m3 0V7h4v14m3 0V3h4v18"/>',
  check:'<path d="m5 12 4 4L19 6"/>',
  swap:'<path d="M4 7h15m-4-4 4 4-4 4M20 17H5m4-4-4 4 4 4"/>',
  reset:'<path d="M4 10a8 8 0 1 1 1 8M4 4v6h6"/>',
  expand:'<path d="M14 3h7v7m0-7-8 8M3 14v7h7m-7 0 8-8"/>'
};
export function icon(name,cls=''){return '<svg class="icon '+cls+'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+(paths[name]||paths.markets)+'</svg>';}
