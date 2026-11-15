# Word types — draft for review

Proposed word type for each of the 703 senses in `packages/shared/data/vocabulary.json`
(after the seed's dedup). **In use since 2026-11-15**: the source of truth is now
`packages/shared/data/word-types.json` (seeded into `words.word_type`); this file is the
readable copy made for review and isn't regenerated. Quiz wrong answers are picked from
the same type first (see `rankByLikeness` in `apps/web/src/lib/data.ts`).

How it was made: a rule pass (Spanish gloss ending in -ar/-er/-ir → verb, category
`numbers` → number, etc.), then every row checked by hand. Rows marked ⚠ depend on a
gloss that looks wrong; see also `docs/vocabulary-data-issues.md`.

`#` is the sense's position after dedup (the same numbering `en-translations.json` uses).

## Summary

| type | count | meaning |
|---|---|---|
| `noun` | 285 | things, people, places, times |
| `verb` | 203 | infinitives (*-na* forms: "comer", "llegar") |
| `verb_form` | 14 | conjugated or imperative forms ("salió", "muéstrame", "caminando"). Separate from `verb` so "salió" is never a distractor next to "comer" |
| `adjective` | 68 | qualities, including colors and quantity words ("muchos") |
| `adverb` | 42 | where/when/how ("aquí", "ahora", "rápido", "arriba") |
| `pronoun` | 18 | yo, tú, este, alguien, todos… |
| `question` | 22 | question words and short questions |
| `number` | 13 | numbers |
| `connector` | 7 | linking words ("por eso", "sin embargo", "hasta") |
| `interjection` | 4 | sí, no, ¡ya!, ¡toma! |
| `phrase` | 24 | greetings and multi-word expressions |
| `unclear` | 3 | can't tell from the gloss |

To correct a row, change it in `word-types.json` and re-run `npm run db:seed` (or tell
Claude the `#` and the right type).

## `noun` (285)

| # | kichwa | español | category | note |
|---|---|---|---|---|
| 1 | achi mama | madrina | family |  |
| 2 | achi tayta | padrino | family |  |
| 4 | akcha | pelo | body |  |
| 6 | allana puncha | dia de la cosecha | nature |  |
| 12 | allichina | numero | numbers |  |
| 14 | allku | perro | animals |  |
| 15 | allkuyuk | dueño de perro | animals |  |
| 16 | allpa | tierra, terreno | nature |  |
| 17 | allpa | tierra | nature |  |
| 18 | almuza | almuerzo | food |  |
| 19 | anaku | falda | house |  |
| 24 | antawa | carro, auto | general |  |
| 28 | api | colada | food |  |
| 29 | apunchik | dios | general |  |
| 30 | apunchikpa wasi | casa de dios | house |  |
| 34 | armana uku | baño | house |  |
| 43 | aswa | chicha | food |  |
| 44 | atallpa | gallina | animals |  |
| 45 | awak kari | tejedora | house |  |
| 46 | awak warmi | tejedora | house |  |
| 48 | aycha | carne | food |  |
| 49 | ayllu | familia | family |  |
| 51 | balun | pantalon | house |  |
| 52 | banca | banca | general |  |
| 53 | bloque | bloque | general |  |
| 54 | cafe | cafe | general |  |
| 55 | camisa | blusa | house |  |
| 56 | capilla | capilla | house |  |
| 57 | carro | carro, auto | general |  |
| 58 | casa comunal | casa comunal | house |  |
| 61 | cebolla | cebolla | food |  |
| 62 | chakana | escalera | house |  |
| 63 | chaki | patas | body |  |
| 64 | chaki | pie | body |  |
| 65 | chaki ñan | sendero | nature |  |
| 67 | challwa | pescado | food |  |
| 68 | chapa | burro | animals |  |
| 77 | chawpi puncha mikuna | almuerzo | food |  |
| 88 | chishi | tarde | general |  |
| 90 | chumpak | invitados, acompañantes | general |  |
| 93 | chunpi | faja | house |  |
| 95 | churakuna | vestimenta | house |  |
| 97 | churi | hija | general | ⚠ *churi* is usually "hijo" |
| 100 | culantro | culantro | food |  |
| 101 | culis | col | general |  |
| 103 | fanga | papel | general |  |
| 104 | gas | gas | general |  |
| 105 | grano | grano | general |  |
| 107 | hallu | lengua | body |  |
| 110 | hanpi wasi | centro de salud | house |  |
| 111 | hanpik tayta | curandero | general |  |
| 115 | hatun mama | abuela | family |  |
| 116 | hatun tayta | abuelo | family |  |
| 117 | hatun yachana wasi | colegio | house |  |
| 118 | hawa pacha | cielo | nature |  |
| 120 | hunu | mullon | general |  |
| 126 | imachik | verbo | general |  |
| 142 | janpik doctora | medica | general |  |
| 149 | jirru | hierro | general |  |
| 150 | jugo | jugo | food |  |
| 151 | kachi | sal | food |  |
| 152 | kallana | tiesto, sarten | general |  |
| 157 | kamcha | tostado | food |  |
| 160 | kamuti | libro | house |  |
| 164 | kancha | patio | house |  |
| 168 | kara | cueros | general |  |
| 171 | kari | hombra | general | ⚠ typo: "hombre" |
| 172 | kari wawa | niño, niña | general |  |
| 173 | karipa churakuna | ropa de hombre | general |  |
| 178 | kaspi | madera, palo | general |  |
| 179 | kaspi | palo | general |  |
| 182 | katuk warmi | vendedora | general |  |
| 183 | katuku | abuelo, abuela | family |  |
| 185 | katuna pamba | mercado | general |  |
| 190 | kayanti | dia siguiente | general |  |
| 200 | killa | mes | general |  |
| 207 | kinkray | interseccion | general |  |
| 209 | kipa churi | hijo menor | family |  |
| 210 | kipi | maleta | general |  |
| 211 | kishpirina | libertad | general |  |
| 213 | kiwu | hierba | nature |  |
| 214 | kucha | laguna, lago | nature |  |
| 215 | kuchi | chancho | animals |  |
| 216 | kuchu | rincon | general |  |
| 219 | kullki | dinero | general |  |
| 220 | kulta | pato | animals |  |
| 226 | kusa | esposo | family |  |
| 227 | kusa | espso | general |  |
| 228 | kusa tukuna | enamorado | family |  |
| 230 | kusashka aycha | carne asada, carne frita | food |  |
| 231 | kushma | chaleco | general |  |
| 236 | kuytsa | joven mujer | family |  |
| 237 | kuytsa | cuy, cobayo | animals |  |
| 238 | ladrillo | ladrillo | general |  |
| 239 | lampa | pala | general |  |
| 240 | leche | leche | food |  |
| 241 | llachu | pico | general |  |
| 244 | llakta | comundiad, pueblo, ciudad | general |  |
| 245 | llama | oveja | animals |  |
| 246 | llanada | llanura | general |  |
| 248 | llapishka papa | tortilla | general |  |
| 254 | llullu | berro | general |  |
| 257 | lukru | locro | general |  |
| 258 | lulun | huevo | food |  |
| 260 | machana yaku | alcochol | general |  |
| 261 | machana yaku | licor | general |  |
| 264 | makanakuna runpa | guantes de pelea | general |  |
| 265 | maki | manos | general |  |
| 266 | maki watana | manilla | general |  |
| 269 | mallki | rama | general |  |
| 270 | malta kallana | tiesto mediano | general |  |
| 271 | malta manka | olla mediana | general |  |
| 272 | mama | mama | general |  |
| 273 | mama kallana | tiesto grande | general |  |
| 274 | mama manka | olla grande | general |  |
| 280 | manka | olla | general |  |
| 281 | manña | borde | general |  |
| 283 | maquina | maquina | general |  |
| 284 | marka | provincia | general |  |
| 285 | mashi | amigo-compañero | general |  |
| 297 | mayu | rio | nature |  |
| 298 | mesa | mesa | general |  |
| 299 | michik kari | pastor | general |  |
| 300 | michik warmi | pastora | general |  |
| 302 | mikuna | dinero | general | ⚠ *mikuna* = food; glossed "dinero" |
| 304 | mikuna uku | comedor | general |  |
| 306 | minka | trabajo comunal | house |  |
| 310 | mishu | misho | general |  |
| 311 | misi | gato | animals |  |
| 314 | muchiku | sombrero | general |  |
| 317 | muru | grano | general |  |
| 320 | muti | mote | food |  |
| 323 | muyu | semilla | general |  |
| 329 | ñan | camino | general |  |
| 330 | ñaña | hermana-hermana | family |  |
| 334 | ñawi | cara, faz | body |  |
| 344 | pacha | hora | general |  |
| 345 | pacha | tierra | nature |  |
| 346 | pachallina | chal corto | general |  |
| 350 | pakcha | cascada | general |  |
| 352 | paku | cafe | general |  |
| 356 | pani | hermano-hermana | family |  |
| 357 | panka | pagina | general |  |
| 358 | pargati | alpargate | house |  |
| 359 | parkati | alpargate | house |  |
| 362 | patakunawan wasi | edificio con muchos pisos | house |  |
| 374 | pintu | tela | house |  |
| 376 | pishku | pajaro | animals |  |
| 383 | pukru | loma | nature |  |
| 384 | puku | plato | general |  |
| 388 | pukyu | vertiente | nature |  |
| 389 | puncha | dialogo | general | ⚠ *puncha* = día; glossed "diálogo" |
| 391 | puñuna uku | dormitorio | house |  |
| 395 | pushak | presidente | general |  |
| 398 | pushtu | sector | house |  |
| 401 | putsuku yaku | cerveza | food |  |
| 402 | puyo | niebla | nature |  |
| 407 | rasu | nieve | nature |  |
| 409 | rikra | brazo | body |  |
| 410 | riksik | amigo conocido | general |  |
| 412 | riksishka | amigo nuevo | general |  |
| 413 | riksishka | amigo, amiga | general |  |
| 416 | rimanakuy | dialogo | general |  |
| 419 | rinri | oreja | body |  |
| 420 | ruka | dedo | body |  |
| 422 | rumi | piedra | nature |  |
| 423 | rumi | rumi | general | ⚠ gloss untranslated ("rumi") |
| 425 | rumpa | pelotas, canicas | general |  |
| 426 | runpa | guantes | general |  |
| 430 | ruwana | poncho | house |  |
| 431 | sacha kuchi | cerdo salvaje | animals |  |
| 437 | samarina uku | sala | house |  |
| 438 | sara chakra | sementeria maiz | nature |  |
| 439 | sara panka | hojas de maiz | nature |  |
| 441 | sarcillo | arete | house |  |
| 449 | shikra | mochila | house |  |
| 450 | shila | vaso | general |  |
| 451 | shilla | vaso | general |  |
| 452 | shimi | lengua | body |  |
| 459 | shunku | corazon | body |  |
| 460 | shunkuna | desayuno | food |  |
| 461 | shunsho | idiota | general |  |
| 462 | shuti | nombre | general |  |
| 463 | shutichikuna | pronombres | general |  |
| 464 | shuwak | ladron | general |  |
| 468 | sisa | flor | nature |  |
| 473 | tabacu | tabaco, cigarrillo | general |  |
| 474 | taki | musica | general |  |
| 476 | takshak kari | lavandero | general |  |
| 477 | takshak warmi | lavandera | general |  |
| 480 | tanta | pan | food |  |
| 482 | tantanakuy | reunion | general |  |
| 485 | tarpuk warmi | agricultora | general |  |
| 487 | tarpuy | siembra | nature |  |
| 488 | taspurshka | sembrio | general |  |
| 491 | tawri | chochos | food |  |
| 492 | tayta | señor, papa | general |  |
| 493 | tayta cura | papa cura | general |  |
| 494 | tayta yaya | padre biologico | family |  |
| 495 | telar | telar | house |  |
| 498 | tio | señor | general |  |
| 500 | tiyarina | silla, silleta | general |  |
| 506 | tullpa | fogon | general |  |
| 510 | tunu | musica | general |  |
| 512 | turi | hermana-hermano | family |  |
| 513 | turu | lodo | nature |  |
| 515 | tuta mikuna | cena | food |  |
| 516 | tutamanta | la mañana | general |  |
| 520 | uchilla pacha | minuto | general |  |
| 522 | uksha | pajaro | animals |  |
| 523 | uksha | paja | nature |  |
| 525 | uku | cuarto | house |  |
| 526 | uku | cuarto, habitacion | house |  |
| 527 | uku pacha | infierno | general |  |
| 528 | ukucha | raton | animals |  |
| 530 | uma | cabeza | body |  |
| 531 | uma pachallina | tla para cubrirse la cabeza | body |  |
| 538 | urku | montaña, monte | nature |  |
| 539 | urpi | tortola | animals |  |
| 540 | usa | piojo | animals |  |
| 542 | ushushi | hijo | general |  |
| 543 | ushuta | calzado | house |  |
| 558 | wakra | toro | animals |  |
| 559 | wallka | collar | house |  |
| 560 | wampra | joven hombre | family |  |
| 566 | warmi | mujer | general | ⚠ regex misread *mujer* as a verb; fixed |
| 567 | warmi | esposa | family |  |
| 568 | warmi tukuna | enamorada | family |  |
| 569 | warmi wawa | niña | general |  |
| 570 | warmikunayuk | dueño de mujeres | general |  |
| 571 | warmipa churakuna | ropa de mujer | general |  |
| 572 | warmiyuk | dueño de una warmi | general |  |
| 574 | wasi | casado | family | ⚠ glossed "casado"; probably "casa" |
| 576 | wasiyuk | dueño de casa | house |  |
| 577 | wata | año | general |  |
| 579 | wawa | niño, niña | general |  |
| 580 | wawa kallana | tiesto pequeño | general |  |
| 581 | wawa manka | olla pequeña | general |  |
| 582 | wawa pacha | segundo | general |  |
| 583 | wawa unkuchik | partera | general |  |
| 584 | wawki | hermano-hermano | family |  |
| 586 | wayra | viento | nature |  |
| 589 | wira | manteca | food |  |
| 590 | wirwila | guitarra | general |  |
| 591 | wisha | cucharon | general |  |
| 592 | yachachik | profesor | general |  |
| 594 | yachakuk | estudiante | general |  |
| 596 | yachana wasi | escuela | house |  |
| 598 | yaku | agua | general |  |
| 599 | yaku wira | aceite | food |  |
| 604 | yanta | leña | general |  |
| 605 | yanuk kari | cocinero | food |  |
| 606 | yanuk warmi | cocinera | food |  |
| 608 | yanuna | cocina | general |  |
| 609 | yanuna uku | cocina | general |  |
| 613 | yura | planta o matorral | nature |  |
| 616 | winkulak | col | general |  |
| 617 | nanana | dolor | general |  |
| 623 | junka | semana | general |  |
| 626 | sapi | raiz | nature |  |
| 629 | taripay | investigacion | general |  |
| 630 | wachachik | partera | general |  |
| 631 | arawi | poema | general |  |
| 634 | puyu | nube | nature |  |
| 635 | uyllana | aviso | general |  |
| 637 | kara | cuero | general |  |
| 638 | mañana | pedido, ceremonia | general |  |
| 648 | llamkay uku | oficina | house |  |
| 651 | kururu | cono de hilo | general |  |
| 653 | kawa | balsa de madera para tejer hilo | house |  |
| 655 | kawpuk | el que desenreda | general |  |
| 657 | aswana kaspi | palo para tejer | house |  |
| 664 | larka | sequia | general |  |
| 665 | awanakaspi | madera para tejer | house |  |
| 668 | manchak | el que teme | general |  |
| 669 | jananik | subida inclinada | general |  |
| 674 | millma | lana | general |  |
| 677 | rikunakuna | vistas, paisajes | general |  |
| 686 | iñina | creencia | general |  |
| 689 | pura killa | luna llena | general |  |
| 694 | tukurina | termino(algo interno) | general |  |
| 698 | wallinku | conejo | animals |  |
| 700 | tunkuri | garganta, cuello | body |  |
| 701 | kashtuna | mandibula | general |  |
| 702 | chukchuna | temblor | general |  |

## `verb` (203)

| # | kichwa | español | category | note |
|---|---|---|---|---|
| 13 | allitukuna | mejorar | actions |  |
| 20 | anchuchina | quitar | actions |  |
| 21 | anchuna | quitarse | actions |  |
| 22 | ankana | volar | actions |  |
| 25 | apachina | hacer cargar | actions |  |
| 26 | apamuna | traer | actions |  |
| 27 | apana | llevar | actions |  |
| 32 | arinina | aceptar | actions |  |
| 33 | armachina | hacer bañar | actions |  |
| 40 | asichina | hacer reir | actions |  |
| 41 | asina | reirse | actions |  |
| 42 | aspirina | rascarse | general | ⚠ gloss "rascarse" for *aspirina* looks wrong |
| 47 | awana | tejer | house |  |
| 50 | aysana | halar | actions |  |
| 60 | casarana | casaarse | general |  |
| 66 | chakina | secar | actions |  |
| 70 | chapana | espiar | general |  |
| 74 | charina | tener | general |  |
| 75 | chaskina | recibir | actions |  |
| 81 | chayachina | hacer llegar | actions |  |
| 82 | chayana | llegar | actions |  |
| 89 | chukrichina | lastimar, herir | actions |  |
| 92 | chunkana | jugar a las planchas | actions |  |
| 94 | churachina | hacer vestir | house |  |
| 96 | churana | poner | actions |  |
| 102 | cumpana | acompañar | general |  |
| 112 | hanpina | curar | actions |  |
| 135 | inina | creer | actions |  |
| 136 | iñina | creer | actions |  |
| 139 | ishtirana | esterar | general |  |
| 141 | jallmana | deshierbar | nature |  |
| 143 | japina | pescar | actions |  |
| 144 | japina | cojer | general |  |
| 145 | japirina | encenderse | general |  |
| 146 | jatarina | levantarse | actions |  |
| 148 | jichana | regar | actions |  |
| 153 | kallarina | empezar | actions |  |
| 154 | kallarina | comenzar | actions |  |
| 155 | kallpana | correr | actions |  |
| 158 | kamchana | tostar | food |  |
| 162 | kana | ser, estar | general |  |
| 169 | karana | compartir | actions |  |
| 170 | karana | regalar | actions |  |
| 177 | kaspana | chamuscar | general |  |
| 181 | katina | seguir, perseguir | general |  |
| 184 | katuna | vender | general |  |
| 186 | kawsana | vivir | general |  |
| 189 | kayana | llamar | actions |  |
| 192 | kaynana | permanecer | general |  |
| 193 | kaynana | pasar el dia | general |  |
| 197 | kichuna | quitar, arranchar | actions |  |
| 201 | killkana | escribir | general |  |
| 202 | killpana | cubrirse | general |  |
| 203 | killpana | cubrir | general |  |
| 212 | kiwana | limpiar hierbas | actions |  |
| 218 | kuliarana | enojarse | general |  |
| 221 | kuna | dar | general |  |
| 223 | kunuchina | calentar, recalentar | general |  |
| 225 | kurina | importar | general |  |
| 229 | kusana | asar, freir | general |  |
| 232 | kutana | moler | general |  |
| 234 | kutin nipay | repetir | general |  |
| 235 | kuyana | querer | general |  |
| 249 | llukchana | resbalar | general |  |
| 250 | llukshina | salir | actions |  |
| 251 | llukshina | sacar | actions |  |
| 253 | llullana | mentir | actions |  |
| 255 | llunchina | estucar | general |  |
| 259 | machana | emborracharse | general |  |
| 263 | makanakuna | pelearse | general |  |
| 268 | mallina | probar | general |  |
| 278 | mañana | pedir | general |  |
| 279 | mananinar | rechazar | general |  |
| 286 | mashkana | buscar | general |  |
| 288 | maskana | buscar | general |  |
| 301 | michina | pastar | general |  |
| 303 | mikuna | comer | general |  |
| 305 | minishtina | necesitar | general |  |
| 312 | moleshtana | molestar | actions |  |
| 313 | muchana | adorar | general |  |
| 315 | munana | desear, querer | general |  |
| 322 | mutsuna | necesitar | general |  |
| 324 | muyuna | girar | general |  |
| 325 | muyuna | rodear | general |  |
| 327 | muyuntin | rodear | general |  |
| 331 | nanana | doler | general |  |
| 337 | nina | decir | actions |  |
| 343 | ñutuchina | pulverizar | general |  |
| 348 | pakakuna | esconderse | general |  |
| 349 | pakarina | amanecerse | general |  |
| 351 | pakina | romper, quebrar | general |  |
| 354 | pallana | cosechar | nature |  |
| 355 | pana | pagar | actions |  |
| 360 | parlana | conversar | actions |  |
| 361 | paskana | abrir | actions |  |
| 367 | pichana | limpiar hierbas | actions |  |
| 368 | pichana | limpiar | actions |  |
| 373 | piñachina | hacer enojar | actions |  |
| 380 | plituna | molestar | actions |  |
| 382 | pukllana | jugar | actions |  |
| 385 | pukuna | madurar, soplar | food |  |
| 386 | pukuna | madurar, fermentarse | food |  |
| 390 | puñuna | dormir | actions |  |
| 392 | purina | andar | actions |  |
| 396 | pushana | llevar | actions |  |
| 403 | rakina | repartir | actions |  |
| 405 | ranti | comprar | actions |  |
| 406 | rantina | comprar | actions |  |
| 411 | riksina | conocer | general |  |
| 415 | rikuna | ver, mirar | actions |  |
| 418 | rina | ir | general |  |
| 427 | rurana | deber | general |  |
| 428 | rurana | aplicar | general |  |
| 429 | rurana | hacer | general |  |
| 432 | sakina | dejar | actions |  |
| 433 | sakina | extraer, sacar | actions |  |
| 434 | sakirina | quedarse | actions |  |
| 436 | samana | descansar | actions |  |
| 442 | shamuna | venir | general |  |
| 445 | shayachina | hacer parar | actions |  |
| 446 | shayana | para | general | ⚠ typo: "parar" |
| 447 | shaykuna | cansarse | general |  |
| 456 | shitana | botar, arrojar | actions |  |
| 457 | shitona | botar | actions |  |
| 465 | shuyana | esperar | actions |  |
| 466 | sirana | coser | actions |  |
| 467 | sirina | acostarse | actions |  |
| 472 | surkuna | sacar | actions |  |
| 475 | takina | hacer musica | general |  |
| 478 | takshana | lavar | actions |  |
| 479 | tamiana | llover | general |  |
| 481 | tantanakuna | reunirse | general |  |
| 483 | tarina | encontrar | actions |  |
| 486 | tarpuna | sembrar | nature |  |
| 496 | tikrana | regresar, volver | general |  |
| 497 | tinpuna | hervir | food |  |
| 499 | tiyana | haber, existir | general |  |
| 501 | tiyarina | sentarse | actions |  |
| 502 | trabajana | trabajar | actions |  |
| 503 | tukuna | hacerse | general |  |
| 507 | tullpuna | colorear | colors |  |
| 511 | tupana | encontrarse | general |  |
| 514 | tushuna | bailar | actions |  |
| 517 | tyarina | sentarse | actions |  |
| 521 | ukllana | abrazar | actions |  |
| 529 | ullana | oir | general |  |
| 532 | umana | mentir | actions |  |
| 533 | unkuna | enfermarse | general |  |
| 535 | upallana | callar | actions |  |
| 536 | upyana | beber | general |  |
| 541 | ushana | poder | actions |  |
| 546 | uyana | escuchar | actions |  |
| 548 | valina | valer, costar | actions |  |
| 549 | wachuna | formar surcos | general |  |
| 550 | wakana | llorar | actions |  |
| 551 | wakaychina | guardar | actions |  |
| 557 | wakllina | dañarse | general |  |
| 562 | wañuchina | hacer apagar | actions |  |
| 563 | wanuna | abonar | nature |  |
| 575 | wasichina | construir casa | house |  |
| 588 | willana | avisar | actions |  |
| 593 | yachachina | enseñar | actions |  |
| 595 | yachakuna | aprender | actions |  |
| 597 | yacharina | acostumbrarse, enseñarse | general |  |
| 600 | yallina | pasarse | general |  |
| 603 | yanapana | ayudar | actions |  |
| 607 | yanuna | cocinar | food |  |
| 610 | yapuna | harar | general | ⚠ typo: "arar" |
| 611 | yaykuna | entrar | actions |  |
| 615 | yuyana | intentar | actions |  |
| 618 | ashnana | oler | actions |  |
| 619 | mayllana | lavar(excepto ropa) | actions |  |
| 620 | akllana | escojer | general |  |
| 625 | chapuna | revolver | general |  |
| 632 | chinkachina | perder | actions |  |
| 636 | wiñana | crecer | actions |  |
| 639 | kunkana | olvidar | general |  |
| 641 | paktachispa | hacer alcanzar, hacer unir | general |  |
| 642 | paktana | unir, alcanzar | general |  |
| 644 | tipina | cosechar sara | nature |  |
| 645 | chayamuna | llegar | actions |  |
| 650 | puchka | hilar | house |  |
| 652 | awllina | extramar, hurdir | general | ⚠ typo: "urdir" |
| 654 | kawpuna | desenredar hilo | general |  |
| 656 | pilluna | envolver | actions |  |
| 658 | illana | no habe, no existir | general |  |
| 660 | tukuchina | terminar | actions |  |
| 661 | tukuna | transformarse | general |  |
| 662 | apachina | cargar | actions |  |
| 663 | aparina | cargar | actions |  |
| 667 | manchana | asustar | general |  |
| 672 | rikurina | aparecerse, verse | general |  |
| 676 | chinkana | perder | actions |  |
| 678 | chinkarina | perderse | actions |  |
| 679 | llapina | aplastar | general |  |
| 682 | shayana | detenerse | general |  |
| 683 | kachana | mandar | actions |  |
| 690 | ismuna | podrir | general |  |
| 691 | wasichina | construir | house |  |
| 692 | wirayana | engordar | general |  |
| 693 | surkuna | sacar, cortar | actions |  |
| 696 | pukuna | madurar | food |  |
| 699 | tukuna | hacerse volverse | general |  |

## `verb_form` (14)

| # | kichwa | español | category | note |
|---|---|---|---|---|
| 69 | chapakrirka | fue a vigilar | general |  |
| 252 | llukshirka | salio | general |  |
| 338 | nina japirirka | se encendio | general |  |
| 339 | nishpa | diciendo | general |  |
| 370 | pillurka | envolvio | general |  |
| 393 | purishpa | caminando | general |  |
| 397 | pusharkakuna | llevaron | general |  |
| 408 | rikchari | despiertate | general |  |
| 414 | rikuchiway | muestrame | general |  |
| 435 | sakiway | me deje | general |  |
| 578 | watarka | amarro | general |  |
| 643 | kuyana | amando | general |  |
| 659 | illarka | no hubo | general |  |
| 684 | mashkakrishpa | yendo a buscar | general |  |

## `adjective` (68)

| # | kichwa | español | category | note |
|---|---|---|---|---|
| 5 | alalay | feo, fea | general |  |
| 7 | alli | bueno, buena | general |  |
| 8 | alli | sano | general |  |
| 23 | ankas | azul | colors |  |
| 35 | arrendashka | arrendado | general |  |
| 37 | asha muspa | poco loco o loca | general |  |
| 59 | casado | casado | family |  |
| 71 | chaquishka | secar | actions | ⚠ *-shka* form = "secado", but glossed "secar" |
| 72 | charijayak | rico amargado | general |  |
| 73 | charik | rico, millonario | general |  |
| 76 | chawa | crudo | food |  |
| 87 | chiri | frio | nature |  |
| 99 | chuya | limpio | general |  |
| 106 | halaw | agradable | general |  |
| 113 | hatun | alto | general |  |
| 114 | hatun | alto, grande | general |  |
| 137 | irki | debil | general |  |
| 159 | kamchashka | tostado | food |  |
| 176 | kasilla | quietos | general |  |
| 196 | kichki | estrecho | general |  |
| 204 | killu | amarrillo | general |  |
| 205 | killu | amarillo | colors |  |
| 224 | kunuk | caliente | general |  |
| 242 | llaki | triste | general |  |
| 243 | llakilla | triste | general |  |
| 247 | llapishka | aplastado | general |  |
| 256 | llunchiska | estucado | general |  |
| 262 | machashka | borracho | general |  |
| 282 | mapa | sucio | general |  |
| 289 | mawka | viejo, inanimado | general |  |
| 293 | maymutsurik | importante | general |  |
| 308 | mishki | sabroso | general |  |
| 309 | mishki pacha | delicioso | general |  |
| 318 | mushuk | nuevo | general |  |
| 319 | muspa | loco | general |  |
| 321 | mutshuska | necesitado | general |  |
| 372 | piña | enojado, enojada | general |  |
| 381 | puka | rojo | colors |  |
| 387 | pukushka | madurado | general |  |
| 400 | pusu | plomo | colors |  |
| 404 | raku | grueso | general |  |
| 421 | ruku | viejo | general |  |
| 424 | rumilla pamba | pedregroso | general |  |
| 440 | sarantanu | de varios colores | colors |  |
| 448 | shaykushka | cansado, cansada, estresado | general |  |
| 469 | soltera | soltera | family |  |
| 471 | sumak | excelente | general |  |
| 484 | tarishka | encontrado | general |  |
| 489 | tawka | varios | general |  |
| 490 | tawka | muchos | general |  |
| 508 | tullpuyuk | colorido | colors |  |
| 509 | tullu | flaco | body | ⚠ *tullu* is usually "hueso" (noun) |
| 519 | uchilla | pequeño | general |  |
| 534 | upalla | callado | general |  |
| 547 | uyay | atento | general |  |
| 552 | wakcha | pobre | general |  |
| 553 | wakin | alguno | general |  |
| 554 | wakin | algun | general |  |
| 556 | waklli | dañado | general |  |
| 564 | wañushka | muerto | general |  |
| 585 | waylla | verde | colors |  |
| 601 | yana shina | parecido al negro | colors |  |
| 602 | yana shina | negro | colors |  |
| 614 | yurak | blanco | colors |  |
| 621 | mana kullkita kurin | gratis | general |  |
| 681 | machalla | medio ebrio | general |  |
| 687 | llullu | tierno | general |  |
| 688 | junta | llena | general |  |

## `adverb` (42)

| # | kichwa | español | category | note |
|---|---|---|---|---|
| 36 | asha | poco | general |  |
| 38 | ashtaka | bastante | general |  |
| 85 | chaypi | alli | general |  |
| 86 | chinpa | en/ al frente | general |  |
| 108 | hanak | arriba | general |  |
| 109 | hanan | arriba inclinado | general |  |
| 119 | hawa pacha | arriba | general |  |
| 147 | jawapi | sobre | general |  |
| 163 | kancha | afuera, fuera | general |  |
| 174 | karu | lejos | general |  |
| 180 | kati | seguido | general |  |
| 194 | kaynanik | el otro dia | general |  |
| 195 | kaypi | aqui | general |  |
| 208 | kipa | leuego, despues | general |  |
| 217 | kuchu | cerca | general |  |
| 222 | kunan | ahora, hoy | general |  |
| 291 | maykunatapash | por doquier | general |  |
| 294 | maypipash | en doquier | general |  |
| 326 | muyuntin | alrededor | general |  |
| 333 | ñatak | en este momento | general |  |
| 335 | ñawpa | adelante | general |  |
| 347 | pachan pachan | tiempo en tiempo | general |  |
| 453 | shina shinalla | mas o menos | general |  |
| 454 | shinallatak | asi mismo | general |  |
| 518 | ucha | pronto | general |  |
| 524 | uku | adentro, dentro | general |  |
| 537 | ura | abajo | general |  |
| 544 | utiya | rapido | general |  |
| 545 | utya | pronto | general |  |
| 555 | wakinpi | rara vez | general |  |
| 561 | wankipi | a veces | general |  |
| 573 | washa | atras, tras | general |  |
| 587 | wichayman | hacia arriba | general |  |
| 627 | hawa | arriba | general |  |
| 633 | yanka | envano | general |  |
| 640 | ninanta | demasiado | general |  |
| 649 | shinchitapacha | fuertisimo | general |  |
| 666 | manchaklla | temerosamente | general |  |
| 670 | uranik | hacia abajo en digonal | general |  |
| 671 | washanik | hacia atras | general |  |
| 680 | kayta chayta | por aqui, por alla | general |  |
| 695 | utka | rapido | general |  |

## `pronoun` (18)

| # | kichwa | español | category | note |
|---|---|---|---|---|
| 78 | chay | esa, ese, eso | general |  |
| 79 | chay shuk | otro u otros | general |  |
| 132 | imatapash | algo | general |  |
| 161 | kan | tu | general |  |
| 166 | kankuna | vosotros, vosotras | general |  |
| 167 | kanllaka | solamente tu | general |  |
| 187 | kay | este, esto | general |  |
| 198 | kikin | usted | general |  |
| 199 | kikinkuna | ustedes | general |  |
| 276 | mana pipash | nadie | general |  |
| 340 | ñuka | yo | general |  |
| 341 | ñukanchik | nosostros, nosotras | general |  |
| 364 | pay | el, ella | general |  |
| 366 | paykuna | ellos, ellas | general |  |
| 375 | pipash | alguien | general |  |
| 504 | tukuy | todos | general |  |
| 505 | tukuylla | todos | general |  |
| 697 | imatapash | cualquier cosa | general |  |

## `question` (22)

| # | kichwa | español | category | note |
|---|---|---|---|---|
| 121 | ima | porque | general | ⚠ *ima* = "qué"; glossed "porque" |
| 122 | ima colortak? | de que color? | colors |  |
| 123 | ima punchatatak? | que dia? | general |  |
| 124 | ima shutitak? | que nombre? | general |  |
| 125 | ima tunutatak ? | que musica? | general |  |
| 127 | imamantak? | porque? | general |  |
| 128 | imanallatak? | como? | general |  |
| 129 | imapatak? | para que? | general |  |
| 130 | imapitak? | en que? | general |  |
| 131 | imatak? | que? | general |  |
| 133 | imatatak? | que? | general |  |
| 134 | imawantak? | con que? | general |  |
| 287 | mashna..tak? | cuanto? | general |  |
| 290 | maykan...tak? | cual? | general |  |
| 292 | maymantatak? | de donde? | general |  |
| 295 | maypitak? | en donde? | general |  |
| 296 | maytatak? | por donde? | general |  |
| 371 | pimantatak? | por quien? | general |  |
| 377 | pitak? | quien? | general |  |
| 378 | pitatak? | a quien? | general |  |
| 379 | piwantak? | con quien? | general |  |
| 624 | imashtawan | que mas? | general |  |

## `number` (13)

| # | kichwa | español | category | note |
|---|---|---|---|---|
| 91 | chunka | diez | numbers |  |
| 98 | chusku | cuatro | numbers |  |
| 138 | ishkay | dos | numbers |  |
| 140 | iskun | nueve | numbers |  |
| 165 | kanchis | siete | numbers |  |
| 206 | kimsa | tres | numbers |  |
| 336 | nima | cero | general |  |
| 363 | patsak | cien | numbers |  |
| 369 | pichka | cinco | numbers |  |
| 394 | pusak | ocho | numbers |  |
| 458 | shuk | uno | numbers |  |
| 470 | sukta | seis | numbers |  |
| 565 | waranka | mil | numbers |  |

## `connector` (7)

| # | kichwa | español | category | note |
|---|---|---|---|---|
| 83 | chaymanta | por eso | general |  |
| 84 | chaypak | para eso | general |  |
| 156 | kaman | hasta | general |  |
| 233 | kutin | en cambio | general |  |
| 455 | shinapash | sin embargo, pero | general |  |
| 646 | yala | igual que shina | general |  |
| 647 | shina | por ejemplo | general |  |

## `interjection` (4)

| # | kichwa | español | category | note |
|---|---|---|---|---|
| 31 | ari | si | general |  |
| 191 | kayka | toma! | general |  |
| 275 | mana | no | general |  |
| 328 | ña | ya! | general |  |

## `phrase` (24)

| # | kichwa | español | category | note |
|---|---|---|---|---|
| 3 | achikta japichipay | enciende la luz porfavor | general |  |
| 9 | alli chishi | buenas tardes | greetings |  |
| 10 | alli puncha | buenos dias | greetings |  |
| 11 | alli tuta | buenas noches | greetings |  |
| 39 | ashtakashkaman | hasta luego | greetings |  |
| 80 | chay shuk punchakuna | otros dias | general |  |
| 188 | kayakaman | hasta mañana | general |  |
| 267 | mallichiway | hazme probar | general |  |
| 277 | mana yachanichu | no entiendo | general |  |
| 316 | munaywan | con gusto | general |  |
| 332 | ñanta mañachi | prestame el camino | general |  |
| 342 | ñukashina | como yo | general |  |
| 365 | pay | gracias | greetings |  |
| 399 | pushtupi | en el sector | house |  |
| 417 | rimashka katina | seguir hablando | general |  |
| 443 | shamupasha | me permite venir | general |  |
| 444 | shamupaylla | venga no mas | general |  |
| 612 | yupaychini | gracias | greetings |  |
| 622 | chaytallatak | lo mismo | general |  |
| 628 | yalli alli | pasa bien | general |  |
| 673 | shuktak shina | como otro(diferente) | general |  |
| 675 | paypak | para el | general |  |
| 685 | kipikunantin | conjuntamente con las maletas | general |  |
| 703 | amuklla | sabe no mas | general |  |

## `unclear` (3)

| # | kichwa | español | category | note |
|---|---|---|---|---|
| 175 | kashpallata |  | general | ⚠ no Spanish gloss |
| 307 | mishki | tayta galan | general | ⚠ "tayta galán" for *mishki* (sweet) is unclear |
| 353 | pakuana |  | general | ⚠ no Spanish gloss |
