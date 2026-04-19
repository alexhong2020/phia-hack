# Phia.com Inspired Next.js Intro Page

## Features Implemented

- **Phia.com Theme**: Deep blue/black background, white/gray text, serif/italic headline, white pill button, vignette, floating blurred product placeholders, and subtle particles.
- **Header**: Minimal, with italic serif "phia" and a white pill "Get Extension" button.
- **Hero Section**: Large serif headline with "phia" italicized, trusted badge, and a white pill CTA button.
- **Background**: Vignette overlay, floating blurred product placeholders, and animated subtle white particles.
- **Phia Section**: AI-powered recommendations, with clean card and tag design.
- **Social Fitting Room Section**: Social voting UI, clean card, and badge design.
- **Footer**: Minimal, with privacy/terms links.

## Key Code Excerpt

```tsx
<div className="min-h-screen bg-[#0a0e1a] text-white overflow-hidden relative font-sans">
  {/* Vignette and floating product placeholders */}
  <div className="pointer-events-none fixed inset-0 z-0">
    <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-transparent to-black/80" />
    {/* Floating blurred product placeholders */}
    <div className="absolute left-10 top-24 w-40 h-48 bg-white/5 rounded-2xl blur-2xl" />
    <div className="absolute right-20 top-40 w-32 h-40 bg-white/10 rounded-2xl blur-2xl" />
    <div className="absolute left-1/3 bottom-20 w-44 h-44 bg-white/10 rounded-2xl blur-2xl" />
    <div className="absolute right-1/4 bottom-32 w-36 h-36 bg-white/5 rounded-2xl blur-2xl" />
    {/* Subtle white particles */}
    <div className="absolute inset-0">
      {[...Array(30)].map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-white/10"
          style={{
            width: `${8 + Math.random() * 12}px`,
            height: `${8 + Math.random() * 12}px`,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            filter: "blur(2px)",
          }}
        />
      ))}
    </div>
  </div>
  {/* ...existing code... */}
</div>
```

## How to Use

- Place the code in your Next.js `/app/page.tsx`.
- Uses Tailwind CSS for all styling.
- All colors and layout match the real phia.com homepage.

---

**Built for a hackathon demo.**

- [x] True phia.com look & feel
- [x] Interactive hero and sections
- [x] Modern, minimal, and clean
