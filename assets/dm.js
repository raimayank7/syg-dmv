/* DMV Practice: scored practice test. Data: /data/dmv.json {code: {n: name, q: [[question, [4 options], right index, explanation]]}} */
(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var box = $('dq'); if (!box) return;
  var sel = $('dq-s'), data = null, st, N = 20;
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  var best = function () { try { return JSON.parse(localStorage.getItem('dm-best') || '{}'); } catch (e) { return {}; } };
  var s0 = new URLSearchParams(location.search).get('s');
  if (s0 && [].some.call(sel.options, function (o) { return o.value === s0; })) sel.value = s0;
  function ask() {
    var q = st.qs[st.i];
    box.innerHTML = '<p class="dm-count">' + esc(st.name) + ' · question ' + (st.i + 1) + ' of ' + st.qs.length + ' · score ' + st.ok + '</p><h2 class="dm-qq">' + esc(q.q) + '</h2><div class="dm-opts">' +
      q.o.map(function (o, k) { return '<button type="button" class="dm-opt" data-k="' + k + '">' + esc(o) + '</button>'; }).join('') + '</div><div id="dq-fb"></div>';
    box.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }
  box.addEventListener('click', function (e) {
    var b = e.target.closest('.dm-opt'); if (!b || b.disabled) return;
    var q = st.qs[st.i], pick = q.o[+b.getAttribute('data-k')], right = pick === q.a;
    [].forEach.call(box.querySelectorAll('.dm-opt'), function (o) { o.disabled = true; if (o.textContent === q.a) o.classList.add('ok'); });
    if (right) st.ok++; else { b.classList.add('no'); st.miss.push(q); }
    $('dq-fb').innerHTML = '<p><b>' + (right ? 'Correct.' : 'Not quite. The answer is: ' + esc(q.a) + '.') + '</b> ' + esc(q.e) + '</p><p class="dm-cta"><button class="btn" type="button" id="dq-next">' + (st.i + 1 < st.qs.length ? 'Next question' : 'See my score') + '</button></p>';
    $('dq-next').focus();
    $('dq-next').addEventListener('click', function () { st.i++; if (st.i < st.qs.length) ask(); else done(); });
  });
  function done() {
    var b = best(), pct = Math.round(100 * st.ok / st.qs.length);
    if (!(b[st.code] >= st.ok)) { b[st.code] = st.ok; try { localStorage.setItem('dm-best', JSON.stringify(b)); } catch (e) { } }
    box.innerHTML = '<h2>' + esc(st.name) + ': ' + st.ok + ' out of ' + st.qs.length + '</h2><p class="big">' + pct + '%</p><p>' + (pct >= 90 ? 'A strong score. Take it again on another day to be sure it holds.' : pct >= 80 ? 'Good, but go over the ones you missed before the real test.' : 'Read the handbook sections for the questions below, then try again.') +
      ' Best so far on this device: ' + b[st.code] + ' out of ' + st.qs.length + '.</p>' +
      (st.miss.length ? '<h3>To go over</h3><ol class="dm-list">' + st.miss.map(function (q) { return '<li class="dm-q"><p><b>' + esc(q.q) + '</b></p><p>' + esc(q.a) + '. ' + esc(q.e) + '</p></li>'; }).join('') + '</ol>' : '') +
      '<p class="dm-cta"><button class="btn" type="button" id="dq-again">Another test</button> <a class="btn ghost" href="/' + st.code + '/questions/">All ' + esc(st.name) + ' questions</a></p>';
    $('dq-again').addEventListener('click', start); $('dq-set').hidden = false;
  }
  function start() {
    var go = function () {
      var s = data[sel.value];
      st = { code: sel.value, name: s.n, i: 0, ok: 0, miss: [], qs: shuffle(s.q).slice(0, N).map(function (r) { return { q: r[0], o: shuffle(r[1]), a: r[1][r[2]], e: r[3] }; }) };
      box.hidden = false; $('dq-set').hidden = true; ask();
    };
    if (data) return go();
    fetch('/data/dmv.json').then(function (r) { return r.json(); }).then(function (d) { data = d; go(); }).catch(function () { box.hidden = false; box.innerHTML = '<p>The questions could not be loaded. Check your connection and try again.</p>'; });
  }
  $('dq-go').addEventListener('click', start);
})();
