# PROJECT

## Stack

- Expo + React Native (web first)
- JavaScript
- Target: website you add to the iPhone home screen

## Language overlay

`core/languages/javascript.md`

## Map

| Path | Role |
|---|---|
| `App.js` | App shell |
| `src/features/` | Screens and features (next feature goes here) |
| `src/shared/` | Shared UI / helpers |

## Rules for collaborators (including AI)

- Extend this structure; do not invent a parallel layout.
- Demo screen is disposable.
- Prefer React Native primitives and StyleSheet patterns already in the template.


## Documentation contract

This project includes `docs/agile`, `docs/devops`, and `docs/engineering`.

When you ship work:

- follow `docs/agile/DEFINITION_OF_DONE.md`
- update backlog/sprint/stories for user-visible features
- update devops docs when run/deploy/config assumptions change
- write/update tests per `docs/engineering/TESTING_STRATEGY.md`
- keep architecture notes / ADRs current for meaningful decisions


## Archetype

- Active: `portfolio`
- Overlay path: `archetype/` (feature slots + IA)
- **Canvas applied** into the demo UI where supported (React/HTML/Expo/Electron) — your archetype choice should look different on day one.
- Merge slots into your template feature folder; keep demo disposable.
