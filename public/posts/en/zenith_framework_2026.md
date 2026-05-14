---
title: Zenith Portfolio Framework: Building a Custom "Digital Garden" Rendering Engine for Developers
layout: project
date: "2026-05-03"
categories: JavaScripts
tags: React, Vite, Tailwind CSS, Markdown, Framer Motion
---

<!-- tab: Project Background -->

Zenith is a customized Markdown rendering and static site generation framework built with React and Vite. The framework is designed to provide a structured, stable, and Web-based solution for rendering long-form technical documentation, project retrospectives, and code showcases. By rewriting the underlying rendering logic, it bridges the gap between standard Markdown syntax and complex rich-text interactivity.

### Development Background and Requirements Analysis

When building a personal technical portfolio, traditional static blog generators or generic web templates often struggle to simultaneously achieve "efficient organization of content" and "precise control of layout." Technical articles usually contain lengthy logical arguments, complex architectural diagrams, console logs with long paths, and specific formatted mathematical formulas. Directly using a single-page, waterfall-style Markdown rendering would lead to information density overload, requiring users to scroll frequently to find key information.

Therefore, the development goals of this framework focused on the following three core requirements:

1.  **Content Modular Organization**: The system needs the ability to dynamically split a single long Markdown file into multiple parallel tabs, allowing users to switch seamlessly between dimensions like "Background," "Tech Stack," and "Results," thereby optimizing the reading experience.
2.  **Robust Responsive Layout**: When handling unbreakable long strings (like file paths) or large side-by-side images, the framework must enforce boundary constraints to prevent horizontal overflow layout errors at any resolution, especially on mobile devices.
3.  **Extended Syntax Support**: Beyond standard Markdown syntax, the system needs native support for GitHub-flavored tables, LaTeX mathematical formula parsing, and advanced code highlighting blocks with line numbers and adaptive wrapping.

<!-- tab: Technical Implementation -->

### Core Architecture and Functionality

The core of the framework is an `AsyncMarkdown` component with approximately 500 lines of logic, mainly composed of a content slicing engine and an enhanced Markdown parsing pipeline. The design principle of this architecture is high decoupling and modularity, isolating text parsing, state management, DOM rendering, and event broadcasting into different processing units.

#### 1. Dynamic Slicing and State Machine Engine

In traditional static site generators, multi-page content usually needs to be physically split into separate Markdown files and statically mapped in the front-end routes. This method not only increases the maintenance cost of the file system but also breaks the semantic continuity of the same project documentation.

Zenith introduces a content preprocessing state machine based on regex interception. Before feeding the Markdown text to the underlying React parsing tree, the component first treats it as a large string and performs non-greedy regex matching with the global flag (`g`) and the ignore-case flag (`i`):

```text
const tabRegex = /<!--\s*tab:\s*(.+?)\s*-->/gi;
```

**Slicing Execution Flow:**

1.  **Pointer Traversal**: The regex engine continuously searches the document for `<!-- tab: [Name] -->` markers using the `exec()` method. Within the loop, it tracks the end position of the current matched segment by recording the `lastIndex` property.
2.  **Block Interception**: For each match, the system uses `slice()` to extract the text content between the previous `lastIndex` and the current match's `index`, stripping excess carriage returns and whitespace using `trim()`.
3.  **State Packaging**: The extracted plain text is assembled with the current tab name into a JavaScript object `{ title: currentTitle, content: tabContent }`, which is then pushed into a predefined `rawTabs` array.
4.  **Fallback Handling Mechanism**:
    -   **Leading Orphan Node Handling**: If introductory paragraphs at the beginning of the document are not wrapped by any `<!-- tab: xxx -->` declaration, the system injects a default title based on the locale. Using a ternary expression like `lang === 'en' ? "Intro" : "Introduction"` ensures the first block always has a valid state ownership.
    -   **Trailing Interception Compensation**: After the loop ends, the system checks for any remaining text from the last match to the end of the file; if not empty, it is pushed onto the stack as the last tab's content.

Finally, via `setTabs(rawTabs)`, the one-dimensional Markdown text is transformed into a structured React state tree. The view layer can then achieve O(1) complexity DOM replacement using just the `activeTabIdx` index, realizing the lightweight management concept of "Markdown as State".

#### 2. AST Interception and Rendering Pipeline Enhancement

The core mechanism of ReactMarkdown does not directly convert Markdown to an HTML string; instead, it parses it into an Abstract Syntax Tree (AST) and then recursively renders the corresponding React components. Zenith deeply intervenes in the construction of this rendering tree.

**Plugin Matrix:**

- **Remark Layer (Markdown Syntax Conversion)** :
  - `remark-gfm`: Extends the base CommonMark specification, enabling the AST to recognize and construct nodes for tables (`table`, `th`, `td`), task lists (`tasklist`), strikethroughs, and other GitHub Flavored Markdown-specific node types.
  - `remark-math`: Intercepts nodes declared with `$` or `$$`, marking them as inline or block-level math formula AST nodes.
- **Rehype Layer (HTML AST Conversion & Injection)** :
  - `rehype-katex`: Receives the math nodes generated by `remark-math` and converts them into complex DOM trees (containing many nested `span` structures) that browsers can render directly, enabling the display of LaTeX formulas with extremely precise typography.
  - `rehype-raw`: The core unlock feature. It allows the parser to retain raw HTML strings (such as custom Flexbox containers or `<img/>` tags with inline CSS) written directly in the Markdown file, enabling these custom DOM structures to be seamlessly incorporated into the final rendering tree.

**Custom Component Overrides:**

The framework uses the `components` property to intercept renderers for specific AST nodes. For example, all heading elements (`h1` through `h6`) are rewritten. The custom `<Heading />` component, when mounted, executes a recursive `extractText` function to strip bold, italic, or link nodes within the heading, extracting the plain text. Then, using a regex `/[^\w\-\u4e00-\u9fa5]/g` to filter illegal characters, it dynamically generates and injects an HTML5-compliant `id` attribute, appending the `scroll-mt-32` style. This perfectly solves the common UX bug where the heading is obscured by a sticky navbar during anchor jumps.

#### 3. Deep Refactoring and Encapsulation of Code Containers

The core of technical documentation lies in code presentation. The default `<pre><code>` tag combination is extremely rudimentary visually and functionally. The framework intercepts global code rendering nodes and implements heavy encapsulation using `react-syntax-highlighter`.

**Container Structure Breakdown:**

When a code block with a language flag (i.e., `!inline && match` is true) is detected, the system discards the default rendering and constructs a complex composite container:

1.  **Mac OS-style Top Bar Structure**: Builds an independent top bar with a dark gray (`#1e1e1e`) background. On the left, it draws three red, yellow, and green circular `div` nodes with slight shadows (`shadow-sm`) using Tailwind CSS. The middle section dynamically extracts the language alias captured by the regex `/language-([a-zA-Z0-9_+#-]+)/` (e.g., correcting `c++` to `cpp` which the highlighter engine recognizes via conditional checks) and displays it in uppercase, high letter-spacing, centrally aligned, greatly enhancing the professionalism of the information presentation.
2.  **Highlighter Engine Injection & Tuning**:
    - Applies the `vscDarkPlus` theme object, reproducing the syntax coloring scheme of Visual Studio Code 1:1 on the Web.
    - Replaces the default `<pre>` wrapper with `PreTag="div"` to eliminate browser-specific margin differences for native HTML tags and injects a consistent `1.25rem` padding within `customStyle`.
    - Enables the `showLineNumbers` property, which can often introduce left-side visual overlap. To address this, the system finely tunes parameters within `lineNumberStyle`: sets `minWidth: '2.5em'` to provide sufficient placeholder width, `paddingRight: '1em'` to ensure visual breathing space between numbers and code text, and sets the color to low-contrast `#6e7681` to keep it at a secondary visual hierarchy.

#### 4. Dynamic Interceptor for Mermaid Diagrams

The architecture design supports not just static text. In the code node interception function, the system adds a front-end logic gateway:

```JavaScript
if (hlLang === 'mermaid') {
  return <MermaidChart chart={codeText} />;
}
```

When a tag labeled `mermaid` is detected, the component immediately halts the highlighting rendering pipeline and passes the raw code string (`codeText`) to a wrapped `<MermaidChart />` child component.

Inside its `useEffect` lifecycle hook, this child component uses `Math.random().toString(36)` to generate a globally unique DOM ID. It then calls the underlying `mermaid.render()` asynchronous API. Once the Mermaid engine completes lexical analysis and generates an SVG vector graphics object, the component mounts it directly onto the DOM tree via `ref.current.innerHTML`. Through this interception mechanism, Zenith achieves the rich-text capability of "compiling code into architectural diagrams in real-time" without introducing heavy third-party iframes.

<!-- tab: Problem Solving -->

### Layout and Rendering Exception Handling

During framework development and cross-device testing, I encountered several edge cases that conflicted with browser rendering rules or Markdown parsing specifications. Here are the five core layout and rendering challenges tackled during development:

#### 1. Image Overflow in Flexbox Layout

- **Problem**: When displaying multiple images side-by-side (e.g., comparing metrics before/after optimization), I used a Flexbox container. However, with high-resolution source files, large images would ignore the parent container's width limit due to their intrinsic size, causing horizontal page overflow.
- **Solution**: After deep analysis of CSS Flexbox layering rules, I identified the root cause as the default `min-width` control of child elements. I therefore enforced a specific HTML template for all side-by-side containers in the framework specification:

```html
<div style="display: flex; flex-wrap: wrap; gap: 16px; width: 100%;">
  <div style="flex: 1 1 0%; min-width: 0;">
    <img src="..." style="max-width: 100%; height: auto;" />
  </div>
</div>
```

Injecting the `min-width: 0` property ensures images no longer stretch the container based on their original resolution but strictly scale responsively according to the parent container's available width.

#### 2. Container Breakage from Long Plain-Text Logs

- **Problem**: When displaying backend logs, text often contained long, continuous file paths without spaces (e.g., `.../data/sessions/Player_20260507/Turn5_Heatmap.png`). When a code block's language was marked as plain text (`text`), the highlighter plugin's default `white-space: pre` property prevented standard line wrapping, forcing the code block to widen the parent container.
- **Solution**: Forced intervention by injecting specific CSS wrapping properties into the `<SyntaxHighlighter>` component via `codeTagProps`:

```JavaScript
codeTagProps={{ 
  style: { 
    whiteSpace: 'pre-wrap', 
    wordBreak: 'break-all', /* Force break: breaks at boundaries even without spaces */
    overflowWrap: 'anywhere' 
  } 
}}
```

Combined with the `min-w-0 break-words` properties on the outer article container, a strict wrapping priority was established, ensuring all long strings wrap upon reaching the right edge.

#### 3. Cross-Language Layout Differences Due to Markdown Blank Lines

- **Problem**: Rendering differences appeared during testing of mixed Chinese-English documentation: images in the Chinese version displayed normally, while the same image in the English version was anomalously stretched to fill the entire screen width.
- **Root Cause**: DOM structure analysis revealed that the Markdown parser is extremely sensitive to blank lines. In Chinese typography, images often sit close to text and are parsed as inline images. However, due to paragraph habits in English, blank lines were often present, causing the image to be parsed as a block image. The Tailwind `prose` mode then automatically stretched it to 100% width.
- **Solution**: Completely abandoned the native `![]()` syntax in the documentation writing specification. Leveraged the inline HTML support brought by `rehype-raw`, uniformly using the `<div align="center"><img src="..." width="80%" /></div>` structure to explicitly lock the image's maximum width and center alignment using CSS, eliminating the risk caused by inconsistent Markdown parser behavior.

#### 4. Conflict Between Anchor Jump Scrolling and Fixed Header Obscuration

- **Problem**: The system dynamically generated a Table of Contents based on headings. When users clicked a TOC link triggering an anchor jump, the browser default behavior aligned the top edge of the target heading element with the very top of the screen, causing the heading to be obscured by the page's sticky Tab bar, affecting reading continuity.
- **Solution**: Avoided complex JavaScript scroll offset calculations and instead rewrote the `<Heading>` rendering component of `ReactMarkdown`. Injected the Tailwind CSS utility class `scroll-mt-32` (corresponding to native CSS `scroll-margin-top` property) into dynamically generated heading tags. When the anchor scroll is triggered, the browser automatically reserves a fixed safety space above the element, ensuring the heading remains fully visible.

#### 5. Parsing Anomaly with Mixed `<details>` Tag and Markdown

- **Problem**: When embedding HTML details disclosure tags (`<details>` and `<summary>`) in Markdown text to hide lengthy code, if the surrounding indentation or blank lines didn't meet strict specifications, the Markdown parser would render incorrectly: internal text could be truncated, the disclosure structure could break, or the tags could be output as plain text.
- **Solution (Text Preprocessing Fix)**: Based on the Markdown specification requiring blank lines around HTML block elements, I introduced a lightweight regex data cleaning mechanism within the `processContent` function:

```JavaScript
cleanBody = cleanBody
  .replace(/<details[^>]*>/gi, '\n\n$&\n')
  .replace(/<summary[^>]*>[\s\S]*?<\/summary>/gi, '$&\n\n')
  .replace(/<\/details>/gi, '\n\n$&\n\n');
```

Before feeding the text to the AST parsing tree, double newline characters (`\n\n`) are forcibly injected around the details tags. This preprocessing protects the semantic structure of the HTML elements, ensuring that the Markdown syntax wrapped inside is correctly recognized and rendered by the engine.

<!-- tab: Final Results -->

The Zenith framework is now stable and has successfully hosted complex project documentation spanning multiple domains, including full-stack applications and embedded hardware logs. By decoupling layout logic from content creation, the framework significantly reduces the maintenance cost of formatting technical documentation.

1.  **Desktop vs. Mobile Comparison**:

```html
<div style="display: flex; flex-wrap: wrap; gap: 16px; width: 100%;">
  <div style="flex: 1 1 0%; min-width: 0;">
    <img src="/images/zenith/desktop_view_demo.png" style="max-width: 100%; border-radius: 8px; border: 1px solid #e2e8f0; margin: 0;" />
    <p align="center" style="font-size: 0.9em; color: #64748b;">Desktop Multi-Tab Display</p>
  </div>
  <div style="flex: 1 1 0%; min-width: 0;">
    <img src="/images/zenith/mobile_view_demo.png" style="max-width: 100%; border-radius: 8px; border: 1px solid #e2e8f0; margin: 0;" />
    <p align="center" style="font-size: 0.9em; color: #64748b;">Mobile Wrapping Effect</p>
  </div>
</div>
```

Desktop wide-screen display effect
![Computer_sight](/images/Zenith_2026/Computer_sight.png)

Mobile narrow-screen display effect
<video src="/images/Zenith_2026/Phone_sight.mp4" autoplay loop muted playsinline width="30%" class="rounded-xl"></video>

2.  **Interaction Demo Video (MP4)** :

```html
<div align="center">
  <img src="/images/zenith/tab_switching_demo.gif" width="80%" style="border-radius: 8px; border: 1px solid #e2e8f0;" />
  <p align="center" style="font-size: 0.9em; color: #64748b;">Seamless Single-Page Multi-Tab Switching</p>
</div>
```

<video src="/images/Zenith_2026/Tab_Shifting.mp4" autoplay loop muted playsinline width="100%" class="rounded-xl"></video>

3.  **Advanced Typography Close-up**:

    A high-resolution close-up showcasing complex mathematical formulas (LaTeX) and a code highlighting block with line numbers, demonstrating the precision of the rendering engine.

```html
<div align="center">
  <img src="/images/zenith/code_and_math_demo.png" width="80%" style="border-radius: 8px; border: 1px solid #e2e8f0;" />
  <p align="center" style="font-size: 0.9em; color: #64748b;">Rendering Precision of Complex Formulas and Code Blocks</p>
</div>
```

![LaTex](/public/images/Zenith_2026/latex_show.png)
