const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AI Decoder Workshop Guide</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Fira+Code:wght@400;500&display=swap" rel="stylesheet">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    @page {
      margin: 0.75in;
      size: letter;
    }

    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      font-size: 11pt;
      line-height: 1.6;
      color: #e5e5e7;
      background: linear-gradient(180deg, #0a0a0f 0%, #111118 100%);
      min-height: 100vh;
      padding: 2rem;
    }

    .container {
      max-width: 680px;
      margin: 0 auto;
    }

    .header {
      text-align: center;
      padding: 2rem 0 2.5rem;
      margin-bottom: 1rem;
    }

    .badge {
      display: inline-block;
      background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
      color: white;
      font-size: 10pt;
      font-weight: 600;
      padding: 0.4rem 1rem;
      border-radius: 20px;
      margin-bottom: 1rem;
      letter-spacing: 0.02em;
    }

    h1 {
      font-size: 28pt;
      font-weight: 700;
      color: #ffffff;
      margin-bottom: 0.75rem;
      letter-spacing: -0.03em;
    }

    .subtitle {
      font-size: 15pt;
      font-weight: 400;
      color: #86868b;
      margin-bottom: 0;
    }

    .subtitle span {
      background: linear-gradient(135deg, #818cf8 0%, #a78bfa 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      font-weight: 600;
    }

    h2 {
      font-size: 13pt;
      font-weight: 600;
      color: #ffffff;
      margin-top: 2rem;
      margin-bottom: 0.75rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    h2::before {
      content: '';
      display: inline-block;
      width: 4px;
      height: 1.2em;
      background: linear-gradient(180deg, #6366f1 0%, #8b5cf6 100%);
      border-radius: 2px;
      flex-shrink: 0;
    }

    h3 {
      font-size: 11pt;
      font-weight: 600;
      color: #ffffff;
      margin-top: 1rem;
      margin-bottom: 0.5rem;
    }

    .setup-box {
      position: relative;
      background: rgba(255, 255, 255, 0.03);
      border-radius: 16px;
      padding: 1.25rem 1.5rem;
      margin-bottom: 1.5rem;
      border: 1px solid rgba(255, 255, 255, 0.08);
    }

    .help-btn {
      position: absolute;
      top: 0.5rem;
      right: 0.5rem;
      background: rgba(239, 68, 68, 0.15);
      border: none;
      border-radius: 4px;
      padding: 0.35rem 0.85rem;
      cursor: pointer;
      color: #f87171;
      font-size: 12px;
      transition: background 0.2s, color 0.2s;
      display: flex;
      align-items: center;
      gap: 0.25rem;
      text-decoration: none;
    }

    .help-btn:hover {
      background: rgba(239, 68, 68, 0.28);
      color: #fca5a5;
    }

    .setup-box ol {
      margin-left: 1.25rem;
    }

    .setup-box li {
      margin-bottom: 0.35rem;
      color: #a1a1aa;
    }

    .prompt-section {
      margin-bottom: 1.5rem;
      page-break-inside: avoid;
    }

    .teaching-moment {
      background: rgba(251, 191, 36, 0.1);
      border-left: 3px solid #f59e0b;
      padding: 0.65rem 1rem;
      margin-bottom: 0.75rem;
      font-size: 10pt;
      border-radius: 0 10px 10px 0;
      color: #fbbf24;
    }

    .teaching-moment strong {
      color: #fcd34d;
    }

    pre {
      position: relative;
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
      color: #e2e8f0;
      font-family: 'Fira Code', 'SF Mono', monospace;
      font-size: 9.5pt;
      padding: 1.25rem;
      padding-top: 2.75rem;
      border-radius: 12px;
      overflow-x: auto;
      white-space: pre-wrap;
      word-wrap: break-word;
      line-height: 1.7;
      border: 1px solid rgba(99, 102, 241, 0.2);
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
    }

    .copy-btn {
      position: absolute;
      top: 0.5rem;
      right: 0.5rem;
      background: rgba(255, 255, 255, 0.1);
      border: none;
      border-radius: 4px;
      padding: 0.35rem 0.5rem;
      cursor: pointer;
      color: #9ca3af;
      font-size: 12px;
      transition: background 0.2s, color 0.2s;
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }

    .copy-btn:hover {
      background: rgba(255, 255, 255, 0.2);
      color: #fff;
    }

    .copy-btn.copied {
      background: #22c55e;
      color: #fff;
    }

    @media print {
      .copy-btn {
        display: none;
      }
    }

    .option-delete {
      color: #fb7185;
    }

    .placeholder {
      background: rgba(251, 191, 36, 0.2);
      padding: 0.1rem 0.3rem;
      border-radius: 3px;
      color: #fbbf24;
    }

    .pre-comment {
      color: #4b5563;
      display: block;
      margin-bottom: 0.25rem;
    }

    .tips-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 0.75rem;
      font-size: 10pt;
    }

    .tips-table th {
      background: rgba(255, 255, 255, 0.05);
      text-align: left;
      padding: 0.5rem 0.75rem;
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: #ffffff;
    }

    .tips-table td {
      padding: 0.5rem 0.75rem;
      border: 1px solid rgba(255, 255, 255, 0.1);
      vertical-align: top;
      color: #a1a1aa;
    }

    .tips-table tr:nth-child(even) {
      background: rgba(255, 255, 255, 0.02);
    }

    .bonus-box {
      background: rgba(255, 255, 255, 0.03);
      border-radius: 16px;
      padding: 1.25rem 1.5rem;
      margin-top: 1.5rem;
      border: 1px solid rgba(255, 255, 255, 0.08);
    }

    .bonus-box h3 {
      color: #ffffff;
      margin-top: 0;
    }

    .bonus-box.highlight {
      background: rgba(251, 191, 36, 0.08);
      border: 1px solid rgba(251, 191, 36, 0.2);
    }

    .bonus-box.highlight h3 {
      color: #fbbf24;
    }

    .whats-next-box {
      background: rgba(99, 102, 241, 0.07);
      border: 1px solid rgba(99, 102, 241, 0.25);
      border-radius: 16px;
      padding: 1.25rem 1.5rem;
      margin-top: 0.5rem;
    }

    .whats-next-list {
      list-style: none;
      margin: 0;
      padding: 0;
    }

    .whats-next-list li {
      display: flex;
      align-items: baseline;
      gap: 0.75rem;
      padding: 0.6rem 0;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      font-size: 11pt;
      color: #c4c4cf;
    }

    .whats-next-list li:last-child {
      border-bottom: none;
    }

    .whats-next-list .wn-icon {
      font-size: 13pt;
      flex-shrink: 0;
      width: 1.5rem;
      text-align: center;
    }

    .whats-next-list a {
      color: #818cf8;
      text-decoration: none;
    }

    .whats-next-list a:hover {
      text-decoration: underline;
    }

    .section {
      transition: opacity 0.5s ease, filter 0.5s ease;
    }

    .section-locked {
      opacity: 0.25;
      filter: blur(4px);
      pointer-events: none;
      user-select: none;
    }

    .next-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      margin: 1.5rem 0 0.25rem;
      padding: 0.7rem 1.5rem;
      background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
      color: white;
      border: none;
      border-radius: 10px;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      font-size: 11pt;
      font-weight: 600;
      cursor: pointer;
      transition: opacity 0.2s, transform 0.15s;
    }

    .next-btn:hover {
      opacity: 0.88;
      transform: translateY(-1px);
    }

    @media print {
      .next-btn {
        display: none;
      }
      .section-locked {
        opacity: 1;
        filter: none;
        pointer-events: auto;
        user-select: auto;
      }
    }

    footer {
      margin-top: 3rem;
      padding-top: 1.5rem;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      text-align: center;
      font-size: 10pt;
      color: #52525b;
    }

    @media print {
      body {
        padding: 0;
      }
      .prompt-section {
        page-break-inside: avoid;
      }
    }
  </style>
</head>
<body>
<div class="container">

  <!-- Header: always visible -->
  <div class="section" id="section-0">
    <div class="header">
      <div class="badge">ASO Ops | AI Workshop</div>
      <h1>Session 1: Build Your Own AI Decoder</h1>
      <p class="subtitle">with <span>Enchanté</span> and <span>Claude Code</span></p>
    </div>
  </div>

  <!-- Setup: visible by default -->
  <div class="section" id="section-1">
    <h2>⚡ Setup</h2>
    <p style="font-size: 10pt; color: #6b7280; margin-bottom: 0.75rem; margin-top: -0.25rem;">Follow these steps before the workshop</p>
    <div class="setup-box">
      <a class="help-btn" href="https://apple.enterprise.slack.com/archives/DJY1CF1AS" target="_blank" rel="noopener noreferrer">HELP!</a>
      <ol>
        <li><a href="https://enchante.hwe.apple.com" style="color: #818cf8;">Install Enchanté</a> on your Mac</li>
        <li>Go through Apple's GenAI <a href="https://genai.apple.com/usage/before-you-begin/" style="color: #818cf8;">Onboarding Wizard</a>.</li>
        <li>Open <strong>Enchanté</strong> on your Mac</li>
        <li>Select <strong>Claude Sonnet</strong> from the Model dropdown, and you're good to go!</li>
      </ol>
    </div>
    <button class="next-btn" data-reveals="section-2" onclick="revealNext(this)">Next step →</button>
  </div>

  <!-- Prompt 1 -->
  <div class="section section-locked" id="section-2">
    <h2>Prompt 1: Create the Basic Page</h2>
    <p style="font-size: 10pt; color: #a1a1aa; margin-bottom: 0.75rem;">Start a new conversation, copy and paste each prompt below, one at a time</p>
    <div class="prompt-section">
      <pre><span class="pre-comment"># Personalise the choices — delete the options you don't want!</span>
Build me a single-file HTML page called "AI Decoder" — a personal reference tool for learning AI terminology.

Include:
- A header with the title "<span class="placeholder">[YOUR TITLE — e.g. "Decode" / "AI Buddy" / "TermBot" / "Jargon Buster"]</span>" and subtitle "<span class="placeholder">[YOUR SUBTITLE]</span>"
- A search/filter box
- 5 starter terms: "Agent", "Prompt", "Token", "Model", "Hallucination"
- Each term should be a card with the term name, an emoji, and a one-sentence definition

Save it as index.html in a folder called "ai-decoder" in my Documents folder.</pre>
      <p style="margin-top: 0.75rem; font-size: 10pt; color: #6b7280;">⏸️ <em>The preview pane will open up with your Decoder page (this may take a minute or two...)</em></p>
    </div>
    <button class="next-btn" data-reveals="section-3" onclick="revealNext(this)">Next step →</button>
  </div>

  <!-- Prompt 2 -->
  <div class="section section-locked" id="section-3">
    <h2>Prompt 2: Make It Your Own (Simple)</h2>
    <div class="prompt-section">
      <div class="teaching-moment">
        💡 Short prompts give you less control. Try this first...
      </div>
      <pre>Make it look nicer.</pre>
      <br>
      <p style="font-size: 10pt; color: #6b7280;">⏸️ <em>What did it change? Was it what you wanted?</em></p>
    </div>
    <button class="next-btn" data-reveals="section-4" onclick="revealNext(this)">Next step →</button>
  </div>

  <!-- Prompt 3 -->
  <div class="section section-locked" id="section-4">
    <h2>Prompt 3: Make It Your Own (Detailed)</h2>
    <div class="prompt-section">
      <div class="teaching-moment">
        💡 Now let's be specific. See the difference!
      </div>
      <pre><span class="pre-comment"># 👇 Delete the options you don't want from each section:</span>
Update the decoder with these style improvements:

<span class="option-delete">THEME:</span>
- Dark theme (dark background, light text)
- Light theme (white background, dark text)
- High contrast (black background, bright accents)

<span class="option-delete">BACKGROUND:</span>
- Add a subtle gradient background (dark purple to dark blue)
- Add a subtle gradient background (dark teal to dark green)
- Add a subtle gradient background (dark red to dark orange)
- Keep it a solid color

<span class="option-delete">CARD STYLE:</span>
- Make the cards have a glassmorphism effect (semi-transparent with blur)
- Make the cards have a neumorphism effect (soft raised look)
- Make the cards have sharp borders with neon accents

<span class="option-delete">HOVER EFFECTS:</span>
- Add smooth hover effects on the cards (slight lift and glow)
- Add a subtle scale-up on hover
- Add a color shift on hover

<span class="option-delete">FONT:</span>
- Use Inter from Google Fonts
- Use DM Sans from Google Fonts
- Use Space Grotesk from Google Fonts
- Use JetBrains Mono from Google Fonts (monospace style)</pre>
    </div>
    <button class="next-btn" data-reveals="section-5" onclick="revealNext(this)">Next step →</button>
  </div>

  <!-- Prompt 4 -->
  <div class="section section-locked" id="section-5">
    <h2>Prompt 4: Add Interactivity</h2>
    <div class="prompt-section">
      <pre><span class="option-delete">MAKE THE CARDS EXPANDABLE:</span>
- Initially, show only the term and emoji
- When tapped, smoothly expand to reveal the definition</pre>
      <div class="teaching-moment" style="margin-top: 0.75rem;">
        💡 Try clicking on <strong>Reasoning</strong> to see how Enchanté is interpreting your request in real time, or click on <strong>Native Tools Edit</strong> to see what's happening 'under the hood'
      </div>
    </div>
    <button class="next-btn" data-reveals="section-6" onclick="revealNext(this)">Next step →</button>
  </div>

  <!-- Prompt 5 -->
  <div class="section section-locked" id="section-6">
    <h2>Prompt 5: Refine the UI</h2>
    <div class="prompt-section">
      <div class="teaching-moment">
        💡 AI doesn't always get it right first time. Iterate!
      </div>
      <pre><span class="option-delete">A COUPLE OF TWEAKS:</span>
- Only one card can be open at a time
- Add a visual indicator showing it can be expanded</pre>
    </div>
    <button class="next-btn" data-reveals="section-7" onclick="revealNext(this)">Next step →</button>
  </div>

  <!-- Prompt 6 -->
  <div class="section section-locked" id="section-7">
    <h2>Prompt 6: Add Your Own Terms (or use these suggestions)</h2>
    <div class="prompt-section">
      <pre><span class="option-delete">ADD THESE NEW TERMS TO THE DECODER:</span>

- Fine-tuning
- Context window
- Embedding
- RAG
- Temperature</pre>
      <p style="margin-top: 0.75rem; font-size: 10pt; color: #6b7280;">⏸️ <em>You just created cards for the new terms, and AI automatically added the definitions!</em></p>
    </div>
    <button class="next-btn" data-reveals="section-8" onclick="revealNext(this)">Next step →</button>
  </div>

  <!-- Prompt 7 -->
  <div class="section section-locked" id="section-8">
    <h2>Prompt 7: Make It Yours</h2>
    <div class="prompt-section">
      <p style="font-size: 10pt; color: #6b7280; margin-bottom: 0.5rem;">👇 <em>Choose one or more options below:</em></p>
      <pre><span class="option-delete">ADD A PERSONAL TOUCH:</span>

- Add a footer with my name: "Built by <span class="placeholder">[YOUR NAME]</span> | ASO OPS" and the text "with Enchanté"
- Add a "tip of the day" section at the top that shows a random AI tip
- Add a dark/light mode toggle
- Add a "copy definition" button on each card
- Add categories/tags to filter terms (e.g., "basics", "technical", "safety")</pre>
    </div>
    <div class="bonus-box" style="margin-top: 1.5rem;">
      <h3>🚀 Bonus Challenges</h3>
      <p style="font-size: 10pt; margin-bottom: 0.5rem;">If you finish early, try these:</p>
      <ul style="font-size: 10pt; margin-left: 1.25rem;">
        <li><strong>Run it in Safari:</strong> open Finder, go to ~/Documents/ai-decoder/index.html</li>
        <li><strong>Run it on your phone:</strong> send the HTML file to yourself, or share over iCloud</li>
        <li><strong>Export it:</strong> "Create a button that exports all terms as a JSON file"</li>
        <li><strong>Make it a quiz:</strong> "Add a quiz mode that shows definitions and asks me to guess the term"</li>
        <li><strong>Add animations:</strong> "Add a subtle entrance animation when the page loads"</li>
      </ul>
    </div>
    <button class="next-btn" onclick="revealAll(this)">Next step →</button>
  </div>

  <!-- What's Next -->
  <div class="section section-locked" id="section-9">
    <h2>What's Next?</h2>
    <div class="whats-next-box">
      <ul class="whats-next-list">
        <li>
          <span class="wn-icon">💬</span>
          <span>Join the <a href="https://apple.enterprise.slack.com/archives/C0ATE745KHP" target="_blank" rel="noopener noreferrer">ASO Ops AI Slack Channel</a></span>
        </li>
        <li>
          <span class="wn-icon">📋</span>
          <span><a href="#tips">Tips for great prompts</a> — a quick reference below</span>
        </li>
        <li>
          <span class="wn-icon">🖥️</span>
          <span>Feeling adventurous? <a href="#going-further">Go further with Claude Code in Terminal...</a></span>
        </li>
        <li>
          <span class="wn-icon">🎯</span>
          <span>Ready for Session 2? <a href="/asoworkshop-session2" target="_blank" rel="noopener noreferrer">See you there</a></span>
        </li>
      </ul>
    </div>
  </div>

  <!-- Tips for Great Prompts -->
  <div class="section section-locked" id="section-10">
    <h2 id="tips">Tips for Great Prompts</h2>
    <table class="tips-table">
      <tr>
        <th>Instead of...</th>
        <th>Try...</th>
      </tr>
      <tr>
        <td>"Make it better"</td>
        <td>"Increase the font size to 18px and add more padding"</td>
      </tr>
      <tr>
        <td>"Fix the colors"</td>
        <td>"Use a purple (#8B5CF6) accent color for interactive elements"</td>
      </tr>
      <tr>
        <td>"Add some features"</td>
        <td>"Add a button that copies the definition to clipboard"</td>
      </tr>
    </table>
    <p style="margin-top: 1rem; font-size: 10pt; text-align: center; color: #6b7280;"><strong>The more specific you are, the more control you have!</strong></p>
  </div>

  <!-- Going Further -->
  <div class="section section-locked" id="section-11">
    <div class="bonus-box highlight" id="going-further">
      <h3 style="color: #b45309;">🖥️ Going Further with Claude Code (Optional)</h3>
      <p style="font-size: 10pt; margin-bottom: 0.75rem;">Want to take your decoder to the next level? Try continuing in <strong>Claude Code</strong> — an AI assistant in your terminal.</p>

      <p style="font-size: 10pt; margin-bottom: 0.5rem;"><strong>Why switch to CLI?</strong></p>
      <ul style="font-size: 10pt; margin-left: 1.25rem; margin-bottom: 0.75rem;">
        <li><strong>Multi-file projects</strong> — split into separate HTML, CSS, and JS files</li>
        <li><strong>Git integration</strong> — commit, branch, and push without leaving the conversation</li>
        <li><strong>Run commands</strong> — start servers, run builds, execute scripts</li>
        <li><strong>Deploy</strong> — push to GitHub Pages or your own server</li>
      </ul>

      <p style="font-size: 10pt; margin-bottom: 0.5rem;"><strong>Setup:</strong></p>
      <ol style="font-size: 10pt; margin-left: 1.25rem; margin-bottom: 0.75rem;">
        <li>Open Terminal</li>
        <li>Follow the steps on the top half of <a href="https://pages.github.pie.apple.com/AI-for-Devs-Community/AppleClaudeCode/" style="color: #818cf8;">this page</a>, from Prerequisites, down to Launch.</li>
      </ol>

      <p style="font-size: 10pt; margin-bottom: 0.5rem;"><strong>Run Claude:</strong></p>
      <div class="cli-block" style="position: relative; background: rgba(0,0,0,0.3); border-radius: 8px; padding: 0.75rem 1rem; padding-right: 3rem; font-family: 'Fira Code', monospace; font-size: 9pt; margin-bottom: 0.75rem;">
        <div style="color: #86868b; margin-bottom: 0.25rem;"># Open Terminal, then:</div>
        <div style="color: #e2e8f0;">cd ~/Documents/ai-decoder</div>
        <div style="color: #e2e8f0;">claude</div>
      </div>
      <p style="font-size: 10pt; margin-bottom: 0.5rem;"><strong>Then try:</strong></p>
      <div class="cli-block" style="position: relative; background: rgba(0,0,0,0.3); border-radius: 8px; padding: 0.75rem 1rem; padding-right: 3rem; font-family: 'Fira Code', monospace; font-size: 9pt; margin-bottom: 0.75rem;">
        <div style="color: #e2e8f0;">"Split this into separate HTML, CSS, and JS files"</div>
        <div style="color: #86868b; margin: 0.25rem 0;"># or</div>
        <div style="color: #e2e8f0;">"Initialize a git repo and make the first commit"</div>
      </div>
    </div>

  </div>

  <footer>
    Built for Steve T's AI Workshop — Apple 2026 (v1.1)
  </footer>

</div>

  <script>
    function revealAll(btn) {
      document.querySelectorAll('.section-locked').forEach(s => s.classList.remove('section-locked'));
      btn.style.display = 'none';
      const first = document.getElementById('section-9');
      if (first) setTimeout(() => first.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    }

    function revealNext(btn) {
      const targetId = btn.getAttribute('data-reveals');
      const target = document.getElementById(targetId);
      if (target) {
        target.classList.remove('section-locked');
        setTimeout(() => {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      }
      btn.style.display = 'none';
    }

    const copyIcon = \`<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>\`;
    const checkIcon = \`<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>\`;

    function addCopyButton(element, getText) {
      const btn = document.createElement('button');
      btn.className = 'copy-btn';
      btn.innerHTML = copyIcon + ' Copy';
      btn.onclick = () => {
        const text = getText(element);
        navigator.clipboard.writeText(text).then(() => {
          btn.innerHTML = checkIcon + ' Copied';
          btn.classList.add('copied');
          setTimeout(() => {
            btn.innerHTML = copyIcon + ' Copy';
            btn.classList.remove('copied');
          }, 2000);
        });
      };
      element.appendChild(btn);
    }

    document.querySelectorAll('pre').forEach(pre => {
      addCopyButton(pre, el => el.textContent.replace(/Copy$/, '').trim()
        .split('\\n').filter(l => !l.trimStart().startsWith('#')).join('\\n').trim());
    });

    document.querySelectorAll('.cli-block').forEach(block => {
      addCopyButton(block, el => {
        return Array.from(el.querySelectorAll('div'))
          .map(div => div.textContent)
          .filter(text => !text.startsWith('#'))
          .join('\\n');
      });
    });
    fetch('/api/track', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{"page":"asoworkshop-session1"}' }).catch(function() {});
  </script>

</body>
</html>`

export async function GET() {
  return new Response(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  })
}
