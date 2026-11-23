# WordPress migration notes

Source: https://kfraileyfineart.com (WordPress + Elementor). Inspected through the WordPress REST API (pages, all 72 media items) and rendered pages, on 2026-11-21.

The content manifest is `scripts/wordpress-content.json`. Every painting's title, dimensions, medium and sold status comes from the caption WordPress displayed directly under that same image on the Portfolio or Works in Plein Air page. The migration script re-checks each pairing against the live site before importing and stops if any caption doesn't match. No titles were inferred from file names or appearance.

## Please confirm with the artist

1. **Magic Hour and Light Show** (first two Portfolio images) had **no caption on the page**. Their title, size and medium come from the caption stored on the same image file in the WordPress media library:
   - *Magic Hour*: 20 × 40 in, oil on board
   - *Light Show*: 18 × 24 in, oil on board
2. **Units:** several Portfolio captions gave sizes without a unit (e.g. "30×40"). All dimensions are now shown as inches ("30 × 40 in") for consistency. Confirm all are inches.
3. **Pink Mesa:** the caption read "Oil on **Bard**"; imported as "Oil on board".
4. **Availability:** WordPress only ever said "Sold". Every painting without "Sold" was imported as **Not stated**, so nothing is shown and no painting is presented as available. The artist can mark pieces *Available* in the Studio.
5. **Alt text:** WordPress had none. Paintings were imported without descriptions, and the site falls back to "‹Title›, painting by Kristen Frailey". Layout photos (home image, portraits, contact images, logo) were given short factual descriptions written from viewing each image; please review them in the Studio.
6. **Pet portrait** on the Contact page (dog with a pink flower collar) has no title in WordPress. It is imported as a Contact-page image, not as an artwork. Supply a title if it should appear in a gallery.
7. **Contact recipient:** the old site had no public email address, and the WordPress form's delivery address isn't visible from outside. Set `CONTACT_TO_EMAIL` to the artist's inbox.
8. **Footer** text kept exactly as on the old site ("Copyright 2025 Kristen Frailey. All Rights Reserved"). It's editable in Site settings.

## Decisions made

- **One record per painting.** The home page used separate uploads of *Superior Glow*, *Sunrise on the Castle* and *Wasatch in Gold* (same paintings, re-uploaded). The home page now references the Portfolio records instead of duplicating them.
- **Highest-quality files.** Each image was imported from the original upload behind the file the page displayed. For example, *Superior Glow* is 9828 × 7352 px, where WordPress served a 2560 px copy. Aspect ratios were checked against WordPress's data for every image.
- **About portrait** uses the cropped version WordPress displayed (the artist had edited the crop there).
- **Logo:** the only usable logo is a 503 × 496 PNG with a removed background. It's imported with a crop that trims the empty margins. The browser-tab icon is a crop of the "KF" mark from the same file.
- **Navigation order:** Works in Plein Air now sits next to Portfolio (Home, Portfolio, Works in Plein Air, About, Contact). On the old site it was last.
- **Default SEO description:** the old one was auto-generated from page text. It's now the site's own tagline, "Art of Utah and the West by Kristen Frailey".
- **Gallery introductions:** none existed, so they're left empty (the field is available in the Studio).

## Not migrated (and why)

| WordPress media | Reason |
| --- | --- |
| `dog_lake.jpg` (2205) | Duplicate of `dog_lake-1.jpg` (identical file size); the page used `-1` |
| `Two-Medicine-1-min.jpeg` (2038) | Alternate upload; the page used `Two-Medicine-2-min` |
| `Dawn-Sentinel-jpeg*.jpeg` (37, 1646, 2028) | Earlier uploads; the page used `Dawn-Sentinel-jpeg-1-min-1` |
| `IMG_0944-min[1]` (2058), `IMG_6125.jpeg` (1946) | Duplicates of migrated images |
| `K-Frailey-Mountain-…-R-2-min`, `IMG_7323-1-min`, `Wasatch_in_Gold-new-1-min` (2100–2102) | Home-page duplicates; replaced by references (see above) |
| `Logo-new-Photoroom.jpg`, `Logo_new-removebg-preview(-1).png`, `Screenshot 2025-05-24…`, `7cad32ed…`, `IMG_4182-removebg-preview` | Other logo drafts; the site used `Logo_new-removebg-preview-2.png` |
| `header-hero`, `contact-hero`, `services-*`, `avatar_*`, `footer-hero-*`, `leaf`, `quotes.svg`, `logo-green/white.svg`, `demo-screenshot` | Theme starter-template images, not used on the live pages |
| `imagecompressor (4).zip` | Not an image |

## Old URLs

| Old | New |
| --- | --- |
| `/` | `/` |
| `/elementor-page-2022/` | `/portfolio` |
| `/elementor-page-2075/` | `/plein-air` |
| `/about-me/` | `/about` |
| `/elementor-page-1907/` | `/contact` |

Old image URLs (`/wp-content/uploads/…`) are not redirected and will stop working once the domain points at the new site.
