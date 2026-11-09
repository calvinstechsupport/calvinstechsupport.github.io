Calvin's Tech Support — Website Portfolio Entry
Live website: https://calvinstechsupport.dev/
Repository: https://github.com/calvinstechsupport/calvinstechsupport.github.io
Overview
A hand-built, responsive, multi-page static website for a student-run computer and IT support service in Cape Town.
Technologies verified in the source repository
- HTML5 — semantic content, navigation, forms and page metadata.
- CSS3 — responsive layouts, reusable components, visual styling and dark-mode presentation.
- Vanilla JavaScript (ES6+) — mobile menu, theme and accent preferences, local-storage persistence, and client-side form validation.
- Git and GitHub — version control and source repository.
- GitHub Pages — static-site hosting.
- Custom domain — calvinstechsupport.dev configured by the root-level CNAME file.
Features verified in source
- Separate pages for home, services, common problems, prices, gallery, diagnostics, FAQ, contact, privacy and computer repair.
- Responsive desktop and mobile navigation.
- Dark/light theme and accent-colour preferences saved in local storage.
- Client-side validation that prepares a WhatsApp enquiry; no server-side form storage.
- Search/share metadata, canonical URLs, Open Graph/Twitter tags, organisation JSON-LD, sitemap, robots file, custom 404 page and favicon.
Run locally
No Node.js build is required. From the repository root run:
python -m http.server 8000
Open http://localhost:8000.
CV description
Designed, developed and deployed a responsive multi-page technical support website using HTML5, CSS3 and vanilla JavaScript. Implemented mobile navigation, persistent display preferences, client-side enquiry validation and WhatsApp hand-off, and published the site through GitHub Pages with a custom domain.

Scope
This is a static front-end site. It does not currently include a server-side API, authentication, or database. The WhatsApp request flow opens a pre-filled message for the visitor to send; it does not store customer enquiries on the website.
