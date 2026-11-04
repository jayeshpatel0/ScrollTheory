
/* =========================================
   SCROLLTHEORY
   MAGAZINE & BOOK LIBRARY DATA
========================================= */

// MAGAZINES
export const magazines = [
  {
    id: "mag-001",
    slug: "attention-in-a-noisy-world",
    title: "Attention in a Noisy World",
    subtitle: "Reclaim your time. Rediscover your focus.",
    category: "Mind & Culture",
    issue: "Issue 01",
    author: "ScrollTheory Editorial",
    readTime: "25 min",
    releaseDate: "2026-11-20",
    status: "upcoming",
    cover: "",
    excerpt:
      "A thoughtful collection exploring focus, habits, creativity, and the way we spend our attention.",

    editorNote:
      "Our attention is one of the most valuable things we own. This issue explores how we can protect it and use it with intention.",

    contents: [
      {
        title: "The Attention We Give",
        type: "Editor's Letter",
        readTime: "3 min",
      },
      {
        title: "Why We Can't Stop Scrolling",
        type: "Essay",
        readTime: "6 min",
      },
      {
        title: "The Case for Doing One Thing",
        type: "Essay",
        readTime: "5 min",
      },
      {
        title: "A Room for Boredom",
        type: "Reflection",
        readTime: "4 min",
      },
      {
        title: "Rituals for Creative Focus",
        type: "Guide",
        readTime: "4 min",
      },
      {
        title: "A Small Guide to Digital Boundaries",
        type: "Practical Guide",
        readTime: "3 min",
      },
    ],

    reflectionQuestions: [
      "What takes most of your attention every day?",
      "Which digital habit would you like to change?",
      "What deserves more of your time?",
    ],

    featured: true,
  },

  {
    id: "mag-002",
    slug: "small-things-better-days",
    title: "Small Things, Better Days",
    subtitle: "Finding meaning in ordinary moments.",
    category: "Lifestyle",
    issue: "Issue 02",
    author: "ScrollTheory Editorial",
    readTime: "30 min",
    releaseDate: "2026-12-20",
    status: "upcoming",
    cover: "",
    excerpt:
      "Essays about daily rituals, home, rest, and the quiet art of noticing.",

    editorNote:
      "A collection about the little things that make an ordinary day meaningful.",

    contents: [
      {
        title: "A Slower Morning",
        type: "Essay",
        readTime: "5 min",
      },
      {
        title: "The Comfort of Familiar Places",
        type: "Essay",
        readTime: "5 min",
      },
      {
        title: "Make Room for Rest",
        type: "Guide",
        readTime: "4 min",
      },
      {
        title: "Noticing the Neighborhood",
        type: "Essay",
        readTime: "5 min",
      },
      {
        title: "Objects We Keep",
        type: "Story",
        readTime: "6 min",
      },
      {
        title: "A Week of Tiny Rituals",
        type: "Practical Guide",
        readTime: "5 min",
      },
    ],

    reflectionQuestions: [
      "Which ordinary moment makes you happy?",
      "What is one ritual you want to start?",
    ],

    featured: false,
  },
];

// BOOKS
export const books = [
  {
    id: "book-001",
    slug: "field-guide-attention",
    title: "A Field Guide to Your Attention",
    subtitle: "A practical journey toward intentional living.",
    category: "Mind & Culture",
    volume: "Volume 01",
    author: "ScrollTheory Editorial",
    readTime: "55 min",
    releaseDate: "2026-11-25",
    status: "upcoming",
    cover: "",
    excerpt:
      "A short book about distraction, focus, daily rituals, and learning to give your attention with intention.",

    description:
      "An original short-book project designed for calm, thoughtful reading. Explore attention one chapter at a time.",

    chapters: [
      {
        id: "chapter-01",
        slug: "where-attention-goes",
        title: "Where Attention Goes",
        readTime: "8 min",
        content: `Your attention shapes the texture of your days.

Every conversation, every page, every quiet moment asks for a little of it.

Before changing your habits, begin by noticing where your attention already goes.

For one day, observe your routines without judging them.

What do you reach for when you have a spare minute?

Which activities leave you feeling present?

Which ones leave you feeling scattered?

Awareness is not the finish line. It is a useful place to begin.`,
      },

      {
        id: "chapter-02",
        slug: "architecture-of-distraction",
        title: "The Architecture of Distraction",
        readTime: "9 min",
        content: `Distraction is not always a personal failure.

Our environments influence what we notice, what we remember, and what we do next.

Notifications, open tabs, background noise, and unfinished tasks can compete for attention.

Start with one small change.

Put your phone out of reach during a reading session.

Close tabs you do not need.

Make the next step of your task easy to see.

A calmer environment cannot remove every distraction, but it can make focus easier to practice.`,
      },

      {
        id: "chapter-03",
        slug: "make-a-little-space",
        title: "Make a Little Space",
        readTime: "8 min",
        content: `Space does not need to be an empty afternoon.

It can be ten quiet minutes.

Choose a small window in your day and give it a purpose.

Read a few pages.

Take a short walk.

Sit without opening another screen.

The goal is not to become perfectly focused.

The goal is to create a moment in which your attention can settle.`,
      },

      {
        id: "chapter-04",
        slug: "build-your-focus-ritual",
        title: "Build Your Focus Ritual",
        readTime: "10 min",
        content: `A useful ritual begins with a clear signal.

Choose a place, a time, or a simple action that tells you it is time to begin.

You might make tea, open a book, or write one sentence about what matters next.

Start with a manageable session.

Keep the goal small enough to repeat.

Over time, consistency can become more useful than intensity.`,
      },

      {
        id: "chapter-05",
        slug: "return-without-guilt",
        title: "Return Without Guilt",
        readTime: "8 min",
        content: `Your attention will wander.

You will lose your place, forget your intention, and sometimes choose distraction.

That is part of being human.

When you notice that you have drifted, return gently.

Read the sentence again.

Take one breath.

Choose the next useful action.

Focus is not never leaving.

Sometimes focus is simply learning how to return.`,
      },

      {
        id: "chapter-06",
        slug: "notes-and-reflection",
        title: "Notes & Reflection",
        readTime: "7 min",
        content: `Take a moment to reflect.

1. What deserves more of your attention?

2. What repeatedly interrupts your day?

3. Which small boundary could help you?

4. What is one habit you want to practice this week?

Write your answers somewhere you can revisit.

A thoughtful change does not need to happen all at once.`,
      },
    ],

    featured: true,
  },

  {
    id: "book-002",
    slug: "gentle-art-beginning-again",
    title: "The Gentle Art of Beginning Again",
    subtitle: "Small steps, fresh perspectives.",
    category: "Lifestyle",
    volume: "Volume 02",
    author: "ScrollTheory Editorial",
    readTime: "48 min",
    releaseDate: "2027-01-15",
    status: "upcoming",
    cover: "",
    excerpt:
      "A reflective short-book project about change, resilience, and everyday fresh starts.",

    description:
      "A planned collection of reflections, practical ideas, and journal prompts about beginning again.",

    chapters: [
      {
        id: "chapter-01",
        slug: "first-small-step",
        title: "The First Small Step",
        readTime: "8 min",
        content: `Every new beginning can start smaller than we imagine.

You do not need a complete plan to take one thoughtful step.

Begin with what is possible today.

Choose one action that moves you in a helpful direction.

Then give yourself permission to continue gradually.`,
      },
      {
        id: "chapter-02",
        slug: "letting-old-plans-rest",
        title: "Letting Old Plans Rest",
        readTime: "8 min",
        content: `Some plans belong to an earlier version of our lives.

Revisiting them can teach us something.

Keeping every old plan is not the only way to respect the person who made it.

Sometimes the thoughtful choice is to let a plan rest and make room for a new direction.`,
      },
      {
        id: "chapter-03",
        slug: "practice-over-perfection",
        title: "Practice Over Perfection",
        readTime: "8 min",
        content: `A practice gives you another opportunity to begin.

Perfection asks for a flawless result.

Practice asks you to return.

Choose progress you can repeat, and let imperfect attempts become part of learning.`,
      },
      {
        id: "chapter-04",
        slug: "new-daily-rhythm",
        title: "A New Daily Rhythm",
        readTime: "8 min",
        content: `Small routines can create useful structure.

Choose one moment in your day to make a little more intentional.

Keep it simple.

Notice what helps, and adjust when your circumstances change.`,
      },
      {
        id: "chapter-05",
        slug: "when-you-begin-again",
        title: "When You Begin Again",
        readTime: "8 min",
        content: `Beginning again is not proof that everything before it failed.

It may simply mean that life has changed.

Carry forward what you learned.

Release what no longer serves your next step.

Then begin where you are.`,
      },
      {
        id: "chapter-06",
        slug: "journal-prompts",
        title: "Journal Prompts",
        readTime: "8 min",
        content: `Reflect on these questions.

What would you like to begin?

What lesson do you want to carry forward?

Which expectation could you release?

What small step can you take today?`,
      },
    ],

    featured: false,
  },
];

// UPCOMING CONTENT
export const upcomingContent = [
  ...magazines.filter(
    (item) => item.status === "upcoming"
  ),

  ...books.filter(
    (item) => item.status === "upcoming"
  ),
];

// FIND MAGAZINE BY SLUG
export function getMagazineBySlug(slug) {
  return magazines.find(
    (magazine) => magazine.slug === slug
  );
}

// FIND BOOK BY SLUG
export function getBookBySlug(slug) {
  return books.find(
    (book) => book.slug === slug
  );
}

// FIND BOOK CHAPTER
export function getBookChapter(slug, chapterSlug) {
  const book = getBookBySlug(slug);

  if (!book) return null;

  return book.chapters.find(
    (chapter) => chapter.slug === chapterSlug
  );
}
