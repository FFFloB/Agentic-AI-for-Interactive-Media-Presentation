# Content plan — Design mode

Every entry below is one segment. **The order is the numbering** — rearrange by moving blocks, no numeric labels to maintain. Delete, merge, reorder, or edit in place. Nothing here is load-bearing on code until the user re-wires it.

Tags:
- `[built]` — shipped, visible in the running deck today.
- `[proposed]` — not built yet; a sketch for discussion.

Only headlines, subheads, callout/card labels, takeaways and beat summaries are listed here — the *common denominator* copy, hand-authored. Mode-templated exemplars (the "Plate" thread, the memory-file contents, the tier example asks, etc.) live next to the code and are noted per segment but not transcribed in full.

---

## [built] Agentic AI for Interactive Media Creation
_Opening title slide._

Eyebrow: `Session 6`
Headline: `Agentic AI` / `for Interactive Media Creation` (two-line split)
Tagline: `Bring your scepticism and your curiosity.`

Beats: none — three lines stagger-fade in on entry, no internal progression.

---

## [built] A broad skills landscape
_Sets the stage: IM blends many crafts, nobody is strong across all of them._

Eyebrow: `Interactive media`
Headline: `A broad skills landscape`
Subhead: `Making interactive media blends many crafts — from the technical to the narrative.`

Beats (one reveal per bullet):
- Programming — Game and app logic, systems, back-end services.
- UI & frontend — Screens, components, interaction flows.
- Visual design — Art direction, 2D and 3D, motion graphics.
- Interaction design — Affordances, feedback, ergonomics.
- Writing & narrative — Copy, content, documentation, story.
- Audio & music — Sound design, score, voice.
- Animation & motion — Character, environment, UI motion.
- Prototyping & QA — Rapid iteration, testing, polish.

Takeaways: none — the list itself is the takeaway.

---

## [built] What is an LLM?
_Opens the machine up. Core mechanism: predict the next word, see everything so far — including its own replies._

Eyebrow: `Under the hood`
Headline: `What is an LLM?`
Subhead: `At their core, language models predict the next word. Everything else — the reasoning, the tool use, the long conversations — rides on top of that one mechanism.`

Beats:
- User asks the model to finish "The cat sat on the…"
- Prediction card shows top-5 candidates with probability bars
- The top candidate is chosen, sentence completes
- "What actually happened" trace: every word was a fresh prediction over the growing prefix
- Transition: same thing, in a conversation
- Three-turn dialog about colours for warning signs
- Context-view card: what the model reads to predict its next reply — with the AI's own prior reply flagged *its own words*
- AI's next reply

Takeaways:
- LLMs generate text one word at a time. Each word is picked from a ranked distribution over the whole vocabulary.
- Every next word is a fresh prediction. The input is everything written so far.
- In a dialog the AI also reads its own prior replies — they are part of the context for the next prediction.

Templated exemplars: none (generic examples work for both audiences).

---

## [built] From chatbot to agent
_The shift. Thinking + tools + files turn a language model into something that does work._

Eyebrow: `The shift`
Headline: `From chatbot to agent`
Subhead: `What changes when a language model can think, write and run code, and reach for tools on its own.`

Beats:
- **Part 1 — chatbot baseline:** simple exchange, the model intuits and gets a letter-count wrong.
- **Part 2 — agentic mode:** thinking opens, Python tool attempt, `NameError`, fixed code, validation asserts, corrected answer.
- **Part 3 — spotlights:** camera zoom highlights on the tool-call cards.
- **Part 4 — live data:** follow-up question about 2026 numbers, thinking about web access, web-search tool, source excerpt, cited answer.
- **Part 5 — local files:** user asks to edit a draft, read_file + edit_file tool calls, confirmed edit.

Takeaways:
- LLMs have embedded knowledge and intuition that can fail even on simple tasks.
- Thinking enables LLMs to reason with itself to reach more robust results.
- Tools are functions that LLMs can 'call' to execute actions on demand, including writing of code.
- Tools can greatly improve LLMs abilities and access to up-to-date online information.
- Web tools keep track of the used external sources.

Templated exemplars: none (the banana thread is generic; Python demo reads for both audiences).

---

## [built] From prompt to context
_Context is a structured working memory with six partitions. It fills, compresses, resets._

Eyebrow: `Under the hood`
Headline: `From prompt to context`
Subhead: `How the model's working memory is assembled, filled, and cleared.`

Beats (in the scrolling left column; the chart is pinned on the right):
- Six dialog bubbles build up — a conversation forming.
- Morph callout: those bubbles are packaged as the **Dialog** block.
- "The full picture" callout: the other blocks are always there, framing every reply.
- Six walk-through sample cards — one per partition: System prompt, Tools, Memory file, Dialog, Summarisation buffer, Free space.
- "It fills up" callout as the chart visibly fills.
- "Compression" callout as the older turns are summarised into the reserved buffer.
- "Fresh session" callout: the summary becomes the top of the dialog, buffer is reserved again.
- "Session reset" callout: dialog wipes, system / tools / memory stay.
- "Takeaways" heading, then four numbered rows revealing one per stage.

Takeaways:
- Context is assembled from six parts: system prompt, tools, memory, dialog, free space, and a summarisation buffer.
- Dialog grows with every turn. Once it nears the limit it has to be compressed to make room.
- Starting a new session wipes the dialog. Only the summary carries over, not the exact words.
- System prompt, tools and memory persist across sessions. Memory is what lets the agent stay oriented.

Templated exemplars:
- The six opening bubbles (design thread: *Plate*, a recipe + meal-planning app — "Design the main recipe browse screen" → empty state → `recipe-browse.fig`).
- The six partition sample cards' bodies (system prompt, tool list, memory, dialog all reflect the design voice and the *Plate* thread; summbuf and free stay generic).

---

## [built] From prompt engineering to context engineering
_The craft shift. The single prompt is out; curating everything the agent reads is in. Memory file + linked docs + shared truth._

Eyebrow: `The craft is shifting`
Headline: `From prompt engineering to context engineering`
Subhead: `The real lever is not the single prompt. It is everything the agent reads before it answers — and whether you and it are reading the same thing.`

Beats:
- User frames the question: "people keep saying prompt engineering is dead…"
- **Old craft** card — "Prompt engineering": one message, write it carefully, hope the model follows. Shows an over-engineered example prompt.
- **New craft** card — "Context engineering": hundreds of turns, dozens of files; curate what the agent sees. Three pillars: Memory file · Linked docs · Working files.
- `memory.md` file card — auto-loaded every session; shows content with outbound links.
- Callout: highlighted tokens are paths to other files; the agent follows on demand.
- Three linked-doc cards appear (roadmap / design-system or architecture / style-guide).
- One file loaded on demand as a focused card.
- **Shared truth** diagram: human ↔ shared files ↔ agent.
- **Closer**: Transparency + Traceability pills, one line each.

Takeaways:
- The craft is no longer writing one perfect prompt. It is curating everything the agent reads across a session.
- The memory file is the entry point. From there it links out to the docs, roadmaps and guides the agent actually needs.
- Human and agent work from the same files. That is what makes AI co-creation transparent and traceable.

Templated exemplars:
- The over-engineered "old craft" prompt example text.
- `memory.md` body contents (four outbound links; design variant lists `design-system.md` instead of `architecture.md` and a "Design system" section instead of "Git").
- Three linked-doc names + short descriptions.
- The focused file card's body (design variant is `design-system.md` showing tokens, type scale, components).
- Shared-truth diagram's four filenames.

---

## [built] Tokens, and how much fits
_Scale. What a token is, and how much modern models hold._

Eyebrow: `Scale`
Headline: `Tokens, and how much fits`
Subhead: `You keep hearing the word "token". Here is what one actually is, and how many modern models can hold at once.`

Beats:
- User asks: "what's a token and why does count matter?"
- Explainer card — "The unit": roughly ¾ of a word. Three rules: `≈¾`, `×1.3`, `~500 tokens per page`.
- Tokenizer card — three examples split into coloured token pills (`"Hello, world!"`, `programming is fun`, `antidisestablishmentarianism`).
- Transition callout: "So how much can a model hold?"
- Chart card appears with five proportional bars revealed one by one: `4K` → `32K` → `128K` → `200K` → `1M+` (frontier, gradient fill + glow).
- Closer — "What this changes": the craft flips from cutting-to-fit to choosing-what-to-bring-in.

Takeaways:
- A token is the unit the model reads and writes. Roughly three-quarters of a word.
- Context windows used to hold a chapter. Now they hold entire books, or full codebases.
- At this scale, running out of room is rare. What matters is what you put there.

Templated exemplars:
- Tier 5 comparison phrase only ("or a complete design system and brand kit" in design mode, "or a full mid-size codebase" in technical).

---

## [built] A spectrum, not a switch
_Granularity. Delegation scales from seconds to hours. You pick the mix._

Eyebrow: `Granularity`
Headline: `A spectrum, not a switch`
Subhead: `Agentic AI shows up at every time scale — from seconds of help to hours of handed-off work. The size of the ask is a dial, and you are the one turning it.`

Beats:
- User framing: "is it all-or-nothing?"
- Accent callout: "Not all-or-nothing." Seconds / minutes / hours.
- **Micro** tier card (seconds): tiny specific asks — a second opinion, a sanity check.
- **Medium** tier card (minutes): one screen, one flow, one component.
- **Macro** tier card (hours): whole project, agent plans and grinds while you check in.
- **You control the mix** card: three chips (µ micro / m medium / H macro) showing a realistic day's mix.
- Closer: "The interesting question is no longer 'can the agent do this?' It is 'how big a bite do I want to hand over today?'"

Takeaways:
- Delegation scales from seconds to hours. Micro, medium and macro tasks all coexist in a single day.
- The ceiling keeps moving. Work that felt ambitious last year is routine now.
- You pick the mix. A micro-fix here, a macro-delegation there. Nothing forces the choice.

Templated exemplars:
- The three example asks per tier (design mode leans on visual critique, *Plate* iterations, and a full product redesign).
- The three mix-chip examples (design: palette tweak / new settings screen / overnight redesign).

---

## [built] If you design
_Use cases for designers. Prototypes → interactive Figma → UX QA → ship apps._

Eyebrow: `Use cases · Design`
Headline: `If you design`
Subhead: `Good places to put agentic AI to work if your craft is design, from quick prototypes all the way to shipping what you drew.`

Beats:
- User framing: "my craft is design, not code — where does AI earn its keep?"
- **Stand up a full prototype** — describe a screen, get back a working prototype.
- **Turn a Figma draft into a testable product** — wire up state, navigation, data.
- **UX QA that actually happens** — agent walks flows and reports friction.
- **Ship the whole thing** _(dare card, gradient title + glow)_ — design all the way to a real app in a real store.
- Closer — "What this changes": the boundary between design and implementation is now a slider.
- Warn callout — "A gentle warning": being able to ship does not mean you should; know when to stop.

Takeaways:
- A sketch can become an interactive prototype in minutes, not days.
- Static mockups become testable products. You can validate UX without an engineer in the loop.
- The gap between "I designed this" and "this is shipped" has collapsed — if you are willing to cross it.

Templated exemplars: none — this segment is shown to both audiences unchanged.

---

## [built] If you build
_Use cases for developers. UX, review, docs, modules, CI/CD, backend, security._

Eyebrow: `Use cases · Engineering`
Headline: `If you build`
Subhead: `Good places to put agentic AI to work if code is your craft — from the parts you used to skip to the parts you used to dread.`

Beats:
- User framing: "I can code — where does agentic AI earn its keep?"
- **Do the UX work you used to wait for** — finally ship a usable interface without waiting on design cycles.
- **Review your own code before anyone else has to** — hand the agent the diff.
- **Documentation that keeps up** — READMEs, API docs, change logs, always current.
- **Delegate whole modules** — define the interface, constraints, acceptance tests; agent implements.
- **Test, build and deploy** — CI pipelines, release scripts.
- **Backend and data layer** — APIs, schemas, queries, migrations.
- **Security and safety audits** _(emphasis card)_ — kick one off when you change something sensitive, not once a year.
- Closer — "What this changes": the interesting parts of the job stay yours; the work around them becomes a background task that actually gets done.
- Warn callout: you are still responsible for what ships under your name. Review like a junior's PR.

Takeaways:
- Review, documentation and tests — the "we should really do this" work — actually gets done.
- Whole modules can be delegated. You define the interface, the constraints, and the tests. The agent does the grind.
- Security and safety audits are no longer specialist-gated. Anyone on the team can kick one off.

Templated exemplars: none — shown to both audiences unchanged.

---

## [proposed] Where care is required
_Overview segment. Frames the next seven beats as one cluster: the things that go wrong, the things that need legal care, and the things that need ethical care. Like the two "Use cases" segments hang together, these beats hang together too - this preview anchors the audience so they see the arc before we dive into each one._

Eyebrow: _TBD, e.g. `The fine print` or `Where care is required`_
Headline: _TBD_
Subhead: _TBD, honest without being dismissive; signal this is a cluster, not a single warning._

Beats (~5):
- User framing: "so what should I watch out for?"
- A three-part preview frame: **legal + ownership** · **ethical practice** · **mechanical limits of the model**.
- A preview grid / ordered list of the seven specific beats that follow, so the audience anchors the structure early.
- Closer: "Each of these gets its own beat. Here they are."

Takeaways: none; this segment primes, the next seven land the points.

Templated exemplars: none; universal.

---

## [proposed] What went in
_Legal + ownership. Training data provenance, vendor indemnities, and what the UK courts have and have not settled. Focus: can you commercially use AI-assisted work?_

_Research complete. Source: [`docs/research/training_data_uk.md`](research/training_data_uk.md)._

Eyebrow: _TBD_
Headline: _TBD, candidates: "What went in", "The training trail"_
Subhead: _TBD_

Beats (~7):
- **User framing**: "where did the model's knowledge come from, and does that matter for what I ship?"
- **Training corpora reality**: most models trained on mixed sources - some licensed, a lot scraped. Consent from original authors was usually not obtained. Concrete illustration: the model that can render "in the style of" a named artist got that style from somewhere.
- **The UK law, plain**: s.29A CDPA is the only Text and Data Mining exception, and it is non-commercial research only. The government consulted on a broader opt-out-style exception in December 2024, received over 11,000 responses, and in its March 2026 *Report on Copyright and Artificial Intelligence* stepped back from legislating one. Status quo holds: commercial training on third-party copyrighted material needs a licence.
- **Getty v Stability AI [2025] EWHC 2863 (Ch)**: November 2025, High Court. Getty lost on secondary copyright (model weights are not themselves an "infringing copy") and got a narrow trademark win over watermark reproduction. Crucially, the Court did **not** rule on whether the act of training itself is lawful in the UK - Getty couldn't establish the acts happened in UK territory. Getty's appeal is live. The big question remains open.
- **Using vs training is a different question**: using ChatGPT, Claude, Gemini, Copilot, Firefly to make your own work is generally fine under UK law. The risk on the *output* side is covered by vendor indemnities, and only on paid business and enterprise tiers.
- **The indemnity table, honestly**: consumer free tiers - none. Consumer paid (Plus, Pro) - none or limited. Team / Business - indemnity with carve-outs. Enterprise / API - broadest, sometimes uncapped (Anthropic) or capped at 12 months of fees (OpenAI). **Adobe Firefly** is the only mainstream product marketed as trained on licensed data by design, and its indemnity only covers the specific Firefly output, not anything you combine it with. Carve-outs are consistent across vendors: don't disable safety features, don't knowingly use infringing output, trademark claims excluded.
- **Closer**: the UK law on training is unresolved, not decided either way. Build habits that are robust to a decision that could go either direction.

Takeaways (draft; hand-author the final wording):
- Commercial training on someone else's copyright still needs a licence in the UK. Section 29A does not cover it.
- Using a paid AI tool is different from training one. The safety net only kicks in on Business and Enterprise tiers, and never covers trademark claims.
- Getty v Stability AI did not settle the question. Treat training-data lawfulness as open, not as decided.

Templated exemplars: one case per mode. Design: a Firefly-vs-Midjourney choice for a commercial image. Technical: licence contamination risk in generated code.

---

## [proposed] Who owns this?
_Legal + ownership. Copyrightability and authorship of AI-assisted output. Do you actually own what you made? Focus on the UK originality test and the direction the law is moving. (Attribution and how to declare use lives in the next segment.)_

_Research complete. Source: [`docs/research/copyrightability_uk.md`](research/copyrightability_uk.md)._

Eyebrow: _TBD_
Headline: _TBD, candidates: "Who owns this?", "What you can keep"_
Subhead: _TBD_

Beats (~6):
- **User framing**: "if I ship this, is it mine?"
- **Three scenarios, one law**:
  1. **AI-assisted** - you made substantive creative choices, the model was a tool. Normal literary or artistic copyright; you are the author; full life-plus-70 term.
  2. **Computer-generated work with no human author** under s.9(3) CDPA - 50-year term, the "author" is deemed to be the person who "made the arrangements necessary". A 1988 oddity written for procedurally generated maps, never tested against a modern prompt-to-image model.
  3. **Purely AI-generated** with no meaningful human input - most commentators, and the March 2026 government report, think this is likely unprotected, or at best protectable only via the shaky s.9(3) route.
- **The test that decides**: the "author's own intellectual creation" standard, imported via *Infopaq* and re-affirmed by Arnold LJ in *THJ v Sheridan* [2023]. It asks for expressive choices reflecting the author's personal touch - not skill, labour, or technical effort. Writing a short prompt and accepting the first output does not clear this bar. Selecting, iterating, editing, composing, integrating a generated asset into something larger does.
- **What is moving**: the government's 18 March 2026 *Report on Copyright and AI* proposes removing s.9(3), retaining normal copyright only for AI-assisted works with genuine human input. No legislation introduced yet. Direction of travel is clear: the pure prompt-and-accept path is being closed off.
- **A decision rubric you can take home**:
  - Did I make expressive choices - concept, composition, selection, editing, integration?
  - Could a stranger with the same tool and a short prompt have made something meaningfully the same?
  - **Yes / no** → AI-assisted, you are the author, claim it confidently.
  - **No / yes** → prompt-only output; your copyright claim is weak; label it as generated, don't claim authorship.
- **Closer**: copyright law rewards human creative thinking. You are the author only if you did the thinking. That principle is stable even if the statutes change around it.

Takeaways (draft; hand-author the final wording):
- Human creative contribution is what earns you copyright. Prompt-writing on its own does not.
- The test is already in UK law and already applied: the "author's own intellectual creation" standard. It asks for your personal touch, not your prompt length.
- The statute is likely to tighten in your favour. Building the habit of substantive input now is robust to whichever way the law moves.

Templated exemplars: two scenarios per mode showing the boundary in practice. Design: the same image as prompt-only vs as the end of a six-step iteration with composition edits. Technical: a function generated from a vague prompt vs one built through a structured review cycle.

---

## [proposed] Name your collaborators
_Ethical practice. Attribution + transparency. Declaring what was made with AI, at the three scales the audience will actually encounter: assessed university work, competition entries, and client work. Includes a live demonstration via this presentation's own session audits._

_Informed by both research docs (York + Russell Group + QAA for students; D&AD 2026 + IPA/ISBA Principle 11 for professional work)._

Eyebrow: _TBD_
Headline: _TBD, candidates: "Name your collaborators", "The audit trail"_
Subhead: _TBD_

Beats (~8):
- **User framing**: "do I have to say I used it?"
- **The short answer**: yes. At University of York the default for any assessed work is to declare AI use unless the module brief says otherwise. The Russell Group, QAA and Jisc all converge on the same position. It is already the expectation, not the exception.
- **What a York declaration actually needs** (in the student's voice): what tool, what you used it for, and how much. "Used Gemini to brainstorm three title concepts, picked one, rewrote in my own words" is a good declaration; "used AI for ideas" is not. Module briefs can tighten or loosen the default - read yours first.
- **What York actively recommends**: Google Gemini via university credentials. York has a data-protection arrangement that keeps inputs out of training and human review. Never put personal, sensitive, or third-party copyrighted material into public tools.
- **For your portfolio and competitions**: D&AD 2026 now requires **structured disclosure at the point of entry, across all categories**, covering both the output and supporting materials. Every entry is accompanied by an Entry Validation Card signed by the human responsible. AI work is eligible - as long as a human is accountable and the declaration is honest. Read this as the current industry benchmark: what D&AD requires is what any serious portfolio or client relationship will expect.
- **Treat the agent as a named collaborator, not a ghost**. List the tools. Say what role they played: ideation, asset generation, copywriting, motion, upscaling. Describe what you did: concept, selection, iteration, composition, final edit. A transparent AI-assisted case study reads more credibly than a polished AI output presented as hand-made.
- **Live demonstration**: the audit logs of this very presentation. Walk through a session entry that maps specific AI contributions to specific segments, shown in-place. Session logs are a lightweight, human-readable pattern worth borrowing: they preserve decisions and rationales as well as edits.
- **Closer**: transparency beats concealment in every scenario. The admission is the easy part; the discovery is what gets you.

Takeaways (draft; hand-author the final wording):
- Declaring AI use is the default now, at York and across UK higher education. Vague declarations read as hiding.
- Name your collaborators, describe their role, and describe what you did. A case study of process is stronger than a glossy output.
- Session logs are a cheap, durable way to keep your practice honest. Start one.

Templated exemplars: universal. The audit-log visualisation is specific to this talk and worth prototyping early - a card that renders a real excerpt from `session_audits/` with AI turns marked and a link back to the segment each contribution shaped.

**Extra note worth surfacing somewhere in this segment**: IPA / ISBA's 12 Principles for Generative AI in Advertising (2023, updated March 2025), Principle 11: neither agency nor advertiser should include AI-generated content in materials handed to the other without the other's agreement. That is already the closest thing UK creative industry has to a disclosure norm, and it applies to students the moment they freelance.

---

## [proposed] What you put in
_Ethical practice. The ethics of context engineering: what you can and can't feed the agent. Includes the subtle trap: "just don't ingest sensitive things" does not work, because the agent has to read something to decide it is sensitive._

Eyebrow: _TBD, e.g. `Ethics of context`_
Headline: _TBD, candidates: "What you put in", "The context rules"_
Subhead: _TBD_

Beats (~8):
- User framing: "what can I safely feed it?"
- **Fair to include**: your own work; public material; content that was authored specifically for AI ingestion.
- **Not fair without consent**: someone else's work; material authored for a non-AI context.
- **Never**: sensitive or confidential data - personal information, other people's private information, employer IP, unreleased data.
- **The subtle trap**: "instruct the agent not to ingest sensitive things" does not work. To decide something is sensitive, the agent has to read it. By the time it has decided, it has seen.
- The practical rule: filter at the source. Never pass through.
- A worked scenario: a student's thesis draft that references recorded interviews. What is and isn't safe to hand to an agent, and at what step?
- Closer: the gatekeeper is you, at the input. There is no "careful" downstream version.

Takeaways (draft):
- You can feed it what you wrote, what is public, and what was made for it. Everything else needs consent.
- "Let the agent decide what's sensitive" does not work. By the time it has decided, it has already read.
- Sensitive data does not enter the pipeline. There is no safe way to carefully pass it through.

Templated exemplars: the worked scenario (design-mode: thesis interviews and participant data; technical-mode: proprietary codebase and client data).

---

## [proposed] Confidently wrong
_Mechanical limit. Even with thinking and with tools, the agent produces things that look right and are not. The subtle failures are the dangerous ones._

Eyebrow: _TBD_
Headline: _TBD, "Confidently wrong" is the strongest candidate_
Subhead: _TBD_

Beats (~6):
- User framing: "surely if it thinks step by step, it gets it right?"
- A plausible-but-wrong example in the audience's domain.
- A subtle failure: something that passes a glance but fails a real check - accessibility ratios that "look fine", numbers that feel right.
- Why this happens even with thinking + tools: the model can be confidently wrong in its own reasoning too.
- Mitigation: verify everything that matters; don't treat fluent confidence as signal.
- Closer: plausible is not correct.

Takeaways (draft):
- Fluency and confidence are not evidence. Verify everything that matters.
- The subtle failures are the dangerous ones. They pass the first glance.
- Thinking and tools reduce errors; they do not remove them.

Templated exemplars: one failure example per mode (a broken-but-pretty layout for design; a subtly-wrong function for technical).

---

## [proposed] The agreement trap
_Mechanical limit. The agent optimises for satisfying the context. Easy to lead it into agreement; the moment you do, you have lost a critical partner. Style prompts can engineer pushback back in._

Eyebrow: _TBD_
Headline: _TBD, candidates: "The agreement trap", "It tries to please"_
Subhead: _TBD_

Beats (~6):
- User framing: "why does it always agree with me?"
- The failure mode illustrated: a leading question, then an obliging answer; later, the premise turns out to have been wrong.
- Why it happens: training optimises for helpful-sounding output, not for disagreement.
- Style prompts that invite pushback - an example system prompt that asks the agent to challenge framing, flag assumptions, disagree when it has evidence.
- A short comparison: the same question answered by a "nice" agent vs a "critical partner" agent.
- Closer: author your context to invite challenge, not just compliance.

Takeaways (draft):
- The agent will usually tell you what you want to hear. That is a failure mode, not a feature.
- Easy agreement is a red flag, not a compliment.
- You can engineer this out. A good system prompt asks for pushback.

Templated exemplars: the "nice vs critical" comparison is easy to render in both modes - a design critique or a code review flavour of the same failure.

---

## [proposed] The visual gap
_Mechanical limit. UI, UX, animation and interactivity are hard for the agent to capture or test. Human stays in the loop at the craft level, sometimes micromanaging. Most relevant beat for this audience._

Eyebrow: _TBD_
Headline: _TBD, candidates: "The visual gap", "What it cannot see"_
Subhead: _TBD_

Beats (~7):
- User framing: "can it really design on its own?"
- Visual and interactive quality is hard to evaluate programmatically. No good automated check for "does this feel right?"
- Hierarchy, affordances, micro-animation, timing, tactility: all sit below the threshold of what the agent can self-assess.
- Interactivity is tested in context, not on the page.
- The micro-management pattern: short loops, human review, visible results, direct intervention.
- Where human craft matters most: motion, feel, polish, voice.
- Closer: the agent makes; you judge. You still do the craft work at the edges.

Takeaways (draft):
- Visual quality is still a human's call. The agent produces, you evaluate.
- Interactivity is tested in context, not on the page.
- The craft parts - feel, polish, timing - stay yours, on purpose.

Templated exemplars: light. The segment is naturally design-leaning; a technical-mode variant can lean on UI-in-a-terminal or developer-tooling UX parallels if we want to show it to both audiences.
