---
title: Deep Understanding of Linux Memory Management: From Process Address Space to Physical Page Frames
date: 2025-09-29 08:19:31
tags: [Chapter 8]
categories: [Operating System]
description: Who would have thought that memory management in computers is even more meticulous than audit work: every physical page has its own "ID card," and even how many people are "borrowing" it must be clearly recorded. Whether you're preparing for an exam or want to elegantly show off with the "buddy system" in an interview, this metaphor-rich guide will help you achieve instant enlightenment.
---

# **Deep Understanding of Linux Memory Management: From Process Address Space to Physical Page Frames**

This article will take you deep into the Linux kernel, revealing what the operating system does behind the scenes when you make a `malloc` call. We will follow the path below to complete the entire journey of memory management:

1.  **Macroscopic Planning (Process Perspective)**: `mm_struct` - The Process's "Memory Headquarters"
2.  **Fine-grained Partitioning (Process Perspective)**: `vm_area_struct` - The "Land Plot Map" of Virtual Memory Areas
3.  **Physical Allocation (System Perspective)**: `struct zone` - The "Warehouse Partitioning" of Physical Memory
4.  **Smallest Unit (System Perspective)**: `struct page` - The "ID Card" of Physical Page Frames

### **Chapter 1: The Process's "Memory Headquarters" - `struct mm_struct`**

Imagine that each process has its own independent 4GB (on 32-bit systems) virtual address space. `mm_struct` is the **general command center** for this vast address space.

```c
struct mm_struct {
    struct vm_area_struct *mmap;       // Linked list: for traversing all regions
    struct rb_root mm_rb;              // Red-black tree: for quickly finding the region containing an address
    pgd_t *pgd;                        // Page table root directory: the "map" for address translation
    atomic_t mm_users;                 // Number of threads sharing this address space
    atomic_t mm_count;                 // Reference count, the structure is freed when it reaches 0
    struct list_head mmlist;           // Global linked list linking all process mm_structs
    unsigned long start_code, end_code; // Start and end addresses of the code segment
    // ... other fields such as heap and stack boundaries
};
```

#### **Core Field Explanations:**

*   **`pgd_t *pgd` (Exam Focus!)** :
    *   This is the **root pointer of the process's page table**. When the CPU schedules this process, it loads this `pgd` into the CR3 control register, thereby switching the address space. This is the hardware foundation for process isolation.
*   **`mmap` and `mm_rb` (Design Philosophy and Efficiency Balance)** :
    *   **Question**: How to quickly determine which memory region of a process an address (e.g., `0x40001000`) belongs to?
    *   **Answer**: Use two data structures working together.
        *   `mmap`: A **linked list**. When traversing all memory regions (e.g., for a memory dump of the entire process), a linked list is efficient.
        *   `mm_rb`: A **red-black tree**. When needing to quickly find the VMA to which an address belongs based on that address (e.g., during a page fault), the red-black tree's O(logN) complexity is far superior to the linked list's O(N).
*   **`mm_users` vs. `mm_count` (Easily Confused Exam Points!)** :
    *   `mm_users`: The number of **users** of this address space (typically the number of threads). When `fork` creates a thread, this value increases.
    *   `mm_count`: The **main reference count** of the `mm_struct` itself. It counts objects including user threads, kernel temporary references, etc. When `mm_count` drops to 0, the kernel will destroy this `mm_struct`.
    *   **Simple analogy**: `mm_users` is like the number of tenants renting an apartment, while `mm_count` is the "lifespan" of the apartment itself. Only when there are no tenants and the apartment itself is no longer needed will the apartment be demolished.

#### **Lifecycle of `mm_struct`:**

*   **Creation**: Created for a new process during the `fork` system call.
*   **Usage**: Every memory access (read/write/execute) by the process indirectly queries the page table through it.
*   **Destruction**: When all threads of the process have exited and kernel references are also released (`mm_count = 0`), it is destroyed.

---

### **Chapter 2: The Virtual Memory "Land Plot Map" - `struct vm_area_struct`**

A process's address space is not a single block but is divided into multiple **contiguous regions with the same access permissions (read, write, execute)**. Each such region is a `vm_area_struct`.

```c
struct vm_area_struct {
    struct mm_struct *vm_mm;           // Pointer to the owning "headquarters"
    unsigned long vm_start;            // Region start address (inclusive)
    unsigned long vm_end;              // Region end address (exclusive)
    struct vm_area_struct *vm_next;    // Next VMA in the linked list
    struct rb_node vm_rb;              // Red-black tree node
    struct file *vm_file;              // If a file mapping, points to the file object
    // ... permission flags, operation sets, etc.
};
```

#### **Core Field Explanations:**

*   **`vm_start` and `vm_end`**: Define a virtual address interval of `[vm_start, vm_end)`.
*   **`vm_file` (Important Concept!)** :
    *   **NULL**: Indicates this is an **anonymous mapping**. For example, the process's **heap**, **stack**, and anonymous shared memory.
    *   **Non-NULL**: Indicates this is a **file mapping**. For example, loading a dynamic library (like `libc.so`) into memory, or mapping a file into the process address space via the `mmap` system call.

#### **VMA Layout of a Typical Process:**

```
VMA1: 0x00400000-0x00401000 (Code segment, r-x, file mapping: /bin/myapp)
VMA2: 0x00600000-0x00601000 (Data segment, rw-, file mapping: /bin/myapp)
VMA3: 0x00601000-0x00622000 (Heap,      rw-, anonymous mapping) [grows via brk/sbrk]
VMA4: 0x7ffe0000-0x7ffe3000 (Stack,     rw-, anonymous mapping)
VMA5: 0x7fxxxxxx-0x7fxxxxxx (libc library, r-x, file mapping: /lib/x86_64-linux-gnu/libc.so.6)
```

**Relationship between `mm_struct` and `vm_area_struct` (Guaranteed Exam Question!)** :
`task_struct` (process) -> `mm_struct` (memory headquarters) -> `mmap` linked list/`mm_rb` tree -> multiple `vm_area_struct`s (memory plots).

---

### **Chapter 3: The Physical Memory "Warehouse Partitioning" - `struct zone`**

Above we discussed the process's perspective of **virtual memory**. Now we turn our attention to the **physical memory** managed by the operating system. Due to hardware limitations, physical memory is divided into different **Zones**.

```c
struct zone {
    unsigned long free_pages;           // Total number of free pages in this zone
    struct per_cpu_pageset pageset[NR_CPUS]; // Per-CPU page cache, optimizes single page allocation
    struct free_area free_area[MAX_ORDER]; // Core of the buddy system! 11 free lists
    struct list_head active_list;       // Active pages linked list
    struct list_head inactive_list;     // Inactive pages linked list
    struct page *zone_mem_map;          // Points to the first page structure of this zone
    // ... watermarks, statistics, etc.
};
```

#### **Why Partition? (Exam Point)**

1.  **ZONE_DMA (0-16MB)** : Some legacy DMA devices can only perform direct memory access on the low 16MB of physical memory.
2.  **ZONE_NORMAL (16MB-896MB)** : This memory is **permanently mapped** into the kernel's virtual address space, and the kernel can access it directly. Most kernel operations happen here.
3.  **ZONE_HIGHMEM (>896MB, only on 32-bit systems)** : The kernel cannot access this directly; it needs to dynamically establish temporary mappings. 64-bit systems have a huge address space and don't have this zone.

#### **The Buddy System - `free_area[]` (Core Exam Point!)**

*   **Problem to Solve**: **External fragmentation** – although there is a lot of free memory, it exists as small fragments that cannot satisfy large contiguous memory allocation requests.
*   **How it Works**: Organizes free physical page frames into blocks, where each block's size is a power of two number of pages.
    *   `free_area[0]`: Links all **single** free pages (4KB).
    *   `free_area[1]`: Links all blocks consisting of **2 contiguous** free pages (8KB).
    *   ...
    *   `free_area[10]`: Links all blocks consisting of **1024 contiguous** free pages (4MB).

*   **Allocation Process (example: allocating 8 pages, i.e., order=3)** :
    1.  Check if the `free_area[3]` list is empty.
    2.  If not empty, allocate the first block from the list.
    3.  If empty, look upwards to `free_area[4]`.
    4.  If `free_area[4]` has a block, **split** it into two "buddy" blocks of `order=3`.
    5.  One is used for allocation, the other is placed into the `free_area[3]` list.

*   **Release Process**:
    1.  Release a block of `order=3`.
    2.  Find its "buddy" block (contiguous in address, same size) and check if it is also free.
    3.  If yes, **merge** the two buddy blocks into a block of `order=4` and place it into the `free_area[4]` list.
    4.  Continue trying to merge upwards until no further merging is possible.

#### **Page Frame Reclamation - `active_list` and `inactive_list`**

When the system runs low on memory, the kernel needs to reclaim some infrequently used page frames. It uses an approximation of the **LRU (Least Recently Used)** algorithm:
*   **Active List**: Stores pages that have been accessed recently.
*   **Inactive List**: Stores pages that are candidates for reclamation.
*   The kernel thread `kswapd` periodically moves pages from the active list that haven't been accessed for a long time to the inactive list, and then preferentially reclaims pages from the inactive list.

---

### **Chapter 4: The Physical Page Frame's "ID Card" - `struct page`**

The smallest unit of physical memory is the **Page Frame**, typically 4KB. The kernel creates a `struct page` structure for every physical page frame in the system, serving as its "ID card" or management metadata.

```c
struct page {
    unsigned long flags;                // Page status bitmap (extremely important!)
    atomic_t _count;                    // Page reference count
    atomic_t _mapcount;                 // Page table mapping count
    struct address_space *mapping;      // Points to the owning address space
    pgoff_t index;                      // Offset within the address space
    struct list_head lru;               // Used to link into the zone's active/inactive lists
    void *virtual;                      // Kernel virtual address of the page (needed for high memory)
};
```

#### **Core Field Explanations:**

*   **`flags` (Exam Focus)**: Uses bits to represent various states of the page.
    *   `PG_locked`: Page is locked, an I/O operation is in progress.
    *   `PG_dirty`: Page content has been modified and is inconsistent with the disk file.
    *   `PG_uptodate`: Page content is valid.
    *   `PG_lru`: Indicates the page is on a zone's LRU list.

*   **`_count` vs. `_mapcount` (Most Easily Confused Exam Points!)** :
    *   `_count`: **Kernel reference count**. Indicates how many places inside the kernel are currently using this physical page. `_count = 0` is a **necessary condition** for the page to be reclaimable.
        *   `get_page()` -> `_count++`
        *   `put_page()` -> `_count--`
    *   `_mapcount`: **Page table mapping count**. Indicates how many processes' page tables map this physical page (i.e., how many processes share it).
        *   `-1`: Not mapped by any process.
        *   `0`: Mapped by one process.
        *   `N`: Mapped by N+1 processes.
    *   **Simple analogy**: A physical page is like a physical book.
        *   `_mapcount`: Records how many **people's** "library cards" (page tables) have registered this book.
        *   `_count`: Records how many **kernel subsystems** are currently "holding" this book with their hands and reading it (e.g., being modified, undergoing I/O).

*   **`mapping` and `index`** :
    *   If the page belongs to the **page cache** (file cache), `mapping` points to the file's `address_space`, and `index` indicates the page's offset within the file.
    *   If the page is from an **anonymous mapping** (like heap or stack), `mapping` points to the anonymous address space.

---

### **Complete Chain Integration: The Full Journey of a `malloc`**

Now, let's connect all these structures to see what happens when you call `char *buf = malloc(8192);` (allocating 8KB):

1.  **Library Function Layer**: `malloc` calls the `sbrk` or `mmap` system call to request virtual memory from the kernel.
2.  **VMA Operations**: The kernel finds the VMA for the heap region within the process's `mm_struct` using the red-black tree `mm_rb` and extends its `vm_end`, or creates a new VMA. At this point, only a plot of land has been marked out in the **virtual address space**; no actual physical memory has been allocated.
3.  **Trigger Page Fault**: When you first read or write to `buf`, the CPU finds that the page table entry for that virtual address is empty (invalid), triggering a **page fault exception**.
4.  **Exception Handling**: The kernel's page fault handler is invoked.
    *   It finds the VMA to which the address belongs via `mm_struct->mm_rb`.
    *   It checks whether the VMA's permissions are legitimate.
5.  **Allocate Physical Page**:
    *   The kernel turns to the physical memory manager. It might allocate from **ZONE_NORMAL**.
    *   First, it attempts to get a single page frame from the **per-CPU page cache** (`zone->pageset[]`). This is fast because no locking is required.
    *   For requests of contiguous page frames, it calls the **buddy system**. The buddy system searches for an appropriate free block in `zone->free_area[order]` (here, 2 contiguous pages are needed, order=1). If found, it removes it from the list and updates `zone->free_pages`.
6.  **Establish Mapping**:
    *   The buddy system returns a `struct page` pointer.
    *   The kernel uses the address of this physical page frame to fill the **Page Table Entry (PTE)** for the corresponding virtual address in the process's page table.
    *   Simultaneously, the physical page's `_mapcount` becomes 0 (mapped by one process), and `_count` becomes 1 (referenced by the kernel).
7.  **Return to Userspace**: The page fault handling is complete. The CPU re-executes the instruction that caused the exception, and this time it successfully accesses the newly allocated physical memory.

### **Summary and Exam Focus**

| Data Structure | Role | Core Concept | Exam Focus |
| :--- | :--- | :--- | :--- |
| **`mm_struct`** | Process Memory Headquarters | Abstraction of the entire virtual address space | Role of `pgd`; Difference and use cases of `mmap` linked list vs. `mm_rb` tree; `mm_users` vs. `mm_count` |
| **`vm_area_struct`** | Virtual Memory Plot | Contiguous address interval with uniform attributes | `vm_start/vm_end`; `vm_file` (anonymous vs. file mapping); Relationship with `mm_struct` |
| **`struct zone`** | Physical Memory Warehouse | Partitioned management to handle hardware limitations | Roles of the three Zones; **Principles of the Buddy System** (`free_area[]`, allocation/release/merging process); LRU lists |
| **`struct page`** | Physical Page Frame ID Card | Smallest management unit of physical memory | `flags` status bits; **`_count` vs. `_mapcount`**; Role of `mapping` and `index` |
