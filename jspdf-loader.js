// jsPDF loader for browser usage
// This file loads jsPDF from CDN and attaches it to window.jspdf
(function() {
  if (window.jspdf) return;
  var script = document.createElement('script');
  script.src = 'https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js';
  script.onload = function() {
    window.jspdf = window.jspdf || window.jspdfjs || window.jspdf_umd || window.jspdf_umd_min || window.jspdf_umd_min_js;
    if (!window.jspdf && window.jspdfjs) window.jspdf = window.jspdfjs;
    if (!window.jspdf && window.jspdf_umd) window.jspdf = window.jspdf_umd;
    if (!window.jspdf && window.jspdf_umd_min) window.jspdf = window.jspdf_umd_min;
    if (!window.jspdf && window.jspdf_umd_min_js) window.jspdf = window.jspdf_umd_min_js;
    if (!window.jspdf && window.jspdf && window.jspdf.jsPDF) window.jspdf = window.jspdf;
    if (!window.jspdf && window.jspdfjs && window.jspdfjs.jsPDF) window.jspdf = window.jspdfjs;
    if (!window.jspdf && window.jspdf_umd && window.jspdf_umd.jsPDF) window.jspdf = window.jspdf_umd;
  };
  document.head.appendChild(script);
})();
