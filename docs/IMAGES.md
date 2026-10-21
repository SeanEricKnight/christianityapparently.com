# Self-hosted images

Completed on the existing `self-host-images` branch, starting at `4683b5e76c1ed7e961a54cf9ff12db6cb70ca986`.

The initial dry run found **17 outstanding Commons images**. The actual script downloaded all 17 without HTTP rejections or skipped files, optimized them as JPEGs and rewrote `index.html`, `councils.html` and `original-experience.html`. There are now **19 local editorial images**: 17 new files plus the existing Nicaea and Luther paintings.

All 17 new files were fully decoded using Sharp, checked against their recorded SHA-256 hashes, visually reviewed, and compared with the subjects and creator/license metadata in their Commons source records. `assets/images/MANIFEST.json` records all 19 files, including source pages, source download URLs, creators, licenses, processing details and hashes.

The original Nicaea and Luther files were preserved byte-for-byte:

- `first-council-nicaea-surikov.jpg`: `4cca45e52a2c396f2bb1a82527a8dd28b3c8535a0ac8aed11be7870ce5f4301f`
- `luther-diet-of-worms-werner.jpg`: `481a1305b1d07e14c21b15f2b36cfc6758b0329b3d88eec451f7d712ed04bba2`

## Image credits

Commons source metadata was checked on 21 October 2026. `credits.html` retains individual source links, identifies the creators and licenses, links each non-CC0 Creative Commons image to its license, and discloses resizing, JPEG recompression, white flattening and layout crops. BY-SA local versions retain the same image-specific license. Public-domain labels below report the source records' status.

| File | Creator / source credit | Source license |
|---|---|---|
| [Second Ecumenical council by V.Surikov.jpg](https://commons.wikimedia.org/wiki/File:Second_Ecumenical_council_by_V.Surikov.jpg) | Vasily Surikov | Public domain |
| [Fourth ecumenical council of chalcedon - 1876.jpg](https://commons.wikimedia.org/wiki/File:Fourth_ecumenical_council_of_chalcedon_-_1876.jpg) | Vasily Surikov | Public domain |
| [Dead Sea Scrolls and caves and Qumran Excavations of Essene Monastery. Cave no. 4 where main library of the Essenes was found LOC matpc.13010.jpg](https://commons.wikimedia.org/wiki/File:Dead_Sea_Scrolls_and_caves_and_Qumran_Excavations_of_Essene_Monastery._Cave_no._4_where_main_library_of_the_Essenes_was_found_LOC_matpc.13010.jpg) | Matson Collection | Public domain |
| [Dead Sea Scrolls Pot and the Copper Scroll.jpg](https://commons.wikimedia.org/wiki/File:Dead_Sea_Scrolls_Pot_and_the_Copper_Scroll.jpg) | Dale Gillard | CC BY 2.5 |
| [Hubble Ultra Deep Field (heic0714g).jpg](https://commons.wikimedia.org/wiki/File:Hubble_Ultra_Deep_Field_(heic0714g).jpg) | NASA , ESA , and N. Pirzkal ( European Space Agency / STScI ) and the HUDF Team (STScI) | Public domain |
| [Sea of Galilee View.jpg](https://commons.wikimedia.org/wiki/File:Sea_of_Galilee_View.jpg) | israeltourism /Itamar Grinberg | CC BY-SA 2.0 |
| [Nail & Heel Bone Only Known Evidence of Crucifixion, Jerusalem, 1st C. AD (29347803498).jpg](https://commons.wikimedia.org/wiki/File:Nail_%26_Heel_Bone_Only_Known_Evidence_of_Crucifixion%2C_Jerusalem%2C_1st_C._AD_(29347803498).jpg) | Gary Todd from Xinzheng, China | CC0 |
| [Jerusalem Garden Tomb (43300924231).jpg](https://commons.wikimedia.org/wiki/File:Jerusalem_Garden_Tomb_(43300924231).jpg) | Gary Todd from Xinzheng, China | CC0 |
| [Codex Sinaiticus.jpg](https://commons.wikimedia.org/wiki/File:Codex_Sinaiticus.jpg) | PotatoCow25 | CC0 |
| [Interior section of the Church of the Holy Sepulchre LOC matpc.06575.jpg](https://commons.wikimedia.org/wiki/File:Interior_section_of_the_Church_of_the_Holy_Sepulchre_LOC_matpc.06575.jpg) | Matson Collection | Public domain |
| [P52 recto.jpg](https://commons.wikimedia.org/wiki/File:P52_recto.jpg) | Papyrologist Bernard Grenfell (1920), as preserved at the John Rylands Library . Photo: courtesy of JRUL. | Public domain |
| [Book of Kells ChiRho Folio 34R.png](https://commons.wikimedia.org/wiki/File:Book_of_Kells_ChiRho_Folio_34R.png) | unknown Irish or Scottish monks | Public domain |
| [Codex Sinaiticus Matthew 1,1-2,5.JPG](https://commons.wikimedia.org/wiki/File:Codex_Sinaiticus_Matthew_1%2C1-2%2C5.JPG) | Unknown artist | Public domain |
| [Athanasius I.jpg](https://commons.wikimedia.org/wiki/File:Athanasius_I.jpg) | Unknown artist | Public domain |
| [1867 Edward Poynter - Israel in Egypt.jpg](https://commons.wikimedia.org/wiki/File:1867_Edward_Poynter_-_Israel_in_Egypt.jpg) | Edward Poynter | Public domain |
| [Garden Tomb.jpg](https://commons.wikimedia.org/wiki/File:Garden_Tomb.jpg) | Beko | CC BY-SA 4.0 |
| [The Four Evangelists and Two Apostles, The four evangelists and the two chief apostles, Walters Manuscript W.530.C, fol. 211r.jpg](https://commons.wikimedia.org/wiki/File:The_Four_Evangelists_and_Two_Apostles%2C_The_four_evangelists_and_the_two_chief_apostles%2C_Walters_Manuscript_W.530.C%2C_fol._211r.jpg) | Walters Art Museum Illuminated Manuscripts | CC0 |
| [First Council of Nicea by V.Surikov (1876).jpg](https://commons.wikimedia.org/wiki/File:First_Council_of_Nicea_by_V.Surikov_(1876).jpg) | Vasily Surikov | Public domain |
| [Luther at the Diet of Worms.jpg](https://commons.wikimedia.org/wiki/File:Luther_at_the_Diet_of_Worms.jpg) | Anton von Werner | Public domain |

## Build and verify

```sh
git switch self-host-images
npm install --no-save --package-lock=false sharp
node scripts/localize-images.js --dry-run
npm run build:dist
node scripts/check-static.js
node scripts/check-dist.js
ONLINE=1 npm run test:browser   # optional (see docs/DEPLOYMENT.md#checks)
```

After localization the dry run should report zero remaining external Commons references. Do not expect the original 17 again once the pages have been rewritten. A `MANIFEST.json` enables the self-hosting test in all three Playwright projects (desktop, tablet and mobile); when the browser suite is run, those three cases should execute and pass, not skip (running it is optional). The test exercises image loading and absence of third-party image requests.

No production deployment or main-branch changes are part of this work.
