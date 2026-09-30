# SADRZAJ.md — vodič za unos sadržaja

Sve što treba zamijeniti nalazi se u HTML stranicama i **vidljivo je u pregledniku**:

- **isprekidani okvir** (`class="slot"`) — duži tekst: uvod, odgovor, opis, analiza;
- **mala traka s tekstom** (`data-todo="…"`) — kratak tekst: citat, osobina, podatak, naslov;
- **kartica materijala s natpisom „Dodaj link“** (`data-link-todo="…"`) — link koji još ne postoji;
- **zamjenske ilustracije** u `images/*.svg` — zamjenjuju se fotografijama pod istim imenom.

Ukupno čeka unos: **3 kratka teksta** (izvori u `materijali.html`) i **6 linkova** — PDF djela
(Archive.org) i audio knjiga (YouTube) su već povezani, pa se ne broje.

- Popis svih oznaka: `node tools/list-todos.js`
- Provjera da ništa nije ostalo: `node tools/check-links.js`, `node tools/render-check.js`
- Ime autora (ako treba promjena, u svim padežima): `node tools/set-author.js "Zija Dizdarević"`
- Potpis u podnožju (`© … **Arslan Nanić** · Rad 3. grupe · Školska lektira`) nalazi se na svih
  9 stranica; mijenja se na svima odjednom (predložak je i u `tools/apply-shell.js`).

---

## 1. Kako zamijeniti tekst

**Kratak tekst** — obrišite `data-todo` i upišite sadržaj između oznaka:

```html
<!-- prije -->
<p class="todo" data-todo="Ključni zaključak grupe."></p>

<!-- poslije -->
<p>Majka u djelu nikada ne odlučuje sama o imovini, ali ona je ta koja održava kuću.</p>
```

**Duži tekst (okvir)** — zamijenite cijeli `div.slot` običnim odlomcima:

```html
<!-- prije -->
<div class="slot">
  <span class="slot__label">Uvod u pripremi</span>
  <p>Ovdje ide uvodni tekst grupe.</p>
</div>

<!-- poslije -->
<p>Radnja djela prati jednu porodicu …</p>
<p>Pitanje na koje odgovaramo jest …</p>
```

**Citat** — ostavite citat točno kako stoji u djelu, a u potpis upišite poglavlje ili stranicu:

```html
<div class="quote quote--accent">
  <blockquote>„… tekst citata …“</blockquote>
  <span class="quote__cite">Poglavlje 4, str. 52</span>
</div>
```

**Link** — zamijenite `href="#"` stvarnim linkom i obrišite `resource--pending` da kartica dobije puni izgled:

```html
<article class="resource">                                   <!-- bez resource--pending -->
  …
  <a class="resource__link" href="https://…">Otvori PDF</a>   <!-- bez data-link-todo -->
</article>
```

---

## 2. Popis po stranicama

### index.html — početna
Nema mjesta za unos (nula oznaka): početna sadrži hero s naslovom djela i imenom autora (Zija Dizdarević),
kratki uvodni tekst 3. grupe, naslovnicu knjige, šest kartica s pitanjima i poziv na prvo pitanje.

Slike: `hero-jesen.svg`, `knjiga-zija.svg` (naslovnica), `jesen-lisce.svg`.

### pitanje1.html — Dizdarevićeva slika ljudi
Stranica sadrži **samo odgovor** (bez slika, kartica, TOC-a i animacija), u **tri sekcije**:
uvod · odgovor · zaključak.
Unutar sekcije „Odgovor“ podnaslovi su: citati iz djela · analiza i primjeri.

### pitanje2.html — Mentalitet bosanskog čovjeka nekad i sad
Tri sekcije: uvod · odgovor · zaključak.
Unutar sekcije „Odgovor“ podnaslovi su: nekad ↔ danas (čovjek nekad · čovjek danas) · citati iz djela ·
analiza i primjeri.

### pitanje3.html — Toksični odnosi među ljudima
Tri sekcije: uvod · odgovor · zaključak.
Unutar sekcije „Odgovor“ podnaslovi su: šta su toksični odnosi · toksični odnosi u pripovijetkama
(pet pripovijedaka) · primjeri iz djela · povezivanje s djelom.

### pitanje4.html — Kako Zija Dizdarević portretira majku
Jedna sekcija — **odgovor** (citati o majci iz pripovijedaka):
„Majka“ (str. 44, 45, 46) · „Tifanova pobuna“ (str. 50, 51) · „Prvi nemiri“ (str. 68).

### pitanje5.html — Majčin položaj u kući i društvu nekad i sad
Tri sekcije: uvod · odgovor · zaključak. Tekst je **doslovan prepis** korisničkog
radi (poruka od 30. 9., dio „a ovo u 6.”) — bez uredničkih dorada, zadržane su i
oznake „[?]” tamo gdje ih je autor stavio.

### pitanje6.html — Položaj žene nekad i sad
Tri sekcije: uvod · odgovor · zaključak. Tekst je **doslovan prepis** korisničkog
radi (ista poruka, dio „ovo stavi u 5.”) — zadržani originalni navodnici,
crtice, pravopis i oznake „[?]”; stih o „Mlad mjeseče” je u bloku citata.

### kviz.html — kviz od 12 pitanja
- pitanja i tačni odgovori nalaze se u `js/kviz.js` (12 pitanja: 10 pitanja 3. grupe + 2 dopunska o pripovijetki „Majka“)
- prikazuje **jedno pitanje po jedno**, dugme „Sljedeće pitanje“ / „Završi kviz“
- na kraju prikazuje rezultat (npr. „7 / 12“), kratku poruku i pregled svih odgovora
- ponuđeni odgovori se miješaju pri svakom pokretanju, pa tačan odgovor nije uvijek na prvom mjestu (i „Ponovi kviz“ ih miješa ponovo)
- dugme „Ponovi kviz“ vraća na prvo pitanje
- nema backend-a — sve radi u pregledniku

### materijali.html — materijali
- **već uneseno (2 linka):** PDF djela → `https://archive.org/details/dizdarevic-zija-prosanjanje-jeseni`
  (kartica „Prosanjane jeseni — PDF“) · audio knjiga → `https://youtu.be/eKyZx7YU2eI?si=PiswunEYIf8p065e`
  (kartica „Audio knjiga — Zija Dizdarević, Pripovijetke“). Obje kartice su bez `resource--pending`
  i linkovi se otvaraju u novom tabu (`target="_blank" rel="noopener noreferrer"`).
- 6 linkova još čeka unos: odlomci za analizu · snimka čitanja · prezentacija · radni list · sažetak · linkovi za čitanje
- 3 izvora u literaturi: izdanje djela · udžbenik/priručnik · dodatni ili web izvor

---

## 3. Zamjena slika fotografijama

1. Pripremite fotografiju u odnosu **16 : 10** (npr. 1600 × 1000 px), JPEG ili WebP, do ~300 KB.
2. Sačuvajte je u `images/` **pod imenom postojeće SVG datoteke** (npr. `stara-kuca.svg` → `stara-kuca.jpg`)
   i u HTML-u izmijenite samo nastavak: `src="images/stara-kuca.jpg"`.
3. Uvijek ostavite `alt` tekst (kratak opis fotografije) i atribut `loading="lazy"`.
4. Naslovnicu (`knjiga-zija.svg`) zamijenite **fotografijom pravog izdanja** knjige.
5. Ako fotografija nije vaša, navedite izvor u `figcaption` (npr. „Foto: …“).

Ako slika nedostaje, stranica se ne „kvari“: umjesto nje se prikaže uredna tekstura (klasa `media--missing`).

---

## 4. Kontrolna lista prije predaje

- [ ] Svi `data-todo` tekstovi zamijenjeni (provjera: `node tools/list-todos.js`)
- [ ] Svih 6 preostalih linkova u `materijali.html` uneseno i klasa `resource--pending` uklonjena
      (PDF djela i audio knjiga su već uneseni i imaju puni izgled)
- [ ] Citati uneseni **točno** kako stoje u djelu, s navedenim poglavljem/stranicom
- [ ] Naslovnica na početnoj zamijenjena fotografijom izdanja (ako je imate)
- [ ] Kviz u `kviz.html` proban na telefonu i na računaru (svih 12 pitanja)
- [ ] `node tools/check-links.js` i `node tools/render-check.js` bez grešaka
- [ ] `node tools/preview.js --all 420 900` bez prelijevanja (provjera na telefonu)
- [ ] Pročitati stranicu naglas — provjera pravopisa, imena likova i naslova djela
