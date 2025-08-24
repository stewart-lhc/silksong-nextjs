# Data Files for PRD Day 2

This directory contains the data files created for the PRD Day 2 implementation of the Silksong information center.

## Files Overview

### Core Data Files

- **`differences.json`** - Comparison data between Hollow Knight and Silksong (18+ items)
- **`platforms.json`** - Platform availability information (12+ platforms)  
- **`faqs.json`** - Frequently asked questions (7+ FAQs)
- **`differences-unconfirmed.json`** - Unconfirmed expectations and speculations (6+ items)

### Supporting Files

- **`index.ts`** - Main data exports with TypeScript types and utility functions
- **`timeline.json`** - Existing timeline data
- **`checklist.json`** - Existing checklist data
- **`gameInfo.json`** - Existing game information

## Data Structure

### differences.json
```typescript
interface DifferenceItem {
  dimension: string;           // Unique comparison dimension
  hk: string;                 // Hollow Knight value
  ss: string;                 // Silksong value  
  status: 'confirmed' | 'hinted' | 'tba';
  source: {                   // Required for confirmed/hinted, null for tba
    label: string;
    url: string;              // Must be HTTPS
  } | null;
}
```

### platforms.json
```typescript
interface PlatformItem {
  platform: string;           // Platform name
  status: 'confirmed' | 'tba' | 'unannounced';
  notes?: string;             // Optional notes
  source?: {                  // Required for confirmed status
    label: string;
    url: string;              // Must be HTTPS
  } | null;
}
```

### faqs.json
```typescript
interface FaqItem {
  q: string;                  // Question (plain text, no HTML)
  a: string;                  // Answer (plain text, no HTML)
}
```

### differences-unconfirmed.json
```typescript
interface UnconfirmedDifferenceItem {
  expectation: string;        // What is expected
  rationale: string;          // Why this is expected
  status: 'unconfirmed';      // Always 'unconfirmed'
  note?: string;              // Optional additional context
}
```

## Validation

All data files are validated using the `validate-data.mjs` script:

```bash
npm run validate-data
```

The validation ensures:
- Required minimum counts (differences ≥15, platforms ≥10, faqs ≥5)
- No duplicate dimensions in differences.json
- Proper status values and source requirements
- HTTPS URLs for all sources
- No HTML in FAQ content
- No forbidden words in unconfirmed items

## Usage in Components

Import data from the main index file:

```typescript
import { 
  differences, 
  platforms, 
  faqs, 
  differencesUnconfirmed,
  getDifferencesByStatus,
  getConfirmedPlatforms,
  getGamePassFaqs
} from '@/data';

// Get confirmed differences only
const confirmed = getDifferencesByStatus('confirmed');

// Get confirmed platforms
const confirmedPlatforms = getConfirmedPlatforms();

// Get Game Pass related FAQs
const gamePassFaqs = getGamePassFaqs();
```

## Build Integration

The validation script is automatically run during the build process via the `prebuild` npm script, ensuring data integrity before deployment.

## Content Guidelines

- All external URLs must use HTTPS protocol
- No HTML tags in FAQ content (plain text only)
- Unconfirmed items must not contain words like "confirmed", "official", or "guaranteed"
- Game Pass must be represented in both platforms and FAQs
- All data should be factual and well-sourced where possible