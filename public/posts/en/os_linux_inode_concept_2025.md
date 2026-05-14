---
title: Finally Understanding inode: A Story About Warehouses, Keys, and Lockers
date: 2025-12-09 12:09:13
layout: book
categories: Operating System

---

To be honest, when I first learned about the Linux file system, inodes completely confused me.

"Why do files need inodes? Direct, single indirect, double indirect, triple indirect? What are these things? Why can't we just put the data all together?"

What do you do when you encounter something you don't understand?! In my world, as long as you find the right angle to understand things, there's no knowledge you can't grasp!

I thought hard about what in life could be used as a reference to make this concrete. When I used the "warehouse storage system" as an analogy, the concept of inodes suddenly became clear in my mind!!!

Today, I'll use a warehouse manager's story to explain and help you understand the inode as I understand it.

## 🧰 **One File = One "Warehouse Location Card" (inode)**

Whenever a user puts in a new file, like `homework.doc`,
I don't directly hand it over to a fixed box.

I create a "warehouse location card" for it.

This card (inode) records:

* Who owns the file
* What the permissions are
* How large the file is
* And most importantly: **which boxes (blocks) in the warehouse its contents are placed in**

Here's what such a card looks like (simplified):

```text
inode #213
--------------------------------
File type: Regular file
Size: 12.5KB
Direct pointers: [45][88][92]...
Indirect pointers: ...
```

**Note: The filename is not written on the inode!** (It's written in the directory entry, like a "shelf label," not the manager's card.)

What I primarily manage is this part of the card:

```text
i_block[15]
```

These are 15 "index pointers" pointing to the stored content.

OK, so what are these 15 pointers? How are they used? Let's get into it!

## 🔑 **The First 12 Pointers: The "Regular Keys" I Carry**

As the warehouse manager, I have 12 keys hanging at my waist.

Each key can open one box containing file content.

This is **direct indexing (0–11)**.

For example, for the first 12 pages of a novel, I would:

> Page 0 → Box 45
> Page 1 → Box 88
> ……
> Page 11 → Box 92

Very simple, lightning fast.

But files are often not that small.

Some novels have hundreds of pages, and some videos have astonishing amounts of data.

Should I just keep adding more keys? That's impossible — too many keys would make my eyes blurry and I'd collapse from exhaustion.

So I have a clever system.

## 🗄️ 🔑 **The 13th Pointer: The "Key Cabinet" (Single Indirect)**

When a file exceeds 12 boxes, I stop hanging more keys.

I use the 13th pointer — it doesn't point to content.

It points to a **"key cabinet" box**.

Inside this box is a **"key list"** :

* One key per line
* Each key points to one data box

If one box can hold **b/4 keys (pointers)** ,
then one "key cabinet" can manage **b/4 boxes** — far more powerful than a single key.

## 🏢 🔑🔑 **The 14th Pointer: "Multi-level Key Cabinet" (Double Indirect)**

What if the novel keeps getting thicker?

No problem — I also have:

**The double indirect pointer (item 14)**

It doesn't point to a key cabinet.

Instead, it points to:

> A "super key cabinet" that holds the addresses of key cabinets

Each level-1 cabinet can open b/4 boxes.
So the level-2 pointer can open:

```txt
(b/4) × (b/4) = (b/4)² boxes
```

No matter how large the file gets, it can handle it.

## 🏭🔑🔑🔑 **The 15th Pointer: "Key Universe" (Triple Indirect)**

When files reach the scale of movies, game packages, etc.,

There's only one final move:

**The triple indirect pointer**

It manages:

Level-1 cabinet → Level-2 cabinet → Level-3 cabinet → Data boxes

The number of boxes it can find is:

```text
(b/4)³
```

This is basically a universe-scale addressable range.

## 🧮 **So how many boxes can I ultimately manage? (Must memorize for exams)**

```text
12 (direct) 
+ (b/4) (single indirect) 
+ (b/4)² (double indirect) 
+ (b/4)³ (triple indirect)
```

## 📢 **Warehouse Manager's Summary: The Design Philosophy of inode**

The warehouse manager's goal is to make it:

* Super fast for small files (using direct keys)
* Scalable for large files too (single, double, triple indirect)
* Space-saving yet flexible
* Fast to search without wasting storage

This is one of the most classic designs of ext2 (and subsequent file systems).

## 📘 **So you must be wondering: why not just make it fully indirect from the start?**

**Because 90% of files are very small**
Using multiple levels of cabinets would only waste storage and reduce performance

And inode does exactly this:

> Small files use small mechanisms
> Large files use large mechanisms
> Economical and efficient

## 🎯 From today, you can understand inode like this:

> "The inode is the warehouse manager,
> the 15 pointers are his key system for managing boxes,
> expanding level by level to form a warehouse map that can contain enormous files."

If you can memorize this sentence, you're basically solid for the exam. >.<

That's a wrap!! Wohoo