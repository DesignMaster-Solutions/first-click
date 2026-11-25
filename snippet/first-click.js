// First Click: applies the cta_text experiment flag to the main call to action and tracks cta_click.
// Usage: <a data-first-click href="...">Contact us</a> <script src="first-click.js" defer></script>
(function () {
  var ENV_KEY = 'cEah9PMHR4vhyqmBX4o9FJ'; // client-side environment key (public by design)
  var SDK = 'https://cdn.jsdelivr.net/npm/@flagsmith/flagsmith@12.6.0/index.js';
  var el = document.querySelector('[data-first-click]');
  if (!el) return;
  var id = localStorage.getItem('fc_visitor');
  if (!id) {
    id = 'v-' + (crypto.randomUUID ? crypto.randomUUID() : String(Math.random()).slice(2));
    localStorage.setItem('fc_visitor', id);
  }
  var s = document.createElement('script');
  s.src = SDK;
  s.onload = function () {
    var fs = window.flagsmith;
    // On any failure the control text already in the HTML stays: the page never breaks.
    fs.init({ environmentID: ENV_KEY, enableEvents: true })
      .then(function () { return fs.identify(id); })
      .then(function () {
        var f = fs.getExperimentFlag('cta_text'); // records the exposure
        if (f && f.enabled && f.value) {
          el.textContent = f.value;
          el.dataset.variant = f.value;
        }
        var sent = false;
        el.addEventListener('click', function () {
          if (sent) return; // first click of the visit only
          sent = true;
          fs.trackEvent('cta_click');
          fs.flushEvents(); // the click may navigate away before the timer fires
        });
      })
      .catch(function () {});
  };
  document.head.appendChild(s);
})();
