import assert from 'node:assert';
import { describe, it } from 'node:test';

import {
  extractContent,
  processContent,
} from '@/registry/internet/extract-content';

const input = `# Aomni

## Setting up Supabase

The backend of this project is managed by Supabase. To start dev, setup Supabase for local dev: <https://supabase.com/docs/guides/resources/supabase-cli/local-development>

## Env variables

We use vercel to manage env varibales.

- Link the project  
  "vercel link"

- Sync env variables
  "vercel env pull .env.local"

## Post install

For Linux distros, run "./scripts/install-deps.sh" to install the necessary deps to run puppeteer. This need to be done in sudo mode (because it uses apt-get), so it is not included as part of the "postinstall" script.

## Dev server

To run the dev server, run "pnpm dev".

For the backend to handle the events, you need to run the inngest server. To do so, run "pnpm dev:inngest".

## Workflow

Link a project:
"npx supabase link --project-ref [PROJECT_ID]"

If you make changes in the database schema in supabase dashboard, download migration files running:

"npx supabase db pull"

Once the local schema has been updated, reset the local supabase instance by running:

"npx supabase db reset"

If you make changes in the local schema and want to push the schema change to the production database, run:

"npx supabase db push"

Once the local database is up to date, make sure to update types via:

"pnpm supabase:types"

## Design Patterns

For notifying the user:

Try to show user alert messages via toasts when possible, as it is unintrusive. This is done via the "react-hot-toast" package.

When an intrusive alert is required, use the "alert-dialog" component in "@/components/ui".

Text wrapping:

A lot of user and AI generated content will have new lines, make sure all elements that can potientially display rich content has text wrapping enabled. Specifically, use "whitespace-break-spaces".

### Class names

Always add the "className" prop to child components. Generally, avoid setting margins to child components, instead, the parent component should set the margins for their child component via "className". This keeps layout styles seperate from individual component styles.

### List components

When making components that contains list of elements (e.g. "pipeline-list"), have the component just export the list, don't wrap the list in any divs or other elements. Instead, wrap the list of components in a fragment. This will make it easy for parent component to add its own styles and spacing.

The "className" prop of the list component should be applied to each item in the list itself.

### Portal components

Portal components manages client state and determines if it should show or hide its children. This is a useful pattern for server components, as it allows the portals to be rendered in server components without having the server component deal with client state to show visibility.

## Architecture Patterns

### Inngest

All backend business logic should be written as Inngest functions (so it can execute async and we get retries & timeouts). Database operations can be implemented client side via supabase (or also via inngest functions). Use the "sendEvent" method to trigger an inngest function run from the client side.

When implementing inngest functions, import "db" from "supabase-admin". Dont't use "supabase-client" or "supabase-server", as those need to read cookings and are meant for client rendering or SSR. "supabase-admin" uses the service key so inngest can access it directly.

### Analytics

Please review the event [naming best practices](https://segment.com/docs/getting-started/04-full-install/#event-naming-best-practices) in order to standardize on names.

## Evals

For every LLM call, try to have at least one eval. This makes it much easier to debug outputs, as well as eventually allowing us to collect a set of edge cases for finetuning & regression testing.

For every eval, follow the same pattern in terms of file structures. There should be at least 3 files:

- "README.md" - Every eval should have a readme, that contains: what this eval is doing, what is it testing (baseline or edge case), as well as ideal output (for comparison).
- "data.ts" - This is the eval input data. A good way to collect this is by looking at inngest run logs, and getting data from step outputs of failed inngest runs.
- "[function-name].ts" - The script to actually run the eval. Should be very simple, just import the function and test data, then execute, and print out the results in JSON.

To run evals, use the "tsx" script in "package.json". E.g.:

"""
pnpm tsx evals/llm/[function-name].ts
"""

## VSCode

To use the correct import formatting (non-relative), make sure you set your editor's "import module specifier" setting to "non-relative". This way, all auto imported modules will be based on pre-defined paths.

## Idiosyncrasies

- React update state: We should be careful when updating React component states, specially when the update could be called multiple times without control, for instance inside a **onChange** function. This could trigger multiple state updates causing a "Maximum update depth exceeded" error, multiple API calls, etc.
  For reference see the fix for [Too many calls to Location or History APIs within a short timeframe.](https://github.com/aomni-com/app/pull/347).

- Query keys for hooks should be kept private. Try to organize "useQuery" calls so that all queries & mutations that share the same query keys (including for invalidation) are grouped in the same pattern. Exposing internal working ids like query keys are an anti-pattern.`;

const ideal = `<m>1</m># Aomni<m>2</m>

## Setting up Supabase<m>3</m>

The backend of this project is managed by Supabase.<m>4</m> To start dev, setup Supabase for local dev: <https://supabase.com/docs/guides/resources/supabase-cli/local-development><m>5</m>

## Env variables<m>6</m>

We use vercel to manage env varibales.<m>7</m>

- Link the project<m>8</m>
"vercel link"<m>9</m>

- Sync env variables<m>10</m>
"vercel env pull . env. local"<m>11</m>

## Post install<m>12</m>

For Linux distros, run ".<m>13</m> /scripts/install-deps.<m>14</m> sh" to install the necessary deps to run puppeteer.<m>15</m> This need to be done in sudo mode (because it uses apt-get), so it is not included as part of the "postinstall" script.<m>16</m>

## Dev server<m>17</m>

To run the dev server, run "pnpm dev".<m>18</m>

For the backend to handle the events, you need to run the inngest server.<m>19</m> To do so, run "pnpm dev:inngest".<m>20</m>

## Workflow<m>21</m>

Link a project:<m>22</m>
"npx supabase link --project-ref [PROJECT_ID]"<m>23</m>

If you make changes in the database schema in supabase dashboard, download migration files running:<m>24</m>

"npx supabase db pull"<m>25</m>

Once the local schema has been updated, reset the local supabase instance by running:<m>26</m>

"npx supabase db reset"<m>27</m>

If you make changes in the local schema and want to push the schema change to the production database, run:<m>28</m>

"npx supabase db push"<m>29</m>

Once the local database is up to date, make sure to update types via:<m>30</m>

"pnpm supabase:types"<m>31</m>

## Design Patterns<m>32</m>

For notifying the user:<m>33</m>

Try to show user alert messages via toasts when possible, as it is unintrusive.<m>34</m> This is done via the "react-hot-toast" package.<m>35</m>

When an intrusive alert is required, use the "alert-dialog" component in "@/components/ui".<m>36</m>

Text wrapping:<m>37</m>

A lot of user and AI generated content will have new lines, make sure all elements that can potientially display rich content has text wrapping enabled.<m>38</m> Specifically, use "whitespace-break-spaces".<m>39</m>

### Class names<m>40</m>

Always add the "className" prop to child components.<m>41</m> Generally, avoid setting margins to child components, instead, the parent component should set the margins for their child component via "className".<m>42</m> This keeps layout styles seperate from individual component styles.<m>43</m>

### List components<m>44</m>

When making components that contains list of elements (e.g. "pipeline-list"), have the component just export the list, don't wrap the list in any divs or other elements.<m>45</m> Instead, wrap the list of components in a fragment.<m>46</m> This will make it easy for parent component to add its own styles and spacing.<m>47</m>

The "className" prop of the list component should be applied to each item in the list itself.<m>48</m>

### Portal components<m>49</m>

Portal components manages client state and determines if it should show or hide its children.<m>50</m> This is a useful pattern for server components, as it allows the portals to be rendered in server components without having the server component deal with client state to show visibility.<m>51</m>

## Architecture Patterns<m>52</m>

### Inngest<m>53</m>

All backend business logic should be written as Inngest functions (so it can execute async and we get retries & timeouts).<m>54</m> Database operations can be implemented client side via supabase (or also via inngest functions).<m>55</m> Use the "sendEvent" method to trigger an inngest function run from the client side.<m>56</m>

When implementing inngest functions, import "db" from "supabase-admin".<m>57</m> Dont't use "supabase-client" or "supabase-server", as those need to read cookings and are meant for client rendering or SSR.<m>58</m> "supabase-admin" uses the service key so inngest can access it directly.<m>59</m>

### Analytics<m>60</m>

Please review the event [naming best practices](https://segment.com/docs/getting-started/04-full-install/#event-naming-best-practices) in order to standardize on names.<m>61</m>

## Evals<m>62</m>

For every LLM call, try to have at least one eval.<m>63</m> This makes it much easier to debug outputs, as well as eventually allowing us to collect a set of edge cases for finetuning & regression testing.<m>64</m>

For every eval, follow the same pattern in terms of file structures.<m>65</m> There should be at least 3 files:<m>66</m>

- "README.<m>67</m> md" - Every eval should have a readme, that contains: what this eval is doing, what is it testing (baseline or edge case), as well as ideal output (for comparison).<m>68</m>
- "data.<m>69</m> ts" - This is the eval input data.<m>70</m> A good way to collect this is by looking at inngest run logs, and getting data from step outputs of failed inngest runs.<m>71</m>
- "[function-name].<m>72</m> ts" - The script to actually run the eval.<m>73</m> Should be very simple, just import the function and test data, then execute, and print out the results in JSON.<m>74</m>

To run evals, use the "tsx" script in "package. json". E.g.:<m>75</m>

"""<m>76</m>
pnpm tsx evals/llm/[function-name]. ts<m>77</m>
"""<m>78</m>

## VSCode<m>79</m>

To use the correct import formatting (non-relative), make sure you set your editor's "import module specifier" setting to "non-relative".<m>80</m> This way, all auto imported modules will be based on pre-defined paths.<m>81</m>

## Idiosyncrasies<m>82</m>

- React update state: We should be careful when updating React component states, specially when the update could be called multiple times without control, for instance inside a **onChange** function.<m>83</m> This could trigger multiple state updates causing a "Maximum update depth exceeded" error, multiple API calls, etc.<m>84</m>
For reference see the fix for [Too many calls to Location or History APIs within a short timeframe.]<m>85</m> (https://github.com/aomni-com/app/pull/347).<m>86</m>

- Query keys for hooks should be kept private.<m>87</m> Try to organize "useQuery" calls so that all queries & mutations that share the same query keys (including for invalidation) are grouped in the same pattern.<m>88</m> Exposing internal working ids like query keys are an anti-pattern.<m>89</m>`;

describe('processContent', () => {
  it('Should add markers to content correctly', () => {
    const processed = processContent(input);
    assert.equal(processed.content, ideal);
    assert.equal(processed.sentences.length, 88);
  });

  it('Should extract the right text when asked a specific question', async () => {
    const extracted = await extractContent({
      page: { url: '', content: input },
      query: 'How to setup supabase',
    });

    console.log(extracted);
  });

  it('Should extract the all content when asked', async () => {
    const extracted = await extractContent({
      page: { url: '', content: input },
      query: 'Extract the relevant content',
    });

    console.log(extracted);
  });
});
