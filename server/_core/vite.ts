import express, { type Express } from "express";
import fs from "fs";
import { type Server } from "http";
import { nanoid } from "nanoid";
import path from "path";
import { createServer as createViteServer } from "vite";
import viteConfig from "../../vite.config";

interface RouteMeta {
  title: string;
  description: string;
  bodyHtml: string;
  schema?: string;
}

const ROUTE_META: Record<string, RouteMeta> = {
  "/": {
    title: "BrainPower AI — The Operating System for Decisions",
    description:
      "BrainPower AI is a structured intelligence system that helps individuals and teams simulate, visualize, and understand decisions before they are made. Not a chatbot — a Decision Intelligence System.",
    bodyHtml: `
<main>
  <header>
    <h1>BrainPower AI — The Operating System for Decisions</h1>
    <p>Structured Intelligence. Simulated Futures. Semi-3D Visual Decisions.</p>
    <p>Enhance clarity, structure complex thinking, and explore decisions through intelligent simulation. BrainPower AI is not a chatbot. It is not a productivity tool. It is a structured intelligence system designed to help users simulate, visualize, and understand decisions before they are made.</p>
  </header>
  <section>
    <h2>Why BrainPower AI?</h2>
    <table>
      <thead><tr><th></th><th>Traditional AI</th><th>Generative AI</th><th>BrainPower AI</th></tr></thead>
      <tbody>
        <tr><td>Output</td><td>Static Reports</td><td>Conversational Responses</td><td>Decision Intelligence</td></tr>
        <tr><td>Analysis</td><td>Historical Analysis</td><td>Information Generation</td><td>Future Simulation</td></tr>
        <tr><td>Method</td><td>Workshops</td><td>Q&amp;A</td><td>Structured Frameworks</td></tr>
        <tr><td>Purpose</td><td>Information</td><td>Content Creation</td><td>Strategic Decision Support</td></tr>
      </tbody>
    </table>
  </section>
  <section>
    <h2>Key Metrics</h2>
    <ul>
      <li><strong>87% improvement in Decision Clarity</strong> — Improve decision clarity through structured frameworks</li>
      <li><strong>42% reduction in Cognitive Load</strong> — Reduce cognitive overload in complex environments</li>
      <li><strong>3.2× Thinking Structure</strong> — Structure complex thinking with measurable depth</li>
      <li><strong>12 Outcomes Simulated</strong> — Simulate and visualize outcomes before acting</li>
    </ul>
  </section>
  <section>
    <h2>Core Concepts</h2>
    <ul>
      <li><a href="/concepts/systemic-thinking"><strong>Systemic Thinking</strong></a> — Understand the full system, not just isolated parts.</li>
      <li><a href="/concepts/cognitive-biases"><strong>Cognitive Biases</strong></a> — Identify blind spots and improve judgment quality.</li>
      <li><a href="/concepts/decision-intelligence"><strong>Decision Intelligence</strong></a> — Bring structure and clarity to high-impact decisions.</li>
      <li><a href="/concepts/mental-models"><strong>Mental Models</strong></a> — Frame problems more effectively and expand strategic thinking.</li>
    </ul>
  </section>
  <nav>
    <a href="/investors">Investor Relations</a>
    <a href="/book">Book a Session</a>
    <a href="/register">Get Started</a>
  </nav>
</main>`,
  },
  "/investors": {
    title: "Investor Relations — BrainPower AI",
    description:
      "Explore BrainPower AI's market opportunity, investment tiers, milestones, and strategic vision. Join us in shaping the future of Decision Intelligence.",
    bodyHtml: `
<main>
  <header>
    <h1>Invest in the Future of Decision Intelligence</h1>
    <p>BrainPower AI is not another AI tool. It is the operating system for decisions and futures.</p>
    <p>BrainPower AI is building a new category of AI focused on improving how decisions are made in complex, high-uncertainty environments.</p>
    <p>Founding Participation Round — raising $1,000,000–$3,000,000 USD for up to 20% economic participation in BrainPower AI, funding global app launches and enterprise scaling, targeting $15M ARR within 5 years.</p>
    <nav>
      <a href="/register">Create Investor Account</a>
      <a href="#investment-tiers">View Investment Opportunities</a>
    </nav>
  </header>

  <section>
    <h2>Platform Overview — The Operating System for Decisions and Futures</h2>
    <p>A cognitive intelligence platform that combines structured reasoning, simulation, and semi-3D visual environments.</p>
    <p>BrainPower AI helps individuals and organizations structure complex decisions, simulate multiple future outcomes, visualize decisions in an interactive spatial layer, understand risks and trade-offs, and improve decision-making over time.</p>
    <p>It is not a chatbot. It is not a productivity tool. It is not another AI assistant.</p>
    <p>BrainPower AI is a structured intelligence system built to think, simulate, and guide decisions with measurable outcomes.</p>
    <h3>From Information to Decisions</h3>
    <p>Traditional AI provides answers. BrainPower AI focuses on decisions.</p>
    <ul>
      <li>Decisions structured with clarity</li>
      <li>Strategies compared objectively</li>
      <li>Outcomes simulated before execution</li>
      <li>Risks &amp; opportunities made visible</li>
      <li>Intelligence improves over time</li>
    </ul>
  </section>

  <section>
    <h2>System Architecture — Seven Intelligence Engines</h2>
    <p>BrainPower AI is built on seven integrated intelligence engines that form a continuous decision intelligence loop:</p>
    <ul>
      <li><strong>Decision Structuring Engine</strong> — Breaks complex decisions into structured, navigable frameworks.</li>
      <li><strong>Cognitive Bias Detection</strong> — Surfaces hidden biases that distort judgment and decision quality.</li>
      <li><strong>Scenario Simulation Engine</strong> — Models multiple futures and their downstream consequences.</li>
      <li><strong>Mental Model Library</strong> — Applies proven thinking frameworks to decision contexts automatically.</li>
      <li><strong>Risk &amp; Opportunity Mapper</strong> — Identifies and weights risks and upside across decision paths.</li>
      <li><strong>Decision Vault</strong> — Stores, tracks, and learns from every decision made on the platform.</li>
      <li><strong>Semi-3D Visual Layer</strong> — Renders decisions and simulations in a spatial, interactive visual environment.</li>
    </ul>
  </section>

  <section id="investment-tiers">
    <h2>Investment Tiers</h2>
    <p>BrainPower AI is raising a maximum of 20% economic participation from investors across five bands.</p>
    <ul>
      <li>
        <h3>Band A — Community Supporter</h3>
        <p>Minimum: OMR 19,256.69 / $50,000. Instrument: SAFE / Convertible. Time horizon: 24–48 months.</p>
        <p>Benefits: Equity stake, quarterly updates, early beta access.</p>
        <p>Use of funds: Product hardening and validation.</p>
      </li>
      <li>
        <h3>Band B — Early Angel</h3>
        <p>Minimum: OMR 38,513.38 / $100,000. Instrument: SAFE / Convertible. Time horizon: 24–36 months.</p>
        <p>Benefits: Equity stake, quarterly updates, priority support, investor community access.</p>
        <p>Use of funds: Monetisation engine, B2B pilots.</p>
      </li>
      <li>
        <h3>Band C — Strategic Angel (Most Popular)</h3>
        <p>Minimum: OMR 96,283.46 / $250,000. Instrument: SAFE / Equity. Time horizon: 18–36 months.</p>
        <p>Benefits: Equity stake, monthly updates, advisory role, product roadmap input.</p>
        <p>Use of funds: Revenue acceleration.</p>
      </li>
      <li>
        <h3>Band D — Enterprise Partner</h3>
        <p>Minimum: OMR 192,566.92 / $500,000. Instrument: SAFE / Equity. Time horizon: 12–24 months.</p>
        <p>Benefits: Strategic equity, weekly updates, board observer rights, strategic partnerships.</p>
        <p>Use of funds: B2B contracts and integrations.</p>
      </li>
      <li>
        <h3>Band E — Lead Investor</h3>
        <p>Minimum: OMR 385,133.83+ / $1,000,000+. Instrument: SAFE / Equity (Lead Investor Rights).</p>
        <p>Benefits: Major equity stake, direct founder access, board seat, co-investment rights.</p>
        <p>Use of funds: Market authority and enterprise scale.</p>
      </li>
    </ul>
  </section>

  <section>
    <h2>Use of Funds</h2>
    <p>Strategic allocation designed for sustainable growth and market leadership.</p>
    <ul>
      <li><strong>Product Development (35%)</strong> — Core intelligence system and platform architecture.</li>
      <li><strong>Global Marketing and Growth (30%)</strong> — Global app launches, user acquisition, and demand generation.</li>
      <li><strong>Infrastructure and AI Costs (15%)</strong> — Cloud infrastructure, AI/API compute, and scalability.</li>
      <li><strong>Operations and Support (10%)</strong> — Day-to-day operations and customer support.</li>
      <li><strong>Legal and Compliance (5%)</strong> — Legal, regulatory, and compliance.</li>
      <li><strong>Reserve Buffer (5%)</strong> — Contingency reserve for flexibility.</li>
    </ul>
  </section>

  <section>
    <h2>Traction &amp; Growth</h2>
    <p>Strong early indicators demonstrating clear demand for structured intelligence systems.</p>
    <ul>
      <li><strong>Active Users</strong> — Growing</li>
      <li><strong>Revenue Growth</strong> — Strong</li>
      <li><strong>Retention</strong> — High</li>
      <li><strong>Enterprise Interest</strong> — Active</li>
    </ul>
    <h3>Roadmap</h3>
    <ol>
      <li><strong>Phase 1 — Product Maturation</strong>: Core intelligence system completion and app store launch. (In progress)</li>
      <li><strong>Phase 2 — Market Entry</strong>: Global marketing experiments and early user acquisition.</li>
      <li><strong>Phase 3 — Enterprise Pilots</strong>: Convert enterprise interest into pilot programs.</li>
      <li><strong>Phase 4 — Revenue Acceleration</strong>: Scale acquisition channels and enterprise contracts.</li>
      <li><strong>Phase 5 — Market Expansion</strong>: Expand into new geographies and verticals.</li>
    </ol>
  </section>

  <section>
    <h2>Market Position</h2>
    <p>The AI market is growing rapidly. The shift is clear: from tools to systems, from outputs to structured intelligence.</p>
    <ul>
      <li><strong>From Tools to Systems</strong> — The industry is shifting from standalone AI tools to integrated intelligence systems. BrainPower AI is positioned at the centre of this transition.</li>
      <li><strong>Decision Intelligence — Emerging Category</strong> — BrainPower AI is defining what comes next in structured thinking and decision support.</li>
      <li><strong>Enterprise Demand — B2B Opportunity</strong> — Organizations are actively seeking structured intelligence platforms to replace fragmented decision-making processes across teams.</li>
      <li><strong>Global Reach — Multi-Market</strong> — Targeting high-income professional markets: GCC, US/UK, Singapore, and Australia — with expansion through app distribution and partnerships.</li>
    </ul>
  </section>

  <section>
    <h2>Advisory Board</h2>
    <ul>
      <li>
        <h3>Mohamed Al Lawati — Business Strategy &amp; Enterprise</h3>
        <p>Advisor with deep enterprise knowledge in the GCC market and business strategy.</p>
      </li>
      <li>
        <h3>Ray Gutierrez Jr. — AI &amp; Technology</h3>
        <p>Symbolic Systems Architect &amp; Inventor of Qubit369. Patent-pending quantum logic framework. CPU-only real-time compute pioneer (4,546 FPS). AAAS Member.</p>
      </li>
      <li>
        <h3>Phylis West-Johnson — AI, Metaverse &amp; Media</h3>
        <p>Professor &amp; Director, School of Journalism &amp; Mass Communications, San Jose State University. Author of 6+ books on emerging tech &amp; AI in media.</p>
      </li>
    </ul>
  </section>

  <section>
    <h2>Frequently Asked Questions</h2>

    <h3>Investment Structure</h3>
    <dl>
      <dt>What is the investor's role?</dt>
      <dd>The investor's role is primarily as a capital partner enabling growth. Investors are not expected to operate the business, manage staff, or make day-to-day decisions. The company remains founder-led to preserve speed, clarity, and execution quality.</dd>

      <dt>ROI on investment and how much equity percentage of the company?</dt>
      <dd>This round is structured as a Brainpower AI economic participation pool, not a broad company-wide equity offer. A maximum of 20% of Brainpower AI economic participation is allocated to investors in exchange for a total raise of $1,000,000–$3,000,000 USD. Each investor's percentage is proportional to their share of the raise. Returns are driven by Brainpower AI's performance, profitability, licensing income, and/or an acquisition or buyout event.</dd>

      <dt>How long until investors get the ROI?</dt>
      <dd>ROI timing depends on the route: profit distributions or liquidity events. For early-stage software, a realistic expectation is that meaningful liquidity typically takes 2–5 years, with a base target of 24–36 months to reach strong revenue milestones.</dd>

      <dt>What is the exact legal structure of the investment?</dt>
      <dd>The investment is made into the operating company under a written agreement that defines each investor's economic participation tied specifically to Brainpower AI. The agreement defines the 'Brainpower AI participation pool,' the investor's share within that pool, and the events that trigger distributions.</dd>

      <dt>What governance rights do investors have?</dt>
      <dd>Investors typically receive information rights and defined economic rights. Governance will remain streamlined so execution stays fast. Day-to-day approvals will remain with management.</dd>

      <dt>Are there any existing liabilities, debts, or legal exposures?</dt>
      <dd>As of the date of this memorandum, the company has no material financial liabilities, debts, or legal disputes beyond normal operating obligations; any changes will be disclosed to investors.</dd>
    </dl>

    <h3>Financials &amp; Projections</h3>
    <dl>
      <dt>What traction do you currently have (paying users, revenue, active users, contracts)?</dt>
      <dd>As of 28 Feb 2026, Brainpower AI is pre-launch with zero current revenue and users. There are 0 paying users and OMR 0 in MRR, with a prototype in internal testing and early feedback from 5 founder-network testers. The enterprise pipeline consists of informal discussions with 2 potential GCC partners for post-launch pilots.</dd>

      <dt>What are the exact financial projections for the next 12, 24, and 36 months?</dt>
      <dd>At 12 months (base case): MRR OMR 2,000, 2 enterprise contracts, total revenue OMR 24,000. At 24 months (base case): MRR OMR 10,000, 5 enterprise contracts, total revenue OMR 120,000. At 36 months (base case): MRR OMR 50,000, 15 enterprise contracts, total revenue OMR 600,000. These projections are illustrative; actual results may differ materially.</dd>

      <dt>What is the total amount you are raising in this round?</dt>
      <dd>The total raise is between $1,000,000 and $3,000,000 USD. This is sized to fund global app launches and enterprise scaling—targeting $15M ARR within 5 years—while providing enough runway to complete product maturation, run global marketing experiments, and convert early enterprise pilots.</dd>

      <dt>How much runway will this funding provide?</dt>
      <dd>A disciplined burn model targets 12–18 months of runway with room for controlled marketing tests. The company will commit to milestone-based spending.</dd>

      <dt>What is the projected monthly break-even point?</dt>
      <dd>Break-even occurs at an MRR level in the OMR 8,000–10,000 range, assuming target gross margins and a lean fixed-cost base.</dd>
    </dl>

    <h3>Technology &amp; IP</h3>
    <dl>
      <dt>What is the product roadmap for the next 12 months?</dt>
      <dd>The 12-month roadmap focuses on three themes: launch readiness, retention, and enterprise readiness. Key items include app store launch polish, expansion of decision frameworks and templates, improved onboarding, team workspaces and shared decision vaults, reporting dashboards, and multi-provider AI routing.</dd>

      <dt>Is the AI proprietary or built on third-party APIs?</dt>
      <dd>Brainpower AI uses third-party foundational model APIs for language intelligence, while our proprietary value lies in workflows, decision frameworks, user experience, orchestration logic, and enterprise packaging.</dd>

      <dt>Who owns the intellectual property (IP) of Brainpower AI?</dt>
      <dd>All IP is owned by the operating company. This includes source code, branding, design assets, decision frameworks, and proprietary workflow logic. All contractors and developers sign IP assignment and confidentiality agreements.</dd>
    </dl>

    <h3>Competitive Landscape</h3>
    <dl>
      <dt>What is the competitive landscape (ChatGPT, Copilot, Gemini, Claude) and why will Brainpower AI win?</dt>
      <dd>ChatGPT, Copilot, Gemini, and Claude are horizontal AI platforms designed for broad tasks. Brainpower AI is positioned as a vertical Decision Intelligence application layer that embeds structured frameworks, guided workflows, and repeatable decision outputs. We compete at the workflow and outcome layer, not the model layer.</dd>

      <dt>What geographic markets are you targeting first?</dt>
      <dd>The first targets are high-income, English-speaking professional markets and regions with strong AI adoption. Initial focus: GCC, US/UK, and selected hubs such as Singapore and Australia.</dd>
    </dl>

    <h3>Risk &amp; Downside</h3>
    <dl>
      <dt>What are the biggest risks right now, and how are you mitigating them?</dt>
      <dd>Key risks include customer acquisition cost inflation, churn, enterprise sales cycle length, and AI infrastructure cost volatility. Mitigation plans include authority-led acquisition, onboarding and habit-building loops, a pilot-to-contract enterprise approach, and multi-provider routing.</dd>

      <dt>What is the exit strategy?</dt>
      <dd>Multiple exit paths: (1) acquisition by a productivity SaaS or enterprise software vendor; (2) licensing buyout of Brainpower AI's workflows and platform; (3) a growth round with partial liquidity for early investors; or (4) long-term profitability with ongoing distributions.</dd>
    </dl>

    <h3>Founder &amp; Commitment</h3>
    <dl>
      <dt>Why invest now versus waiting 6–12 months?</dt>
      <dd>Investing now secures early participation in the capped 20% pool before scaling milestones increase pricing and terms. This round funds the next execution phase: global app distribution, retention improvements, and conversion of enterprise pilots. Later rounds are likely to be raised at higher valuations if targets are met.</dd>

      <dt>What is your personal financial commitment to Brainpower AI?</dt>
      <dd>The founder has committed over 18 months of focused work to Brainpower AI and invested approximately OMR 10,000 of personal capital into product development, infrastructure, and initial market validation activities.</dd>
    </dl>
  </section>

  <section>
    <h2>Schedule an Investor Call</h2>
    <p>Book a 30-Minute Investor Call — Schedule a direct call with the founder. We'll walk you through the financials, product roadmap, and investment terms — no pressure, full transparency.</p>
    <a href="/book">Schedule a Call</a>
    <a href="https://d2xsxph8kpxj0f.cloudfront.net/310419663029149863/X4TbsfVB7MDUndQ2ovXiVF/investorsquestions_49e3a83f.pdf">Download Investor Brief</a>
  </section>

  <section>
    <h2>Get in Touch</h2>
    <p>Prefer to write? Fill out the form below and we'll respond within 24 hours.</p>
    <p>Prefer email? Reach us at <a href="mailto:invest@brainpowerai.com">invest@brainpowerai.com</a></p>
  </section>

  <nav>
    <a href="/book">Book a Discovery Call</a>
    <a href="/register">Create Investor Account</a>
    <a href="/">Back to Home</a>
  </nav>
</main>`,
  },
  "/book": {
    title: "Book a Session — BrainPower AI",
    description:
      "Schedule a discovery call or product demo with the BrainPower AI team. Learn how our Decision Intelligence System can transform decision-making for you or your organisation.",
    bodyHtml: `
<main>
  <header>
    <h1>Book a Session with BrainPower AI</h1>
    <p>Schedule a discovery call or product demo and learn how BrainPower AI's Decision Intelligence System can transform how you and your team make decisions.</p>
  </header>
  <section>
    <h2>Session Types</h2>
    <p>Choose from discovery calls, product demonstrations, investor briefings, and strategic consultations. Our team will walk you through the BrainPower AI platform and discuss how structured decision intelligence applies to your context.</p>
  </section>
  <nav>
    <a href="/">Back to Home</a>
    <a href="/investors">Investor Relations</a>
  </nav>
</main>`,
  },
  "/concepts/systemic-thinking": {
    title: "Systemic Thinking — BrainPower AI Concepts",
    description:
      "See the whole, not just the parts. Understand how components interact, how feedback shapes outcomes, and where real leverage lives. A guide to systemic thinking from BrainPower AI.",
    schema: JSON.stringify({
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "Article",
          "headline": "Systemic Thinking: See the Whole, Not Just the Parts",
          "description": "Understand how components interact, how feedback shapes outcomes, and where real leverage lives. A guide to systemic thinking from BrainPower AI.",
          "url": "https://brainpowerai.com/concepts/systemic-thinking",
          "isPartOf": { "@type": "WebSite", "name": "BrainPower AI", "url": "https://brainpowerai.com" }
        },
        {
          "@type": "BreadcrumbList",
          "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://brainpowerai.com/" },
            { "@type": "ListItem", "position": 2, "name": "Systemic Thinking", "item": "https://brainpowerai.com/concepts/systemic-thinking" }
          ]
        }
      ]
    }),
    bodyHtml: `
<main>
  <nav><a href="/">Back to Home</a> — BrainPower AI · Concepts</nav>
  <header>
    <p>Concept 01</p>
    <h1>Systemic Thinking</h1>
    <p>See the whole, not just the parts. Understand how components interact, how feedback shapes outcomes, and where real leverage lives.</p>
  </header>
  <section>
    <h2>Core Principles</h2>
    <article>
      <h3>Interconnectedness</h3>
      <p>Every element in a system is connected to others. Changing one part ripples through the whole. Systemic thinkers map these connections before acting.</p>
    </article>
    <article>
      <h3>Emergent Properties</h3>
      <p>Systems produce outcomes that no single part can produce alone. Traffic jams, market crashes, and breakthroughs all emerge from interactions — not individual components.</p>
    </article>
    <article>
      <h3>Feedback Loops</h3>
      <p>Reinforcing loops amplify change; balancing loops resist it. Identifying which loops dominate a situation reveals why problems persist or accelerate.</p>
    </article>
    <article>
      <h3>Non-Linearity</h3>
      <p>Small inputs can produce large outputs — and vice versa. Linear thinking fails in complex systems. Leverage points are rarely where intuition suggests.</p>
    </article>
  </section>
  <section>
    <h2>Practices</h2>
    <ol>
      <li><strong>Map the System</strong> — Draw the actors, resources, and flows before forming any opinion. Incomplete maps produce incomplete solutions.</li>
      <li><strong>Identify Feedback</strong> — Ask: what reinforces this pattern? What limits it? Feedback loops explain why problems are self-sustaining.</li>
      <li><strong>Find Leverage Points</strong> — Donella Meadows identified 12 places to intervene in a system. The most powerful are often the least obvious.</li>
      <li><strong>Test Assumptions</strong> — Every mental model of a system is a hypothesis. Run small experiments to validate before committing resources.</li>
    </ol>
  </section>
  <nav>
    <a href="/concepts/cognitive-biases">Next: Cognitive Biases</a>
    <a href="/">Back to Home</a>
  </nav>
</main>`,
  },
  "/concepts/cognitive-biases": {
    title: "Cognitive Biases — BrainPower AI Concepts",
    description:
      "Identify the blind spots hardwired into human judgment. Understanding cognitive biases is the first step to thinking more clearly and deciding more rationally.",
    schema: JSON.stringify({
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "Article",
          "headline": "Cognitive Biases: Identify the Blind Spots Hardwired into Human Judgment",
          "description": "Understanding cognitive biases is the first step to thinking more clearly and deciding more rationally. A guide to key biases and de-biasing strategies from BrainPower AI.",
          "url": "https://brainpowerai.com/concepts/cognitive-biases",
          "isPartOf": { "@type": "WebSite", "name": "BrainPower AI", "url": "https://brainpowerai.com" }
        },
        {
          "@type": "BreadcrumbList",
          "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://brainpowerai.com/" },
            { "@type": "ListItem", "position": 2, "name": "Cognitive Biases", "item": "https://brainpowerai.com/concepts/cognitive-biases" }
          ]
        }
      ]
    }),
    bodyHtml: `
<main>
  <nav><a href="/">Back to Home</a> — BrainPower AI · Concepts</nav>
  <header>
    <p>Concept 02</p>
    <h1>Cognitive Biases</h1>
    <p>Identify the blind spots hardwired into human judgment. Understanding cognitive biases is the first step to thinking more clearly and deciding more rationally.</p>
  </header>
  <section>
    <h2>Key Cognitive Biases</h2>
    <article>
      <h3>Confirmation Bias</h3>
      <p>We seek information that confirms what we already believe and discount evidence that contradicts it. This is the most pervasive bias in decision-making.</p>
    </article>
    <article>
      <h3>Availability Heuristic</h3>
      <p>We judge probability by how easily examples come to mind. Vivid, recent, or emotionally charged events feel more likely than statistics suggest.</p>
    </article>
    <article>
      <h3>Dunning-Kruger Effect</h3>
      <p>Low competence produces high confidence. The less we know about a domain, the less we understand what we don't know — creating dangerous blind spots.</p>
    </article>
    <article>
      <h3>Sunk Cost Fallacy</h3>
      <p>Past investments — time, money, effort — should not influence future decisions. Yet we consistently let them. Rational decisions are forward-looking only.</p>
    </article>
  </section>
  <section>
    <h2>De-biasing Strategies</h2>
    <ol>
      <li><strong>Name the Bias</strong> — Awareness is the first defence. When you catch yourself rationalising, ask: which bias might be operating here?</li>
      <li><strong>Seek Disconfirmation</strong> — Actively look for evidence that contradicts your current view. Ask: what would change my mind? Then go find it.</li>
      <li><strong>Use Pre-Mortems</strong> — Before committing, imagine the decision has failed. Work backwards to identify what went wrong. This surfaces risks confirmation bias hides.</li>
      <li><strong>Slow Down</strong> — Most biases operate in fast, automatic thinking. Introducing deliberate pause — even 10 minutes — activates slower, more rational processing.</li>
    </ol>
  </section>
  <nav>
    <a href="/concepts/decision-intelligence">Next: Decision Intelligence</a>
    <a href="/concepts/systemic-thinking">Previous: Systemic Thinking</a>
    <a href="/">Back to Home</a>
  </nav>
</main>`,
  },
  "/concepts/decision-intelligence": {
    title: "Decision Intelligence — BrainPower AI Concepts",
    description:
      "A structured approach to making choices that are well-reasoned, values-aligned, and resilient under uncertainty. Explore the four pillars and decision framework from BrainPower AI.",
    schema: JSON.stringify({
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "Article",
          "headline": "Decision Intelligence: Clarity When Decisions Carry Weight",
          "description": "A structured approach to making choices that are well-reasoned, values-aligned, and resilient under uncertainty. Explore the four pillars and decision framework from BrainPower AI.",
          "url": "https://brainpowerai.com/concepts/decision-intelligence",
          "isPartOf": { "@type": "WebSite", "name": "BrainPower AI", "url": "https://brainpowerai.com" }
        },
        {
          "@type": "BreadcrumbList",
          "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://brainpowerai.com/" },
            { "@type": "ListItem", "position": 2, "name": "Decision Intelligence", "item": "https://brainpowerai.com/concepts/decision-intelligence" }
          ]
        }
      ]
    }),
    bodyHtml: `
<main>
  <nav><a href="/">Back to Home</a> — BrainPower AI · Concepts</nav>
  <header>
    <p>Concept 03</p>
    <h1>Decision Intelligence</h1>
    <p>Clarity when decisions carry weight. A structured approach to making choices that are well-reasoned, values-aligned, and resilient under uncertainty.</p>
  </header>
  <section>
    <h2>Four Pillars</h2>
    <article>
      <h3>Problem Framing</h3>
      <p>The quality of a decision is bounded by the quality of the question. Reframing the problem — even slightly — can reveal options that were invisible before.</p>
    </article>
    <article>
      <h3>Trade-off Analysis</h3>
      <p>Every decision involves giving something up. Decision intelligence makes trade-offs explicit, quantified where possible, and aligned with what actually matters.</p>
    </article>
    <article>
      <h3>Speed vs. Accuracy</h3>
      <p>Not all decisions deserve the same deliberation. Knowing when to decide fast and when to slow down is itself a critical intelligence layer.</p>
    </article>
    <article>
      <h3>Outcome Calibration</h3>
      <p>Good decisions can produce bad outcomes — and vice versa. Decision intelligence separates process quality from outcome quality to enable genuine learning.</p>
    </article>
  </section>
  <section>
    <h2>Decision Framework</h2>
    <ol>
      <li><strong>Define the Real Decision</strong> — Most people solve the wrong problem. Spend time clarifying what decision is actually being made before generating options.</li>
      <li><strong>Identify What You Value</strong> — Decisions are only as good as the values they serve. Articulate what success looks like before evaluating options.</li>
      <li><strong>Generate Multiple Options</strong> — The first option that comes to mind is rarely the best. Force at least three alternatives before evaluating any of them.</li>
      <li><strong>Evaluate Under Uncertainty</strong> — Use scenario planning, expected value thinking, and sensitivity analysis to stress-test options before committing.</li>
    </ol>
  </section>
  <nav>
    <a href="/concepts/mental-models">Next: Mental Models</a>
    <a href="/concepts/cognitive-biases">Previous: Cognitive Biases</a>
    <a href="/">Back to Home</a>
  </nav>
</main>`,
  },
  "/concepts/mental-models": {
    title: "Mental Models — BrainPower AI Concepts",
    description:
      "Mental models are the lenses through which we interpret reality. The richer your collection, the sharper your thinking. Explore essential mental models from BrainPower AI.",
    schema: JSON.stringify({
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "Article",
          "headline": "Mental Models: Expand How Problems Are Framed",
          "description": "Mental models are the lenses through which we interpret reality. The richer your collection, the sharper your thinking. Explore essential mental models from BrainPower AI.",
          "url": "https://brainpowerai.com/concepts/mental-models",
          "isPartOf": { "@type": "WebSite", "name": "BrainPower AI", "url": "https://brainpowerai.com" }
        },
        {
          "@type": "BreadcrumbList",
          "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://brainpowerai.com/" },
            { "@type": "ListItem", "position": 2, "name": "Mental Models", "item": "https://brainpowerai.com/concepts/mental-models" }
          ]
        }
      ]
    }),
    bodyHtml: `
<main>
  <nav><a href="/">Back to Home</a> — BrainPower AI · Concepts</nav>
  <header>
    <p>Concept 04</p>
    <h1>Mental Models</h1>
    <p>Mental models are the lenses through which we interpret reality. The richer your collection, the sharper your thinking and the better your decisions.</p>
  </header>
  <section>
    <h2>Essential Mental Models</h2>
    <article>
      <h3>First Principles Thinking</h3>
      <p>Break problems down to their fundamental truths, then reason up from there. Elon Musk used this to rethink rocket manufacturing from scratch.</p>
    </article>
    <article>
      <h3>Inversion</h3>
      <p>Instead of asking how to succeed, ask how to fail — then avoid it. Charlie Munger calls inversion one of the most powerful thinking tools available.</p>
    </article>
    <article>
      <h3>Second-Order Thinking</h3>
      <p>Ask: and then what? Every action has consequences, and those consequences have consequences. Most people stop at first-order effects.</p>
    </article>
    <article>
      <h3>The Map Is Not the Territory</h3>
      <p>Our models of reality are simplifications. Treating them as reality leads to blind spots. Good thinkers hold their models loosely and update them constantly.</p>
    </article>
  </section>
  <section>
    <h2>How to Use Mental Models</h2>
    <ol>
      <li><strong>Build a Latticework</strong> — Charlie Munger's advice: collect mental models from many disciplines. The more models you have, the more patterns you can recognise.</li>
      <li><strong>Match Model to Problem</strong> — Different problems call for different models. Ask: which lens is most useful here? Resist applying your favourite model to everything.</li>
      <li><strong>Combine Models</strong> — The most powerful insights come from applying multiple models simultaneously. Overlapping frameworks reveal what single models miss.</li>
      <li><strong>Update Constantly</strong> — A mental model that no longer fits reality is worse than no model at all. Treat every model as provisional and revise it when evidence demands.</li>
    </ol>
  </section>
  <nav>
    <a href="/concepts/decision-intelligence">Previous: Decision Intelligence</a>
    <a href="/">Back to Home</a>
  </nav>
</main>`,
  },
  "/login": {
    title: "Sign In — BrainPower AI",
    description: "Sign in to your BrainPower AI account to access your Decision Intelligence dashboard.",
    bodyHtml: `<main><h1>Sign In to BrainPower AI</h1><p>Access your Decision Intelligence dashboard. <a href="/register">Create an account</a> or <a href="/forgot-password">reset your password</a>.</p></main>`,
  },
  "/register": {
    title: "Create Account — BrainPower AI",
    description: "Create a BrainPower AI account and start making smarter, more structured decisions today.",
    bodyHtml: `<main><h1>Create a BrainPower AI Account</h1><p>Join BrainPower AI and start using structured decision intelligence. Already have an account? <a href="/login">Sign in</a>.</p></main>`,
  },
  "/forgot-password": {
    title: "Reset Password — BrainPower AI",
    description: "Reset your BrainPower AI account password.",
    bodyHtml: `<main><h1>Reset Your BrainPower AI Password</h1><p>Enter your email address and we will send you a password reset link. <a href="/login">Back to sign in</a>.</p></main>`,
  },
  "/dashboard": {
    title: "Dashboard — BrainPower AI",
    description: "Your BrainPower AI decision intelligence dashboard.",
    bodyHtml: `<main><h1>BrainPower AI Dashboard</h1><p>Sign in to access your decision intelligence dashboard.</p></main>`,
  },
  "/admin": {
    title: "Admin — BrainPower AI",
    description: "BrainPower AI administration panel.",
    bodyHtml: `<main><h1>BrainPower AI Admin</h1></main>`,
  },
  "/booking-admin": {
    title: "Booking Admin — BrainPower AI",
    description: "BrainPower AI booking administration panel.",
    bodyHtml: `<main><h1>BrainPower AI Booking Admin</h1></main>`,
  },
};

const NOT_FOUND_META: RouteMeta = {
  title: "Page Not Found — BrainPower AI",
  description: "The page you are looking for does not exist.",
  bodyHtml: `<main><h1>Page Not Found</h1><p>The page you are looking for does not exist. <a href="/">Return to BrainPower AI home</a>.</p></main>`,
};

const KNOWN_ROUTES = new Set(Object.keys(ROUTE_META));

function getRouteMeta(urlPath: string): RouteMeta | null {
  const clean = urlPath.split("?")[0].replace(/\/+$/, "") || "/";
  return ROUTE_META[clean] ?? null;
}

function isKnownRoute(urlPath: string): boolean {
  const clean = urlPath.split("?")[0].replace(/\/+$/, "") || "/";
  return KNOWN_ROUTES.has(clean);
}

function stripExistingMetaTags(html: string): string {
  return html
    .replace(/<title>[^<]*<\/title>/, "")
    .replace(/<meta\s+name="description"[^>]*>/gi, "")
    .replace(/<link\s+rel="canonical"[^>]*>/gi, "")
    .replace(/<meta\s+property="og:[^"]*"[^>]*>/gi, "")
    .replace(/<meta\s+name="twitter:[^"]*"[^>]*>/gi, "");
}

function injectPageContent(html: string, meta: RouteMeta, canonicalPath: string, is404 = false): string {
  const esc = (s: string) => s.replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const canonical = `https://brainpowerai.com${canonicalPath === "/" ? "" : canonicalPath}`;

  const ogImage = `https://brainpowerai.com/opengraph.jpg`;

  const headTags = is404
    ? [
        `<title>${esc(meta.title)}</title>`,
        `<meta name="description" content="${esc(meta.description)}" />`,
        `<meta name="robots" content="noindex, nofollow" />`,
      ].join("\n    ")
    : [
        `<title>${esc(meta.title)}</title>`,
        `<meta name="description" content="${esc(meta.description)}" />`,
        `<link rel="canonical" href="${canonical}" />`,
        `<link rel="sitemap" type="application/xml" href="/sitemap.xml" />`,
        `<meta property="og:type" content="website" />`,
        `<meta property="og:site_name" content="BrainPower AI" />`,
        `<meta property="og:title" content="${esc(meta.title)}" />`,
        `<meta property="og:description" content="${esc(meta.description)}" />`,
        `<meta property="og:image" content="${ogImage}" />`,
        `<meta property="og:url" content="${canonical}" />`,
        `<meta name="twitter:card" content="summary_large_image" />`,
        `<meta name="twitter:title" content="${esc(meta.title)}" />`,
        `<meta name="twitter:description" content="${esc(meta.description)}" />`,
        `<meta name="twitter:image" content="${ogImage}" />`,
      ].join("\n    ");

  const schemaTags = meta.schema
    ? `\n    <script type="application/ld+json">${meta.schema}</script>`
    : "";

  return stripExistingMetaTags(html)
    .replace("</head>", `    ${headTags}${schemaTags}\n  </head>`)
    .replace('<div id="root"></div>', `<div id="root">${meta.bodyHtml}</div>`);
}

export async function setupVite(app: Express, server: Server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true as const,
  };

  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    server: serverOptions,
    appType: "custom",
  });

  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    const urlPath = url.split("?")[0];
    const isKnown = isKnownRoute(urlPath);
    const routeMeta = isKnown ? getRouteMeta(urlPath) : NOT_FOUND_META;
    const statusCode = isKnown ? 200 : 404;
    const canonicalPath = (urlPath.replace(/\/+$/, "") || "/");

    try {
      const clientTemplate = path.resolve(
        import.meta.dirname,
        "../..",
        "client",
        "index.html"
      );

      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      let page = await vite.transformIndexHtml(url, template);
      if (routeMeta) {
        page = injectPageContent(page, routeMeta, canonicalPath, !isKnown);
      }
      res.status(statusCode).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

export function serveStatic(app: Express) {
  const distPath =
    process.env.NODE_ENV === "development"
      ? path.resolve(import.meta.dirname, "../..", "dist", "public")
      : path.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    console.error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }

  app.use(express.static(distPath, { index: false }));

  app.use("*", (req, res) => {
    const urlPath = req.originalUrl.split("?")[0];
    const isKnown = isKnownRoute(urlPath);
    const routeMeta = isKnown ? getRouteMeta(urlPath) : NOT_FOUND_META;
    const statusCode = isKnown ? 200 : 404;
    const canonicalPath = urlPath.replace(/\/+$/, "") || "/";

    const indexPath = path.resolve(distPath, "index.html");
    if (!fs.existsSync(indexPath)) {
      return res.status(404).send("Not Found");
    }

    let html = fs.readFileSync(indexPath, "utf-8");
    if (routeMeta) {
      html = injectPageContent(html, routeMeta, canonicalPath, !isKnown);
    }
    return res.status(statusCode).set({ "Content-Type": "text/html" }).end(html);
  });
}
