import { useEffect, useMemo, useRef, useState } from 'react';
import { usePageMeta } from "@/hooks/usePageMeta";
import { motion } from 'framer-motion';
import { Link } from 'wouter';
import { 
  ArrowRight, 
  TrendingUp, 
  Users, 
  Rocket, 
  Shield, 
  Award,
  Download,
  Calendar,
  CheckCircle,
  ChevronDown,
  Briefcase,
  Target,
  Globe,
  Zap,
  DollarSign,
  Clock,
  BarChart3,
  Star,
  Mail,
  Send,
  Phone,
  Brain,
  Layers,
  Eye,
  GitBranch,
  RefreshCw,
  Network,
  Building2,
  Smartphone,
  X,
  ArrowDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { trpc } from '@/lib/trpc';
import mohamedImg from '@assets/Mohd__1780592570450.jpg';
import rayImg from '@assets/Ray_1780592570452.png';
import phylisImg from '@assets/Phylis__1780592570451.png';
import fromToolsImg from '@assets/From_Tools_to_Systems_1780596759566.jpg';
import decisionIntelImg from '@assets/Decision_Intelligence_1780596759565.jpg';
import enterpriseDemandImg from '@assets/Enterprise_Demand_1780596759565.jpg';
import globalReachImg from '@assets/Global_Reach_1780596759566.jpg';

const INVESTOR_BRIEF_PDF_URL = "https://d2xsxph8kpxj0f.cloudfront.net/310419663029149863/X4TbsfVB7MDUndQ2ovXiVF/investorsquestions_49e3a83f.pdf";

const ROBOT_FEMALE_URL = "https://d2xsxph8kpxj0f.cloudfront.net/310419663029149863/X4TbsfVB7MDUndQ2ovXiVF/robot-female-ai_32a5c96a.png";
const NEON_FEMALE_URL = "https://d2xsxph8kpxj0f.cloudfront.net/310419663029149863/X4TbsfVB7MDUndQ2ovXiVF/neionimage_60ffe072.png";

export default function Investors() {
  usePageMeta({
    title: "Investor Relations — BrainPower AI",
    description: "Explore BrainPower AI's market opportunity, investment tiers, milestones, and strategic vision. Join us in shaping the future of Decision Intelligence.",
  });
  const [faqSearch, setFaqSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');

  // Contact form state
  const [contactForm, setContactForm] = useState({ name: '', email: '', company: '', investmentRange: '', message: '' });
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [contactError, setContactError] = useState('');

  // tRPC mutations
  const trackEvent = trpc.investor.trackEvent.useMutation();
  const submitContact = trpc.investor.submitContact.useMutation({
    onSuccess: () => { setContactSubmitted(true); setContactError(''); },
    onError: (err) => { setContactError(err.message || 'Failed to send. Please try again.'); },
  });

  const handleTrackEvent = (eventType: Parameters<typeof trackEvent.mutate>[0]['eventType'], metadata?: Record<string, unknown>) => {
    trackEvent.mutate({ eventType, metadata, referrer: typeof window !== 'undefined' ? document.referrer : undefined });
  };
  // Investment Tiers Data
  const investmentTiers = [
    {
      band: 'A',
      name: 'Community Supporter',
      minInvestment: 'OMR 19,256.69 / $50,000',
      instrument: 'SAFE / Convertible',
      intendedFor: 'Early supporters',
      timeHorizon: '24–48 months',
      informationRights: 'Quarterly updates, early beta access',
      useOfFunds: 'Product hardening, validation',
      benefits: ['Equity stake', 'Quarterly updates', 'Early beta access']
    },
    {
      band: 'B',
      name: 'Early Angel',
      minInvestment: 'OMR 38,513.38 / $100,000',
      instrument: 'SAFE / Convertible',
      intendedFor: 'Early angels',
      timeHorizon: '24–36 months',
      informationRights: 'Quarterly updates, priority support',
      useOfFunds: 'Monetization engine, B2B pilots',
      benefits: ['Equity stake', 'Quarterly updates', 'Priority support', 'Investor community access']
    },
    {
      band: 'C',
      name: 'Strategic Angel',
      minInvestment: 'OMR 96,283.46 / $250,000',
      instrument: 'SAFE / Equity',
      intendedFor: 'Strategic angels',
      timeHorizon: '18–36 months',
      informationRights: 'Monthly updates, advisory role, roadmap input',
      useOfFunds: 'Revenue acceleration',
      isPopular: true,
      benefits: ['Equity stake', 'Monthly updates', 'Advisory role', 'Product roadmap input']
    },
    {
      band: 'D',
      name: 'Enterprise Partner',
      minInvestment: 'OMR 192,566.92 / $500,000',
      instrument: 'SAFE / Equity',
      intendedFor: 'Enterprise partners',
      timeHorizon: '18–30 months',
      informationRights: 'Weekly updates, board observer rights',
      useOfFunds: 'B2B contracts, integrations',
      benefits: ['Strategic equity', 'Weekly updates', 'Board observer rights', 'Strategic partnerships', 'Custom integration support']
    },
    {
      band: 'E',
      name: 'Lead Investor',
      minInvestment: 'OMR 385,133.83+ / $1,000,000+',
      instrument: 'SAFE / Equity (Lead Investor Rights)',
      intendedFor: 'Lead investors',
      timeHorizon: '12–30 months',
      informationRights: 'Direct founder access, board seat',
      useOfFunds: 'Market authority, enterprise scale',
      benefits: ['Major equity stake', 'Direct founder access', 'Board seat', 'Co-investment rights']
    }
  ];

  // Milestones Data
  const milestones = [
    { date: 'Phase 1', title: 'Product Maturation', description: 'Core intelligence system completion and app store launch', status: 'in-progress' },
    { date: 'Phase 2', title: 'Market Entry', description: 'Global marketing experiments and early user acquisition', status: 'upcoming' },
    { date: 'Phase 3', title: 'Enterprise Pilots', description: 'Convert enterprise interest into pilot programs', status: 'upcoming' },
    { date: 'Phase 4', title: 'Revenue Acceleration', description: 'Scale acquisition channels and enterprise contracts', status: 'upcoming' },
    { date: 'Phase 5', title: 'Market Expansion', description: 'Expand into new geographies and verticals', status: 'upcoming' }
  ];

  // Team Members Data
  const teamMembers = [
    {
      name: 'From Tools to Systems',
      title: 'Market Transition',
      bio: 'The industry is shifting from standalone AI tools to integrated intelligence systems. BrainPower AI is positioned at the center of this transition.',
      image: fromToolsImg
    },
    {
      name: 'Decision Intelligence',
      title: 'Emerging Category',
      bio: 'Decision Intelligence is a rapidly growing category. BrainPower AI is defining what comes next in structured thinking and decision support.',
      image: decisionIntelImg
    },
    {
      name: 'Enterprise Demand',
      title: 'B2B Opportunity',
      bio: 'Organizations are actively seeking structured intelligence platforms to replace fragmented decision-making processes across teams.',
      image: enterpriseDemandImg
    },
    {
      name: 'Global Reach',
      title: 'Multi-Market',
      bio: 'Targeting high-income professional markets: GCC, US/UK, Singapore, and Australia — with expansion through app distribution and partnerships.',
      image: globalReachImg
    }
  ];

  // FAQs Data — categorised
  const faqCategories = [
    {
      label: 'Investment Structure',
      faqs: [
        {
          question: "What is the investor's role?",
          answer: "The investor's role is primarily as a capital partner enabling growth. Investors are not expected to operate the business, manage staff, or make day-to-day decisions. The company remains founder-led to preserve speed, clarity, and execution quality. Investors may contribute optional value through introductions, strategic advice, and feedback—especially around enterprise opportunities—but operational authority remains with management to avoid delays and conflicting decision-making."
        },
        {
          question: "ROI on investment and how much equity percentage of the company?",
          answer: "This round is structured as a Brainpower AI economic participation pool, not a broad company-wide equity offer. A maximum of 20% of Brainpower AI economic participation is allocated to investors in exchange for a total raise of $1,000,000–$3,000,000 USD. Each investor's percentage is proportional to their share of the raise. Returns are driven by Brainpower AI's performance, profitability, licensing income, and/or an acquisition or buyout event. These projections are illustrative only; actual results may differ materially, and there can be no certainty of outcomes. This is a performance-based participation structure designed to align investor outcomes with Brainpower AI's growth specifically."
        },
        {
          question: "What is their involvement in the company?",
          answer: "Investors receive information and economic rights tied to Brainpower AI's performance, but they do not receive operational control. Their involvement is typically limited to quarterly updates, KPI visibility, and optional advisory discussions. Investors do not approve hires, marketing experiments, product changes, or spending line-by-line. This structure is intentional because early-stage execution requires rapid iteration, and the company must be able to act quickly based on product and customer feedback."
        },
        {
          question: "How long until investors get the ROI?",
          answer: "ROI timing depends on the route: profit distributions or liquidity events. For early-stage software, a realistic expectation is that meaningful liquidity typically takes 2–5 years, with a base target of 24–36 months to reach strong revenue milestones that enable either profit distributions or credible acquisition interest. If enterprise conversion is slower or churn is higher than expected, the timeline extends and ROI may not occur. The plan is to reach break-even within the available runway and then grow into enterprise licensing for accelerated profitability and valuation."
        },
        {
          question: "What would be the distribution of ROI and the method?",
          answer: "Distributions occur via (a) profit distributions and/or (b) exit proceeds. Profit distributions are based on net profit attributable to Brainpower AI, calculated after operational costs, AI infrastructure costs, marketing spend, staffing, taxes (if applicable), and agreed reserves for reinvestment. Exit proceeds are distributed proportionally if Brainpower AI is acquired, licensed, or bought out. The agreement will define the distribution schedule (for example, quarterly or annual) and the calculation basis to avoid ambiguity."
        },
        {
          question: "What is the exact legal structure of the investment?",
          answer: "The investment is made into the operating company under a written agreement that defines each investor's economic participation tied specifically to Brainpower AI. This avoids legal ambiguity because a product brand alone cannot typically hold equity unless it is a separate legal entity. The agreement defines the 'Brainpower AI participation pool,' the investor's share within that pool, and the events that trigger distributions (profits or exit events). It also defines investor reporting and transfer restrictions."
        },
        {
          question: "How is the 20% Brainpower AI allocation legally structured and documented?",
          answer: "The agreement defines a fixed 'Brainpower AI participation pool' capped at 20%. Each investor's share in this pool is recorded and cannot be diluted beyond defined rules without formal approvals. The agreement also defines what counts as Brainpower AI revenue and profit, and how distributions are calculated and scheduled. In simple terms, investors own a fixed percentage of a capped 20% pool that tracks Brainpower AI's distributable profit and exit value."
        },
        {
          question: "What governance rights do investors have?",
          answer: "Investors typically receive information rights and defined economic rights. Governance will remain streamlined so execution stays fast. If needed, a small set of 'reserved matters' can be defined (for example, issuing more than the capped pool, selling major assets, or changing distribution rules). Day-to-day approvals will remain with management, since heavy governance at this stage slows execution and harms growth."
        },
        {
          question: "What happens if the founder leaves or becomes unable to operate?",
          answer: "A continuity plan will be in place: documented processes, secured admin credentials, infrastructure access controls, and a clear method for appointing an interim operator. For added investor confidence, the agreement can require the company to designate a backup manager and keep key operations documented. This reduces 'key person' risk and supports long-term resilience."
        },
        {
          question: "Are there any existing liabilities, debts, or legal exposures?",
          answer: "As of the date of this memorandum, the company has no material financial liabilities, debts, or legal disputes beyond normal operating obligations; any changes will be disclosed to investors. The company will also disclose any future debts, obligations, pending disputes, or major contractual liabilities in the investment agreement, and describe them clearly with associated terms. Investor trust depends on full transparency in this area."
        },
        {
          question: "What happens if additional funding is required later?",
          answer: "If additional funding is needed, it will be milestone-triggered and transparent. Investors may be offered pro-rata rights to maintain their participation share. If investors choose not to participate, dilution of their relative share may occur depending on the structure. The agreement will define future-round principles clearly: when funding may be sought, what milestones trigger it, and how existing investors are treated."
        },
        {
          question: "What dilution should current investors expect in future rounds?",
          answer: "Future rounds may dilute earlier investors depending on size and structure. Offering pro-rata rights allows current investors to maintain their participation share if they choose. Our principle is to be transparent about potential dilution, tie new capital raises to clear milestones, and ensure that any dilution is offset by value creation at the Brainpower AI level."
        },
      ]
    },
    {
      label: 'Financials & Projections',
      faqs: [
        {
          question: "What traction do you currently have (paying users, revenue, active users, contracts)?",
          // The dated "As of 28 Feb 2026" opener was removed rather than
          // refreshed: a date on a static page goes stale silently, and a stale
          // date on a traction disclosure is worse than none. The disclosure
          // itself is accurate and unchanged.
          answer: "Brainpower AI is pre-launch with zero current revenue and users. There are 0 paying users and OMR 0 in MRR, with a prototype in internal testing and early feedback from 5 founder-network testers on workflow usability. The enterprise pipeline currently consists of informal discussions with 2 potential GCC partners for post-launch pilots. Full details are provided in the 'Current Traction' section of the Topline Investor Brief."
        },
        {
          question: "What are the exact financial projections for the next 12, 24, and 36 months?",
          answer: "Projections start from zero traction, assuming post-raise launch in Months 1–3. They are assumption-driven: subscriber growth of 15–35% month-on-month post-launch, ARPU of OMR 15–25, churn of 10–18%, and 1–4 new enterprise contracts per quarter from Month 6 onward with ACV of OMR 3,000–8,000. At 12 months (base case): MRR OMR 2,000, 2 enterprise contracts, total revenue OMR 24,000. At 24 months (base case): MRR OMR 10,000, 5 enterprise contracts, total revenue OMR 120,000. At 36 months (base case): MRR OMR 50,000, 15 enterprise contracts, total revenue OMR 600,000. These projections are illustrative; actual results may differ materially."
        },
        {
          question: "What is the total amount you are raising in this round?",
          answer: "The total raise is between $1,000,000 and $3,000,000 USD. This is sized to fund global app launches and enterprise scaling—targeting $15M ARR within 5 years—while providing enough runway to complete product maturation, run global marketing experiments, and convert early enterprise pilots, without over-raising before the growth engine is validated."
        },
        {
          question: "How much runway will this funding provide?",
          answer: "Runway depends on the monthly burn rate and how aggressively marketing is scaled. A disciplined burn model targets 12–18 months of runway with room for controlled marketing tests. The company will commit to milestone-based spending: marketing spend increases only when conversion, retention, and CAC meet predefined thresholds. This approach protects investor capital and improves the odds of reaching break-even before runway ends."
        },
        {
          question: "How exactly will the invested funds be allocated?",
          answer: "Funds are allocated across specific categories: development, marketing, infrastructure, operations, legal, and reserve. The goal is balanced execution—building a strong product while also creating global demand and enterprise traction. A category-based allocation summary is investor-friendly and avoids micromanagement. The allocation will be reviewed quarterly against progress and adjusted based on measurable performance."
        },
        {
          question: "Are there audited or independently reviewed financial statements?",
          answer: "At the early stage, the company will rely on management reporting. As enterprise revenue grows and crosses agreed thresholds, an external accountant review can be introduced annually. Investors will receive quarterly management statements plus an annual external review once it becomes cost-effective, which improves credibility without adding heavy overhead too early."
        },
        {
          question: "What is the current monthly burn rate?",
          answer: "At this pre-launch stage, monthly burn is kept lean and focused on product development and essential operations. As the round is deployed, burn will be reported transparently and broken down by category (development, infrastructure, marketing, operations). Burn will be managed through milestone-based spend rules, with increases in marketing and hiring only when performance metrics justify it. Investors will see burn evolution in the quarterly reports and KPI dashboard."
        },
        {
          question: "What is the projected monthly break-even point?",
          answer: "Break-even is defined as the point where recurring revenue covers both fixed operating costs and variable AI inference costs. In our base case, this occurs at an MRR level in the OMR 8,000–10,000 range, assuming target gross margins and a lean fixed-cost base. The timeline to break-even depends on acquisition speed and churn, and will be tracked and reported quarterly."
        },
        {
          question: "How will Brainpower AI revenue be separated from other company activities?",
          answer: "Brainpower AI will be tracked as a separate internal cost center with distinct revenue lines, AI/API costs, marketing spend, and staffing allocations. This enables investors to see Brainpower AI unit economics clearly, without confusion from other company operations. It also supports enterprise reporting and any potential future spin-out or acquisition of the Brainpower AI business."
        },
      ]
    },
    {
      label: 'Unit Economics',
      faqs: [
        {
          question: "What are the current customer acquisition costs (CAC)?",
          answer: "CAC will be measured per channel (organic, paid search, paid social, partnerships) once acquisition campaigns begin. Our plan focuses on authority marketing (content, LinkedIn, YouTube), referrals, and product-led growth loops to reduce CAC over time, with a target CAC payback period of under 9 months. CAC by channel and payback period will be tracked on the KPI dashboard."
        },
        {
          question: "What is the lifetime value (LTV) of a customer?",
          answer: "LTV is driven by ARPU and retention. For subscriptions, LTV improves with strong habit loops, reusable templates, and 'workflow embedding' that makes Brainpower AI part of the user's regular decision process. For enterprise customers, LTV improves through renewals and seat expansion across teams. LTV assumptions will be tied to actual retention cohorts and renewal behavior rather than optimistic guesses, and reported alongside CAC to monitor unit economics."
        },
        {
          question: "What is the churn rate?",
          answer: "Churn will be measured monthly and tracked by cohort once users are live on the platform. The product roadmap includes churn-reduction mechanisms such as better onboarding, more frequent 'aha' moments, decision vault usage, weekly review prompts, and enterprise features that lock in workflows. Investors will see churn data and cohort curves on the KPI dashboard, and we will treat churn as a core product metric—not just a finance metric."
        },
        {
          question: "What is your pricing strategy and why?",
          answer: "Pricing will be tiered to support both global acquisition and enterprise upsell. Individual and small-team subscription tiers drive user volume and habit formation, while enterprise licensing packages drive higher-value recurring revenue. Pricing will be tested and optimized through experiments and will be anchored to clear, measurable value: time saved, decision clarity, and improved workflow outcomes."
        },
        {
          question: "What proof do you have of product-market fit?",
          answer: "Product-market fit is ultimately demonstrated through retention, repeat usage, willingness to pay, referrals, and enterprise pilot conversions. In the early stages, proof will be partial: conversion from trials to paid plans, weekly and monthly active usage, and successful pilots with clear outcome metrics. Over time, enterprise renewals and expansion across teams will become the strongest indicators of product-market fit."
        },
      ]
    },
    {
      label: 'Technology & IP',
      faqs: [
        {
          question: "What is the product roadmap for the next 12 months?",
          answer: "The 12-month roadmap focuses on three themes: launch readiness, retention, and enterprise readiness. Key items include: app store launch polish (iOS/Android listings, demo video, ASO), expansion of decision frameworks and templates, improved onboarding and in-app guidance, team workspaces and shared decision vaults for enterprises, reporting dashboards, and multi-provider AI routing. Each roadmap item is tied to a specific objective: improving retention, improving acquisition, or unlocking enterprise revenue."
        },
        {
          question: "What technical risks exist in the current architecture?",
          answer: "Technical risks include scaling reliability, AI latency and cost, data security, and consistency across mobile and web platforms. Mitigation measures include load testing and monitoring, caching and usage governance to manage AI calls, secure coding practices, and an architecture designed for incremental scale-out rather than big-bang rewrites. As the platform grows, we will harden the stack further based on enterprise requirements and security reviews."
        },
        {
          question: "Is the AI proprietary or built on third-party APIs?",
          answer: "Brainpower AI uses third-party foundational model APIs for language intelligence, while our proprietary value lies in workflows, decision frameworks, user experience, orchestration logic, and enterprise packaging. This reduces R&D risk and accelerates time-to-market, while still allowing defensibility at the workflow and customer relationship layer rather than the model layer."
        },
        {
          question: "If third-party APIs are used, what is the dependency risk?",
          answer: "Dependency risks include pricing changes, rate limits, performance fluctuations, and policy changes from model providers. We mitigate these by using multi-provider routing, designing model-agnostic workflows, implementing fallback models, and applying usage controls to keep costs within defined thresholds. The goal is to avoid being 'single-vendor trapped' and to keep flexibility as the AI infrastructure landscape evolves."
        },
        {
          question: "Do you own all source code and IP assignments from developers?",
          answer: "All developers and contractors will sign IP assignment, confidentiality, and delivery clauses so that all work product is owned by the operating company. This prevents future disputes and is essential for enterprise adoption and acquisition readiness. We treat IP hygiene as non-negotiable and will maintain appropriate documentation to demonstrate clean ownership."
        },
        {
          question: "Who owns the intellectual property (IP) of Brainpower AI?",
          answer: "All IP will be owned by the operating company. This includes source code, branding, design assets, decision frameworks, and proprietary workflow logic. All contractors and developers will sign IP assignment and confidentiality agreements to prevent future disputes. Clean IP ownership is essential for enterprise trust and any future acquisition."
        },
        {
          question: "What is the cybersecurity posture of the platform?",
          answer: "Security measures include secure authentication, encrypted storage where applicable, access control and least-privilege policies, and regular monitoring of the infrastructure. As enterprise deals grow, we will increase security hardening with admin logging, policy controls, and contract-driven compliance requirements. Security posture will evolve alongside customer needs and will be reflected in technical documentation for enterprise buyers."
        },
        {
          question: "Are there regulatory risks related to AI compliance or data protection laws?",
          answer: "Yes, especially when operating across multiple regions with different privacy and AI regulations. We will mitigate these risks by minimizing sensitive data storage, using clear and transparent user consent terms, implementing safe data-handling policies, and adjusting compliance posture (for example, data residency and retention controls) for enterprise customers as needed. Regulatory changes will be monitored and incorporated into product and contract updates over time."
        },
      ]
    },
    {
      label: 'Competitive Landscape',
      faqs: [
        {
          question: "What is the competitive landscape (ChatGPT, Copilot, Gemini, Claude) and why will Brainpower AI win?",
          answer: "ChatGPT, Copilot, Gemini, and Claude are horizontal AI platforms designed for broad tasks. They provide general capability but are not purpose-built decision systems. Brainpower AI is positioned as a vertical Decision Intelligence application layer that embeds structured frameworks, guided workflows, and repeatable decision outputs. We do not compete at the model layer; we leverage foundational models as infrastructure and compete at the workflow and outcome layer. This mirrors how vertical SaaS wins alongside platform giants by becoming embedded in specialized workflows where users pay for structure, repeatability, and results."
        },
        {
          question: "What geographic markets are you targeting first?",
          answer: "The first targets are high-income, English-speaking professional markets and regions with strong AI adoption. Initial focus will be on the GCC, US/UK, and selected hubs such as Singapore and Australia, followed by broader expansion through app distribution and partnerships as retention and unit economics support it."
        },
        {
          question: "What milestones will trigger the next funding round?",
          answer: "Milestones for a potential next round include reaching target MRR levels, stabilizing churn, achieving predictable CAC and payback periods, and converting a defined number of enterprise pilots into annual contracts. Funding will be tied to hitting these measurable outcomes rather than to arbitrary dates, so that valuation and terms are grounded in demonstrated performance."
        },
        {
          question: "At what valuation do you expect the next round to occur?",
          answer: "Rather than fixing a valuation too early, the next round's valuation will be tied to measurable metrics such as ARR, growth rate, retention, and enterprise contract count. We aim to reach a level of traction where standard early-stage SaaS multiples (for example, 5–10× ARR depending on quality of revenue) can be justified by data, not just narrative."
        },
      ]
    },
    {
      label: 'Risk & Downside',
      faqs: [
        {
          question: "What are the biggest risks right now, and how are you mitigating them?",
          answer: "Key risks include customer acquisition cost inflation, churn, enterprise sales cycle length, and AI infrastructure cost volatility. Mitigation plans include authority-led acquisition to reduce CAC, onboarding and habit-building loops to reduce churn, a pilot-to-contract enterprise approach to manage sales cycle risk, and multi-provider routing plus usage governance to manage AI cost volatility. We explicitly track these risks and communicate them to investors along with mitigation progress."
        },
        {
          question: "What is the realistic downside scenario?",
          answer: "In the downside scenario, the product fails to achieve scalable acquisition or retention, enterprise deals take longer than expected, and revenue does not cover costs. In that case, the company may reduce burn, pivot focus toward higher-value B2B licensing, or ultimately wind down. Investors must understand that capital can be lost in early-stage investments; this is a normal risk profile and is stated clearly and professionally in the agreements."
        },
        {
          question: "What is the worst-case scenario, and what does downside protection look like?",
          answer: "In the worst-case scenario, the product does not scale, enterprise adoption is slower than expected, and investor capital may be lost. Downside protection comes from disciplined burn management, the ability to pivot toward higher-value enterprise licensing, and transparent reporting so investors can see risks early. Optional buyback mechanisms could be considered later only if the business generates sufficient cash flow; no buybacks will be promised that cannot be realistically financed."
        },
        {
          question: "What is the exit strategy?",
          answer: "There are multiple exit paths: (1) acquisition by a productivity SaaS company, AI workflow company, or enterprise software vendor; (2) licensing buyout of Brainpower AI's workflows and platform; (3) a growth round with partial liquidity for early investors; or (4) long-term profitability with ongoing distributions. The strategy focuses on achieving enterprise contracts and strong retention, as these drive acquisition interest and valuation multiples."
        },
      ]
    },
    {
      label: 'Founder & Commitment',
      faqs: [
        {
          question: "What is your personal financial commitment to Brainpower AI?",
          answer: "The founder has significant 'skin in the game.' To date, I have committed over 18 months of focused work to Brainpower AI and invested approximately OMR 10,000 of personal capital into product development, infrastructure, and initial market validation activities. Going forward, I am fully dedicated to Brainpower AI as my primary focus, and my personal reputation and future upside are directly tied to the platform's long-term success."
        },
        {
          question: "Why invest now versus waiting 6–12 months?",
          answer: "Investing now secures early participation in the capped 20% pool before scaling milestones increase pricing and terms. This round funds the next execution phase: global app distribution, retention improvements, and conversion of enterprise pilots. Waiting may reduce risk but also reduces upside and access, as later rounds are likely to be raised at higher valuations if targets are met."
        },
        {
          question: "Why are you confident you are the right founder to execute this at scale?",
          answer: "The strategy is clear and realistic: we are not trying to 'beat ChatGPT' at the model layer. We are building a vertical Decision Intelligence system that leverages foundational models, focuses on workflow embedding, and scales via global app distribution plus enterprise licensing. The plan is milestone-driven and measured (CAC, churn, retention, enterprise conversion), which is how scalable companies are built, and the founding team's background aligns with executing this plan."
        },
      ]
    },
  ];
  // Flatten for search — keep globalIndex for numbering
  const faqs = faqCategories.flatMap((cat) => cat.faqs);

  const filteredFaqs = useMemo(() => {
    const query = faqSearch.trim().toLowerCase();
    const allFaqs = faqs.map((faq, i) => ({ ...faq, originalIndex: i }));
    const byCategory = activeCategory === 'All'
      ? allFaqs
      : allFaqs.filter((_, i) => {
          let count = 0;
          for (const cat of faqCategories) {
            for (let j = 0; j < cat.faqs.length; j++) {
              if (count === i) return cat.label === activeCategory;
              count++;
            }
          }
          return false;
        });
    if (!query) return byCategory;
    return byCategory.filter(f => f.question.toLowerCase().includes(query) || f.answer.toLowerCase().includes(query));
  }, [faqSearch, activeCategory]);

  // Investor Benefits Data
  const investorBenefits = [
    {
      icon: <Brain className="h-8 w-8" />,
      title: 'Structured Intelligence',
      description: 'Thinking becomes structured. Decisions become measurable. Futures become visible.'
    },
    {
      icon: <Layers className="h-8 w-8" />,
      title: 'Multi-Layer System',
      description: 'Seven integrated intelligence engines working together as a continuous loop.'
    },
    {
      icon: <Globe className="h-8 w-8" />,
      title: 'Global Platform',
      description: 'Mobile, web, XR/VR, and enterprise deployment across multiple markets.'
    },
    {
      icon: <TrendingUp className="h-8 w-8" />,
      title: 'Compounding Intelligence',
      description: 'Every decision improves the next — intelligence compounds over time.'
    },
    {
      icon: <Target className="h-8 w-8" />,
      title: 'Category-Defining',
      description: 'Not productivity. Not automation. A new category of structured intelligence.'
    },
    {
      icon: <Rocket className="h-8 w-8" />,
      title: 'First Mover Advantage',
      description: 'The platforms that define this shift will shape the market.'
    }
  ];

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Device-scaled particle count — looks identically dense on desktop,
    // auto-reduces on mobile / low-core devices so it never janks.
    const countForDevice = () => {
      const w = window.innerWidth;
      const cores = (navigator as Navigator).hardwareConcurrency ?? 4;
      if (w < 640) return 40;
      if (w < 1024 || cores <= 4) return 60;
      return 80;
    };

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    let particles: Array<{ x: number; y: number; vx: number; vy: number; radius: number }> = [];
    const initParticles = () => {
      particles = [];
      const n = countForDevice();
      for (let i = 0; i < n; i++) {
        particles.push({ x: Math.random() * canvas.width, y: Math.random() * canvas.height, vx: (Math.random() - 0.5) * 0.5, vy: (Math.random() - 0.5) * 0.5, radius: Math.random() * 2 + 1 });
      }
    };
    initParticles();

    const drawFrame = () => {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(0, 212, 255, ${0.15 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
      for (const p of particles) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 212, 255, 0.6)';
        ctx.fill();
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
      }
    };

    // 60fps lock
    let animId = 0;
    let running = false;
    const FRAME_MS = 1000 / 60;
    let last = 0;
    const animate = (now: number) => {
      if (!running) return;
      animId = requestAnimationFrame(animate);
      if (now - last < FRAME_MS) return;
      last = now;
      drawFrame();
    };
    const start = () => {
      if (running || prefersReduced) return;
      running = true;
      last = 0;
      animId = requestAnimationFrame(animate);
    };
    const stop = () => { running = false; cancelAnimationFrame(animId); };

    // Pause when tab hidden or canvas scrolled off-screen
    let onScreen = true;
    const evaluate = () => {
      if (document.visibilityState === 'visible' && onScreen) start();
      else stop();
    };
    const io = new IntersectionObserver((entries) => {
      onScreen = entries[0]?.isIntersecting ?? true;
      evaluate();
    }, { threshold: 0 });
    io.observe(canvas);

    const onResize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; initParticles(); if (prefersReduced) drawFrame(); };
    window.addEventListener('resize', onResize);
    document.addEventListener('visibilitychange', evaluate);

    if (prefersReduced) drawFrame();
    else evaluate();

    return () => {
      stop();
      io.disconnect();
      window.removeEventListener('resize', onResize);
      document.removeEventListener('visibilitychange', evaluate);
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0b1e] text-white tabular-nums">
      <Link
        href="/"
        className="fixed top-4 right-4 z-50 inline-flex items-center gap-1.5 text-sm font-medium text-gray-300 hover:text-[#7dd3fc] transition-colors duration-200"
        title="Go to Front Page"
      >
        <span className="hidden sm:inline">Go to Front Page</span>
        <span className="sm:hidden">Home</span>
        <ArrowRight className="h-4 w-4" />
      </Link>
      {/* Block 1: Hero Section */}
      <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden px-6 pt-20 pb-10">
        <canvas ref={canvasRef} aria-hidden="true" className="absolute inset-0 z-0" style={{ opacity: 0.5 }} />
        
        <motion.div
          className="relative z-10 w-full max-w-5xl mx-auto text-center"
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          <motion.div variants={fadeInUp}>
            <Badge className="mb-6 text-sm sm:text-lg px-4 sm:px-6 py-2 whitespace-normal text-center bg-[#00d4ff]/20 text-[#00d4ff] border-[#00d4ff]/30">
              <Rocket className="h-4 w-4 mr-2" />
              Founding Participation Round
            </Badge>
          </motion.div>
          
          <motion.h1 
            className="text-5xl md:text-7xl font-bold mb-6 gradient-brand-text"
            variants={fadeInUp}
          >
            Invest in the Future of Decision Intelligence
          </motion.h1>
          
          <motion.p 
            className="text-xl md:text-2xl text-gray-300 mb-4 max-w-3xl mx-auto"
            variants={fadeInUp}
          >
            BrainPower AI is not another AI tool.
          </motion.p>
          <motion.p 
            className="text-xl md:text-2xl text-white font-semibold mb-8 max-w-3xl mx-auto"
            variants={fadeInUp}
          >
            It is the operating system for decisions and futures.
          </motion.p>
          <motion.p 
            className="text-lg text-gray-400 mb-8 max-w-3xl mx-auto"
            variants={fadeInUp}
          >
            BrainPower AI is building a new category of AI focused on improving how decisions are made in complex, high-uncertainty environments.
          </motion.p>

          {/* Hero Image */}
          <motion.div variants={fadeInUp} className="mb-10 rounded-2xl overflow-hidden shadow-2xl mx-auto max-w-3xl" style={{ boxShadow: '0 0 60px rgba(0, 212, 255, 0.2), 0 0 120px rgba(178, 75, 243, 0.1)' }}>
            <img src={ROBOT_FEMALE_URL} alt="BrainPower AI" className="w-full h-auto object-cover" />
          </motion.div>
          
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center"
            variants={fadeInUp}
          >
            <Button size="lg" className="text-lg px-8 py-6 text-black font-semibold btn-glow-cyan" style={{ background: 'linear-gradient(135deg, #00d4ff, #0099cc)' }} asChild>
              <Link href="/register">
                Create Investor Account
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-[#b24bf3] text-[#b24bf3] hover:bg-[#b24bf3]/10 btn-glow-purple" asChild>
              <Link href="#investment-tiers">
                <Briefcase className="mr-2 h-5 w-5" />
                View Investment Opportunities
              </Link>
            </Button>
          </motion.div>
        </motion.div>

        <motion.div
          className="absolute bottom-10 left-1/2 transform -translate-x-1/2 z-10"
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <ChevronDown className="h-8 w-8 text-[#00d4ff]" />
        </motion.div>
      </section>

      {/* ── Platform Overview: The Operating System for Decisions and Futures ── */}
      <section className="py-24 px-6 bg-[#07081a] border-t border-white/5 overflow-hidden">
        <div className="max-w-7xl mx-auto">

          {/* ── Category headline ── */}
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}
            className="text-center mb-20"
          >
            <motion.p variants={fadeInUp} className="text-[#00d4ff] text-sm font-semibold tracking-[0.25em] uppercase mb-4">
              Platform Overview
            </motion.p>
            <motion.h2
              variants={fadeInUp}
              className="text-4xl md:text-6xl font-bold mb-6 gradient-brand-tri-text"
            >
              The Operating System for<br />Decisions and Futures
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed mb-4">
              A cognitive intelligence platform that combines structured reasoning, simulation, and semi-3D visual environments.
            </motion.p>
            <motion.p variants={fadeInUp} className="text-lg text-gray-400 max-w-3xl mx-auto leading-relaxed">
              BrainPower AI helps individuals and organizations structure complex decisions, simulate multiple future outcomes, visualize decisions in an interactive spatial layer, understand risks and trade-offs, and improve decision-making over time.
            </motion.p>
          </motion.div>

          {/* ── What it is NOT strip ── */}
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}
            className="mb-20"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              {[
                "It is not a chatbot.",
                "It is not a productivity tool.",
                "It is not another AI assistant.",
              ].map((text) => (
                <motion.div key={text} variants={fadeInUp}
                  className="flex items-center gap-3 bg-red-500/5 border border-red-500/20 rounded-xl px-5 py-4"
                >
                  <X className="w-5 h-5 text-red-400 shrink-0" />
                  <span className="text-gray-300 font-medium">{text}</span>
                </motion.div>
              ))}
            </div>
            <motion.div variants={fadeInUp}
              className="bg-gradient-to-r from-[#00d4ff]/10 to-[#b24bf3]/10 border border-[#00d4ff]/20 rounded-2xl px-8 py-6 text-center"
            >
              <p className="text-white text-xl font-semibold">
                BrainPower AI is a{" "}
                <span className="bg-gradient-to-r from-[#00d4ff] to-[#b24bf3] bg-clip-text text-transparent">
                  structured intelligence system
                </span>
                {" "}built to think, simulate, and guide decisions with measurable outcomes.
              </p>
            </motion.div>
          </motion.div>

          {/* ── Core Concept ── */}
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}
            className="mb-20"
          >
            <motion.div variants={fadeInUp} className="text-center mb-10">
              <span className="inline-flex items-center gap-2 text-[#00d4ff] text-sm font-semibold tracking-widest uppercase">
                <Rocket className="w-4 h-4" /> Core Concept
              </span>
              <h2 className="text-3xl font-bold text-white mt-3">From Information to Decisions</h2>
              <p className="text-gray-400 mt-3 max-w-2xl mx-auto">
                Traditional AI provides answers. BrainPower AI focuses on decisions.
              </p>
            </motion.div>
            <div className="grid md:grid-cols-5 gap-4">
              {[
                { label: "Decisions structured", desc: "with clarity" },
                { label: "Strategies compared", desc: "objectively" },
                { label: "Outcomes simulated", desc: "before execution" },
                { label: "Risks & opportunities", desc: "made visible" },
                { label: "Intelligence improves", desc: "over time" },
              ].map((item, i) => (
                <motion.div key={i} variants={fadeInUp}
                  className="bg-white/5 border border-white/10 rounded-xl p-5 text-center hover:border-[#00d4ff]/40 hover:bg-[#00d4ff]/5 transition-all"
                >
                  <div className="text-3xl font-bold text-[#00d4ff] mb-2">{String(i + 1).padStart(2, '0')}</div>
                  <p className="text-white font-semibold text-sm mb-1">{item.label}</p>
                  <p className="text-gray-500 text-xs">{item.desc}</p>
                </motion.div>
              ))}
            </div>
            <motion.p variants={fadeInUp} className="text-center text-gray-400 mt-6 text-lg">
              This transforms AI from a reactive tool into a{" "}
              <span className="text-[#b24bf3] font-semibold">proactive decision partner</span>.
            </motion.p>
          </motion.div>

          {/* ── Platform Architecture Overview ── */}
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}
            className="mb-20"
          >
            <motion.div variants={fadeInUp} className="text-center mb-10">
              <span className="inline-flex items-center gap-2 text-[#00d4ff] text-sm font-semibold tracking-widest uppercase">
                <Layers className="w-4 h-4" /> Platform Architecture Overview
              </span>
              <h2 className="text-3xl font-bold text-white mt-3">A Multi-Layer Decision Intelligence System</h2>
              <p className="text-gray-400 mt-3 max-w-2xl mx-auto">
                BrainPower AI integrates multiple capabilities into one system, combining seven layers that work together to deliver clarity, foresight, and confidence in decision-making.
              </p>
            </motion.div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
              {[
                { label: "Structured Reasoning" },
                { label: "Scenario Simulation" },
                { label: "Semi-3D Visual Decision Mapping" },
                { label: "Strategic Memory" },
                { label: "Decision Tracking" },
                { label: "Learning & Feedback Systems" },
                { label: "Enterprise-Level Analysis" },
              ].map((item, i) => (
                <motion.div key={i} variants={fadeInUp}
                  className="flex flex-col items-center text-center bg-white/5 border border-white/10 rounded-xl p-4 hover:border-[#00d4ff]/30 hover:bg-[#00d4ff]/5 transition-all"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#00d4ff] to-[#b24bf3] flex items-center justify-center text-black font-bold text-xs mb-2">
                    {i + 1}
                  </div>
                  <p className="text-gray-300 text-xs font-medium leading-tight">{item.label}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* ── 8 Core Systems ── */}
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}
            className="mb-20"
          >
            <motion.div variants={fadeInUp} className="text-center mb-10">
              <span className="inline-flex items-center gap-2 text-[#00d4ff] text-sm font-semibold tracking-widest uppercase">
                <Layers className="w-4 h-4" /> Core Systems
              </span>
              <h2 className="text-3xl font-bold text-white mt-3">8 Integrated Intelligence Engines</h2>
              <p className="text-gray-400 mt-2">Multi-layer cognitive architecture delivering clarity, foresight, and confidence.</p>
            </motion.div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
              {[
                {
                  icon: Brain,
                  color: "#00d4ff",
                  bg: "rgba(0,212,255,0.08)",
                  name: "Strategic Command (War Room)",
                  subtitle: "Decision Engine",
                  desc: "Break down complex decisions, compare strategies, and evaluate trade-offs using structured frameworks.",
                },
                {
                  icon: Eye,
                  color: "#b24bf3",
                  bg: "rgba(178,75,243,0.08)",
                  name: "Futures Engine",
                  subtitle: "Outcome Intelligence",
                  desc: "Simulate multiple possible outcomes and understand how decisions evolve under different conditions.",
                },
                {
                  icon: Globe,
                  color: "#00d4ff",
                  bg: "rgba(0,212,255,0.08)",
                  name: "Futurescape",
                  subtitle: "Semi-3D Visual Simulation",
                  desc: "A core layer where decisions are transformed into interactive visual experiences. Decisions become navigable pathways, risks appear as zones, opportunities as nodes, and timelines unfold spatially — letting users see and explore future outcomes before deciding.",
                },
                {
                  icon: Clock,
                  color: "#b24bf3",
                  bg: "rgba(178,75,243,0.08)",
                  name: "Strategic Memory",
                  subtitle: "Long-Term Intelligence",
                  desc: "Maintain continuity by storing goals, constraints, and decision history to guide future actions.",
                },
                {
                  icon: Network,
                  color: "#00d4ff",
                  bg: "rgba(0,212,255,0.08)",
                  name: "Decision Intelligence Graph",
                  subtitle: "DIG — Cognitive Backbone",
                  desc: "Connect decisions, strategies, and outcomes into a structured system of insight and pattern recognition.",
                },
                {
                  icon: TrendingUp,
                  color: "#b24bf3",
                  bg: "rgba(178,75,243,0.08)",
                  name: "Judgment Improvement Engine",
                  subtitle: "JIE — Learning System",
                  desc: "Track decision accuracy over time and improve judgment through feedback and learning.",
                },
                {
                  icon: Users,
                  color: "#00d4ff",
                  bg: "rgba(0,212,255,0.08)",
                  name: "Collective Intelligence Engine",
                  subtitle: "CIE — Global Signals",
                  desc: "Leverage aggregated patterns to identify trends, risks, and emerging opportunities.",
                },
                {
                  icon: Building2,
                  color: "#b24bf3",
                  bg: "rgba(178,75,243,0.08)",
                  name: "Strategic Advisory Engine",
                  subtitle: "SAE — Enterprise Depth",
                  desc: "Apply structured frameworks such as SWOT, PESTLE, scenario planning, and strategic analysis.",
                },
              ].map((sys) => (
                <motion.div key={sys.name} variants={fadeInUp}
                  className="group rounded-2xl border border-white/10 p-6 hover:border-white/25 transition-all duration-300"
                  style={{ background: sys.bg }}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg" style={{ background: `${sys.color}20` }}>
                      <sys.icon className="w-5 h-5" style={{ color: sys.color }} />
                    </div>
                    <div>
                      <p className="text-white font-bold text-sm leading-tight">{sys.name}</p>
                      <p className="text-xs" style={{ color: sys.color }}>{sys.subtitle}</p>
                    </div>
                  </div>
                  <p className="text-gray-400 text-sm leading-relaxed">{sys.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* ── Continuous Intelligence Loop ── */}
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}
            className="mb-20"
          >
            <motion.div variants={fadeInUp} className="text-center mb-10">
              <span className="inline-flex items-center gap-2 text-[#00d4ff] text-sm font-semibold tracking-widest uppercase">
                <RefreshCw className="w-4 h-4" /> Continuous Intelligence Loop
              </span>
              <h2 className="text-3xl font-bold text-white mt-3">Compounding Intelligence Over Time</h2>
            </motion.div>
            <div className="relative">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                {[
                  { step: "1", label: "Decision Structured", system: "Strategic Command", color: "#00d4ff" },
                  { step: "2", label: "Futures Simulated", system: "Futures Engine", color: "#b24bf3" },
                  { step: "3", label: "Outcomes Visualized in Semi-3D", system: "Futurescape", color: "#00d4ff" },
                  { step: "4", label: "Results Evaluated", system: "JIE", color: "#b24bf3" },
                  { step: "5", label: "Patterns Learned", system: "DIG + CIE", color: "#00d4ff" },
                  { step: "6", label: "Future Decisions Improve", system: "Automatically", color: "#b24bf3" },
                ].map((item, i) => (
                  <motion.div key={i} variants={fadeInUp}
                    className="relative flex flex-col items-center text-center p-4 rounded-xl bg-white/5 border border-white/10"
                  >
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-black font-bold text-sm mb-3"
                      style={{ background: `linear-gradient(135deg, ${item.color}, ${i % 2 === 0 ? '#b24bf3' : '#00d4ff'})` }}
                    >
                      {item.step}
                    </div>
                    <p className="text-white font-semibold text-sm mb-1">{item.label}</p>
                    <p className="text-xs" style={{ color: item.color }}>{item.system}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* ── Key Differentiators ── */}
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}
            className="mb-20"
          >
            <motion.div variants={fadeInUp} className="text-center mb-10">
              <span className="inline-flex items-center gap-2 text-[#00d4ff] text-sm font-semibold tracking-widest uppercase">
                <GitBranch className="w-4 h-4" /> Key Differentiators
              </span>
              <h2 className="text-3xl font-bold text-white mt-3">Fundamentally Different from General AI</h2>
            </motion.div>
            <div className="rounded-2xl border border-white/10">
              <table className="w-full table-fixed text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-white/10 bg-white/5">
                    <th className="text-left align-top px-3 sm:px-6 py-4 text-gray-400 font-semibold break-words w-[28%]">Capability</th>
                    <th className="align-top px-3 sm:px-6 py-4 text-gray-400 font-semibold text-center break-words">General AI Tools</th>
                    <th className="align-top px-3 sm:px-6 py-4 font-semibold text-center break-words" style={{ color: '#00d4ff' }}>BrainPower AI</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["Structured Reasoning", "Free-form answers", "Structured decision frameworks"],
                    ["Outcome Simulation", "Not available", "Explore futures before acting"],
                    ["Persistent Memory", "Session-only", "Continuity across all decisions"],
                    ["Visual Intelligence", "Text output only", "Spatial, interactive strategy maps"],
                    ["Learning System", "Static", "Improves your judgment over time"],
                    ["Intelligence Graph", "Isolated responses", "Connected decision network"],
                    ["Enterprise Depth", "Generic answers", "SWOT, PESTLE, scenario planning"],
                  ].map(([cap, general, bp], i) => (
                    <tr key={i} className={`border-b border-white/5 ${i % 2 === 0 ? 'bg-white/[0.02]' : ''} hover:bg-white/5 transition-colors`}>
                      <td className="px-3 sm:px-6 py-4 align-top text-white font-medium break-words">{cap}</td>
                      <td className="px-3 sm:px-6 py-4 align-top text-center">
                        <span className="inline-flex items-start gap-1.5 text-red-400 text-left break-words">
                          <X className="w-3.5 h-3.5 mt-0.5 shrink-0" />{general}
                        </span>
                      </td>
                      <td className="px-3 sm:px-6 py-4 align-top text-center">
                        <span className="inline-flex items-start gap-1.5 text-green-400 text-left break-words">
                          <CheckCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />{bp}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* ── Use Cases ── */}
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}
            className="mb-20"
          >
            <motion.div variants={fadeInUp} className="text-center mb-10">
              <span className="inline-flex items-center gap-2 text-[#00d4ff] text-sm font-semibold tracking-widest uppercase">
                <Target className="w-4 h-4" /> Use Cases
              </span>
              <h3 className="text-3xl font-bold text-white mt-3">Applicable Across Every Decision Context</h3>
            </motion.div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
              {[
                {
                  icon: Users,
                  color: "#00d4ff",
                  audience: "Individuals",
                  cases: ["Career decisions", "Financial planning", "Personal strategy"],
                },
                {
                  icon: Rocket,
                  color: "#b24bf3",
                  audience: "Entrepreneurs",
                  cases: ["Startup strategy", "Product decisions", "Market entry"],
                },
                {
                  icon: Briefcase,
                  color: "#00d4ff",
                  audience: "Businesses",
                  cases: ["Growth strategy", "Operations", "Investment decisions"],
                },
                {
                  icon: Building2,
                  color: "#b24bf3",
                  audience: "Enterprises & Governments",
                  cases: ["Policy planning", "Large-scale strategy", "Risk modeling"],
                },
              ].map((uc) => (
                <motion.div key={uc.audience} variants={fadeInUp}
                  className="rounded-2xl border border-white/10 p-6 hover:border-white/25 transition-all bg-white/[0.03]"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2.5 rounded-xl" style={{ background: `${uc.color}15` }}>
                      <uc.icon className="w-5 h-5" style={{ color: uc.color }} />
                    </div>
                    <p className="text-white font-bold">{uc.audience}</p>
                  </div>
                  <ul className="space-y-2">
                    {uc.cases.map((c) => (
                      <li key={c} className="flex items-center gap-2 text-gray-400 text-sm">
                        <CheckCircle className="w-3.5 h-3.5 shrink-0" style={{ color: uc.color }} />
                        {c}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* ── Platform Availability ── */}
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}
            className="mb-20"
          >
            <motion.div variants={fadeInUp} className="text-center mb-8">
              <span className="inline-flex items-center gap-2 text-[#00d4ff] text-sm font-semibold tracking-widest uppercase">
                <Smartphone className="w-4 h-4" /> Platform Availability
              </span>
            </motion.div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {[
                { label: "iOS", desc: "Mobile-first", available: true },
                { label: "Android", desc: "Mobile", available: true },
                { label: "WebApp", desc: "Deep analysis", available: true },
                { label: "XR / VR", desc: "Simulation", available: false },
                { label: "Enterprise", desc: "Deployment", available: false },
                { label: "Team Collab", desc: "Systems", available: false },
              ].map((p) => (
                <motion.div key={p.label} variants={fadeInUp}
                  className={`rounded-xl border p-4 text-center ${
                    p.available
                      ? 'border-[#00d4ff]/30 bg-[#00d4ff]/5'
                      : 'border-white/10 bg-white/[0.02] opacity-60'
                  }`}
                >
                  <p className="text-white font-bold text-sm">{p.label}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{p.desc}</p>
                  <Badge className={`mt-2 text-xs ${
                    p.available
                      ? 'bg-[#00d4ff]/20 text-[#00d4ff] border-[#00d4ff]/30'
                      : 'bg-white/5 text-gray-500 border-white/10'
                  }`}>
                    {p.available ? 'Available' : 'Coming Soon'}
                  </Badge>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* ── Final Positioning ── */}
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}
          >
            <motion.div variants={fadeInUp}
              className="relative rounded-3xl overflow-hidden border border-[#00d4ff]/20 p-10 md:p-16 text-center"
              style={{ background: 'linear-gradient(135deg, rgba(0,212,255,0.07) 0%, rgba(178,75,243,0.07) 100%)' }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#00d4ff]/5 to-[#b24bf3]/5" />
              <div className="relative z-10">
                <p className="text-[#00d4ff] text-sm font-semibold tracking-widest uppercase mb-4">Final Positioning</p>
                <h3 className="text-3xl md:text-5xl font-bold text-white mb-6">
                  BrainPower AI is not competing<br />with traditional AI tools.
                </h3>
                <p className="text-xl text-gray-300 mb-4">It defines a new category:</p>
                <p className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-[#00d4ff] to-[#b24bf3] bg-clip-text text-transparent mb-10">
                  The Operating System for Decisions and Futures
                </p>
                <div className="grid md:grid-cols-3 gap-6 mb-10">
                  {[
                    { label: "Thinking becomes", value: "Structured" },
                    { label: "Decisions become", value: "Measurable" },
                    { label: "Futures become", value: "Visible" },
                  ].map((item) => (
                    <div key={item.label} className="bg-white/5 rounded-xl p-5 border border-white/10">
                      <p className="text-gray-400 text-sm mb-1">{item.label}</p>
                      <p className="text-white text-xl font-bold">{item.value}</p>
                    </div>
                  ))}
                </div>
                <p className="text-gray-300 text-lg max-w-2xl mx-auto">
                  BrainPower AI transforms how humans interact with uncertainty. Instead of reacting to the future, users can now{" "}
                  <span className="text-white font-semibold">see it, explore it, and choose it — before it happens.</span>
                </p>
              </div>
            </motion.div>
          </motion.div>

        </div>
      </section>

      {/* Customer Use Case */}
      <section className="py-24 px-6 bg-[#07081a] border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="text-center mb-14">
            <motion.span variants={fadeInUp} className="inline-flex items-center gap-2 text-[#00d4ff] text-sm font-semibold tracking-widest uppercase">
              <Target className="w-4 h-4" /> Customer Use Case
            </motion.span>
            <motion.h2 variants={fadeInUp} className="text-3xl md:text-4xl font-bold text-white mt-3 mb-4">
              Enterprise Market Expansion
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-gray-400 max-w-2xl mx-auto">
              An enterprise expanding into 3 new markets — no clarity on which to prioritize.
            </motion.p>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="space-y-10">
            {/* Phase table */}
            <motion.div variants={fadeInUp} className="rounded-2xl border border-white/10">
              <table className="w-full table-fixed text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-white/10" style={{ background: "rgba(0,212,255,0.06)" }}>
                    <th className="text-left align-top py-3 px-3 sm:px-5 text-[#00d4ff] font-semibold break-words w-[22%]">Phase</th>
                    <th className="text-left align-top py-3 px-3 sm:px-5 text-gray-400 font-medium break-words">Traditional Approach</th>
                    <th className="text-left align-top py-3 px-3 sm:px-5 text-[#b24bf3] font-semibold break-words">With BrainPower AI</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["Analysis", "Manual research, consultants, weeks of reports", "Structured decision framework built in minutes"],
                    ["Evaluation", "Gut feel + spreadsheets", "Simulated outcomes across multiple scenarios"],
                    ["Visibility", "No view of consequences", "Semi-3D Futurescape shows risk zones & opportunities"],
                    ["Result", "Delayed, uncertain decisions", "Faster, clearer, lower-risk market entry"],
                  ].map(([phase, trad, bp], i) => (
                    <tr key={phase} className="border-b border-white/5" style={{ backgroundColor: i % 2 === 0 ? "rgba(255,255,255,0.02)" : "transparent" }}>
                      <td className="py-3 px-3 sm:px-5 align-top text-white font-medium break-words">{phase}</td>
                      <td className="py-3 px-3 sm:px-5 align-top text-gray-300 break-words">{trad}</td>
                      <td className="py-3 px-3 sm:px-5 align-top text-gray-200 break-words">{bp}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </motion.div>

            <motion.p variants={fadeInUp} className="text-center text-[#00d4ff] font-semibold text-base">
              👉 From weeks of guesswork → to structured, simulated clarity
            </motion.p>

            {/* Stage table */}
            <motion.div variants={fadeInUp} className="rounded-2xl border border-white/10">
              <table className="w-full table-fixed text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-white/10" style={{ background: "rgba(178,75,243,0.06)" }}>
                    <th className="text-left align-top py-3 px-3 sm:px-5 text-[#b24bf3] font-semibold break-words w-[22%]">Stage</th>
                    <th className="text-left align-top py-3 px-3 sm:px-5 text-gray-400 font-medium break-words">Without BrainPower AI</th>
                    <th className="text-left align-top py-3 px-3 sm:px-5 text-[#b24bf3] font-semibold break-words">With BrainPower AI</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["Challenge", "Enterprise expanding into 3 new markets — no clarity on which to prioritize", "Same challenge — structured through BrainPower AI"],
                    ["Process", "Manual analysis, conflicting opinions, delayed decision", "Decision structured → scenarios simulated → risks mapped"],
                    ["Outcome", "6-month delay, wrong market entered first", "Optimal market identified in days, risks pre-mapped"],
                    ["Impact", "$2M+ in wasted resources", "Resources allocated to highest-probability path"],
                  ].map(([stage, without, with_], i) => (
                    <tr key={stage} className="border-b border-white/5" style={{ backgroundColor: i % 2 === 0 ? "rgba(255,255,255,0.02)" : "transparent" }}>
                      <td className="py-3 px-3 sm:px-5 align-top text-white font-medium break-words">{stage}</td>
                      <td className="py-3 px-3 sm:px-5 align-top text-gray-300 break-words">{without}</td>
                      <td className="py-3 px-3 sm:px-5 align-top text-gray-200 break-words">{with_}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </motion.div>

            {/* BrainPower vs others table */}
            <motion.div variants={fadeInUp} className="mt-12">
              <div className="text-center mb-6">
                <p className="text-gray-400 text-sm italic mb-1">"Show me it actually works."</p>
                <h3 className="text-2xl font-bold text-white">Why BrainPower AI — Not Just Another AI Tool</h3>
                <p className="text-gray-400 mt-2 text-sm">"Why not just use ChatGPT?"</p>
              </div>
              <div className="rounded-2xl border border-white/10">
                <table className="w-full table-fixed text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b border-white/10" style={{ background: "rgba(0,212,255,0.06)" }}>
                      <th className="text-left align-top py-3 px-2 sm:px-5 text-gray-400 font-medium break-words w-[24%]">Capability</th>
                      <th className="text-center align-top py-3 px-2 sm:px-5 text-gray-400 font-medium break-words">Traditional Analysis</th>
                      <th className="text-center align-top py-3 px-2 sm:px-5 text-gray-400 font-medium break-words">Generative AI (ChatGPT)</th>
                      <th className="text-center align-top py-3 px-2 sm:px-5 text-[#00d4ff] font-semibold break-words">BrainPower AI</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ["Decision Structuring", "Manual frameworks", "No structure", "Automated structuring"],
                      ["Outcome Simulation", "None", "None", "Multi-scenario simulation"],
                      ["Risk Visualization", "Spreadsheets", "Text-based", "Semi-3D Futurescape"],
                      ["Continuity", "One-off reports", "No memory", "Persistent intelligence graph"],
                      ["Actionability", "Recommendations", "Answers", "Navigable decision pathways"],
                    ].map(([cap, trad, gpt, bp], i) => (
                      <tr key={cap} className="border-b border-white/5" style={{ backgroundColor: i % 2 === 0 ? "rgba(255,255,255,0.02)" : "transparent" }}>
                        <td className="py-3 px-2 sm:px-5 align-top text-white font-medium break-words">{cap}</td>
                        <td className="py-3 px-2 sm:px-5 align-top text-center text-gray-300 break-words">{trad}</td>
                        <td className="py-3 px-2 sm:px-5 align-top text-center text-gray-300 break-words">{gpt}</td>
                        <td className="py-3 px-2 sm:px-5 align-top text-center text-white font-semibold break-words">{bp}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Block 2: The Opportunity */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.h2 
              className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-[#00d4ff] to-[#b24bf3] bg-clip-text text-transparent"
              variants={fadeInUp}
            >
              Core Differentiation
            </motion.h2>
            <motion.p 
              className="text-xl text-gray-400 max-w-3xl mx-auto"
              variants={fadeInUp}
            >
              BrainPower AI does not compete with traditional AI tools. It replaces fragmented decision-making processes with a unified system.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid md:grid-cols-2 gap-8"
          >
            <motion.div variants={fadeInUp}>
              <Card className="h-full">
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <Globe className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl mb-2">A New Category</CardTitle>
                      <CardDescription className="text-base">
                        BrainPower AI defines a new category. Not productivity. Not automation. But structured intelligence — where thinking becomes structured, decisions become measurable, and futures become visible.
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Card className="h-full">
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-purple-500/10 rounded-lg">
                      <Zap className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl mb-2">Structure Over Outputs</CardTitle>
                      <CardDescription className="text-base">
                        While others provide outputs, BrainPower AI provides structure. While others respond, BrainPower AI guides. The intelligence loop creates compounding intelligence over time.
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Card className="h-full">
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-green-500/10 rounded-lg">
                      <TrendingUp className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl mb-2">Cross-Domain Use Cases</CardTitle>
                      <CardDescription className="text-base">
                        From personal decision-making to enterprise and government-level planning — applicable across entrepreneurship, business strategy, operations, and institutional environments.
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Card className="h-full">
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-blue-500/10 rounded-lg">
                      <Award className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl mb-2">Multi-Platform Expansion</CardTitle>
                      <CardDescription className="text-base">
                        Available across mobile (iOS/Android), web application, XR/VR simulation environments (upcoming), and enterprise deployment systems.
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Block 3: Investment Tiers */}
      <section id="investment-tiers" className="py-24 px-6 bg-[#0a0b1e] border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.h2 
              className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-[#00d4ff] to-[#b24bf3] bg-clip-text text-transparent"
              variants={fadeInUp}
            >
              Investment Opportunity
            </motion.h2>
            <motion.p 
              className="text-xl text-gray-400 max-w-3xl mx-auto"
              variants={fadeInUp}
            >
              Founding Participation Round — raising $1,000,000–$3,000,000 USD for up to 20% economic participation in BrainPower AI, funding global app launches and enterprise scaling, targeting $15M ARR within 5 years.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {investmentTiers.map((tier) => (
              <motion.div
                key={tier.band}
                variants={fadeInUp}
                whileHover={{ scale: 1.02, y: -5 }}
                transition={{ duration: 0.2 }}
              >
                <Card className={`h-full bg-[#0d0e24] border-white/10 text-white card-glow-cyan ${tier.isPopular ? 'ring-2 ring-[#00d4ff] shadow-2xl shadow-[#00d4ff]/20' : ''}`}>
                  <CardHeader>
                    {tier.isPopular && (
                      <Badge className="w-fit mb-4">
                        <Star className="h-3 w-3 mr-1" />
                        Most Popular
                      </Badge>
                    )}
                    <div className="flex items-baseline gap-2 mb-2">
                      <span className="text-4xl font-bold">Band {tier.band}</span>
                      <span className="text-lg text-muted-foreground">{tier.name}</span>
                    </div>
                    <div className="text-xl sm:text-2xl font-bold text-[#00d4ff] mb-4 leading-tight break-words">
                      {tier.minInvestment}
                    </div>
                    <CardDescription className="text-base">
                      {tier.intendedFor}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm font-semibold mb-1">Instrument</p>
                      <p className="text-sm text-muted-foreground">{tier.instrument}</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold mb-1">Timeline</p>
                      <p className="text-sm text-muted-foreground">{tier.timeHorizon}</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold mb-1">Information Rights</p>
                      <p className="text-sm text-[#00d4ff] font-bold">{tier.informationRights}</p>
                    </div>
                    <Separator />
                    <div>
                      <p className="text-sm font-semibold mb-2">Benefits</p>
                      <ul className="space-y-2">
                        {tier.benefits.map((benefit, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm">
                            <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                            <span>{benefit}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <Button className="w-full mt-4" asChild>
                      <Link href="/register">
                        Get Started
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Neon Female AI Section */}
      <section className="py-20 px-6 bg-[#0d0e24] border-t border-white/5">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-12">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex-1 text-center md:text-left"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6 bg-gradient-to-r from-[#00d4ff] to-[#b24bf3] bg-clip-text text-transparent">
              The Intelligence Loop
            </h2>
            <p className="text-gray-300 text-lg leading-relaxed mb-6">
              Decision → Simulation → Visualization → Tracking → Learning → Improvement
            </p>
            <p className="text-gray-400 leading-relaxed">
              These layers work together as a continuous intelligence loop where every decision improves the next. This creates compounding intelligence over time.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex-1 flex justify-center"
          >
            <img
              src={NEON_FEMALE_URL}
              alt="BrainPower AI Neural Intelligence"
              className="w-full max-w-xs drop-shadow-2xl"
              style={{ filter: 'drop-shadow(0 0 30px rgba(178, 75, 243, 0.5))' }}
            />
          </motion.div>
        </div>
      </section>

      {/* Block 4: Use of Funds */}
      <section className="py-24 px-6 bg-[#0a0b1e] border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.h2 
              className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-[#00d4ff] to-[#b24bf3] bg-clip-text text-transparent"
              variants={fadeInUp}
            >
              Use of Funds
            </motion.h2>
            <motion.p 
              className="text-xl text-gray-400 max-w-3xl mx-auto"
              variants={fadeInUp}
            >
              Strategic allocation designed for sustainable growth and market leadership
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid md:grid-cols-2 gap-8"
          >
            {[
              { name: 'Product Development', value: 35, description: 'Core intelligence system and platform architecture.' },
              { name: 'Global Marketing and Growth', value: 30, description: 'Global app launches, user acquisition, and demand generation.' },
              { name: 'Infrastructure and AI Costs', value: 15, description: 'Cloud infrastructure, AI/API compute, and scalability.' },
              { name: 'Operations and Support', value: 10, description: 'Day-to-day operations and customer support.' },
              { name: 'Legal and Compliance', value: 5, description: 'Legal, regulatory, and compliance.' },
              { name: 'Reserve Buffer', value: 5, description: 'Contingency reserve for flexibility.' }
            ].map((item) => (
              <motion.div key={item.name} variants={fadeInUp}>
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <CardTitle className="text-xl">{item.name}</CardTitle>
                      <Badge variant="outline" className="text-lg">
                        {item.value}%
                      </Badge>
                    </div>
                    <CardDescription className="text-base">
                      {item.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Block 5: Traction & Milestones */}
      <section className="py-24 px-6 bg-[#0a0b1e] border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.h2 
              className="text-4xl md:text-5xl font-bold mb-6 text-white"
              variants={fadeInUp}
            >
              {/* Was "Traction & Growth / Strong early indicators demonstrating
                * clear demand". There is no traction to report — the FAQ lower
                * on this same page states zero paying users and zero MRR — and
                * "clear demand" was not measured. The section now describes the
                * engine, which is what actually exists and can be checked. */}
              Engine Verification
            </motion.h2>
            <motion.p
              className="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto"
              variants={fadeInUp}
            >
              What the system computes, and how that is held to account
            </motion.p>
          </motion.div>

          {/* Key Metrics */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16"
          >
            {[
              { label: 'Simulations Per Decision', value: '10,000', icon: <TrendingUp className="h-8 w-8" /> },
              { label: 'Probability Distributions', value: '8', icon: <TrendingUp className="h-8 w-8" /> },
              { label: 'Advisory Frameworks', value: '10', icon: <Users className="h-8 w-8" /> },
              { label: 'Deterministic Output', value: '100%', icon: <Award className="h-8 w-8" /> }
            ].map((metric) => (
              <motion.div key={metric.label} variants={fadeInUp}>
                <Card className="text-center">
                  <CardHeader>
                    <div className="flex justify-center mb-4 text-primary">
                      {metric.icon}
                    </div>
                    <CardTitle className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 break-words">
                      {metric.value}
                    </CardTitle>
                    <CardDescription className="text-base">
                      {metric.label}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          {/* Timeline */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="relative max-w-4xl mx-auto"
          >
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-border hidden md:block" />
            
            <div className="space-y-12">
              {milestones.map((milestone, index) => (
                <motion.div
                  key={index}
                  variants={fadeInUp}
                  className={`flex items-center gap-8 ${
                    index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                  } flex-col`}
                >
                  <div className={`w-full md:flex-1 min-w-0 ${index % 2 === 0 ? 'md:text-right' : 'md:text-left'} text-center md:text-inherit`}>
                    <Card>
                      <CardHeader>
                        <div className="flex items-center gap-2 mb-2 justify-center md:justify-start">
                          {milestone.status === 'completed' && (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          )}
                          {milestone.status === 'in-progress' && (
                            <Clock className="h-5 w-5 text-blue-600" />
                          )}
                          {milestone.status === 'upcoming' && (
                            <Clock className="h-5 w-5 text-muted-foreground" />
                          )}
                          <Badge variant="outline">{milestone.date}</Badge>
                        </div>
                        <CardTitle className="text-xl">{milestone.title}</CardTitle>
                        <CardDescription className="text-base">
                          {milestone.description}
                        </CardDescription>
                      </CardHeader>
                    </Card>
                  </div>
                  
                  <div className="relative z-10 hidden md:block">
                    <div className={`w-4 h-4 rounded-full ${
                      milestone.status === 'completed' ? 'bg-green-600' :
                      milestone.status === 'in-progress' ? 'bg-blue-600' :
                      'bg-muted-foreground'
                    }`} />
                  </div>
                  
                  <div className="flex-1 hidden md:block" />
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>      {/* Block 2: Why Invest */}
      <section className="py-24 px-6 bg-[#0d0e24] border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.h2 
              className="text-4xl md:text-5xl font-bold mb-6"
              variants={fadeInUp}
            >
              Market Position
            </motion.h2>
            <motion.p 
              className="text-xl text-muted-foreground max-w-3xl mx-auto"
              variants={fadeInUp}
            >
              The AI market is growing rapidly. The shift is clear: from tools to systems, from outputs to structured intelligence.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {teamMembers.map((member) => (
              <motion.div key={member.name} variants={fadeInUp}>
                <Card className="h-full">
                  <CardHeader>
                    <div className="w-full aspect-video rounded-lg mb-4 overflow-hidden border border-white/10">
                      <img src={member.image} alt={member.name} loading="lazy" decoding="async" className="w-full h-full object-cover" />
                    </div>
                    <CardTitle className="text-xl">{member.name}</CardTitle>
                    <CardDescription className="text-sm font-semibold text-primary mb-3">
                      {member.title}
                    </CardDescription>
                    <CardDescription className="text-sm">
                      {member.bio}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Block 7: Market Analysis */}
      <section className="py-24 px-6 bg-[#0d0e24] border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.h2 
              className="text-4xl md:text-5xl font-bold mb-6 text-white"
              variants={fadeInUp}
            >
              Why Invest Now
            </motion.h2>
            <motion.p 
              className="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto"
              variants={fadeInUp}
            >
              The transition from fragmented tools to unified intelligence systems has already begun
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid md:grid-cols-3 gap-8"
          >
            <motion.div variants={fadeInUp}>
              <Card className="h-full">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <Globe className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-2xl">Category-Defining System</CardTitle>
                  </div>
                  <div className="text-4xl font-bold text-primary mb-4">
                    First Mover
                  </div>
                  <CardDescription className="text-base">
                    BrainPower AI is not competing in the current AI landscape. It is defining what comes next. The platforms that define this shift will shape the market.
                  </CardDescription>
                </CardHeader>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Card className="h-full">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-purple-500/10 rounded-lg">
                      <Shield className="h-6 w-6 text-purple-600" />
                    </div>
                    <CardTitle className="text-2xl">Investment in a System</CardTitle>
                  </div>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">This is not an investment in a tool</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">It is an investment in a category-defining system</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">Structured participation through tiered investment bands</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">Designed to align early investors with long-term growth</span>
                    </li>
                  </ul>
                </CardHeader>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Card className="h-full">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-green-500/10 rounded-lg">
                      <TrendingUp className="h-6 w-6 text-green-600" />
                    </div>
                    <CardTitle className="text-2xl">The Shift Is Clear</CardTitle>
                  </div>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2">
                      <ArrowRight className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-sm">From tools to systems</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ArrowRight className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-sm">From outputs to structured intelligence</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ArrowRight className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-sm">BrainPower AI is positioned at the center of this transition</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ArrowRight className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-sm">The platforms that define this shift will not just participate — they will shape the market</span>
                    </li>
                  </ul>
                </CardHeader>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Deployment & Revenue Model */}
      <section className="py-24 px-6 bg-[#07081a] border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="text-center mb-14">
            <motion.span variants={fadeInUp} className="inline-flex items-center gap-2 text-[#00d4ff] text-sm font-semibold tracking-widest uppercase">
              <Building2 className="w-4 h-4" /> Go-to-Market
            </motion.span>
            <motion.h2 variants={fadeInUp} className="text-3xl md:text-4xl font-bold text-white mt-3 mb-4">
              Deployment & Revenue Model
            </motion.h2>
          </motion.div>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: "Target Customers",
                color: "#00d4ff",
                items: ["Enterprise strategy teams", "C-suite decision-makers", "Government & public sector", "High-stakes industries (finance, defense, energy)"],
              },
              {
                title: "Revenue Streams",
                color: "#b24bf3",
                items: ["SaaS subscriptions (tiered)", "Enterprise licensing (annual contracts)", "Premium modules (Futurescape, advanced simulation)", "Integration fees"],
              },
              {
                title: "Enterprise Deployment",
                color: "#00d4ff",
                items: ["Private cloud or on-premise options", "Custom decision frameworks", "Dedicated support & onboarding", "API access for internal tools"],
              },
              {
                title: "Long-Term Opportunity",
                color: "#b24bf3",
                items: ["Platform becomes decision infrastructure", "Network effects from decision intelligence graph", "Expansion into vertical-specific solutions", "Data-driven insights marketplace"],
              },
            ].map((col) => (
              <motion.div key={col.title} variants={fadeInUp} className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 hover:border-white/20 transition-all">
                <h3 className="text-sm font-bold tracking-wide uppercase mb-4" style={{ color: col.color }}>{col.title}</h3>
                <ul className="space-y-2.5">
                  {col.items.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-gray-300">
                      <CheckCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: col.color }} />
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Why Now */}
      <section className="py-24 px-6 bg-[#0a0b1e] border-t border-white/5">
        <div className="max-w-4xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="text-center mb-12">
            <motion.span variants={fadeInUp} className="inline-flex items-center gap-2 text-[#b24bf3] text-sm font-semibold tracking-widest uppercase">
              <Zap className="w-4 h-4" /> Market Timing
            </motion.span>
            <motion.h2 variants={fadeInUp} className="text-3xl md:text-4xl font-bold text-white mt-3 mb-4">
              Why Now?
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-gray-400 max-w-2xl mx-auto">
              Market Timing is Perfect
            </motion.p>
          </motion.div>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="space-y-4 max-w-2xl mx-auto">
            {[
              "AI has matured enough to support decision intelligence systems",
              "Organizations face increasing complexity and uncertainty",
              "Strategic decisions are becoming more expensive to get wrong",
              "Existing AI tools generate information — BrainPower AI improves decision quality",
              "Decision Intelligence is emerging as a major enterprise AI category",
            ].map((point) => (
              <motion.div key={point} variants={fadeInUp} className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-5 py-4">
                <CheckCircle className="w-5 h-5 shrink-0 mt-0.5 text-[#00d4ff]" />
                <p className="text-gray-200 text-sm">{point}</p>
              </motion.div>
            ))}
            <motion.p variants={fadeInUp} className="text-center text-[#00d4ff] font-semibold pt-4">
              👉 The window is open — first movers define the category
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Block 8: Investor Benefits */}
      <section className="py-24 px-6 bg-[#0d0e24] border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.h2 
              className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-[#00d4ff] to-[#b24bf3] bg-clip-text text-transparent"
              variants={fadeInUp}
            >
              Final Positioning
            </motion.h2>
            <motion.p 
              className="text-xl text-gray-400 max-w-3xl mx-auto"
              variants={fadeInUp}
            >
              BrainPower AI is not competing in the current AI landscape. It is defining what comes next.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {investorBenefits.map((benefit) => (
              <motion.div
                key={benefit.title}
                variants={fadeInUp}
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="h-full text-center bg-[#0a0b1e] border-white/10 text-white">
                  <CardHeader>
                    <div className="flex justify-center mb-4 text-primary">
                      {benefit.icon}
                    </div>
                    <CardTitle className="text-xl mb-3">{benefit.title}</CardTitle>
                    <CardDescription className="text-base">
                      {benefit.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Advisory Board */}
      <section className="py-24 px-6 bg-[#0d0e24] border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="text-center mb-14">
            <motion.span variants={fadeInUp} className="inline-flex items-center gap-2 text-[#b24bf3] text-sm font-semibold tracking-widest uppercase">
              <Users className="w-4 h-4" /> Strategic Guidance
            </motion.span>
            <motion.h2 variants={fadeInUp} className="text-3xl md:text-4xl font-bold text-white mt-3 mb-4">
              Advisory Board
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-gray-400 max-w-2xl mx-auto">
              Leaders in AI, enterprise strategy, finance, and emerging technology guiding BrainPower AI's direction.
            </motion.p>
          </motion.div>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Mohamed Al Tajer",
                role: "Enterprise Strategy & AI",
                title: "Board Advisor & Enterprise Transformation Executive",
                highlights: ["Former CMO, National Bank of Kuwait", "Founder, Taghyeer Consulting", "GCC & International expertise"],
                color: "#00d4ff",
                image: mohamedImg,
              },
              {
                name: "Ray Gutierrez Jr.",
                role: "AI & Technology",
                title: "Symbolic Systems Architect & Inventor of Qubit369",
                highlights: ["Patent-pending quantum logic framework", "CPU-only real-time compute pioneer (4,546 FPS)", "AAAS Member"],
                color: "#b24bf3",
                image: rayImg,
              },
              {
                name: "Phylis West-Johnson",
                role: "AI, Metaverse & Media",
                title: "Professor & Director, School of Journalism & Mass Communications, San Jose State University",
                highlights: ["Author of 6+ books on emerging tech & AI in media"],
                color: "#00d4ff",
                image: phylisImg,
              },
            ].map((advisor) => (
              <motion.div key={advisor.name} variants={fadeInUp}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 hover:border-white/20 transition-all"
              >
                <div className="w-32 h-32 rounded-2xl overflow-hidden mb-5 mx-auto" style={{ border: `1px solid ${advisor.color}40` }}>
                  <img src={advisor.image} alt={advisor.name} loading="lazy" decoding="async" className="w-full h-full object-cover object-top" />
                </div>
                <p className="text-xs font-semibold tracking-widest uppercase mb-1 text-center" style={{ color: advisor.color }}>{advisor.role}</p>
                <h3 className="text-xl font-bold text-white mb-2 text-center">{advisor.name}</h3>
                <p className="text-sm text-gray-400 mb-4 text-center">{advisor.title}</p>
                <ul className="space-y-2">
                  {advisor.highlights.map((h) => (
                    <li key={h} className="flex items-start gap-2 text-sm text-gray-300">
                      <CheckCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: advisor.color }} />
                      {h}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Block 9: FAQs */}
      <section className="py-24 px-6 bg-[#0a0b1e] border-t border-white/5">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.h2 
              className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-[#00d4ff] to-[#b24bf3] bg-clip-text text-transparent"
              variants={fadeInUp}
            >
              Frequently Asked Questions
            </motion.h2>
            <motion.p 
              className="text-xl text-gray-400"
              variants={fadeInUp}
            >
              Everything you need to know about investing in BrainPower AI
            </motion.p>
          </motion.div>

          {/* Search bar + Download button row */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="flex flex-col sm:flex-row gap-4 mb-6"
          >
            <div className="relative flex-1">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none"
                xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
              </svg>
              <Input
                type="text"
                placeholder="Search questions…"
                value={faqSearch}
                onChange={(e) => { setFaqSearch(e.target.value); setActiveCategory('All'); }}
                className="pl-10 bg-[#0d0e24] border-white/10 text-white placeholder:text-gray-500 focus-visible:ring-[#00d4ff]/50 h-11"
              />
            </div>
            <a
              href={INVESTOR_BRIEF_PDF_URL}
              target="_blank"
              rel="noopener noreferrer"
              download="BrainPower_AI_Investor_Brief.pdf"
            >
              <Button
                variant="outline"
                className="h-11 gap-2 border-[#00d4ff]/40 text-[#00d4ff] hover:bg-[#00d4ff]/10 whitespace-nowrap w-full sm:w-auto"
              >
                <Download className="h-4 w-4" />
                Download Full Investor Brief
              </Button>
            </a>
          </motion.div>

          {/* Category filter tabs */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="flex flex-wrap gap-2 mb-10"
          >
            {['All', ...faqCategories.map(c => c.label)].map((cat) => (
              <button
                key={cat}
                onClick={() => { setActiveCategory(cat); setFaqSearch(''); }}
                className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
                  activeCategory === cat
                    ? 'bg-[#00d4ff] border-[#00d4ff] text-[#0a0b1e]'
                    : 'border-white/20 text-gray-400 hover:border-[#00d4ff]/50 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            {filteredFaqs.length > 0 ? (
                <Accordion type="single" collapsible className="space-y-4">
                  {filteredFaqs.map((faq, index) => (
                    <AccordionItem key={index} value={`item-${index}`} className="border border-white/10 rounded-lg px-6 bg-[#0d0e24]">
                      <AccordionTrigger className="text-left text-lg font-semibold hover:no-underline">
                        <span className="flex gap-3 items-start">
                          <span className="text-[#00d4ff] font-bold shrink-0 mt-0.5">{faq.originalIndex + 1}.</span>
                          <span>{faq.question}</span>
                        </span>
                      </AccordionTrigger>
                      <AccordionContent className="text-base text-muted-foreground pt-4 pb-2">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              ) : (
                <div className="text-center py-16 text-gray-500">
                  <svg className="mx-auto mb-4 h-10 w-10 opacity-40" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                  </svg>
                  <p className="text-lg">No questions match <span className="text-white/60">"{faqSearch}"</span></p>
                  <button onClick={() => { setFaqSearch(''); setActiveCategory('All'); }} className="mt-3 text-sm text-[#00d4ff] hover:underline">Clear filters</button>
                </div>
              )}
          </motion.div>
        </div>
      </section>

      {/* Schedule a Call CTA */}
      <section className="py-24 px-6 bg-[#0d0e24] border-t border-white/5">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#00d4ff]/30 bg-[#00d4ff]/5 text-[#00d4ff] text-sm font-medium mb-6">
              <Calendar className="h-4 w-4" />
              Book a 30-Minute Investor Call
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-[#00d4ff] to-[#b24bf3] bg-clip-text text-transparent">
              Still Have Questions?
            </h2>
            <p className="text-xl text-gray-400 mb-10 max-w-xl mx-auto">
              Schedule a direct call with the founder. We'll walk you through the financials, product roadmap, and investment terms — no pressure, full transparency.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/book"
                onClick={() => handleTrackEvent('schedule_call_click')}
              >
                <Button
                  size="lg"
                  className="gap-2 bg-gradient-to-r from-[#00d4ff] to-[#b24bf3] text-white hover:opacity-90 px-8 h-14 text-lg font-semibold"
                >
                  <Calendar className="h-5 w-5" />
                  Schedule a Call
                </Button>
              </a>
              <a
                href={INVESTOR_BRIEF_PDF_URL}
                target="_blank"
                rel="noopener noreferrer"
                download="BrainPower_AI_Investor_Brief.pdf"
                onClick={() => handleTrackEvent('download_brief_click')}
              >
                <Button
                  size="lg"
                  variant="outline"
                  className="gap-2 border-white/20 text-white hover:bg-white/5 px-8 h-14 text-lg"
                >
                  <Download className="h-5 w-5" />
                  Download Investor Brief
                </Button>
              </a>
            </div>
            <p className="mt-8 text-sm text-gray-500">
              Prefer email? Reach us at{' '}
              <a href="mailto:invest@brainpowerai.com" className="text-[#00d4ff] hover:underline">invest@brainpowerai.com</a>
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Us Form */}
      <section className="py-24 px-6 bg-[#0a0b1e] border-t border-white/5">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#b24bf3]/30 bg-[#b24bf3]/5 text-[#b24bf3] text-sm font-medium mb-6">
                <Mail className="h-4 w-4" />
                Send Us a Message
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-[#00d4ff] to-[#b24bf3] bg-clip-text text-transparent">
                Get in Touch
              </h2>
              <p className="text-gray-400 text-lg">
                Prefer to write? Fill out the form below and we'll respond within 24 hours.
              </p>
            </div>

            {contactSubmitted ? (
              <div className="text-center py-16">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#00d4ff]/10 border border-[#00d4ff]/30 mb-6">
                  <CheckCircle className="h-8 w-8 text-[#00d4ff]" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">Message Sent!</h3>
                <p className="text-gray-400 mb-6">Thank you for reaching out. We'll be in touch within 24 hours.</p>
                <Button
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/5"
                  onClick={() => { setContactSubmitted(false); setContactForm({ name: '', email: '', company: '', investmentRange: '', message: '' }); }}
                >
                  Send Another Message
                </Button>
              </div>
            ) : (
              <form
                className="space-y-5"
                onSubmit={(e) => {
                  e.preventDefault();
                  submitContact.mutate(contactForm);
                }}
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1.5">Full Name *</label>
                    <Input
                      required
                      placeholder="John Smith"
                      value={contactForm.name}
                      onChange={(e) => setContactForm(f => ({ ...f, name: e.target.value }))}
                      className="bg-[#0d0e24] border-white/10 text-white placeholder:text-gray-500 focus-visible:ring-[#00d4ff]/50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1.5">Email Address *</label>
                    <Input
                      required
                      type="email"
                      placeholder="john@company.com"
                      value={contactForm.email}
                      onChange={(e) => setContactForm(f => ({ ...f, email: e.target.value }))}
                      className="bg-[#0d0e24] border-white/10 text-white placeholder:text-gray-500 focus-visible:ring-[#00d4ff]/50"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1.5">Company / Organisation</label>
                    <Input
                      placeholder="Acme Capital"
                      value={contactForm.company}
                      onChange={(e) => setContactForm(f => ({ ...f, company: e.target.value }))}
                      className="bg-[#0d0e24] border-white/10 text-white placeholder:text-gray-500 focus-visible:ring-[#00d4ff]/50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1.5">Investment Range (OMR)</label>
                    <Input
                      placeholder="e.g. OMR 5,000 – 10,000"
                      value={contactForm.investmentRange}
                      onChange={(e) => setContactForm(f => ({ ...f, investmentRange: e.target.value }))}
                      className="bg-[#0d0e24] border-white/10 text-white placeholder:text-gray-500 focus-visible:ring-[#00d4ff]/50"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Message *</label>
                  <Textarea
                    required
                    rows={5}
                    placeholder="Tell us about your investment interest, questions, or how you'd like to get involved…"
                    value={contactForm.message}
                    onChange={(e) => setContactForm(f => ({ ...f, message: e.target.value }))}
                    className="bg-[#0d0e24] border-white/10 text-white placeholder:text-gray-500 focus-visible:ring-[#00d4ff]/50 resize-none"
                  />
                </div>
                {contactError && (
                  <p className="text-red-400 text-sm">{contactError}</p>
                )}
                <Button
                  type="submit"
                  size="lg"
                  disabled={submitContact.isPending}
                  className="w-full gap-2 bg-gradient-to-r from-[#00d4ff] to-[#b24bf3] text-white hover:opacity-90 h-12 text-base font-semibold"
                >
                  {submitContact.isPending ? (
                    <span className="flex items-center gap-2"><span className="animate-spin h-4 w-4 border-2 border-white/30 border-t-white rounded-full" />Sending…</span>
                  ) : (
                    <><Send className="h-4 w-4" />Send Message</>
                  )}
                </Button>
              </form>
            )}
          </motion.div>
        </div>
      </section>

      {/* Block 10: Final CTA */}
      <section className="py-32 px-6 relative overflow-hidden bg-[#0d0e24] border-t border-white/5">
        <div className="absolute inset-0 bg-gradient-to-br from-[#00d4ff]/10 via-[#b24bf3]/10 to-transparent" />
        
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="relative z-10 max-w-4xl mx-auto text-center"
        >
          <motion.div variants={fadeInUp}>
            <Badge className="mb-6 text-lg px-6 py-2">
              <Rocket className="h-4 w-4 mr-2" />
              Limited Spots Available
            </Badge>
          </motion.div>

          <motion.h2 
            className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-[#00d4ff] to-[#b24bf3] bg-clip-text text-transparent"
            variants={fadeInUp}
          >
            Join Us in Building the Intelligence Layer
          </motion.h2>
          
          <motion.p 
            className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto"
            variants={fadeInUp}
          >
            Request access, explore investment options, or connect directly with the team.
          </motion.p>

          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
            variants={fadeInUp}
          >
            <Button size="lg" className="text-lg px-8 py-6 text-black font-semibold" style={{ background: 'linear-gradient(135deg, #00d4ff, #0099cc)' }} asChild>
              <Link href="/register">
                <Briefcase className="mr-2 h-5 w-5" />
                Create Investor Account
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-[#b24bf3] text-[#b24bf3] hover:bg-[#b24bf3]/10" asChild>
              <Link href="/book">
                <Calendar className="mr-2 h-5 w-5" />
                Schedule a Call
              </Link>
            </Button>
          </motion.div>

          <motion.div 
            className="flex flex-wrap justify-center gap-8 text-sm text-muted-foreground"
            variants={fadeInUp}
          >
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>Secure Process</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>Fast Onboarding</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>Expert Support</span>
            </div>
          </motion.div>
        </motion.div>
      </section>
      {/* Footer */}
      <footer className="py-8 border-t border-white/10 text-center text-gray-500 text-sm bg-[#0a0b1e]">
        <p>© {new Date().getFullYear()} BrainPower AI. All rights reserved.</p>
        <div className="mt-3 flex flex-wrap justify-center gap-6">
          <Link href="/" className="text-gray-500 hover:text-[#00d4ff] transition-colors">Home</Link>
          <Link href="/login" className="text-gray-500 hover:text-[#00d4ff] transition-colors">Admin Login</Link>
          <Link href="/register" className="text-gray-500 hover:text-[#00d4ff] transition-colors">Register</Link>
        </div>
        <p className="mt-4 text-xs text-gray-500">
          Part of the{" "}
          <a href="https://smarthinkerz.com" className="hover:text-[#7dd3fc] transition-colors underline-offset-2 hover:underline">
            SmarThinkerz Unified Intelligence Hub
          </a>
        </p>
      </footer>
    </div>
  );
}
