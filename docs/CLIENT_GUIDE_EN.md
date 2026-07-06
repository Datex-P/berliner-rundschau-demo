# Client Guide — Berliner Rundschau

Welcome to your new Berliner Rundschau website! This document explains how to manage content and complete common tasks — no technical knowledge required.

---

## What can this website do?

The Berliner Rundschau is a complete news portal with the following sections:

- **Homepage** — Featured story, current news, newsticker, and videos
- **Articles** — In-depth reports with image, category, and author
- **Categories** — Organised topic areas (e.g. Politics, Economy, Culture)
- **Authors** — Profile pages with short biography and article list
- **Search** — Full-text search across all articles
- **Dark mode** — Switches automatically or manually
- **Premium content** — Paywall for selected articles

---

## Editing content

### How is content managed?

This website currently uses **demo content** embedded directly in the source code. To publish new articles, categories, or authors, you need a developer to update the content in the file `src/lib/mock.ts` or connect the system to a content management system (CMS).

> **Recommendation:** For independent content management, we recommend connecting to a CMS such as Contentful, Storyblok, or WordPress. Please discuss this with your developer.

---

## Content types

### Articles

An article consists of the following fields:

| Field | Description | Required |
|-------|-------------|----------|
| Headline | Title of the article | Yes |
| Teaser | Short summary (1–2 sentences) | Yes |
| Body | Full article text | Yes |
| Image | Main image with image description | Yes |
| Category | Topic area (e.g. Politics) | Yes |
| Author | Writer of the article | Yes |
| Tags | Topic keywords (comma-separated) | No |
| Reading time | Estimated reading time in minutes | No |
| Premium | Is the article paid content? | No |
| Breaking news | Displayed as a breaking news alert | No |
| Opinion | Mark as opinion piece | No |
| Featured | Shown prominently on the homepage | No |

### Categories

A category has the following fields:

| Field | Description |
|-------|-------------|
| Name | Display name (e.g. Politics, Economy) |
| Description | Short introduction to the category |
| Colour | Accent colour for the category |
| Subcategories | Optional sub-topics |

### Authors

An author has the following fields:

| Field | Description |
|-------|-------------|
| Name | Full name |
| Biography | Descriptive text for the profile page |
| Role | e.g. Reporter, Editor-in-Chief |
| Profile image | Square photo (recommended: 200×200 pixels) |

### Breaking news

Breaking news alerts appear prominently on the homepage:

| Field | Description |
|-------|-------------|
| Headline | Short, concise text |
| Link | Target article |
| Severity | "Breaking" or "Alert" |
| Expiry time | Optional: when should the alert disappear? |

---

## Images

### Recommended image sizes

| Usage | Width × Height | Format |
|-------|---------------|--------|
| Article main image | 1200 × 675 pixels | JPG or WebP |
| Teaser / card image | 800 × 450 pixels | JPG or WebP |
| Author profile image | 200 × 200 pixels | JPG or WebP |
| Video thumbnail | 640 × 360 pixels | JPG or WebP |

### Image rules

- Always provide an **image description** (alt text) so visually impaired users can understand the content
- Maximum file size: **2 MB** per image
- Use **JPG** for photos and **PNG** for graphics with text or transparent backgrounds
- Images are automatically optimised for different screen sizes

---

## Common tasks

### How do I create a new article?

As this website uses demo content, articles can currently only be added by a developer. Once connected to a CMS, you will be able to write articles directly in your browser.

Information needed for a new article:
1. Headline and teaser
2. Full article text
3. Main image (1200×675 pixels)
4. Select a category
5. Assign an author
6. Add tags
7. Set premium status (free, paid, or metered)

### How do I change an image?

Images can currently only be replaced by a developer. Provide the developer with the new image in the recommended size and specify the associated article.

### How do I change the navigation?

The navigation (main menu and footer links) can currently only be changed by a developer. Tell the developer which categories and links should appear.

### Which fields are required?

For articles, at minimum **headline, teaser, body, image, category, and author** must be provided.

---

## What you can do yourself / what needs a developer

| Task | Self-service | Developer needed |
|------|-------------|-----------------|
| Write a new article | After CMS connection: Yes | Currently: Yes |
| Replace an image | After CMS connection: Yes | Currently: Yes |
| Update navigation | After CMS connection: Yes | Currently: Yes |
| Add categories | After CMS connection: Yes | Currently: Yes |
| Change colours / design | No | Yes |
| Add new features | No | Yes |
| Change domain | No | Yes |
| Set premium pricing | No | Yes |

---

## Data protection & legal notice

The website includes pages for **privacy policy** (`/datenschutz`) and **legal notice** (`/impressum`). These texts must be filled in by you or a legal advisor before the website goes live.

> **Important:** As a German media company, you are legally required to publish a complete legal notice (Impressum) and an up-to-date privacy policy.

---

## Support

For technical questions or requests, please contact your developer or the agency managing the project.
