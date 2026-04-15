const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AI Workshop — Session 2</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      background: linear-gradient(180deg, #0a0a0f 0%, #111118 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
    }

    .container {
      max-width: 480px;
      width: 100%;
      text-align: center;
    }

    .badge {
      display: inline-block;
      background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
      color: white;
      font-size: 10pt;
      font-weight: 600;
      padding: 0.4rem 1rem;
      border-radius: 20px;
      margin-bottom: 1.5rem;
      letter-spacing: 0.02em;
    }

    h1 {
      font-size: 28pt;
      font-weight: 700;
      color: #ffffff;
      margin-bottom: 0.75rem;
      letter-spacing: -0.03em;
    }

    .coming-soon {
      font-size: 13pt;
      color: #52525b;
      margin-top: 1rem;
      letter-spacing: 0.04em;
    }

    footer {
      margin-top: 3rem;
      font-size: 10pt;
      color: #3f3f46;
    }
  </style>
</head>
<body>
<div class="container">
  <div class="badge">ASO Ops | AI Workshop</div>
  <h1>Session 2</h1>
  <p class="coming-soon">Coming soon...</p>
  <footer>Built for Steve T's AI Workshop — Apple 2026</footer>
</div>
</body>
</html>`

export async function GET() {
  return new Response(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  })
}
