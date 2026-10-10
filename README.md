# Christianity, apparently.

Static source for [christianityapparently.com](https://christianityapparently.com/).

## Questions

The searchable library lives in `questions.html`. Each of the 51 questions also has its own generated page under `questions/`.

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
