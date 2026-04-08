"use client";

import { useState, useEffect, useRef } from "react";

const SEED_GLOSSARY = [
  { term: "Agent", emoji: "🤖", definition: "An AI system that can take actions on its own — not just answer questions, but actually do things: browse the web, write code, send messages, manage files.", examples: [{ label: "Claude agent browsing the web", url: "https://www.anthropic.com/claude" }, { label: "AutoGPT (early popular agent)", url: "https://github.com/Significant-Gravitas/AutoGPT" }], deepDive: ["What's the difference between an AI chatbot and an AI agent? Give me a concrete example of each, and explain when you'd use one vs the other.", "What are the biggest failure modes of AI agents in production today, and how do teams guard against them?", "How do you decide when a task should be handled by a single AI call vs a multi-step agent?"], smartLines: ["An agent can book a meeting or pull a report — things a chatbot would just tell you how to do yourself.", "Saying 'I have an agent on it' sounds better than 'automated script', and is usually more accurate."], tag: "Behaviour", seeded: true },
  { term: "Agentic", emoji: "⚡", definition: "Adjective for AI behaviour that's goal-driven and multi-step — the AI works out what to do next, rather than just responding to a single question.", examples: [{ label: "Anthropic on agentic AI", url: "https://www.anthropic.com/research/building-effective-agents" }], deepDive: ["Explain 'agentic AI' like I'm a product manager. What does it mean in practice for building products? What are the risks?", "What's the difference between 'agentic' and 'autonomous' AI? Where does one end and the other begin?", "Give me three real products that are meaningfully agentic, and explain what makes each agentic vs just a chatbot."], smartLines: ["The difference between agentic and a chatbot: one gives you instructions, the other just does it.", "Our workflow is fully agentic — the AI handles the steps, we handle explaining it to everyone else."], tag: "Behaviour", seeded: true },
  { term: "Model", emoji: "🧠", definition: "The AI brain itself — software trained on vast amounts of text that reads your input and generates a response. GPT-4, Claude, and Gemini are all different models with different strengths.", examples: [{ label: "Anthropic model overview", url: "https://docs.anthropic.com/en/docs/about-claude/models/overview" }, { label: "OpenAI model comparison", url: "https://platform.openai.com/docs/models" }], deepDive: ["Compare the major frontier AI models available today (Claude, GPT-4o, Gemini, Llama) — strengths, weaknesses, best use cases, cost differences.", "How do you pick the right model for a production product — what trade-offs matter most between speed, cost, and quality?", "What does 'model capability' actually mean in practice — how do benchmark scores translate to real-world product quality?"], smartLines: ["We switched models and output quality improved — not all models are equal for every task.", "Claude handles nuance well, GPT-4o is fast, Llama runs locally. Picking the right one matters."], tag: "Model", seeded: true },
  { term: "CLI", emoji: "💻", definition: "Command Line Interface — you type commands into a terminal window instead of clicking through an app. How developers talk to their computers, and increasingly how they use AI tools.", examples: [{ label: "Claude Code CLI", url: "https://docs.anthropic.com/en/docs/claude-code/overview" }, { label: "GitHub CLI", url: "https://cli.github.com/" }], deepDive: ["I'm a non-developer learning to use the CLI for AI development. Give me the 10 commands I'll use most often, with plain-English explanations.", "What's the fastest way to get comfortable with the CLI as a non-technical founder building AI tools?", "How is the CLI used differently in AI development vs traditional software development? What new patterns have emerged?"], smartLines: ["Once you're comfortable with the CLI, it's faster than any app — the learning curve is the only real barrier.", "The CLI does exactly what you type, nothing more. That's both the appeal and the occasional problem."], tag: "Dev Tool", seeded: true },
  { term: "IDE", emoji: "🖥️", definition: "Integrated Development Environment — a powerful text editor for writing code, with tools built in to help you navigate, debug, and ship faster. Cursor and VS Code are the popular ones right now.", examples: [{ label: "Cursor (AI-native IDE)", url: "https://cursor.com" }, { label: "VS Code", url: "https://code.visualstudio.com/" }], deepDive: ["Compare Cursor vs VS Code for someone building AI-powered web apps as a side project. Which should I use and why?", "What AI IDE features actually save meaningful time vs feel impressive but don't change your workflow?", "How do AI-native IDEs like Cursor change how you should think about writing and structuring code?"], smartLines: ["Switched to an AI-native IDE and haven't looked back — it handles the repetitive parts so you can focus on the interesting ones.", "Cursor and VS Code are the main options — both solid, but Cursor is built with AI at the core."], tag: "Dev Tool", seeded: true },
  { term: "Token", emoji: "🪙", definition: "The unit AI models use to measure text — roughly ¾ of a word. Every message you send and receive uses tokens, and that's what you're billed for. 1,000 tokens ≈ 750 words.", examples: [{ label: "Anthropic pricing (tokens)", url: "https://www.anthropic.com/pricing" }], deepDive: ["Explain AI token economics to me like I'm building a subscription product. How do I model costs vs revenue at scale?", "What's the most common mistake founders make when estimating token costs for their AI product?", "How do context window size and token count interact — and what does that mean for product design decisions?"], smartLines: ["Every message you send uses tokens — inputs and outputs both count, so longer conversations cost more.", "Knowing your token usage per request is the first step to making your AI costs predictable."], tag: "Economics", seeded: true },
  { term: "Context Window", emoji: "🪟", definition: "How much text an AI can hold in mind at once — its working memory. Bigger windows cost more but let you work with longer documents and conversations without the AI losing track.", examples: [{ label: "Claude's 200k context window explained", url: "https://www.anthropic.com/news/claude-2-1" }], deepDive: ["What are the practical implications of context window size when building a product like a daily briefing tool? When does it matter, when doesn't it?", "How should I design my app's architecture differently depending on whether I have a small vs large context window?", "What happens when you hit the context window limit in production — and what are the best strategies to handle it gracefully?"], smartLines: ["The context window is why your AI forgot something you mentioned earlier in a long conversation. Entirely by design.", "We hit the limit mid-document. The AI now has very confident opinions about page one."], tag: "Economics", seeded: true },
  { term: "RAG", emoji: "📚", definition: "Retrieval-Augmented Generation — instead of relying on the model's memory, you pull in relevant documents at the moment of asking and include them with the question. Usually smarter than fine-tuning.", examples: [{ label: "What is RAG?", url: "https://aws.amazon.com/what-is/retrieval-augmented-generation/" }], deepDive: ["Explain RAG vs fine-tuning for a non-technical founder building a B2B SaaS AI product. Which approach for which problem?", "What are the most common ways RAG implementations fail in production, and how do you prevent them?", "Walk me through the minimum viable RAG setup for a startup — what do I actually need to build vs what can I skip?"], smartLines: ["RAG means the model searches your docs before it answers — more reliable than hoping it remembers the right thing.", "We added RAG to our knowledge base. The model now knows our policies better than most people on the team."], tag: "Architecture", seeded: true },
  { term: "Prompt Engineering", emoji: "✍️", definition: "The practice of writing clear, well-structured instructions for AI models to get consistently good outputs. Small changes to how you phrase things can make a significant difference to the results.", examples: [{ label: "Anthropic prompt engineering guide", url: "https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/overview" }], deepDive: ["Give me the 5 most impactful prompt engineering techniques with before/after examples. Focus on techniques that improve consistency and reduce hallucination.", "How much does prompt engineering actually matter now that models are smarter — or is it becoming less important?", "What's the difference between a prompt that works in a demo and one that works reliably in production?"], smartLines: ["Good prompt engineering is invisible — bad prompt engineering starts every response with 'Certainly! Here's a numbered list.'", "Spent an afternoon on prompt engineering so the model would stop saying 'As an AI language model.' Completely worth it."], tag: "Technique", seeded: true },
  { term: "MCP", emoji: "🔌", definition: "Model Context Protocol — Anthropic's open standard for connecting AI models to external tools, data, and services. Instead of building separate connections for everything, MCP gives you one consistent way to wire things together.", examples: [{ label: "MCP introduction", url: "https://modelcontextprotocol.io/introduction" }, { label: "Claude MCP docs", url: "https://docs.anthropic.com/en/docs/mcp" }], deepDive: ["Explain MCP (Model Context Protocol) to a product builder — what problems does it solve, and what could I realistically build with it as a solo developer?", "How does MCP compare to building custom API integrations — when would I use one over the other?", "What are the most useful MCP integrations available right now, and which ones are actually worth implementing?"], smartLines: ["MCP lets an AI connect to your calendar, files, or databases without a custom integration for each one.", "Think of MCP as the connector layer between your AI and the rest of your tools — one standard instead of one-off solutions."], tag: "Architecture", seeded: true },
  { term: "Hallucination", emoji: "👻", definition: "When an AI states something confidently that simply isn't true — and doesn't know it's wrong. The biggest reliability challenge in real-world AI products, and the main reason you should always verify important outputs.", examples: [{ label: "Why LLMs hallucinate", url: "https://www.ibm.com/topics/ai-hallucinations" }], deepDive: ["What are the most effective techniques for reducing hallucinations in a production AI app? Give me a ranked list from easiest to implement to hardest.", "How do you detect hallucinations at scale in a production system — what monitoring or evaluation approaches work?", "What product design patterns make hallucinations less likely to cause real harm even when they do happen?"], smartLines: ["The model cited a source so convincingly I nearly used it in a presentation. Turned out not to exist.", "We have a dedicated hallucination review step in QA now — not a sentence I expected to be writing."], tag: "Risk", seeded: true },
  { term: "Fine-tuning", emoji: "🎛️", definition: "Further training an existing model on your own data to improve it for a specific task or writing style. It works well, but it's expensive and time-consuming — better prompts or RAG usually get you there first.", examples: [{ label: "OpenAI fine-tuning guide", url: "https://platform.openai.com/docs/guides/fine-tuning" }], deepDive: ["When does fine-tuning actually make sense vs RAG vs prompt engineering? Give me a decision framework with real examples.", "What data quality and quantity do you actually need to make fine-tuning worthwhile — what are the minimums?", "How do you evaluate whether a fine-tuned model is actually better than a well-prompted base model for your use case?"], smartLines: ["We fine-tuned on our support tickets. The model now handles edge cases the base model never got right.", "Fine-tuning makes sense when you have lots of examples and need consistent outputs at scale — otherwise, start with RAG."], tag: "Architecture", seeded: true },
];

const TAG_COLORS = {
  "Behaviour":     { bg: "rgba(59,130,246,0.13)",  text: "rgba(147,197,253,1)", border: "rgba(59,130,246,0.3)" },
  "Model":         { bg: "rgba(99,102,241,0.13)",  text: "rgba(165,180,252,1)", border: "rgba(99,102,241,0.3)" },
  "Dev Tool":      { bg: "rgba(16,185,129,0.13)",  text: "rgba(110,231,183,1)", border: "rgba(16,185,129,0.3)" },
  "Economics":     { bg: "rgba(245,158,11,0.13)",  text: "rgba(252,211,77,1)",  border: "rgba(245,158,11,0.3)" },
  "Architecture":  { bg: "rgba(139,92,246,0.13)",  text: "rgba(196,181,253,1)", border: "rgba(139,92,246,0.3)" },
  "Technique":     { bg: "rgba(236,72,153,0.13)",  text: "rgba(249,168,212,1)", border: "rgba(236,72,153,0.3)" },
  "Risk":          { bg: "rgba(239,68,68,0.13)",   text: "rgba(252,165,165,1)", border: "rgba(239,68,68,0.3)" },
  "Core Concept":  { bg: "rgba(20,184,166,0.13)",  text: "rgba(94,234,212,1)",  border: "rgba(20,184,166,0.3)" },
};
const getTagColor = (tag) => TAG_COLORS[tag] || { bg: "rgba(20,184,166,0.13)", text: "rgba(94,234,212,1)", border: "rgba(20,184,166,0.3)" };

const KNOWN_MODELS = new Set(["claude", "chatgpt", "gpt-4", "gpt-4o", "gemini", "perplexity", "llama", "mistral", "grok", "copilot", "dall-e", "sora", "midjourney"]);

function TagBadge({ tag, isNew }) {
  const c = getTagColor(tag);
  return (
    <span className="text-xs px-2 py-0.5 rounded-full border font-medium"
      style={{ background: c.bg, color: c.text, borderColor: c.border }}>
      {isNew ? "✨ " : ""}{tag}
    </span>
  );
}


function LinkedDefinition({ text, terms, currentTerm, onTermClick, onAddTerm, highlightTerm }) {
  const otherTerms = terms
    .filter(t => t.term.toLowerCase() !== currentTerm.toLowerCase())
    .map(t => t.term)
    .sort((a, b) => b.length - a.length);

  let segments = [{ type: "text", content: text }];

  // Pass 0: bold-highlight the specified term (used in smartLines to mark the card's own term)
  if (highlightTerm) {
    const esc = highlightTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const re = new RegExp(`\\b(${esc}s?)\\b`, "i");
    const next = [];
    for (const seg of segments) {
      if (seg.type !== "text") { next.push(seg); continue; }
      seg.content.split(re).forEach((part, i) => {
        if (!part) return;
        if (i % 2 === 1) next.push({ type: "highlight", content: part });
        else next.push({ type: "text", content: part });
      });
    }
    segments = next;
  }

  // Pass 1: link known glossary terms (case-insensitive, word-boundary, optional plural s)
  for (const term of otherTerms) {
    const esc = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const re = new RegExp(`\\b(${esc}s?)\\b`, "i");
    const next = [];
    for (const seg of segments) {
      if (seg.type !== "text") { next.push(seg); continue; }
      seg.content.split(re).forEach((part, i) => {
        if (!part) return;
        if (i % 2 === 1) next.push({ type: "known", content: part, term });
        else next.push({ type: "text", content: part });
      });
    }
    segments = next;
  }

  // Pass 2: in remaining text, highlight ALL-CAPS acronyms as addable terms
  const final = [];
  for (const seg of segments) {
    if (seg.type !== "text") { final.push(seg); continue; }
    seg.content.split(/(\b[A-Z]{2,}s?\b)/).forEach((part, i) => {
      if (!part) return;
      if (i % 2 === 1) final.push({ type: "unknown", content: part });
      else final.push({ type: "text", content: part });
    });
  }

  return (
    <span>
      {final.map((seg, i) => {
        if (seg.type === "highlight") {
          return (
            <strong key={i} style={{ color: "rgba(199,210,254,1)", background: "rgba(99,102,241,0.2)", borderRadius: "3px", padding: "0 3px" }}>
              {seg.content}
            </strong>
          );
        }
        if (seg.type === "known") {
          return (
            <button key={i} onClick={() => onTermClick(seg.term)}
              style={{ color: "rgba(147,197,253,1)", fontWeight: 600, background: "none", border: "none", padding: 0, font: "inherit", cursor: "pointer", textDecoration: "underline", textDecorationStyle: "dotted", textUnderlineOffset: "2px" }}>
              {seg.content}
            </button>
          );
        }
        if (seg.type === "unknown") {
          const termToAdd = seg.content.endsWith("s") && /^[A-Z]+$/.test(seg.content.slice(0, -1))
            ? seg.content.slice(0, -1) : seg.content;
          return (
            <button key={i} onClick={() => onAddTerm(termToAdd)}
              style={{ color: "rgba(110,231,183,0.8)", background: "none", border: "none", padding: 0, font: "inherit", cursor: "pointer", textDecoration: "underline", textDecorationStyle: "dotted", textUnderlineOffset: "2px" }}>
              {seg.content}
            </button>
          );
        }
        return <span key={i}>{seg.content}</span>;
      })}
    </span>
  );
}

function GlossaryCard({ item, isOpen, onToggle, isNew, shouldScrollTo, allTerms, onTermClick, onAddTerm, onDelete, isTyping, isOnline }) {
  const [deepDives, setDeepDives] = useState(Array.isArray(item.deepDive) ? item.deepDive : [item.deepDive]);
  const [smartLines, setSmartLines] = useState(item.smartLines || []);
  const [generatingSmartLines, setGeneratingSmartLines] = useState(false);
  const [generatingDeepDives, setGeneratingDeepDives] = useState(false);

  useEffect(() => {
    if (!isOpen || item.seeded) return;

    // Lazy-generate smartLines for DB terms that don't have them
    if (smartLines.length === 0 && !generatingSmartLines) {
      setGeneratingSmartLines(true);
      fetch("/api/claude", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514", max_tokens: 300,
          system: "You write short example sentences for a tech glossary. Mildly witty is fine, but keep them useful and grounded. Respond ONLY with a raw JSON array — no markdown, no backticks.",
          messages: [{ role: "user", content: `Term: "${item.term}"\nDefinition: "${item.definition}"\n\nWrite exactly 2 sentences (max 20 words each) using this term naturally.\nFormat: ["sentence one.","sentence two."]` }],
        }),
      })
        .then(r => r.json())
        .then(d => {
          const text = (d.content?.[0]?.text || "[]").replace(/```json|```/g, "").trim();
          const lines = JSON.parse(text);
          if (Array.isArray(lines) && lines.length > 0) {
            setSmartLines(lines);
            fetch("/api/terms", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ term: item.term, smartLines: lines }) }).catch(() => {});
          }
        })
        .catch(() => {})
        .finally(() => setGeneratingSmartLines(false));
    }

    // Lazy-generate 3 deep dives for DB terms that only have 1 (old format)
    if (deepDives.length < 3 && !generatingDeepDives) {
      setGeneratingDeepDives(true);
      fetch("/api/claude", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514", max_tokens: 400,
          system: "You generate deep-dive questions for a tech glossary. Respond ONLY with a raw JSON array of 3 strings — no markdown, no backticks.",
          messages: [{ role: "user", content: `Term: "${item.term}"\nDefinition: "${item.definition}"\n\nGenerate exactly 3 distinct, punchy questions a product builder would want answered about this term. Different angles: practical use, trade-offs, real-world implementation.\nFormat: ["question 1?","question 2?","question 3?"]` }],
        }),
      })
        .then(r => r.json())
        .then(d => {
          const text = (d.content?.[0]?.text || "[]").replace(/```json|```/g, "").trim();
          const dives = JSON.parse(text);
          if (Array.isArray(dives) && dives.length === 3) {
            setDeepDives(dives);
            fetch("/api/terms", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ term: item.term, deepDive: dives }) }).catch(() => {});
          }
        })
        .catch(() => {})
        .finally(() => setGeneratingDeepDives(false));
    }
  }, [isOpen]);

  const [displayedDef, setDisplayedDef] = useState(isTyping ? "" : item.definition);
  const [displayedSmartLines, setDisplayedSmartLines] = useState(
    isTyping ? (item.smartLines || []).map(() => "") : (item.smartLines || [])
  );
  const [displayedDeepDives, setDisplayedDeepDives] = useState(
    isTyping ? (Array.isArray(item.deepDive) ? item.deepDive : [item.deepDive]).map(() => "") : []
  );
  const [typingDone, setTypingDone] = useState(!isTyping);

  useEffect(() => {
    if (!isTyping) return;
    const def = item.definition;
    const smarts = item.smartLines || [];
    const dives = Array.isArray(item.deepDive) ? item.deepDive : [item.deepDive];
    const maxLen = Math.max(def.length, ...smarts.map(s => s.length), ...dives.map(d => d.length), 0);
    setDisplayedDef("");
    setDisplayedSmartLines(smarts.map(() => ""));
    setDisplayedDeepDives(dives.map(() => ""));
    setTypingDone(false);
    let tick = 0;
    const iv = setInterval(() => {
      tick++;
      setDisplayedDef(def.slice(0, tick));
      setDisplayedSmartLines(smarts.map(s => s.slice(0, tick)));
      setDisplayedDeepDives(dives.map(d => d.slice(0, tick)));
      if (tick >= maxLen) { clearInterval(iv); setTypingDone(true); }
    }, 5);
    return () => clearInterval(iv);
  }, [isTyping, item.definition]);

  const [loadingIdx, setLoadingIdx] = useState(null);
  const [responses, setResponses] = useState(Array(3).fill(null));
  const ref = useRef(null);

  useEffect(() => {
    if ((isNew || shouldScrollTo) && ref.current) setTimeout(() => ref.current.scrollIntoView({ behavior: "smooth", block: "center" }), 150);
  }, [isNew, shouldScrollTo]);

  const runDeepDive = async (idx) => {
    setLoadingIdx(idx);
    setResponses(prev => { const next = [...prev]; next[idx] = null; return next; });
    try {
      const res = await fetch("/api/claude", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514", max_tokens: 1000,
          system: "You are a sharp, practical AI tutor. Answer concisely — max 200 words. Plain language. No bullet spam. Brief paragraphs.",
          messages: [{ role: "user", content: deepDives[idx] }],
        }),
      });
      const d = await res.json();
      setResponses(prev => { const next = [...prev]; next[idx] = d.content?.[0]?.text || "No response."; return next; });
    } catch {
      setResponses(prev => { const next = [...prev]; next[idx] = "Error — try again."; return next; });
    }
    setLoadingIdx(null);
  };

  return (
    <div ref={ref} className="rounded-xl overflow-hidden transition-all duration-300" style={{
      background: isNew ? "rgba(20,184,166,0.05)" : "rgba(var(--rgb),0.04)",
      border: isNew ? "1px solid rgba(20,184,166,0.3)" : "1px solid rgba(var(--rgb),0.09)",
      boxShadow: isNew ? "0 0 24px rgba(20,184,166,0.08)" : "none",
    }}>
      <button onClick={onToggle} className="w-full text-left px-5 py-4 flex items-center justify-between gap-3 hover:bg-white/5 transition-colors">
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-2xl flex-shrink-0">{item.emoji}</span>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-white text-lg tracking-tight">{item.term}</span>
              <TagBadge tag={item.tag} isNew={isNew} />
            </div>
            <p className="text-sm mt-0.5 line-clamp-1" style={{ color: "rgba(var(--rgb),0.45)" }}>{item.definition}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {onDelete && (
            <button onClick={e => { e.stopPropagation(); if (confirm(`Delete "${item.term}"?`)) onDelete(item.term); }}
              style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(var(--rgb),0.18)", fontSize: "0.85rem", padding: "2px 4px", lineHeight: 1 }}
              title="Delete term">✕</button>
          )}
          <span className="transition-transform duration-200" style={{ color: "rgba(var(--rgb),0.25)", transform: isOpen ? "rotate(180deg)" : "none" }}>▾</span>
        </div>
      </button>

      {isOpen && (
        <div className="px-5 pb-5 pt-4 space-y-4" style={{ borderTop: "1px solid rgba(var(--rgb),0.07)" }}>
          <p className="text-sm leading-relaxed" style={{ color: "rgba(var(--rgb),0.78)" }}>
            {isTyping && !typingDone
              ? <>{displayedDef}<span style={{ display: "inline-block", width: "2px", height: "1em", background: "rgba(var(--rgb),0.5)", marginLeft: "1px", verticalAlign: "text-bottom", animation: "cursor-blink 0.7s step-end infinite" }} /></>
              : <LinkedDefinition text={item.definition} terms={allTerms} currentTerm={item.term} onTermClick={onTermClick} onAddTerm={onAddTerm} />
            }
          </p>

          {(isTyping ? smartLines.length > 0 : (typingDone && (smartLines.length > 0 || generatingSmartLines))) && (
            <div>
              <p className="text-xs uppercase tracking-widest mb-2 flex items-center gap-2" style={{ color: "rgba(var(--rgb),0.3)" }}>
                Make me look smart
                {generatingSmartLines && <PulsingDots />}
              </p>
              {smartLines.length > 0 && (
                <div className="space-y-2">
                  {smartLines.map((line, i) => (
                    <p key={i} className="text-sm leading-relaxed italic" style={{ color: "rgba(var(--rgb),0.52)" }}>
                      "{isTyping && !typingDone
                        ? (displayedSmartLines[i] || "")
                        : <LinkedDefinition text={line} terms={allTerms} currentTerm={item.term} onTermClick={onTermClick} onAddTerm={onAddTerm} highlightTerm={item.term} />
                      }"
                    </p>
                  ))}
                </div>
              )}
            </div>
          )}

          {typingDone && item.examples?.length > 0 && (
            <div>
              <p className="text-xs uppercase tracking-widest mb-2" style={{ color: "rgba(var(--rgb),0.3)" }}>Examples</p>
              <div className="flex flex-wrap gap-2">
                {item.examples.map((ex, i) => (
                  <a key={i} href={ex.url} target="_blank" rel="noreferrer"
                    className="text-xs px-3 py-1.5 rounded-lg transition-colors"
                    style={{ border: "1px solid rgba(var(--rgb),0.1)", color: "rgba(var(--rgb),0.5)" }}>
                    {ex.label} ↗
                  </a>
                ))}
              </div>
            </div>
          )}

          {(isTyping || typingDone) && <div className="rounded-lg p-3 space-y-3" style={{ background: "rgba(var(--rgb),0.025)", border: "1px solid rgba(var(--rgb),0.07)" }}>
            <p className="text-xs uppercase tracking-widest" style={{ color: "rgba(var(--rgb),0.3)" }}>Deep dive</p>
            {deepDives.map((prompt, idx) => {
              const isLoading = loadingIdx === idx;
              const response = responses[idx];
              const stillTyping = isTyping && !typingDone;
              return (
                <div key={idx} className="pt-2" style={{ borderTop: idx === 0 ? "none" : "1px solid rgba(var(--rgb),0.06)" }}>
                  <p className="text-sm italic mb-2" style={{ color: "rgba(var(--rgb),0.5)" }}>
                    "{stillTyping
                      ? (displayedDeepDives[idx] || "")
                      : <LinkedDefinition text={prompt} terms={allTerms} currentTerm={item.term} onTermClick={onTermClick} onAddTerm={onAddTerm} />
                    }"
                  </p>
                  <button onClick={() => !stillTyping && isOnline && runDeepDive(idx)}
                    disabled={!isOnline || stillTyping || loadingIdx !== null}
                    className="text-xs px-4 py-2 rounded-lg font-medium transition-all"
                    style={{
                      background: (!isOnline || stillTyping || isLoading) ? "rgba(var(--rgb),0.04)" : "rgba(99,102,241,0.22)",
                      color: (!isOnline || stillTyping) ? "rgba(var(--rgb),0.2)" : (loadingIdx !== null && !isLoading) ? "rgba(var(--rgb),0.15)" : isLoading ? "rgba(var(--rgb),0.2)" : "rgba(199,210,254,1)",
                      border: "1px solid rgba(99,102,241,0.28)",
                      cursor: (!isOnline || stillTyping || loadingIdx !== null) ? "not-allowed" : "pointer",
                    }}>
                    {isLoading ? "Asking Claude..." : (!isOnline) ? "Offline" : "▶ Run this prompt"}
                  </button>
                  {response && (
                    <div className="mt-2 pt-2" style={{ borderTop: "1px solid rgba(var(--rgb),0.07)" }}>
                      <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: "rgba(var(--rgb),0.68)" }}>{response}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>}
        </div>
      )}
    </div>
  );
}

function PulsingDots() {
  return (
    <span style={{ display: "inline-flex", gap: 3, alignItems: "center" }}>
      {[0,1,2].map(i => (
        <span key={i} style={{
          width: 4, height: 4, borderRadius: "50%", background: "rgba(20,184,166,0.8)",
          display: "inline-block",
          animation: `pulse-dot 1.2s ease-in-out ${i * 0.2}s infinite`,
        }} />
      ))}
      <style>{`@keyframes pulse-dot { 0%,80%,100%{opacity:0.2;transform:scale(0.8)} 40%{opacity:1;transform:scale(1)} }`}</style>
    </span>
  );
}

const TAG_ORDER = ["All", "Model", "Core Concept", "Dev Tool", "Risk", "Behaviour", "Economics", "Technique", "Architecture"];

export default function AIGlossary() {
  const [terms, setTerms] = useState(SEED_GLOSSARY);
  const [termsLoaded, setTermsLoaded] = useState(false);
  const [newKeys, setNewKeys] = useState(new Set());
  const [openTerm, setOpenTerm] = useState(null);
  const [search, setSearch] = useState("");
  const [activeTag, setActiveTag] = useState("All");
  const [generating, setGenerating] = useState(null);
  const [streamingPreview, setStreamingPreview] = useState("");
  const [showCategories, setShowCategories] = useState(true);
  const lastScrollY = useRef(0);
  const ignoreScrollUntil = useRef(0);
  const activeTagRef = useRef("All");
  const headerRef = useRef(null);
  const categoriesRef = useRef(null);
  const [headerHeight, setHeaderHeight] = useState(200);
  const [categoriesHeight, setCategoriesHeight] = useState(90);
  const [isDark, setIsDark] = useState(true);
  const [isOnline, setIsOnline] = useState(true);
  const [feedback, setFeedback] = useState(null); // { type: "notRelevant"|"error", term }
  const [scrollToTerm, setScrollToTerm] = useState(null);
  const [typingTerm, setTypingTerm] = useState(null);

  useEffect(() => {
    fetch("/api/terms")
      .then(r => r.json())
      .then(data => {
        if (!Array.isArray(data) || !data.length) return;
        const remote = data.map(t => ({
          term: t.term,
          emoji: t.emoji,
          definition: t.definition,
          examples: t.examples || [],
          deepDive: Array.isArray(t.deep_dive) ? t.deep_dive : [t.deep_dive],
          smartLines: Array.isArray(t.smart_lines) ? t.smart_lines : [],
          tag: KNOWN_MODELS.has(t.term.toLowerCase()) ? "Model" : ({ "Models": "Model", "Dev Tools": "Dev Tool", "Dev Tool": "Dev Tool", "Techniques": "Technique" }[t.tag] ?? t.tag),
          seeded: false,
        }));
        const remoteNames = new Set(remote.map(t => t.term.toLowerCase()));
        setTerms([...SEED_GLOSSARY.filter(s => !remoteNames.has(s.term.toLowerCase())), ...remote]);
      })
      .catch(() => {})
      .finally(() => setTermsLoaded(true));
  }, []);

  useEffect(() => {
    // Signal layout to hide splash as soon as the app mounts
    window.kairoReady?.();

    setIsOnline(navigator.onLine);
    const goOnline = () => setIsOnline(true);
    const goOffline = () => setIsOnline(false);
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  useEffect(() => {
    const onScroll = () => {
      if (activeTagRef.current !== "All") return;
      if (Date.now() < ignoreScrollUntil.current) return;
      const y = window.scrollY;
      if (y <= 8) setShowCategories(true);
      else if (y > lastScrollY.current + 4) setShowCategories(false);
      else if (y < lastScrollY.current - 4) setShowCategories(true);
      lastScrollY.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const hEl = headerRef.current;
    const cEl = categoriesRef.current;
    if (!hEl || !cEl) return;
    const hRo = new ResizeObserver(() => setHeaderHeight(hEl.offsetHeight));
    hRo.observe(hEl);
    const cRo = new ResizeObserver(() => setCategoriesHeight(cEl.scrollHeight));
    cRo.observe(cEl);
    return () => { hRo.disconnect(); cRo.disconnect(); };
  }, []);

  useEffect(() => {
    activeTagRef.current = activeTag;
    ignoreScrollUntil.current = Date.now() + 1000;
    lastScrollY.current = window.scrollY;
    setShowCategories(true);
  }, [activeTag]);

  const persist = async (entry) => {
    try {
      await fetch("/api/terms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(entry),
      });
    } catch {}
  };

  const handleTermClick = (termKey) => {
    setActiveTag("All");
    setSearch("");
    setOpenTerm(termKey);
    setScrollToTerm(termKey);
    setTimeout(() => setScrollToTerm(null), 600);
  };

  const handleAddTerm = (term) => {
    setSearch(term);
    tryAdd(term);
  };

  const handleDelete = async (termName) => {
    try {
      await fetch("/api/terms", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ term: termName }) });
    } catch {}
    setTerms(prev => prev.filter(t => t.term !== termName));
    if (openTerm === termName) setOpenTerm(null);
  };

  const handleToggle = (termName) => {
    const y = window.scrollY;
    setOpenTerm(prev => prev === termName ? null : termName);
    requestAnimationFrame(() => window.scrollTo({ top: y, behavior: "instant" }));
  };

  const allTermNames = terms.map(t => t.term.toLowerCase());

  const tryAdd = async (raw) => {
    if (!isOnline) return;
    const query = raw.trim();
    if (!query) return;
    setFeedback(null);

    const exact = terms.find(t => t.term.toLowerCase() === query.toLowerCase());
    if (exact) { setOpenTerm(exact.term); setSearch(""); return; }

    setGenerating(query);
    setStreamingPreview("");
    try {
      const res = await fetch("/api/claude", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514", max_tokens: 1000, stream: true,
          system: `You maintain a glossary for AI, ML, software dev, and tech entrepreneurship.
Given a term, decide if it's genuinely relevant to that domain. If yes, generate a glossary entry.
Respond ONLY with raw JSON — no markdown, no backticks, no explanation.

If relevant:
{"relevant":true,"term":"Canonical Name","emoji":"single emoji","definition":"One crisp sentence.","examples":[{"label":"short label","url":"https://real-url.com"}],"deepDive":["First punchy question a product builder would want answered.","Second distinct angle on the term — practical or comparative.","Third question — edge case, risk, or real-world implementation detail."],"smartLines":["First sentence using the term naturally in a realistic context, with a touch of dry wit.","Second sentence — different angle, equally grounded."],"tag":"Core Concept|Dev Tool|Economics|Architecture|Craft|Risk|or a new precise tag"}

If not relevant (random word, name, off-topic): {"relevant":false}

Already in glossary (do not duplicate): ${allTermNames.join(", ")}`,
          messages: [{ role: "user", content: query }],
        }),
      });

      // Consume SSE stream, extract definition preview as it arrives
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        for (const line of chunk.split("\n")) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6).trim();
          if (!data || data === "[DONE]") continue;
          try {
            const event = JSON.parse(data);
            if (event.type === "content_block_delta" && event.delta?.type === "text_delta") {
              accumulated += event.delta.text;
              // Show definition as it streams (complete or partial)
              const full = accumulated.match(/"definition"\s*:\s*"((?:[^"\\]|\\.)*)"/);
              const partial = full ? null : accumulated.match(/"definition"\s*:\s*"((?:[^"\\]|\\.){4,})/);
              const preview = full ? full[1] : partial ? partial[1] : null;
              if (preview) setStreamingPreview(preview.replace(/\\n/g, " ").replace(/\\"/g, '"'));
            }
          } catch {}
        }
      }

      const text = accumulated.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(text);

      if (!parsed.relevant) { setFeedback({ type: "notRelevant", term: query }); }
      else if (parsed.term) {
        const entry = { ...parsed, seeded: false };
        delete entry.relevant;
        setTerms(prev => [...prev, entry]);
        setNewKeys(prev => new Set([...prev, entry.term.toLowerCase()]));
        setOpenTerm(entry.term);
        setTypingTerm(entry.term);
        persist(entry);
        setSearch("");
      }
    } catch { setFeedback({ type: "error" }); }
    setGenerating(null);
    setStreamingPreview("");
  };

  const allTagSet = new Set(terms.map(t => t.tag));
  const tags = [...TAG_ORDER.filter(t => allTagSet.has(t) || t === "All"), ...Array.from(allTagSet).filter(t => !TAG_ORDER.includes(t)).sort()];

  const filtered = terms
    .filter(item => {
      const q = search.trim().toLowerCase();
      const matchSearch = !q || item.term.toLowerCase().includes(q) || item.definition.toLowerCase().includes(q);
      return matchSearch && (activeTag === "All" || item.tag === activeTag);
    })
    .sort((a, b) => a.term.localeCompare(b.term));

  const searchQ = search.trim();
  const isKnown = searchQ && terms.some(t => t.term.toLowerCase() === searchQ.toLowerCase());
  const showAddHint = searchQ.length > 1 && !isKnown && !generating && filtered.length === 0;
  const generatedCount = terms.filter(t => !t.seeded).length;

  const surface = isDark ? "#0d0d1c" : "#f5f6ff";

  return (
    <div className={`min-h-screen${isDark ? "" : " light-text-override"}`} style={{
      background: isDark ? "linear-gradient(135deg,#080810 0%,#0d0d1c 60%,#080812 100%)" : "linear-gradient(135deg,#eef0ff 0%,#f5f6ff 60%,#eef0ff 100%)",
      fontFamily: "'DM Sans',system-ui,sans-serif",
      "--rgb": isDark ? "255,255,255" : "15,15,30",
      "--surface": surface,
    }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=Jost:ital,wght@1,700;1,800&display=swap');*{box-sizing:border-box}::placeholder{animation:ph-shimmer 5s ease-in-out infinite}input{caret-color:rgba(99,102,241,0.9)}@keyframes ai-border-spin{to{transform:rotate(1turn)}}@keyframes ai-glow-pulse{0%,100%{opacity:0.7}50%{opacity:1}}@keyframes ph-shimmer{0%,100%{color:rgba(147,197,253,0.45)}33%{color:rgba(216,180,254,0.45)}66%{color:rgba(249,168,212,0.45)}}@keyframes cursor-blink{0%,100%{opacity:1}50%{opacity:0}}.light-text-override .text-white{color:rgba(var(--rgb),0.88)!important}.light-text-override .hover\\:bg-white\\/5:hover{background:rgba(var(--rgb),0.05)!important}`}</style>

      {/* Fixed header */}
      <div ref={headerRef} className="fixed top-0 left-0 right-0 z-50 px-6" style={{ background: "var(--surface)", borderBottom: "1px solid rgba(var(--rgb),0.07)" }}>
        <div className="max-w-2xl mx-auto" style={{ paddingTop: "1.1rem", paddingBottom: "1rem" }}>

          {/* Logo row */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.45rem", position: "relative" }}>
            <a href="https://meetkairo.ai" style={{ display: "block", lineHeight: 0 }}>
              <img src="/kairo-wordmark-cropped.png" alt="Kairo" style={{ height: "28px", width: "auto", display: "block", transform: "translateY(-1px)" }} />
            </a>
            <span style={{ fontFamily: "'Jost',system-ui,sans-serif", fontWeight: 700, fontStyle: "italic", fontSize: "2.2rem", textTransform: "lowercase", color: "#5b80e8", lineHeight: 1 }}>decode</span>
            <button onClick={() => setIsDark(d => !d)} title="Toggle light/dark"
              style={{ marginLeft: "auto", position: "absolute", right: 0, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: "1rem", lineHeight: 1, color: `rgba(var(--rgb),0.35)`, padding: "4px 2px" }}>
              {isDark ? "○" : "●"}
            </button>
          </div>
          <p style={{ fontFamily: "'DM Sans',system-ui,sans-serif", fontSize: "0.79rem", color: "rgba(var(--rgb),0.32)", marginTop: "3px", letterSpacing: 0 }}>
            adaptive intelligence jargon buster
          </p>

          {/* Search bar */}
          <div className="relative" style={{ marginTop: "1.1rem", marginBottom: "0.5rem" }}>
            <div style={{ position: "absolute", inset: 0, borderRadius: "13px", overflow: "hidden", zIndex: 0 }}>
              <div style={{
                position: "absolute", width: "200%", height: "200%", top: "-50%", left: "-50%",
                background: "conic-gradient(from 0deg, #3b82f6, #8b5cf6, #ec4899, #f97316, #f59e0b, #8b5cf6, #3b82f6)",
                animation: "ai-border-spin 6s linear infinite, ai-glow-pulse 3s ease-in-out infinite",
              }} />
            </div>
            <div style={{ position: "absolute", inset: "1.5px", borderRadius: "11.5px", background: "var(--surface)", zIndex: 1 }} />
            <div style={{ position: "absolute", inset: 0, borderRadius: "13px", boxShadow: "0 0 22px rgba(139,92,246,0.18), 0 0 8px rgba(236,72,153,0.12)", zIndex: 0, pointerEvents: "none" }} />
            <input
              type="text"
              placeholder="Search existing or add new term"
              value={search}
              onChange={e => { setSearch(e.target.value); setFeedback(null); }}
              onKeyDown={e => e.key === "Enter" && isOnline && tryAdd(search)}
              className="w-full px-4 rounded-xl text-sm text-white outline-none"
              style={{ position: "relative", zIndex: 2, background: "transparent", border: "none", fontFamily: "inherit", fontSize: "16px", paddingTop: "14px", paddingBottom: "14px" }}
            />
            {searchQ.length > 1 && !generating && (
              <button onClick={() => isOnline && tryAdd(search)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-xs px-3 py-1.5 rounded-lg font-medium"
                style={{ zIndex: 3, background: isOnline ? "rgba(99,102,241,0.22)" : "rgba(var(--rgb),0.06)", color: isOnline ? "rgba(199,210,254,1)" : "rgba(var(--rgb),0.25)", border: "1px solid rgba(99,102,241,0.18)", cursor: isOnline ? "pointer" : "default" }}>
                {isKnown ? "Open ↵" : isOnline ? "Add ✨" : "Offline"}
              </button>
            )}
            {generating && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2" style={{ zIndex: 3 }}><PulsingDots /></div>
            )}
          </div>

          {/* Sliding categories */}
          <div style={{
            overflow: "hidden",
            maxHeight: showCategories ? `${categoriesHeight}px` : "0px",
            opacity: showCategories ? 1 : 0,
            transition: "max-height 0.32s cubic-bezier(0.4,0,0.2,1), opacity 0.22s ease",
          }}>
            <div ref={categoriesRef} className="flex flex-wrap gap-2" style={{ paddingTop: "10px", paddingBottom: "6px" }}>
              {tags.map(tag => (
                <button key={tag} onClick={() => setActiveTag(tag)}
                  className="text-xs px-3 py-1.5 rounded-full border transition-all"
                  style={{
                    border: activeTag === tag ? "1px solid rgba(99,102,241,0.55)" : "1px solid rgba(var(--rgb),0.09)",
                    background: activeTag === tag ? "rgba(99,102,241,0.18)" : "transparent",
                    color: activeTag === tag ? "rgba(199,210,254,1)" : "rgba(var(--rgb),0.38)",
                  }}>
                  {tag}
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6" style={{
        paddingTop: `${headerHeight + 12}px`,
        paddingBottom: "2rem",
      }}>

        {!termsLoaded && (
          <div className="flex justify-center pt-12">
            <PulsingDots />
          </div>
        )}

        {/* Offline banner */}
        {!isOnline && (
          <div className="mb-4 px-4 py-3 rounded-xl text-sm" style={{ background: "rgba(245,158,11,0.07)", border: "1px solid rgba(245,158,11,0.22)", color: "rgba(252,211,77,0.8)" }}>
            You're offline — browsing cached terms. Adding terms and deep dives are unavailable.
          </div>
        )}

        {/* Feedback */}
        {feedback?.type === "notRelevant" && (
          <div className="mb-4 px-4 py-3 rounded-xl text-sm" style={{ background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.18)", color: "rgba(252,165,165,0.85)" }}>
            <strong>"{feedback.term}"</strong> doesn't look like an AI/tech term — skipping it.
          </div>
        )}
        {feedback?.type === "error" && (
          <div className="mb-4 px-4 py-3 rounded-xl text-sm" style={{ background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.18)", color: "rgba(252,165,165,0.85)" }}>
            Something went wrong. Try again?
          </div>
        )}

        {/* Generating indicator */}
        {generating && (
          <div className="mb-2 px-5 py-4 rounded-xl flex items-center gap-3"
            style={{ background: "rgba(20,184,166,0.05)", border: "1px solid rgba(20,184,166,0.22)", boxShadow: "0 0 20px rgba(20,184,166,0.07)" }}>
            <span className="text-2xl">✨</span>
            <div className="min-w-0 flex-1">
              <p className="text-white font-bold tracking-tight">{generating}</p>
              {streamingPreview ? (
                <p className="text-sm leading-relaxed mt-0.5 italic" style={{ color: "rgba(20,184,166,0.75)" }}>
                  {streamingPreview}<span style={{ display: "inline-block", width: "2px", height: "0.9em", background: "rgba(20,184,166,0.7)", marginLeft: "2px", verticalAlign: "text-bottom", animation: "cursor-blink 0.7s step-end infinite" }} />
                </p>
              ) : (
                <p className="text-sm flex items-center gap-1.5" style={{ color: "rgba(20,184,166,0.75)" }}>
                  Generating entry <PulsingDots />
                </p>
              )}
            </div>
          </div>
        )}

        {/* Add hint */}
        {showAddHint && (
          <div className="mb-4 px-5 py-4 rounded-xl flex items-center justify-between gap-3"
            style={{ background: "rgba(20,184,166,0.05)", border: "1px solid rgba(20,184,166,0.18)" }}>
            <div>
              <p className="text-white font-medium">"{searchQ}" isn't in the glossary yet</p>
              <p className="text-sm mt-0.5" style={{ color: isOnline ? "rgba(20,184,166,0.65)" : "rgba(245,158,11,0.6)" }}>
                {isOnline ? "Press Enter or tap Add to generate an entry" : "Connect to add new terms"}
              </p>
            </div>
            {isOnline && (
              <button onClick={() => tryAdd(search)} className="text-xs px-4 py-2 rounded-lg font-medium flex-shrink-0"
                style={{ background: "rgba(20,184,166,0.18)", color: "rgba(94,234,212,1)", border: "1px solid rgba(20,184,166,0.28)" }}>
                Add ✨
              </button>
            )}
          </div>
        )}

        {generatedCount > 0 && (
          <div className="mb-3">
            <span className="text-xs" style={{ color: "rgba(20,184,166,0.65)" }}>+{generatedCount} discovered</span>
          </div>
        )}

        {/* Cards */}
        <div className="space-y-2">
          {filtered.map(item => (
            <GlossaryCard
              key={item.term}
              item={item}
              isOpen={openTerm === item.term}
              onToggle={() => handleToggle(item.term)}
              isNew={newKeys.has(item.term.toLowerCase())}
              shouldScrollTo={scrollToTerm === item.term}
              allTerms={terms}
              onTermClick={handleTermClick}
              onAddTerm={handleAddTerm}
              onDelete={handleDelete}
              isTyping={typingTerm === item.term}
              isOnline={isOnline}
            />
          ))}
        </div>

        <p className="text-center text-xs mt-8" style={{ color: "rgba(var(--rgb),0.13)" }}>
          {terms.length} terms · {generatedCount} auto-discovered · Kairo Decode
        </p>

        <footer style={{ borderTop: "0.5px solid rgba(var(--rgb),0.07)", padding: "1.75rem 0", display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "2rem" }}>
          <button onClick={() => window.kairoShowSplash?.()} style={{ background: "none", border: "none", padding: 0, cursor: "pointer" }}>
            <span style={{ fontSize: "0.85rem", fontWeight: 900, letterSpacing: "0.04em", fontFamily: "'Jost',system-ui,sans-serif", fontStyle: "italic" }}>
              <span style={{ color: "#2a3a6a" }}>k</span><span style={{ color: "#5b80e8" }}>ai</span><span style={{ color: "#2a3a6a" }}>ro</span>
            </span>
          </button>
          <span style={{ fontSize: "0.6rem", color: "rgba(240,240,240,0.2)", letterSpacing: "0.1em", fontWeight: 500 }}>© 2026</span>
        </footer>
      </div>
    </div>
  );
}
