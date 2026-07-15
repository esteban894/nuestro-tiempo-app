---
name: domain-model
description: Business/domain model of Nuestro Tiempo — the User, Couple, CoupleInvite, Album, AlbumMember and Image entities, their relationships and rules (invite codes, private albums, cascade deletes). Load when working on domain/business logic, adding or changing API endpoints, or reasoning about the contract with the sibling nuestro-tiempo-api. Not needed for pure UI/styling, config, or build work.
---

# Domain model

- **User** — starts with no Couple. Becomes part of one by either creating a `CoupleInvite` (from the account page) or entering another user's invite code.
- **Couple** — made up of exactly 2 users. Formed when one user creates a `CoupleInvite`, which generates an 8-character hexadecimal code; a second user joins the Couple by entering that code.
- **Album** — belongs to a creator (`User`). Has no direct relation to a `Couple`, but a user must belong to a Couple to create one.
  - Can be marked `private` at creation. A private album is visible only to its creator, not to the creator's partner.
  - The creator can toggle an album's private state at any time.
  - Related to `AlbumMember`s — the creator and their Couple partner.
- **Image** — belongs to an `Album`. Deleted in cascade when its Album is deleted.

When adding or changing endpoints, check the sibling `nuestro-tiempo-api` README/entities for the contract before inventing one.
