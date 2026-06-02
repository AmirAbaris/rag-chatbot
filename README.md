# Next.js template

This is a Next.js template with shadcn/ui.

## Knowledge base

The canonical Knowledge Base source is:

```text
data/knowledge-base.txt
```

Edit this file directly when the source material changes. The chat API reads it
at runtime and retrieves chunks from its contents.

## Adding components

To add components to your app, run the following command:

```bash
npx shadcn@latest add button
```

This will place the ui components in the `components` directory.

## Using components

To use the components in your app, import them as follows:

```tsx
import { Button } from "@/components/ui/button";
```
