# DeepSeek

This is a new experimental architecture for a llm powered internet scale _retrieval engine_. This architecture is very different from current research agents, which are designed as _answer engines_.

The main difference breaks down to:
answer engine: aggregate a ton of sources to find the one correct answer
retrieval engine: process a ton of sources to collect a list of entities for enrichment

The end result for an answer engine is a research report, the end result for a retrieval engine is a table with all the retrieved entities and enriched columns.

## Getting Started

To run the dev server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to start searching

### Environment Variables

Make sure you have API keys for Anthropic and Exa

Create a .env file, and put in the following environment variables:

```
ANTHROPIC_KEY="anthropic_api_key"
EXA_KEY="exa_api_key"
```

## Architecture
