---
layout: _post
title: Completely Understanding File Systems: A Complete Guide to the Four Great Storage Schemes
date: 2025-10-29 11:10:50
tags: [Chapter 5, Wild AI Philosopher]
categories: [Operating System]
description: The most profound technical principles are often hidden in the simplest life experiences: from the "orderly beauty" of contiguous files to the "flexible fun" of linked files. This article reveals the underlying logic of how humanity organizes information between order and freedom through the metaphor of a treasure address book, making file systems no longer just cold textbook definitions.
---


# Completely Understanding File Systems: A Complete Guide to the Four Great Storage Schemes

> When learning about file systems, I was once dizzy with concepts like contiguous, linked, and indexed. It wasn't until I used the metaphor of treasure hunting that everything became clear. This article shares my study notes to help you master these core concepts in an interesting way.

## Why Write This Article?

When studying operating systems, I often fell into confusion:
- Why does "length" have different meanings in different file structures?
- What exactly is an index table block number?
- Why does `K = N²` require `N+1` index blocks?
- What are the differences between these schemes?

It wasn't until I imagined them as different treasure storage schemes that everything clicked. Below are my "treasure hunting notes."

## Scheme One: Contiguous Storage - **The Complete Treasure Map**

### 🗺️ Treasure Metaphor
Imagine you have an ancient parchment with a complete treasure route drawn on it:

**"Starting from the river mouth, walk 5 consecutive steps along the riverbank, with one treasure buried at each step"**
```
📍River mouth (starting point) → 1 step → 2 steps → 3 steps → 4 steps → 5 steps
```

All treasures are in a straight line, buried consecutively.

### 🔍 Treasure Hunting Process
**To find the 3rd treasure:**
1. Check the treasure map: "Starting from the river mouth"
2. Count 3 steps directly: River mouth → 1 step → 2 steps → **3rd step reached!**
3. Dig up the treasure

### 📝 Technical Essence
- **Directory entry**: Starting block = 100, **length = 5**
- **Physical storage**: Blocks `[100, 101, 102, 103, 104]`
- **Access calculation**: 100 + offset = target block

### ⚖️ Pros and Cons Analysis
**✅ Advantages:**
- Extremely fast treasure hunting: knowing the starting point allows direct access to any treasure
- Highest efficiency for sequential treasure hunting: just walk along one path

**❌ Disadvantages:**
- Requires a large contiguous empty space
- Difficult to expand treasures: want to add a 6th treasure? If the following location is occupied, all treasures must be moved

**💡 Key Insight**: Here, "length" refers to the **number of physically contiguous blocks**.

---

## Scheme Two: Linked Storage - **Treasure Hunt Game**

### 🗺️ Treasure Metaphor
Like a treasure hunt game, each treasure spot only tells you where the next one is:

**Starting at location 5**, each spot has a note pointing to the next:
```
5 → 8 → 13 → 9 → 12 (end)
```

Treasure locations are scattered, connected only by notes.

### 🔍 Treasure Hunting Process
**To find the 3rd treasure:**
1. Start at location 5
2. Note at 5 says: "Go to 8"
3. Note at 8 says: "Go to 13" 
4. **Reached 13!** This is the 3rd treasure
5. Dig up the treasure

### 📝 Technical Essence
- **Directory entry**: Starting block = 5, **length = 5**
- **Physical storage**: Each block stores a pointer to the next block at its end
- **Access method**: Must traverse from the beginning

### ⚖️ Pros and Cons Analysis
**✅ Advantages:**
- Flexible: treasures can be buried in any free location
- Easy to expand: find an empty spot for a new treasure, modify the last note

**❌ Disadvantages:**
- Random treasure hunting is slow: finding the 10th treasure requires visiting 10 spots
- Notes take up space: each treasure spot must reserve space for a note

**💡 Key Insight**: Here, "length" refers to the **total number of logical blocks**, independent of physical location.

---

## Scheme Three: Indexed Storage - **Treasure Address Book**

### 🗺️ Treasure Metaphor
You have a treasure address book that centrally records all treasure locations:

**The address book is stored in safe #24**, containing:
```
1st treasure: Location 5
2nd treasure: Location 8
3rd treasure: Location 13
4th treasure: Location 9  
5th treasure: Location 12
```

### 🔍 Treasure Hunting Process
**To find the 3rd treasure:**
1. Find safe #24 (the address book)
2. Check line 3: "Location 13"
3. **Go directly to location 13**
4. Dig up the treasure

### 📝 Technical Essence
- **Directory entry**: **Index block number = 24**, length = 5
- **Physical storage**: Data blocks scattered at `[5, 8, 13, 9, 12]`
- **Access method**: Check the index first, then locate directly

### ⚖️ Pros and Cons Analysis
**✅ Advantages:**
- Fast random treasure hunting: just check the address directly
- No external fragmentation: treasures can be buried anywhere

**❌ Disadvantages:**
- Requires extra space: the address book itself takes up space
- Wasteful for small files: if there are only 2 treasures, most of the address book is blank

**💡 Key Insight**: Here, "length" refers to the **number of entries in the index table**.

---

## Scheme Four: Indexed Sequential Storage - **Zoned Treasure Map**

### 🗺️ Treasure Metaphor
Divide the country into several large zones, with treasures buried contiguously within each zone, then establish a master index:

**General Headquarters (Safe #50):**
```
Zone 1: Starting from river mouth, 5 consecutive treasures
Zone 2: Starting from west mountain, 5 consecutive treasures  
Zone 3: Starting from north plain, 5 consecutive treasures
```

**Actual treasure distribution:**
- Zone 1: `River mouth 100 → 101 → 102 → 103 → 104`
- Zone 2: `West mountain 200 → 201 → 202 → 203 → 204`
- Zone 3: `North plain 300 → 301 → 302 → 303 → 304`

### 🔍 Treasure Hunting Process
**To find the 8th treasure:**
1. Check General Headquarters: The 8th is in **Zone 2** (treasures 6-10)
2. Zone 2 starts at **West mountain #200**
3. Calculate within zone: 200 + 2 = **#202**
4. Go directly to #202 and dig

### 📝 Technical Essence
- **Directory entry**: Index block number = 50, total length = 15
- **Physical storage**: Contiguous storage within zones
- **Access method**: Locate the zone first, then calculate within zone

### ⚖️ Pros and Cons Analysis
**✅ Advantages:**
- Extremely fast treasure hunting within zones (contiguous advantage)
- Relatively fast random access (index advantage)
- Very concise master index

**❌ Disadvantages:**
- Possible space waste within zones
- Slightly more complex management

**💡 Key Insight**: This is the **perfect combination of sequential and indexed**.

---

## Completely Clarifying Those Confusing Concepts

### Confusion One: **What Exactly Does "Length" Mean?**

This is the biggest point of confusion! The meaning of "length" is completely different in the four structures:

| Structure | Meaning of "Length" | Example Explanation |
|-----------|--------------------|--------------------|
| **Contiguous** | **Number of physically contiguous blocks** | "3 contiguous blocks starting from 100" = blocks 100, 101, 102 |
| **Linked** | **Total number of logical blocks** | "5 blocks total" = 5 nodes in the chain |
| **Indexed** | **Number of index entries** | "3 rows in address book" = manages 3 data blocks |
| **Indexed Sequential** | **Total number of data blocks** | "15 treasures" = sum of treasures in all zones |

### Confusion Two: **For Multi-level Index, `K = N²` Requires `N+1` Index Blocks**

#### 🏰 National Treasure Metaphor
- **Setting**: One parchment can only write 5 addresses (N=5)
- **Goal**: Manage 25 treasures (K=25=5²)

#### Solution: Hierarchical Management
```
King (Top-level index block)
  │
  ├─→ Governor A → Manages treasures 1-5
  ├─→ Governor B → Manages treasures 6-10
  ├─→ Governor C → Manages treasures 11-15
  ├─→ Governor D → Manages treasures 16-20
  └─→ Governor E → Manages treasures 21-25
```

**Index block count**:
- Governors: 5 (second-level index blocks)
- King: 1 (top-level index block)
- Total: **5 + 1 = 6 index blocks (N+1)**

#### 💡 Important Reminder
This discusses the **theoretical maximum for a single very large file**. In reality, most files are small, and one index block is sufficient.

---

## Performance Comparison: Treasure Hunting Efficiency Showdown

### Steps to Access the Nth Treasure:

**Contiguous file**: 1 access
```
Calculate position → Dig directly
```

**Linked file**: N accesses
```
Start → 2nd point → 3rd point → ... → Nth point
```

**Indexed file**: 2 accesses
```
Read address book → Dig directly
```

**Indexed sequential file**: 2 accesses + simple calculation
```
Read master index → Calculate position → Dig directly
```

### 📊 Comprehensive Comparison Table

| Feature | Contiguous | Linked | Indexed | Indexed Sequential |
|---------|-----------|--------|---------|--------------------|
| **Metaphor** | Complete treasure map | Treasure hunt game | Treasure address book | Zoned treasure map |
| **Random access** | ⭐⭐⭐⭐⭐ | ⭐☆☆☆☆ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐☆ |
| **Sequential access** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐☆☆ | ⭐⭐⭐⭐☆ | ⭐⭐⭐⭐⭐ |
| **Space utilization** | ⭐☆☆☆☆ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐☆☆ | ⭐⭐⭐⭐☆ |
| **Scalability** | ⭐☆☆☆☆ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐☆☆ |
| **Management complexity** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐☆☆ | ⭐⭐☆☆☆ |

---

## Practical Application Scenarios

### How to Choose the Right Scheme?

| Use Case | Recommended Scheme | Reason |
|----------|-------------------|--------|
| Read-only large files (videos, backups) | **Contiguous file** | Extreme sequential read/write performance |
| Log files with frequent additions/deletions | **Linked file** | Flexible expansion, high space utilization |
| Databases requiring fast random access | **Indexed file** | Best random access performance |
| File system directories, medium-sized files | **Indexed sequential file** | Balances sequential and random access |

### Real-world examples:
- **FAT file system**: Uses linked allocation
- **Unix/Linux ext family**: Uses indexed allocation (multi-level indexing)
- **Some database systems**: Use indexed sequential allocation
- **Optical disc file systems**: Use contiguous allocation

---

## Design Philosophy and Summary

I recall the days of hiding pocket money as a child.

At first, I neatly stacked my saved coins in a tin box, layer upon layer — that was the prototype of contiguous files, orderly and safe, but if I wanted to retrieve savings from a particular day in the middle, I had to disturb the entire treasure. Later, afraid my parents would find them, I began hiding them in separate spots: between dictionary pages, in pillowcases, in the pockets of old stuffed animals — each hiding spot quietly noting the location of the next — wasn't this a vivid portrayal of linked files? Then one rainy day, I lay by the window and drew a "treasure map" with all the locations and amounts clearly visible. That crumpled little piece of paper became my first savings index table. Looking back, I had unknowingly previewed the knowledge of this lesson.

The most profound technical principles are often hidden in the simplest life experiences. The orderly beauty of contiguous files, the flexible fun of linked files, the convenient control of indexed files — they are not just cold technical solutions, but fundamental ways humanity organizes information and understands the world. Just as we instinctively knew as children that different "treasures" required different storage methods, today, when faced with massive amounts of data, we repeat the same thought: how to find the perfect balance between certainty and uncertainty, order and freedom.

Perhaps the best technology is like this — it never invents completely new logic, but only finds more precise expressions for the life wisdom we already know well.

## The Final Treasure Map

Remember this treasure hunting decision chart:

```
Need extreme sequential performance?
    → Choose [Contiguous file] (Complete treasure map)

Need frequent addition/deletion/modification?
    → Choose [Linked file] (Treasure hunt game)
    
Need fast random access?
    → Choose [Indexed file] (Treasure address book)
    
Want to balance sequential and random access?
    → Choose [Indexed sequential file] (Zoned treasure map)
```

I hope this "treasure hunting guide" helps you, as it helped me, to fully understand the core concepts of file systems in an interesting way. If you have similar confusions or insights, feel free to share them in the comments!

---

*This article is organized based on personal learning experience, using metaphors to explain complex concepts. If there are any technical inaccuracies, corrections are welcome.*