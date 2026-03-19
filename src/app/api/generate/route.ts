export async function POST(request: Request) {
  try {
    const { gitLog, version } = (await request.json()) as {
      gitLog?: string;
      version?: string;
    };

    if (!gitLog || typeof gitLog !== "string" || gitLog.trim().length === 0) {
      return Response.json(
        { error: "gitLog is required and must be a non-empty string" },
        { status: 400 }
      );
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return Response.json(
        { error: "GROQ_API_KEY is not configured" },
        { status: 500 }
      );
    }

    const today = new Date().toISOString().split("T")[0];
    const versionLabel = version || "Unreleased";

    const systemPrompt = `You are a changelog generator. You receive raw git log output and produce a polished changelog following the Keep a Changelog format (https://keepachangelog.com).

Rules:
1. Parse each commit message and categorize it into one of these sections: Added, Fixed, Breaking Changes, Changed, Documentation, Chores
2. Use "### Added" for new features, "### Fixed" for bug fixes, "### Breaking Changes" for breaking changes, "### Changed" for improvements/refactors, "### Documentation" for docs changes, "### Chores" for maintenance/deps/tooling
3. Rewrite commit messages to be clear, user-facing descriptions. Remove commit hashes, prefixes like "feat:", "fix:", etc.
4. Group related changes together
5. Only include sections that have entries
6. Use this exact format for the header: ## [${versionLabel}] - ${today}

Return ONLY valid JSON (no markdown, no code fences) in this exact structure:
{
  "changelog": "the full markdown changelog string starting with ## [version] - date",
  "stats": {
    "features": <number of items in Added>,
    "fixes": <number of items in Fixed>,
    "breaking": <number of items in Breaking Changes>,
    "other": <number of items in all other sections combined>
  }
}`;

    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        temperature: 0.5,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: `Generate a changelog from this git log:\n\n${gitLog.slice(0, 15000)}`,
          },
        ],
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("Groq API error:", res.status, errText);
      return Response.json(
        { error: `AI service error (${res.status})` },
        { status: 502 }
      );
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return Response.json(
        { error: "No response from AI service" },
        { status: 502 }
      );
    }

    const parsed = JSON.parse(content) as {
      changelog: string;
      stats: {
        features: number;
        fixes: number;
        breaking: number;
        other: number;
      };
    };

    return Response.json({
      changelog: parsed.changelog,
      stats: {
        features: parsed.stats?.features ?? 0,
        fixes: parsed.stats?.fixes ?? 0,
        breaking: parsed.stats?.breaking ?? 0,
        other: parsed.stats?.other ?? 0,
      },
    });
  } catch (err) {
    console.error("Generate error:", err);
    return Response.json(
      { error: "Failed to generate changelog" },
      { status: 500 }
    );
  }
}
