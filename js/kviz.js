/* ============================================================
   Prosanjane jeseni — kviz.js
   Kviz od 12 pitanja: jedno pitanje po zaslonu, jedan tačan
   odgovor po pitanju, rezultat i pregled na kraju.
   Bez backend-a — sve radi u pregledniku.
   ============================================================ */
(function () {
  'use strict';

  /* 1. PITANJA (12: 10 pitanja 3. grupe + 2 dopunska) -------- */
  const QUESTIONS = [
    {
      q: 'Kako se razlikovao pogled na život bosanskog čovjeka nekada i danas?',
      options: [
        'Nekada je čovjek bio vezan za porodicu, tradiciju, vjeru i mišljenje sredine i živio je u teškom radu i siromaštvu, a danas su odnosi otvoreniji i pojedinac ima više slobode.',
        'Nekada je čovjek imao više slobode i mogućnosti, a danas je više vezan za tradiciju i mišljenje sredine.',
        'Pogled na život se nije mijenjao — sve je ostalo isto kao u vrijeme radnje djela.',
        'Nekada je čovjek živio samo za sebe, a danas živi samo za porodicu.'
      ],
      correct: 0
    },
    {
      q: 'Koje su se vrijednosti bosanskog čovjeka, uprkos promjenama kroz vrijeme, zadržale do danas?',
      options: [
        'Porodica, ljubav i briga za najbliže.',
        'Strogo patrijarhalno kažnjavanje djece.',
        'Zabrana da žena izađe iz kuće bez vale.',
        'Siromaštvo i odsustvo obrazovanja.'
      ],
      correct: 0
    },
    {
      q: 'Svojim riječima objasniti šta su toksični odnosi među ljudima.',
      options: [
        'Odnosi koji negativno utiču na naše raspoloženje, samopouzdanje i osjećaj sigurnosti.',
        'Odnosi u kojima se ljudi druže i pomažu jedni drugima.',
        'Odnosi koji su napeti samo u vrijeme velikih nesreća i bolesti.',
        'Odnosi koji postoje isključivo među nepoznatim ljudima.'
      ],
      correct: 0
    },
    {
      q: 'Kako prepoznati toksični odnos?',
      options: [
        'Po svađama, vrijeđanju, omalovažavanju, ljubomori, manipulaciji i nepoštovanju tuđih granica.',
        'Po redovnom razgovoru i poštovanju tuđeg mišljenja.',
        'Po tome što se dva čovjeka nikada ne svađaju.',
        'Po zajedničkom radu i povjerenju među ljudima.'
      ],
      correct: 0
    },
    {
      q: 'U kojim pripovijetkama pisac govori o majci?',
      options: [
        '„Majka“, „Tifanova pobuna“ i „Prvi nemiri“.',
        '„Mašo cjepar“, „Naza vezilja“ i „Blago u Duvaru“.',
        '„Studeni putevi Mešana Ćore“ i „Bajko u praznom hanu“.',
        'Samo u pripovijetki „Tifanova pobuna“.'
      ],
      correct: 0
    },
    {
      q: 'Na koji način pisac govori o majci? (neki primjer)',
      options: [
        'Kroz kratke opise i pojedinosti — npr. „napaćeno mršavo lice, noge u papučama, izblijedjele dimije i blag predan pogled“ (str. 44).',
        'Kroz duge dijaloge u kojima majka sama objašnjava svoj život i mladost.',
        'Tako što o majci govore samo drugi likovi, a pisac je nikada ne opisuje.',
        'Tako što majku prikazuje kao bogatu i moćnu ženu koja odlučuje o svemu.'
      ],
      correct: 0
    },
    {
      q: 'Kako pisac predstavlja siromašne, a kako moćne ljude?',
      options: [
        'Siromašne opisuje s razumijevanjem, kao ljude s imenom, licem i bolom, a moćne kroz grubost prema onima koji o njima ovise.',
        'Sve ljude opisuje jednako — nema nikakve razlike između siromašnih i moćnih.',
        'Siromašne prikazuje kao krivce za vlastitu sudbinu, a moćne kao spasioce naroda.',
        'Moćne prikazuje samo u pripovijetki „Majka“, a siromašne u svim ostalim pripovijetkama.'
      ],
      correct: 0
    },
    {
      q: 'Kakav je prosječan čovjek u Dizdarevićevoj slici?',
      options: [
        'Siromašan, često usamljen i ponižen; njegova sudbina povezana je sa sudbinom cijele sredine.',
        'Bogat i moćan, ali nesretan u vlastitoj porodici.',
        'Snalažljiv i uvijek spreman da se pobuni protiv sredine.',
        'Ravnodušan prema svemu i bez ikakvih osjećaja prema drugima.'
      ],
      correct: 0
    },
    {
      q: 'Kako se kroz likove sestara i majki prikazuje žrtvovanje žene za porodicu?',
      options: [
        'Žena je vezana za kuću i djecu, svoj život troši na trud i brigu, a njena vrijednost se procjenjuje po tome koliko je dobra supruga i majka.',
        'Žena u djelu odlučuje o imovini i o svemu u kući.',
        'Žene u djelu uglavnom same zarađuju i izdržavaju cijelu porodicu.',
        'Žrtvovanje žene vidi se samo u jednoj pripovijetki i nije tipično za ovo djelo.'
      ],
      correct: 0
    },
    {
      q: 'Zašto možemo reći da se položaj žene u društvu mijenja kroz vrijeme, ali da posljedice patrijarhalnog društva i dalje postoje?',
      options: [
        'Danas se žene obrazuju, rade, glasaju i same odlučuju o svom životu, ali i dalje nose veliki dio brige o djeci i kući i suočavaju se s tradicionalnim predstavama o tome kakva žena treba biti.',
        'Zato što se od vremena radnje djela do danas u položaju žene ništa nije promijenilo.',
        'Zato što žene ni danas ne mogu ići u školu ni raditi izvan kuće.',
        'Zato što se patrijarhalna pravila danas nikada ne primjenjuju ni u porodici ni u društvu.'
      ],
      correct: 0
    },
    {
      q: 'Kakav je odnos pripovjedača i njegovog oca u pripovijetki „Majka“?',
      options: [
        'Odnos je pun povjerenja i razgovora — otac i sin sve odluke donose zajedno.',
        'Pun je straha i distance: otac je strog autoritet koji djecu kažnjava batinama, a majka sina uči da oca ipak posluša („Svoj je otac, kad malo i udari, poljubi ga u ruku, pa klanjaj, sinko“, str. 44).',
        'Odnos je ravnodušan — otac sina ne primjećuje, a sin o ocu ne zna ništa.',
        'Odnos je prijateljski — otac se s djecom igra i nikada ih ne kažnjava.'
      ],
      correct: 1
    },
    {
      q: 'Koju je tradicionalnu odjeću nosila majka u kući i pri izlasku napolje?',
      options: [
        'U kući je nosila šal i kaput, a napolje je izlazila otkrivene glave.',
        'U kući je nosila dimije, a napolje je izlazila u evropskoj haljini i šeširu.',
        'U kući je nosila izblijedjele dimije i papuče, a pri rijetkim izlascima na ulicu pokrivala se širokim platnom — zarom (crnim velom) — i krila se od ljudi (str. 44–45).',
        'Odjeća se nije razlikovala — i u kući i na ulici nosila je isto.'
      ],
      correct: 2
    }
  ];

  /* 2. MIJEŠANJE ODGOVORA ----------------------------------- */
  /* Fisher–Yates: ponuđeni odgovori se miješaju pri svakom
     pokretanju kviza, pa tačan odgovor nije stalno na prvom
     mjestu (nekad je prvi, nekad drugi, treći ili četvrti). */
  function shuffleOptions() {
    QUESTIONS.forEach(function (item) {
      for (let i = item.options.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        const swap = item.options[i];
        item.options[i] = item.options[j];
        item.options[j] = swap;
        if (item.correct === i) item.correct = j;
        else if (item.correct === j) item.correct = i;
      }
    });
  }

  const doc = document;
  const $ = (sel, ctx) => (ctx || doc).querySelector(sel);
  const $$ = (sel, ctx) => Array.prototype.slice.call((ctx || doc).querySelectorAll(sel));

  function init() {
    const root = $('[data-quiz]');
    if (!root) return;

    const stage = $('[data-quiz-stage]', root);
    const stepEl = $('[data-quiz-step]', root);
    const scoreEl = $('[data-quiz-score]', root);
    const fill = $('[data-quiz-fill]', root);
    const nextBtn = $('[data-quiz-next]', root);
    const result = $('[data-quiz-result]');
    if (!stage || !nextBtn) return;

    shuffleOptions();        /* novi raspored odgovora pri svakom pokretanju */
    const total = QUESTIONS.length;
    const firstAnswer = [];  /* prvi odabrani odgovor (za pregled na kraju) */
    const firstTry = [];     /* true ako je prvi odabrani odgovor bio tačan */
    const solved = [];       /* true ako je trenutno odabran odgovor tačan */
    let index = 0;

    /* Rezultat broji odgovore koji su bili tačni iz prvog pokušaja,
       jer se do sljedećeg pitanja ne može preći bez tačnog odgovora. */
    function hits() {
      return firstTry.reduce(function (sum, ok) {
        return sum + (ok === true ? 1 : 0);
      }, 0);
    }

    function paintScore() {
      if (scoreEl) scoreEl.textContent = 'Tačno iz 1. pokušaja: ' + hits() + ' / ' + total;
    }

    function renderQuestion() {
      const item = QUESTIONS[index];

      stage.innerHTML =
        '<h2 class="quiz__question"><span class="quiz__num">' + (index + 1) + '.</span> ' + item.q + '</h2>' +
        '<ul class="quiz__options" data-quiz-options>' +
        item.options.map(function (text, i) {
          return '<li><label class="quiz__option">' +
            '<input type="radio" name="kviz-pitanje-' + (index + 1) + '" value="' + i + '">' +
            '<span>' + text + '</span>' +
            '</label></li>';
        }).join('') +
        '</ul>' +
        '<p class="quiz__feedback" data-quiz-feedback role="status" aria-live="polite"></p>';

      if (stepEl) stepEl.textContent = 'Pitanje ' + (index + 1) + ' / ' + total;
      if (fill) fill.style.width = (index / total * 100) + '%';
      nextBtn.disabled = true;
      nextBtn.textContent = index === total - 1 ? 'Završi kviz' : 'Sljedeće pitanje';

      const optionsList = $('[data-quiz-options]', stage);
      const feedback = $('[data-quiz-feedback]', stage);

      $$('input', stage).forEach(function (input) {
        input.addEventListener('change', function () {
          const choice = Number(input.value);
          const label = input.closest('.quiz__option');
          const ok = choice === item.correct;

          if (firstAnswer[index] === undefined) {
            firstAnswer[index] = choice;
            firstTry[index] = ok;
          }
          solved[index] = ok;

          $$('.quiz__option', stage).forEach(function (optionEl) {
            optionEl.classList.toggle('is-selected', !!$('input:checked', optionEl));
          });

          if (ok) {
            /* TAČNO → odgovor postaje zelen, zaključava se i prelazak je dozvoljen. */
            if (label) {
              label.classList.add('is-correct');
              label.classList.remove('is-wrong');
            }
            if (optionsList) optionsList.classList.add('is-locked');
            $$('input', stage).forEach(function (other) { other.disabled = true; });
            if (feedback) {
              feedback.className = 'quiz__feedback is-correct';
              feedback.textContent = 'Tačno! Odgovor je tačan — možeš preći na sljedeće pitanje.';
            }
            nextBtn.disabled = false;
          } else {
            /* NETAČNO → odgovor postaje crven i prelazak ostaje blokiran. */
            if (label) label.classList.add('is-wrong');
            if (feedback) {
              feedback.className = 'quiz__feedback is-wrong';
              feedback.textContent = 'Netačno — taj odgovor nije tačan. Pokušaj ponovo: na sljedeće pitanje možeš preći samo s tačnim odgovorom.';
            }
            nextBtn.disabled = true;
          }

          paintScore();
        });
      });
    }

    function reviewItem(item, i) {
      const ok = firstTry[i] === true;
      const chosen = firstAnswer[i] === undefined ? 'nije odabran' : item.options[firstAnswer[i]];
      const note = ok
        ? ' — tačno iz prvog pokušaja'
        : ' — tvoj prvi odgovor: ' + chosen;
      return '<li class="quiz__review-item ' + (ok ? 'is-correct' : 'is-wrong') + '">' +
        '<span class="quiz__review-mark" aria-hidden="true">' + (ok ? '✓' : '✗') + '</span>' +
        '<span><strong>' + (i + 1) + '. ' + item.q + '</strong>' +
        'Tačan odgovor: ' + item.options[item.correct] + note +
        '</span></li>';
    }

    function finish() {
      const score = hits();
      if (fill) fill.style.width = '100%';
      root.hidden = true;
      if (!result) return;

      const message = score === total
        ? 'Odlično — svi odgovori su bili tačni iz prvog pokušaja!'
        : score >= total * 0.7
          ? 'Vrlo dobro — gradivo je dobro savladano.'
          : score >= total * 0.5
            ? 'Solidno — vrijedi ponoviti nekoliko odgovora.'
            : 'Vrijedi ponoviti gradivo i pokušati ponovno.';

      result.innerHTML =
        '<p class="eyebrow eyebrow--bare">Kviz je završen</p>' +
        '<p class="quiz-result__score">' + score + ' / ' + total + '</p>' +
        '<p class="quiz-result__text">' + message + '</p>' +
        '<p class="quiz-result__note">Rezultat broji odgovore koji su bili tačni iz prvog pokušaja — na sljedeće pitanje se moglo preći samo s tačnim odgovorom.</p>' +
        '<ul class="quiz__review">' + QUESTIONS.map(reviewItem).join('') + '</ul>' +
        '<div class="btn-group">' +
        '<button class="btn btn--primary" type="button" data-quiz-restart>Ponovi kviz</button>' +
        '<a class="btn btn--outline" href="index.html#pitanja">Sva pitanja 3. grupe</a>' +
        '</div>';
      result.hidden = false;
      if (stepEl) stepEl.textContent = 'Kviz je završen';

      const restart = $('[data-quiz-restart]', result);
      if (restart) restart.addEventListener('click', startOver);
    }

    function startOver() {
      firstAnswer.length = 0;
      firstTry.length = 0;
      solved.length = 0;
      index = 0;
      if (result) {
        result.hidden = true;
        result.innerHTML = '';
      }
      root.hidden = false;
      shuffleOptions();      /* „Ponovi kviz“ daje novi raspored odgovora */
      paintScore();
      renderQuestion();
    }

    nextBtn.addEventListener('click', function () {
      /* dalje se ide samo ako je na pitanje odgovoreno tačno */
      if (solved[index] !== true) return;
      if (index === total - 1) {
        finish();
        return;
      }
      index += 1;
      renderQuestion();
    });

    paintScore();
    renderQuestion();
  }

  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', init);
  else init();
})();
