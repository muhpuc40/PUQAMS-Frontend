import $ from 'jquery';

// Summernote is a jQuery plugin and expects jQuery on `window`.
// Import this file BEFORE importing summernote.
const w = window as unknown as Record<string, unknown>;
w.$ = $;
w.jQuery = $;

export default $;
