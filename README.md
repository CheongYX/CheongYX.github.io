🚀 CYX's Digital Garden

Welcome to my personal digital garden! This project is a modern, geek-chic personal portfolio built with React + Vite + Tailwind CSS. It's not just a dynamic resume, but a knowledge accumulation platform supporting Advanced Markdown Rendering, Smart Single-File Content Slicing (Tabs), and Bilingual Switch (EN/ZH).

✨ Core Features

🎨 Geek Aesthetics & Immersive Visuals:

Full-screen portrait background with a gradient mask ensuring text legibility across all backgrounds.

Global Glassmorphism cards with interactive geeky mouse trails (TechTrail), click fireworks, and smooth transitions.

📝 Full-Powered Markdown Engine:

Decoupled code and content, supporting async fetching from the public folder.

Built-in VS Code style syntax highlighting, LaTeX Math, and Mermaid Charts.

Smart Path Detection: Just write os-deadlock in the config, and the engine auto-completes to /posts/en/os-deadlock.md.

📚 Dynamic Typography & Slicing Tech:

Immersive Article: Renders raw long-form articles natively, automatically stripping away legacy Front-matter metadata at the top of the file.

Smart Tabs (Project Tabs): For project-type articles, it supports cutting a single Markdown file into a smooth top-nav Tab interface using special HTML comments (e.g., <!-- tab: Architecture -->)!

Knowledge Collection: Organizes massive systems (like an "OS series") into an elegant navigation page with nested chapters and a floating Table of Contents (TOC).

🌐 i18n & Accessibility:

Bilingual (EN/ZH): One-click switch for the entire site's UI and article content.

Eye-Care Mode: One-click warm filter for a paper-like reading experience.

🛠️ Local Development & Quick Start

Make sure you have Node.js installed on your machine.

1. Start the Project

Assuming you have cloned the code, run the following in your terminal at the project root:

```text
npm install
npm run dev
```

Open your browser and visit http://localhost:5173 to preview.

✍️ Content Maintenance (The Core Magic)

The biggest highlight of this project is the minimalist configuration. You only need to focus on two places: the Markdown folder and src/data/timelineData.js.

1. Store Markdown Files

Put your .md files in the public/posts directory, categorized by language:

```text
public/
└── posts/
    ├── zh/              # Chinese Articles
    │   ├── os-deadlock.md
    │   └── my-robot.md
    └── en/              # English Articles
        ├── os-deadlock.md
        └── my-robot.md
```

2. Configure timelineData.js

Open src/data/timelineData.js and add your articles or series to the array.

Scenario A: Publishing a Normal Article / Series Collection

If you want to publish a series with a floating TOC on the left:

```css
{
  id: 1, 
  date: '2026.05', 
  title: lang === 'zh' ? '操作系统专栏' : 'OS Column',
  category: 'learning',  // Categories: learning, reading, life, etc.
  layout: 'collection', 
  description: 'Unpacking OS internals via interdisciplinary lenses.',
  tags: ['OS', 'Learning'],
  articles: [
    { 
      id: 'os-art1', 
      title: 'Lecture 1: Deadlocks', 
      // ✨ Magic: Just write the filename without extension!
      chapters: [{ id: 'ch1', title: 'Deadlock Analysis', content: 'os-deadlock' }] 
    }
  ]
}
```

Scenario B: Publishing a Project (Triggers Auto-Tabs!)

When your category is set to 'project', our auto-slicing magic activates.

Step 1: Configure in timelineData.js

```css
{
  id: 2, 
  date: '2026.06', 
  title: 'ESP32 Smart Robot',
  category: 'project', // 🚨 MUST be 'project' to trigger Tabs
  description: 'A full-stack hardware project.',
  tags: ['Hardware', 'IoT'],
  content: 'my-robot' // Your markdown filename
}
```

Step 2: Write slicing directives in your Markdown

Open your my-robot.md and use the <!-- tab: Tab Name --> directive to divide the content:

---
title: "ESP32 Smart Robot"
---

<!-- tab: Background -->
This is the content for the first page, e.g., the motivation behind this project...

<!-- tab: Architecture -->
This is the second page. 
\```javascript
// You can include perfectly highlighted code snippets here
console.log("Hello ESP32");
\```

<!-- tab: Final Result -->
This is the third page. Mermaid charts are fully supported!


Save it, and the engine will automatically render this article into an advanced UI with top Tab navigation—no need to split it into multiple files!

⚙️ Personalization

If you want to adapt this template as your own portfolio, please modify the following:

Basic Info: Open src/translations.js to change the title, bio, and location fields.

Contact Email: Open src/App.jsx, search for the myEmail variable, and insert your actual email. The floating email button will work instantly.

Social Links & Avatar: Open src/components/AppLayout/LeftPanel.jsx to change the background image URL and your GitHub/LinkedIn links.

☁️ Deploy to GitHub Pages

Add this property to the root of your package.json:

```text
"homepage": "https://<your-username>.github.io/<your-repo-name>",
```

Install gh-pages via terminal:

```text
npm install gh-pages --save-dev
```

Update the scripts in package.json:

```json
"scripts": {
  "predeploy": "npm run build",
  "deploy": "gh-pages -d dist"
}
```

Run the deployment command:

```text
npm run deploy
```