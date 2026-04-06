"use client";

import { useState, useEffect, useRef } from "react";

const SEED_GLOSSARY = [
  { term: "Agent", emoji: "🤖", definition: "An AI system that can take actions autonomously — not just answer questions, but actually do things: browse the web, write code, call APIs, manage files.", examples: [{ label: "Claude agent browsing the web", url: "https://www.anthropic.com/claude" }, { label: "AutoGPT (early popular agent)", url: "https://github.com/Significant-Gravitas/AutoGPT" }], deepDive: ["What's the difference between an AI chatbot and an AI agent? Give me a concrete example of each, and explain when you'd use one vs the other.", "What are the biggest failure modes of AI agents in production today, and how do teams guard against them?", "How do you decide when a task should be handled by a single AI call vs a multi-step agent?"], smartLines: ["The agent handled it — plus two tasks I didn't ask for and one I probably should have.", "Saying 'I have an agent on it' sounds better than 'automated script', and is usually more accurate."], tag: "Core Concept", seeded: true },
  { term: "Agentic", emoji: "⚡", definition: "Adjective describing AI behaviour that is goal-directed and multi-step — the AI decides what to do next rather than just responding to a single prompt.", examples: [{ label: "Anthropic on agentic AI", url: "https://www.anthropic.com/research/building-effective-agents" }], deepDive: ["Explain 'agentic AI' like I'm a product manager. What does it mean in practice for building products? What are the risks?", "What's the difference between 'agentic' and 'autonomous' AI? Where does one end and the other begin?", "Give me three real products that are meaningfully agentic, and explain what makes each agentic vs just a chatbot."], smartLines: ["Our roadmap is fully agentic — the AI plans, we explain it to stakeholders.", "Call it agentic in a pitch and you'll either raise the room or lose it. No middle ground."], tag: "Core Concept", seeded: true },
  { term: "Model", emoji: "🧠", definition: "The actual AI brain — the trained neural network that processes input and generates output. GPT-4, Claude 3.5 Sonnet, Gemini are all 'models'.", examples: [{ label: "Anthropic model overview", url: "https://docs.anthropic.com/en/docs/about-claude/models/overview" }, { label: "OpenAI model comparison", url: "https://platform.openai.com/docs/models" }], deepDive: ["Compare the major frontier AI models available today (Claude, GPT-4o, Gemini, Llama) — strengths, weaknesses, best use cases, cost differences.", "How do you pick the right model for a production product — what trade-offs matter most between speed, cost, and quality?", "What does 'model capability' actually mean in practice — how do benchmark scores translate to real-world product quality?"], smartLines: ["We switched models and things improved — I'm crediting the model, not the prompts we quietly rewrote.", "Wrong answer? Blame the model. Right answer? That was your prompt engineering."], tag: "Core Concept", seeded: true },
  { term: "CLI", emoji: "💻", definition: "Command Line Interface — you type text commands directly into a terminal instead of clicking around a GUI. How developers talk to computers (and increasingly, to AI tools).", examples: [{ label: "Claude Code CLI", url: "https://docs.anthropic.com/en/docs/claude-code/overview" }, { label: "GitHub CLI", url: "https://cli.github.com/" }], deepDive: ["I'm a non-developer learning to use the CLI for AI development. Give me the 10 commands I'll use most often, with plain-English explanations.", "What's the fastest way to get comfortable with the CLI as a non-technical founder building AI tools?", "How is the CLI used differently in AI development vs traditional software development? What new patterns have emerged?"], smartLines: ["I use the CLI for everything now — developers are impressed, everyone else is concerned.", "The CLI does exactly what you type. That's both its best and worst quality."], tag: "Dev Tool", seeded: true },
  { term: "IDE", emoji: "🖥️", definition: "Integrated Development Environment — a fancy text editor for writing code. Think Xcode but for everything. Cursor and VS Code are the popular ones right now.", examples: [{ label: "Cursor (AI-native IDE)", url: "https://cursor.com" }, { label: "VS Code", url: "https://code.visualstudio.com/" }], deepDive: ["Compare Cursor vs VS Code for someone building AI-powered web apps as a side project. Which should I use and why?", "What AI IDE features actually save meaningful time vs feel impressive but don't change your workflow?", "How do AI-native IDEs like Cursor change how you should think about writing and structuring code?"], smartLines: ["Switched to an AI-native IDE. Still not sure what I was doing with all those keystrokes before.", "Choosing your IDE matters — just not as much as the time people spend arguing about it."], tag: "Dev Tool", seeded: true },
  { term: "Token", emoji: "🪙", definition: "The unit of text that AI models process — roughly ¾ of a word. API costs are measured in tokens. 1,000 tokens ≈ 750 words. This is the 'spend' on those Instagram dashboards.", examples: [{ label: "Anthropic pricing (tokens)", url: "https://www.anthropic.com/pricing" }], deepDive: ["Explain AI token economics to me like I'm building a subscription product. How do I model costs vs revenue at scale?", "What's the most common mistake founders make when estimating token costs for their AI product?", "How do context window size and token count interact — and what does that mean for product design decisions?"], smartLines: ["We're burning tokens like runway — fast, alarming, and somehow always someone else's fault.", "When the PM asks why it's expensive, say 'tokens' and nod until the topic changes."], tag: "Economics", seeded: true },
  { term: "Context Window", emoji: "🪟", definition: "How much text an AI can 'hold in its head' at once — its working memory. Bigger = more expensive but smarter in long conversations or large document tasks.", examples: [{ label: "Claude's 200k context window explained", url: "https://www.anthropic.com/news/claude-2-1" }], deepDive: ["What are the practical implications of context window size when building a product like a daily briefing tool? When does it matter, when doesn't it?", "How should I design my app's architecture differently depending on whether I have a small vs large context window?", "What happens when you hit the context window limit in production — and what are the best strategies to handle it gracefully?"], smartLines: ["The context window is why your AI forgot what you said ten minutes ago. Relatable.", "We hit the limit mid-doc. The AI now has very strong opinions about page one."], tag: "Core Concept", seeded: true },
  { term: "RAG", emoji: "📚", definition: "Retrieval-Augmented Generation — instead of asking the model to 'remember' facts, you fetch relevant docs at runtime and inject them into the prompt. Smarter than fine-tuning for most use cases.", examples: [{ label: "What is RAG?", url: "https://aws.amazon.com/what-is/retrieval-augmented-generation/" }], deepDive: ["Explain RAG vs fine-tuning for a non-technical founder building a B2B SaaS AI product. Which approach for which problem?", "What are the most common ways RAG implementations fail in production, and how do you prevent them?", "Walk me through the minimum viable RAG setup for a startup — what do I actually need to build vs what can I skip?"], smartLines: ["RAG is the model Googling before it answers — humbling or reassuring, depending on what you paid.", "We added RAG to our docs. The model now knows our policies better than anyone on the team."], tag: "Architecture", seeded: true },
  { term: "Prompt Engineering", emoji: "✍️", definition: "The craft of writing instructions to AI models to get reliably good outputs. More art than science — but there are real patterns that work.", examples: [{ label: "Anthropic prompt engineering guide", url: "https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/overview" }], deepDive: ["Give me the 5 most impactful prompt engineering techniques with before/after examples. Focus on techniques that improve consistency and reduce hallucination.", "How much does prompt engineering actually matter now that models are smarter — or is it becoming less important?", "What's the difference between a prompt that works in a demo and one that works reliably in production?"], smartLines: ["Good prompt engineering is invisible. Bad prompt engineering starts every response with 'Certainly!'", "Spent two hours on prompt engineering so the model would stop saying 'As an AI language model.' Zero regrets."], tag: "Craft", seeded: true },
  { term: "MCP", emoji: "🔌", definition: "Model Context Protocol — Anthropic's open standard for connecting AI models to external tools, data sources, and services. Like USB-C but for AI integrations.", examples: [{ label: "MCP introduction", url: "https://modelcontextprotocol.io/introduction" }, { label: "Claude MCP docs", url: "https://docs.anthropic.com/en/docs/mcp" }], deepDive: ["Explain MCP (Model Context Protocol) to a product builder — what problems does it solve, and what could I realistically build with it as a solo developer?", "How does MCP compare to building custom API integrations — when would I use one over the other?", "What are the most useful MCP integrations available right now, and which ones are actually worth implementing?"], smartLines: ["MCP is what comes after 'just call the API' stops being a good enough answer.", "Once you understand MCP, you start seeing integration problems everywhere. Skill or curse — unclear."], tag: "Architecture", seeded: true },
  { term: "Hallucination", emoji: "👻", definition: "When an AI confidently states something false — it doesn't 'know' it's wrong. The #1 reliability problem in production AI products.", examples: [{ label: "Why LLMs hallucinate", url: "https://www.ibm.com/topics/ai-hallucinations" }], deepDive: ["What are the most effective techniques for reducing hallucinations in a production AI app? Give me a ranked list from easiest to implement to hardest.", "How do you detect hallucinations at scale in a production system — what monitoring or evaluation approaches work?", "What product design patterns make hallucinations less likely to cause real harm even when they do happen?"], smartLines: ["The model hallucinated a citation so convincing I almost used it. Says more about my process than the model.", "We have a hallucination review step in QA now. Not a sentence I expected to write."], tag: "Risk", seeded: true },
  { term: "Fine-tuning", emoji: "🎛️", definition: "Training an existing model further on your own data to make it better at a specific task or style. Expensive, often overkill — RAG is usually the right answer first.", examples: [{ label: "OpenAI fine-tuning guide", url: "https://platform.openai.com/docs/guides/fine-tuning" }], deepDive: ["When does fine-tuning actually make sense vs RAG vs prompt engineering? Give me a decision framework with real examples.", "What data quality and quantity do you actually need to make fine-tuning worthwhile — what are the minimums?", "How do you evaluate whether a fine-tuned model is actually better than a well-prompted base model for your use case?"], smartLines: ["We fine-tuned on our support tickets. The model is now the most knowledgeable person on the team.", "Fine-tuning is for when prompt engineering has failed twice and you still won't try RAG."], tag: "Architecture", seeded: true },
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

function HighlightedSentence({ sentence, term }) {
  const esc = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = new RegExp(`\\b(${esc})\\b`, "i").exec(sentence);
  if (!match) return <span>{sentence}</span>;
  return (
    <span>
      {sentence.slice(0, match.index)}
      <strong style={{ color: "rgba(199,210,254,1)", background: "rgba(99,102,241,0.2)", borderRadius: "3px", padding: "0 3px" }}>
        {match[0]}
      </strong>
      {sentence.slice(match.index + match[0].length)}
    </span>
  );
}

function LinkedDefinition({ text, terms, currentTerm, onTermClick, onAddTerm }) {
  const otherTerms = terms
    .filter(t => t.term.toLowerCase() !== currentTerm.toLowerCase())
    .map(t => t.term)
    .sort((a, b) => b.length - a.length);

  // Pass 1: split by known glossary terms (case-insensitive, word-boundary, optional plural s)
  let segments = [{ type: "text", content: text }];
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

function GlossaryCard({ item, isOpen, onToggle, isNew, shouldScrollTo, allTerms, onTermClick, onAddTerm }) {
  const deepDives = Array.isArray(item.deepDive) ? item.deepDive : [item.deepDive];
  const [smartLines, setSmartLines] = useState(item.smartLines || []);
  const [generatingSmartLines, setGeneratingSmartLines] = useState(false);

  useEffect(() => {
    if (!isOpen || smartLines.length > 0 || generatingSmartLines || item.seeded) return;
    setGeneratingSmartLines(true);
    fetch("/api/claude", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514", max_tokens: 300,
        system: "You write short, dry, witty example sentences for a tech glossary. Respond ONLY with a raw JSON array — no markdown, no backticks.",
        messages: [{ role: "user", content: `Term: "${item.term}"\nDefinition: "${item.definition}"\n\nWrite exactly 2 sentences (max 20 words each) using this term naturally. Dry wit welcome.\nFormat: ["sentence one.","sentence two."]` }],
      }),
    })
      .then(r => r.json())
      .then(d => {
        const text = (d.content?.[0]?.text || "[]").replace(/```json|```/g, "").trim();
        const lines = JSON.parse(text);
        if (Array.isArray(lines) && lines.length > 0) {
          setSmartLines(lines);
          fetch("/api/terms", {
            method: "PATCH", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ term: item.term, smartLines: lines }),
          }).catch(() => {});
        }
      })
      .catch(() => {})
      .finally(() => setGeneratingSmartLines(false));
  }, [isOpen]);
  const [loadingIdx, setLoadingIdx] = useState(null);
  const [responses, setResponses] = useState(Array(deepDives.length).fill(null));
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
          <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.78)" }}>
            <LinkedDefinition text={item.definition} terms={allTerms} currentTerm={item.term} onTermClick={onTermClick} onAddTerm={onAddTerm} />
          </p>

          {(smartLines.length > 0 || generatingSmartLines) && (
            <div>
              <p className="text-xs uppercase tracking-widest mb-2 flex items-center gap-2" style={{ color: "rgba(255,255,255,0.3)" }}>
                Make me look like I know what I'm talking about
                {generatingSmartLines && <PulsingDots />}
              </p>
              {smartLines.length > 0 && (
                <div className="space-y-2">
                  {smartLines.map((line, i) => (
                    <p key={i} className="text-sm leading-relaxed italic" style={{ color: "rgba(255,255,255,0.52)" }}>
                      "<HighlightedSentence sentence={line} term={item.term} />"
                    </p>
                  ))}
                </div>
              )}
            </div>
          )}

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

          <div className="rounded-lg p-3 space-y-3" style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <p className="text-xs uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.3)" }}>Deep dive</p>
            {deepDives.map((prompt, idx) => {
              const isLoading = loadingIdx === idx;
              const response = responses[idx];
              return (
                <div key={idx} className="pt-2" style={{ borderTop: idx === 0 ? "none" : "1px solid rgba(255,255,255,0.06)" }}>
                  <p className="text-sm italic mb-2" style={{ color: "rgba(255,255,255,0.5)" }}>"{prompt}"</p>
                  <button onClick={() => runDeepDive(idx)} disabled={loadingIdx !== null} className="text-xs px-4 py-2 rounded-lg font-medium transition-all"
                    style={{
                      background: isLoading ? "rgba(255,255,255,0.04)" : "rgba(99,102,241,0.22)",
                      color: (loadingIdx !== null && !isLoading) ? "rgba(255,255,255,0.15)" : isLoading ? "rgba(255,255,255,0.2)" : "rgba(199,210,254,1)",
                      border: "1px solid rgba(99,102,241,0.28)",
                      cursor: loadingIdx !== null ? "not-allowed" : "pointer",
                    }}>
                    {isLoading ? "Asking Claude..." : "▶ Run this prompt"}
                  </button>
                  {response && (
                    <div className="mt-2 pt-2" style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
                      <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: "rgba(255,255,255,0.68)" }}>{response}</p>
                    </div>
                  )}
                </div>
              );
            })}
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
  const [scrollToTerm, setScrollToTerm] = useState(null);

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
          tag: t.tag,
          seeded: false,
        }));
        setTerms([...SEED_GLOSSARY, ...remote]);
      })
      .catch(() => {});
  }, []);

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
{"relevant":true,"term":"Canonical Name","emoji":"single emoji","definition":"One crisp sentence.","examples":[{"label":"short label","url":"https://real-url.com"}],"deepDive":["First punchy question a product builder would want answered.","Second distinct angle on the term — practical or comparative.","Third question — edge case, risk, or real-world implementation detail."],"smartLines":["First sentence using the term naturally in a realistic context, with a touch of dry wit.","Second sentence — different angle, equally grounded."],"tag":"Core Concept|Dev Tool|Economics|Architecture|Craft|Risk|or a new precise tag"}

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
        setTerms(prev => [...prev, entry]);
        setNewKeys(prev => new Set([...prev, entry.term.toLowerCase()]));
        setOpenTerm(entry.term);
        persist(entry);
        setSearch("");
      }
    } catch { setFeedback({ type: "error" }); }
    setGenerating(null);
  };

  const tags = ["All", ...Array.from(new Set(terms.map(t => t.tag)))];

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

  return (
    <div className="min-h-screen p-6" style={{ background: "linear-gradient(135deg,#080810 0%,#0d0d1c 60%,#080812 100%)", fontFamily: "'DM Sans',system-ui,sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=Jost:ital,wght@1,800&display=swap');*{box-sizing:border-box}::placeholder{color:rgba(255,255,255,0.22)}input{caret-color:rgba(99,102,241,0.9)}`}</style>

      {/* Fixed heading */}
      <div className="fixed top-0 left-0 right-0 z-50 px-6 pt-6 pb-6" style={{ background: "#080810", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl tracking-tight" style={{ fontFamily: "'Jost',system-ui,sans-serif", fontWeight: 800, fontStyle: "italic", textTransform: "lowercase" }}>
            <span style={{ color: "#2a3a6a" }}>k</span><span style={{ color: "#5b80e8" }}>ai</span><span style={{ color: "#2a3a6a" }}>ro</span> <span style={{ color: "#5b80e8" }}>decode</span>
          </h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto" style={{ paddingTop: "96px" }}>
        {/* Sub-header */}
        <div className="mb-8">
          <p className="text-sm mb-2" style={{ color: "rgba(255,255,255,0.38)" }}>
            Search any AI term. Unknown but relevant? It gets added automatically. 🧠
          </p>
          {generatedCount > 0 && (
            <span className="text-xs" style={{ color: "rgba(20,184,166,0.65)" }}>+{generatedCount} discovered</span>
          )}
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <input
            type="text"
            placeholder="Search existing or type new term"
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
              shouldScrollTo={scrollToTerm === item.term}
              allTerms={terms}
              onTermClick={handleTermClick}
              onAddTerm={handleAddTerm}
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
