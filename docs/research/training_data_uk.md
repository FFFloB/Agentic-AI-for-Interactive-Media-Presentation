# AI Training Data Provenance: UK Legal and Commercial Position

Research compiled for an MA Digital Design talk on responsible AI use.
Access date for all citations: 21 April 2026.

---

## 1. UK Text and Data Mining (TDM) exception status

### Summary

As of April 2026, UK copyright law has not changed. Training AI models on third-party copyrighted works for commercial purposes in the UK remains, on the face of the Copyright, Designs and Patents Act 1988 (CDPA), an act requiring rights-holder permission. The only statutory TDM exception is section 29A CDPA, which permits computational analysis of lawfully accessed works for the sole purpose of non-commercial research, with a sufficient acknowledgement.

The government's December 2024 consultation proposed a broader EU-style TDM exception with a rights-reservation ("opt-out") mechanism. After more than 11,000 responses and significant push-back from creative industries, the government has now stepped back from that proposal. The Report on Copyright and AI published on 18 March 2026 under section 137 of the Data (Use and Access) Act 2025 concluded that it is not the right time to legislate a new TDM exception. Status quo holds. Transparency about training inputs is flagged as the area of broadest agreement but no concrete proposal has been tabled; the government is "working with industry and experts on best practice" instead. The Report also proposes (subject to further evidence) repealing section 9(3) CDPA, which currently confers authorship of computer-generated works with no human author on "the person by whom the arrangements necessary for the creation of the work are undertaken."

### What this means in practice for an individual or student in the UK

- Scraping or bulk-copying third-party copyrighted material (text, images, code, audio) to train or fine-tune a model for any commercial, client, or portfolio purpose is not covered by any UK exception. You need a licence or you need to rely on the work being out of copyright, openly licensed (e.g. CC-BY compatible with your use), or your own.
- Non-commercial academic research fits under s.29A CDPA only if access is lawful (you haven't bypassed a paywall or ToS block) and the copy is used strictly for computational analysis with acknowledgement.
- Using a third-party AI model (ChatGPT, Claude, Midjourney, Firefly, etc.) to generate outputs is a separate question from training. Consuming the output is generally fine from a UK copyright standpoint; whether the output itself infringes is the live question, and is addressed through the providers' indemnities (section 2) and the live case law (section 3).

### In-flux

Everything in this section is in-flux. The government has committed to further economic analysis and may revisit any of the four policy options (do nothing, broad exception with opt-out, broad exception without opt-out, or licensing). Getty's appeal in Getty v Stability AI (see section 3) is also live. Material change before late 2026 is unlikely but possible.

### Citations

- UK IPO / DSIT / DCMS, *Copyright and Artificial Intelligence* consultation, opened 17 Dec 2024, closed 25 Feb 2025: https://www.gov.uk/government/consultations/copyright-and-artificial-intelligence/copyright-and-artificial-intelligence
- GOV.UK, *Report on Copyright and Artificial Intelligence* (18 March 2026): https://www.gov.uk/government/publications/report-and-impact-assessment-on-copyright-and-artificial-intelligence/report-on-copyright-and-artificial-intelligence
- Data (Use and Access) Act 2025, Part 7, s.137 provisions on copyright and AI: https://www.legislation.gov.uk/ukpga/2025/18/part/7
- Herbert Smith Freehills Kramer, "UK Government Report on Copyright and AI concludes more evidence is needed although s9(3) CDPA could go" (March 2026): https://www.hsfkramer.com/notes/ip/2026-03/uk-government-report-on-copyright-and-ai-concludes-more-evidence-is-needed-although-s9-3-cdpa-could-go
- Bristows, "The TDM copyright exception in the UK 'for the sole purpose of research for a non-commercial purpose': what does it cover?": https://www.bristows.com/news/the-text-and-data-mining-copyright-exception-in-the-uk-for-the-sole-purpose-of-research-for-a-non-commercial-purpose-what-does-it-cover/
- Bird & Bird, "Copyright & AI in the UK: The Debate Rolls On" (2026): https://www.twobirds.com/en/insights/2026/uk/copyright-,-a-,-aiin-the-uk-the-debate-rolls-on

---

## 2. Indemnity clauses of major paid AI services

All five vendors now offer some form of copyright indemnity on their paid business tiers. The pattern is consistent: you are protected only if you used the product as intended, did not strip or override safety features, had rights to your own inputs, and did not know (or shouldn't have known) the output was infringing. Consumer free tiers are almost universally excluded. Trademark claims are almost universally excluded.

### OpenAI (ChatGPT Enterprise, Team, API) - "Copyright Shield"

OpenAI's Copyright Shield covers ChatGPT Enterprise, ChatGPT Team, and paid API customers. Free ChatGPT and ChatGPT Plus are not covered. OpenAI will defend the customer and pay approved settlements or judgments for third-party IP claims arising from use or distribution of output.

Carve-outs: the customer knew or should have known output was infringing; the customer disabled or ignored citation/filtering/safety features; output was modified or combined with non-OpenAI products; the customer didn't have rights to the input or fine-tuning files; trademark claims based on use in trade or commerce; output sourced from a third-party offering. The indemnity is capped at fees paid in the previous 12 months.

Citations:
- OpenAI Service Terms: https://openai.com/policies/service-terms/
- OpenAI Business Terms: https://openai.com/policies/business-terms/
- Proskauer, "OpenAI's Copyright Shield Broadens User IP Indemnities": https://www.proskauer.com/blog/openais-copyright-shield-broadens-user-ip-indemnities-for-ai-created-content

### Anthropic (Claude for Work, API)

Anthropic's Commercial Terms (effective 1 January 2024, subsequently updated) give API and commercial customers full ownership of outputs and an uncapped copyright indemnity against third-party copyright claims arising from authorised use of the services or outputs. Free Claude and Claude Pro consumer users are not indemnified.

Carve-outs: customer modifications to services or outputs; combination with non-Anthropic tech or content; the customer's own prompts or data; use the customer knew or should reasonably have known infringed; the practice of a patented invention contained in an output; trademark claims.

Context: in September 2025, Anthropic settled Bartz v Anthropic (US) for $1.5 billion over pirated training books. The settlement covers past training conduct only; it does not affect Anthropic's forward indemnity to customers or its ability to train on legitimately acquired material.

Citations:
- Anthropic, "Expanded legal protections and API improvements": https://www.anthropic.com/news/expanded-legal-protections-api-improvements
- Anthropic Commercial Terms of Service: https://www.anthropic.com/legal/commercial-terms
- Ropes & Gray, "Anthropic's Landmark Copyright Settlement": https://www.ropesgray.com/en/insights/alerts/2025/09/anthropics-landmark-copyright-settlement-implications-for-ai-developers-and-enterprise-users

### Microsoft 365 Copilot, GitHub Copilot (Copilot Copyright Commitment)

Microsoft's Copilot Copyright Commitment (effective 1 October 2023) covers paid commercial Copilot products, including Microsoft 365 Copilot, GitHub Copilot Business/Enterprise, and Azure OpenAI Service. Consumer Copilot and any use without a work identity are not covered. Microsoft will defend and pay adverse judgments or settlements for third-party copyright claims on inputs or outputs.

Five conditions: the customer didn't tamper with safety systems; the customer had rights to the input; the customer didn't knowingly use output likely to infringe; the claim isn't trademark-related; and for Azure OpenAI, all mitigations in product documentation (including published filters and telemetry settings) must be implemented.

Citations:
- Microsoft On the Issues, "Microsoft announces new Copilot Copyright Commitment": https://blogs.microsoft.com/on-the-issues/2023/09/07/copilot-copyright-commitment-ai-legal-concerns/
- Microsoft Learn, "Customer Copyright Commitment Required Mitigations": https://learn.microsoft.com/en-us/azure/foundry/responsible-ai/openai/customer-copyright-commitment

### Google (Gemini for Workspace, Vertex AI)

Google Cloud offers a two-part indemnity: training-data indemnity (claims that Google's training data infringes) and generated-output indemnity (claims that the output infringes). Covered products are listed in Google's Generative AI Indemnified Services page and include Gemini for Workspace, Vertex AI Search, Vertex AI Conversation, Vertex AI embeddings, and several Codey/Imagen/Gemini APIs. Customers receive coverage automatically without amending their agreement.

Carve-outs: intentional attempts to generate infringing output; failure to use available source-citation and safety tools; use outside the documented covered list.

Citations:
- Google Cloud Blog, "Protecting customers with generative AI indemnification" (Oct 2023): https://cloud.google.com/blog/products/ai-machine-learning/protecting-customers-with-generative-ai-indemnification
- Google Cloud, "Generative AI Indemnified Services": https://cloud.google.com/terms/generative-ai-indemnified-services

### Adobe Firefly

Adobe's position is the strongest marketed of any mainstream provider: Firefly is trained on licensed Adobe Stock, openly licensed material, and public domain work, and content generated by non-beta Firefly features is described as commercially safe with no required attribution.

IP indemnification is a paid enterprise entitlement (Adobe Express and Firefly site licence, or qualifying Creative Cloud for enterprise plans). The indemnity covers the specific Firefly-generated output; it does not cover anything you add or combine with that output. Beta-labelled features are excluded.

Citations:
- Adobe Firefly Enterprise product page: https://business.adobe.com/products/firefly-business.html
- Adobe Firefly product description: https://helpx.adobe.com/legal/product-descriptions/adobe-firefly.html
- Adobe Firefly Legal FAQs - Enterprise Customers: https://business.adobe.com/assets/pdfs/products/firefly-business/firefly-legal-faqs-enterprise-customers-2024-06-11.pdf

### Tier-level summary

| Tier | Typical indemnity |
| --- | --- |
| Free consumer (ChatGPT free, Claude.ai free, Copilot consumer, Gemini free) | None |
| Paid consumer (ChatGPT Plus, Claude Pro, Copilot Pro) | None or limited (commercial use allowed but no IP indemnity) |
| Team / Business | Contractual indemnity, typically capped, with full carve-outs |
| Enterprise / API | Broadest indemnity, sometimes uncapped (Anthropic), often capped to 12-month fees (OpenAI) |

### In-flux

Vendor terms are updated frequently, sometimes quietly. Always read the version live on the provider's website before relying on it for a specific project. Caps and exclusions in particular change.

---

## 3. Active UK lawsuits

### Getty Images v Stability AI [2025] EWHC 2863 (Ch)

**Judgment:** 4 November 2025, Mrs Justice Joanna Smith DBE, High Court of England and Wales.

**What was decided.** The trial at this stage was narrower than originally pleaded; Getty had dropped or amended several claims due to evidential difficulties (Stability's training was carried out outside the UK). The Court:

- Rejected Getty's secondary copyright infringement claim. Importing, possessing, or dealing with the pre-trained Stable Diffusion model in the UK did not make the model an "infringing copy" under sections 22-27 CDPA. Key holding: the model weights are not themselves a copy of the training works; they are statistically trained parameters.
- Rejected database right infringement and passing off.
- Found limited trademark infringement under sections 10(1) and 10(2) Trade Marks Act 1994 for a small number of instances where earlier versions of Stable Diffusion generated images containing Getty watermarks that appeared in commerce in the UK.

**What was not decided.** The case did not rule on primary copyright infringement in the act of training itself. Getty largely couldn't pursue that because the training occurred on US servers and Getty couldn't establish the required UK nexus in evidence. As one UK litigator put it to Reuters, the judgment "leaves the UK without a meaningful verdict on the lawfulness of an AI model's process of learning from copyright materials." The question of whether scraping and training on copyrighted works in the UK is lawful without a licence remains open under UK law.

**Appeal.** At the consequentials hearing on 16-17 December 2025, Mrs Justice Smith granted Getty permission to appeal the dismissal of the secondary copyright infringement claim. The appeal is pending at the Court of Appeal as of April 2026.

Citations:
- Judgment PDF: https://www.judiciary.uk/wp-content/uploads/2025/11/Getty-Images-v-Stability-AI.pdf
- Bird & Bird case note: https://www.twobirds.com/en/insights/2025/uk/stability-ai-defeats-getty-images-copyright-claims-in-first-of-its-kind-dispute-before-the-high-cour
- Mayer Brown, "Getty Images v Stability AI: What the High Court's Decision Means": https://www.mayerbrown.com/en/insights/publications/2025/11/getty-images-v-stability-ai-what-the-high-courts-decision-means-for-rights-holders-and-ai-developers
- CMS, "Permission to appeal sought by Getty Images at consequentials hearing" (Jan 2026): https://cms-lawnow.com/en/ealerts/2026/01/getty-images-v-stability-ai-permission-to-appeal-sought-by-getty-images-at-consequentials-hearing

### Other UK matters

No other UK High Court judgments on generative AI training have been handed down at time of writing. Expect further filings from UK music publishers and news organisations to emerge through 2026; several letters-before-action have been reported but are not yet public litigation.

### Relevant US cases with UK read-across

- **Bartz v Anthropic (N.D. Cal., 2025).** Judge Alsup held that training on lawfully purchased books was "exceedingly transformative" and fair use under US law, but downloading pirated copies for training was "irredeemably infringing." Settlement of approximately $1.5bn announced September 2025. US fair use has no direct UK equivalent, so this does not translate one-to-one, but it does set a commercial norm: AI companies will pay for pirated training data.
- **Kadrey v Meta (N.D. Cal., 2025).** Meta won on the pleadings but the judgment was pointedly narrow: "this ruling does not stand for the proposition that Meta's use of copyrighted materials to train its language models is lawful."
- **New York Times v OpenAI & Microsoft (S.D.N.Y.).** Motion to dismiss largely denied March 2025; case proceeding to trial, no date set. The most important live US case because it tests output reconstruction, not just training.

None of these US decisions binds a UK court, but they shape UK provider behaviour (Anthropic's settlement changed its commercial posture) and provide persuasive authority for how fact patterns are analysed.

### Citations

- NPR, "Federal judge rules in Anthropic's favor" (25 June 2025): https://www.npr.org/2025/06/25/nx-s1-5445242/federal-rules-in-ai-companys-favor-in-landmark-copyright-infringement-lawsuit-authors-bartz-graeber-wallace-johnson-anthropic
- Debevoise, "Anthropic and Meta Decisions on Fair Use" (June 2025): https://www.debevoise.com/insights/publications/2025/06/anthropic-and-meta-decisions-on-fair-use
- NPR, "NYT copyright case against OpenAI to go forward" (26 March 2025): https://www.npr.org/2025/03/26/nx-s1-5288157/new-york-times-openai-copyright-case-goes-forward

---

## 4. Professional body guidance (UK design and creative)

### IPA and ISBA - 12 Industry Principles for Generative AI in Advertising

The most concrete UK professional guidance. Published jointly by the IPA (Institute of Practitioners in Advertising) and ISBA (Incorporated Society of British Advertisers) on 1 November 2023, with updates through March 2025. The 12 principles cover responsible and ethical use, avoiding undisclosed deepfakes, transparency with audiences where AI plays a significant role, environmental impact, anti-discrimination, personal data rights, impact on IP holders and content creators, impact on employment (AI as "additive and enabler"), vetting of tools, meaningful human oversight and accuracy checks, candour between advertisers and agencies about AI use, and continual review. Principle 11 is particularly operational: neither an agency nor an advertiser should include AI-generated content in materials provided to the other without the other's agreement.

Citation:
- IPA, "IPA and ISBA launch industry principles for use of generative AI in advertising": https://ipa.co.uk/news/industry-principles-for-generative-ai
- ISBA principles page: https://www.isba.org.uk/knowledge/advertising-industry-principles-use-generative-ai-creative-advertising

### D&AD

D&AD has engaged substantively with AI through its Trend Report 2025 "Shaping the Shift" (with Shutterstock), focused on creative practice, ownership, and trust. D&AD has not published a formal prohibition on AI-assisted entries to the Awards; AI-driven work has been shortlisted and won pencils (Coca-Cola "Masterpiece", 2023). Public-facing competition rules do not require disclosure of AI tools used in production of an entry beyond general accuracy-of-entry obligations. There is no published "quote-worthy" policy paragraph equivalent to the IPA/ISBA principles.

Citations:
- D&AD AI Trend Report 2025: https://campaigns.dandad.org/ai-trend-report-2025
- D&AD Trend Report 2025 PDF: https://media.dandad.org/documents/d-ad-2025-trend-report-250929.pdf

### Design Council

The Design Council has not published a standalone AI position statement as of April 2026. Their published commentary covers AI within broader "Design for Planet" and inclusive-design discourse, rather than as a policy directive for professional practice. **Not found:** a formal rule or quotable position comparable to IPA/ISBA.

### Chartered Society of Designers (CSD)

The CSD provides IP, legal, and insurance support to members, but a public AI position statement or guidance document was not located in this research. **Not found.**

### APA (Advertising Producers Association)

The APA has engaged with the IPA/ISBA principles as a signatory stakeholder in the advertising community. No separate AI guidance document was located. **Not found.**

### Adjacent: ASA / CAP Codes

Not a "professional body" in the membership sense, but the Committee of Advertising Practice has made clear that AI-generated ads are subject to the same misleadingness, social-responsibility, and substantiation rules as any other. Worth mentioning in a talk if the audience will produce advertising work.

---

## What this means for our talk

Four practical rules of thumb for the MA audience:

1. **In the UK, training on other people's stuff still needs a licence.** Section 29A CDPA only covers non-commercial research. The government consulted on a broader exception in 2024-25, received over 11,000 responses, and in March 2026 stepped back from legislating. Assume the law will not change before you graduate. If you are building a model, build on openly licensed or licensed data.

2. **Using AI tools is different from training AI tools.** You can generally use ChatGPT, Claude, Gemini, Copilot, or Firefly on client and portfolio work. But the safety net (the provider's indemnity) only exists on paid business and enterprise tiers, only if you use the product as intended, and never covers trademark claims. If a client asks about IP cover, the answer is "only on the Enterprise plan, and only if we don't disable the safety filters."

3. **Adobe Firefly is the one trained on licensed data by design.** For image work where commercial cleanliness matters more than cutting-edge capability, Firefly enterprise output is the lowest-risk path. Everything else requires you to read and trust an indemnity clause.

4. **Getty v Stability AI did not settle the question.** In November 2025 the UK High Court rejected most of Getty's case on narrow technical grounds (the model weights aren't a "copy"), but the judgment expressly did not decide whether UK training on copyrighted works is lawful. Getty's appeal is live. Treat the legal position on training as unresolved, not as "AI companies won."

And one meta-point worth flagging: the most concrete UK professional rule currently in print is Principle 11 of the IPA/ISBA guidance: do not hand AI-generated material to a client or partner agency without telling them. That is already the closest thing the UK creative industry has to a disclosure norm, and it applies to you the moment you start freelancing.
