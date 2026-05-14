---
title: The World of Operating Systems Is Also Like Our World
date: 2025-09-12 16:34:17
tags: [Chapter 1, Wild AI Philosopher]
categories: [Operating System]
description: Want to know why a rice cooker is more "focused" than a computer, and why a night market vendor is actually a top-tier time-sharing system expert? This note turns rigid operating system theory into fun social observations, helping you quickly grasp the secrets of processor organization and kernel-mode privileges through the lens of economics and management.
---

# 🖥️ Operating Systems: Not Just Cold Technology

Many people think of "operating systems" as nothing but rigid machine logic. But if you look from a different angle, it's more like a microcosm of our lives: family分工, market order, and even choices in politics and philosophy.

## 🗂️ System Types  

<details>
<summary>⏳ <b>Time-Sharing Systems</b> → Night market vendors taking turns serving customers </summary>  

> Have you been to a night market? Dozens of stalls are set up, and each vendor can only give attention to one customer for a short time.  
> **Time-sharing systems** work the same way: they slice **CPU time** into small pieces and轮流 serve different users.  

It's like when you order grilled cold noodles — the vendor flips them a couple of times, then takes the next order. You have to wait, but everyone gets served. **Fairness wins over efficiency**.  

</details>  

<details>
<summary>🏥 <b>Real-Time Systems</b> → ER doctors must act immediately</summary>  

> **Real-time systems** are like the emergency room: as soon as a patient arrives, the doctor must respond instantly. There's no "queuing" here — **time is life**.  

These systems require **punctuality and reliability**. Even a one-second delay is a failure, just like the heart monitor on an operating table — "lag" is absolutely unacceptable.  

</details>  

<details>
<summary>📱 <b>Embedded Systems</b> → Focused and quiet like a rice cooker or watch</summary>  

> The rice cooker, washing machine, or even the chip in your watch at home — these are all part of the **embedded systems** world. They're not as flashy as computers, but they're everywhere.  

Their philosophy is: "I was born to do one thing." **Simple, focused, and not追求 versatility**.  

</details>  

<details>
<summary>📦 <b>Batch Processing Systems</b> → Sending a large batch of packages at once</summary>  

> Imagine打包 a pile of快递 and handing them to a courier, who processes and delivers them all together. **Batch processing systems** work like that: they **queue up tasks and process a batch in one go**.  

High efficiency, but the trade-off is waiting. Once you submit, you can only patiently wait for the result.  

</details>  

### 📝 Operating System Type Comparison Table (Including Applicable Scenarios)
| System Type           | Characteristics                                  | Advantages                                        | Disadvantages                                       | Applicable Scenarios                                    | Similarities to Other Systems                         | Differences from Other Systems                   |
| --------------------- | ----------------------------------------------- | ------------------------------------------------- | --------------------------------------------------- | ------------------------------------------------------- | ----------------------------------------------------- | ------------------------------------------------ |
| **Batch Processing**  | - User jobs submitted in batches<br>- System executes sequentially, automatically | - Improves CPU and device utilization<br>- Automated processing | - No user interaction in real time<br>- Errors hard to detect promptly | **Computationally intensive, highly automated jobs**<br>e.g., payroll calculation, large-scale data processing | Similar to multi-programming → improves resource utilization | Emphasizes **throughput**, not interaction      |
| **Multi-Programming** | - Multiple programs loaded into memory concurrently<br>- Macroscopically parallel, microscopically serial | - Improves CPU utilization<br>- Reduces CPU idle time | - Program switching increases overhead<br>- Complex scheduling | **Environments needing high resource utilization**<br>e.g., scientific computing, batch jobs | Similar to time-sharing →宏观 parallel, 微观 serial      | Aims at **efficiency**, not user experience      |
| **Time-Sharing**      | - Multiple users online simultaneously<br>- CPU轮转 using time slices | - Each user gets timely response<br>- Good fairness | - Frequent context switching, slightly lower efficiency | **Highly interactive, short jobs**<br>e.g., online programming, terminal interaction | Similar to multi-programming →宏观 parallel, 微观 serial      | Aims at **interactive experience**, emphasizing response speed |
| **Real-Time**         | - Must complete tasks within strict deadlines<br>- Hard and soft real-time | - Guarantees tasks finish on time<br>- Used in critical scenarios (e.g., aviation, medical) | - Low flexibility<br>- Complex development, high cost | **Random external events needing timely handling**<br>e.g., aerospace control, industrial control, medical monitoring | Similar to embedded → often used with specific hardware/devices | Emphasizes **timing determinism**, not efficiency or interaction |
| **Embedded**          | - Dedicated, lightweight<br>- Tight integration of hardware and software | - Low resource consumption<br>- Low power, stable | - Fixed functionality, poor scalability | **Dedicated jobs with fixed functions needing long-term stable operation**<br>e.g., home appliances (washer, fridge), automotive control, IoT devices | Similar to real-time → often combined with hardware, emphasizes stability | Emphasizes **specialization**, not general-purpose computing |

## ⚙️ Processor Organization  

<details>
<summary>👩‍👩‍👦 <b>Asymmetric Multiprocessing</b> → The parent calls the shots</summary>  

Like a traditional family where the parent has the final say and everyone else follows orders. In an asymmetric multiprocessing system, one processor handles management, while the rest only execute tasks.  

Stable in efficiency, but prone to "over-centralization of power."  

</details>  

<details>
<summary>🤝 <b>Symmetric Multiprocessing</b> → Partners running a bubble tea shop</summary>  

This is more like a group of partners running a bubble tea shop. Anyone can take orders and make tea, with flexible分工.  

The advantage is high efficiency, but everyone must coordinate well, or orders will collide.  

</details>  

<details>
<summary>🎪 <b>Multi-Programming Systems</b> → A night market with hundreds of stalls open at once</summary>  

Like a night market, everyone opens at the same time, sharing resources without interfering with each other.  

This is market-style efficiency — everyone can find an opportunity, but there's also competition and conflict.  

</details>  

## 🏛️ Privilege Levels  

<details>
<summary><b>Kernel Mode</b> vs <b>User Mode</b> → Government and citizens</summary>  

Imagine a country:  
- **Kernel mode** is like the government's military and financial power — it can do the most底层 things.  
- **User mode** is like ordinary citizens, who can only operate within the bounds of rules.  

If everyone could mobilize the military arbitrarily, society would be in chaos. The separation of kernel and user modes is about finding the balance between security and freedom.  

</details>  

## 📚 Conceptual Mapping  

<details>
<summary>Economics, Management, Political Science, and Philosophy Behind Operating Systems</summary>  

- From an **economics** perspective: it's a trade-off between efficiency and cost  
- From a **management** perspective: it's a choice of organizational structure  
- From a **political science** perspective: it's about power distribution and maintaining order  
- From a **philosophical** perspective: it's the eternal tension between freedom and constraint, fairness and efficiency  

Operating systems are not just products of technology — they are also projections of human ways of thinking.  

</details>  

## ✨ Finally  

If you can see time-sharing in a night market, understand real-time systems in an emergency room, and discover embedded systems in home appliances, then you've truly encountered operating systems in everyday life.  

They are not cold, rigid rules — they are another metaphor for life itself.
