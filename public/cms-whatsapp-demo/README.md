# CurateMyStay WhatsApp booking demo

A self-contained animated WhatsApp chat (27 s loop). No build step, no external requests: fonts and images are bundled in `assets/`.

## Add to the Next.js site

1. Copy this whole folder to `public/cms-whatsapp-demo/`.
2. Embed it wherever you want the phone:

```tsx
<iframe
  src="/cms-whatsapp-demo/index.html"
  title="How booking on WhatsApp works"
  loading="lazy"
  className="w-full max-w-[340px] aspect-[560/1080] border-0 bg-transparent"
/>
```

The phone scales to fit the iframe and the page background is transparent, so it sits on any section colour.

## Behaviour

- Starts playing as soon as it loads and loops forever.
- Pauses while scrolled out of view or when the tab is hidden, and resumes where it left off.
- Visitors with "reduce motion" turned on see a single still frame (the confirmed receipt) instead of the animation.

## Editing content

Everything is in `index.html`:

- Chat text, prices, booking ID: edit the `.msg` blocks in the HTML.
- The pre-filled enquiry shown in the input box: `M1TXT` in the script.
- Typed replies: `OUT2` and `OUT3` in the script.
- Timing of every step: the `T` object in the script (seconds). `DUR` is the loop length.
- Images: `assets/owner.jpg` (chat DP), `assets/villa.jpg` (link preview), `assets/wallpaper.jpg` (chat background).
