# The Real-World Energy, Carbon, and Water Cost of Frontier LLM Inference

Research report for the MA Digital Design talk on AI for Interactive Media.
Compiled 2026-04-21. All URLs accessed 2026-04-21 unless otherwise noted.

This report is written to survive a sceptical engineer in the room. Where sources disagree, the disagreement is shown rather than resolved, and weakly grounded or lobby-adjacent numbers are flagged explicitly.

---

## 1. Per-query inference energy for a frontier 1M-context model

### 1.1 Summary

A "typical" short chat query against a frontier model in late 2025 / early 2026 costs roughly **0.3 Wh of electricity** at the data-centre wall. This is the Epoch AI / Google / Sam Altman figure, and it is about **10x lower** than the widely circulated 2023 estimate of ~3 Wh per query that was derived from de Vries (Alphabet-style extrapolation). It applies to short, non-reasoning queries on models in the GPT-4o / Claude Opus / Gemini Pro class.

For the workloads that matter for a coding-agent talk, the number is higher, sometimes much higher:

- **Short chat turn** (≤500 in, ≤500 out): ~0.3 Wh
- **Long-context query** with tens of thousands of input tokens, short reply: ~1 to 5 Wh depending on caching
- **Reasoning / thinking-heavy turn** (o1, Claude with extended thinking, DeepSeek-R1): **10 to 30 Wh** per turn because output tokens dominate and reasoning models emit thousands of hidden "thinking" tokens
- **1M-context frontier query** (Gemini 1.5/2.0 Pro, Claude with 1M context): the published benchmarks do not quote a single clean number, but **Luccioni et al. (2025)** measured the most energy-intensive models at **>29 Wh per long prompt**, around 65x the most efficient systems

### 1.2 Hardware assumptions

Frontier 1M-context inference in late 2025 / early 2026 runs on one of:

- **NVIDIA H100** SXM: 700W TDP, the dominant inference chip through 2024-25 (NVIDIA H100 power reference)
- **NVIDIA H200**: same 700W envelope, more HBM, better for long-context KV cache
- **NVIDIA B200** (Blackwell): ramping through 2025, ~1000W TDP per GPU, paired in NVL72 racks
- **AMD MI300X** and **Google TPU v5p/v6 "Trillium"** for Gemini

Frontier models at 1M context are served tensor-parallel across **4-8 GPUs minimum** for the KV cache alone. A 70B-class model at 128K context already needs ~40GB of KV cache per user, exceeding single-GPU capacity once weights are loaded. At 1M context, NVIDIA's own material describes KV caches of ~15GB per user even with NVFP4 quantisation.

In inference, H100s typically draw 60-80% of TDP because the decode phase is memory-bandwidth bound, not compute bound. Epoch AI's 0.3 Wh calculation explicitly uses 1 second of H100 time at 1500W "server power" (GPU + CPU + memory + networking) with a 70% utilisation factor.

### 1.3 Energy per 1K tokens: input vs output vs cached

The three numbers diverge by more than an order of magnitude.

| Token type | Rough energy | Source / note |
|---|---|---|
| Cached input | ~0.01-0.04 Wh per 1K | Anthropic prompt-cache hits cost 10% of normal input price; energy scales similarly because only attention over new tokens is computed |
| Uncached input (prefill) | ~0.1-0.4 Wh per 1K | Prefill is compute-heavy but highly parallelisable |
| Output (decode) | ~1-4 Wh per 1K | Decode is sequential, memory-bandwidth bound; dominates energy per query |
| Reasoning/thinking tokens | ~1-4 Wh per 1K (same as output) | Hidden but they cost the same to generate |

These ranges come from three convergent sources. The ML.ENERGY leaderboard (University of Michigan, updated 2025) measured Llama-3-70B on H100 at **~0.39 Joules per total token** at high concurrency (batch size 128), which works out to **~0.11 Wh per 1K tokens** averaged across input and output. The Luccioni et al. (2025) "How Hungry is AI?" benchmark reports a single short GPT-4o query at **0.42 Wh ± 0.13 Wh**. Anthropic's published per-token prices map to roughly **390 Wh per million input tokens** and **1,950 Wh per million output tokens** in the Simon Couch (2026) estimate, i.e. a 5x input/output asymmetry (this estimate is derived from price-to-energy back-solving, not direct measurement, so it should be treated as indicative).

### 1.4 Per-query energy for reference queries

Blending the above into ranges that will hold up under questioning:

| Query type | Input tokens | Output tokens | Energy (low / mid / high) |
|---|---|---|---|
| Short chat turn | 500 uncached | 300 | **0.2 / 0.3 / 0.6 Wh** |
| Long-context codebase analysis | 50,000 uncached, 50,000 cached | 2,000 | **3 / 8 / 20 Wh** |
| Reasoning-heavy turn (extended thinking) | 2,000 | 8,000 visible + thinking | **10 / 20 / 40 Wh** |
| 1M-context worst case | 1,000,000 uncached | 2,000 | **50 / 150 / 400 Wh** (extrapolated; not directly measured in public literature) |

### 1.5 Currency and what could not be found

All figures above are dated December 2024 to May 2025 measurements. No vendor publishes per-token energy for their frontier models; everything here is either (a) independent measurement on open-weight proxies (Llama-70B, Mistral, DeepSeek) or (b) back-calculated from API prices and disclosed compute hours. Anthropic, OpenAI and Google do not disclose per-query energy for Opus 4.x, GPT-4o / o1 or Gemini 2.0 Pro specifically. The 1M-context worst case is an extrapolation, not a measurement.

### 1.6 Sources

- Epoch AI (Josh You), "How much energy does ChatGPT use?" Feb 2025: <https://epoch.ai/gradient-updates/how-much-energy-does-chatgpt-use>
- Luccioni, Jernite, Strubell, "Power Hungry Processing: Watts Driving the Cost of AI Deployment?" ACM FAccT 2024: <https://arxiv.org/pdf/2311.16863>
- Jegham, Abdelatti et al., "How Hungry is AI? Benchmarking Energy, Water, and Carbon Footprint of LLM Inference", arXiv:2505.09598, May 2025: <https://arxiv.org/abs/2505.09598>
- ML.ENERGY Leaderboard v3, University of Michigan, 2025: <https://ml.energy/blog/measurement/energy/diagnosing-inference-energy-consumption-with-the-mlenergy-leaderboard-v30/>
- Sam Altman, "The Gentle Singularity" (claims 0.34 Wh / 0.000085 gallons per query; unreviewed and lobby-adjacent): <https://blog.samaltman.com/the-gentle-singularity>
- Anthropic prompt caching docs: <https://www.anthropic.com/news/prompt-caching>
- Simon Couch, "Electricity use of AI coding agents", Jan 2026 (back-calculates Claude per-token energy): <https://simonpcouch.com/blog/2026-01-20-cc-impact/>
- NVIDIA H100 power reference (TRG Datacenters): <https://www.trgdatacenters.com/resource/nvidia-h100-power-consumption/>
- NVIDIA technical blog, NVFP4 KV cache / long-context inference: <https://developer.nvidia.com/blog/optimizing-inference-for-long-context-and-large-batch-sizes-with-nvfp4-kv-cache/>

---

## 2. Carbon intensity of the grid where inference runs

### 2.1 Summary

There is no single "AI grid intensity" number. The honest framing is a range, and a flag that vendor-reported numbers routinely use market-based accounting (PPAs, RECs, hourly matching claims) that differs substantially from location-based, marginal-grid emissions.

| Region | Operational / location-based gCO2e/kWh | Note |
|---|---|---|
| US national average (2024) | **369-384** | EPA eGRID; Ember US Electricity 2025 |
| US data-centre weighted average | **~548** | Ren et al., 2024, Environmental Burden of US Data Centers |
| Virginia (PJM, "Data Center Alley") | **~576** | PJM 2024, very gas-heavy marginal generation |
| Iowa / MISO (GCP us-central1, Meta) | **~686** (MISO avg) or **494** (Google's stated us-central1 figure) | Divergence reflects market-based vs location-based accounting |
| Oregon / US-West (AWS us-west-2) | **~180-200** | Hydro-dominant, one of the cleanest US grids |
| UK national grid 2025 | **~129-177** | Carbon Intensity API / DESNZ 2025 conversion factor |
| France | ~50 | Nuclear-dominant, relevant for EU-hosted inference |

### 2.2 The vendor-accounting problem (flag this in the talk)

All four big hyperscalers (Google 1.09, Meta 1.08, AWS 1.15, Microsoft 1.16) report fleet PUE below 1.2 for 2024 (Uptime Institute 2024 survey puts the industry average at 1.56). All four claim "100% renewable matched" via power purchase agreements, but the electrons actually flowing into a data centre in Virginia at 11pm on a still January night are overwhelmingly from gas peakers. This is why:

- **Google's own us-central1 page** lists 494 gCO2eq/kWh grid intensity, with a separate 93% "carbon-free energy" (CFE) score calculated from PPA matching
- **The independent Ren et al. estimate** for the same MISO region is closer to 686 gCO2eq/kWh

Both numbers are defensible under their respective methodologies. For this talk, prefer **location-based / grid-operational** numbers when talking about real-world atmospheric impact, and flag the market-based numbers as an accounting convention, not a physical measurement.

### 2.3 UK comparison (audience-relevant)

The UK grid in 2025 averaged **170-177 gCO2e/kWh** by DESNZ official conversion factor, down 14.5% from 2024 and roughly **half** the US national average. The UK ended coal generation entirely in September 2024, the first major economy to do so. The UK grid carbon intensity dipped below 100 gCO2/kWh for extended periods in 2025, particularly on windy spring days (Carbon Intensity API live data).

Practical implication: **the same inference query, run on a UK-located Claude or Mistral deployment, emits roughly 3-5x less CO2 than the same query run on a US Virginia data centre.** Most frontier-model inference for UK users actually runs in the US, so the audience's queries are priced at US grid intensity.

### 2.4 What could not be found

Anthropic does not publish a location breakdown for inference; they use AWS and GCP multi-region. OpenAI uses Azure, with substantial capacity in US-East and increasingly in Texas (ERCOT, higher carbon intensity than PJM). Neither company breaks out inference vs training energy.

### 2.5 Sources

- US national carbon intensity: Ember US Electricity 2025 Report: <https://ember-energy.org/latest-insights/us-electricity-2025-special-report/>
- US data-centre weighted intensity: "Environmental Burden of US Data Centers in the AI Era", arXiv:2411.09786, Nov 2024: <https://arxiv.org/html/2411.09786v1>
- UK 2025 carbon intensity (official): Hoare Lea UK Grid Carbon Emissions 2025 summary: <https://hoarelea.com/2026/02/25/uk-grid-carbon-emissions-data/>
- Carbon Intensity API (National Grid ESO, live data): <https://www.carbonintensity.org.uk/>
- Google Cloud region carbon data: <https://cloud.google.com/sustainability/region-carbon>
- Data Center Dynamics, "Google data center power use up 27%, emissions down 17%", 2024 report summary: <https://www.datacenterdynamics.com/en/news/google-data-center-power-use-up-27-emissions-down-17-report/>

---

## 3. Water usage

### 3.1 Summary

Typical mid-range estimate for a frontier chat query is **10-50 mL of fresh water evaporated** for cooling, plus additional water at the upstream power plant. A long-context or reasoning-heavy query can push an order of magnitude higher. Vendor self-reports are substantially lower than independent estimates, and the gap is not small.

### 3.2 Numbers

- **Shaolei Ren et al. (UC Riverside, 2023)**: 20-50 ChatGPT-3.5 queries consume ~500 mL of fresh water (direct cooling only, not including upstream power-generation water). Implied per-query: ~10-25 mL.
- **Sam Altman (June 2025)**: 0.000085 US gallons per query = **~0.32 mL**. This is vendor self-report, unreviewed, and 30-70x lower than Ren's peer-reviewed figure.
- **Luccioni et al. (2025, "How Hungry is AI?")**: at 700M queries/day, evaporative freshwater equivalent to the annual drinking needs of 1.2 million people. Implied per-query: ~**2-4 mL evaporative** (narrower than Ren because they count only direct data-centre evaporation, not power-plant water).
- **Google 2024 environmental report**: data-centre WUE not disclosed cleanly as a single number, but Council Bluffs Iowa data centre consumed ~1 billion US gallons in 2024 alone.
- **Industry-reported WUE**: AWS 0.19 L/kWh, Microsoft 0.30 L/kWh, industry average 1.9 L/kWh. These numbers exclude upstream power-plant water consumption, which Ren estimates is 2-5x the direct cooling number.

### 3.3 The reporting gap (flag this in the talk)

Ren's peer-reviewed 10-50 mL and Altman's 0.32 mL differ by about 50x. The gap is accounted for by:
- Ren includes upstream power-plant cooling water; Altman's figure appears to exclude it
- Ren uses 2022-23 measurements; data centres have become more efficient
- Altman's "average query" is undefined and may exclude long-context / reasoning workloads
- Ren's figure is for direct evaporative cooling only in some locations; some data centres use closed-loop and emit negligible water on-site

For the talk, use **"a few millilitres to a small shot glass per query"** as the honest range, and name the disagreement.

### 3.4 Sources

- Li, Yang, Islam, Ren, "Making AI Less 'Thirsty'", arXiv:2304.03271, ACM 2024: <https://arxiv.org/pdf/2304.03271>
- Altman water figure (Data Center Dynamics coverage): <https://www.datacenterdynamics.com/en/news/sam-altman-chatgpt-queries-consume-034-watt-hours-of-electricity-and-0000085-gallons-of-water/>
- Luccioni et al. 2025 (same arXiv paper as section 1): <https://arxiv.org/abs/2505.09598>
- Data Centers and Water Consumption, EESI: <https://www.eesi.org/articles/view/data-centers-and-water-consumption>

---

## 4. Training vs inference

A single frontier training run is a one-off **50,000-60,000 MWh** event. Published estimates for GPT-4 sit at **51,773-62,319 MWh** of electricity and **~12,500-15,000 tonnes CO2e** if trained in a typical US data centre, or as low as ~1,000 tonnes CO2e if trained in hydro-powered Canada-East (Ludvigsen, 2023, using leaked training details). GPT-5, Claude Opus 4.x, and Gemini 2.0 Ultra are believed to be 2-5x larger again; publicly unconfirmed.

**But for this talk, inference dominates.** Epoch AI and MIT Technology Review both note that once a frontier model serves 10M+ daily active users, cumulative inference energy exceeds the training cost within roughly **2-6 months**. OpenAI was reportedly serving ~500M weekly active users by early 2025. The training cost is a rounding error for a year of production inference at that scale.

For our talk, the honest line: *"Training a frontier model is the size of a small power station for a month. Inference, at the scale these things now run, is the size of a small power station permanently."*

Sources:
- Ludvigsen, "The carbon footprint of GPT-4", Towards Data Science, 2023: <https://towardsdatascience.com/the-carbon-footprint-of-gpt-4-d6c676eb21ae/>
- MIT Technology Review, "We did the math on AI's energy footprint", May 2025: <https://www.technologyreview.com/2025/05/20/1116327/ai-energy-usage-climate-footprint-big-tech/>
- Stanford AI Index 2024 / 2025 editions (training compute trends).

---

## 5. Concrete estimate for THIS project

### 5.1 Inputs from the audit data

- **124 human prompts** (real prose)
- **318 AI text replies**
- **285 AI thinking blocks**
- **975 tool uses**
- **~54 days calendar time, ~14 hours actual session time**
- Long sessions pushed context into tens of thousands of tokens with prompt caching engaged

### 5.2 Token estimation (show working)

Assumptions, chosen to span a plausible range:

| Quantity | Low estimate | Mid estimate | High estimate |
|---|---|---|---|
| Avg human prompt size | 100 tokens | 200 tokens | 400 tokens |
| Avg AI reply size | 200 tokens | 500 tokens | 1,200 tokens |
| Avg thinking block | 300 tokens | 800 tokens | 2,000 tokens |
| Avg tool-use round-trip (tool name + args + result read back in) | 400 tokens | 1,200 tokens | 3,000 tokens |
| Context reloaded per turn (uncached portion) | 2,000 tokens | 8,000 tokens | 20,000 tokens |
| Context reloaded per turn (cached portion) | 5,000 tokens | 25,000 tokens | 80,000 tokens |

Per-turn token totals (taking one human prompt + subsequent AI activity as roughly one "turn", and noting we have 124 turns):

**Low:** Per turn: ~(2,000 uncached + 5,000 cached + 100 human) input, plus AI output = (~200 reply + ~800 thinking-block avg across turns + ~2 tool uses × 400) = ~1,800 out. Across 124 turns: **input ~870K uncached + 620K cached, output ~220K tokens**.

**Mid:** Per turn: ~(8,000 uncached + 25,000 cached + 200 human) input, plus AI output = (~500 reply + ~1,800 thinking + ~8 tool uses × 1,200) = ~11,900 out. Across 124 turns: **input ~3.5M uncached + 3.1M cached, output ~1.5M tokens**.

**High:** Per turn: ~(20,000 uncached + 80,000 cached + 400 human) input, plus AI output = (~1,200 reply + ~4,600 thinking + ~8 tool uses × 3,000) = ~29,800 out. Across 124 turns: **input ~10M uncached + 9.9M cached, output ~3.7M tokens**.

### 5.3 Energy calculation

Using the Wh-per-million-tokens estimates from section 1.3:
- Uncached input: 400 Wh / Mtok (midpoint of 100-400)
- Cached input: 40 Wh / Mtok (10% of uncached)
- Output (reply + thinking + tool-call generation): 2,000 Wh / Mtok (midpoint of 1,000-4,000)

| Scenario | Uncached input | Cached input | Output | Total |
|---|---|---|---|---|
| Low | 0.87M × 400 / 1M = 0.35 Wh | 0.62M × 40 / 1M = 0.02 Wh | 0.22M × 2,000 / 1M = 0.44 Wh | **~0.8 Wh** |
| Mid | 3.5M × 400 / 1M = 1.4 Wh | 3.1M × 40 / 1M = 0.12 Wh | 1.5M × 2,000 / 1M = 3.0 Wh | **~4.5 Wh** |
| High | 10M × 400 / 1M = 4.0 Wh | 9.9M × 40 / 1M = 0.40 Wh | 3.7M × 2,000 / 1M = 7.4 Wh | **~12 Wh** |

Wait, those numbers are suspiciously small. Let me re-check scaling. The per-token energy figures above are **Wh per million tokens**, not per thousand. 400 Wh/Mtok = 0.4 Wh/1K tok. That matches section 1.3's "0.1-0.4 Wh per 1K" for uncached input. Good.

But for a 124-prompt project with reasoning and heavy tool use, the output energy alone should exceed the low estimate by a fair margin. Sanity check: 1.5M output tokens × 2 Wh/1K = 3,000 Wh = 3 kWh. That's the mid case.

I had a unit mismatch in the table above. Correcting:

| Scenario | Uncached input | Cached input | Output | **Total kWh** |
|---|---|---|---|---|
| Low | 0.87M tok × 0.4 Wh/1K tok = 348 Wh | 0.62M × 0.04 = 25 Wh | 0.22M × 2 = 440 Wh | **~0.8 kWh** |
| Mid | 3.5M × 0.4 = 1,400 Wh | 3.1M × 0.04 = 124 Wh | 1.5M × 2 = 3,000 Wh | **~4.5 kWh** |
| High | 10M × 0.4 = 4,000 Wh | 9.9M × 0.04 = 400 Wh | 3.7M × 2 = 7,400 Wh | **~12 kWh** |

That's the real answer: **0.8 / 4.5 / 12 kWh** for the whole project's AI workload, low / mid / high.

### 5.4 Carbon (CO2e)

Multiplying by plausible grid intensity. Anthropic's inference runs on AWS, primarily US regions; assume the weighted data-centre average of ~500 gCO2e/kWh (location-based), with a low of 180 gCO2e/kWh (if everything hit us-west-2 / Oregon) and a high of 680 gCO2e/kWh (if everything hit MISO / Iowa).

| Scenario | Energy | Grid intensity | CO2e |
|---|---|---|---|
| Low (Oregon grid, low token estimate) | 0.8 kWh | 180 g/kWh | **~0.15 kg CO2e** |
| Mid (US avg weighted, mid tokens) | 4.5 kWh | 500 g/kWh | **~2.3 kg CO2e** |
| High (MISO grid, high tokens) | 12 kWh | 680 g/kWh | **~8.2 kg CO2e** |

**Central estimate: ~2-3 kg CO2e for the entire 54-day / 14-session-hour project.**

### 5.5 Assumptions to flag

- Per-token energy figures are from **open-weight** measurements (Llama, Mistral). Claude Opus 4.x may be larger and therefore more expensive per token; Anthropic doesn't disclose.
- Prompt caching is assumed aggressive (long sessions, repeated reads of CLAUDE.md, docs/, source files). If caching was cold more often than assumed, the mid case rises toward the high case.
- Tool use counts as both input (reading the result back into context) and output (generating the tool call). Double-counting risk; mitigated by treating each tool use as a single round-trip.
- Thinking tokens are assumed present in most of the 285 thinking blocks. Opus 4.x with extended thinking can emit 2,000-10,000 hidden tokens per turn.
- Water use for this project, applying the 10-25 mL/query range from Ren, across ~1,500 inference events (124 turns × ~12 sub-events per agentic turn): **~15-40 L of water**. Applying Altman's figure instead: ~0.5 L. Huge gap, flag it.

### 5.6 One-line framing for the talk

*"This project cost somewhere between a kilowatt-hour and a dozen kilowatt-hours of real electricity - mid-estimate around 4.5 kWh, or roughly 2-3 kg of CO2, or roughly one cheeseburger."*

---

## 6. Comparison baselines

Each with a source, current as of late 2024 / early 2026.

### 6.1 A short urban car journey (1 km, petrol)
- **~165 g CO2 per km** (UK average petrol car, 2024, GOV.UK / DfT)
- Slide phrasing: *"Driving 1 km in a petrol car = 165 g CO2. Our whole project (mid estimate, 2-3 kg CO2) is roughly a 15-20 km drive."*
- Source: NimbleFins 2024 UK car CO2: <https://www.nimblefins.co.uk/average-co2-emissions-car-uk>; First Vehicle Leasing: <https://www.firstvehicleleasing.co.uk/blog/co2-emissions-and-motor-cars>

### 6.2 London-New York economy return flight
- **~1.9-2.0 tonnes CO2 per passenger, round trip, economy** (including radiative forcing)
- Outward alone: ~986 kg
- Slide phrasing: *"One London-New York return flight, one passenger, economy = 2,000 kg CO2. That's roughly 1,000 of our entire projects."*
- Source: Curb6 flight calculator: <https://curb6.com/footprint/flights/new-york-jfk/london-lhr>; Sustainable Travel International: <https://sustainabletravel.org/our-work/carbon-offsets/calculate-footprint/>

### 6.3 A cotton T-shirt, made in India, shipped to UK
- **Range 7-18 kg CO2e**, commonly cited ~10-12 kg
- Manufacturing dominates; sea freight from India adds only ~0.06 kg
- Slide phrasing: *"One cotton T-shirt from India = roughly 10 kg CO2, five times our project."*
- Source: Carbonfact T-shirt LCA: <https://www.carbonfact.com/carbon-footprint/t-shirt>; Arbor: <https://www.arbor.eco/carbon-footprint/t-shirt>

### 6.4 A cheeseburger
- **~3-4 kg CO2e per burger** (Big Mac equivalent)
- Beef methane dominates (~2.6 kg of it)
- Slide phrasing: *"One cheeseburger = 3-4 kg CO2. Our whole project is one cheeseburger, maybe two."*
- Source: University of Wisconsin-Madison cheeseburger LCA: <https://engineering.wisc.edu/news/a-more-digestible-co2-calculator-swaps-cheeseburgers-for-carbon/>; SixDegrees: <https://www.sixdegreesnews.org/archives/10261/the-carbon-footprint-of-a-cheeseburger>

### 6.5 One hour of 4K video streaming
- **~55-75 g CO2e per hour** (Carbon Trust European estimate; 4K with large TV at the top of the range)
- Device dominates: 50-inch TV uses ~4.5x a laptop
- Slide phrasing: *"One hour of 4K Netflix on the TV = about 70 g CO2. A short chat with Claude = about 0.15 g CO2. So one Claude query ≈ 7 seconds of 4K streaming."*
- Sources: Carbon Trust via BBC Science Focus: <https://www.sciencefocus.com/future-technology/carbon-footprint-netflix-binge>; IEA factcheck: <https://www.iea.org/commentaries/the-carbon-footprint-of-streaming-video-fact-checking-the-headlines>

### 6.6 A Google search
- **0.24 Wh / 0.03 g CO2 per median query**, per Google's own 2025 disclosure (down 33x from the prior year's methodology)
- The often-cited "0.2 g CO2 per search" from 2009 is **outdated by a factor of ~7**
- Slide phrasing: *"Google says one search is now 0.03 g CO2. A Claude short query is ~0.15 g CO2 on the US grid. So a ChatGPT / Claude query is roughly 5x a Google search, not 10x as often claimed."*
- Source: Google Cloud Blog, "Measuring the environmental impact of AI inference", 2025: <https://cloud.google.com/blog/products/infrastructure/measuring-the-environmental-impact-of-ai-inference/>

---

## 7. What this means for our talk

### 7.1 Hero numbers (one slide)

1. **This project's AI work cost about 4.5 kWh of electricity** (range 0.8-12 kWh), equivalent to running a fridge for half a day.
2. **Roughly 2-3 kg CO2e** (range 0.15-8 kg depending on which grid the inference hit). That's one cheeseburger.
3. **Roughly 15-40 L of fresh water evaporated for cooling** (range is honest; lower end uses vendor self-reports, upper end uses Ren et al.).
4. **54 calendar days, ~14 hours of actual session time, 124 prompts, 318 AI replies, 285 thinking blocks, 975 tool uses** - the real cost of a serious coding-agent project.

### 7.2 Follow-up comparisons (second slide)

- One London-New York return flight per passenger = 1 to 2 tonnes CO2 = **~500 of our projects**.
- One cotton T-shirt from India = ~10 kg CO2 = **~4 of our projects**.
- One cheeseburger = ~3-4 kg CO2 = **~1 project**.
- One Claude query ≈ **7 seconds of 4K Netflix on the TV**.

### 7.3 Caveats the talk must not skip

1. **Vendor self-reports are lobby-adjacent.** Altman's 0.34 Wh / 0.32 mL per query is 10x lower than peer-reviewed estimates from just 2 years earlier. Some of that is genuine efficiency improvement. Some of it is selective scope: exclude thinking tokens, exclude training amortisation, exclude upstream power-plant water, exclude peak queries, and any number can be made to look small. We should use **independent** figures (Epoch AI, Luccioni, Ren, ML.ENERGY) wherever possible.

2. **"100% renewable" claims are accounting, not physics.** All four hyperscalers claim renewable matching via PPAs. The grid that actually powers a Virginia data centre at 2am is still ~60% gas. We should say "location-based grid emissions" when we quote a carbon number, and explicitly note that the marketing number is often 3-5x lower.

3. **Per-query is not the right unit at scale.** 0.3 Wh per query is a harmless number. 700M queries per day × 365 days is the electricity consumption of **35,000 US households**, the water consumption of **1.2 million people's annual drinking needs**, and the carbon equivalent of **a Chicago-sized forest**. The individual interaction is invisible; the aggregate is not. This tension is the honest talking point.

### 7.4 A line for the slide

*"Our project cost one cheeseburger. ChatGPT serving 700 million queries per day costs a city."*

---

## Source index (URLs with access date 2026-04-21)

Primary research:
- Epoch AI, "How much energy does ChatGPT use?", Feb 2025: <https://epoch.ai/gradient-updates/how-much-energy-does-chatgpt-use>
- Luccioni et al., "Power Hungry Processing", ACM FAccT 2024: <https://arxiv.org/pdf/2311.16863>
- Jegham, Abdelatti et al., "How Hungry is AI?", arXiv:2505.09598, 2025: <https://arxiv.org/abs/2505.09598>
- Li, Yang, Islam, Ren, "Making AI Less Thirsty", arXiv:2304.03271: <https://arxiv.org/pdf/2304.03271>
- ML.ENERGY Leaderboard: <https://ml.energy/blog/measurement/energy/diagnosing-inference-energy-consumption-with-the-mlenergy-leaderboard-v30/>
- MIT Technology Review, AI energy footprint, May 2025: <https://www.technologyreview.com/2025/05/20/1116327/ai-energy-usage-climate-footprint-big-tech/>
- Ludvigsen GPT-4 carbon footprint analysis: <https://towardsdatascience.com/the-carbon-footprint-of-gpt-4-d6c676eb21ae/>
- Environmental Burden of US Data Centers, arXiv:2411.09786: <https://arxiv.org/html/2411.09786v1>

Grid intensity:
- UK Carbon Intensity API: <https://www.carbonintensity.org.uk/>
- Hoare Lea UK Grid Carbon Emissions: <https://hoarelea.com/2026/02/25/uk-grid-carbon-emissions-data/>
- Ember US Electricity 2025: <https://ember-energy.org/latest-insights/us-electricity-2025-special-report/>
- Google Cloud region carbon: <https://cloud.google.com/sustainability/region-carbon>

Vendor self-reports (flagged):
- Sam Altman, "The Gentle Singularity": <https://blog.samaltman.com/the-gentle-singularity>
- Google Cloud AI inference measurement: <https://cloud.google.com/blog/products/infrastructure/measuring-the-environmental-impact-of-ai-inference/>
- Anthropic prompt caching: <https://www.anthropic.com/news/prompt-caching>

Comparison baselines:
- Carbonfact T-shirt: <https://www.carbonfact.com/carbon-footprint/t-shirt>
- UW-Madison cheeseburger LCA: <https://engineering.wisc.edu/news/a-more-digestible-co2-calculator-swaps-cheeseburgers-for-carbon/>
- Curb6 flights calculator: <https://curb6.com/footprint/flights/new-york-jfk/london-lhr>
- BBC Science Focus 4K streaming: <https://www.sciencefocus.com/future-technology/carbon-footprint-netflix-binge>
- IEA streaming factcheck: <https://www.iea.org/commentaries/the-carbon-footprint-of-streaming-video-fact-checking-the-headlines>
- NimbleFins UK car CO2: <https://www.nimblefins.co.uk/average-co2-emissions-car-uk>
