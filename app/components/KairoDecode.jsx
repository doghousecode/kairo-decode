"use client";

import { useState, useEffect, useRef } from "react";

const SEED_GLOSSARY = [];

const LANGUAGES = [
  { code: "en", flag: "🇬🇧", name: "English",  nativeName: "English"    },
  { code: "fr", flag: "🇫🇷", name: "French",   nativeName: "Français"   },
  { code: "de", flag: "🇩🇪", name: "German",   nativeName: "Deutsch"    },
  { code: "es", flag: "🇪🇸", name: "Spanish",  nativeName: "Español"    },
  { code: "it", flag: "🇮🇹", name: "Italian",  nativeName: "Italiano"   },
  { code: "nl", flag: "🇳🇱", name: "Dutch",    nativeName: "Nederlands" },
  { code: "ko", flag: "🇰🇷", name: "Korean",   nativeName: "한국어"      },
  { code: "ja", flag: "🇯🇵", name: "Japanese", nativeName: "日本語"      },
  { code: "hi", flag: null,  label: "हि",       name: "Hindi",   nativeName: "हिन्दी"    },
  { code: "pa", flag: null,  label: "ਪੰ",       name: "Punjabi", nativeName: "ਪੰਜਾਬੀ"   },
];

const LANG_NAMES = {
  en: "English", fr: "French", de: "German", es: "Spanish",
  it: "Italian", nl: "Dutch", ko: "Korean", ja: "Japanese",
  hi: "Hindi", pa: "Punjabi",
};

const UI_STRINGS = {
  en: {
    placeholder: "Search existing or add new term…",
    open: "Open ↵", add: "Add ✨", offline: "Offline",
    makeSmartLabel: "Make me look smart",
    examplesLabel: "Examples", deepDiveLabel: "Deep dive",
    runPrompt: "▶ Run", askingClaude: "Asking Claude...", askCustom: "▶ Ask", customPlaceholder: "Or ask something else…",
    translating: "Translating…",
    offlineBanner: "You're offline — browsing cached terms. Adding terms and deep dives are unavailable.",
    notRelevant: (term) => `"${term}" doesn't look like an AI/tech term — skipping it.`,
    error: "Something went wrong. Try again?",
    notInGlossary: (term) => `"${term}" isn't in the glossary yet`,
    addPrompt: "Press Enter or tap Add to generate an entry",
    connectToAdd: "Connect to add new terms",
    discovered: (n) => `+${n} discovered`,
    generatingEntry: "Generating entry",
    footer: (total, gen) => `${total} terms · ${gen} auto-discovered · Kairo Decode`,
    tags: { "All":"All","Model":"Model","Core Concept":"Core Concept","Dev Tool":"Dev Tool","Risk":"Risk","Behaviour":"Behaviour","Economics":"Economics","Technique":"Technique","Architecture":"Architecture","Craft":"Craft" },
  },
  fr: {
    placeholder: "Rechercher ou ajouter un terme…",
    open: "Ouvrir ↵", add: "Ajouter ✨", offline: "Hors ligne",
    makeSmartLabel: "Impressionnez votre entourage",
    examplesLabel: "Exemples", deepDiveLabel: "Approfondissement",
    runPrompt: "▶ Lancer", askingClaude: "Demande à Claude...", askCustom: "▶ Demander", customPlaceholder: "Ou posez autre chose…",
    translating: "Traduction…",
    offlineBanner: "Vous êtes hors ligne — navigation dans les termes en cache. L'ajout de termes n'est pas disponible.",
    notRelevant: (term) => `"${term}" ne semble pas être un terme IA/tech — ignoré.`,
    error: "Une erreur s'est produite. Réessayer ?",
    notInGlossary: (term) => `"${term}" n'est pas encore dans le glossaire`,
    addPrompt: "Appuyez sur Entrée ou sur Ajouter pour générer une entrée",
    connectToAdd: "Connectez-vous pour ajouter des termes",
    discovered: (n) => `+${n} découverts`,
    generatingEntry: "Génération en cours",
    footer: (total, gen) => `${total} termes · ${gen} découverts · Kairo Decode`,
    tags: { "All":"Tout","Model":"Modèle","Core Concept":"Concept clé","Dev Tool":"Outil dev","Risk":"Risque","Behaviour":"Comportement","Economics":"Économie","Technique":"Technique","Architecture":"Architecture","Craft":"Artisanat" },
  },
  de: {
    placeholder: "Begriff suchen oder hinzufügen…",
    open: "Öffnen ↵", add: "Hinzufügen ✨", offline: "Offline",
    makeSmartLabel: "Überzeuge dein Umfeld",
    examplesLabel: "Beispiele", deepDiveLabel: "Vertiefung",
    runPrompt: "▶ Ausführen", askingClaude: "Claude wird gefragt...", askCustom: "▶ Fragen", customPlaceholder: "Oder etwas anderes fragen…",
    translating: "Übersetzen…",
    offlineBanner: "Sie sind offline — gespeicherte Begriffe werden angezeigt. Hinzufügen nicht verfügbar.",
    notRelevant: (term) => `"${term}" scheint kein KI/Tech-Begriff zu sein — übersprungen.`,
    error: "Etwas ist schiefgelaufen. Nochmal versuchen?",
    notInGlossary: (term) => `"${term}" ist noch nicht im Glossar`,
    addPrompt: "Enter drücken oder Hinzufügen antippen",
    connectToAdd: "Verbinden, um Begriffe hinzuzufügen",
    discovered: (n) => `+${n} entdeckt`,
    generatingEntry: "Eintrag wird generiert",
    footer: (total, gen) => `${total} Begriffe · ${gen} entdeckt · Kairo Decode`,
    tags: { "All":"Alle","Model":"Modell","Core Concept":"Kernkonzept","Dev Tool":"Dev-Tool","Risk":"Risiko","Behaviour":"Verhalten","Economics":"Wirtschaft","Technique":"Technik","Architecture":"Architektur","Craft":"Handwerk" },
  },
  es: {
    placeholder: "Buscar o añadir un término…",
    open: "Abrir ↵", add: "Añadir ✨", offline: "Sin conexión",
    makeSmartLabel: "Impresiona a tu equipo",
    examplesLabel: "Ejemplos", deepDiveLabel: "Profundización",
    runPrompt: "▶ Ejecutar", askingClaude: "Preguntando a Claude...", askCustom: "▶ Preguntar", customPlaceholder: "O pregunta algo más…",
    translating: "Traduciendo…",
    offlineBanner: "Estás sin conexión — navegando por los términos guardados. Añadir términos no está disponible.",
    notRelevant: (term) => `"${term}" no parece ser un término de IA/tech — omitido.`,
    error: "Algo salió mal. ¿Intentar de nuevo?",
    notInGlossary: (term) => `"${term}" aún no está en el glosario`,
    addPrompt: "Pulsa Enter o toca Añadir para generar una entrada",
    connectToAdd: "Conéctate para añadir términos",
    discovered: (n) => `+${n} descubiertos`,
    generatingEntry: "Generando entrada",
    footer: (total, gen) => `${total} términos · ${gen} descubiertos · Kairo Decode`,
    tags: { "All":"Todo","Model":"Modelo","Core Concept":"Concepto clave","Dev Tool":"Herramienta dev","Risk":"Riesgo","Behaviour":"Comportamiento","Economics":"Economía","Technique":"Técnica","Architecture":"Arquitectura","Craft":"Oficio" },
  },
  it: {
    placeholder: "Cerca o aggiungi un termine…",
    open: "Apri ↵", add: "Aggiungi ✨", offline: "Offline",
    makeSmartLabel: "Fai colpo sul tuo team",
    examplesLabel: "Esempi", deepDiveLabel: "Approfondimento",
    runPrompt: "▶ Esegui", askingClaude: "Chiedendo a Claude...", askCustom: "▶ Chiedi", customPlaceholder: "O chiedi qualcos'altro…",
    translating: "Traduzione…",
    offlineBanner: "Sei offline — stai navigando i termini salvati. L'aggiunta di termini non è disponibile.",
    notRelevant: (term) => `"${term}" non sembra un termine AI/tech — ignorato.`,
    error: "Qualcosa è andato storto. Riprova?",
    notInGlossary: (term) => `"${term}" non è ancora nel glossario`,
    addPrompt: "Premi Invio o tocca Aggiungi per generare una voce",
    connectToAdd: "Connettiti per aggiungere termini",
    discovered: (n) => `+${n} scoperti`,
    generatingEntry: "Generazione in corso",
    footer: (total, gen) => `${total} termini · ${gen} scoperti · Kairo Decode`,
    tags: { "All":"Tutto","Model":"Modello","Core Concept":"Concetto chiave","Dev Tool":"Strumento dev","Risk":"Rischio","Behaviour":"Comportamento","Economics":"Economia","Technique":"Tecnica","Architecture":"Architettura","Craft":"Artigianato" },
  },
  nl: {
    placeholder: "Zoek of voeg een term toe…",
    open: "Openen ↵", add: "Toevoegen ✨", offline: "Offline",
    makeSmartLabel: "Maak indruk op je team",
    examplesLabel: "Voorbeelden", deepDiveLabel: "Verdieping",
    runPrompt: "▶ Uitvoeren", askingClaude: "Claude wordt gevraagd...", askCustom: "▶ Vragen", customPlaceholder: "Of stel iets anders…",
    translating: "Vertalen…",
    offlineBanner: "Je bent offline — gespeicherde termen worden weergegeven. Termen toevoegen is niet beschikbaar.",
    notRelevant: (term) => `"${term}" lijkt geen AI/tech-term te zijn — overgeslagen.`,
    error: "Er is iets misgegaan. Opnieuw proberen?",
    notInGlossary: (term) => `"${term}" staat nog niet in het woordenboek`,
    addPrompt: "Druk op Enter of tik op Toevoegen om een vermelding te genereren",
    connectToAdd: "Verbind om termen toe te voegen",
    discovered: (n) => `+${n} ontdekt`,
    generatingEntry: "Vermelding genereren",
    footer: (total, gen) => `${total} termen · ${gen} ontdekt · Kairo Decode`,
    tags: { "All":"Alles","Model":"Model","Core Concept":"Kernbegrip","Dev Tool":"Dev-tool","Risk":"Risico","Behaviour":"Gedrag","Economics":"Economie","Technique":"Techniek","Architecture":"Architectuur","Craft":"Vakmanschap" },
  },
  ko: {
    placeholder: "용어 검색 또는 추가…",
    open: "열기 ↵", add: "추가 ✨", offline: "오프라인",
    makeSmartLabel: "팀에게 인상 남기기",
    examplesLabel: "예시", deepDiveLabel: "심층 분석",
    runPrompt: "▶ 프롬프트 실행", askingClaude: "Claude에게 질문 중...", askCustom: "▶ 질문", customPlaceholder: "다른 것을 물어보세요…",
    translating: "번역 중…",
    offlineBanner: "오프라인 상태입니다 — 저장된 용어를 탐색 중입니다. 용어 추가는 사용할 수 없습니다.",
    notRelevant: (term) => `"${term}"은(는) AI/기술 용어가 아닌 것 같아 건너뜁니다.`,
    error: "문제가 발생했습니다. 다시 시도하세요?",
    notInGlossary: (term) => `"${term}"은(는) 아직 용어집에 없습니다`,
    addPrompt: "Enter를 누르거나 추가를 탭하여 항목을 생성하세요",
    connectToAdd: "용어를 추가하려면 연결하세요",
    discovered: (n) => `+${n} 발견됨`,
    generatingEntry: "항목 생성 중",
    footer: (total, gen) => `${total}개 용어 · ${gen}개 자동 발견 · Kairo Decode`,
    tags: { "All":"전체","Model":"모델","Core Concept":"핵심 개념","Dev Tool":"개발 도구","Risk":"위험","Behaviour":"동작","Economics":"경제","Technique":"기법","Architecture":"아키텍처","Craft":"기술" },
  },
  ja: {
    placeholder: "用語を検索または追加…",
    open: "開く ↵", add: "追加 ✨", offline: "オフライン",
    makeSmartLabel: "チームに差をつける",
    examplesLabel: "例", deepDiveLabel: "詳しく見る",
    runPrompt: "▶ プロンプトを実行", askingClaude: "Claudeに質問中...", askCustom: "▶ 質問", customPlaceholder: "他に聞いてみる…",
    translating: "翻訳中…",
    offlineBanner: "オフラインです — 保存済み用語を閲覧中。用語の追加は利用できません。",
    notRelevant: (term) => `"${term}"はAI/技術用語ではないようです — スキップします。`,
    error: "問題が発生しました。もう一度試しますか？",
    notInGlossary: (term) => `"${term}"はまだ用語集にありません`,
    addPrompt: "Enterを押すか追加をタップしてエントリを生成",
    connectToAdd: "用語を追加するには接続してください",
    discovered: (n) => `+${n} 発見`,
    generatingEntry: "エントリ生成中",
    footer: (total, gen) => `${total}用語 · ${gen}自動発見 · Kairo Decode`,
    tags: { "All":"すべて","Model":"モデル","Core Concept":"基本概念","Dev Tool":"開発ツール","Risk":"リスク","Behaviour":"動作","Economics":"経済","Technique":"テクニック","Architecture":"アーキテクチャ","Craft":"クラフト" },
  },
  hi: {
    placeholder: "मौजूदा शब्द खोजें या नया जोड़ें…",
    open: "खोलें ↵", add: "जोड़ें ✨", offline: "ऑफलाइन",
    makeSmartLabel: "अपनी टीम को प्रभावित करें",
    examplesLabel: "उदाहरण", deepDiveLabel: "गहराई से जानें",
    runPrompt: "▶ यह प्रॉम्प्ट चलाएं", askingClaude: "Claude से पूछ रहे हैं...", askCustom: "▶ पूछें", customPlaceholder: "या कुछ और पूछें…",
    translating: "अनुवाद हो रहा है…",
    offlineBanner: "आप ऑफलाइन हैं — सहेजे गए शब्द देख रहे हैं। शब्द जोड़ना उपलब्ध नहीं है।",
    notRelevant: (term) => `"${term}" AI/tech शब्द नहीं लगता — छोड़ रहे हैं।`,
    error: "कुछ गलत हुआ। फिर कोशिश करें?",
    notInGlossary: (term) => `"${term}" अभी शब्दकोश में नहीं है`,
    addPrompt: "एंट्री बनाने के लिए Enter दबाएं या जोड़ें टैप करें",
    connectToAdd: "शब्द जोड़ने के लिए कनेक्ट करें",
    discovered: (n) => `+${n} खोजे गए`,
    generatingEntry: "एंट्री बन रही है",
    footer: (total, gen) => `${total} शब्द · ${gen} स्वचालित खोजे · Kairo Decode`,
    tags: { "All":"सभी","Model":"मॉडल","Core Concept":"मूल अवधारणा","Dev Tool":"डेव टूल","Risk":"जोखिम","Behaviour":"व्यवहार","Economics":"अर्थशास्त्र","Technique":"तकनीक","Architecture":"आर्किटेक्चर","Craft":"शिल्प" },
  },
  pa: {
    placeholder: "ਮੌਜੂਦਾ ਸ਼ਬਦ ਖੋਜੋ ਜਾਂ ਨਵਾਂ ਜੋੜੋ…",
    open: "ਖੋਲ੍ਹੋ ↵", add: "ਜੋੜੋ ✨", offline: "ਆਫਲਾਈਨ",
    makeSmartLabel: "ਆਪਣੀ ਟੀਮ ਨੂੰ ਪ੍ਰਭਾਵਿਤ ਕਰੋ",
    examplesLabel: "ਉਦਾਹਰਣਾਂ", deepDiveLabel: "ਡੂੰਘਾਈ ਨਾਲ ਜਾਣੋ",
    runPrompt: "▶ ਇਹ ਪ੍ਰੋਂਪਟ ਚਲਾਓ", askingClaude: "Claude ਤੋਂ ਪੁੱਛ ਰਹੇ ਹਾਂ...", askCustom: "▶ ਪੁੱਛੋ", customPlaceholder: "ਜਾਂ ਕੁਝ ਹੋਰ ਪੁੱਛੋ…",
    translating: "ਅਨੁਵਾਦ ਹੋ ਰਿਹਾ ਹੈ…",
    offlineBanner: "ਤੁਸੀਂ ਆਫਲਾਈਨ ਹੋ — ਸੁਰੱਖਿਅਤ ਸ਼ਬਦ ਦੇਖ ਰਹੇ ਹੋ। ਸ਼ਬਦ ਜੋੜਨਾ ਉਪਲਬਧ ਨਹੀਂ।",
    notRelevant: (term) => `"${term}" AI/tech ਸ਼ਬਦ ਨਹੀਂ ਲੱਗਦਾ — ਛੱਡ ਰਹੇ ਹਾਂ।`,
    error: "ਕੁਝ ਗਲਤ ਹੋਇਆ। ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ?",
    notInGlossary: (term) => `"${term}" ਅਜੇ ਸ਼ਬਦਕੋਸ਼ ਵਿੱਚ ਨਹੀਂ ਹੈ`,
    addPrompt: "ਐਂਟਰੀ ਬਣਾਉਣ ਲਈ Enter ਦਬਾਓ ਜਾਂ ਜੋੜੋ ਟੈਪ ਕਰੋ",
    connectToAdd: "ਸ਼ਬਦ ਜੋੜਨ ਲਈ ਕਨੈਕਟ ਕਰੋ",
    discovered: (n) => `+${n} ਖੋਜੇ ਗਏ`,
    generatingEntry: "ਐਂਟਰੀ ਬਣ ਰਹੀ ਹੈ",
    footer: (total, gen) => `${total} ਸ਼ਬਦ · ${gen} ਆਪੋ-ਆਪ ਖੋਜੇ · Kairo Decode`,
    tags: { "All":"ਸਾਰੇ","Model":"ਮਾਡਲ","Core Concept":"ਮੁੱਖ ਧਾਰਣਾ","Dev Tool":"ਡੈੱਵ ਟੂਲ","Risk":"ਜੋਖ਼ਮ","Behaviour":"ਵਤੀਰਾ","Economics":"ਅਰਥਸ਼ਾਸਤਰ","Technique":"ਤਕਨੀਕ","Architecture":"ਆਰਕੀਟੈਕਚਰ","Craft":"ਕਾਰੀਗਰੀ" },
  },
};

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

function TagBadge({ tag, label, isNew }) {
  const c = getTagColor(tag);
  return (
    <span className="text-xs px-2 py-0.5 rounded-full border font-medium"
      style={{ background: c.bg, color: c.text, borderColor: c.border }}>
      {isNew ? "✨ " : ""}{label || tag}
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

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    const plain = new Blob([text], { type: 'text/plain' });
    const item = new ClipboardItem({ 'text/plain': plain });
    navigator.clipboard.write([item])
      .catch(() => navigator.clipboard.writeText(text))
      .then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500); });
  };
  return (
    <button onClick={copy} title="Copy" style={{
      background: "none", border: "none", cursor: "pointer", padding: "2px", flexShrink: 0,
      color: copied ? "rgba(20,184,166,0.8)" : "rgba(var(--rgb),0.22)",
      display: "inline-flex", alignItems: "center", transition: "color 0.15s",
    }}>
      {copied
        ? <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
        : <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2v1"/></svg>
      }
    </button>
  );
}

function GlossaryCard({ item, isOpen, onToggle, isNew, shouldScrollTo, allTerms, onTermClick, onAddTerm, onDelete, onTermUpdate, isTyping, isOnline, lang, tagLabel, preTranslatedDef, preTranslatedSmartLines, preTranslatedDeepDive }) {
  const [deepDives, setDeepDives] = useState(Array.isArray(item.deepDive) ? item.deepDive : [item.deepDive]);
  const [smartLines, setSmartLines] = useState(item.smartLines || []);
  const [generatingSmartLines, setGeneratingSmartLines] = useState(false);
  const [generatingDeepDives, setGeneratingDeepDives] = useState(false);
  useEffect(() => {
    if (!isOpen) return;

    // Lazy-generate smartLines for DB terms that don't have them — always in English
    // so batch translation can localise them for all languages
    if (smartLines.length === 0 && !generatingSmartLines) {
      setGeneratingSmartLines(true);
      fetch("/api/claude", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-haiku-4-5-20251001", max_tokens: 300,
          system: `You write short example sentences for a tech glossary. Mildly witty is fine, but keep them useful and grounded. Respond ONLY with a raw JSON array — no markdown, no backticks.`,
          messages: [{ role: "user", content: `Term: "${item.term}"\nDefinition: "${item.definition}"\n\nWrite exactly 2 sentences (max 20 words each) using this term naturally.\nFormat: ["sentence one.","sentence two."]` }],
        }),
      })
        .then(r => r.json())
        .then(d => {
          const text = (d.content?.[0]?.text || "[]").replace(/```json|```/g, "").trim();
          const lines = JSON.parse(text);
          if (Array.isArray(lines) && lines.length > 0) {
            setSmartLines(lines);
            onTermUpdate?.(item.term, { smartLines: lines });
            fetch("/api/terms", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ term: item.term, smartLines: lines }) }).catch(() => {});
          }
        })
        .catch(() => {})
        .finally(() => setGeneratingSmartLines(false));
    }

    // Lazy-generate 3 deep dives for DB terms that only have 1 (old format) — always English
    if (deepDives.length < 3 && !generatingDeepDives) {
      setGeneratingDeepDives(true);
      fetch("/api/claude", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-haiku-4-5-20251001", max_tokens: 400,
          system: `You generate deep-dive questions for a tech glossary aimed at people new to AI. Respond ONLY with a raw JSON array of 3 strings — no markdown, no backticks.`,
          messages: [{ role: "user", content: `Term: "${item.term}"\nDefinition: "${item.definition}"\n\nGenerate exactly 3 questions that someone new to AI would genuinely want answered — not expert-level, but the kind that build real understanding. Cover: (1) what it actually means in plain terms, (2) when or why someone would realistically encounter it, (3) a common misconception or surprising fact about it.\nFormat: ["question 1?","question 2?","question 3?"]` }],
        }),
      })
        .then(r => r.json())
        .then(d => {
          const text = (d.content?.[0]?.text || "[]").replace(/```json|```/g, "").trim();
          const dives = JSON.parse(text);
          if (Array.isArray(dives) && dives.length === 3) {
            setDeepDives(dives);
            onTermUpdate?.(item.term, { deepDive: dives });
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

  const canHover = typeof window !== 'undefined' && window.matchMedia?.('(hover: hover)').matches;
  const [hovered, setHovered] = useState(false);
  const [loadingIdx, setLoadingIdx] = useState(null);
  const [responses, setResponses] = useState(Array(3).fill(null));
  const [customQuestion, setCustomQuestion] = useState("");
  const [customResponse, setCustomResponse] = useState(null);
  const [loadingCustom, setLoadingCustom] = useState(false);

  const runCustomDeepDive = async () => {
    const q = customQuestion.trim();
    if (!q) return;
    setLoadingCustom(true);
    setCustomResponse(null);
    try {
      const res = await fetch("/api/claude", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514", max_tokens: 1000,
          system: `You are a sharp, practical AI tutor. Answer concisely — max 200 words. Plain language. No bullet spam. Brief paragraphs.${lang !== 'en' ? ` Respond in ${LANG_NAMES[lang]}.` : ''}`,
          messages: [{ role: "user", content: q }],
        }),
      });
      const d = await res.json();
      setCustomResponse(d.content?.[0]?.text || "No response.");
    } catch {
      setCustomResponse("Error — try again.");
    }
    setLoadingCustom(false);
  };
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
          system: `You are a sharp, practical AI tutor. Answer concisely — max 200 words. Plain language. No bullet spam. Brief paragraphs.${lang !== 'en' ? ` Respond in ${LANG_NAMES[lang]}.` : ''}`,
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

  const displayDef = (lang !== 'en' && preTranslatedDef) ? preTranslatedDef : item.definition;
  const displaySmartLines = (lang !== 'en' && preTranslatedSmartLines?.length) ? preTranslatedSmartLines : smartLines;
  const displayDeepDives = (lang !== 'en' && preTranslatedDeepDive?.length) ? preTranslatedDeepDive : deepDives;

  return (
    <div ref={ref} data-kairo-term={item.term} className="rounded-xl overflow-hidden transition-all duration-300"
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{
        background: isNew ? "var(--new-card-bg)" : "var(--card-bg)",
        border: isNew ? "1px solid rgba(20,184,166,0.3)" : "1px solid var(--card-border)",
        boxShadow: isNew ? "0 0 24px rgba(20,184,166,0.08)" : "none",
      }}>
      <button onClick={onToggle} className="w-full text-left px-5 py-4 flex items-center justify-between gap-3 hover:bg-white/5 transition-colors">
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-2xl flex-shrink-0">{item.emoji}</span>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-white text-lg tracking-tight">{item.term}</span>
              <TagBadge tag={item.tag} label={tagLabel} isNew={isNew} />
            </div>
            <p className="text-sm mt-0.5 line-clamp-1" style={{ color: "rgba(var(--rgb),0.45)" }}>{preTranslatedDef || item.definition}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {onDelete && hovered && canHover && (
            <button onClick={e => { e.stopPropagation(); if (confirm(`Delete "${item.term}"?`)) onDelete(item.term); }}
              style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(var(--rgb),0.18)", fontSize: "0.85rem", padding: "2px 4px", lineHeight: 1 }}
              title="Delete term">✕</button>
          )}
          <span className="transition-transform duration-200" style={{ color: "rgba(var(--rgb),0.25)", transform: isOpen ? "rotate(180deg)" : "none" }}>▾</span>
        </div>
      </button>

      {isOpen && (
        <div className="px-5 pb-5 pt-4 space-y-4" style={{ borderTop: "1px solid rgba(var(--rgb),0.07)" }}>
          <div className="flex items-start gap-1.5">
            <p className="flex-1 text-sm leading-relaxed" style={{ color: "rgba(var(--rgb),0.78)" }}>
              {isTyping && !typingDone
                ? <>{displayedDef}<span style={{ display: "inline-block", width: "2px", height: "1em", background: "rgba(var(--rgb),0.5)", marginLeft: "1px", verticalAlign: "text-bottom", animation: "cursor-blink 0.7s step-end infinite" }} /></>
                : <LinkedDefinition text={displayDef} terms={allTerms} currentTerm={item.term} onTermClick={onTermClick} onAddTerm={onAddTerm} />
              }
            </p>
            {(!isTyping || typingDone) && <CopyButton text={`${item.term.toUpperCase()}\n\n${displayDef}`} />}
          </div>

          {(isTyping ? smartLines.length > 0 : (typingDone && (smartLines.length > 0 || generatingSmartLines))) && (
            <div>
              <p className="text-xs uppercase tracking-widest mb-2 flex items-center gap-2" style={{ color: "rgba(var(--rgb),0.3)" }}>
                {(UI_STRINGS[lang] || UI_STRINGS.en).makeSmartLabel}
                {generatingSmartLines && <PulsingDots />}
              </p>
              {displaySmartLines.length > 0 && (
                <div className="space-y-2">
                  {displaySmartLines.map((line, i) => (
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

          {item.examples?.length > 0 && (
            <div>
              <p className="text-xs uppercase tracking-widest mb-2" style={{ color: "rgba(var(--rgb),0.3)" }}>{(UI_STRINGS[lang] || UI_STRINGS.en).examplesLabel}</p>
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
            <p className="text-xs uppercase tracking-widest" style={{ color: "rgba(var(--rgb),0.3)" }}>{(UI_STRINGS[lang] || UI_STRINGS.en).deepDiveLabel}</p>
            {displayDeepDives.map((prompt, idx) => {
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
                    {isLoading ? (UI_STRINGS[lang] || UI_STRINGS.en).askingClaude : (!isOnline) ? (UI_STRINGS[lang] || UI_STRINGS.en).offline : (UI_STRINGS[lang] || UI_STRINGS.en).runPrompt}
                  </button>
                  {response && (
                    <div className="mt-2 pt-2" style={{ borderTop: "1px solid rgba(var(--rgb),0.07)" }}>
                      <div className="flex items-start gap-1.5">
                        <p className="flex-1 text-sm leading-relaxed whitespace-pre-wrap" style={{ color: "rgba(var(--rgb),0.68)" }}>{response}</p>
                        <CopyButton text={`Q: ${displayDeepDives[idx]}\n\nA: ${response}`} />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            <div className="pt-3" style={{ borderTop: "1px solid rgba(var(--rgb),0.06)" }}>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customQuestion}
                  onChange={e => setCustomQuestion(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && !loadingCustom && isOnline && runCustomDeepDive()}
                  placeholder={(UI_STRINGS[lang] || UI_STRINGS.en).customPlaceholder}
                  disabled={!isOnline || loadingCustom || (isTyping && !typingDone)}
                  className="flex-1 min-w-0 rounded-lg px-3 py-2 outline-none"
                  style={{
                    background: "rgba(var(--rgb),0.04)", border: "1px solid rgba(var(--rgb),0.1)",
                    color: "rgba(var(--rgb),0.8)", caretColor: "rgba(99,102,241,0.8)",
                    fontSize: "16px",
                  }}
                />
                <button
                  onClick={runCustomDeepDive}
                  disabled={!isOnline || loadingCustom || !customQuestion.trim() || (isTyping && !typingDone)}
                  className="text-xs px-4 py-2 rounded-lg font-medium transition-all flex-shrink-0 whitespace-nowrap"
                  style={{
                    background: (!isOnline || !customQuestion.trim() || loadingCustom) ? "rgba(var(--rgb),0.04)" : "rgba(99,102,241,0.22)",
                    color: (!isOnline || !customQuestion.trim() || loadingCustom) ? "rgba(var(--rgb),0.2)" : "rgba(199,210,254,1)",
                    border: "1px solid rgba(99,102,241,0.28)",
                    cursor: (!isOnline || !customQuestion.trim() || loadingCustom) ? "not-allowed" : "pointer",
                  }}>
                  {loadingCustom ? (UI_STRINGS[lang] || UI_STRINGS.en).askingClaude : (UI_STRINGS[lang] || UI_STRINGS.en).askCustom}
                </button>
              </div>
              {customResponse && (
                <div className="mt-2 pt-2" style={{ borderTop: "1px solid rgba(var(--rgb),0.07)" }}>
                  <div className="flex items-start gap-1.5">
                    <p className="flex-1 text-sm leading-relaxed whitespace-pre-wrap" style={{ color: "rgba(var(--rgb),0.68)" }}>{customResponse}</p>
                    <CopyButton text={`Q: ${customQuestion}\n\nA: ${customResponse}`} />
                  </div>
                </div>
              )}
            </div>
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
  const [themeMode, setThemeMode] = useState("dark"); // "dark" | "light" | "spaghetti"
  const isDark = themeMode === "dark" || themeMode === "spaghetti";
  const isSpaghetti = themeMode === "spaghetti";
  const [isOnline, setIsOnline] = useState(true);
  const [feedback, setFeedback] = useState(null); // { type: "notRelevant"|"error", term }
  const [scrollToTerm, setScrollToTerm] = useState(null);
  const [typingTerm, setTypingTerm] = useState(null);
  const [lang, setLang] = useState(() => {
    if (typeof window !== 'undefined') return localStorage.getItem('kairo-lang') || 'en';
    return 'en';
  });
  useEffect(() => { localStorage.setItem('kairo-lang', lang); }, [lang]);
  const [batchTranslations, setBatchTranslations] = useState({}); // Supabase is source of truth — no localStorage
  const [batchTranslating, setBatchTranslating] = useState(false);
  const [showLangPicker, setShowLangPicker] = useState(false);
  const langPickerRef = useRef(null);

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
          deepDive: (() => { if (Array.isArray(t.deep_dive)) return t.deep_dive; if (typeof t.deep_dive === 'string') { try { const p = JSON.parse(t.deep_dive); if (Array.isArray(p)) return p; } catch {} } return []; })(),
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

  // Batch-translate all definitions + smartLines when language changes.
  // Strategy: Supabase first (instant shared cache), then Claude only for missing terms,
  // chunked into groups of 12 to avoid timeouts on large glossaries.
  useEffect(() => {
    if (lang === 'en' || batchTranslating || !termsLoaded) return;
    const targetLang = lang;
    const cached = batchTranslations[targetLang] || {};

    setBatchTranslating(true);

    const run = async () => {
      let merged = { ...cached };
      try {
        const serverCache = await fetch(`/api/translations?lang=${targetLang}`).then(r => r.json());
        if (targetLang !== lang) return;
        if (Object.keys(serverCache).length > 0) {
          // Supabase is source of truth — don't let stale localStorage override deletions
          merged = { ...serverCache };
          setBatchTranslations(prev => ({ ...prev, [targetLang]: merged }));
        }
      } catch {}

      // Re-translate if any field is missing OR if definition/deepDive[0] still matches
      // the English source (i.e. was saved untranslated by a previous buggy run).
      const missing = terms.filter(t => {
        const cached = merged[t.term];
        if (!cached?.definition) return true;
        if (!cached?.deepDive?.length) return true;
        if (cached.definition === t.definition) return true;
        const srcDive = Array.isArray(t.deepDive) ? t.deepDive : [];
        if (srcDive.length > 0 && cached.deepDive[0] === srcDive[0]) return true;
        return false;
      });
      if (missing.length === 0 || targetLang !== lang) return;

      // CJK and Indic scripts use 1.5–3× more tokens per character than Latin.
      // 4 terms × ~900 tokens/term = ~3600 tokens — fits safely in 4000 for all scripts.
      const CHUNK = 4;
      const MAX_TOKENS = 4000;
      const allNew = {};
      for (let i = 0; i < missing.length; i += CHUNK) {
        if (targetLang !== lang) break;
        const chunk = missing.slice(i, i + CHUNK);
        const payload = {};
        chunk.forEach(t => {
          payload[t.term] = {
            definition: t.definition,
            smartLines: t.smartLines || [],
            deepDive: Array.isArray(t.deepDive) ? t.deepDive : [t.deepDive].filter(Boolean),
          };
        });
        try {
          const d = await fetch("/api/claude", {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              model: "claude-haiku-4-5-20251001", max_tokens: MAX_TOKENS,
              system: "You translate tech glossary content. Respond ONLY with a raw JSON object — no markdown, no backticks. JSON keys must stay in English. Translate ALL text values (definitions, smart lines, questions) fully into the target language — even when the entry is about a product or acronym. Only the proper name itself (e.g. Claude, ChatGPT, MCP, CI/CD) should remain in English when it appears within the translated text.",
              messages: [{ role: "user", content: `Translate all definition, smartLines, and deepDive values to ${LANG_NAMES[targetLang]}. Return exact same JSON structure:\n${JSON.stringify(payload)}` }],
            }),
          }).then(r => r.json());
          const text = (d.content?.[0]?.text || "{}").replace(/```json|```/g, "").trim();
          Object.assign(allNew, JSON.parse(text));
        } catch {}
        // Apply each chunk immediately so cards update progressively
        if (Object.keys(allNew).length > 0)
          setBatchTranslations(prev => ({ ...prev, [targetLang]: { ...merged, ...allNew } }));
      }

      // Save all new translations to Supabase once — future users get instant results
      if (Object.keys(allNew).length > 0) {
        fetch('/api/translations', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ lang: targetLang, translations: allNew }),
        }).catch(() => {});
      }
    };

    run().catch(() => {}).finally(() => setBatchTranslating(false));
  }, [lang, termsLoaded, terms.length]);

  // Close language picker on outside click
  useEffect(() => {
    if (!showLangPicker) return;
    const handler = (e) => { if (langPickerRef.current && !langPickerRef.current.contains(e.target)) setShowLangPicker(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showLangPicker]);

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

  const handleTermUpdate = (termName, updates) => {
    setTerms(prev => prev.map(t => t.term === termName ? { ...t, ...updates } : t));
  };

  const handleDelete = async (termName) => {
    try {
      await fetch("/api/terms", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ term: termName }) });
    } catch {}
    setTerms(prev => prev.filter(t => t.term !== termName));
    if (openTerm === termName) setOpenTerm(null);
  };

  const handleToggle = (termName) => {
    const isOpening = openTerm !== termName;

    if (!isOpening) {
      setOpenTerm(null);
      return;
    }

    // Anchor the viewport to the card being opened: capture its screen-space
    // top before React re-renders, then scroll by the delta afterwards so it
    // stays exactly where the user tapped.
    const el = document.querySelector(`[data-kairo-term="${CSS.escape(termName)}"]`);
    const beforeTop = el ? el.getBoundingClientRect().top : null;

    setOpenTerm(termName);

    if (beforeTop === null) return;

    // Suppress the scroll event during our programmatic scrollBy so it doesn't
    // trigger filter show/hide (which would shift headerHeight and re-offset the card)
    ignoreScrollUntil.current = Date.now() + 300;

    requestAnimationFrame(() => {
      const afterTop = el.getBoundingClientRect().top;
      const delta = afterTop - beforeTop;
      if (Math.abs(delta) > 1) {
        window.scrollBy({ top: delta, behavior: 'instant' });
      }
      // Keep lastScrollY in sync so the next user scroll is measured correctly
      lastScrollY.current = window.scrollY;
    });
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
Always write ALL text fields (definition, smartLines, deepDive) in English, regardless of any other context.
If relevant:
{"relevant":true,"term":"Canonical Name","emoji":"single emoji","definition":"One crisp sentence.","examples":[{"label":"short label","url":"https://real-url.com"}],"deepDive":["A question someone new to AI would ask to understand what this actually means in plain terms.","A question about when or why someone would realistically encounter or use this.","A question that tackles a common misconception or surprising aspect of this term."],"smartLines":["First sentence using the term naturally in a realistic context, with a touch of dry wit.","Second sentence — different angle, equally grounded."],"tag":"Core Concept|Dev Tool|Economics|Architecture|Craft|Risk|or a new precise tag"}

IMPORTANT: AI model names and products (Claude, GPT-4, Gemini, Llama, Mistral, Grok, Copilot, etc.) and developer tools are ALWAYS relevant — do not reject them as "just names".

If not relevant (random word, generic name, off-topic): {"relevant":false}

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

  const strings = UI_STRINGS[lang] || UI_STRINGS.en;

  const surface = isDark ? "#0d0d1c" : "#f5f6ff";
  const fillBg  = surface;

  return (
    <div className={`min-h-screen${!isDark ? " light-text-override" : ""}`} style={{
      background: isSpaghetti ? "transparent" : isDark ? "linear-gradient(135deg,#080810 0%,#0d0d1c 60%,#080812 100%)" : "linear-gradient(135deg,#eef0ff 0%,#f5f6ff 60%,#eef0ff 100%)",
      fontFamily: lang === 'ko' ? "'Noto Sans KR','DM Sans',system-ui,sans-serif" : lang === 'ja' ? "'Noto Sans JP','DM Sans',system-ui,sans-serif" : lang === 'hi' ? "'Noto Sans Devanagari','DM Sans',system-ui,sans-serif" : lang === 'pa' ? "'Noto Sans Gurmukhi','DM Sans',system-ui,sans-serif" : "'DM Sans',system-ui,sans-serif",
      "--rgb": isDark ? "255,255,255" : "15,15,30",
      "--surface": surface,
      "--card-bg": isSpaghetti ? "rgba(12,12,22,0.85)" : "rgba(var(--rgb),0.04)",
      "--card-border": isSpaghetti ? "rgba(255,255,255,0.10)" : "rgba(var(--rgb),0.09)",
      "--new-card-bg": isSpaghetti ? "rgba(5,35,30,0.88)" : "rgba(20,184,166,0.05)",
      position: "relative",
    }}>
      {isSpaghetti && <div className="spaghetti-wallpaper" style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", backgroundImage: "url('/spag.jpg')", backgroundSize: "cover", backgroundPosition: "center" }} />}
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=Jost:ital,wght@1,700;1,800${lang === 'ko' ? '&family=Noto+Sans+KR:wght@400;500;700' : lang === 'ja' ? '&family=Noto+Sans+JP:wght@400;500;700' : lang === 'hi' ? '&family=Noto+Sans+Devanagari:wght@400;500;700' : lang === 'pa' ? '&family=Noto+Sans+Gurmukhi:wght@400;500;700' : ''}&display=swap');*{box-sizing:border-box}::placeholder{animation:ph-shimmer 5s ease-in-out infinite;font-weight:700}input{caret-color:rgba(99,102,241,0.9)}@keyframes ai-border-spin{to{transform:rotate(1turn)}}@keyframes ai-glow-pulse{0%,100%{opacity:0.7}50%{opacity:1}}@keyframes ph-shimmer{0%,100%{color:rgba(147,197,253,0.45)}33%{color:rgba(216,180,254,0.45)}66%{color:rgba(249,168,212,0.45)}}@keyframes cursor-blink{0%,100%{opacity:1}50%{opacity:0}}.light-text-override .text-white{color:rgba(var(--rgb),0.88)!important}.light-text-override .hover\\:bg-white\\/5:hover{background:rgba(var(--rgb),0.05)!important}@media(max-width:768px){.spaghetti-wallpaper{background-size:300%!important;background-position:center 40%!important}}`}</style>

      {/* Fixed header */}
      <div ref={headerRef} className="fixed top-0 left-0 right-0 z-50 px-5" style={{ background: "var(--surface)", borderBottom: "1px solid rgba(var(--rgb),0.07)" }}>
        <div style={{ maxWidth: 680, margin: "0 auto", paddingTop: "1.1rem", paddingBottom: "1rem" }}>

          {/* Logo row */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.45rem", position: "relative" }}>
            <a href="https://meetkairo.ai" style={{ display: "block", lineHeight: 0 }}>
              <img src="/kairo-wordmark-cropped.png" alt="Kairo" style={{ height: "28px", width: "auto", display: "block", transform: "translateY(-1px)" }} />
            </a>
            <span style={{ fontFamily: "'Jost',system-ui,sans-serif", fontWeight: 700, fontStyle: "italic", fontSize: "2.2rem", textTransform: "lowercase", color: "#5b80e8", lineHeight: 1 }}>decode</span>
            <div style={{ marginLeft: "auto", position: "absolute", right: 0, top: "50%", transform: "translateY(-50%)", display: "flex", alignItems: "center", gap: "0.5rem", zIndex: showLangPicker ? 9999 : "auto" }}>
              {/* Language picker */}
              <div ref={langPickerRef} style={{ position: "relative" }}>
                <button onClick={() => setShowLangPicker(v => !v)} title="Change language"
                  style={{ background: "none", border: "1.5px solid rgba(99,102,241,0.35)", borderRadius: "7px", cursor: "pointer", fontSize: "1.05rem", lineHeight: 1, padding: "3px 5px", transition: "border-color 0.15s", opacity: batchTranslating ? 0.5 : 1 }}
                  aria-label="Change language">
                  {(() => { const l = LANGUAGES.find(l => l.code === lang); return l?.flag ?? <span style={{ fontSize: "0.8rem", fontWeight: 700 }}>{l?.label}</span>; })()}
                  {batchTranslating && <span style={{ fontSize: "0.5rem", verticalAlign: "super", marginLeft: "1px", opacity: 0.6 }}>…</span>}
                </button>
                {showLangPicker && (
                  <div style={{
                    position: "absolute", right: 0, top: "calc(100% + 8px)",
                    background: isDark ? "#16162a" : "#fff",
                    border: "1px solid rgba(var(--rgb),0.12)",
                    borderRadius: "12px", padding: "0.35rem",
                    boxShadow: "0 12px 40px rgba(0,0,0,0.35)",
                    zIndex: 200, minWidth: "148px",
                  }}>
                    {LANGUAGES.map(l => (
                      <button key={l.code} onClick={() => { setLang(l.code); setShowLangPicker(false); }}
                        style={{
                          display: "flex", alignItems: "center", gap: "0.55rem",
                          width: "100%", padding: "0.38rem 0.6rem",
                          background: lang === l.code ? "rgba(99,102,241,0.18)" : "none",
                          border: "none", borderRadius: "8px", cursor: "pointer",
                          fontSize: "10pt", fontFamily: "inherit", textAlign: "left",
                          color: lang === l.code ? "rgba(199,210,254,1)" : "rgba(var(--rgb),0.65)",
                        }}>
                        <span style={{ fontSize: l.flag ? "1rem" : "0.8rem", fontWeight: l.flag ? undefined : 700, minWidth: "1.2rem", textAlign: "center" }}>{l.flag ?? l.label}</span>
                        <span>{l.nativeName}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {/* Theme toggle */}
              <button onClick={() => setThemeMode(m => m === "light" ? "dark" : m === "dark" ? "spaghetti" : "light")} title="Cycle theme: light → dark → spaghetti"
                style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.15rem", lineHeight: 1, padding: "4px 2px" }}>
                {themeMode === "dark" ? "🌙" : themeMode === "light" ? "☀️" : "🍝"}
              </button>
            </div>
          </div>
          <p style={{ fontFamily: "'DM Sans',system-ui,sans-serif", fontSize: "1rem", color: "rgba(var(--rgb),0.32)", marginTop: "8px", letterSpacing: 0 }}>
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
            <div style={{ position: "absolute", inset: "1.5px", borderRadius: "11.5px", background: fillBg, zIndex: 1 }} />
            <div style={{ position: "absolute", inset: 0, borderRadius: "13px", boxShadow: "0 0 22px rgba(139,92,246,0.18), 0 0 8px rgba(236,72,153,0.12)", zIndex: 0, pointerEvents: "none" }} />
            <input
              type="text"
              placeholder={strings.placeholder}
              value={search}
              onChange={e => { setSearch(e.target.value); setFeedback(null); }}
              onKeyDown={e => e.key === "Enter" && isOnline && tryAdd(search)}
              className="w-full px-4 rounded-xl text-sm text-white outline-none"
              style={{ position: "relative", zIndex: 2, background: "transparent", border: "none", fontFamily: "inherit", fontSize: "16px", fontWeight: 700, paddingTop: "14px", paddingBottom: "14px" }}
            />
            {searchQ.length > 1 && !generating && (
              <button onClick={() => isOnline && tryAdd(search)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-xs px-3 py-1.5 rounded-lg font-medium"
                style={{ zIndex: 3, background: isOnline ? "rgba(99,102,241,0.22)" : "rgba(var(--rgb),0.06)", color: isOnline ? "rgba(199,210,254,1)" : "rgba(var(--rgb),0.25)", border: "1px solid rgba(99,102,241,0.18)", cursor: isOnline ? "pointer" : "default" }}>
                {isKnown ? strings.open : isOnline ? strings.add : strings.offline}
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
                  {strings.tags?.[tag] || tag}
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>

      <div style={{
        maxWidth: 680, margin: "0 auto",
        paddingLeft: "8px", paddingRight: "8px",
        paddingTop: `${headerHeight + 12}px`,
        paddingBottom: "2rem",
        position: "relative",
        zIndex: 1,
      }}>

        {!termsLoaded && (
          <div className="flex justify-center pt-12">
            <PulsingDots />
          </div>
        )}

        {/* Offline banner */}
        {!isOnline && (
          <div className="mb-4 px-4 py-3 rounded-xl text-sm" style={{ background: "rgba(245,158,11,0.07)", border: "1px solid rgba(245,158,11,0.22)", color: "rgba(252,211,77,0.8)" }}>
            {strings.offlineBanner}
          </div>
        )}

        {/* Feedback */}
        {feedback?.type === "notRelevant" && (
          <div className="mb-4 px-4 py-3 rounded-xl text-sm" style={{ background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.18)", color: "rgba(252,165,165,0.85)" }}>
            {strings.notRelevant(feedback.term)}
          </div>
        )}
        {feedback?.type === "error" && (
          <div className="mb-4 px-4 py-3 rounded-xl text-sm" style={{ background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.18)", color: "rgba(252,165,165,0.85)" }}>
            {strings.error}
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
                  {strings.generatingEntry} <PulsingDots />
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
              <p className="text-white font-medium">{strings.notInGlossary(searchQ)}</p>
              <p className="text-sm mt-0.5" style={{ color: isOnline ? "rgba(20,184,166,0.65)" : "rgba(245,158,11,0.6)" }}>
                {isOnline ? strings.addPrompt : strings.connectToAdd}
              </p>
            </div>
            {isOnline && (
              <button onClick={() => tryAdd(search)} className="text-xs px-4 py-2 rounded-lg font-medium flex-shrink-0"
                style={{ background: "rgba(20,184,166,0.18)", color: "rgba(94,234,212,1)", border: "1px solid rgba(20,184,166,0.28)" }}>
                {strings.add}
              </button>
            )}
          </div>
        )}

        {generatedCount > 0 && (
          <div className="mb-3">
            <span className="text-xs" style={{ color: "rgba(20,184,166,0.65)" }}>{strings.discovered(generatedCount)}</span>
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
              onTermUpdate={handleTermUpdate}
              isTyping={typingTerm === item.term}
              isOnline={isOnline}
              lang={lang}
              tagLabel={strings.tags?.[item.tag] || item.tag}
              preTranslatedDef={batchTranslations[lang]?.[item.term]?.definition}
              preTranslatedSmartLines={batchTranslations[lang]?.[item.term]?.smartLines}
              preTranslatedDeepDive={batchTranslations[lang]?.[item.term]?.deepDive}
            />
          ))}
        </div>

        <p className="text-center text-xs mt-8" style={{ color: "rgba(var(--rgb),0.13)" }}>
          {strings.footer(terms.length, generatedCount)}
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
