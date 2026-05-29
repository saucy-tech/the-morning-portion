# Social Media Workflow

This process prepares The Morning Portion Facebook and X posts for a Monday-Friday devotion week.

## Accounts

- Facebook: `https://www.facebook.com/profile.php?id=61590492474939`
- X: `https://x.com/TMP_Devotion`

Use Helium when browser authentication is needed. The accounts are usually open in Helium under the `Brandon-Personal` profile.

## Timing

Schedule posts in `America/New_York`.

- Facebook: 6:05 AM
- X: 6:10 AM

Keep the times close to the daily email rhythm and early enough for readers who want Scripture before the day gets loud.

## Copy Pattern

Match the existing account voice:

- Short opening line or two from the devotion's core idea.
- One blank line between thoughts.
- No hype language.
- Minimal hashtags. Use none unless there is a strong reason.
- End with the Morning Portion link.
- Use `Read or listen:` on Facebook when space allows.
- Use `Today's Morning Portion:` on both platforms when it fits.

Example:

```text
Jesus had given His disciples a message for all nations. Then He told them to wait.

Some work cannot begin until God gives power from on high.

Today's Morning Portion: Stay Until the Promise Comes
Read or listen: https://morningportion.com/posts/2026-06-01-stay-until-the-promise-comes
```

X should stay under 280 characters including the URL.

## Image Pattern

Generate one content-specific image per devotion, then export platform crops:

- Facebook: `1200x630`
- X: `1600x900`

Keep a consistent visual family across the week:

- Warm morning editorial still life.
- Open Bible as the anchor.
- Dawn window light.
- Natural wood, coffee, lamp, letters, table, room, path, or shared cups as content symbols.
- No people, hands, depiction of Jesus, readable generated scripture text, watermarks, or platform logos.
- Leave darker negative space on the left for title overlay.

Daily symbol examples:

- Waiting: empty chair, unlit lamp, untouched cup.
- Continued work: letter pages, pen, envelope.
- Witness: lit lantern, map or path.
- Obedience: sandals, doorway, visible path.
- One accord: multiple cups around one Bible.

Overlay each image with:

- `THE MORNING PORTION`
- Series title
- Devotion title
- Scripture reference
- Day and date
- `morningportion.com`

## Local Prep Output

Use an ignored local folder for upload-ready files:

```text
.superpowers/social-prep/YYYY-MM-DD/
  images/
  generated-sources/
  schedule.csv
  social-posts.md
  social-posts.json
```

The `.superpowers/` folder is ignored and should not be committed. Commit this workflow doc separately from devotion PRs.

## Scheduling Notes

Before scheduling, confirm each devotion PR has merged or will merge before its scheduled date. Future-dated posts are hidden in production until their date, so uploaded images carry the visual context even if a platform cannot fetch a link preview during scheduling.

When using the live social UIs:

1. Upload the platform-specific image.
2. Paste the prepared copy.
3. Set the scheduled date and time.
4. Review the visible preview.
5. Confirm the final schedule action.

The final schedule click creates public future posts, so it should be treated as a deliberate publishing action.
