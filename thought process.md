yo I need us to think of a project idea to win this solana hackathon. I will be using ai to code since i have zero sol knowledge just genral blockchain knowledge so i think it is going to be good. this is like a weekend sidequest as long as you give me a winning idea and not random common ideas think something that could revolutionalise the event
YOOOO 😭🔥 Now we're talking.

I don't want us building another token launchpad, NFT marketplace, meme coin dashboard, DeFi portfolio tracker or AI trading bot. Those are the ideas everyone reaches for when they hear Solana.

I want us thinking about something that makes judges go:

"Wait, why doesn't this already exist?"

And there's one thing I want us to get right: we're not trying to build the biggest project in a weekend. We're trying to build the smallest convincing demonstration of a genuinely big idea.

You already have some blockchain experience from DeadTime, so we're not starting from absolute zero. We'll use AI for implementation, but I'll help you understand the architecture, make the technical decisions and avoid blindly accepting generated smart contract code.

First, I found the likely hackathon
I think you're referring to the Solana Hackathon hosted with Major League Hacking (MLH), November 6–8, 2026.

Token Security Analysis on Solana
Solana Hackathon

November 6–8 · Online · Weekend event

Top 3 overall + AI, DeFi and Gaming tracks

Official event and rules

The AI track is particularly interesting because judges want AI and Solana to do meaningful work together, not just an AI chatbot with a wallet attached. The overall judging also emphasizes functionality and actual use of Solana.

Major League Hacking

That gives us a direction.

My proposed project: LATCH
My strongest idea AI + Solana

LATCH — Give AI agents permission, not your wallet.
ClawVault — Security for AI Agent Wallets
The problem we're attacking:

AI agents are increasingly capable of doing things for people.

Imagine telling an AI:

Pay for my cloud server.

Buy this API subscription.

Purchase some data.

Pay a freelancer.

Execute a transaction when a condition is met.

But there's a massive problem.

Would you give an AI unrestricted access to your wallet?

Probably not.

Even if the AI is intelligent, it can hallucinate, misunderstand instructions, get manipulated or simply make an expensive mistake.

Existing spending limits aren't enough. An agent that can spend $100 might still spend that $100 on something you never authorized.

LATCH introduces intent-based financial permissions.

Instead of giving an AI agent access to your wallet, you give it a cryptographically enforced permission describing exactly what it's allowed to do.

How it works
Imagine this interaction:

LATCH assistant

Demo scenario
I need you to purchase cloud computing for my project. You can spend up to $15, only use the approved provider, and the permission expires in 24 hours.
I've translated your request into a permission policy. Review before authorizing.
Your authorization policy

Maximum spending

$15

Approved recipient

Provider A

Expiration

24 hours

Uses

1 transaction

Ready for wallet authorization
Permission enforced on Solana

The agent cannot change the recipient, exceed the spending limit, reuse the permission or transact after expiration.

Here's the important part:

AI interprets the instruction. Solana enforces the instruction.

The AI is not trusted to police itself.

What makes this different?
Think about the distinction:

Typical AI wallet

LATCH

Spending limit

Intent-specific permissions

Agent controls transactions

Program validates transactions

Trust the agent

Trust cryptographic rules

Broad wallet access

Restricted authorization

Manual revocation

On-chain revocation

We're essentially exploring a permission layer for the coming agent economy.

This could become infrastructure used by AI assistants, autonomous businesses, developers and companies operating fleets of agents.

The actual technical architecture
We can build this without attempting to train an AI model or become Solana experts overnight.

LATCH architecture
User's natural-language instruction

"Spend $15 on approved cloud computing"

AI policy interpreter

Converts instructions into structured permissions

User authorizes policy

Wallet signs and funds a restricted PDA vault

Solana smart contract

Checks recipient, amount, expiry and remaining uses

Payment executed or rejected

Verifiable transaction and authorization history

Proposed technology
Component

Technology

Frontend

React + Tailwind

Wallet

Solana Wallet Adapter

Smart contract

Anchor + Rust

Blockchain

Solana Devnet

AI

Gemini API or another LLM

Blockchain interaction

Solana Web3.js

Backend

Lightweight Python/FastAPI if needed

The important technical detail: the program should control the vault and validate every payment. The agent must never receive the user's private key.

What we'd actually build over the weekend
I don't want us overengineering this.

Must have
Connect a Solana wallet.

Enter a natural-language spending instruction.

AI converts it into a permission policy.

User reviews and authorizes the policy.

Create an on-chain PDA policy and restricted vault.

An agent attempts a transaction.

Smart contract approves or rejects it.

Display transaction history and the reason for rejection.

The winning demo moment:

We authorize an agent to spend $15 on Provider A.

Then we demonstrate three attempts:

$10 to Provider A → Approved

$20 to Provider A → Rejected

$10 to Provider B → Rejected

Then we show the on-chain transactions.

That is a much stronger demonstration than showing judges a chatbot that can send SOL.

Why I think this has potential
Three things:

It's infrastructure, not another disposable dApp. If AI agents become significant economic actors, permission management becomes an important problem.

It makes Solana essential. The permissions, vault ownership, transaction execution and enforcement are on-chain.

It has a clear business direction. We could eventually offer LATCH as an authorization SDK/API for developers building autonomous agents.

There are existing smart-wallet and session-key approaches, so we cannot claim nobody has built spending permissions before. Our differentiation needs to be the combination of natural-language intent, recipient-specific restrictions, transaction-level enforcement and transparent authorization receipts.

Before we commit, I need one thing.
I found the MLH event, but I want to make sure we're targeting the right competition.

Is this the November 6–8 MLH Solana Hackathon?

If yes, we'll build around its AI track while remaining eligible for the overall prizes. The event description explicitly welcomes AI-assisted development.

Major League Hacking

My next move would be to turn LATCH into a proper engineering blueprint: exact smart contract instructions, account structures, frontend pages, AI prompts and a weekend implementation sequence. No random coding and hoping it works.

I'd also suggest setting up daily build checkpoints so we don't lose the weekend to AI-generated spaghetti.

Set up weekend LATCH build checkpoints

Tap to set up

One thing though: we're building something judges can actually interact with, not just a pretty pitch deck. That's the standard. 😭

Honestly I Havent got what our moat is i just know we are creating a smart wallet but give ai permissioned access explain it as if you are explaining to a regular user who is not technical but wants yo use the app
Bro, I think the reason you're not seeing the moat is that I've been explaining LATCH from an engineering perspective instead of explaining why an ordinary person would actually want it. Let's fix that.

Imagine you're using LATCH.

Meet Joseph, a regular LATCH user.
You have $200 in your Solana wallet. You use AI agents to help you run your projects, manage subscriptions, buy services and handle repetitive tasks.

One day, you tell your AI assistant:

"I want you to manage my cloud infrastructure. Whenever my server runs out of credits, top it up. Don't spend more than $10 per top-up, and don't spend more than $50 this month."

Normally, you have two options:

Give the AI access to your wallet and hope it behaves.

Don't give it access, meaning you have to approve every transaction yourself.

Neither is particularly convenient.

LATCH gives you a third option.

What happens when you use LATCH?
Сyber Guard - Ad Blocker by UNICORN APPS
LATCH

Example walkthrough
You stay in control. Your AI does the work.

1. You tell LATCH what you want.

"I want my AI to pay for server credits whenever they're running low. Maximum $10 per payment, maximum $50 per month." 2. LATCH creates your spending rules.

Your AI's spending permission

Ready
Per payment

$10 max

Monthly budget

$50 max

Purpose

Server credits

Duration

Until revoked

3. You approve the permission once.
   You connect your wallet and authorize the rules. You're not giving the AI your wallet password or private keys.
4. Your AI starts working.
   Your server runs low on credits. The AI requests a $10 top-up.

Payment approved

$10.00
Within your authorized spending rules.

5. The AI tries something outside your rules.
   It attempts to spend $15 on a different service.

Payment rejected

This payment exceeds your $10 limit and is outside the approved purpose.

6. You can take control whenever you want.

Pause the AI's permissions, change the limits or revoke access entirely.

That's LATCH from a user's perspective.

So what's actually our moat?
Here's where I want you to think a little bigger.

A smart wallet isn't the moat. Spending limits aren't the moat. Other projects can build those.

Our proposed differentiation is:

LATCH turns what you want an AI to do into enforceable financial boundaries.

Consider three levels:

Level

What it does

Normal wallet

Lets you send money

Smart wallet

Lets you configure spending rules

LATCH

Lets you describe what an AI is allowed to accomplish, then enforces those permissions

The distinction is that we're not just asking:

"How much money can this AI spend?"

We're asking:

"What exactly have I authorized this AI to accomplish with my money?"

For example, you might authorize:

Paying for cloud infrastructure, but not buying cryptocurrency.

Paying a particular freelancer, but not another wallet.

Purchasing API credits, but not exceeding your monthly budget.

Renewing a subscription, but only for the next three months.

The smart contract enforces the rules independently of the AI.

Important honesty: Our proposed weekend MVP can demonstrate recipient, amount, expiry and usage restrictions. It cannot magically verify whether a payment genuinely serves a particular purpose. For that, we'd need trusted service integrations, verified merchant identities or other transaction evidence. We should not pretend an AI-generated description is cryptographic proof.

The bigger vision
Nvidia staví AI agentům plot. OpenShell hlídá, kam smějí sahat | Jarvis AI
Imagine a future where you have five AI agents:

One manages your cloud infrastructure.

One handles your business expenses.

One purchases research data.

One manages subscriptions.

One pays contractors.

You don't want five agents having unrestricted access to your money.

You want to give each agent its own permissions, budgets and boundaries.

LATCH becomes the financial permission infrastructure between humans, AI agents and blockchain transactions.

That's a much bigger product than a smart wallet.

But I want to challenge our idea before we build it.
There's one question that could determine whether LATCH is actually worth pursuing:

Why would someone use LATCH instead of an existing smart wallet with spending limits and session keys?

Our answer cannot just be "because we use AI."

I think we should investigate making LATCH's core innovation intent-based authorization: the user defines an outcome, and LATCH translates it into a collection of enforceable permissions, rather than making users configure technical spending rules manually.

That is the direction I'd investigate before committing our weekend.

yeah lets investigate it and go deeeper on that before we decide on building
Aight. Now we're getting to the actual startup-thinking part. 😭

I want us to temporarily forget that we're participating in a hackathon.

Let's pretend we're building a company that wants to own an important piece of the AI economy.

The question isn't how to build an AI-powered smart wallet. It's:

As AI agents become capable of spending money and conducting business independently, what financial infrastructure will they need that doesn't adequately exist today?

That's the problem space I want us investigating.

And I'm going to be critical of LATCH. If the idea turns out to be something existing products already do, we pivot. I don't want us getting emotionally attached to a mediocre idea.

LATCH research: Is there actually a gap worth building?
Research finding Original concept needs differentiation

I found something important, and honestly, I'm glad we're investigating before coding.

The problem we're trying to solve is real. But other builders have already started solving parts of it, including some very close to our original idea.

There are four developments we need to understand.

1. Who is already building in this space?
   A. Maestro
   harp | web3 enthusiast (@0xharp) on X
   This is probably the closest competitor to our original LATCH concept.

Maestro is building an agentic policy engine specifically for Solana.

It already offers:

Spending limits.

Approved and blocked recipients.

Approved smart contracts.

Time restrictions.

Session keys for AI agents.

Emergency freezing and revocation.

It even demonstrates an AI agent trying to send money to an unapproved address and getting rejected.

Sound familiar? That's practically our initial demo.

Its architecture is experimental and devnet-first, but the conceptual overlap is substantial.

Agentic Policy Engine for Solana

Our conclusion: We cannot win by building another Solana dashboard that gives AI agents spending limits.

B. Para
Universal Embedded Wallet Comparison for 2025
Para introduced Transaction Permissions, which became generally available in September 2026.

Here's what caught my attention.

A business can give an AI agent a task like:

"Research the best solution to this problem."

But that instruction doesn't tell the agent how much it can spend.

Para allows the business to define a separate financial mandate, with:

Spending limits.

Approved recipients.

Cumulative spending limits over time.

Human approval requirements.

Para checks the proposed transaction before allowing the wallet to sign.

Para Blog

Notice something?

This is almost exactly the security philosophy we want for LATCH.

Our conclusion: Separating AI instructions from financial authority is already an established product direction. We need to contribute something more specific.

C. Coinbase Agentic Wallets
Empowering AI agents with programmable MPC Wallets | Coinbase
Coinbase is approaching the problem from wallet infrastructure.

heir offering includes:

- Wallets for autonomous agents.
- Spending caps.
- Transaction execution.
- Secure key isolation.
- Agent payments using x402.
  They're making it easier for developers to give agents financial capabilities without exposing private keys.
  Coinbase+1

Our conclusion: Giving AI agents wallets is becoming a major infrastructure category. We shouldn't compete with Coinbase by building a worse wallet.
D. Google AP2

vellum.ai

This one is particularly interesting.

Google introduced the Agent Payments Protocol (AP2), with more than 60 collaborating organizations.

It introduces something called Mandates.

Think of a mandate as a digitally signed record of what a user authorized an agent to do.

For example:

You tell an agent:

"Buy concert tickets when they become available, but never spend more than $100."

You authorize that instruction upfront.

The agent can later execute the purchase when the conditions are met, without asking you to approve every individual payment.

AP2 also considers whether the actual purchase matches the user's original intent.
Google Cloud Blog

Our conclusion: Intent-based authorization is already being explored at protocol level. We cannot claim to have invented it.

2. What the competitive landscape actually tells us
   Let's compare the different approaches.
   Capability Maestro Para Coinbase AP2
   Agent wallets Yes Yes Yes Payment-agnostic
   Spending restrictions Yes Yes Yes Via mandates
   Recipient restrictions Yes Yes Guardrails Purchase mandates
   Human authorization Owner controls Yes Wallet controls Yes
   Natural-language intent Conversational integration Policy-based Agent interface Intent mandates
   Solana focus Yes Not exclusive Not exclusive Not exclusive

The key lesson:

LATCH's original feature list is not a moat. It's a feature list in an increasingly crowded category.

And that's actually useful information. It means we need to move from thinking about features to identifying an underserved user problem. 3. Where I think the actual opportunity is
Let's look at what these products have in common.

Most of them approach the problem from the perspective of:

"How do we stop an AI agent from spending money it shouldn't?"

That's an important problem.

But I want us to explore a slightly different question:

"How do we let ordinary people delegate complex financial tasks to AI without needing to understand or configure financial permissions?"

There's a difference.

Imagine these two experiences.
Existing configuration approach
You're setting up an AI agent.
Maximum transaction: $20

Daily spending limit: $100

Approved addresses: 3

Approved programs: 2

Session expiry: 24 hours

Allowed tokens: USDC

You need to understand what all these settings mean and configure them correctly.

The experience I want LATCH to explore
You're setting up an AI agent.
"I want you to manage my business's cloud infrastructure. Pay for server credits when necessary, but don't spend more than $100 a month. Only use my approved providers. If you find a cheaper provider, ask me before switching."
LATCH responds:

"I've understood your instructions. Here's what your agent will be allowed to do, what it won't be allowed to do, and when it will need your approval."
Agent mandate
Review required

- Pay approved cloud providers.
- Maximum $100 monthly.
- Cannot switch providers independently.
- Ask before adding a new provider.
- Permission can be revoked anytime.

The difference is that users describe the job they want completed, rather than manually configuring wallet security.

But there's an important distinction: AI must not invent the permissions. It should identify ambiguities, suggest a policy, and let the user approve the exact rules.
The missing piece: Intent compilation
I want to introduce a concept that could become LATCH's central technology.

Call it an Intent Compiler.

Think of a compiler in programming.

You write something understandable to a human, and the compiler translates it into something a machine can execute.

LATCH would do something similar with financial authority.
The LATCH Intent Compiler
HUMAN INTENT

"Keep my website online. You can spend up to $30 a month on hosting."

Intent Compiler

Interpretation

- Goal: Keep website online.
- Budget: $30/month.
- Expense category: Hosting.
- Payment recipient: Not yet specified.
- Duration: Not specified.
  Needs clarification
  "Which hosting providers can your agent pay?"

MACHINE-ENFORCEABLE MANDATE

Approved by user

- Maximum $30 per month.
- Only approved provider accounts.
- Hosting payment instructions only.
- Expires after 30 days.
- Human approval for new providers.

Solana enforcement

The agent receives limited authority, not unrestricted wallet access.

This is interesting because LATCH could become the translation layer between what humans want and what autonomous agents are allowed to execute.
But there's a technical challenge we must solve
AI understands language probabilistically. A smart contract executes deterministic rules.

If you tell LATCH:

"Only spend on things that help my business grow."

What does that mean to a smart contract?

It cannot objectively determine whether a purchase will help your business grow.

We therefore need to distinguish:

- Human intent: What the user wants to accomplish.
- Machine-enforceable rules: Specific amounts, approved recipients, programs, instructions, deadlines and conditions.
- External evidence: Information that can establish whether a purchase or action satisfies the intended purpose.
  For example, a smart contract can verify that $10 went to an approved hosting provider. It cannot independently prove that the payment actually improved your website.

This distinction is critical. We should never market AI interpretation as if it were blockchain verification.

4. Three possible directions for LATCH
   Now that we've identified the landscape, I see three potential products.

Direction A: Intent Compiler
Best weekend MVP candidate
Users describe tasks in natural language. LATCH converts them into understandable, structured and enforceable financial mandates.

Differentiation: Policy generation, ambiguity detection, explanations and simulation rather than manual configuration.

Direction B: Intent Firewall

LATCH sits between multiple AI agents and their financial actions.

Every transaction is checked against the user's original mandate, and LATCH explains exactly which condition allowed or rejected it.

Differentiation: One independent security layer for multiple agents, with traceable decisions.

Direction C: Outcome-Based Delegation

Users authorize an agent to accomplish a task, and funds are released in stages when independently verifiable conditions are met.

Example: An agent purchases a service, but payment is only released after a specified service delivery condition is verified.

Differentiation: Authority is tied to task completion, not merely permission to spend.
More technically ambitious

My initial preference is to combine A and B, while keeping C as a longer-term possibility. 5. What would make this a real moat?
I want to separate three things because they're often confused.
Type LATCH's position
Feature Natural-language policy creation
Product advantage Users can safely delegate complex tasks without configuring technical permissions
Potential moat A widely integrated, user-owned authorization layer that works across agents and services

The third one is what we should aspire to.

Here's how it could develop.

1. Agent independence

A user shouldn't need to recreate their permissions every time they switch from one AI agent to another.

Imagine granting an authorization to LATCH, then using it with different compatible agents.

2. Portable mandates

Your financial permissions should belong to you, not to whichever AI application you're currently using.

An agent could request permission to perform a task, but LATCH would independently check whether that authority exists.

3. An authorization history

Every transaction would have a traceable relationship to the original instruction.

You could ask:

- Why was this payment approved?
- Which instruction authorized it?
- How much of my budget remains?
- Did the agent attempt something outside its authority?
- Which agent initiated the payment?

4. An ecosystem for developers

Eventually, developers could integrate LATCH into their own agents rather than building authorization infrastructure themselves.

That's where a developer SDK could become valuable.

None of these is an automatic competitive moat. We'd need adoption, integrations, reliability and a genuinely useful standard to make it defensible. 6. My recommendation: Change what we're building
I wouldn't build the original LATCH smart wallet.

I'd build something closer to this:

LATCH
Intent-based authorization infrastructure

Proposed direction

Tell your AI what to do. Decide what it's allowed to do.
A user-controlled authorization layer that translates human instructions into verifiable financial permissions for autonomous AI agents.

The four things our product must demonstrate

1. Understand

   A user describes a financial task in ordinary language.

2. Translate

   LATCH creates an understandable mandate, detects missing information and requests clarification.

3. Authorize

   The user approves the mandate and establishes its enforceable permissions on Solana.

4. Enforce

   Agents can execute permitted actions, while unauthorized transactions are rejected independently of the AI.

What I'd build for the hackathon
Not a complete wallet infrastructure company. A focused demonstration:

1. A user connects a Solana wallet.
2. They describe a task to LATCH.
3. The AI identifies the user's objective and asks clarifying questions.
4. LATCH generates a structured mandate.
5. The user reviews the permissions.
6. The user authorizes it on Solana.
7. An agent attempts several transactions.
8. The Solana program independently approves or rejects them.
9. LATCH shows the exact mandate clause responsible for each decision.
   The killer demo would be an agent that gets manipulated by a malicious instruction and tries to spend outside its mandate.

The AI wants to execute the transaction. LATCH's enforcement layer refuses.

That's the story I want judges to remember.

7. Before we choose, let's make a strategic decision
   I don't want to force LATCH if another direction has a better chance of winning.

Here's what I want to establish with you:

1. Which direction excites you most?

A + B: Intent Compiler + Intent Firewall

C: Outcome-Based Delegation

Combine all three into a bigger vision

Scrap LATCH and explore a completely different problem

2. What kind of product do you want to create?

Developer infrastructure / SDK

Consumer-facing application

Both: usable app backed by infrastructure

3. What's our biggest priority?

Originality and potential to win

A working, impressive weekend MVP

Long-term startup potential

Submit decisions
One final thing: I would rather we spend another few hours finding a genuinely differentiated idea than spend 20 hours coding a project that judges have already seen.

We have a promising problem space. We haven't proven we have a winning product yet. That's exactly what we're trying to figure out. 🔥

I can also keep tracking new Solana agent-wallet and authorization competitors as we develop the concept.
🔎Track AI wallet competitors weeklyTap to set up

My LATCH project decisions: Direction: pivot. Product type: both. Priority: originality. Use these to help choose and refine our hackathon project.

Worked for 4m 49s

The pivot: Three directions worth considering
After looking at the current ecosystem, I've got a much better idea of where I would and wouldn't spend our weekend.

One thing stood out: a lot of seemingly original ideas already have competitors.

For example:

- Portable AI memory already has projects like Arca and Penny.
  Your Private Data Vault for AI+1
- Crowdsourced local price intelligence already has Kenyan products like Lensi.
  See the real price
- AI-to-human task marketplaces are emerging quickly, including RentAHuman.
  Y Combinator+1
  I don't want us entering those markets with a slightly different interface.

Here are the three directions I'd seriously investigate.

1. PROOFCALL — Pay for results, not responses
   My current favourite
   AI + infrastructure

devpost.com

The problem:

AI agents increasingly purchase services from other AI agents and APIs.

An agent might pay for:

- Research.
- Data.
- Code execution.
- Image generation.
- Financial information.
- Cloud computing.
  But how does the paying agent know it actually received what it paid for?

An API can return a response that is technically successful but completely useless.

Imagine paying for five current research sources and receiving five broken links.

The payment can succeed even though the service failed your actual requirements.

PROOFCALL introduces programmable service guarantees.

Instead of simply paying for a request, you establish conditions that the result must satisfy.
An ordinary user experience
Imagine you're using PROOFCALL to purchase research.
What do you need?
"Find me five recent research sources about AI adoption in Africa. They must be published within the last 12 months and include working links."
PROOFCALL understands your requirements.
Service contract generated

- Five unique sources.
- Publication dates within 12 months.
- Working URLs.
- Source references included.

  Payment

  0.10 USDC

  Funds held in Solana escrow until the agreed validation process completes.

The service returns its results.
Result validation
Failed

Sources returned

5 / 5

Working URLs

4 / 5

Recent publications

3 / 5

The output did not satisfy the agreed conditions.

Payment protected

The result is rejected under the agreed payment rules. The escrow follows its refund process.

Why is this interesting?
We're creating a marketplace where AI services can compete on the quality of their results, not just their advertised capabilities.

The two sides:

For consumers: Buy services and receive results that meet agreed requirements.

For developers: Integrate a PROOFCALL SDK into their APIs and AI agents so customers can purchase services with verifiable delivery conditions.

The potential moat is a growing network of reusable service contracts, validation tools and provider reliability histories.

Solana handles escrow and settlement. AI converts requests into acceptance criteria and helps interpret results.

An important distinction: AI can help interpret results, but the actual payment decision should rely on deterministic checks where possible, with explicit human review or a trusted dispute process for subjective conditions.

There is already related infrastructure. Cardano's Masumi, for instance, supports escrow, result submission, refunds and disputes. Our differentiation would have to be the reusable, machine-readable quality-validation layer, not escrow by itself.
Cardano Developer Portal+1

2. CONTEXTKEY — Your AI context belongs to you
   Big infrastructure vision

windowsforum.com

Imagine using five different AI assistants.

One knows your coding preferences. Another understands your business. Another knows how you like to work.

But none of them share your context.

Worse, you might want to share your professional context with a coding assistant without exposing your personal information.

CONTEXTKEY would provide a user-owned permission layer for personal AI context.

You decide:

- Which AI can access your memories.
- Which categories it can access.
- How long permission lasts.
- Whether an application can update that information.
- When permission should be revoked.
  A consumer app manages the context. A developer SDK/MCP server allows compatible AI applications to request access.

Solana provides portable authorization records and auditable access grants, while private data stays encrypted off-chain.

The opportunity: Make user-controlled context a portable part of the AI ecosystem.

The challenge: portable AI memory is already competitive, and revocation cannot erase information an AI has previously received.
Portable AI Memory+2

3. PROOFSKILL — Your abilities, backed by evidence
   Consumer + developer infrastructure

devpost.com

Here's a problem I find interesting.

People graduate from bootcamps, complete online courses, build projects and collect certificates.

But how does an employer know what someone can actually do?

Imagine a platform where developers complete practical challenges.

AI generates and evaluates task requirements, while actual execution, test results and reviewer approvals provide evidence of ability.

Solana stores verifiable skill attestations that developers own and can present to different employers.

Consumer product: A portfolio built around verified practical achievements.

Infrastructure: An SDK for bootcamps, employers and open-source communities to issue and verify practical skill credentials.

The moat would be a trusted network of verified work and assessment records, rather than another certificate marketplace.

My ranking
These are my subjective product assessments, not measured probabilities of winning.
Criterion ProofCall ContextKey ProofSkill
Originality of proposed wedge 8/10 7/10 7/10
Solana relevance 9/10 7/10 7/10
Weekend feasibility 8/10 7/10 9/10
Consumer potential 8/10 9/10 8/10
Infrastructure potential 9/10 9/10 8/10

I'd put PROOFCALL first.

Here's why: the official MLH hackathon explicitly has an AI track encouraging machine payments, autonomous agents and useful on-chain coordination. PROOFCALL connects directly to that opportunity, while offering a more specific problem than simply allowing agents to pay for APIs.
Major League Hacking+1

What I want us to do next
Before committing, let's pressure-test PROOFCALL against four questions:

1. Is the inability to verify paid AI service results a sufficiently painful problem?
2. What can we build that x402, existing escrow systems and ordinary API payment providers don't already provide?
3. Can we make our validation mechanism genuinely enforceable instead of having an AI arbitrarily decide whether something is good?
4. Can we demonstrate the entire concept in under 48 hours?
   The hackathon begins Friday, November 6, and runs through Sunday, November 8. We need an idea we can actually execute.
   Major League Hacking

My recommendation is to investigate PROOFCALL first, not start coding it yet.

I want us to find a reason this product deserves to exist beyond winning a hackathon. If we establish that, we'll have a much stronger project than another weekend dApp. 🔥

for the ideas i want a dapp not a web 2 app wrapped around solana for transactions only when thinking lets start from apov where the blockchain is teh essential piece of the app not the app doing everything then using tghe blockchain to just store or make transactions. think of solana blockchain back to the fundamentals on what makes sol better than other blockchains see what its desgn and main purpose for it being built the way it is from there we can find an idea that utilises it good and not just something that wraps it as if it would abandon it any time

Worked for 5m 2s

Bro. I think this is the most important correction we've made so far. And I agree with you.

We've been approaching Solana as a place to deploy a product instead of understanding what products become possible because Solana exists.

That's backwards.

I want to change our entire approach:

We are not building a normal application that happens to accept SOL. We are looking for a problem whose solution fundamentally depends on a blockchain's ability to maintain shared, permissionless, programmable state.

And I want us to be even stricter: if we can remove Solana, replace it with PostgreSQL and a payment API, and the product still works almost identically, the idea doesn't qualify.

Let's go back to the architecture and design philosophy, then work forward into product opportunities.
Let's think like Solana's architects, not like dApp developers
I went through Solana's original design philosophy, its current architecture and the latest network upgrades.

I found a useful way to understand the entire blockchain:

Solana is designed to be a high-performance, permissionless computer where thousands of independent participants can interact with the same state and have their actions processed and settled quickly.

That was the original north star: making a decentralized network approach the performance of a single computer without giving up permissionless participation.
Solana Media+1

This is a much more interesting foundation for product design than simply saying Solana is cheap and fast.

1. What makes Solana interesting technically?
   Let's break down the engineering decisions and, more importantly, what each one makes possible.
   A. Sealevel: parallel execution

x.com

This is one of the most important things to understand.

Imagine 10,000 people interacting with an application at the same time.

In a conventional database, a system has to coordinate these operations and protect shared data from conflicting updates.

Solana takes a particularly interesting approach.

When a transaction is submitted, it declares which accounts it intends to read and which it intends to modify.

The runtime can therefore execute transactions concurrently when their writes don't conflict.

For example:

- Joseph updates his game character.
- Sarah updates her game character.
- Brian updates his game character.
- Another 5,000 players update their own characters.
  These operations can be processed in parallel because they aren't competing to modify the same account.

That's the idea behind Sealevel.
Solana Media

Why this matters for our project:

We can design an application around thousands of independent users interacting with one shared program and its rules, without having to serialize every unrelated interaction.

One important caveat: transactions trying to modify the same account still compete for access. We should design the state layout to avoid unnecessary contention.

B. One shared global state
This is another big one.

Solana maintains a common state that all its programs and participants interact with.

Think about the implications.

Imagine three completely independent applications:

- App A creates an asset.
- App B uses that asset in a financial operation.
- App C verifies its ownership and transfers it.
  These applications don't need to maintain separate databases of who owns what.

They can interact with the same on-chain accounts and programs.

This is fundamentally different from three companies building separate databases and integrating them through APIs.

The common state becomes a coordination point that none of those companies needs to own.
Solana+1

Product implication: We can build a protocol that independent developers, users and applications all participate in without needing permission from our company.
C. Atomic transactions and composability
This is probably the most powerful application-development feature.

Solana transactions can contain multiple instructions.

All instructions succeed together, or all state changes are reverted.

Imagine a transaction that:

1. Transfers a payment from Alice.
2. Checks that an asset is available.
3. Transfers ownership of that asset.
4. Distributes a fee to three other participants.
   Suppose step three fails.

The entire transaction is reverted. Alice doesn't end up paying for an asset she never received.

Solana programs can also invoke other programs through Cross-Program Invocations (CPI), allowing different applications to compose their functionality within the same execution.
Solana+1

Product implication: We can create applications with complex interactions between independently developed protocols, without relying on a trusted intermediary to coordinate every step.
D. Program Derived Addresses (PDAs)

tradeidea.io

This is a particularly interesting design choice.

A PDA is an account address derived from a program and some predetermined inputs.

It has no private key.

Instead, the program can authorize actions on behalf of that account using Solana's runtime.

Think about what this enables:

A program can own a shared treasury, a reservation, an asset or an escrow account without a human holding the private key.

The program controls the conditions under which those assets and accounts can change.

No developer needs to personally approve every action.
Solana

Product implication: We can build autonomous on-chain systems with rules that users can inspect and interact with, but that nobody can casually override.
E. Speed and low-cost interactions
We should also understand what the newer network looks like.

As of November 5, 2026:
200ms
Mainnet slot time

~150ms
Alpenglow target finality

Alpenglow is live on Mainnet.

It replaced TowerBFT as Solana's consensus protocol in October 2026, substantially reducing the time required to finalize transactions.

Source: Solana's network upgrade documentation, updated October 2026.
Solana Media+1

This matters because we can make individual interactions part of the application itself.

Think of:

- Every move in a multiplayer game.
- Every claim on a shared resource.
- Every contribution to a collective activity.
- Every update to a shared marketplace.
- Every participant competing for an allocation.
  We don't need to push all these interactions into a central server and periodically reconcile them with the blockchain.

Solana makes having the application operate directly against shared on-chain state much more practical.

2. What should we actually build with these capabilities?
   Here's the distinction I want us to adopt.
   Weak reason to use Solana Strong reason to use Solana
   Store user information Maintain shared, authoritative application state
   Process payments Coordinate trustless multi-party exchanges
   Record events Enforce the order and rules of competing actions
   Issue NFTs Create programmable ownership and access rights
   Use a smart contract as a database Make the smart contract the application's actual engine

There is one additional filter I want to introduce.

The blockchain removal test:

Imagine we shut down our frontend tomorrow.

Could another developer build a completely different interface that interacts with the same program and accesses the same application state?

Could users still participate without our permission?

Could the system continue operating without our servers making the important decisions?

If the answer is yes, we're approaching something genuinely decentralized. 3. Three directions I'd explore from these fundamentals
I don't want to suggest another AI wallet, prediction market, NFT marketplace or DeFi dashboard.

These are three different types of DApps where Solana would be part of the actual product engine.
Idea A — MESH: A permissionless resource-allocation network
My strongest candidate

swissborg.com

The problem: Valuable resources are fragmented. Different people and organizations own spare capacity, while other people need access to it.

Think about:

- Computing capacity.
- Storage capacity.
- Charging stations.
- Equipment.
- Temporary workspace.
- Network bandwidth.
  What if these resources could participate in one open allocation protocol?

Here's an example.

Joseph owns five hours of GPU capacity. Sarah needs GPU capacity. Brian owns another GPU.

MESH coordinates their participation without requiring them to trust a company that owns the marketplace.

The user experience:

1. Joseph publishes five available GPU-hour slots and their prices.
2. Sarah requests two hours.
3. Brian publishes three hours.
4. The protocol allocates resources according to its on-chain rules.
5. Each reservation becomes an on-chain lease.
6. Payments, collateral and cancellation conditions are enforced by the program.
   What actually lives on Solana?
   Resource availability
   On-chain

Reservations and leases
On-chain

Allocation rules
On-chain

Collateral and settlement
On-chain

Frontend and search
Off-chain support

Why Solana?

Multiple participants can interact with shared resource pools, while independent reservations operate against separate state accounts. Its parallel execution, PDAs and atomic token interactions make the protocol practical.

Most importantly, different applications could use the same resource pools without needing to trust each other's databases.

The infrastructure product would be an SDK for any provider to make their resources available to the network. The consumer product would be the resource marketplace itself.

The biggest challenge is verifying that an off-chain resource was actually delivered. We'd need to design this honestly, using provider attestations, customer acknowledgements and dispute rules.
Idea B — CROWDSTATE: A blockchain-powered collective truth network
Interesting infrastructure opportunity

medium.com

Imagine a question:

"Is this road currently flooded?"

One person reports yes.

Another reports no.

A third submits photographic evidence.

A fourth disputes the first report.

Instead of trusting one company's database, CROWDSTATE creates an open network in which independent participants contribute information, stake on their claims and challenge disputed observations.

Its smart contract manages:

- Observation submissions.
- Participant stakes.
- Evidence commitments.
- Dispute periods.
- Resolution rules.
- Rewards and penalties.
  Applications can consume the resulting shared information.

Think of a live public information layer for transportation, infrastructure, local services or environmental conditions.

Why Solana?

The network needs many small, independent state updates, a shared authoritative record and automated economic consequences for claims and disputes.

The difficulty is that financial incentives don't automatically make information true. We'd need serious Sybil resistance and verification mechanisms.
Idea C — WORLDSTATE: An economy that actually runs on-chain
Best pure on-chain demonstration

playground.ru

This is a different approach entirely.

Instead of using blockchain to support a game, the blockchain is the game engine.

Imagine a persistent multiplayer world.

Players own territories, gather resources, build infrastructure, trade and compete.

But here's the interesting part:

- The game state exists on Solana.
- Every action changes authoritative on-chain state.
- Game rules are enforced by programs.
- Resources and ownership aren't controlled by a central game company.
- Independent developers could build other interfaces or mechanics that interact with the same world.
  This is an application that genuinely benefits from Solana's shared state, low-cost interactions, PDAs and parallel execution.

The bigger vision is an interoperable world rather than an isolated game.

It would be technically impressive, although we'd need a genuinely compelling game mechanic to stand out from existing on-chain games.

4. Comparing the three
   These are preliminary assessments, not proof that any concept is unprecedented.
   MESH CROWDSTATE WORLDSTATE
   On-chain necessity Very high Very high Very high
   Real-world usefulness High High Medium
   Solana architecture utilization High High Very high
   Weekend feasibility Medium Medium High
   Consumer + infrastructure potential Very high High High
   Main technical risk Delivery verification Truth and Sybil resistance Game design and execution

5. My actual recommendation
   I want to investigate MESH further, but I don't want to commit to the GPU marketplace example just yet.

There's a much more interesting possibility behind it:

Build a permissionless coordination protocol for resources that many independent participants need to share, allocate and exchange in real time.

The distinction is that we're not creating a company that owns a marketplace.

We're creating the rules and infrastructure that allow marketplaces to exist without a central owner.

That fits your preference for building both a consumer DApp and infrastructure developers can integrate.

But I want to pressure-test one thing before we move forward. 6. The question that should guide our next investigation
Which of these fundamental capabilities should we exploit most aggressively?

Massively concurrent participation

Thousands of users interacting with one shared system simultaneously. Think global coordination, multiplayer systems and live resource allocation.

Atomic composability

Multiple independent programs and participants interacting in one indivisible operation. Think entirely new forms of exchange and coordination.

Permissionless ownership and execution

Build systems that no single company controls, where users own assets and programs enforce rules independently.

Combine all three

Find an application that uses all these characteristics together rather than optimizing for just one.

Explore this direction
My personal preference is the last option.

I want us finding something where Solana's parallel execution, shared global state and atomic composability work together to create an entirely new kind of application.

That's the standard I'm setting for this project. Not a Web2 product with a wallet button. Not a blockchain receipt generator. A DApp that would lose its fundamental purpose without Solana.

For our Solana hackathon idea, prioritize this fundamental capability: all. Develop original DApp concepts around it, with Solana as the indispensable application engine.

Worked for 1m 11s

Okay. Now I want to approach this as a protocol designer.

You've chosen the most demanding direction: we want an application that exploits shared state + parallel execution + atomic composability + permissionless participation together.

But there's a subtlety I want us to understand before generating ideas:

- Shared state gives independent participants a common source of truth.
- Parallel execution allows independent actions to happen without unnecessarily waiting for one another.
- Atomic composability allows several operations, potentially involving multiple programs, to become one indivisible action.
- Permissionless participation means nobody needs our company's approval to interact with the protocol.
  These aren't four features we should put on a landing page. They should determine how the application works.

1. The design principles for our project
   First, a technical correction that matters for our architecture.

Solana doesn't magically execute every transaction simultaneously. Its runtime uses account access declarations to identify which transactions can execute concurrently. Transactions that write to the same account can conflict and require coordination.

That means we should deliberately design our application around independently writable accounts, rather than having everything update one giant shared account.
solana.com+1

Here's how I'd translate the architecture into product opportunities:
Solana capability Product opportunity
Shared account state A common marketplace or world nobody owns
Parallel execution Thousands of independent participants acting simultaneously
Atomic transactions Complex exchanges that either complete entirely or don't happen
CPIs Different protocols participating in one operation
PDAs Autonomous escrow, ownership and state machines without private-key custodians

And this is important: Solana programs can invoke other programs through CPIs, while PDAs let programs authorize actions on accounts without a conventional private key.
solana.com+1

Now let's use these properties to design products. 2. Four DApp concepts
These aren't four variations of a marketplace. Each explores a different way to use Solana as the actual application engine.
Concept 1 — CIRCUIT
My strongest candidate
DeFi / Coordination

A marketplace where trades don't need to happen between just two people.

bitzo.com

The problem: The double coincidence problem
Let's imagine three people.

- Joseph has something Sarah wants.
- Sarah has something Brian wants.
- Brian has something Joseph wants.
  They all want to trade, but nobody has a direct buyer for what they're offering.

In a traditional marketplace, these three people might never complete their trades.

CIRCUIT introduces a different exchange model:

Instead of requiring direct buyers and sellers, it discovers and executes circular exchanges involving multiple participants.
A real example
Let's use digital resources to make this concrete.
A three-person exchange cycle
Joseph
Participant A

Offers 10 WOOD tokens
Wants 5 STONE

Sarah
Participant B

Offers 5 STONE tokens
Wants 3 WATER

Brian
Participant C

Offers 3 WATER tokens
Wants 10 WOOD

CYCLE COMPLETED

All three exchanges happen together.

Joseph receives stone, Sarah receives water, Brian receives wood.

Notice something important.

None of the three people needs to find a direct buyer.

The network discovers a circular arrangement that makes all three trades possible.
Why Solana is the actual engine
Let's examine what happens behind the scenes.

1. Shared state

Every participant publishes an offer to the same permissionless on-chain exchange protocol.

Each offer has its own PDA containing:

- Owner.
- Offered asset and quantity.
- Desired asset and quantity.
- Expiry.
- Status.
  Any compatible frontend or matching service can read these offers.

2. Parallel execution

Imagine 10,000 participants creating offers.

Offers are stored in separate accounts. Different matching cycles can be settled concurrently when their account sets don't conflict.

We aren't forcing every trade through one centralized database or one giant mutable account.

3. Atomic composability

This is the killer feature.

CIRCUIT submits a transaction containing all three transfers.

The program verifies the offers and invokes the SPL Token Program through CPIs to execute the transfers.

If one participant's offer is invalid, the entire transaction fails.

Nobody gets left having surrendered their asset without receiving their exchange.

4. Permissionless participation

Other developers can build their own trading interfaces, matching algorithms and specialized marketplaces on top of CIRCUIT.

They don't need to ask us for permission.
What could this become?
The first application could support:

- On-chain game resources.
- Digital collectibles.
- Tokenized service credits.
- Digital access rights.
  The bigger vision is a protocol for circular exchange across independent digital economies.

A game could expose its resources to CIRCUIT. Another application could provide its own matching interface. A third could create automated exchange strategies.

All would interact with the same underlying settlement rules.

Our potential moat: A growing network of compatible offers, assets, matching services and applications.

The limitation: circular trading is not a new mathematical concept, and there are existing multi-party exchange approaches. We would need to demonstrate a differentiated product and a useful market, not claim to have invented atomic swaps.

Concept 2 — COMMONS
DePIN / Infrastructure
Resources that belong to everyone, without a central operator.

x.com

Imagine a world where people own resources that they aren't using all the time.

Joseph owns a powerful computer but only uses it at night.

Sarah needs computing power during the day.

Brian has storage capacity that he rarely uses.

Today, these resources are usually isolated.

COMMONS would provide a shared protocol through which independently owned resources can be offered, allocated, reserved and exchanged.
How a user experiences it
Joseph registers a resource and makes it available for three hours.

Sarah requests two hours.

Brian offers additional capacity.

The protocol manages the allocation.
Shared resource pool
GPU capacity
Available

5h
Joseph

3h
Brian

2h
Sarah needs

Reservation
Allocated

Two hours reserved from Joseph's available capacity.

Why Solana?
The resource allocation itself is an on-chain state transition.

- Providers publish available capacity.
- Users request reservations.
- The program prevents conflicting allocations.
- Reservations can be represented by transferable or restricted on-chain rights.
- Payment and reservation can execute atomically.
- Independent resource pools can operate concurrently.
  A different application could access the same resources through the protocol.
  Where it gets interesting
  Instead of building another GPU marketplace, COMMONS could become a general resource coordination protocol.

For example:

- Shared charging infrastructure.
- Community-owned equipment.
- Storage networks.
- Computing capacity.
- Temporary access to expensive resources.
  The hard problem is verifying actual resource availability and delivery. On-chain reservations alone don't prove that somebody has supplied a working GPU or charging station.

We would need hardware attestations, trusted measurements or dispute mechanisms.

My concern: This space overlaps with established DePIN networks, so we would need a very specific underserved resource category to differentiate ourselves.
Solana+1

Concept 3 — FRONTIER
Gaming / Fully on-chain
A world that nobody owns, and everybody changes.

instant-gaming.com

This is not another NFT game.

Imagine a persistent world with thousands of players.

Every player can:

- Claim territory.
- Gather resources.
- Build structures.
- Trade with other players.
- Form alliances.
- Attack competing territories.
- Change the environment.
  But the interesting part is that the world's rules and authoritative state exist on Solana.

There is no central game server that can secretly decide who owns a territory or change the result of a battle.
The interesting mechanic: A shared evolving world
Imagine that players collectively influence the environment.

Joseph builds a dam.

Sarah's territory receives more water.

Brian's territory becomes dry.

The three players now have competing interests.

They can negotiate, trade, build infrastructure or fight over control.

Their actions affect a shared world rather than isolated player profiles.
Why Solana?

- Shared state: all players interact with the same world.
- Parallelism: separate territories can be updated independently.
- Atomicity: a battle can simultaneously transfer territory, resources and rewards.
- Composability: third-party developers can create additional buildings, weapons, marketplaces and game modes that interact with the same world.
  The architecture would divide the world into independently writable regions, avoiding a single account becoming a bottleneck.
  The bigger opportunity
  Imagine other developers building their own interfaces and game mechanics against the same world.

One developer creates a strategy interface.

Another builds an economic simulation.

Another creates a battle game.

They all interact with the same underlying ownership and world state.

This starts looking like an open gaming ecosystem rather than a single game.

My concern: Fully on-chain games are already an established Solana category. We need a genuinely addictive game mechanic, not just the fact that everything is on-chain.
Solana+1

Concept 4 — PACT
Coordination / DeFi infrastructure
Make collective actions executable.

ixbt.com

This one is slightly more abstract, but I think it's worth exploring.

Consider situations where one person cannot achieve something alone.

For example:

- Five people want to purchase an expensive shared asset.
- Ten people want to jointly acquire an investment.
- A community wants to fund and construct something.
- Several independent protocols want to execute a coordinated operation.
  Today, coordination typically happens through messaging groups, spreadsheets, individual payments and someone trusted to manage the funds.

PACT turns collective participation into a programmable on-chain process.
How it works
A user creates a collective action.

For example:

"We need five people to contribute 20 USDC each to purchase a shared digital asset."

Participants commit their contributions.

The program tracks:

- Who has committed.
- How much is committed.
- Whether the required conditions are satisfied.
- What happens when the deadline expires.
- How ownership is distributed after execution.
  When all conditions are met, the entire operation executes atomically.

If they aren't met, the participants can reclaim their funds according to the program rules.
Why Solana?
The collective action is a shared on-chain state machine.

Contributions from different users update independent participant accounts.

Once the required conditions are satisfied, a single transaction can:

1. Verify the commitments.
2. Transfer the pooled assets.
3. Acquire the target asset through another program.
4. Issue ownership shares.
5. Close the campaign.
   Any failure reverts the whole operation.

The protocol becomes reusable by other applications.

My concern: Group funding and DAOs already exist. The differentiator would need to be more advanced collective execution across multiple independent protocols, not another crowdfunding application. 3. Which of these actually exploits all three capabilities?
Let's score the ideas against our architectural requirements.
Concept Shared state Parallelism Atomic composition
CIRCUIT Offers and trade graph Independent exchange cycles Multi-party settlement
COMMONS Resource availability Independent reservations Allocation + payment + access
FRONTIER Shared game world Independent regions and players Battles, crafting and ownership
PACT Collective commitments Independent campaigns and participants Multi-party execution

My assessment:
Best architectural fit
CIRCUIT

It gives us a very clear reason for all three capabilities to exist in the same application.
Best real-world infrastructure potential
COMMONS

It could become a reusable coordination layer for independently owned resources.
Best visual demonstration
FRONTIER

Judges can immediately see the consequences of transactions changing a shared world.
Best protocol abstraction
P ACT

A reusable engine for collective commitments and conditional execution. 4. One important competitive filter
I also checked whether similar ideas already exist.

There are some projects we should be careful not to reinvent.

- SwarmHaul coordinates multiple agents and physical delivery participants through on-chain task allocation and settlement.
  GitHub+1
- AgenC already provides agent task marketplaces, escrow and settlement on Solana.
  agenc+1
- Helium and other DePIN projects already demonstrate community-powered physical infrastructure.
  Solana
- Fully on-chain multiplayer games are also an established category, with projects such as Supersize.
  Colosseum
  This is why I wouldn't pursue generic AI swarms, generic GPU marketplaces or generic multiplayer games.

CIRCUIT has a different central primitive: finding and executing exchanges involving multiple independent parties when no direct pairwise trade exists.

That is the particular problem I want to investigate further. 5. Let's pressure-test CIRCUIT before choosing it
I don't want to select it just because the architecture looks elegant.

There are three questions.
Question 1: Is this a problem people actually experience?
Yes, potentially.

Think beyond game tokens:

- Players trying to exchange items across different economies.
- Creators exchanging digital licenses and assets.
- Developers exchanging API credits and service entitlements.
- Communities exchanging resources without needing a central marketplace operator.
  The strongest initial market is probably interoperable digital assets and game economies, because ownership and transfer can be represented on-chain.

Physical goods and services introduce delivery verification problems that we shouldn't pretend to have solved.
Question 2: Can we make a genuinely impressive weekend demo?
I think so.
CIRCUIT — Weekend MVP
Buildable prototype
The essential features

1. Connect Solana wallet.
2. Create an exchange offer using SPL tokens.
3. Lock offered tokens into a program-controlled PDA.
4. Display all available offers from the on-chain protocol.
5. Find a three-person exchange cycle.
6. Execute all three transfers atomically.
7. Show the resulting ownership changes and transaction signature.

The demo's killer moment

Three people have assets nobody else wants directly.

CIRCUIT finds their circular match.

One transaction later, everybody has what they wanted.

If one offer expires, nobody loses anything.

We can use three test SPL tokens representing different resources and seed three wallets for the demonstration.

We don't need a sophisticated AI model. A basic off-chain graph-matching algorithm can discover candidate cycles. The on-chain program independently validates and executes them.
Question 3: Can this become infrastructure?
This is where it gets interesting.

Imagine a game developer wants to let players trade items.

Instead of building an entire exchange engine, they integrate CIRCUIT.

A different developer wants to trade digital access rights. They integrate the same protocol.

Both applications share the same underlying exchange infrastructure.

The protocol becomes more valuable as compatible assets, applications and participants join it.

That's a better long-term direction than owning one marketplace.

6. My verdict
   Recommended for deeper investigation
   CIRCUIT is currently my first choice, but it is not yet a proven winner.

It has a clear technical thesis, a demonstrable user problem, and a realistic weekend prototype.

I would not yet claim it is unprecedented. We still need to investigate competing barter protocols, multi-party exchange implementations and existing Solana programs before making that claim.

Also, the hackathon judges explicitly want a working product where Solana's speed, low fees and composability are fundamental, not decorative. CIRCUIT has a credible route to demonstrating that.
Major League Hacking

One decision before we go deeper
I want to know which direction of product we're actually excited about, because these lead to very different implementations.
Which concept should we investigate first?

CIRCUIT — Multi-party circular exchange

COMMONS — Permissionless resource coordination

FRONTIER — Fully on-chain evolving world

PACT — Collective execution protocol

None yet. Generate more radically different concepts.

If we investigate CIRCUIT, which initial market sounds most interesting?

Interoperable game economies and digital items

Digital assets, licenses and creator resources

Developer resources and service credits

A general-purpose exchange protocol

Continue our investigation
One thing I want us to preserve throughout this process: we are looking for a new primitive that developers and users can build on, not just another application competing for users.

That's the kind of project I'd rather spend this weekend building. 🔥

lets use circuit i'm not sure thos what goods users would like to exchnage tho I know if its infrastructure then year devs could use it in their stuff for us building b2c aint that easy i need you thoughts on this

Worked for 17s

I actually agree with your instinct here. CIRCUIT probably makes more sense as infrastructure for developers than as a consumer barter app.

And there's a big difference between those two directions.

If we build a B2C app, we're asking ordinary people to:

- Discover the platform.
- Understand why they'd barter instead of sell or buy.
- Find someone offering exactly what they need.
- Trust that enough people will use it for the marketplace to be useful.
  That's a nasty cold-start problem. Even if the technology works beautifully, we could end up with an empty marketplace.

With infrastructure, we're solving a different problem: developers already have users, assets and economies. We give them a new way for those economies to exchange value.

That's a much more interesting direction to investigate.
The positioning I'd pursue
I wouldn't pitch CIRCUIT as a place where people barter tokens. I'd pitch it as:
CIRCUIT is a developer protocol for settling multi-party asset exchanges atomically, without requiring every participant to find a direct trading partner.

Think of it as a settlement primitive that another application can integrate.
Who could actually use it?
I'd investigate these markets, in this order:

1. On-chain game economies My first choice

A game has wood, ore, food, equipment, crafting materials and other assets. Players have resources other players need, but direct matches aren't always available. CIRCUIT could settle a three-or-more-player exchange as one operation.

Potential integrators: game studios and developers building onchain games.

2. Creator and community platforms
   Communities issue access passes, event credits, collectibles or redeemable rewards. CIRCUIT could let members exchange compatible assets across participating communities.

Potential integrators: creator platforms, membership apps and event platforms.

3. Digital asset marketplaces
   Marketplaces could support complex exchanges involving multiple sellers and buyers, rather than limiting every trade to one buyer and one seller.

Potential integrators: NFT, collectible and tokenized-asset marketplaces.

I lean toward games for the first demonstration. The assets and exchange logic are easy to understand visually, and Solana's developer documentation already describes open, composable in-game economies as a use case.
Solana

But here's the important distinction: we shouldn't build a game. We should build something game developers can plug into their games.
There's an important competitor we need to account for
I checked the current Solana ecosystem and found something worth knowing: the Solana Foundation has a Delivery-versus-Payment (DvP) program. It supports atomic settlement between two parties exchanging assets.
Solana+1

That doesn't automatically kill CIRCUIT. But it means we cannot claim that atomic asset exchange itself is our innovation.

Our potential differentiation is the multi-party exchange problem:

- Existing two-party settlement: Alice gives Bob an asset; Bob gives Alice another.
- CIRCUIT: Alice gives Bob an asset, Bob gives Charlie another, and Charlie gives Alice another — all settle together.
  That's a different coordination primitive. There is also academic work on multi-party atomic swaps, so we shouldn't claim to have invented the concept either.
  arXiv

What I think we should actually build
I'd split CIRCUIT into three pieces:
1 · On-chain protocol
The settlement engine

An Anchor program that:

- Registers exchange offers.
- Holds offered tokens in program-controlled escrow.
- Validates a proposed exchange cycle.
- Executes every transfer atomically.
- Allows cancellation and refunds under defined conditions.

2 · Matching engine
The discovery layer

Finds compatible offers and proposes exchange cycles. This can run off-chain. It doesn't need to be trusted because the Solana program independently checks every offer and transfer before settlement.

3 · Developer SDK
The integration layer

A TypeScript SDK that lets another developer create offers, retrieve available offers, find possible cycles and submit settlements without having to understand all the underlying program instructions.

This gives us an actual developer product rather than just a smart contract with a nice frontend.
One example of how a developer would use it
Imagine a game developer integrating CIRCUIT into their game.

Three players have these inventories:
Player Gives Wants
Alice 10 Wood 5 Stone
Bob 5 Stone 3 Food
Charlie 3 Food 10 Wood

Nobody needs to buy anything with USDC. Nobody needs to find a direct trading partner.

CIRCUIT finds the cycle and settles all three exchanges together. If one offer is invalid or a participant hasn't properly escrowed their assets, the entire settlement fails.

And because the assets are on Solana, ownership and settlement can be verified independently of the game developer's own server.
But there's a problem we need to solve
Developers won't integrate CIRCUIT simply because it's technically interesting.

They'll ask:

- Why not implement trading inside my own game?
- Why should I expose my game assets to an external protocol?
- What does CIRCUIT give me that existing marketplaces don't?
- Why should I trust an external program with my users' assets?
  Our strongest answer would be that CIRCUIT provides shared, interoperable exchange infrastructure. Different applications can use the same settlement standard instead of each building isolated exchange logic.

That benefit only becomes meaningful when multiple applications participate. So our long-term vision could be a network of applications whose assets can be exchanged through a common protocol.

We should not pretend that network already exists, though. For the hackathon, we demonstrate the primitive and make integration genuinely easy.
My recommendation
I'd commit to a game-economy reference integration, but keep the protocol general-purpose.

For the weekend MVP:

1. Deploy the CIRCUIT Anchor program to Devnet.
2. Create three test SPL tokens representing game resources.
3. Allow wallets to create and escrow exchange offers.
4. Build a matcher that discovers three-party cycles.
5. Settle a complete cycle in one transaction.
6. Provide a TypeScript SDK and a small demo game inventory interface.
   The SDK is important. A working demo proves the concept; an SDK shows judges that someone else could actually build on it.

One architectural detail: independent exchanges should be able to settle concurrently when their writable accounts don't conflict. We shouldn't claim every exchange runs in parallel.

The decision I'd make before we code
I want us to settle one positioning question:
What should CIRCUIT become?

Universal exchange protocol

Any compatible application can integrate CIRCUIT. Games are just our first demonstration.

Game economy infrastructure

Focus specifically on game developers, game resources and interoperable in-game economies.

Multi-party marketplace infrastructure

Focus on marketplaces that need complex exchanges between multiple buyers and sellers.

Go with this direction
My vote is universal protocol, gaming as the first use case. That gives us a focused demo without unnecessarily limiting what we're building.

I don't want us spending the entire weekend building another marketplace that happens to use Solana. We should build a primitive other developers would actually want to integrate.

For CIRCUIT, let's pursue: universal. Help me refine the positioning, validate the use cases and design the protocol.

Worked for 1m 9s

CIRCUIT — protocol strategy
I think we've landed on a stronger direction.

CIRCUIT should be a universal protocol for coordinating and atomically settling multi-party exchanges of digital assets.

Not a marketplace. Not a game. Not a token-swapping frontend.

It's infrastructure that applications can integrate when their users need to exchange assets across multiple participants, and a direct one-to-one trade isn't sufficient.

The distinction I want us to protect throughout development is:

- CIRCUIT owns the exchange rules and settlement.
- Integrating applications own their user experience and asset utility.
- Matching services discover possible exchanges but cannot dictate what gets settled.
  That separation is important. It gives us a protocol that can serve different applications without becoming dependent on any one marketplace.

1. Validate the use cases before choosing our first market
   A universal protocol doesn't mean every asset should be exchangeable with every other asset. It means applications can define assets and exchange rules, while CIRCUIT provides a common settlement mechanism.

Here are the use cases I'd take seriously:
Use case Exchange example Why multi-party settlement helps
Games Wood ↔ Stone ↔ Food Players don't need direct trading matches
Creator ecosystems Event credits ↔ membership passes ↔ collectibles Assets from different creators can participate in a coordinated exchange
Digital marketplaces Collectible A ↔ Collectible B ↔ tokenized item C Multiple sellers and buyers can settle together
Developer platforms API credits ↔ compute credits ↔ storage credits Different service providers could exchange standardized credits

My take:

- Games: easiest to demonstrate and explain.
- Creator ecosystems: interesting, but interoperability and asset utility need proving.
- Marketplaces: clear trading problem, but competition is substantial.
- Developer/service credits: potentially valuable, but redemption and provider trust introduce complexity.
  The strongest initial hypothesis is that CIRCUIT is useful anywhere assets are independently issued, independently owned, and have different holders who want to exchange them.

There's an important caveat: a protocol can settle digital ownership, but it cannot guarantee that an off-chain promise is fulfilled. For example, transferring a storage credit doesn't prove the provider actually delivered storage. 2. The actual problem CIRCUIT solves
I want to sharpen the problem statement because "multi-party exchanges" sounds technical, but the user problem needs to be obvious.

Imagine three independent applications:

- A game issues WOOD tokens.
- A creator platform issues EVENT tokens.
- A community platform issues ACCESS tokens.
  Their users hold assets they don't necessarily want, while other users want those assets and have something different to offer.

Traditional marketplaces generally expect someone to sell an asset for a common currency, or find a direct counterparty. CIRCUIT explores another possibility: find a chain of compatible offers and settle the entire chain together.

The core product is therefore not the matching algorithm. Graph algorithms already exist. The product is the combination of:

1. Persistent, user-authorized exchange offers.
2. Program-controlled escrow.
3. Permissionless discovery and matching.
4. On-chain validation of the complete exchange.
5. Atomic settlement without requiring everyone to be online and sign again at the same moment.
   That fifth point is especially important.
   Why does Solana matter?
   A regular Solana transaction can already contain multiple token transfers, and transactions execute atomically. So we mustn't pretend that CIRCUIT invented atomic transactions.

Solana's DvP program already supports audited bilateral delivery-versus-payment settlement. Its documented limitations include bilateral-only trades, no matching or order book, and no netting.
Solana+1

CIRCUIT's proposed contribution is a higher-level protocol for standing exchange intents and multi-party cycle settlement.

Here's the distinction:
Without CIRCUIT With CIRCUIT
Coordinate participants manually Offers remain available for matching
Gather signatures at settlement time Participants authorize escrow in advance
Build custom exchange logic Integrate a shared protocol
Implement cycle validation yourself CIRCUIT validates the complete cycle
Build your own escrow lifecycle Reuse standardized offer, cancellation and settlement rules

This is a much stronger reason to integrate us. 3. Refined positioning
CIRCUIT
Exchange beyond direct counterparties.
A permissionless multi-party exchange protocol for Solana.

CIRCUIT lets applications create, discover and settle coordinated exchanges between multiple asset holders. Participants commit assets to program-controlled escrow, compatible offers are matched into exchange cycles, and the protocol settles the entire cycle atomically.

The one-line pitch

"CIRCUIT lets any Solana application support multi-party asset exchanges without building its own matching, escrow and settlement infrastructure."

I would avoid calling it a DEX. DEX implies a conventional trading market, liquidity pools or order books. CIRCUIT is closer to an exchange coordination and settlement layer.

And I would avoid saying "cross-application asset interoperability" as our main promise just yet. Two applications can technically use SPL tokens without agreeing that their assets have meaningful utility. Interoperability needs participating issuers and actual use cases.

4. Protocol architecture
   Here's the architecture I'd work toward.
   Integrating applications

Games · Marketplaces · Creator platforms · Other apps

TypeScript SDK / client integration

Off-chain matching network

Indexes offers, builds an asset graph, discovers compatible cycles and submits settlement transactions.
Untrusted by design

Proposed cycle

CIRCUIT Solana program
Offer registry

Escrow

Cycle validation

Settlement

Cross-program invocations

SPL Token Program

Transfers the escrowed assets to their new owners

The matching engine can be centralized initially, decentralized later. The important thing is that it cannot force a settlement that the on-chain program doesn't approve.

Solana's account model stores state in accounts, while programs execute instructions against those accounts. CPIs let our program invoke token transfers, and PDAs give the program authority over its escrow accounts.
Solana+3

The core data structures
I'd start with these:
Account Purpose
Offer Stores a participant's exchange terms and status
EscrowAuthority PDA controlling an offer's escrow
EscrowTokenAccount Holds the offered tokens
MakerCounter (optional) Tracks offer IDs for unique PDA derivation

An offer should contain:
pub struct Offer {
pub maker: Pubkey,
pub give_mint: Pubkey,
pub want_mint: Pubkey,
pub give_amount: u64,
pub want_amount: u64,
pub nonce: u64,
pub expiry: i64,
pub status: OfferStatus,
pub bump: u8,
}

pub enum OfferStatus {
Open,
Filled,
Cancelled,
Expired,
}

For example, Alice creates:
Give: 10 WOOD
Want: 5 STONE
Expiry: 2 hours

Her 10 WOOD goes into an escrow token account controlled by a CIRCUIT PDA. Alice doesn't need to stay online while the matcher looks for compatible offers. 5. How an exchange cycle works
Let's define the exchange mathematically so the program has precise rules.

Each offer is a directed edge:
\[
\text{Give asset} \longrightarrow \text{Want asset}
\]

For a three-person cycle:
Alice
10 WOOD → wants 5 STONE

Bob
5 STONE → wants 3 FOOD

Charlie
3 FOOD → wants 10 WOOD

Cycle completed

All three transfers happen together, or none do.

The matcher discovers this cycle. The program independently checks:

1. Every offer exists and belongs to CIRCUIT.
2. Every offer is still open and hasn't expired.
3. Each offer belongs to a different participant.
4. Each requested mint matches the next offer's offered mint.
5. Each requested quantity exactly matches the next offer's quantity.
6. Every escrow contains the required amount.
7. The destination accounts belong to the intended recipients.
   Then it performs the transfers and marks all offers as filled.

Important: This is full-fill settlement in the first version. No partial fills, price negotiation or order-book functionality. Keeping those out makes the protocol considerably easier to secure.
The program instructions
I'd define the public interface around five instructions:
Instruction Who can call it? What it does
create_offer Offer maker Creates offer PDA and deposits tokens
cancel_offer Offer maker Returns escrowed tokens
expire_offer Anyone, after expiry Returns tokens to maker
settle_cycle Anyone Validates and executes a compatible cycle
close_offer Optional cleanup Closes a terminal offer account

settle_cycle is the heart of the protocol.

It should not require the original makers to sign again. Their original escrow deposits are their authorization to settle according to the terms they accepted.

This also makes settlement permissionless: any matcher, application or third-party bot can submit a valid cycle.
The state machine
#chatgpt-mermaid-_r_3v6_{font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";font-size:16px;fill:rgb(237, 237, 237);}@keyframes edge-animation-frame{from{stroke-dashoffset:0;}}@keyframes dash{to{stroke-dashoffset:0;}}#chatgpt-mermaid-_r_3v6_ .edge-animation-slow{stroke-dasharray:9,5!important;stroke-dashoffset:900;animation:dash 50s linear infinite;stroke-linecap:round;}#chatgpt-mermaid-_r_3v6_ .edge-animation-fast{stroke-dasharray:9,5!important;stroke-dashoffset:900;animation:dash 20s linear infinite;stroke-linecap:round;}#chatgpt-mermaid-_r_3v6_ .error-icon{fill:rgb(48, 48, 48);}#chatgpt-mermaid-_r_3v6_ .error-text{fill:rgb(237, 237, 237);stroke:rgb(237, 237, 237);}#chatgpt-mermaid-_r_3v6_ .edge-thickness-normal{stroke-width:1px;}#chatgpt-mermaid-_r_3v6_ .edge-thickness-thick{stroke-width:3.5px;}#chatgpt-mermaid-_r_3v6_ .edge-pattern-solid{stroke-dasharray:0;}#chatgpt-mermaid-_r_3v6_ .edge-thickness-invisible{stroke-width:0;fill:none;}#chatgpt-mermaid-_r_3v6_ .edge-pattern-dashed{stroke-dasharray:3;}#chatgpt-mermaid-_r_3v6_ .edge-pattern-dotted{stroke-dasharray:2;}#chatgpt-mermaid-_r_3v6_ .marker{fill:rgb(175, 175, 175);stroke:rgb(175, 175, 175);}#chatgpt-mermaid-_r_3v6_ .marker.cross{stroke:rgb(175, 175, 175);}#chatgpt-mermaid-_r_3v6_ svg{font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";font-size:16px;}#chatgpt-mermaid-_r_3v6_ p{margin:0;}#chatgpt-mermaid-_r_3v6_ defs [id$="-barbEnd"]{fill:rgb(175, 175, 175);stroke:rgb(175, 175, 175);}#chatgpt-mermaid-_r_3v6_ g.stateGroup text{fill:rgb(31, 78, 148);stroke:none;font-size:10px;}#chatgpt-mermaid-_r_3v6_ g.stateGroup text{fill:rgb(237, 237, 237);stroke:none;font-size:10px;}#chatgpt-mermaid-_r_3v6_ g.stateGroup .state-title{font-weight:bolder;fill:rgb(237, 237, 237);}#chatgpt-mermaid-_r_3v6_ g.stateGroup rect{fill:rgb(9, 23, 44);stroke:rgb(31, 78, 148);}#chatgpt-mermaid-_r_3v6_ g.stateGroup line{stroke:rgb(175, 175, 175);stroke-width:1;}#chatgpt-mermaid-_r_3v6_ .transition{stroke:rgb(175, 175, 175);stroke-width:1;fill:none;}#chatgpt-mermaid-_r_3v6_ .stateGroup .composit{fill:transparent;border-bottom:1px;}#chatgpt-mermaid-_r_3v6_ .stateGroup .alt-composit{fill:#e0e0e0;border-bottom:1px;}#chatgpt-mermaid-_r_3v6_ .state-note{stroke:rgb(58, 132, 63);fill:rgb(48, 48, 48);}#chatgpt-mermaid-_r_3v6_ .state-note text{fill:rgb(237, 237, 237);stroke:none;font-size:10px;}#chatgpt-mermaid-_r_3v6_ .stateLabel .box{stroke:none;stroke-width:0;fill:rgb(9, 23, 44);opacity:0.5;}#chatgpt-mermaid-_r_3v6_ .edgeLabel .label rect{fill:rgb(9, 23, 44);opacity:0.5;}#chatgpt-mermaid-_r_3v6_ .edgeLabel{background-color:rgb(0, 0, 0);text-align:center;}#chatgpt-mermaid-_r_3v6_ .edgeLabel p{background-color:rgb(0, 0, 0);}#chatgpt-mermaid-_r_3v6_ .edgeLabel rect{opacity:0.5;background-color:rgb(0, 0, 0);fill:rgb(0, 0, 0);}#chatgpt-mermaid-_r_3v6_ .edgeLabel .label text{fill:rgb(237, 237, 237);}#chatgpt-mermaid-_r_3v6_ .label div .edgeLabel{color:rgb(237, 237, 237);}#chatgpt-mermaid-_r_3v6_ .stateLabel text{fill:rgb(237, 237, 237);font-size:10px;font-weight:bold;}#chatgpt-mermaid-_r_3v6_ .node circle.state-start{fill:rgb(175, 175, 175);stroke:rgb(175, 175, 175);}#chatgpt-mermaid-_r_3v6_ .node .fork-join{fill:rgb(175, 175, 175);stroke:rgb(175, 175, 175);}#chatgpt-mermaid-_r_3v6_ .node circle.state-end{fill:rgb(31, 78, 148);stroke:transparent;stroke-width:1.5;}#chatgpt-mermaid-_r_3v6_ .end-state-inner{fill:transparent;stroke-width:1.5;}#chatgpt-mermaid-_r_3v6_ .node rect{fill:rgb(9, 23, 44);stroke:rgb(31, 78, 148);stroke-width:1px;}#chatgpt-mermaid-_r_3v6_ .node polygon{fill:rgb(9, 23, 44);stroke:rgb(31, 78, 148);stroke-width:1px;}#chatgpt-mermaid-_r_3v6_ [id$="-barbEnd"]{fill:rgb(175, 175, 175);}#chatgpt-mermaid-_r_3v6_ .statediagram-cluster rect{fill:rgb(9, 23, 44);stroke:rgb(31, 78, 148);stroke-width:1px;}#chatgpt-mermaid-_r_3v6_ .cluster-label,#chatgpt-mermaid-_r_3v6_ .nodeLabel{color:rgb(237, 237, 237);}#chatgpt-mermaid-_r_3v6_ .statediagram-cluster rect.outer{rx:5px;ry:5px;}#chatgpt-mermaid-_r_3v6_ .statediagram-state .divider{stroke:rgb(31, 78, 148);}#chatgpt-mermaid-_r_3v6_ .statediagram-state .title-state{rx:5px;ry:5px;}#chatgpt-mermaid-_r_3v6_ .statediagram-cluster.statediagram-cluster .inner{fill:transparent;}#chatgpt-mermaid-_r_3v6_ .statediagram-cluster.statediagram-cluster-alt .inner{fill:rgb(48, 48, 48);}#chatgpt-mermaid-_r_3v6_ .statediagram-cluster .inner{rx:0;ry:0;}#chatgpt-mermaid-_r_3v6_ .statediagram-state rect.basic{rx:5px;ry:5px;}#chatgpt-mermaid-_r_3v6_ .statediagram-state rect.divider{stroke-dasharray:10,10;fill:rgb(48, 48, 48);}#chatgpt-mermaid-_r_3v6_ .note-edge{stroke-dasharray:5;}#chatgpt-mermaid-_r_3v6_ .statediagram-note rect{fill:rgb(48, 48, 48);stroke:rgb(58, 132, 63);stroke-width:1px;rx:0;ry:0;}#chatgpt-mermaid-_r_3v6_ .statediagram-note rect{fill:rgb(48, 48, 48);stroke:rgb(58, 132, 63);stroke-width:1px;rx:0;ry:0;}#chatgpt-mermaid-_r_3v6_ .statediagram-note text{fill:rgb(237, 237, 237);}#chatgpt-mermaid-_r_3v6_ .statediagram-note .nodeLabel{color:rgb(237, 237, 237);}#chatgpt-mermaid-_r_3v6_ .statediagram .edgeLabel{color:red;}#chatgpt-mermaid-_r_3v6_ [id$="-dependencyStart"],#chatgpt-mermaid-_r_3v6_ [id$="-dependencyEnd"]{fill:rgb(175, 175, 175);stroke:rgb(175, 175, 175);stroke-width:1;}#chatgpt-mermaid-_r_3v6_ .statediagramTitleText{text-anchor:middle;font-size:18px;fill:rgb(237, 237, 237);}#chatgpt-mermaid-_r_3v6_ [data-look="neo"].statediagram-cluster rect{fill:rgb(9, 23, 44);stroke:url(#chatgpt-mermaid-_r_3v6_-gradient);stroke-width:1;}#chatgpt-mermaid-_r_3v6_ [data-look="neo"].statediagram-cluster rect.outer{rx:5px;ry:5px;filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-_r_3v6_ .node .neo-node{stroke:rgb(31, 78, 148);}#chatgpt-mermaid-_r_3v6_ [data-look="neo"].node rect,#chatgpt-mermaid-_r_3v6_ [data-look="neo"].cluster rect,#chatgpt-mermaid-_r_3v6_ [data-look="neo"].node polygon{stroke:url(#chatgpt-mermaid-_r_3v6_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-_r_3v6_ [data-look="neo"].swimlane.cluster rect{filter:none;}#chatgpt-mermaid-_r_3v6_ [data-look="neo"].node path{stroke:url(#chatgpt-mermaid-_r_3v6_-gradient);stroke-width:1px;}#chatgpt-mermaid-_r_3v6_ [data-look="neo"].node .outer-path{filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-_r_3v6_ [data-look="neo"].node .neo-line path{stroke:rgb(31, 78, 148);filter:none;}#chatgpt-mermaid-_r_3v6_ [data-look="neo"].node circle{stroke:url(#chatgpt-mermaid-_r_3v6_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-_r_3v6_ [data-look="neo"].node circle .state-start{fill:#000000;}#chatgpt-mermaid-_r_3v6_ [data-look="neo"].icon-shape .icon{fill:url(#chatgpt-mermaid-_r_3v6_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-_r_3v6_ [data-look="neo"].icon-shape .icon-neo path{stroke:url(#chatgpt-mermaid-_r_3v6_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-_r_3v6_ :root{--mermaid-font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";}OpenFilledCancelledExpiredcreate_offer + escrowsuccessful settlementmaker cancellationexpiry + refund

The cancellation and settlement race is straightforward: both need to modify the same offer account. Only one can succeed first; the other transaction will fail against the updated state.

6. The matching engine
   This is where the off-chain component earns its place.

We don't need AI. We need a graph algorithm.

Suppose we have these offers:
WOOD -> STONE
STONE -> FOOD
FOOD -> WOOD

The matcher builds a directed graph where asset mints are nodes and offers are edges.

It searches for cycles and checks whether the quantities line up.

For the MVP:

- Fetch open offers.
- Build the directed graph.
- Search for cycles of length 3.
- Check exact amount compatibility.
- Submit the matching offer addresses to settle_cycle.
- Let the program reject anything invalid.
  The matching engine is replaceable. Someone could build another matcher with a better algorithm, a different user interface, or an application-specific ranking system.

That's a feature, not a weakness.
Why not put matching on-chain?
Because graph discovery can become computationally expensive. We don't need every validator searching through thousands of offers.

We need the blockchain to enforce the result, not necessarily discover it.

This separation also means we can eventually support multiple independent matching services competing to find the best cycles. 7. The security decisions we shouldn't compromise on
This is where I want us to be disciplined. A protocol holding user assets needs more than a happy-path demo.
Risk Design response
Fake offers Validate program ownership, PDA derivation and account data
Replaying an offer Permanent terminal status and unique offer nonce
Malicious matcher On-chain validation of every cycle
Unauthorized withdrawals PDA-controlled escrow and signed CPI
Expired offers Permissionless refund to original maker
Double settlement Offer status checks and account locks
Unsupported token behavior Restrict token types and extensions
Oversized cycles Enforce a maximum number of participants

One particularly important decision: don't support every Token-2022 extension on day one.

Token-2022 supports transfer hooks, transfer fees, permanent delegates and other behaviors that can change how transfers work.
Solana+2

For the first version, I'd support the original SPL Token Program only. We can expand to selected Token-2022 extensions once their behavior is explicitly handled and tested.

Also, no protocol can guarantee that an issuer won't freeze a token or that an asset has real-world redemption value. CIRCUIT guarantees the exchange rules it enforces, not the economic quality of the assets. 8. The developer experience
This is where I think we can make CIRCUIT feel like an actual developer product.

A developer shouldn't have to understand PDA derivation, escrow authorities, token CPIs and cycle account ordering just to add an exchange feature.

They should be able to use something like this:
import { CircuitClient } from "@circuit-protocol/sdk";

const circuit = new CircuitClient(connection, wallet);

// Alice offers 10 WOOD for 5 STONE
const offer = await circuit.createOffer({
giveMint: WOOD_MINT,
giveAmount: 10,
wantMint: STONE_MINT,
wantAmount: 5,
expiry: Date.now() + 2 _ 60 _ 60 \* 1000,
});

// Find compatible exchange cycles
const cycles = await circuit.findCycles();

// Settle one
await circuit.settleCycle(cycles[0]);

This is an illustrative API, not implemented code yet.

The SDK should eventually provide:

- createOffer()
- getOffer()
- getOpenOffers()
- cancelOffer()
- findCycles()
- settleCycle()
  And importantly, developers should also be able to call the on-chain program through CPI from their own programs. Solana's CPI model makes this possible.
  Solana

That is how we make CIRCUIT composable rather than just offering an API that happens to interact with a blockchain.

9. How I'd validate demand
   I want to be honest here: we have a technically plausible product hypothesis, not validated product-market fit.

There are three things we need to establish.
Hypothesis What we need to discover
Developers have fragmented asset economies Are there applications where users hold assets they want to exchange but lack direct counterparties?
Multi-party exchanges are useful Would a developer actually want cycles instead of conventional trading?
Developers want shared infrastructure Would they integrate CIRCUIT rather than implement this functionality themselves?

I'd speak to three types of developers:

Game developers

Ask whether players commonly accumulate resources they don't need, and whether the game's existing marketplace handles those exchanges well.

Marketplace developers

Ask whether they support multi-item or multi-party trades and how they handle escrow, cancellations and failed settlements.

Creator/community platform developers

Ask whether their users have transferable credits or passes that could meaningfully be exchanged across communities.

Don't start by asking, "Would you use CIRCUIT?" People will say yes to interesting ideas. Ask how they currently solve the problem, how frequently it occurs, and what it costs them.
Competitive positioning
There is another reason to be precise about our claim. Multi-party atomic swaps are already an area of academic research, including published work on multi-party and cross-chain settlement.
arXiv+1

So our claim should not be:

"We invented multi-party atomic swaps."

It should be:

"We're building a developer-friendly, permissionless on-chain protocol for persistent exchange offers, cycle discovery and multi-party settlement on Solana."

That's a claim we can actually demonstrate.

10. What I'd build this weekend
    Recommended hackathon scope
    We have a weekend, so I would deliberately avoid trying to deliver the entire long-term vision.
    CIRCUIT v0.1 — Devnet MVP
    3 participants
    One complete exchange cycle, with real on-chain escrow and settlement.

On-chain

- [ ] Anchor program.
- [ ] Offer creation and escrow.
- [ ] Cancellation and expiry refunds.
- [ ] Three-party cycle validation.
- [ ] Atomic token transfers.
- [ ] Events for offer creation and settlement.
      Off-chain
- [ ] Basic graph matching algorithm.
- [ ] TypeScript client/SDK.
- [ ] Offer discovery.
      Demo application
- [ ] Connect three wallets.
- [ ] Create three test SPL tokens.
- [ ] Create three compatible offers.
- [ ] Discover the cycle.
- [ ] Execute and display the transaction.
- [ ] Demonstrate that an invalid cycle fails without moving assets.

Suggested 48-hour build order
Phase Work Deliverable
1 Anchor setup, accounts and PDAs Program scaffold
2 Offer creation and escrow Assets safely deposited
3 Cancellation and expiry Complete offer lifecycle
4 Cycle validation and settlement Three-party exchange works
5 Matcher and SDK Developer integration
6 Demo frontend and tests Judges can see the full flow

For the first version, I'd also make these deliberate limitations:

- Original SPL Token Program only.
- Fungible tokens only.
- Exact quantities.
- Three-party cycles.
- No partial fills.
- No protocol fees.
- No admin-controlled settlement.
- No global writable counter that would unnecessarily serialize unrelated settlements.
  That last point matters: if two cycles use completely separate offer and escrow accounts, they can be processed concurrently by Solana's runtime. Conflicting writable accounts still need to be serialized.
  Solana

What we should demonstrate to judges
Not just three people exchanging tokens.

We should demonstrate:

1. Alice creates an offer and leaves.
2. Bob creates an offer and leaves.
3. Charlie creates an offer and leaves.
4. A matcher discovers a cycle.
5. A completely different wallet submits the settlement.
6. All three assets change ownership in one successful transaction.
7. We deliberately break one offer and show that the entire settlement fails.
   That tells a much stronger story about permissionless participation and composability.

8. The decisions I'd lock in
   Here's my proposed specification:
   Decision Proposed choice
   Product category Universal exchange protocol
   Network Solana
   Program framework Anchor
   Asset standard SPL Token initially
   Settlement model Escrowed standing offers
   Matching Off-chain and replaceable
   Enforcement On-chain
   Settlement Atomic multi-party cycle
   Integration TypeScript SDK + CPI
   First reference use case Game resource economy
   Business model No fee in MVP; evaluate later

One final architectural recommendation: I'd keep the matching engine outside the program, but make the on-chain protocol independent of it. That way CIRCUIT isn't dependent on our own server staying alive.

And I'd treat the SDK as a first-class deliverable, not an afterthought.
What I want to do next
Before writing the Anchor program, I think we should turn this into a proper technical specification with:

- Exact PDA seeds and account layouts.
- Instruction account lists.
- Token transfer and escrow authority rules.
- Cycle validation pseudocode.
- Error codes.
- Security invariants.
- TypeScript SDK interface.
- Anchor test cases.
  That specification becomes the contract between us and whichever AI coding agent we use. It also gives us something concrete to review instead of blindly accepting generated code.

One thing I wouldn't compromise on: don't let an AI agent invent the security model while implementing it. We define the invariants first, then have it implement and test them.

If you'd like a reminder to review CIRCUIT's build progress tomorrow morning, you can set one here:
🔧CIRCUIT build check-in tomorrowTap to set up

Because I dont know anything about solana just general blockchain knowledge id want you to write the whole architecture in words tho since ill be using it to prompt my ai agents to build it for me. step by step from the ground up with key verifiables to know each stage is complete. gimme the prompt for each stage . you are like the project manager and cto and also system architct im the tech lead of the team and my agents are the coders

Worked for 1m 42s

YOOOO. This is exactly how I want us to run this project. 😭

Let's establish the team structure:

- Me — CTO / system architect / project manager: I define the architecture, make technical decisions, break work into stages, review outputs, identify risks and write implementation prompts.
- You — tech lead: You coordinate the agents, feed them the prompts, inspect their deliverables, run the project and bring their results back to me. You don't need to pretend you understand Solana internals yet. I'll explain the decisions as we go.
- Your AI agents — engineering team: They implement the assigned stages, write tests, document their work and report verifiable results.
  One rule: we don't advance a stage just because an agent says it's finished. We advance when its deliverables and tests prove it.

I'm going to structure this as an engineering execution playbook, not just a giant prompt asking an AI to build CIRCUIT. Giving an agent the entire project at once would make it very easy for it to invent architecture, skip security checks and produce code that looks complete but isn't.
CIRCUIT — engineering execution playbook
CIRCUIT
Exchange beyond direct counterparties.
Universal multi-party exchange protocol on Solana
Solana
Anchor / Rust
TypeScript SDK
React demo

Mission

Enable independent applications to create exchange offers, discover compatible multi-party exchange cycles and settle all participating transfers atomically through a shared, permissionless Solana program.

1. First, understand what we're building
   You don't need to know Solana before starting, but you do need a mental model of the system.

Think of CIRCUIT as a service with three main responsibilities:

1. Remember what people are offering.
2. Hold the assets they're offering safely.
3. Ensure that an agreed exchange happens completely or not at all.
   Imagine three people:

- Alice has 10 WOOD and wants 5 STONE.
- Bob has 5 STONE and wants 3 FOOD.
- Charlie has 3 FOOD and wants 10 WOOD.
  Normally, Alice needs someone with STONE, Bob needs someone with FOOD, and Charlie needs someone with WOOD. CIRCUIT finds the cycle connecting them.

The participants deposit their assets before settlement. A matcher discovers the compatible offers. The Solana program verifies the conditions and executes all three transfers in one transaction.

If any leg fails, none of the transfers should take effect.

That is the product. Everything else we build supports that operation. 2. A correction from my technical research
Before we lock the design, I found something important in the current Solana documentation.

Solana now documents a multi-party DvP example: multiple token transfers bundled into one atomic transaction. It also documents a separate DvP implementation using program-owned escrow.
Solana+1

So we need to be precise about what makes CIRCUIT valuable.

We are not inventing atomic multi-party transfers.

Our proposed differentiation is the complete protocol around them:

- Persistent, independently created exchange offers.
- On-chain escrow controlled by the program.
- A standardized offer lifecycle.
- Permissionless discovery and settlement.
- On-chain verification of multi-party exchange cycles.
- A reusable SDK and CPI integration surface for other applications.
  The documented DvP example is a useful reference, but it does not provide the complete persistent offer registry and exchange-cycle protocol we're proposing.
  Solana+1

This is actually good for our architecture: we now have an official reference implementation to study rather than blindly inventing everything.

3. Technology architecture
   Here's the stack I want us to use.
   Layer Technology Responsibility
   Blockchain Solana Devnet Shared state and transaction execution
   Smart contract Rust + Anchor Offer rules, escrow and settlement
   Token standard Original SPL Token Program Fungible test assets
   Account addressing PDAs Deterministic offer and escrow authority addresses
   Matching engine TypeScript Discover compatible exchange cycles
   Developer SDK TypeScript Easy integration for external applications
   Demo frontend React + TypeScript Demonstrate the protocol
   Wallet integration Solana wallet adapter compatible tooling Wallet connection and signing
   Testing Anchor tests + TypeScript Verify program behaviour
   Deployment Solana Devnet Public hackathon demonstration

Solana programs don't store their mutable state inside themselves. They operate on separate accounts passed into instructions. PDAs give us predictable addresses, while CPIs let our program invoke the SPL Token Program to transfer assets.
Solana+2

The three things you need to understand

Account

Think of this as a record stored on Solana. An offer is a record containing its maker, assets, quantities and status.

PDA (Program Derived Address)

A predictable address derived from our program and some inputs. It has no private key. Our program can authorize actions on its behalf.

CPI (Cross-Program Invocation)

One Solana program calling another. Our program calls the token program to move assets from escrow.

You don't have to implement these manually. Your agents will. But when an agent says it created a PDA, account constraint or CPI, you'll know what it is talking about. 4. How the actual protocol will work
I want to lock the first version to a small, secure scope.
MVP protocol specification
Property Decision
Exchange type Three-party circular exchange
Asset type Fungible SPL tokens
Token program Original SPL Token Program only
Offers Standing, full-fill offers
Escrow Program-controlled token accounts
Matching Off-chain
Settlement authority CIRCUIT program
Settlement caller Anyone
Settlement One atomic transaction
Expiry Unix timestamp
Partial fills Not supported
Fees None
Upgrade/admin controls No privileged settlement authority

Our account model
We need only two types of protocol addresses for the initial version.

A. Offer account

Each offer gets its own PDA.

It stores:

- Offer creator's wallet address.
- A unique nonce, so the same wallet can create multiple offers.
- Token mint being offered.
- Token mint being requested.
- Amount being offered.
- Amount being requested.
- Expiry timestamp.
- Current status.
- PDA bump values needed for address derivation.
  A mint is the address identifying a particular token type. For example, WOOD has one mint address and STONE has another.

B. Escrow authority and token account

Each offer has a separate escrow authority PDA. The associated token account belonging to that PDA holds the maker's deposited tokens.

The offer account describes the agreement. The escrow account holds the actual assets.

We keep these separate because the token program, not CIRCUIT, owns the token account data. CIRCUIT controls its authority through its PDA.
How an offer is created

1. Alice connects her wallet.
2. She chooses WOOD as the offered asset.
3. She chooses STONE as the requested asset.
4. She enters 10 WOOD and 5 STONE.
5. Her wallet signs a transaction.
6. The program creates the offer PDA.
7. The program creates the escrow token account if needed.
8. The program transfers 10 WOOD from Alice's token account into escrow.
9. The offer becomes Open.
   Alice has now authorized the protocol to exchange those 10 WOOD according to her stated terms.

She does not need to sign again when a valid exchange is discovered.
How settlement works
For three offers A, B and C:

- A receives the assets offered by B.
- B receives the assets offered by C.
- C receives the assets offered by A.
  The program verifies that the mint and amount requested by each offer exactly match the next offer's offered mint and amount.

It also verifies:

- All three offers are open.
- None has expired.
- All three makers are different.
- The offers and escrow addresses are legitimate.
- All required escrow balances exist.
- The receiving accounts belong to the intended makers.
  It then calls the SPL Token Program three times through CPI.

If any CPI fails, the entire transaction reverts. Solana transaction atomicity means all state changes are reverted when an instruction fails, although the transaction fee can still be charged.
Solana+1

The lifecycle
#chatgpt-mermaid-_r_42f_{font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";font-size:16px;fill:rgb(237, 237, 237);}@keyframes edge-animation-frame{from{stroke-dashoffset:0;}}@keyframes dash{to{stroke-dashoffset:0;}}#chatgpt-mermaid-_r_42f_ .edge-animation-slow{stroke-dasharray:9,5!important;stroke-dashoffset:900;animation:dash 50s linear infinite;stroke-linecap:round;}#chatgpt-mermaid-_r_42f_ .edge-animation-fast{stroke-dasharray:9,5!important;stroke-dashoffset:900;animation:dash 20s linear infinite;stroke-linecap:round;}#chatgpt-mermaid-_r_42f_ .error-icon{fill:rgb(48, 48, 48);}#chatgpt-mermaid-_r_42f_ .error-text{fill:rgb(237, 237, 237);stroke:rgb(237, 237, 237);}#chatgpt-mermaid-_r_42f_ .edge-thickness-normal{stroke-width:1px;}#chatgpt-mermaid-_r_42f_ .edge-thickness-thick{stroke-width:3.5px;}#chatgpt-mermaid-_r_42f_ .edge-pattern-solid{stroke-dasharray:0;}#chatgpt-mermaid-_r_42f_ .edge-thickness-invisible{stroke-width:0;fill:none;}#chatgpt-mermaid-_r_42f_ .edge-pattern-dashed{stroke-dasharray:3;}#chatgpt-mermaid-_r_42f_ .edge-pattern-dotted{stroke-dasharray:2;}#chatgpt-mermaid-_r_42f_ .marker{fill:rgb(175, 175, 175);stroke:rgb(175, 175, 175);}#chatgpt-mermaid-_r_42f_ .marker.cross{stroke:rgb(175, 175, 175);}#chatgpt-mermaid-_r_42f_ svg{font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";font-size:16px;}#chatgpt-mermaid-_r_42f_ p{margin:0;}#chatgpt-mermaid-_r_42f_ defs [id$="-barbEnd"]{fill:rgb(175, 175, 175);stroke:rgb(175, 175, 175);}#chatgpt-mermaid-_r_42f_ g.stateGroup text{fill:rgb(31, 78, 148);stroke:none;font-size:10px;}#chatgpt-mermaid-_r_42f_ g.stateGroup text{fill:rgb(237, 237, 237);stroke:none;font-size:10px;}#chatgpt-mermaid-_r_42f_ g.stateGroup .state-title{font-weight:bolder;fill:rgb(237, 237, 237);}#chatgpt-mermaid-_r_42f_ g.stateGroup rect{fill:rgb(9, 23, 44);stroke:rgb(31, 78, 148);}#chatgpt-mermaid-_r_42f_ g.stateGroup line{stroke:rgb(175, 175, 175);stroke-width:1;}#chatgpt-mermaid-_r_42f_ .transition{stroke:rgb(175, 175, 175);stroke-width:1;fill:none;}#chatgpt-mermaid-_r_42f_ .stateGroup .composit{fill:transparent;border-bottom:1px;}#chatgpt-mermaid-_r_42f_ .stateGroup .alt-composit{fill:#e0e0e0;border-bottom:1px;}#chatgpt-mermaid-_r_42f_ .state-note{stroke:rgb(58, 132, 63);fill:rgb(48, 48, 48);}#chatgpt-mermaid-_r_42f_ .state-note text{fill:rgb(237, 237, 237);stroke:none;font-size:10px;}#chatgpt-mermaid-_r_42f_ .stateLabel .box{stroke:none;stroke-width:0;fill:rgb(9, 23, 44);opacity:0.5;}#chatgpt-mermaid-_r_42f_ .edgeLabel .label rect{fill:rgb(9, 23, 44);opacity:0.5;}#chatgpt-mermaid-_r_42f_ .edgeLabel{background-color:rgb(0, 0, 0);text-align:center;}#chatgpt-mermaid-_r_42f_ .edgeLabel p{background-color:rgb(0, 0, 0);}#chatgpt-mermaid-_r_42f_ .edgeLabel rect{opacity:0.5;background-color:rgb(0, 0, 0);fill:rgb(0, 0, 0);}#chatgpt-mermaid-_r_42f_ .edgeLabel .label text{fill:rgb(237, 237, 237);}#chatgpt-mermaid-_r_42f_ .label div .edgeLabel{color:rgb(237, 237, 237);}#chatgpt-mermaid-_r_42f_ .stateLabel text{fill:rgb(237, 237, 237);font-size:10px;font-weight:bold;}#chatgpt-mermaid-_r_42f_ .node circle.state-start{fill:rgb(175, 175, 175);stroke:rgb(175, 175, 175);}#chatgpt-mermaid-_r_42f_ .node .fork-join{fill:rgb(175, 175, 175);stroke:rgb(175, 175, 175);}#chatgpt-mermaid-_r_42f_ .node circle.state-end{fill:rgb(31, 78, 148);stroke:transparent;stroke-width:1.5;}#chatgpt-mermaid-_r_42f_ .end-state-inner{fill:transparent;stroke-width:1.5;}#chatgpt-mermaid-_r_42f_ .node rect{fill:rgb(9, 23, 44);stroke:rgb(31, 78, 148);stroke-width:1px;}#chatgpt-mermaid-_r_42f_ .node polygon{fill:rgb(9, 23, 44);stroke:rgb(31, 78, 148);stroke-width:1px;}#chatgpt-mermaid-_r_42f_ [id$="-barbEnd"]{fill:rgb(175, 175, 175);}#chatgpt-mermaid-_r_42f_ .statediagram-cluster rect{fill:rgb(9, 23, 44);stroke:rgb(31, 78, 148);stroke-width:1px;}#chatgpt-mermaid-_r_42f_ .cluster-label,#chatgpt-mermaid-_r_42f_ .nodeLabel{color:rgb(237, 237, 237);}#chatgpt-mermaid-_r_42f_ .statediagram-cluster rect.outer{rx:5px;ry:5px;}#chatgpt-mermaid-_r_42f_ .statediagram-state .divider{stroke:rgb(31, 78, 148);}#chatgpt-mermaid-_r_42f_ .statediagram-state .title-state{rx:5px;ry:5px;}#chatgpt-mermaid-_r_42f_ .statediagram-cluster.statediagram-cluster .inner{fill:transparent;}#chatgpt-mermaid-_r_42f_ .statediagram-cluster.statediagram-cluster-alt .inner{fill:rgb(48, 48, 48);}#chatgpt-mermaid-_r_42f_ .statediagram-cluster .inner{rx:0;ry:0;}#chatgpt-mermaid-_r_42f_ .statediagram-state rect.basic{rx:5px;ry:5px;}#chatgpt-mermaid-_r_42f_ .statediagram-state rect.divider{stroke-dasharray:10,10;fill:rgb(48, 48, 48);}#chatgpt-mermaid-_r_42f_ .note-edge{stroke-dasharray:5;}#chatgpt-mermaid-_r_42f_ .statediagram-note rect{fill:rgb(48, 48, 48);stroke:rgb(58, 132, 63);stroke-width:1px;rx:0;ry:0;}#chatgpt-mermaid-_r_42f_ .statediagram-note rect{fill:rgb(48, 48, 48);stroke:rgb(58, 132, 63);stroke-width:1px;rx:0;ry:0;}#chatgpt-mermaid-_r_42f_ .statediagram-note text{fill:rgb(237, 237, 237);}#chatgpt-mermaid-_r_42f_ .statediagram-note .nodeLabel{color:rgb(237, 237, 237);}#chatgpt-mermaid-_r_42f_ .statediagram .edgeLabel{color:red;}#chatgpt-mermaid-_r_42f_ [id$="-dependencyStart"],#chatgpt-mermaid-_r_42f_ [id$="-dependencyEnd"]{fill:rgb(175, 175, 175);stroke:rgb(175, 175, 175);stroke-width:1;}#chatgpt-mermaid-_r_42f_ .statediagramTitleText{text-anchor:middle;font-size:18px;fill:rgb(237, 237, 237);}#chatgpt-mermaid-_r_42f_ [data-look="neo"].statediagram-cluster rect{fill:rgb(9, 23, 44);stroke:url(#chatgpt-mermaid-_r_42f_-gradient);stroke-width:1;}#chatgpt-mermaid-_r_42f_ [data-look="neo"].statediagram-cluster rect.outer{rx:5px;ry:5px;filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-_r_42f_ .node .neo-node{stroke:rgb(31, 78, 148);}#chatgpt-mermaid-_r_42f_ [data-look="neo"].node rect,#chatgpt-mermaid-_r_42f_ [data-look="neo"].cluster rect,#chatgpt-mermaid-_r_42f_ [data-look="neo"].node polygon{stroke:url(#chatgpt-mermaid-_r_42f_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-_r_42f_ [data-look="neo"].swimlane.cluster rect{filter:none;}#chatgpt-mermaid-_r_42f_ [data-look="neo"].node path{stroke:url(#chatgpt-mermaid-_r_42f_-gradient);stroke-width:1px;}#chatgpt-mermaid-_r_42f_ [data-look="neo"].node .outer-path{filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-_r_42f_ [data-look="neo"].node .neo-line path{stroke:rgb(31, 78, 148);filter:none;}#chatgpt-mermaid-_r_42f_ [data-look="neo"].node circle{stroke:url(#chatgpt-mermaid-_r_42f_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-_r_42f_ [data-look="neo"].node circle .state-start{fill:#000000;}#chatgpt-mermaid-_r_42f_ [data-look="neo"].icon-shape .icon{fill:url(#chatgpt-mermaid-_r_42f_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-_r_42f_ [data-look="neo"].icon-shape .icon-neo path{stroke:url(#chatgpt-mermaid-_r_42f_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-_r_42f_ :root{--mermaid-font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";}OpenFilledCancelledExpiredCreate offer and depositSuccessful cyclesettlementMaker cancelsAnyone triggers expiryafter deadline

A cancelled or expired offer returns its tokens to its original maker. Only the maker can cancel an open offer; anyone can trigger an expiry refund after the deadline.

We will retain terminal offer records for the MVP rather than closing them immediately. This helps us verify history and makes debugging easier.

5. The development roadmap
   This is the order I want the agents to follow.
   CIRCUIT implementation stages
1. Stage 0 — Project discovery and technical planning
   No implementation yet
   Confirm tools, versions, architecture and repository structure.
1. Stage 1 — Project scaffold

   Create the Anchor workspace, React app, SDK package structure and tests.

1. Stage 2 — Offer accounts and escrow

   Implement offer creation and safe token deposits.

1. Stage 3 — Offer lifecycle

   Implement cancellation, expiry and refunds.

1. Stage 4 — Atomic settlement

   Implement and verify three-party cycle settlement.

1. Stage 5 — Matching engine

   Discover valid exchange cycles from on-chain offers.

1. Stage 6 — Developer SDK

   Build the reusable TypeScript integration interface.

1. Stage 7 — Demo application

   Build the interface that demonstrates the protocol.

1. Stage 8 — Devnet deployment and verification

   Deploy, test with real wallets and prepare the demo.

1. Stage 9 — Final security and integration review

   Test adversarial cases, verify the full workflow and prepare documentation.

Important: Stage 0 must not be skipped. Your first agent should inspect the current toolchain and produce a plan. It should not start generating the entire application. 6. The agent instructions
Before the individual stages, every coding agent should receive this permanent instruction. You can put it in an AGENTS.md file at the root of the repository so agents can refer to it.

# CIRCUIT — Engineering Team Instructions

You are an engineer working on CIRCUIT, a universal multi-party asset exchange protocol on Solana.

## Product objective

Build a permissionless protocol that allows independent applications to create persistent exchange offers, discover compatible three-party exchange cycles, and atomically settle those exchanges using program-controlled escrow.

## Architecture rules

1. The Solana program is the authoritative source of truth.
2. The matching engine is off-chain and untrusted.
3. The program must independently validate every proposed settlement.
4. Users must authorize deposits before settlement.
5. The program must never allow an arbitrary caller to redirect escrowed assets.
6. All settlement legs must execute atomically.
7. No centralized backend may have privileged control over settlement.
8. All amounts must use integer base units, never floating-point arithmetic.
9. Use the original SPL Token Program for MVP.
10. Never introduce partial fills, fees, or additional token standards without approval.

## Engineering rules

- Follow the approved architecture and existing project conventions.
- Read the current official Solana and Anchor documentation when necessary.
- Pin compatible dependency versions.
- Never silently upgrade frameworks or introduce experimental APIs.
- Never use a private key or secret directly in source code.
- Never deploy to mainnet.
- Never claim that a test passed without actually running it.
- Never suppress errors merely to make a test pass.
- Write tests for successful and unsuccessful behaviour.
- Keep the program, SDK, matcher and frontend responsibilities separate.
- Document any architectural deviation before implementing it.
- Do not rewrite unrelated working code.

## Security rules

- Validate all accounts supplied to instructions.
- Validate PDA derivation and ownership.
- Validate token mint, token authority and token account relationships.
- Validate offer status and expiry.
- Prevent duplicate offers and duplicate participants in a cycle.
- Prevent unauthorized withdrawals.
- Prevent replay and double settlement.
- Never trust data supplied by the matcher without on-chain validation.
- Never use a user-provided account address without checking its expected relationship.

## Required completion report

At the end of every assigned stage, report:

1. What you implemented.
2. Files created or modified.
3. Commands executed.
4. Actual test results.
5. Build results.
6. Security considerations.
7. Known limitations.
8. Anything requiring architectural approval.
9. Evidence that every acceptance criterion passed.

Do not begin the next stage unless explicitly instructed.

Stage 0 — Project discovery and technical planning
Start here
Objective: Establish the development environment and agree on the implementation plan before touching the application code.

Why? Solana development has several moving parts: Rust, Solana CLI, Anchor CLI, Node.js and the TypeScript client. Incompatible versions can waste hours.

The official Anchor documentation currently describes a local workflow using Rust, Solana CLI and Anchor CLI, with anchor build and anchor test as the main verification commands.
anchor-lang.com+1

Prompt to your first agent:

You are the technical discovery engineer for CIRCUIT.

Your task is to inspect the development environment and produce an implementation plan. DO NOT implement application features yet.

CIRCUIT is a universal multi-party asset exchange protocol on Solana.

The approved MVP consists of:

- A Rust + Anchor Solana program.
- Three-party circular exchanges.
- Original SPL Token Program only.
- Persistent offer accounts.
- PDA-controlled token escrow.
- Offer creation, cancellation and expiry.
- Permissionless atomic settlement.
- An off-chain TypeScript cycle matcher.
- A reusable TypeScript SDK.
- A React demonstration application.
- Local testing followed by Solana Devnet deployment.

TASKS:

1. Inspect the available environment.
2. Check Rust, Cargo, Solana CLI, Anchor CLI, Node.js and package manager versions.
3. Identify missing dependencies.
4. Check the current stable Anchor documentation and compatible client libraries.
5. Recommend mutually compatible, non-experimental dependency versions.
6. Explain how local Solana testing will work.
7. Propose a monorepo structure for the program, SDK, matcher, frontend and tests.
8. Identify technical risks, especially transaction account limits, PDA derivation, token escrow and CPI authorization.
9. Propose a stage-by-stage implementation plan.

Do not install or upgrade anything without reporting what needs changing first.

DELIVERABLES:

- ENVIRONMENT_REPORT.md
- TECHNICAL_PLAN.md
- PROPOSED_DEPENDENCIES.md
- PROPOSED_PROJECT_STRUCTURE.md

VERIFICATION:

The report must identify actual installed versions, missing dependencies and the exact commands needed to verify the environment.

Do not claim a dependency exists without checking it.

Stop after delivering the reports.

My acceptance criteria:

- [ ] All installed versions are documented.
- [ ] The agent has identified compatible stable Anchor and TypeScript client versions.
- [ ] We have an agreed folder structure.
- [ ] We have a local testing strategy.
- [ ] No application features have been implemented.
      You bring me the reports before we move on. If an agent recommends an experimental framework or a different architecture, we'll review that first.

Stage 1 — Create the project scaffold
Objective: Build the foundation without implementing business logic.

Our repository should be a monorepo: one Git repository containing the on-chain program, SDK, matcher, frontend and tests.

Proposed structure:
circuit/
│
├── programs/
│ └── circuit/
│ └── src/
│ ├── instructions/
│ ├── state/
│ ├── constants.rs
│ ├── errors.rs
│ └── lib.rs
│
├── packages/
│ ├── sdk/
│ └── matcher/
│
├── app/
│ └── src/
│
├── tests/
│ ├── offer/
│ ├── settlement/
│ └── security/
│
├── docs/
│
├── Anchor.toml
├── Cargo.toml
├── package.json
├── pnpm-workspace.yaml
├── AGENTS.md
└── README.md

Prompt:

Implement Stage 1 of CIRCUIT.

First read AGENTS.md, ENVIRONMENT_REPORT.md and TECHNICAL_PLAN.md.

Create the monorepo structure agreed in Stage 0.

TASKS:

1. Initialize the Anchor workspace.
2. Create the CIRCUIT Solana program.
3. Configure the local development cluster.
4. Create the TypeScript workspace.
5. Create the SDK package scaffold.
6. Create the matching engine package scaffold.
7. Create the React + TypeScript frontend scaffold.
8. Configure shared formatting, linting and TypeScript settings.
9. Add environment variable examples without real secrets.
10. Create a basic test setup.
11. Document how each workspace component is started, built and tested.

Do not implement offer creation, escrow, settlement or matching logic yet.

Use only dependency versions approved in Stage 0.

Do not add unnecessary backend infrastructure.

VERIFICATION:

- The Anchor program compiles.
- The TypeScript workspace installs successfully.
- The frontend builds.
- The SDK package builds.
- The matcher package builds.
- The test framework executes a basic passing test.
- No secret keys are committed.

DELIVERABLES:

- Complete repository scaffold.
- Updated README.md.
- BUILD_AND_TEST.md.
- A report containing actual command output and test results.

Stop after Stage 1.

Completion gate:

- [ ] anchor build succeeds.
- [ ] anchor test succeeds with the initial test.
- [ ] Frontend production build succeeds.
- [ ] SDK and matcher compile.
- [ ] No secrets or generated private keys are committed.

Stage 2 — Offer accounts and escrow
First real blockchain functionality
Now we're getting into Solana.

This stage implements the first meaningful protocol operation: a user creates an offer and deposits tokens into escrow.
What happens behind the scenes?
Alice has a token account containing 100 WOOD.

She wants to offer 10 WOOD for 5 STONE.

The program:

1. Creates her offer account.
2. Derives a unique escrow authority PDA.
3. Creates a token account owned by that PDA.
4. Transfers 10 WOOD from Alice into that account.
5. Records the offer as open.
   A PDA isn't a wallet with a private key. It is a deterministic address that our program can authorize through invoke_signed.
   Solana+1

Important account design
Our offer PDA will be derived from:
"offer"
maker_wallet
nonce

Our escrow authority PDA will be derived from:
"escrow"
offer_account

This ensures every offer has a unique address and a separate escrow authority.

Prompt:

Implement Stage 2: CIRCUIT offer creation and token escrow.

Read AGENTS.md and all approved architecture documents before making changes.

OBJECTIVE:

Implement an Anchor instruction called create_offer.

The instruction must allow a wallet to create a persistent offer and deposit its offered SPL tokens into a program-controlled escrow token account.

OFFER DATA:

- maker: wallet that created the offer
- nonce: unique u64 identifier supplied by maker
- give_mint: token mint being offered
- want_mint: token mint requested
- give_amount: amount offered in base units
- want_amount: amount requested in base units
- expiry: Unix timestamp
- status: Open, Filled, Cancelled or Expired
- created_at: creation timestamp
- offer_bump: PDA bump
- escrow_bump: escrow authority PDA bump

PDA DERIVATION:

Offer PDA:
["offer", maker public key, nonce as little-endian bytes]

Escrow authority PDA:
["escrow", offer PDA public key]

The escrow token account must be the associated token account for the escrow authority PDA and the offered mint.

INSTRUCTION BEHAVIOUR:

1. Require maker to sign.
2. Reject zero offered amounts.
3. Reject zero requested amounts.
4. Reject identical offered and requested mints.
5. Require expiry to be in the future.
6. Validate the offered mint.
7. Validate that the maker's source token account belongs to maker.
8. Validate that the source account uses the expected mint and original SPL Token Program.
9. Create the offer account.
10. Create the escrow token account.
11. Transfer exactly give_amount into escrow using a checked SPL Token transfer CPI.
12. Store the offer data.
13. Set status to Open.
14. Emit an OfferCreated event.

Use integer base units only.

SECURITY:

- No arbitrary escrow authority.
- No arbitrary source token account.
- No user-controlled destination.
- No ability for another wallet to create an offer using someone else's identity.
- No Token-2022 support in this stage.

TESTS:

- Successful offer creation.
- Correct PDA derivation.
- Correct escrow authority.
- Correct deposited balance.
- Incorrect source token owner rejected.
- Incorrect mint rejected.
- Zero amount rejected.
- Expired offer rejected.
- Duplicate maker + nonce rejected.
- Insufficient token balance rejected.
- Failed creation leaves no partially initialized offer or deposit.

VERIFICATION:

Run the complete Anchor test suite.

Report every test individually.

Stop after Stage 2.

Completion gate:

- [ ] Alice can create an offer.
- [ ] The offer exists on local Solana.
- [ ] The correct number of tokens is in escrow.
- [ ] The escrow authority is the expected PDA.
- [ ] Invalid offers are rejected.
- [ ] Tests verify that no tokens disappear or get redirected.
      This is our first genuine blockchain milestone.

Stage 3 — Offer lifecycle
Objective: Users must be able to withdraw their assets when they no longer want an offer to participate in exchanges.

Two instructions:

- cancel_offer: only the maker can cancel an open offer.
- expire_offer: anyone can trigger a refund after the expiry timestamp.
  The caller of expire_offer is just paying to execute the instruction. They do not get the refunded assets.

Prompt:

Implement Stage 3: CIRCUIT offer cancellation and expiry.

Read the existing program and preserve the Stage 2 architecture.

Implement two instructions:

1. cancel_offer
2. expire_offer

CANCEL OFFER:

- The original maker must sign.
- The offer must belong to that maker.
- The offer must currently be Open.
- The offer must not have already expired.
- Return all escrowed tokens to the maker's associated token account.
- Use the escrow authority PDA to authorize the transfer.
- Change offer status to Cancelled.
- Emit OfferCancelled.

EXPIRE OFFER:

- Anyone may call this instruction.
- Current Unix timestamp must be greater than or equal to offer expiry.
- The offer must currently be Open.
- Return escrowed tokens to the original maker, never to the caller.
- Change offer status to Expired.
- Emit OfferExpired.

Both instructions must use checked token transfers.

The maker's destination associated token account may be created if it does not exist, with the transaction caller paying the account creation cost.

Do not allow cancellation or expiry to withdraw from a Filled, Cancelled or Expired offer.

TESTS:

- Maker successfully cancels.
- Non-maker cannot cancel.
- Cancellation returns the correct amount.
- Anyone can trigger expiry after deadline.
- Expiry returns assets to maker, not caller.
- Expiry before deadline fails.
- Cancellation after expiry fails.
- Double cancellation fails.
- Double expiry fails.
- Terminal offers cannot be reused.
- Failed instructions preserve escrow balances.

VERIFICATION:

Run all previous and new tests.

Show before-and-after balances and offer statuses.

Stop after Stage 3.

Completion gate:

- [ ] Only the maker can cancel.
- [ ] Anyone can trigger expiry.
- [ ] Refund always goes to the maker.
- [ ] No offer can be refunded twice.
- [ ] Previous Stage 2 tests still pass.

Stage 4 — Atomic three-party settlement
The heart of CIRCUIT
This is the most important engineering stage.

We now implement settle_cycle.

For the first version, we'll explicitly pass three offers and their associated accounts rather than build a complicated arbitrary-length settlement engine.
Exact settlement example
Offer Escrow contains Receives
Alice 10 WOOD 5 STONE
Bob 5 STONE 3 FOOD
Charlie 3 FOOD 10 WOOD

The program executes:

- Bob's 5 STONE → Alice.
- Charlie's 3 FOOD → Bob.
- Alice's 10 WOOD → Charlie.
  No participant signs again. The original deposits authorized settlement according to their offers.
  Critical security rule
  The matcher will submit the three offer addresses, but the program must not blindly trust the matcher.

The program checks every offer and every account itself.

Prompt:

Implement Stage 4: CIRCUIT atomic three-party settlement.

Read AGENTS.md and the existing program implementation.

OBJECTIVE:

Implement a permissionless settle_cycle instruction.

The instruction accepts three offer accounts: offer_a, offer_b and offer_c.

It must execute a complete circular exchange using the original SPL Token Program.

CYCLE VALIDATION:

For offer A, B and C:

A.want_mint must equal B.give_mint.
A.want_amount must equal B.give_amount.

B.want_mint must equal C.give_mint.
B.want_amount must equal C.give_amount.

C.want_mint must equal A.give_mint.
C.want_amount must equal A.give_amount.

ADDITIONAL VALIDATION:

- All three offers must exist and be owned by this program.
- All three offers must be Open.
- None may be expired.
- All three makers must be different.
- All three offer accounts must be distinct.
- All three offered mints must be distinct in this MVP.
- Every escrow authority must be the correct derived PDA.
- Every escrow token account must be the expected associated token account.
- Every escrow token account must have the expected mint and authority.
- Every escrow must contain the exact required amount or more.
- Every recipient token account must belong to the intended offer maker.
- Every recipient token account must use the expected mint and token program.

SETTLEMENT:

1. Transfer B's offered assets to A's maker.
2. Transfer C's offered assets to B's maker.
3. Transfer A's offered assets to C's maker.
4. Use the correct escrow authority PDA signer seeds for each transfer.
5. Use checked token transfer CPIs.
6. Change all three offers to Filled.
7. Emit CycleSettled with the three offer addresses and settlement caller.

The caller must be a signer, but the three makers must not be required to sign again.

Recipient associated token accounts may be initialized within the settlement transaction if missing, with the caller paying their creation cost.

ATOMICITY:

All three transfers and all three status changes must happen in one Solana transaction.

If any validation or transfer fails, no token transfer or status update may persist.

Do not implement partial settlement.

Do not let the caller specify arbitrary transfer destinations.

TESTS:

SUCCESS:

- A valid three-party cycle settles.
- Every participant receives the expected asset.
- All three escrow balances decrease correctly.
- All three offers become Filled.
- A wallet unrelated to the three makers can submit settlement.

FAILURE:

- Wrong mint relationship.
- Wrong amount relationship.
- One offer is cancelled.
- One offer is expired.
- One offer is already filled.
- Duplicate maker.
- Duplicate offer account.
- Incorrect escrow authority.
- Incorrect escrow token account.
- Incorrect recipient account.
- Insufficient escrow balance.
- Frozen token account or another transfer failure.
- Invalid token program.

CRITICAL ATOMICITY TEST:

Create a valid cycle, then deliberately make the final transfer fail.

After the failed transaction:

- Verify that all three original escrow balances remain unchanged.
- Verify that all three offers remain Open.
- Verify that no recipient received any settlement assets.

Also verify that the transaction fee may still be charged.

VERIFICATION:

Run all previous tests plus the new settlement suite.

Report transaction logs, account balances and offer states.

Stop after Stage 4.

Completion gate:

- [ ] Three offers settle in one transaction.
- [ ] No maker needs to sign again.
- [ ] An unrelated wallet can submit settlement.
- [ ] Invalid cycles fail.
- [ ] A deliberately failed final transfer rolls back the entire exchange.
- [ ] All previous tests still pass.
      One technical detail: the number of participants affects how many accounts and instructions a transaction needs. Solana has transaction size, account and compute limits, so we must measure the actual settlement rather than assume we can support hundreds of participants in one transaction.
      Solana+2

For the MVP, three participants is a sensible, testable starting point.

Stage 5 — The matching engine
Now that the on-chain protocol works, we need something that discovers compatible offers.

This is not a smart contract. It's a TypeScript service that reads public blockchain data and proposes cycles.
How the matcher thinks
An offer can be represented as an arrow:
WOOD → STONE
STONE → FOOD
FOOD → WOOD

The matcher searches for a closed loop.

However, it must also compare quantities. Finding the right assets isn't enough.

For example:
Alice: 10 WOOD → 5 STONE
Bob: 4 STONE → 3 FOOD
Charlie: 3 FOOD → 10 WOOD

This is not a valid cycle because Alice wants 5 STONE, but Bob only offers 4.

The matcher must reject it.
Where does the matcher get its data?
It reads offer accounts directly from Solana using an RPC connection.

For the MVP, we don't need a database or complex backend. The matcher can fetch offer accounts, filter open and unexpired offers, and construct a graph in memory.

Later, if CIRCUIT has thousands of offers, we can introduce an indexing service.

Prompt:

Implement Stage 5: CIRCUIT off-chain matching engine.

Read AGENTS.md and inspect the deployed program interface and generated IDL.

OBJECTIVE:

Create a TypeScript matching engine that discovers valid three-party circular exchanges from actual CIRCUIT offer accounts.

The matcher must not be authoritative. It only proposes settlement candidates.

DATA SOURCE:

Read offer accounts from Solana using the configured RPC connection and the CIRCUIT program ID.

Do not use hardcoded demo offers as the source of matching data.

MATCHING RULES:

1. Only consider Open offers.
2. Exclude expired offers.
3. Only consider offers from the supported original SPL Token Program.
4. Find three distinct offers from three distinct makers.
5. Find three distinct offered mints.
6. Verify that each offer's requested mint matches the next offer's offered mint.
7. Verify that each requested amount equals the next offered amount.
8. Return only complete valid cycles.

IMPLEMENTATION:

- Create typed offer representations.
- Build a directed asset graph.
- Index offers by offered mint.
- Search for compatible three-offer cycles.
- Prevent duplicate cycles in returned results.
- Provide deterministic cycle ordering.
- Return the three offer public keys and relevant offer details.
- Expose a function to refresh offers from Solana.
- Expose a function to find valid cycles.
- Expose a function to refresh and search.

The matcher must never modify offer accounts or hold private keys.

It must never claim a cycle is guaranteed to settle. Offers may change between discovery and submission.

TESTS:

- Valid cycle discovered.
- Invalid mint cycle rejected.
- Invalid quantity cycle rejected.
- Expired offer excluded.
- Cancelled offer excluded.
- Filled offer excluded.
- Duplicate maker rejected.
- Duplicate mint rejected.
- Duplicate cycle removed.
- Empty offer set handled.
- Multiple compatible cycles handled.
- Stale cycle can be returned but settlement must be revalidated on-chain.

Do not implement settlement logic inside the matcher.

VERIFICATION:

Use test fixtures for algorithm tests and a local validator integration test that reads actual on-chain offer accounts.

Stop after Stage 5.

Completion gate:

- [ ] Matcher reads real on-chain offers.
- [ ] It discovers a valid three-party cycle.
- [ ] It rejects incorrect amounts and mints.
- [ ] It ignores cancelled, expired and filled offers.
- [ ] It has no settlement authority.
- [ ] All matcher tests pass.

Stage 6 — Developer SDK
This is what makes CIRCUIT infrastructure
The SDK is one of our most important deliverables.

Imagine another developer building a game. They shouldn't have to manually derive PDAs, construct token accounts and understand every Anchor instruction.

They should import CIRCUIT's SDK and call its methods.

We want an API that feels something like:
const circuit = new CircuitClient({
connection,
wallet,
programId,
});

const offer = await circuit.createOffer({
giveMint: woodMint,
giveAmount: 10n,
wantMint: stoneMint,
wantAmount: 5n,
expiry: expiryTimestamp,
});

const cycles = await circuit.findCycles();

await circuit.settleCycle(cycles[0]);

This is our intended developer experience, not a promise that these exact signatures are already implemented.
What the SDK should hide

- PDA derivation.
- Associated token account derivation.
- Anchor instruction construction.
- Token account validation.
- Transaction submission.
- Confirmation handling.
- Fetching offer data.
- Formatting on-chain amounts.
  Prompt:

Implement Stage 6: CIRCUIT TypeScript SDK.

Read AGENTS.md and the program's generated IDL.

OBJECTIVE:

Create a reusable TypeScript SDK that allows external applications to interact with CIRCUIT without manually constructing every Solana instruction.

PACKAGE:

Use the approved SDK workspace package.

PUBLIC API:

Create a CircuitClient class accepting:

- Solana Connection.
- Wallet or transaction signer interface.
- CIRCUIT program ID.
- Generated Anchor IDL/client configuration.

Provide methods for:

1. createOffer()
2. getOffer()
3. getOpenOffers()
4. cancelOffer()
5. expireOffer()
6. findCycles()
7. settleCycle()
8. deriveOfferAddress()
9. deriveEscrowAuthority()
10. deriveEscrowTokenAccount()

DESIGN REQUIREMENTS:

- Use the generated program IDL rather than duplicating instruction definitions.
- Use bigint for token amounts and u64-compatible values.
- Never convert token amounts to floating point for transaction construction.
- Derive all PDAs deterministically.
- Validate client inputs before sending transactions.
- Return transaction signatures and useful typed results.
- Handle transaction errors without hiding the original cause.
- Expose methods for building instructions separately from sending them, where practical.
- Do not require an API key or centralized CIRCUIT backend.
- Keep matching functionality separate from settlement enforcement.

DOCUMENTATION:

Provide examples showing:

- Initializing the client.
- Creating an offer.
- Fetching offers.
- Cancelling an offer.
- Discovering a cycle.
- Submitting settlement.

TESTS:

Use local validator integration tests.

Demonstrate that the SDK can:

- Create an offer.
- Fetch its state.
- Cancel it.
- Discover a valid cycle.
- Submit settlement.
- Verify final balances.

Also test invalid input and failed transactions.

VERIFICATION:

Build the package, run all tests and demonstrate at least one complete exchange using only the SDK API.

Stop after Stage 6.

Completion gate:

- [ ] SDK builds independently.
- [ ] It uses the actual program IDL.
- [ ] A developer can create and cancel offers through the SDK.
- [ ] It can find and settle a cycle.
- [ ] It has usable documentation.
- [ ] SDK integration tests pass.
      At this point, we have the actual protocol and developer tooling. The frontend is now just a demonstration of what we've built.

Stage 7 — Demo application
Objective: Build a frontend that proves CIRCUIT works.

I don't want a generic DeFi dashboard with random cards and charts. The frontend should tell the protocol's story.

We need three views:

1. Offers: Create offers and browse existing ones.
2. Exchange cycles: See compatible offers grouped into a proposed exchange.
3. Settlement: Execute the cycle and show the verified outcome.
   Recommended visual direction

- Dark, technical interface.
- Black and deep zinc surfaces.
- White typography.
- A restrained electric green for successful settlements.
- Sharp borders and simple layouts.
- A visual flow showing who gives what and receives what.
  The demo scenario
  We will create three test wallets and three test tokens:
  10
  WOOD

Alice offers

5
STONE

Bob offers

3
FOOD

Charlie offers

The frontend should show the exchange cycle before settlement, then show the transaction signature and changed balances after settlement.

Prompt:

Implement Stage 7: CIRCUIT demonstration frontend.

Read AGENTS.md and inspect the SDK.

OBJECTIVE:

Build a polished frontend demonstrating the actual CIRCUIT protocol.

This is a protocol demonstration, not a conventional trading marketplace.

TECHNOLOGY:

Use the approved React + TypeScript stack and the CIRCUIT SDK.

FEATURES:

1. Wallet connection.
2. Display the connected wallet.
3. Display supported token balances.
4. Create an exchange offer.
5. Choose an offered token and requested token.
6. Enter offered and requested amounts.
7. Choose an expiry time.
8. Submit offer creation using the SDK.
9. Display open offers retrieved from Solana.
10. Display the maker, offered asset, requested asset, quantities and expiry.
11. Show offers discovered by the matching engine.
12. Display a three-party exchange cycle visually.
13. Show the exact assets each participant gives and receives.
14. Allow a user to submit settlement.
15. Display settlement progress and transaction signature.
16. Verify and display updated balances and offer statuses.
17. Display clear transaction errors.

DEMO REQUIREMENTS:

The application must support a three-wallet test scenario.

Use three test SPL tokens:

- WOOD
- STONE
- FOOD

The interface must demonstrate:

Alice: 10 WOOD for 5 STONE.
Bob: 5 STONE for 3 FOOD.
Charlie: 3 FOOD for 10 WOOD.

All data must come from actual Solana program accounts and transactions.

Do not simulate successful settlement in frontend state.

Do not mark offers as filled unless the chain confirms it.

Do not hardcode a fake successful transaction signature.

DESIGN:

Use a polished dark technical interface.
Keep it focused on protocol functionality.
Make the exchange cycle the visual centerpiece.
Show clear status indicators for Open, Filled, Cancelled and Expired.
Display a link to the actual Solana Explorer transaction.

VERIFICATION:

- Wallet connection works.
- Offer creation works.
- Offers load from Solana.
- Matcher results appear.
- Settlement works.
- Failed settlement displays an error.
- Refreshing the page preserves correct on-chain state.
- Frontend production build succeeds.

Stop after Stage 7.

Completion gate:

- [ ] Wallet connection works.
- [ ] Offer creation works on-chain.
- [ ] Matching is based on real offers.
- [ ] Settlement uses the SDK.
- [ ] UI state is verified against Solana.
- [ ] No fake transaction data.
- [ ] Frontend builds successfully.

Stage 8 — Devnet deployment
This is where we take CIRCUIT outside the local testing environment.

First, what is Devnet?

Solana has different clusters. Think of them as different blockchain environments:

- Localnet: your computer runs a local Solana network for development.
- Devnet: a public Solana testing network where we can interact with real wallets and inspect transactions.
- Mainnet: the real production network.
  We are deploying only to Devnet.

The official Anchor workflow supports deploying to Devnet after configuring the cluster and funding the deployment wallet with Devnet SOL.
anchor-lang.com+1

Prompt:

Implement Stage 8: CIRCUIT Devnet deployment and verification.

Read all project documentation and inspect the complete implementation.

OBJECTIVE:

Deploy the approved CIRCUIT program to Solana Devnet and verify its functionality using real Devnet transactions.

SECURITY:

- Never deploy to mainnet.
- Never expose private keys.
- Never commit wallet keypairs.
- Never overwrite an existing program ID without approval.
- Use an explicitly configured Devnet wallet.

TASKS:

1. Confirm all local tests pass.
2. Build the final program.
3. Configure Devnet.
4. Generate or configure the intended program ID.
5. Verify that the program ID matches the compiled program configuration.
6. Deploy to Devnet.
7. Record the deployed program ID.
8. Verify the program exists on Devnet.
9. Configure the SDK and frontend to use the Devnet program.
10. Create three Devnet test tokens.
11. Fund three test wallets.
12. Create three offers.
13. Discover a valid cycle.
14. Execute settlement.
15. Verify final token balances.
16. Verify all offer statuses.
17. Record transaction signatures and Explorer links.

Do not claim successful deployment without checking the deployed program on Devnet.

DELIVERABLES:

- DEVNET_DEPLOYMENT.md
- Program ID.
- Cluster configuration.
- Token mint addresses.
- Test wallet public addresses only.
- Offer account addresses.
- Escrow account addresses.
- Settlement transaction signature.
- Explorer links.
- Before-and-after balance verification.

Stop after Stage 8.

Completion gate:

- [ ] Program exists on Devnet.
- [ ] Program ID is recorded and consistent.
- [ ] Three test tokens exist.
- [ ] Three offers have been created.
- [ ] A real Devnet settlement succeeds.
- [ ] Explorer links work.
- [ ] All final balances are verified.

Stage 9 — Security and final integration review
This stage is not optional.

An agent can write code that passes happy-path tests while leaving serious vulnerabilities.

We need a separate review agent that has not been responsible for implementing the program. Give it the codebase and ask it to challenge the architecture.

Prompt:

You are the independent security reviewer for CIRCUIT.

You did not implement the protocol.

Your job is to identify security vulnerabilities, incorrect assumptions and integration failures.

Read the complete repository, program source, generated IDL, tests and deployment documentation.

Do not modify code initially.

REVIEW:

1. PDA derivation and account validation.
2. Offer account ownership.
3. Escrow authority security.
4. Token account ownership and mint validation.
5. Unauthorized withdrawal possibilities.
6. Maker authorization.
7. Offer nonce replay and collisions.
8. Expiry and cancellation race conditions.
9. Duplicate participants and offers.
10. Settlement destination manipulation.
11. Incorrect amount and mint validation.
12. CPI signer seeds.
13. Atomic rollback.
14. Account aliasing and duplicate account risks.
15. Transaction size and compute limits.
16. Integer overflow and serialization.
17. SDK trust assumptions.
18. Matcher correctness.
19. Frontend transaction confirmation handling.
20. Secrets and deployment configuration.

For each finding, report:

- Severity: Critical, High, Medium or Low.
- Affected file and instruction.
- Exact attack or failure scenario.
- Why the current implementation permits it.
- Recommended correction.
- A test that would prove the correction.

Pay particular attention to whether a malicious settlement caller can redirect assets or settle an offer under conditions not authorized by its maker.

Do not assume that passing existing tests proves security.

After producing the report, wait for approval before changing code.

DELIVERABLE:

SECURITY_REVIEW.md

Stop.

Completion gate:

- [ ] Independent review completed.
- [ ] No unresolved critical or high-severity findings.
- [ ] Corrections tested.
- [ ] Full regression suite passes.
- [ ] Devnet settlement still works after corrections.

Stage 10 — Documentation and hackathon presentation
We need to make it possible for another developer to understand and try CIRCUIT without asking you how everything works.

Prompt:

Implement Stage 10: CIRCUIT documentation and hackathon readiness.

Read the complete repository and verify all documentation against actual implementation.

Create:

1. README.md
   - What CIRCUIT is.
   - The problem it solves.
   - How the protocol works.
   - Architecture overview.
   - Development setup.
   - How to run tests.
   - How to use the SDK.
   - Devnet deployment details.

2. docs/ARCHITECTURE.md
   - Component responsibilities.
   - Account model.
   - PDA derivation.
   - Escrow lifecycle.
   - Settlement flow.
   - Matching engine.
   - SDK integration.

3. docs/SECURITY.md
   - Security assumptions.
   - Account validation.
   - Escrow authorization.
   - Atomic settlement.
   - Known limitations.
   - Explicit statement that the hackathon version is not audited.

4. docs/INTEGRATION.md
   - SDK installation.
   - Client initialization.
   - Creating offers.
   - Discovering cycles.
   - Settling cycles.
   - Error handling.

5. docs/DEMO.md
   - Required wallets and tokens.
   - Exact demonstration sequence.
   - Transaction links.
   - Expected balances before and after settlement.

6. HACKATHON_PITCH.md
   - Problem.
   - Solution.
   - Why Solana.
   - Architecture.
   - What is working.
   - Differentiation.
   - Future roadmap.

IMPORTANT:

Do not invent completed features.
Do not describe planned functionality as implemented.
Verify every program ID, SDK method and transaction link.

Finally, perform a complete production build and regression test.

Stop after Stage 10.

Completion gate:

- [ ] A developer can understand the project from its README.
- [ ] The SDK has working integration examples.
- [ ] Architecture documentation matches the actual program.
- [ ] Demo instructions have been tested.
- [ ] All claims in the hackathon pitch are verifiable.

7. How I want you to manage the agents
   This is probably the most important part of your job as tech lead.

You don't need to personally write Rust or understand every Anchor macro. You do need to control what gets built, when it gets built and whether it meets the specification.
The workflow after every stage
#chatgpt-mermaid-_r_47l_{font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";font-size:16px;fill:rgb(237, 237, 237);}@keyframes edge-animation-frame{from{stroke-dashoffset:0;}}@keyframes dash{to{stroke-dashoffset:0;}}#chatgpt-mermaid-_r_47l_ .edge-animation-slow{stroke-dasharray:9,5!important;stroke-dashoffset:900;animation:dash 50s linear infinite;stroke-linecap:round;}#chatgpt-mermaid-_r_47l_ .edge-animation-fast{stroke-dasharray:9,5!important;stroke-dashoffset:900;animation:dash 20s linear infinite;stroke-linecap:round;}#chatgpt-mermaid-_r_47l_ .error-icon{fill:rgb(48, 48, 48);}#chatgpt-mermaid-_r_47l_ .error-text{fill:rgb(237, 237, 237);stroke:rgb(237, 237, 237);}#chatgpt-mermaid-_r_47l_ .edge-thickness-normal{stroke-width:1px;}#chatgpt-mermaid-_r_47l_ .edge-thickness-thick{stroke-width:3.5px;}#chatgpt-mermaid-_r_47l_ .edge-pattern-solid{stroke-dasharray:0;}#chatgpt-mermaid-_r_47l_ .edge-thickness-invisible{stroke-width:0;fill:none;}#chatgpt-mermaid-_r_47l_ .edge-pattern-dashed{stroke-dasharray:3;}#chatgpt-mermaid-_r_47l_ .edge-pattern-dotted{stroke-dasharray:2;}#chatgpt-mermaid-_r_47l_ .marker{fill:rgb(175, 175, 175);stroke:rgb(175, 175, 175);}#chatgpt-mermaid-_r_47l_ .marker.cross{stroke:rgb(175, 175, 175);}#chatgpt-mermaid-_r_47l_ svg{font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";font-size:16px;}#chatgpt-mermaid-_r_47l_ p{margin:0;}#chatgpt-mermaid-_r_47l_ .label{font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";color:rgb(237, 237, 237);}#chatgpt-mermaid-_r_47l_ .cluster-label text{fill:rgb(237, 237, 237);}#chatgpt-mermaid-_r_47l_ .cluster-label span{color:rgb(237, 237, 237);}#chatgpt-mermaid-_r_47l_ .cluster-label span p{background-color:transparent;}#chatgpt-mermaid-_r_47l_ .label text,#chatgpt-mermaid-_r_47l_ span{fill:rgb(237, 237, 237);color:rgb(237, 237, 237);}#chatgpt-mermaid-_r_47l_ .node rect,#chatgpt-mermaid-_r_47l_ .node circle,#chatgpt-mermaid-_r_47l_ .node ellipse,#chatgpt-mermaid-_r_47l_ .node polygon,#chatgpt-mermaid-_r_47l_ .node path{fill:rgb(9, 23, 44);stroke:rgb(31, 78, 148);stroke-width:1px;}#chatgpt-mermaid-_r_47l_ .rough-node .label text,#chatgpt-mermaid-_r_47l_ .node .label text,#chatgpt-mermaid-_r_47l_ .image-shape .label,#chatgpt-mermaid-_r_47l_ .icon-shape .label{text-anchor:middle;}#chatgpt-mermaid-_r_47l_ .node .katex path{fill:#000;stroke:#000;stroke-width:1px;}#chatgpt-mermaid-_r_47l_ .rough-node .label,#chatgpt-mermaid-_r_47l_ .node .label,#chatgpt-mermaid-_r_47l_ .image-shape .label,#chatgpt-mermaid-_r_47l_ .icon-shape .label{text-align:center;}#chatgpt-mermaid-_r_47l_ .node.clickable{cursor:pointer;}#chatgpt-mermaid-_r_47l_ .root .anchor path{fill:rgb(175, 175, 175)!important;stroke-width:0;stroke:rgb(175, 175, 175);}#chatgpt-mermaid-_r_47l_ .arrowheadPath{fill:rgb(175, 175, 175);}#chatgpt-mermaid-_r_47l_ .edgePath .path{stroke:rgb(175, 175, 175);stroke-width:1px;}#chatgpt-mermaid-_r_47l_ .flowchart-link{stroke:rgb(175, 175, 175);fill:none;}#chatgpt-mermaid-_r_47l_ .edgeLabel{background-color:rgb(0, 0, 0);text-align:center;}#chatgpt-mermaid-_r_47l_ .edgeLabel p{background-color:rgb(0, 0, 0);}#chatgpt-mermaid-_r_47l_ .edgeLabel rect{opacity:0.5;background-color:rgb(0, 0, 0);fill:rgb(0, 0, 0);}#chatgpt-mermaid-_r_47l_ .labelBkg{background-color:rgba(0, 0, 0, 0.5);}#chatgpt-mermaid-_r_47l_ .cluster rect{fill:rgb(48, 48, 48);stroke:rgba(255, 255, 255, 0.15);stroke-width:1px;}#chatgpt-mermaid-_r_47l_ .cluster text{fill:rgb(237, 237, 237);}#chatgpt-mermaid-_r_47l_ .cluster span{color:rgb(237, 237, 237);}#chatgpt-mermaid-_r_47l_ div.mermaidTooltip{position:absolute;text-align:center;max-width:200px;padding:2px;font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";font-size:12px;background:rgb(48, 48, 48);border:1px solid rgba(255, 255, 255, 0.15);border-radius:2px;pointer-events:none;z-index:100;}#chatgpt-mermaid-_r_47l_ .flowchartTitleText{text-anchor:middle;font-size:18px;fill:rgb(237, 237, 237);}#chatgpt-mermaid-_r_47l_ rect.text{fill:none;stroke-width:0;}#chatgpt-mermaid-_r_47l_ .icon-shape,#chatgpt-mermaid-_r_47l_ .image-shape{background-color:rgb(0, 0, 0);text-align:center;}#chatgpt-mermaid-_r_47l_ .icon-shape p,#chatgpt-mermaid-_r_47l_ .image-shape p{background-color:rgb(0, 0, 0);padding:2px;}#chatgpt-mermaid-_r_47l_ .icon-shape .label rect,#chatgpt-mermaid-_r_47l_ .image-shape .label rect{opacity:0.5;background-color:rgb(0, 0, 0);fill:rgb(0, 0, 0);}#chatgpt-mermaid-_r_47l_ .label-icon{display:inline-block;height:1em;overflow:visible;vertical-align:-0.125em;}#chatgpt-mermaid-_r_47l_ .node .label-icon path{fill:currentColor;stroke:revert;stroke-width:revert;}#chatgpt-mermaid-_r_47l_ .node .neo-node{stroke:rgb(31, 78, 148);}#chatgpt-mermaid-_r_47l_ [data-look="neo"].node rect,#chatgpt-mermaid-_r_47l_ [data-look="neo"].cluster rect,#chatgpt-mermaid-_r_47l_ [data-look="neo"].node polygon{stroke:url(#chatgpt-mermaid-_r_47l_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-_r_47l_ [data-look="neo"].swimlane.cluster rect{filter:none;}#chatgpt-mermaid-_r_47l_ [data-look="neo"].node path{stroke:url(#chatgpt-mermaid-_r_47l_-gradient);stroke-width:1px;}#chatgpt-mermaid-_r_47l_ [data-look="neo"].node .outer-path{filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-_r_47l_ [data-look="neo"].node .neo-line path{stroke:rgb(31, 78, 148);filter:none;}#chatgpt-mermaid-_r_47l_ [data-look="neo"].node circle{stroke:url(#chatgpt-mermaid-_r_47l_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-_r_47l_ [data-look="neo"].node circle .state-start{fill:#000000;}#chatgpt-mermaid-_r_47l_ [data-look="neo"].icon-shape .icon{fill:url(#chatgpt-mermaid-_r_47l_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-_r_47l_ [data-look="neo"].icon-shape .icon-neo path{stroke:url(#chatgpt-mermaid-_r_47l_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-_r_47l_ .node text{font-size:14px;font-weight:600;letter-spacing:normal;fill:rgb(153, 206, 255);}#chatgpt-mermaid-_r_47l_ .edgeLabels text{font-size:13px;font-weight:600;letter-spacing:-0.08px;fill:rgb(153, 206, 255);}#chatgpt-mermaid-_r_47l_ .node tspan[font-weight="normal"],#chatgpt-mermaid-_r_47l_ .edgeLabels tspan[font-weight="normal"]{font-weight:600;}#chatgpt-mermaid-_r_47l_ .edgeLabel .label rect{opacity:1;rx:13px;ry:13px;fill:rgb(0, 14, 26);stroke:rgb(26, 62, 95);stroke-width:1px;}#chatgpt-mermaid-_r_47l_ .node rect,#chatgpt-mermaid-_r_47l_ .node circle,#chatgpt-mermaid-_r_47l_ .node ellipse,#chatgpt-mermaid-_r_47l_ .node polygon,#chatgpt-mermaid-_r_47l_ .node path{fill:rgb(0, 40, 77);stroke:rgba(255, 255, 255, 0.1);stroke-width:1px;}#chatgpt-mermaid-_r_47l_ .node rect{rx:16px;ry:16px;}#chatgpt-mermaid-_r_47l_ .mermaid-decision .label-container{fill:rgb(0, 14, 26);stroke:rgb(26, 62, 95);stroke-dasharray:2,2;}#chatgpt-mermaid-_r_47l_ .edgePaths .flowchart-link{stroke:rgb(175, 175, 175);stroke-width:1px;stroke-linecap:round;stroke-linejoin:round;}#chatgpt-mermaid-_r_47l_ .marker{fill:rgb(175, 175, 175);stroke:rgb(175, 175, 175);}#chatgpt-mermaid-_r_47l_ :root{--mermaid-font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";}I provide an approved stagepromptYou assign it to a codingagentAgent implements the stageAgent runs tests and buildsAgent submits completionreportDo all acceptance criteriapass?Send failures back to agentYou bring evidence to meArchitecture reviewMove to next stageNoYesChanges neededApproved

Rules for working with multiple agents
You can use several agents, but I don't want them all editing the same files simultaneously.
Agent Responsibility When to use
Agent A Anchor program Stages 1–4
Agent B Matching engine After the offer interface is stable
Agent C SDK After the IDL is available
Agent D Frontend After SDK interfaces are agreed
Agent E Independent reviewer Stages 4 and 9

You can parallelize some work, but only after dependencies are stable.

For example, the frontend agent can create static layouts while the program agent works on escrow. But don't let the frontend agent invent SDK methods before we agree on them.

One agent owns the core program at a time. We don't want merge conflicts or competing implementations of the same security-critical instruction. 8. The things I will personally hold the agents accountable for
These are the non-negotiable project invariants.
CIRCUIT security invariants

1. Only the offer maker can authorize the initial deposit.
2. Only CIRCUIT's PDA authority can move escrowed tokens.
3. Refunds always go to the original maker.
4. A matcher cannot redirect settlement assets.
5. All three offers must be valid before settlement.
6. Every participant must receive exactly what their offer requested.
7. A failed settlement cannot leave some transfers completed and others undone.
8. A filled, cancelled or expired offer cannot be reused.
9. No single administrator can seize or redirect user assets.

The core promise
No valid exchange, no transfer. No complete settlement, no partial settlement.

A few more engineering decisions I want us to retain:

- Use integer token amounts throughout the program and SDK.
- Don't use JavaScript number for large on-chain token quantities.
- Keep the original SPL Token Program as the only supported token program initially.
- Don't introduce a global writable counter into settlement; it could unnecessarily serialize otherwise independent exchanges.
- Keep the offer state on-chain, but don't build a complicated indexer for the hackathon.
- Don't close terminal offer accounts in the MVP.
- Don't deploy to Mainnet.
  These choices keep the first implementation manageable and reduce the number of things an agent can get wrong.

9. Your management dashboard
   Here's how I want you to track the work. You can use this as a checklist and update it as agents finish.
   Project progress
   0/11

[ ] Stage 0 — Discovery

Environment, dependency versions and architecture plan.

[ ] Stage 1 — Scaffold

Anchor workspace, SDK, matcher and frontend foundations.

[ ] Stage 2 — Offer creation

Offer PDAs, escrow authorities and token deposits.

[ ] Stage 3 — Offer lifecycle

Cancellation, expiry and refunds.

[ ] Stage 4 — Settlement

Three-party validation, CPI transfers and atomic rollback.

[ ] Stage 5 — Matcher

Read offers and discover valid exchange cycles.

[ ] Stage 6 — SDK

Typed developer-facing integration package.

[ ] Stage 7 — Demo frontend

Wallets, offers, cycle visualization and settlement.

[ ] Stage 8 — Devnet

Public deployment and real transaction verification.

[ ] Stage 9 — Security review

Independent adversarial review and regression tests.

[ ] Stage 10 — Presentation

Documentation, integration guide and hackathon pitch.

Reset checklist

This checklist is a planning aid, not proof that a stage passed. We only mark a stage complete after reviewing the agent's evidence.

10. One final thing: don't let the agents rush us
    I want to emphasize something about the actual smart contract.

The offer creation and settlement instructions are handling other people's assets. We cannot treat a green frontend or a successful compilation as proof that the protocol is safe.

For instance, the following are three completely different claims:
Claim What proves it
The program compiles Successful build
The program behaves correctly Passing tests, including adversarial cases
The program is safe for production Independent professional security audit and further operational review

Our hackathon target is the first two, plus a careful independent security review. We are not claiming production readiness.

Also, the official Solana transaction documentation now describes larger transaction formats and evolving limits, so our agents must check current runtime limits and measure the actual three-party settlement rather than hardcode assumptions from old tutorials.
Solana+1

My instruction to you as tech lead
Do not give your agents all eleven prompts at once.

Start with Stage 0. Get the environment report and technical plan. Bring those results here.

I'll review:

- Whether the selected Anchor version is appropriate.
- Whether the workspace structure is sensible.
- Whether the account architecture is correct.
- Whether the agent has identified the important Solana security constraints.
- Whether there are any unnecessary technologies or services.
  Then I'll authorize Stage 1.

We're going to build this like an actual protocol engineering team, not like we're prompting an AI to generate a weekend CRUD application. 😭

Your first assignment is Stage 0. Once your agent returns its reports, send them here and we'll conduct the first architecture review.
