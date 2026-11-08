CREATE A SEPARATE FILE IF ALREADY CREATED CALLED PROGRESS UPDATE THE STAGE WE ARE AT AND WHAT HAS BEEN VERIFIED AS COMPLETE AND ADDITIONAL NOTES

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

.

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
- Whether there are any unnecessary technologies or services
