// First Click: reads the cta_text flag for this visitor and applies it to the main call to action.
// Usage: <a data-first-click href="...">Contact us</a> <script src="first-click.js" defer></script>
(function () {
  var ENV_KEY = 'cEah9PMHR4vhyqmBX4o9FJ'; // client-side environment key (public by design)
  var API = 'https://edge.api.flagsmith.com/api/v1/identities/?identifier=';
  var el = document.querySelector('[data-first-click]');
  if (!el) return;
  var id = localStorage.getItem('fc_visitor');
  if (!id) {
    id = 'v-' + (crypto.randomUUID ? crypto.randomUUID() : String(Math.random()).slice(2));
    localStorage.setItem('fc_visitor', id);
  }
  // On any failure the control text already in the HTML stays: the page never breaks.
  fetch(API + encodeURIComponent(id), { headers: { 'X-Environment-Key': ENV_KEY } })
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (d) {
      var f = d && (d.flags || []).find(function (x) { return x.feature.name === 'cta_text'; });
      if (f && f.enabled && f.feature_state_value) {
        el.textContent = f.feature_state_value;
        el.dataset.variant = f.feature_state_value;
      }
    })
    .catch(function () {});
})();
