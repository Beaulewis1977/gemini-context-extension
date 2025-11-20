# Cost Estimation Guide

Calculate and optimize your Gemini API costs.

## Overview

The cost estimator provides accurate pricing calculations for all Gemini models, helping you budget and optimize spending.

## Basic Usage

```
What are my current API costs?
```

## Features

- **Latest Pricing**: Updated for 2025 rates
- **Tiered Pricing**: Handles Pro model tiers automatically
- **Multi-Request**: Project costs for bulk operations
- **Model Comparison**: See costs across all models
- **Recommendations**: Money-saving suggestions

## Parameters

```typescript
{
  model?: string,        // Default: gemini-2.5-flash
  requestCount?: number  // Default: 1
}
```

## Examples

### Current Costs
```
Estimate my API costs
What would this cost with Gemini 2.5 Pro?
```

### Budget Planning
```
Estimate cost for 100 requests
What would 1000 requests cost?
```

### Model Comparison
```
Compare costs across all models
Show me the cheapest model for my usage
```

## Pricing (2025)

### Gemini 2.5 Series
- **Flash-Lite**: $0.10/M in, $0.40/M out
- **Flash**: $0.30/M in, $2.50/M out
- **Pro**: $1.25/$2.50/M in (tiered), $10/$15/M out (tiered)

### Gemini 1.5 Series
- **Flash**: $0.075/$0.15/M in (tiered), $0.30/$0.60/M out (tiered)
- **Pro**: $1.25/$2.50/M in (tiered), $5/$10/M out (tiered)

## Tiered Pricing

Pro models have different rates based on input size:

**Example - Gemini 2.5 Pro:**
- ≤200k tokens: $1.25/M input, $10/M output
- >200k tokens: $2.50/M input, $15/M output

The tool handles this automatically!

## Best Practices

1. **Estimate first**: Always check costs before bulk operations
2. **Use comparison**: Find the cheapest model that meets needs
3. **Consider Flash-Lite**: 70% cheaper than Flash for simple tasks
4. **Monitor usage**: Check costs regularly
5. **Plan for tiers**: Large contexts trigger higher Pro pricing

## Cost Optimization Strategies

### Choose Right Model
- **Flash-Lite**: Simple tasks, high volume
- **Flash**: General purpose (best balance)
- **Pro**: Complex reasoning only

### Reduce Token Usage
- Shorter prompts
- Smaller context windows
- Summarize long inputs
- Use caching when possible

### Batch Operations
- Group similar requests
- Use asynchronous processing
- Monitor rate limits

## Example Costs

### Wiki Generation (Medium Project)
- Flash-Lite: ~$0.02
- Flash: ~$0.08
- Pro: ~$0.25

### Semantic Search Indexing (1000 files)
- Embedding cost: ~$0.05-0.15

### Context Tracking
- Always free (no API calls)

## Troubleshooting

**Unexpected costs**: Check tiered pricing for Pro models
**Comparison missing models**: Ensure all models are in pricing table
**Incorrect calculations**: Verify latest pricing at [ai.google.dev/pricing](https://ai.google.dev/pricing)

See [Tools Overview](./TOOLS_OVERVIEW.md) for more information.
