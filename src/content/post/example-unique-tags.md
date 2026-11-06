---
title: "Unique tags validation"
description: "This post is used for validating if duplicate tags are removed, regardless of the string case"
publishDate: "2023-01-14"
updatedDate: "2023-01-14"
tags: ["example"]
draft: true
---

## This post is to test zod transform

If you open the file `src/content/post/unique-tags.md`, the tags array has a number of duplicate blog strings of various cases.

These are removed as part of the removeDupsAndLowercase function found in `src/content/config.ts`.
