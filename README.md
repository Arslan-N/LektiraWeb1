# Prosanjane jeseni — digitalna prezentacija lektire

Statička web prezentacija školske lektire **„Prosanjane jeseni“** (autor: Zija Dizdarević), koju izrađuje 3. grupa.
Stranice su pisane ručno u HTML-u, stilizovane u CSS-u i oplemenjene malim, zavisnim JavaScript modulima —
**bez build koraka, bez frameworka i bez servera**.

> Sadržaj (odgovori grupe, citati, fotografije, linkovi) još nije unesen: sva takva mjesta su označena
> jasnim oznakama. Vodič za unos je u **[SADRZAJ.md](SADRZAJ.md)**.

## 1. Pokretanje

Najjednostavnije: otvoriti `index.html` dvoklikom (radi i preko `file://` protokola jer se nigdje ne koristi
`fetch` ni ES moduli).

Za rad “kao na serveru” (preporučeno zbog relativnih putanja i keša):

```powershell
npx --yes serve .          # ili:  python -m http.server 8000
```

## 2. Struktura projekta

```
LektiraWeb/
├─ index.html              početna: hero, naslovnica knjige, uvodni tekst, 6 pitanja, CTA
├─ pitanje1.html … 6.html  stranice odgovora: samo odgovor na pitanje (bez slika i dodataka)
├─ kviz.html               kviz od 12 pitanja: jedno po jedno, rezultat na kraju
├─ materijali.html         materijali: PDF, audio, dodatno, izvori
├─ css/
│  ├─ style.css            dizajn sistem: tokeni, reset, tipografija, header/nav, footer, animacije
│  └─ pages.css            komponente stranica: hero, kartice, citati, članak, kviz, mreže…
├─ js/
│  ├─ main.js              header, mobilni meni, traka napretka, TOC, fallback slika, „na vrh“
│  ├─ animations.js        reveal-on-scroll, parallax, brojači, poštovanje prefers-reduced-motion
│  ├─ gallery.js           lightbox (tastatura, strelice) i filteri galerije
│  └─ kviz.js              kviz: 12 pitanja, miješanje ponude odgovora (zeleno = tačno, crveno = netačno), rezultat i ponavljanje
├─ images/                 19 zamjenskih ilustracija + naslovnica (knjiga-zija.svg) + favicon
└─ tools/                  Node skripte za izradu i provjeru (nisu dio sajta)
```

## 3. Ugovor preko `data-` atributa

Stranice i skripte komuniciraju isključivo preko atributa — nema inline JS-a.

| Atribut | Značenje |
| --- | --- |
| `data-page="…"` | na `<body>`; označava aktivnu stranicu |
| `data-header` | zaglavlje koje mijenja izgled pri skrolu |
| `data-nav` / `data-burger` / `data-sub` | navigacija, hamburger i padajući meni „Pitanja“ |
| `data-progress` | traka napretka čitanja |
| `data-reveal="fade\|left\|right\|scale\|clip"` | element koji se animira ulaskom u vidno polje |
| `data-reveal-group` | grupa; animacija djece ide s malim zakašnjenjem (stagger) |
| `data-parallax="0.08"` | blagi pomak slike pri skrolu |
| `data-count="6"` | brojač koji se „vrti“ do ciljne vrijednosti |
| `data-lightbox="1"` | stavka galerije koja se otvara u lightboxu |
| `data-filter="nekad"` / `data-filter-target` | filteri galerije |
| `data-todo="poruka"` | mjesto za tekst koji upisuje grupa (prikazuje se kao isprekidani okvir) |
| `data-link-todo="poruka"` | link koji još nema odredište (dok je `href="#"`, klik je onemogućen) |

## 4. Alati (`tools/`)

Svi alati su Node skripte bez dodatnih paketa (`node tools/<ime>.js`).

| Skripta | Čemu služi |
| --- | --- |
| `generate-placeholders.js` | ponovo generiše zamjenske SVG ilustracije u `images/` (seed je fiksan, rezultat je isti) |
| `apply-shell.js` | ubacuje zajednički footer i `<script>` tagove u stranice koje ih još nemaju |
| `list-todos.js` | ispisuje popis svih mjesta koja čekaju sadržaj (tekst, linkovi, slike) |
| `check-structure.js` | provjerava uravnoteženost HTML oznaka i prisutnost zaglavlja, futera i skripti |
| `check-links.js` | provjerava da svaki link, slika i `#anker` postoje; traži duple `id` vrijednosti |
| `render-check.js` | učitava svaku stranicu u headless Chromeu/Edgeu i provjerava da se JS izvršio i slike učitali |
| `preview.js` | snima screenshot (`tools/_shots/`) i prijavljuje vodoravno prelijevanje na zadatoj širini |
| `set-author.js` | mijenja ime autora u cijelom projektu, u svim padežima (`node tools/set-author.js "Zija Dizdarević"`) |
| `test-kviz.js` | u headless pregledniku provjerava ponašanje kviza: netačno = crveno i blokiran prelazak, tačno = zeleno i otvoreno sljedeće pitanje, rezultat iz prvog pokušaja |

### Provjera prije predaje

```powershell
node tools/check-structure.js
node tools/check-links.js
node tools/list-todos.js
node tools/render-check.js
node tools/test-kviz.js
node tools/preview.js --all 420 900     # mobilni
node tools/preview.js --all 1440 900    # desktop
```

### Snimanje screenshota

```powershell
node tools/preview.js index.html 1440 1000 --full     # cijela stranica
node tools/preview.js index.html 420 900 --y=1200     # mobilni, skrol na 1200px
node tools/preview.js index.html 1100 800 --scale=0.55
```

## 5. Dizajn sistem (ukratko)

- **Paleta:** topli „jesen / papir / Bosna“ tonovi — tinta `--ink-900…600`, papir `--paper-50…400`,
  akcenti `--amber-300…600`, `--rust-500`, `--moss-500`, `--plum-500`.
  Gradijenti: `--grad-amber`, `--grad-dark`, `--grad-paper`.
- **Tipografija:** naslovi *Cormorant Garamond* (serif, display), tekst *Inter* (sans).
  Slova se učitavaju s Google Fonts CDN-a; ako interneta nema, koriste se sistemski rezervni fontovi.
- **Ritam:** `--container` / `--container-wide` i `--gutter` drže istu širinu sadržaja na svim stranicama,
  `--section-y` visinu sekcija.
- **Pristupačnost:** „preskoči na sadržaj“, `aria-current`, `aria-expanded`, fokus obrub,
  potpuno poštovanje `prefers-reduced-motion`, kontrast teksta preko 4.5:1.
- **Bez zavisnosti:** nema npm paketa, nema CDN skripti; jedini vanjski resurs su fontovi.

## 6. Ograničenja

- U `materijali.html` su povezani **PDF djela** (Archive.org) i **audio knjiga** (YouTube); ostali linkovi
  i izvori su još **oznake za unos** — ništa nije izmišljeno.
- Stranice odgovora (`pitanje1.html` … `pitanje6.html`) sadrže **samo odgovor** 3. grupe:
  bez slika, kartica, sadržaja sa strane (TOC) i animacija.
- Svaka stranica odgovora ima **tri vertikalne sekcije**: `Uvod`, `Odgovor`, `Zaključak`
  (`<section class="block">` s `<h2 class="block__title">`); „Citati iz djela“ i „Analiza i primjeri“
  nisu zasebne sekcije nego **podnaslovi (`<h3>`/`<h4>`) unutar sekcije „Odgovor“**.
  Stranica `pitanje4.html` ima samo sekciju „Odgovor“ (njen sadržaj su isključivo citati o majci).
- Stranice „Bilješka o piscu“ i „Mjesto i vrijeme radnje“ su **uklonjene** zajedno sa svim linkovima na njih.
- Naslovnica na početnoj je ilustracija (`images/knjiga-zija.svg`); zamjenjuje se fotografijom istog imena.
- Sajt je statičan: nema pretrage, komentara ni forme (nema backend). Kviz radi u pregledniku (`js/kviz.js`).
- U kvizu se na sljedeće pitanje prelazi **samo s tačnim odgovorom**: tačan odgovor se oboji zeleno i odmah otvara sljedeće pitanje, a netačan crveno i prelazak ostaje blokiran dok se ne odabere tačan. Brojač i rezultat na kraju zato broje odgovore **tačne iz prvog pokušaja**.
- Početna stranica ima kratak uvodni tekst 3. grupe i šest kartica s pitanjima.

## 7. Dalji koraci

1. Unijeti sadržaj grupe prema [SADRZAJ.md](SADRZAJ.md).
2. Zamijeniti `images/*.svg` fotografijama (zadržati ista imena fajlova).
3. Pokrenuti provjere iz tačke 4 i objaviti mapu na školski sajt / GitHub Pages / Netlify.
