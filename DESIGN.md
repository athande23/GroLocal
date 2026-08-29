# GroLocal Design System

## Design Principles

1. **Authentic & Accessible** — Clear visual hierarchy with intentional contrast and spacing
2. **Organic Growth** — Natural, warm aesthetics inspired by gardening and community
3. **Mobile-First** — Responsive design that works seamlessly across all devices
4. **Performance** — Subtle transitions (150-200ms) that enhance, not distract
5. **Consistent** — Reusable components with predictable behavior

---

## Color System

### Primary Colors

```
--color-ink:        #1c1b19  (darkest text and primary elements)
--color-graphite:   #5f5c55  (secondary text, muted elements)
--color-green:      #3f6b4a  (accent, CTAs, focus states)
--color-green-soft: #edf2ed  (light background tint for green states)
```

### Neutral Colors

```
--color-paper:      #fcfbf8  (page background, lightest)
--color-fill:       #f3f1ec  (component backgrounds, cards)
--color-line:       #e2dfd8  (borders, dividers)
```

### Usage Patterns

- **Ink** — Headings (h1, h2), primary text, strong emphasis
- **Graphite** — Body text (15px base), secondary info, captions
- **Green** — Buttons, interactive elements, hover states, accents
- **Green-Soft** — Hover backgrounds, light highlights
- **Paper** — Page/body background
- **Fill** — Card backgrounds, input backgrounds
- **Line** — Borders, dividers

---

## Typography

### Font Families

- **Display** — Source Serif (serif) for headings and special sections
- **Body** — Inter (sans-serif, system fallback) for body text and UI

### Type Scale

```
Heading 1  (h1)  — 48px (md: 52px) / 1.0-1.15 line-height / semibold
Heading 2  (h2)  — 24px / 1.33 line-height / semibold
Heading 3  (h3)  — 18px / 1.4 line-height / semibold
Body       (p)   — 15px / 1.6 line-height / normal
Caption    (em)  — 13px / 1.5 line-height / normal
```

### Responsive Type

- **Mobile (< 640px)** — Reduced by ~20% (h1: 36px, h2: 20px)
- **Tablet (640px-1024px)** — 90-95% scale
- **Desktop (> 1024px)** — Full scale

---

## Spacing & Layout

### Spacing Scale (Tailwind-based)

```
xs   — 2px   (1 unit)
sm   — 4px   (2 units)
md   — 8px   (4 units)
lg   — 12px  (6 units)
xl   — 16px  (8 units)
2xl  — 24px  (12 units)
3xl  — 32px  (16 units)
4xl  — 48px  (24 units)
```

### Section Spacing

```
Hero Section       — py-12 sm:py-16 md:py-20 (48-80px vertical)
Content Section    — py-12 sm:py-14 md:py-16 (48-64px vertical)
Component Spacing  — mt-6 sm:mt-8 md:mt-12 (24-48px between sections)
```

### Container & Grid

```
Max Width      — 1200px (lg:max-w-[1200px])
Padding        — px-4 sm:px-6 lg:px-8 (16-32px horizontal)
Gap (flex)     — gap-4 (16px)
Gap (columns)  — gap-x-8 sm:gap-x-12 (32-48px)
Grid (future)  — 12-column grid with 16px gutter
```

---

## Components

### Button

**Variants:** Primary | Secondary | Ghost

```tsx
// Primary (Call-to-Action)
bg-green text-white hover:bg-green/90 active:bg-green/95
shadow-sm hover:shadow-md

// Secondary (Alternative)
border border-ink bg-transparent text-ink hover:bg-ink hover:text-paper

// Ghost (Minimal)
text-green hover:underline underline-offset-4
```

**States:**
- Default — Normal appearance
- Hover — Subtle background change, shadow increase
- Active — Deeper color, maintained shadow
- Disabled — opacity-50, cursor-not-allowed
- Focus — ring-2 ring-green ring-offset-2

**Sizing:**
- Padding — px-4 py-2.5 (16px horizontal, 10px vertical)
- Font — text-base font-medium
- Transition — duration-200

---

### Card

**Default Styling:**
```tsx
bg-fill border border-line rounded-lg p-5 sm:p-6
```

**Hover Variant** (`hover={true}`):
```tsx
transition-all duration-200 hover:border-green hover:shadow-md hover:bg-green-soft/30
```

**States:**
- Default — Neutral fill background, thin border
- Hover — Green border, subtle shadow, light green tint background
- Focus — Focus ring for accessible links/interactive cards

---

### Plant Tile

Letterform avatar system using plant name initials:

**Sizes:**
- **sm** — h-10 w-10 text-lg (for lists)
- **md** — h-14 w-14 text-2xl (default, for cards)
- **lg** — h-20 w-20 text-3xl (for profiles)

**Styling:**
- Font — Display serif, semibold, centered
- Background — Fill color with border
- Indicator — Green dot (2px) in bottom-right corner
- Transition — smooth 200ms for hover effects

---

### Interactive Links

**Standard Link (as card):**
```tsx
rounded-lg border border-line bg-fill p-4 
transition-all duration-200 
hover:border-green hover:shadow-md hover:bg-green-soft/40
```

**Chip Link:**
```tsx
rounded-md border border-line bg-fill px-4 py-2.5 
transition-all duration-200 
hover:border-green hover:bg-green-soft/60 hover:shadow-sm
```

---

## Responsive Design

### Breakpoints

```
Mobile (< 640px)     — Stack, reduced spacing, smaller text
Tablet (640px+)      — sm: prefix, moderate columns
Desktop (1024px+)    — lg: prefix, full layout, max spacing
```

### Responsive Patterns

**Sections:**
```tsx
// Padding responsive
px-4 sm:px-6 lg:px-8

// Spacing responsive
py-12 sm:py-14 md:py-16
gap-x-8 sm:gap-x-12

// Text responsive
text-base sm:text-lg md:text-xl
leading-relaxed
```

**Headings:**
```tsx
// Hero heading
text-3xl sm:text-4xl md:text-5xl lg:text-6xl

// Section heading
text-2xl sm:text-3xl font-semibold
```

---

## Interactions & Transitions

### Transition Timing

All interactive elements use `duration-200` (200ms) for:
- Hover state changes
- Border color transitions
- Background tint changes
- Shadow shifts

```css
transition-all duration-200
transition-colors duration-200
```

### Focus Indicators

All interactive elements support keyboard navigation:
```css
focus:outline-none focus-visible:ring-2 focus-visible:ring-green ring-offset-2
```

### Hover Effects Hierarchy

1. **Subtle** — Border color change only (chips, text links)
2. **Medium** — Border + shadow (cards)
3. **Strong** — Border + shadow + background tint (primary CTAs)

---

## Accessibility

### Color Contrast

- Ink (#1c1b19) on Paper (#fcfbf8) — **18.5:1** (AAA)
- Green (#3f6b4a) on Fill (#f3f1ec) — **7.2:1** (AA)
- Graphite (#5f5c55) on Paper (#fcfbf8) — **7.8:1** (AA)

### Focus Management

- All interactive elements have visible focus rings
- Focus ring uses green color with 2px offset
- Tab order follows DOM structure

### Semantic HTML

- Use `<button>` for actions, `<Link>` for navigation
- Proper heading hierarchy (h1 → h2 → h3)
- `alt` text for all meaningful images
- ARIA labels for complex interactive regions

---

## Usage Examples

### Hero Section

```tsx
<section className="py-12 sm:py-16 md:py-20">
  <h1 className="text-3xl sm:text-4xl md:text-6xl font-semibold text-ink">
    Heading
  </h1>
  <p className="mt-4 sm:mt-5 text-base sm:text-lg text-graphite">
    Subheading
  </p>
</section>
```

### Content Section with Cards

```tsx
<section className="border-t border-line py-12 sm:py-14 md:py-16">
  <h2 className="text-2xl sm:text-3xl font-semibold text-ink">
    Section Title
  </h2>
  
  <div className="mt-6 sm:mt-8 flex gap-4">
    {items.map((item) => (
      <Card hover key={item.id}>
        {item.content}
      </Card>
    ))}
  </div>
</section>
```

### Interactive Link

```tsx
<Link
  href="/path"
  className="group rounded-lg border border-line bg-fill p-4 transition-all duration-200 hover:border-green hover:shadow-md hover:bg-green-soft/40"
>
  <h3 className="group-hover:text-green transition-colors">Title</h3>
  <p className="text-graphite">Description</p>
</Link>
```

---

## Future Considerations

- Dark mode color scheme
- Animation library for complex transitions
- Component variants for form inputs
- Icon system integration
- Micro-interaction guidelines
- Print stylesheet
