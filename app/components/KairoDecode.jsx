"use client";

import { useState, useEffect, useRef } from "react";

const SEED_GLOSSARY = [
  { term: "Agent", emoji: "🤖", definition: "An AI system that can take actions autonomously — not just answer questions, but actually do things: browse the web, write code, call APIs, manage files.", examples: [{ label: "Claude agent browsing the web", url: "https://www.anthropic.com/claude" }, { label: "AutoGPT (early popular agent)", url: "https://github.com/Significant-Gravitas/AutoGPT" }], deepDive: "What's the difference between an AI chatbot and an AI agent? Give me a concrete example of each, and explain when you'd use one vs the other.", tag: "Core Concept", seeded: true },
  { term: "Agentic", emoji: "⚡", definition: "Adjective describing AI behaviour that is goal-directed and multi-step — the AI decides what to do next rather than just responding to a single prompt.", examples: [{ label: "Anthropic on agentic AI", url: "https://www.anthropic.com/research/building-effective-agents" }], deepDive: "Explain 'agentic AI' like I'm a product manager. What does it mean in practice for building products? What are the risks?", tag: "Core Concept", seeded: true },
  { term: "Model", emoji: "🧠", definition: "The actual AI brain — the trained neural network that processes input and generates output. GPT-4, Claude 3.5 Sonnet, Gemini are all 'models'.", examples: [{ label: "Anthropic model overview", url: "https://docs.anthropic.com/en/docs/about-claude/models/overview" }, { label: "OpenAI model comparison", url: "https://platform.openai.com/docs/models" }], deepDive: "Compare the major frontier AI models available today (Claude, GPT-4o, Gemini, Llama) — strengths, weaknesses, best use cases, cost differences.", tag: "Core Concept", seeded: true },
  { term: "CLI", emoji: "💻", definition: "Command Line Interface — you type text commands directly into a terminal instead of clicking around a GUI. How developers talk to computers (and increasingly, to AI tools).", examples: [{ label: "Claude Code CLI", url: "https://docs.anthropic.com/en/docs/claude-code/overview" }, { label: "GitHub CLI", url: "https://cli.github.com/" }], deepDive: "I'm a non-developer learning to use the CLI for AI development. Give me the 10 commands I'll use most often, with plain-English explanations.", tag: "Dev Tool", seeded: true },
  { term: "IDE", emoji: "🖥️", definition: "Integrated Development Environment — a fancy text editor for writing code. Think Xcode but for everything. Cursor and VS Code are the popular ones right now.", examples: [{ label: "Cursor (AI-native IDE)", url: "https://cursor.com" }, { label: "VS Code", url: "https://code.visualstudio.com/" }], deepDive: "Compare Cursor vs VS Code for someone building AI-powered web apps as a side project. Which should I use and why?", tag: "Dev Tool", seeded: true },
  { term: "Token", emoji: "🪙", definition: "The unit of text that AI models process — roughly ¾ of a word. API costs are measured in tokens. 1,000 tokens ≈ 750 words. This is the 'spend' on those Instagram dashboards.", examples: [{ label: "Anthropic pricing (tokens)", url: "https://www.anthropic.com/pricing" }], deepDive: "Explain AI token economics to me like I'm building a subscription product. How do I model costs vs revenue at scale?", tag: "Economics", seeded: true },
  { term: "Context Window", emoji: "🪟", definition: "How much text an AI can 'hold in its head' at once — its working memory. Bigger = more expensive but smarter in long conversations or large document tasks.", examples: [{ label: "Claude's 200k context window explained", url: "https://www.anthropic.com/news/claude-2-1" }], deepDive: "What are the practical implications of context window size when building a product like a daily briefing tool? When does it matter, when doesn't it?", tag: "Core Concept", seeded: true },
  { term: "RAG", emoji: "📚", definition: "Retrieval-Augmented Generation — instead of asking the model to 'remember' facts, you fetch relevant docs at runtime and inject them into the prompt. Smarter than fine-tuning for most use cases.", examples: [{ label: "What is RAG?", url: "https://aws.amazon.com/what-is/retrieval-augmented-generation/" }], deepDive: "Explain RAG vs fine-tuning for a non-technical founder building a B2B SaaS AI product. Which approach for which problem?", tag: "Architecture", seeded: true },
  { term: "Prompt Engineering", emoji: "✍️", definition: "The craft of writing instructions to AI models to get reliably good outputs. More art than science — but there are real patterns that work.", examples: [{ label: "Anthropic prompt engineering guide", url: "https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/overview" }], deepDive: "Give me the 5 most impactful prompt engineering techniques with before/after examples. Focus on techniques that improve consistency and reduce hallucination.", tag: "Craft", seeded: true },
  { term: "MCP", emoji: "🔌", definition: "Model Context Protocol — Anthropic's open standard for connecting AI models to external tools, data sources, and services. Like USB-C but for AI integrations.", examples: [{ label: "MCP introduction", url: "https://modelcontextprotocol.io/introduction" }, { label: "Claude MCP docs", url: "https://docs.anthropic.com/en/docs/mcp" }], deepDive: "Explain MCP (Model Context Protocol) to a product builder — what problems does it solve, and what could I realistically build with it as a solo developer?", tag: "Architecture", seeded: true },
  { term: "Hallucination", emoji: "👻", definition: "When an AI confidently states something false — it doesn't 'know' it's wrong. The #1 reliability problem in production AI products.", examples: [{ label: "Why LLMs hallucinate", url: "https://www.ibm.com/topics/ai-hallucinations" }], deepDive: "What are the most effective techniques for reducing hallucinations in a production AI app? Give me a ranked list from easiest to implement to hardest.", tag: "Risk", seeded: true },
  { term: "Fine-tuning", emoji: "🎛️", definition: "Training an existing model further on your own data to make it better at a specific task or style. Expensive, often overkill — RAG is usually the right answer first.", examples: [{ label: "OpenAI fine-tuning guide", url: "https://platform.openai.com/docs/guides/fine-tuning" }], deepDive: "When does fine-tuning actually make sense vs RAG vs prompt engineering? Give me a decision framework with real examples.", tag: "Architecture", seeded: true },
];

const TAG_COLORS = {
  "Core Concept": { bg: "rgba(59,130,246,0.13)", text: "rgba(147,197,253,1)", border: "rgba(59,130,246,0.3)" },
  "Dev Tool":     { bg: "rgba(16,185,129,0.13)", text: "rgba(110,231,183,1)", border: "rgba(16,185,129,0.3)" },
  "Economics":    { bg: "rgba(245,158,11,0.13)", text: "rgba(252,211,77,1)",  border: "rgba(245,158,11,0.3)" },
  "Architecture": { bg: "rgba(139,92,246,0.13)", text: "rgba(196,181,253,1)", border: "rgba(139,92,246,0.3)" },
  "Craft":        { bg: "rgba(236,72,153,0.13)", text: "rgba(249,168,212,1)", border: "rgba(236,72,153,0.3)" },
  "Risk":         { bg: "rgba(239,68,68,0.13)",  text: "rgba(252,165,165,1)", border: "rgba(239,68,68,0.3)" },
};
const getTagColor = (tag) => TAG_COLORS[tag] || { bg: "rgba(20,184,166,0.13)", text: "rgba(94,234,212,1)", border: "rgba(20,184,166,0.3)" };

function TagBadge({ tag, isNew }) {
  const c = getTagColor(tag);
  return (
    <span className="text-xs px-2 py-0.5 rounded-full border font-medium"
      style={{ background: c.bg, color: c.text, borderColor: c.border }}>
      {isNew ? "✨ " : ""}{tag}
    </span>
  );
}

function GlossaryCard({ item, isOpen, onToggle, isNew }) {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const ref = useRef(null);

  useEffect(() => {
    if (isNew && ref.current) setTimeout(() => ref.current.scrollIntoView({ behavior: "smooth", block: "center" }), 150);
  }, [isNew]);

  const runDeepDive = async () => {
    setLoading(true); setResponse(null);
    try {
      const res = await fetch("/api/claude", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514", max_tokens: 1000,
          system: "You are a sharp, practical AI tutor. Answer concisely — max 200 words. Plain language. No bullet spam. Brief paragraphs.",
          messages: [{ role: "user", content: item.deepDive }],
        }),
      });
      const d = await res.json();
      setResponse(d.content?.[0]?.text || "No response.");
    } catch { setResponse("Error — try again."); }
    setLoading(false);
  };

  return (
    <div ref={ref} className="rounded-xl overflow-hidden transition-all duration-300" style={{
      background: isNew ? "rgba(20,184,166,0.05)" : "rgba(255,255,255,0.04)",
      border: isNew ? "1px solid rgba(20,184,166,0.3)" : "1px solid rgba(255,255,255,0.09)",
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
            <p className="text-sm mt-0.5 line-clamp-1" style={{ color: "rgba(255,255,255,0.45)" }}>{item.definition}</p>
          </div>
        </div>
        <span className="flex-shrink-0 transition-transform duration-200" style={{ color: "rgba(255,255,255,0.25)", transform: isOpen ? "rotate(180deg)" : "none" }}>▾</span>
      </button>

      {isOpen && (
        <div className="px-5 pb-5 pt-4 space-y-4" style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
          <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.78)" }}>{item.definition}</p>

          {item.examples?.length > 0 && (
            <div>
              <p className="text-xs uppercase tracking-widest mb-2" style={{ color: "rgba(255,255,255,0.3)" }}>Examples</p>
              <div className="flex flex-wrap gap-2">
                {item.examples.map((ex, i) => (
                  <a key={i} href={ex.url} target="_blank" rel="noreferrer"
                    className="text-xs px-3 py-1.5 rounded-lg transition-colors"
                    style={{ border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.5)" }}>
                    {ex.label} ↗
                  </a>
                ))}
              </div>
            </div>
          )}

          <div className="rounded-lg p-3" style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <p className="text-xs uppercase tracking-widest mb-1.5" style={{ color: "rgba(255,255,255,0.3)" }}>Deep dive</p>
            <p className="text-sm italic mb-3" style={{ color: "rgba(255,255,255,0.5)" }}>"{item.deepDive}"</p>
            <button onClick={runDeepDive} disabled={loading} className="text-xs px-4 py-2 rounded-lg font-medium transition-all"
              style={{
                background: loading ? "rgba(255,255,255,0.04)" : "rgba(99,102,241,0.22)",
                color: loading ? "rgba(255,255,255,0.2)" : "rgba(199,210,254,1)",
                border: "1px solid rgba(99,102,241,0.28)",
              }}>
              {loading ? "Asking Claude..." : "▶ Run this prompt"}
            </button>
            {response && (
              <div className="mt-3 pt-3" style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
                <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: "rgba(255,255,255,0.68)" }}>{response}</p>
              </div>
            )}
          </div>
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

export default function AIGlossary() {
  const [terms, setTerms] = useState(SEED_GLOSSARY);
  const [newKeys, setNewKeys] = useState(new Set());
  const [openTerm, setOpenTerm] = useState(null);
  const [search, setSearch] = useState("");
  const [activeTag, setActiveTag] = useState("All");
  const [generating, setGenerating] = useState(null);
  const [feedback, setFeedback] = useState(null); // { type: "notRelevant"|"error", term }

  useEffect(() => {
    try {
      const raw = localStorage.getItem("kairo-decode-v1");
      if (raw) {
        const saved = JSON.parse(raw);
        if (saved.length) {
          setTerms([...SEED_GLOSSARY, ...saved]);
          setNewKeys(new Set(saved.map(t => t.term.toLowerCase())));
        }
      }
    } catch {}
  }, []);

  const persist = (all) => {
    try {
      localStorage.setItem("kairo-decode-v1", JSON.stringify(all.filter(t => !t.seeded)));
    } catch {}
  };

  const allTermNames = terms.map(t => t.term.toLowerCase());

  const tryAdd = async (raw) => {
    const query = raw.trim();
    if (!query) return;
    setFeedback(null);

    const exact = terms.find(t => t.term.toLowerCase() === query.toLowerCase());
    if (exact) { setOpenTerm(exact.term); setSearch(""); return; }

    setGenerating(query);
    try {
      const res = await fetch("/api/claude", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514", max_tokens: 1000,
          system: `You maintain a glossary for AI, ML, software dev, and tech entrepreneurship.
Given a term, decide if it's genuinely relevant to that domain. If yes, generate a glossary entry.
Respond ONLY with raw JSON — no markdown, no backticks, no explanation.

If relevant:
{"relevant":true,"term":"Canonical Name","emoji":"single emoji","definition":"One crisp sentence.","examples":[{"label":"short label","url":"https://real-url.com"}],"deepDive":"One punchy question a product builder would want answered.","tag":"Core Concept|Dev Tool|Economics|Architecture|Craft|Risk|or a new precise tag"}

If not relevant (random word, name, off-topic): {"relevant":false}

Already in glossary (do not duplicate): ${allTermNames.join(", ")}`,
          messages: [{ role: "user", content: query }],
        }),
      });
      const d = await res.json();
      const text = (d.content?.[0]?.text || "{}").replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(text);

      if (!parsed.relevant) { setFeedback({ type: "notRelevant", term: query }); }
      else if (parsed.term) {
        const entry = { ...parsed, seeded: false };
        delete entry.relevant;
        const updated = [...terms, entry];
        setTerms(updated);
        setNewKeys(prev => new Set([...prev, entry.term.toLowerCase()]));
        setOpenTerm(entry.term);
        persist(updated);
        setSearch("");
      }
    } catch { setFeedback({ type: "error" }); }
    setGenerating(null);
  };

  const tags = ["All", ...Array.from(new Set(terms.map(t => t.tag)))];

  const filtered = terms.filter(item => {
    const q = search.trim().toLowerCase();
    const matchSearch = !q || item.term.toLowerCase().includes(q) || item.definition.toLowerCase().includes(q);
    return matchSearch && (activeTag === "All" || item.tag === activeTag);
  });

  const searchQ = search.trim();
  const isKnown = searchQ && terms.some(t => t.term.toLowerCase() === searchQ.toLowerCase());
  const showAddHint = searchQ.length > 1 && !isKnown && !generating && filtered.length === 0;
  const generatedCount = terms.filter(t => !t.seeded).length;

  return (
    <div className="min-h-screen p-6" style={{ background: "linear-gradient(135deg,#080810 0%,#0d0d1c 60%,#080812 100%)", fontFamily: "'DM Sans',system-ui,sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&display=swap');*{box-sizing:border-box}::placeholder{color:rgba(255,255,255,0.22)}input{caret-color:rgba(99,102,241,0.9)}`}</style>

      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: "rgba(99,102,241,0.55)" }}>Kairo</span>
            <span style={{ color: "rgba(255,255,255,0.15)" }}>—</span>
            <span className="text-xs" style={{ color: "rgba(255,255,255,0.28)" }}>Decode</span>
            {generatedCount > 0 && <>
              <span style={{ color: "rgba(255,255,255,0.15)" }}>·</span>
              <span className="text-xs" style={{ color: "rgba(20,184,166,0.65)" }}>+{generatedCount} discovered</span>
            </>}
          </div>
          <h1 className="text-4xl font-bold tracking-tight mb-2" style={{ background: "linear-gradient(135deg,#fff 0%,rgba(255,255,255,0.38) 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Decode
          </h1>
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.38)" }}>
            Search any AI term. Unknown but relevant? It gets added automatically. 🧠
          </p>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <input
            type="text"
            placeholder="Search existing or type new term — press Enter"
            value={search}
            onChange={e => { setSearch(e.target.value); setFeedback(null); }}
            onKeyDown={e => e.key === "Enter" && tryAdd(search)}
            className="w-full px-4 py-3 rounded-xl text-sm text-white outline-none border transition-all"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", fontFamily: "inherit", fontSize: "16px" }}
          />
          {searchQ.length > 1 && !generating && (
            <button onClick={() => tryAdd(search)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-xs px-3 py-1.5 rounded-lg font-medium"
              style={{ background: "rgba(99,102,241,0.22)", color: "rgba(199,210,254,1)", border: "1px solid rgba(99,102,241,0.28)" }}>
              {isKnown ? "Open ↵" : "Add ✨"}
            </button>
          )}
          {generating && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2"><PulsingDots /></div>
          )}
        </div>

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
            <div>
              <p className="text-white font-bold tracking-tight">{generating}</p>
              <p className="text-sm flex items-center gap-1.5" style={{ color: "rgba(20,184,166,0.75)" }}>
                Generating entry <PulsingDots />
              </p>
            </div>
          </div>
        )}

        {/* Add hint */}
        {showAddHint && (
          <div className="mb-4 px-5 py-4 rounded-xl flex items-center justify-between gap-3"
            style={{ background: "rgba(20,184,166,0.05)", border: "1px solid rgba(20,184,166,0.18)" }}>
            <div>
              <p className="text-white font-medium">"{searchQ}" isn't in the glossary yet</p>
              <p className="text-sm mt-0.5" style={{ color: "rgba(20,184,166,0.65)" }}>Press Enter or tap Add to generate an entry</p>
            </div>
            <button onClick={() => tryAdd(search)} className="text-xs px-4 py-2 rounded-lg font-medium flex-shrink-0"
              style={{ background: "rgba(20,184,166,0.18)", color: "rgba(94,234,212,1)", border: "1px solid rgba(20,184,166,0.28)" }}>
              Add ✨
            </button>
          </div>
        )}

        {/* Tag filter */}
        <div className="flex flex-wrap gap-2 mb-5">
          {tags.map(tag => (
            <button key={tag} onClick={() => setActiveTag(tag)}
              className="text-xs px-3 py-1.5 rounded-full border transition-all"
              style={{
                border: activeTag === tag ? "1px solid rgba(99,102,241,0.55)" : "1px solid rgba(255,255,255,0.09)",
                background: activeTag === tag ? "rgba(99,102,241,0.18)" : "transparent",
                color: activeTag === tag ? "rgba(199,210,254,1)" : "rgba(255,255,255,0.38)",
              }}>
              {tag}
            </button>
          ))}
        </div>

        {/* Cards */}
        <div className="space-y-2">
          {filtered.map(item => (
            <GlossaryCard
              key={item.term}
              item={item}
              isOpen={openTerm === item.term}
              onToggle={() => setOpenTerm(openTerm === item.term ? null : item.term)}
              isNew={newKeys.has(item.term.toLowerCase())}
            />
          ))}
        </div>

        <p className="text-center text-xs mt-8" style={{ color: "rgba(255,255,255,0.13)" }}>
          {terms.length} terms · {generatedCount} auto-discovered · Kairo Decode
        </p>
      </div>
    </div>
  );
}
