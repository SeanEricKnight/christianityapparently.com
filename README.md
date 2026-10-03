# Christianity, apparently.

Static source for [christianityapparently.com](https://christianityapparently.com/).

## Questions

The searchable library lives in `questions.html`. Each of the 50 questions also has its own generated page under `questions/`.

The single source of question content is:

```
questions-data.json
```

After editing that file, regenerate the standalone pages with:

```bash
node scripts/build-questions.js
```

The generated pages include their own canonical URL, social metadata, Article structured data, and related-question links.

When questions are added or removed, also update the searchable index and `sitemap.xml`.


## Questions

The searchable library at `questions.html` and all standalone question pages are generated from `questions-data.json`.

Regenerate both with:

`node scripts/build-questions.js`

## Photography

Photos are chosen by **section**, not per page, and hotlinked from Unsplash under the [Unsplash License](https://unsplash.com/license). One quiet image per page; sections reuse their image on purpose. The mapping lives at the bottom of `styles.css` (one CSS variable per image, one rule per section). To swap an image, change its variable.

| Section | Pages | Photo |
| --- | --- | --- |
| Path (journey) | Home, Basics, Gospel, Grow, Following, Decision, Saved, Prayer, Walked away, About, Point people to Jesus | Rosalie Gdy — [unsplash.com/photos/qPwkRwfxJjY](https://unsplash.com/photos/qPwkRwfxJjY) |
| Inquiry | Questions hub, all `/questions/` pages, Doubt | Yen Vu — [unsplash.com/photos/tdLECRb5r6E](https://unsplash.com/photos/tdLECRb5r6E) |
| Study | Courses hub, all `course-*` pages | Derek Prince Ministries — [unsplash.com/photos/mQ6ijrKO2I0](https://unsplash.com/photos/mQ6ijrKO2I0) |
| Bible | Bible, Scripture, Jesus, God, Trinity, Holy Spirit, Afterlife, What I believe | Shane Hoving — [unsplash.com/photos/SZaxKdLwz6o](https://unsplash.com/photos/SZaxKdLwz6o) |
| Church | Church, Baptism, Communion | studiopipin — [unsplash.com/photos/6ge393BomYU](https://unsplash.com/photos/6ge393BomYU) |
| Life Issues: rain window | Grief, Suffering, Hurting | Suhyeon Choi — [unsplash.com/photos/HCDugQDdtfc](https://unsplash.com/photos/HCDugQDdtfc) |
| Life Issues: quiet window | Life hub, Anxiety, Shame | Tīna Sāra — [unsplash.com/photos/jy-uS8iJhX4](https://unsplash.com/photos/jy-uS8iJhX4) |
| Life Issues: bench | Loneliness | Andrew Krotov — [unsplash.com/photos/qXJ77NsG478](https://unsplash.com/photos/qXJ77NsG478) |
| Life Issues: two mugs | Marriage | Florian Siedl — [unsplash.com/photos/GPWpmI-7KXw](https://unsplash.com/photos/GPWpmI-7KXw) |
| Life Issues: empty street | Addiction | C — [unsplash.com/photos/uf-qkYmbczA](https://unsplash.com/photos/uf-qkYmbczA) |
