# Todo Card – HNG Internship Stage 1a

A testable, accessible, and responsive Todo Card component built with vanilla HTML, CSS, and JavaScript.

## What Changed from Stage 0

### New Features
- **Edit form** — full edit mode with dedicated Save and Cancel buttons. Snapshot-based cancel restores the exact previous state without data loss.
- **Status control** — interactive dropdown (Pending / In Progress / Done) synced three-ways with the checkbox and the status badge. Changing any one updates all others.
- **Priority indicator** — colored bar below the card header that visually changes between Low (green), Medium (amber), and High (red).
- **Expand / collapse** — long descriptions collapse by default with a gradient fade. "Show more" toggle reveals full content. Fully keyboard accessible with `aria-expanded` and `aria-controls`.
- **Overdue indicator** — overdue state is surfaced in the status badge and the time remaining display simultaneously.
- **Completed state** — when status becomes Done, the timer stops and displays "Completed" instead of a countdown.
- **Improved status logic** — checkbox → Done, unchecking Done → Pending, manual dropdown changes propagate to all visual elements.

### Design Decisions
- Save and Cancel are their own buttons inside the edit form, not repurposed Edit/Delete buttons. Cleaner separation of concerns.
- Status control dropdown is positioned on the same row as the tags (space-between) so it doesn't stack awkwardly below.
- The `test-todo-overdue-indicator` element is kept in the DOM for test discovery but is visually hidden — the status badge handles the overdue visual to avoid duplicating the indicator on screen.
- Priority indicator uses a full-width bar rather than a dot or icon so it reads clearly at all screen sizes.
- Textarea in edit form resizes vertically only — prevents horizontal overflow breaking the card layout.

### localStorage
Now persists: title, description, priority, due date, and **status**.

## Features

- Dynamic time remaining — updates every 60 seconds with granular output ("Due in 3 hours", "Overdue by 1 day")
- Checkbox toggle — marks task complete with strikethrough, syncs status
- Status control — three-state dropdown (Pending / In Progress / Done)
- Priority indicator — colored accent bar, changes with priority level
- Expand / collapse — collapsible description for long content
- Overdue detection — badge and time remaining turn red automatically
- Edit mode — full form with Save/Cancel, focus management, keyboard support
- Delete with animation — smooth fade out with confirmation message
- Emoji fallbacks — icons degrade gracefully without internet
- Fully keyboard navigable and screen reader accessible
- Responsive from 320px to 1200px+

## Known Limitations

- Single card only — not a full todo list app
- No backend — data persists in localStorage only, clears on browser data wipe
- Lucide icons require CDN — emoji fallbacks activate offline

## Accessibility Notes

- Edit form fields all have `<label for="">` associations
- Status dropdown has `aria-label`
- Expand toggle uses `aria-expanded` and `aria-controls`
- Collapsible section has matching `id` for `aria-controls`
- Time remaining uses `aria-live="polite"`
- Focus returns to Edit button when edit mode closes
- Keyboard tab order: Checkbox → Status control → Expand toggle → Edit → Delete → Save/Cancel (in edit mode)

## Tech Stack

- HTML5
- CSS3 (custom properties, animations, flexbox)
- Vanilla JavaScript
- Lucide Icons (CDN)
- Ubuntu font (Google Fonts)

## Running Locally

```bash
git clone https://github.com/robert-dominic/todo-card.git
cd todo-card
open index.html
```

## Live Demo

[https://robert-dominic.github.io/todo-card/](#) — replace with your live Stage 1a URL

## Submission

Built for the Frontend Wizards track — HNG Internship Stage 1a task.