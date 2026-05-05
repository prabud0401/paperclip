---
name: global-prompt-rules
description: >
  Reusable prompts and workflows — clarify-first rewrite, project interview to 95%
  confidence, Prompt Station multi-angle analysis, constructive critic (The Prompt
  That Works), grill-me stress-test, and claims/confidence audit. Use when the user
  wants clarity, critique, structured framing, or explicit handling of uncertain facts.
---

# Global prompt rules

Use these **when relevant** to the user’s ask. Prefer the smallest subsection that fits; combine only when useful.

---

## Clarify-first rewrite

**When:** Dense or ambiguous text must become understandable with **no prior context**.

**Prompt:**

Rewrite the following text so it’s extremely clear, simple, and easy to understand for someone with no prior context. Remove any ambiguity, break down complex sentences, and make the flow logical from one idea to the next. Keep the original meaning, intent, and key points exactly the same, but improve readability, structure, and coherence so the message feels effortless to follow.

**Text to rewrite:** `[paste text]`

---

## Interview until 95% confidence

**When:** Starting a project and requirements are still fuzzy.

**Prompt (adapt wording to the conversation):**

"I’m about to start this project. Interview me until you have 95% confidence about what I actually want, not what I think I should want."

---

## PROMPT STATION — Multi-angle problem solver

**When:** A decision, tradeoff, or messy situation needs structured analysis.

**Prompt:**

Analyze the following problem from multiple high-leverage perspectives: `[describe problem]`. Start with a strategic lens (big picture goals and positioning), then evaluate it operationally (execution and processes), financially (costs, ROI, trade-offs), behaviorally (human factors, incentives, resistance), and systemically (interdependencies and long-term effects). For each perspective, clearly identify constraints, opportunities, and key friction points. Then synthesize these insights into a single, cohesive solution that is optimized across all dimensions, and present it in a clear, action-oriented format with a strong justification for why it works.

---

## The Prompt That Works (constructive critic)

**When:** Honest pushback on an idea, plan, piece of content, or decision.

Act as a sharp, experienced critic who genuinely wants this to succeed — which is exactly why you’re going to be honest about what’s wrong with it.

**Here is `[my idea / plan / piece of content / decision]`:**

`[PASTE YOUR THING HERE]`

**Do this in order:**

**Step 1 — Steel man it**  
In 2–3 sentences, articulate the strongest possible version of this. What’s the best case scenario if this works exactly as intended?

**Step 2 — Find the real problems**  
What’s actually wrong with it. Not small edits. Real problems. The assumption that doesn’t hold. The audience that isn’t clear. The thing I haven’t thought about that could make this fail. Be specific. Don’t soften it.

**Step 3 — The hardest question**  
Ask me the single question I most need to answer before moving forward with this. The one I’m probably avoiding.

**Step 4 — What I’d change**  
If you were building this instead of me, what would you do differently? One concrete suggestion.

**Rules:** Don’t tell me it’s good unless you mean it. Don’t list problems that are easy to fix as a way to avoid the hard ones. I’d rather know now than later.

### How to use this prompt

1. Copy the prompt exactly as written above.  
2. Replace `[my idea / plan / piece of content / decision]` with whatever you’re working on. Be specific about what it is — “a newsletter series about AI for non-technical professionals” beats “a content idea.”  
3. Paste the actual thing in the `[PASTE YOUR THING HERE]` section. Could be a paragraph. Could be a full document. The more real context you give it the more useful the pushback.  
4. Run it in Claude, ChatGPT, or whichever tool you use.  
5. Pay most attention to Step 3 — the hardest question. That’s usually the one you already knew you were avoiding.

---

## grill-me (pinned metadata)

Use this block for skill discovery tools that expect a small name/description pair:

```yaml
name: grill-me
description: Interview the user relentlessly about a plan or design until reaching shared understanding, resolving each branch of the decision tree. Use when the user wants to stress-test a plan, get grilled on their design, or mentions "grill me".
```

**When:** Stress-testing a plan or design; user says “grill me” or wants every branch of a decision tree explored.

**Behavior:** Interview relentlessly until there is **shared understanding**. Resolve each branch of the decision tree; do not accept hand-wavy agreement.

---

## Claims and confidence audit

**When:** You (or the model) just produced an answer that may include factual claims.

Review everything you just produced and do the following:

1. Flag every **specific claim** — any statistic, date, name, study, or source reference — that you included in this response.  
2. For each one, rate your confidence: **High**, **Medium**, or **Low**. High means you are certain this is accurate. Medium means you believe it is correct but cannot fully verify. Low means you are uncertain or this may be approximate.  
3. For anything rated Medium or Low, tell me exactly what I should verify before using this.  
4. If any sources or studies you referenced do not exist or you cannot confirm they are real, say so directly.

Do not soften this. I would rather know something is uncertain now than find out it is wrong later.
