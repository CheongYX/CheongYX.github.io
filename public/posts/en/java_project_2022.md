---
title: 基于 Java 与 SQLite 的蛋白质序列属性管理系统实现
layout: project
date: "2022-01-09"
catogories: Java
tags: Java, SQLite
---


<!-- tabs: Project Background -->
## 1. Introduction: Project Background and System Vision

### 1.1 Research Background

In the context of bioinformatics in 2022, the effective management of protein sequence data is a prerequisite for deep learning research, such as AlphaFold2. Researchers often face massive and heterogeneous datasets; thus, implementing local data storage, efficient retrieval, and preliminary statistical analysis through engineering means is a core link in constructing a research pipeline.

### 1.2 Expected Objectives

This project aims to develop a lightweight and robust desktop management tool focusing on the "storage, access, management, and usage" of local protein sequence attribute data[cite: 6]. The core objectives include:

* **Structured Persistent Storage**: Parsing and importing scattered file data into a local database to establish a standardized data model.
* **Multi-dimensional Efficient Retrieval**: Supporting complex combined queries based on sequence attributes for researchers.
* **Data Insight and Statistics**: Automatically extracting and outputting statistical features of the dataset, such as the mean sequence length, frequency distribution, and median.

### 1.3 Hardware/Software Architecture Design (OOP and Decoupling)

The system design follows core **Object-Oriented Programming (OOP) principles**, decoupling complex system functions into two core layers to ensure system stability and scalability:

* **Interaction Module (Interaction Module / View-Controller)**: Responsible for parsing user commands (cmd/powershell terminal), validating file formats, and visually presenting results in a tabular format.
* **Database Operation Module (DB Operation Module / Model)**: Based on the **J2SE-1.5** standard, it interacts with the lightweight, embedded **SQLite3** engine through the **sqlite-jdbc-3.36.0.3.jar** driver to achieve low-latency data persistence management.

<!-- tabs: Technical Implementation -->

## 2. Core Implementation Logic and Business Workflow

This system implements a complete closed loop from raw file parsing to structured data analysis through modular design.

### 2.1 Structured Data Processing: Ingestion and Query

- **Structured Data Ingestion**: The system parses protein sequence files in batches through the `handleAppend` method in `Main.java`. Its core logic lies in **fault-tolerant parsing**: the system pre-validates file suffixes during reading to ensure only legal formats enter the processing stream and performs automatic completion for sequences with incomplete information to prevent the program from crashing due to local data corruption.
- **Complex Retrieval and Analysis Engine (Query & Stats)**: The interaction module dynamically parses user-entered keywords into SQL commands. The code iterates through the `ResultSet` to trigger real-time statistical logic:
  - **Statistical Formula**: Mean sequence length $\bar{L} = \frac{1}{n} \sum_{i=1}^{n} L_i$.
  - **Result Feedback**: Calculation results and total data volume are fed back in real-time at the bottom-left of the interface, achieving "retrieval-as-analysis" responsiveness.

### 2.2 Protein Sequence Management System Logical Flowchart

The system processes scientific data through four key stages to achieve a closed loop from command to data:

#### 2.2.1 System Initialization Phase (Initialization)

At the start of the program, the system ensures the absolute stability of the storage engine:
- **Environment Pre-loading**: Loading the `sqlite-jdbc` driver ensures JDBC channel connectivity between the **J2SE-1.5** environment and the database.
- **Persistent Connection**: Establishing a physical connection with the local `rna.db`. The driver acts as a "translator," mapping Java commands to binary file operations.
- **Resource Validation**: Automatically checking and initializing the database Schema to ensure fields (Entry, Name, Length, etc.) comply with storage specifications.

#### 2.2.2 Command Parsing and Dispatching

Serving as the "brain" of the system, it uses streaming command parsing logic to convert user intent into precise operations:

```Java
// Core dispatch loop logic in Main.java
Scanner sc = new Scanner(System.in);
while (sc.hasNext()) {
    String cmd = sc.next();
    if (cmd.equalsIgnoreCase("append")) {
        processAppend(sc.next()); // Route to data ingestion stream
    } else if (cmd.equalsIgnoreCase("search")) {
        processSearch(sc.next()); // Route to query statistics stream
    }
    // ... Processing pagination (Page), clearing (Clear), and export (Export) logic
}
```

#### 2.2.3 Core Processing Streams

This is the most rigorously engineered part of the system, reflecting the problem-solving approach for real scientific issues:

| **Functional Module**     | **Logic Implementation Steps (Main.java)**                   | **Robustness Manifestation**                                 |
| ------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| **Data Ingestion (Append)** | Parses TSV/CSV files and atomically stores them in the database via `PreparedStatement`. | **Format Guard**: Validates the suffix before reading. If invalid, it intercepts and reports an error without terminating the main process, allowing users to continue after correction. |
| **Data Retrieval (Search)** | Supports single/multi-keyword precise matching, with dynamic SQL construction for responses. | **Empty Result Protection**: Returns a friendly prompt when no matches are found and resets the buffer to prevent program crashes. |
| **Statistical Analysis (Stats)** | Iterates through the `ResultSet` to automatically calculate the total count, mean length, and frequency metrics. | **Outlier Pre-judgment**: Identifies abnormal sequences through numerical analysis, providing data cleaning suggestions to researchers. |
| **Pagination Control (Pagination)** | Implements data slicing for browsing using SQL `LIMIT` and `OFFSET` logic. | **Boundary Check**: Ensures the target page number remains within the legal `[1, maxPage]` range to prevent index out-of-bounds exceptions. |

#### 2.2.4 Output and Persistence Phase (Output)

- **Real-time Feedback Loop**: The interaction interface refreshes to present sequence details for the current page in a table and simultaneously updates the statistical analysis panel.
- **Safety Protection Fence**: Validates the suffix before **Exporting**. If an illegal suffix like `.jpg` is detected, the system intercepts the write operation and recommends the correct format to prevent scientific data corruption.

### 2.3 OOP Thinking: The Architectural Beauty of Design

The core aesthetic of this architecture lies in its **decoupling**, perfectly embodying the **Single Responsibility Principle (SRP)**:

- **Interaction Layer**: Responsible only for "speaking" (rendering results) and "listening" (parsing intent).
- **DB Operation Layer**: Focuses on "calculating" (statistical analysis) and "recording" (persistent storage).

<!-- tabs: Problem Solving -->

## 3. Engineering Challenges and Robustness Solutions (Problem Solving)

I solved the following key challenges through pure software engineering thinking:

### Challenge A: Biological Data Heterogeneity and Ingestion Fault Tolerance

- **Problem Description**: Real sequence files often contain missing fields, which can easily cause SQL parsing to crash.
- **Solution**: Introduced an **exception isolation mechanism**. Parsing logic in `Main.java` is wrapped in rigorous `try-catch` blocks; when missing information is detected, it triggers automatic completion logic instead of abnormal termination.

### Challenge B: System Stability Under High-Frequency Operations

- **Problem Description**: Simulating scenarios where researchers perform extremely high-frequency storage and extraction during specific periods.
- **Solution**: Applied stream processing thinking. By optimizing non-blocking scheduling for the storage layer, the system ensures the interface remains responsive even during high-throughput batch processing.

### Challenge C: Robustness Interception of the File Export System

- **Problem Description**: Users might accidentally export files with illegal suffixes (e.g., `.png`), making scientific reports unreadable by subsequent software.
- **Solution**: Implemented **strong typing suffix constraints**. The system pre-judges the suffix before export; if invalid, it intercepts the write operation, fundamentally eliminating the generation of corrupted files.

<div style="display: flex; align-items: center; gap: 10px;">
  <span>View my Java Project on GitHub</span>
  <a href="https://github.com/CheongYX/java_project_2022">
    <img src="https://img.shields.io/badge/GitHub-Repository-black?logo=github" alt="GitHub Repository" style="margin: 0;">
  </a>
</div>

<!-- tabs: Final Results -->

## 4. Conclusion and Interdisciplinary Reflection

### 4.1 Functional Validation

The project successfully realized a complete life-cycle management system. Statistical results clearly demonstrate mean sequence lengths and frequency distributions, and even reserve the potential for identifying outliers.

#### 4.1.1. Page Display
![Page Display](/images/java_project_2022/PageDisplay.gif)

#### 4.1.2. Append Function Display
![Append Function Display](/images/java_project_2022/AppendDisplayFunction.gif)

#### 4.1.3. Search Function Display
![Search Function Display](/images/java_project_2022/SearchDisplayFunction.gif)

#### 4.1.4. Export Table Function Display
![Export Table Function Display](/images/java_project_2022/ExportDisplayFunction.gif)

#### 4.1.5. Clear Function Display
![Clear Function Display](/images/java_project_2022/ClearDisplayFunction.gif)

#### 4.1.6. Page Navigation Keys Display
![Page Navigation Keys Display](/images/java_project_2022/PageBreakKeyDisplay.gif)

#### 4.1.7. Page Number and Go Function Display
![Page Number and Go Function Display](/images/java_project_2022/PageNumberNGoFunction.gif)

#### 4.1.8. Data Search Statistics and File Format Checking Functions

<div style="display: flex; gap: 12px; align-items: center;">
  <div style="flex: 1;">
    <img src="/images/java_project_2022/DataSearchAndStatisticsFunctions.png" style="width: 100%; height: auto; display: block; border-radius: 8px; margin: 0;" alt="Data Search Statistics">
  </div>
  <div style="flex: 1;">
    <img src="/images/java_project_2022/FileFormatCheckFunction.png" style="width: 100%; height: auto; display: block; border-radius: 8px; margin: 0;" alt="File Format Check">
  </div>
</div>

### 4.2 Conclusion

This project fully demonstrates that under the 2022 technology stack, a robust and efficient lightweight research tool can be built through reasonable object-oriented decoupling and rigorous engineering fault-tolerance logic. The experience of applying software engineering thinking to solve specific disciplinary problems is more valuable than using any specific framework.
