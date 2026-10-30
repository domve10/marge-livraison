(function () {
  'use strict';

  // ---- Pure math (also usable from Node for tests) ----
  function calc(p) {
    // p: {price, food, pack, promo, vat, rate, target}  (percentages as numbers, e.g. 30)
    var paid = p.price * (1 - p.promo / 100);
    var vat = paid * p.vat / (100 + p.vat);
    var ht = paid - vat;
    var comm = paid * p.rate / 100;
    var net = ht - comm;
    var costs = p.food + p.pack;
    var margin = net - costs;
    var marginPct = net > 0 ? margin / net * 100 : NaN;
    var marginTtc = p.price > 0 ? margin / p.price * 100 : NaN;
    var foodPct = ht > 0 ? p.food / ht * 100 : NaN;
    var denom = (1 - p.target / 100) * (1 - p.promo / 100) * (1 / (1 + p.vat / 100) - p.rate / 100);
    var suggested = denom > 0 ? costs / denom : NaN;
    return { paid: paid, vat: vat, ht: ht, comm: comm, net: net, costs: costs, margin: margin,
      marginPct: marginPct, marginTtc: marginTtc, foodPct: foodPct, suggested: suggested };
  }
  if (typeof module !== 'undefined' && module.exports) { module.exports = { calc: calc }; }
  if (typeof document === 'undefined') return;

  // ---- i18n ----
  var T = {
    fr: {}, // French is the HTML default; captured at load
    en: {
      kicker: "Chef's notebook · Brussels",
      title: 'What is the real margin on your delivery dish?',
      lead: 'Enter the price shown on the app, your food cost and packaging: the tool works out VAT, commission, what you actually keep, and the app price you need to protect your margin.',
      h_dish: 'Your dish', l_name: 'Dish name', l_price: 'Selling price on the app (incl. VAT, €)',
      l_food: 'Food cost per portion (€)', l_pack: 'Packaging cost (€)', l_promo: 'Promo / discount you fund (%)',
      l_vat: 'VAT (%)', vat_note: '6%: Belgian rate for takeaway / delivered food (drinks excluded).',
      l_target: 'Target gross margin (%)', target_note: 'Typically 65–70% in restaurants.',
      h_platform: 'Platform',
      est_note: '⚠️ Deliveroo and Takeaway.com rates are estimates: these platforms negotiate restaurant by restaurant. Replace them with the rate in your contract.',
      h_result: 'Result for', r_paid: 'Price paid by customer (after promo)', r_vat: 'VAT to pay', r_ht: 'Price excl. VAT',
      r_comm: 'Platform commission', r_net: 'Net revenue (what you receive, excl. VAT)', r_costs: 'Food + packaging cost',
      r_margin: 'Gross margin', r_marginpct: 'Gross margin (% of net revenue)', r_marginttc: 'Gross margin (% of app price)',
      r_fc: 'Food cost (% of price excl. VAT)',
      h_compare: 'Same dish, platform by platform', c_platform: 'Platform', c_rate: 'Commission', c_comm: 'Commission €',
      c_net: 'Net revenue', c_margin: 'Margin €', c_pct: 'Margin %', c_sugg: 'Suggested price',
      c_note: '“Suggested price” = app price incl. VAT needed to reach your target gross margin.',
      h_how: 'How it is calculated',
      how: '<ul><li><b>Price paid</b> = app price × (1 − promo %).</li><li><b>VAT</b> = price paid × VAT / (100 + VAT). App prices include VAT.</li><li><b>Commission</b> = price paid × rate (platforms charge commission on the VAT-inclusive basket).</li><li><b>Net revenue</b> = price paid − VAT − commission.</li><li><b>Gross margin</b> = net revenue − food cost − packaging. As %: margin / net revenue.</li><li><b>Food cost %</b> = food cost / price excl. VAT.</li><li><b>Suggested price</b> = (food + packaging) / [(1 − target margin) × (1 − promo) × (1/(1+VAT) − commission)].</li><li>The 21% VAT charged on the commission is not counted: it is recoverable if you are VAT-registered. Any service, payment or marketing fees are not included.</li></ul>',
      footer: 'Free tool created by Domenico Vescera, chef',
      signup_label: 'A full version is coming (all your dishes, monthly tracking). Get notified:',
      signup_btn: 'Notify me', privacy: 'No tracking, no cookies. The button simply opens your email app.',
      disclaimer: 'Indicative estimates, not contractual. Check the rates in your contract.',
      sugg: 'To reach <b>{t} %</b> gross margin on {p}, display <b>{s}</b> on the app (currently {c}).',
      sugg_ok: 'You are already above your {t} % target. The minimum price for {t} % would be {s}.',
      impossible: 'Impossible to reach {t} % with this commission and VAT: commission eats the whole price.',
      est: 'estimate', custom: 'Custom %', direct: 'Direct sale / own website (reference)'
    },
    nl: {
      kicker: 'Notitieboek van de chef · Brussel',
      title: 'Wat is de echte marge van uw gerecht bij levering?',
      lead: 'Vul de prijs op de app, uw grondstofkost en verpakking in: de tool berekent btw, commissie, wat u echt overhoudt en de app-prijs om uw marge te behouden.',
      h_dish: 'Uw gerecht', l_name: 'Naam gerecht', l_price: 'Verkoopprijs op de app (incl. btw, €)',
      l_food: 'Grondstofkost per portie (€)', l_pack: 'Verpakkingskost (€)', l_promo: 'Promo / korting door u betaald (%)',
      l_vat: 'Btw (%)', vat_note: '6%: Belgisch tarief voor afhaal- / geleverde maaltijden (excl. dranken).',
      l_target: 'Beoogde brutomarge (%)', target_note: 'Meestal 65–70% in de horeca.',
      h_platform: 'Platform',
      est_note: '⚠️ De tarieven van Deliveroo en Takeaway.com zijn schattingen: deze platforms onderhandelen per restaurant. Vervang ze door het tarief uit uw contract.',
      h_result: 'Resultaat voor', r_paid: 'Prijs betaald door klant (na promo)', r_vat: 'Af te dragen btw', r_ht: 'Prijs excl. btw',
      r_comm: 'Platformcommissie', r_net: 'Netto-omzet (wat u ontvangt, excl. btw)', r_costs: 'Grondstof + verpakking',
      r_margin: 'Brutomarge', r_marginpct: 'Brutomarge (% van netto-omzet)', r_marginttc: 'Brutomarge (% van app-prijs)',
      r_fc: 'Food cost (% van prijs excl. btw)',
      h_compare: 'Hetzelfde gerecht, per platform', c_platform: 'Platform', c_rate: 'Commissie', c_comm: 'Commissie €',
      c_net: 'Netto-omzet', c_margin: 'Marge €', c_pct: 'Marge %', c_sugg: 'Aanbevolen prijs',
      c_note: '“Aanbevolen prijs” = app-prijs incl. btw om uw beoogde brutomarge te halen.',
      h_how: 'Hoe wordt het berekend',
      how: '<ul><li><b>Betaalde prijs</b> = app-prijs × (1 − promo %).</li><li><b>Btw</b> = betaalde prijs × btw / (100 + btw).</li><li><b>Commissie</b> = betaalde prijs × tarief (berekend op het bedrag incl. btw).</li><li><b>Netto-omzet</b> = betaalde prijs − btw − commissie.</li><li><b>Brutomarge</b> = netto-omzet − grondstof − verpakking. In %: marge / netto-omzet.</li><li><b>Food cost %</b> = grondstof / prijs excl. btw.</li><li><b>Aanbevolen prijs</b> = (grondstof + verpakking) / [(1 − doelmarge) × (1 − promo) × (1/(1+btw) − commissie)].</li><li>De 21% btw op de commissie is niet meegerekend: recupereerbaar als u btw-plichtig bent. Eventuele service-, betaal- of marketingkosten niet inbegrepen.</li></ul>',
      footer: 'Gratis tool gemaakt door Domenico Vescera, chef',
      signup_label: 'Een volledige versie komt eraan (al uw gerechten, maandelijkse opvolging). Op de hoogte blijven:',
      signup_btn: 'Hou me op de hoogte', privacy: 'Geen tracking, geen cookies. De knop opent gewoon uw e-mailapp.',
      disclaimer: 'Indicatieve schattingen, niet contractueel. Controleer de tarieven in uw contract.',
      sugg: 'Voor <b>{t} %</b> brutomarge op {p}: toon <b>{s}</b> op de app (nu {c}).',
      sugg_ok: 'U zit al boven uw doel van {t} %. De minimumprijs voor {t} % is {s}.',
      impossible: 'Onmogelijk om {t} % te halen met deze commissie en btw.',
      est: 'schatting', custom: 'Eigen %', direct: 'Directe verkoop / eigen website (referentie)'
    }
  };
  var FR_EXTRA = {
    sugg: 'Pour atteindre <b>{t} %</b> de marge brute sur {p}, affichez <b>{s}</b> sur l\'app (actuellement {c}).',
    sugg_ok: 'Vous êtes déjà au-dessus de votre objectif de {t} %. Le prix minimum pour {t} % serait {s}.',
    impossible: 'Impossible d\'atteindre {t} % avec cette commission et cette TVA : la commission absorbe tout le prix.',
    est: 'estimation', custom: '% personnalisé', direct: 'Vente directe / site propre (référence)'
  };

  var PLATFORMS = [
    { id: 'uber30', name: 'Uber Eats – livreur Uber', nameEn: 'Uber Eats – Uber courier', nameNl: 'Uber Eats – Uber-koerier', rate: 30 },
    { id: 'uber13', name: 'Uber Eats – votre livraison', nameEn: 'Uber Eats – own delivery', nameNl: 'Uber Eats – eigen levering', rate: 13 },
    { id: 'deliveroo', name: 'Deliveroo', rate: 30, est: true },
    { id: 'takeaway', name: 'Takeaway.com – votre livraison', nameEn: 'Takeaway.com – own delivery', nameNl: 'Takeaway.com – eigen levering', rate: 13, est: true },
    { id: 'custom', custom: true, rate: 20 }
  ];
  var lang = 'fr', selected = 'uber30';
  var $ = function (id) { return document.getElementById(id); };

  // capture French defaults
  document.querySelectorAll('[data-i18n]').forEach(function (el) { T.fr[el.getAttribute('data-i18n')] = el.textContent; });
  document.querySelectorAll('[data-i18n-html]').forEach(function (el) { T.fr[el.getAttribute('data-i18n-html')] = el.innerHTML; });
  Object.keys(FR_EXTRA).forEach(function (k) { T.fr[k] = FR_EXTRA[k]; });
  function t(k) { return (T[lang] && T[lang][k]) || T.fr[k] || k; }
  function pname(p) {
    if (p.custom) return t('custom');
    if (p.direct) return t('direct');
    return (lang === 'en' && p.nameEn) || (lang === 'nl' && p.nameNl) || p.name;
  }

  var fmtCache = {};
  function eur(v) {
    if (!isFinite(v)) return '—';
    var loc = lang === 'en' ? 'en-IE' : (lang === 'nl' ? 'nl-BE' : 'fr-BE');
    fmtCache[loc] = fmtCache[loc] || new Intl.NumberFormat(loc, { style: 'currency', currency: 'EUR' });
    return fmtCache[loc].format(v);
  }
  function pct(v) { return isFinite(v) ? v.toFixed(1).replace('.', lang === 'en' ? '.' : ',') + ' %' : '—'; }
  function num(id) { var v = parseFloat(String($(id).value).replace(',', '.')); return isFinite(v) && v >= 0 ? v : 0; }

  function buildPlatforms() {
    var box = $('platforms'); box.innerHTML = '';
    PLATFORMS.forEach(function (p) {
      var row = document.createElement('label');
      row.className = 'plat' + (p.id === selected ? ' sel' : '');
      row.innerHTML = '<input type="radio" name="plat" value="' + p.id + '"' + (p.id === selected ? ' checked' : '') + '>' +
        '<span>' + pname(p) + (p.est ? '<span class="est">' + t('est') + '</span>' : '') + '</span>' +
        '<span class="rate"><input type="number" inputmode="decimal" min="0" max="100" step="0.5" value="' + p.rate + '" data-rate="' + p.id + '" aria-label="%">%</span>';
      box.appendChild(row);
    });
    box.querySelectorAll('input[type=radio]').forEach(function (r) {
      r.addEventListener('change', function () { selected = r.value; buildPlatforms(); render(); });
    });
    box.querySelectorAll('input[data-rate]').forEach(function (inp) {
      inp.addEventListener('input', function () {
        var p = PLATFORMS.filter(function (x) { return x.id === inp.getAttribute('data-rate'); })[0];
        var v = parseFloat(inp.value.replace(',', '.')); p.rate = isFinite(v) && v >= 0 ? Math.min(v, 100) : 0; render();
      });
    });
  }

  function params(rate) {
    return { price: num('price'), food: num('food'), pack: num('pack'), promo: Math.min(num('promo'), 100),
      vat: num('vat'), target: Math.min(num('target'), 99), rate: rate };
  }

  function render() {
    var plat = PLATFORMS.filter(function (x) { return x.id === selected; })[0];
    var p = params(plat.rate), r = calc(p);
    $('r_name').textContent = $('name').value || '—';
    $('r_platform').textContent = pname(plat) + ' (' + plat.rate + ' %)';
    $('r_paid').textContent = eur(r.paid);
    $('r_vat').textContent = '− ' + eur(r.vat);
    $('r_ht').textContent = eur(r.ht);
    $('r_comm').textContent = '− ' + eur(r.comm);
    $('r_net').textContent = eur(r.net);
    $('r_costs').textContent = '− ' + eur(r.costs);
    $('r_margin').textContent = eur(r.margin);
    $('r_margin').classList.toggle('neg', r.margin < 0);
    $('r_marginpct').textContent = pct(r.marginPct);
    $('r_marginttc').textContent = pct(r.marginTtc);
    $('r_fc').textContent = pct(r.foodPct);
    var s;
    if (!isFinite(r.suggested)) s = t('impossible');
    else if (r.marginPct >= p.target) s = t('sugg_ok');
    else s = t('sugg');
    $('suggest').innerHTML = s.replace(/\{t\}/g, p.target).replace('{p}', pname(plat)).replace(/\{s\}/g, eur(r.suggested)).replace('{c}', eur(p.price));

    var tb = document.querySelector('#compare tbody'); tb.innerHTML = '';
    PLATFORMS.concat([{ id: 'direct', direct: true, rate: 0 }]).forEach(function (pl) {
      var c = calc(params(pl.rate));
      var tr = document.createElement('tr');
      if (pl.id === selected) tr.className = 'sel';
      tr.innerHTML = '<td>' + pname(pl) + (pl.est ? ' <span class="est">' + t('est') + '</span>' : '') + '</td><td>' + pl.rate + ' %</td><td>' + eur(c.comm) +
        '</td><td>' + eur(c.net) + '</td><td class="' + (c.margin < 0 ? 'neg' : '') + '">' + eur(c.margin) + '</td><td>' + pct(c.marginPct) +
        '</td><td>' + eur(c.suggested) + '</td>';
      tb.appendChild(tr);
    });
  }

  function setLang(l) {
    lang = l; document.documentElement.lang = l;
    document.querySelectorAll('[data-i18n]').forEach(function (el) { el.textContent = t(el.getAttribute('data-i18n')); });
    document.querySelectorAll('[data-i18n-html]').forEach(function (el) { el.innerHTML = t(el.getAttribute('data-i18n-html')); });
    document.querySelectorAll('.lang button').forEach(function (b) { b.classList.toggle('active', b.getAttribute('data-lang') === l); });
    buildPlatforms(); render();
  }

  document.querySelectorAll('.lang button').forEach(function (b) {
    b.addEventListener('click', function () { setLang(b.getAttribute('data-lang')); });
  });
  ['name', 'price', 'food', 'pack', 'promo', 'vat', 'target'].forEach(function (id) { $(id).addEventListener('input', render); });
  var start = (navigator.language || 'fr').slice(0, 2);
  setLang(T[start] && start !== 'fr' ? start : 'fr');
})();
