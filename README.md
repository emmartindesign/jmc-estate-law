# JMC Estate Law

Welcome to the **JMC Estate Law** project repository. This website provides clear, professional estate planning information and resources.

## ?? Project Overview & Color Palette

The project is styled with a professional, trustworthy palette tailored for legal services:
- **Primary / Trust Blue**: Deep navy / slate tones evoking confidence and stability.
- **Accent / Warm Gold**: Substantial, refined metallic accents for highlights and calls to action.
- **Neutrals**: Clean, readable off-white backgrounds with high-contrast dark slate text.

---

## ?? How to Preview Locally

You can preview the website locally on your computer using either of these methods:

1. **Direct File Open**: 
   - Double-click the [index.html](file:///c:/Users/Eric/OneDrive/Documents/GitHub/jmc-estate-law/index.html) file in your file explorer to open it directly in your web browser.
2. **Local Python Server** (Recommended for dynamic asset/JSON loading):
   - Open your terminal / command prompt in the project root directory.
   - Run the following command:
     `ash
     python -m http.server 8000
     `
   - Open your browser and navigate to: http://localhost:8000

---

## ?? How to Deploy to GitHub Pages

To host your site live on GitHub Pages:
1. Push your repository to GitHub.
2. Go to your repository on GitHub and click on **Settings**.
3. In the left sidebar, click on **Pages**.
4. Under **Build and deployment**, select **Deploy from a branch**.
5. Choose your main branch (or master) and the / (root) folder, then click **Save**.
6. Your site will be published live shortly at your GitHub Pages URL!

---

## ?? How to Add & Edit Articles

Articles and dynamic content are managed centrally via JSON data:
1. Open [data/articles.json](file:///c:/Users/Eric/OneDrive/Documents/GitHub/jmc-estate-law/data/articles.json) in your code editor.
2. Follow the existing JSON structure to add new article objects (including title, date, snippet, and content).
3. Save the file and refresh your local preview or redeploy.

---

## ?? Transitioning to Private Hosting & Re-enabling Search Engines

When you transition the site from preview/staging to a dedicated private hosting provider (or production domain):
1. **Search Engine Indexing (obots.txt)**:
   - By default, [obots.txt](file:///c:/Users/Eric/OneDrive/Documents/GitHub/jmc-estate-law/robots.txt) blocks all general search engines and AI crawlers.
   - To allow Google, Bing, and other search engines to index your site, open obots.txt and remove or comment out (#) the lines:
     `	ext
     User-agent: *
     Disallow: /
     `
   - Keep the individual AI bot disallow rules active if you wish to continue restricting AI scrapers.
2. **Domain & DNS Setup**: Point your domain registrar's DNS records to your private host.
3. **SSL/TLS**: Ensure an SSL certificate (HTTPS) is active for secure client connections.
