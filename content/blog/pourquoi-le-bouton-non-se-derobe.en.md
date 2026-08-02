---
title: "Why our “No” button dodges away"
excerpt: "A visual joke, yes. But also a deliberate interface decision, and here's the reasoning behind it."
date: "2026-07-30"
author: "The team"
---

On the decision screen, two buttons. "Yes" stays put. "No" flees the moment
you approach it, changes position, flashes "Try again," and eventually
settles somewhere out of reach.

It's a gag. But it took more thought than it looks like it did.

## What the button doesn't do

Here's the important part, and it's a technical one: **this button has no way
to refuse.** It isn't "disabled after a few clicks." There is simply no code
capable of recording a negative answer.

That's a difference in kind, not degree. A disabled button can be
re-enabled, bypassed, triggered from the keyboard. A button wired to nothing
can't trigger anything, no matter what you try.

## Why no "No" at all?

Because a screen with a single button isn't a question, it's a summons. The
presence of "No" creates the moment of hesitation that makes "Yes" mean
something.

And because someone who genuinely wants to refuse doesn't need a button.
They have a phone, and an ongoing conversation. A refusal is said out loud;
it isn't clicked.

## The detail that matters

After three or four attempts, the button stops reacting and keeps drifting
on its own. The exact number is randomised on every page load, so the
effect never becomes mechanical.

That last touch is deliberate. A button that stops dead looks broken. A
button that keeps floating, just out of reach, looks like it's gently
teasing you. The line between the two is thin, but it's the whole
difference between a bug and a joke.

## The constraint we set ourselves

All of this stays bounded. The button never leaves the visible frame, never
covers "Yes," and respects the system's reduced-motion preference. A joke
that breaks the page stops being a joke.
