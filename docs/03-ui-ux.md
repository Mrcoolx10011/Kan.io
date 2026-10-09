# ProjectBoard — UI / UX Specification

## 1. Design Language

- **Aesthetic**: clean, minimal, content-first. Boards sit on subtle background textures/gradients; cards are white with soft shadows and rounded corners.
- **Component system**: Tailwind CSS with a shadcn-style primitive set — consistent spacing, typography, and focus states across every screen.
- **Motion**: purposeful micro-animations (card hover lift, smooth list reordering, modal transitions) via framer-motion. Animations respect reduced-motion settings.
- **Accessibility**: drag-and-drop has keyboard-operable alternatives; ARIA roles on dialogs, menus, and the command palette; visible focus rings throughout.
- **White-label**: product name, logo, and landing copy are configuration-driven; public shared boards can hide all vendor attribution.

## 2. Application Shell

```
┌──────────────────────────────────────────────────────────┐
│ Top bar: workspace switcher · search/command (⌘K) · bell · avatar │
├───┬──────────────────────────────────────────────────────┤
│ S │                                                      │
│ i │              BOARD CANVAS (horizontal scroll)        │
│ d │   ┌───────┐ ┌───────┐ ┌───────┐ ┌─────────┐         │
│ e │   │ List  │ │ List  │ │ List  │ │  + Add  │         │
│ b │   │ ┌───┐ │ │ ┌───┐ │ │ ┌───┐ │ │  list   │         │
│ a │   │ │Card│ │ │ │Card│ │ │ │Card│ │ │         │         │
│ r │   │ └───┘ │ │ └───┘ │ │ └───┘ │ │         │         │
│   │   └───────┘ └───────┘ └───────┘ │         │         │
│   │                                 │         │         │
└───┴──────────────────────────────────────────────────────┘
```

**Left sidebar**: workspaces → boards (with per-user favourites at top), link to templates, workspace member list. Collapsible on smaller screens.

## 3. Key Screens

| Screen | Description |
|---|---|
| **Landing** | Product marketing page with feature highlights and a call to action. |
| **Login / Sign-up** | Email+password form plus optional social/OIDC buttons. |
| **Onboarding** | Two short steps: choose a plan (if billing enabled) → create first workspace. |
| **Boards home** (`/boards`) | All boards across the user's workspaces; favourites section. |
| **Board view** | The core screen (see §2). List lanes scroll horizontally; each lane has a header (title, card count) and a composer at the bottom ("Add a card…"). Filters bar: label chips, member avatars, due-date presets, search box. |
| **Card detail** | Opens as a focused page/route (deep-linkable, e.g. `/cards/<id>`): title (inline edit), list/position indicator, members & labels in the header row, rich-text description, checklist(s) with progress bars, attachments grid, comment thread (newest last), and a right-hand rail with **Activity** (immutable, timestamped) and card metadata (due date, watchers, card number). |
| **Public shared board** (`/<workspaceSlug>/<boardSlug>`) | Read-only rendering of a public board on a clean, brand-free URL — no chrome, no login prompt. |
| **Workspace dashboard** (`/<workspaceSlug>`) | Workspace overview: boards, members, recent activity. |
| **Members** | Invite by email, manage invite links, assign roles, pause members. |
| **Templates** | Template gallery; "use template" creates a new board pre-populated with its lists/cards/labels. |
| **Settings** (account & workspace) | Profile & avatar, password, API keys, notification preferences · workspace name/slug, roles & permissions editor, webhooks (with delivery log), integrations, billing. |
| **Invite accept** (`/invite/<code>`) | Signed-in flow to join a workspace via link. |
| **Upgrade / pricing** | Shown only when the billing module is enabled. |
| **Feedback modal** | Reachable from the user menu; submits to a feedback store for the operators. |

## 4. Core Interactions

- **Drag & drop** (@dnd-kit): cards reorder within/across lists; whole lists reorder on the board. Optimistic UI — the board updates instantly and syncs in the background; failures roll back with a toast.
- **Card composer**: single-click "Add a card" keeps focus for rapid entry (type → Enter → next card); Esc dismisses.
- **Inline editing**: click card title, list title, or board title to edit in place.
- **Filters**: combine label + member + due-date + text; filtered-out cards dim or hide (toggle).
- **Command palette** (`⌘K` / `Ctrl+K`): fuzzy jump to boards, quick actions (new board, new card, go to settings).
- **Due dates**: colour-coded badges (soon = amber, overdue = red); optional date-picker with time.
- **Checklists**: per-card, add items inline, progress ring/bar on the card face.
- **Comments**: markdown-flavoured rich text, avatar + timestamp header, edit/delete on own comments.
- **Notifications**: bell dropdown with unread counts; deep-links to the relevant card.

## 5. Responsive Behaviour

- Desktop-first board canvas; on tablets, lists keep full width and the sidebar collapses to an icon rail.
- Below tablet widths the app shows a friendly "desktop recommended" notice (Kanban boards are inherently wide); public shared boards remain fully responsive since they are read-only.
