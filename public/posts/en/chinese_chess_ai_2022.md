---
title: Hybrid Architecture Implementation of Chinese Chess AI Game System
layout: project
date: "2022-08-22"
catogories: Python
tags: React, Vite, TailwindCSS, Minmax, Alpha-Beta Pruning, Monte Carlo Tree Search (MCTS), Zobrist Hashing
---

<!-- tab: Project Background -->

### 1. Abstract & Background

Chinese Chess (Xiangqi), as a typical representative of the transition from incomplete information games to complete information games, has a state space complexity of up to $10^{150}$. Since Alan Turing proposed the concept of a gaming machine, board game engines have always been regarded as the "fruit flies" of the artificial intelligence field.

This project originated from the 2022 "Artificial Intelligence" undergraduate course practice. Its core objective is to build an experimental platform capable of covering the three mainstream paradigms of artificial intelligence: heuristic search of Symbolic AI, neural network evaluation of Connectionism, and parameter optimization of Evolutionary Computing. In 2026, the project was refactored using the modern frontend tech stack of React and the high-performance asynchronous backend of FastAPI. This research not only focuses on the optimal solution of algorithms but also deeply explores how to handle State Consistency between heterogeneous systems under a distributed full-stack architecture, as well as the strategic bottlenecks of traditional heuristic algorithms in complex endgames.

<!-- tab: Technical Implementation -->

### 2. Phase 1: Rule Engine & Data Structures

#### **2.1 Data Structures**

The system does not use a simple two-dimensional array but constructs a bidirectionally mapped composite structure to support position queries and rollbacks with $O(1)$ complexity:

- **Grid-Matrix**: A $9 \times 10$ matrix storing references to chess piece objects, used for spatial position legality verification.
- **Item-Location Mapping**: Stores the mapping from `Item_ID` to coordinates, optimizing the frequent "simulated move" and "state restoration" operations in Alpha-Beta search.
- **Action Stack**: Records all historical `MoveAction`s (including start point, end point, and captured entities), which is the foundation for implementing the move-retraction logic and Zobrist incremental updates.

```python
# Initialize board container
self.grids = [[None for w in range(self.width)] for h in range(self.height)]
self.items = {}      # item_id -> item entity
self.locations = {}  # item_id -> Location(x, y) coordinate mapping

# O(1) complexity move and rollback logic
def run(self, item, from_, to_, captured_item):
    if captured_item:
        self.capture_chess(captured_item, to_) # Record capture state
    self.move_chess(item, to_) # Update grids and locations

def roll_back(self, item, from_, to_, captured_item):
    self.move_chess(item, from_) # Reset coordinates
    if captured_item:
        self.reset_chess(captured_item, to_) # Restore captured entity
```

#### **2.2 Rule Generation**

By defining the `getPossibleMoveActions` interface through an abstract base class, specific geometric constraints are implemented for different piece types. For example, when implementing the "Horse moves in an L-shape", the system incorporates a logic blocking check, namely the "hobbling the horse's leg" judgment; in the "General/King" judgment, besides the nine-palace grid restriction, a special legality check for the "Flying General" (face-to-face direct attack) is also introduced.

```Python
elif item.type_ == ChineseChessType.MA:
    # Define the eight potential jump directions for the Horse and their corresponding "hobbling" positions
    MA_TWO_MOVES = [[up, up_left], [up, up_right], [down, down_left], ...]
    for two_moves in MA_TWO_MOVES:
        loc = two_moves[0](orign_loc) # Step 1: Reach the "horse leg" position
        # Logic blocking check: if there is a piece at the horse leg position, the path in that direction is blocked
        if in_board(loc) and board.get_chess(loc) is None:
            loc = two_moves[1](loc) # Step 2: Reach the target landing spot
            if in_board(loc):
                add_move_action(loc) # Validation passed, generate MoveAction
```

### 3. Phase 2: Full-stack & Heuristic Search

#### **3.1 Search Algorithm: Alpha-Beta Pruning & Transposition Table**

The backend decision-making brain adopts the **Minimax search algorithm** with **Alpha-Beta pruning**.

- **Pruning Logic**: By setting a dynamic $[\alpha, \beta]$ window, when the evaluation value of a certain branch exceeds the current limit, the search is immediately truncated, significantly reducing the exponential explosion risk of the search tree.

```Python
def search(self, board, lock, key, side, search_level, threshold_max=1):
    actions = getAllPossibleMoveActions(board, side) # Generate all legal moves
    max_score = 0
    
    for action in actions:
        board.run(...) # Simulate move
        # Recursive search: calculate the opponent's best response in the next layer
        score = 1 - self.search(board, ..., 1 - max_score)[1]
        board.roll_back(...) # State restoration

        if score > max_score:
            max_score = score
            max_score_action = action
        
        # Alpha-Beta Pruning: if the current branch score has exceeded the threshold, truncate subsequent searches directly
        if max_score >= threshold_max:
            return (max_score_action, max_score)
```

- **Zobrist Hashing & Transposition Table**: To solve the "overlapping subproblems" in the search process, the system implements a transposition table based on Zobrist hashing. By generating a unique fingerprint for each board state through randomly generated 64-bit integers, the searched depth is cached. It incrementally updates the board fingerprint via the bitwise $XOR$ operation, avoiding duplicate evaluations of the same positions:

```Python

def gen_key_for_action(self, previous_lock, previous_key, action):
    # Utilize the reflexivity of the XOR operation to only update the hash value of the changed positions
    id_from = self.get_id(action.item, action.from_)
    id_to = self.get_id(action.item, action.to_)
    
    # Move out of original position, move into new position, handle captured piece
    previous_key = previous_key ^ self.key_list[id_from] ^ self.key_list[id_to]
    if action.captured_item:
        id_captured = self.get_id(action.captured_item, action.to_)
        previous_key = previous_key ^ self.key_list[id_captured]
    return (previous_lock, previous_key)
```

#### **3.2 Full-Stack Communication & State Synchronization Strategy**

The project utilizes **RESTful APIs** for front-end and back-end communication, and designs a synchronization scheme specifically for the asynchronous characteristics unique to distributed environments:

- **Stateless vs. Stateful Conflict Resolution**: The backend FastAPI maintains the game context under a long connection, while the frontend React adopts a controlled component model. Through Pydantic normalizing the data model, it ensures that the Coordinate System does not undergo polarity reversal during the JSON serialization process.
- **Optimistic UI Update Mechanism**: The frontend moves the piece in advance before initiating a network request; if the backend validation fails (such as session timeout or illegal move), a State Rollback ensures a high degree of consistency between the view and the logic core.

```JavaScript
const handleSquareClick = async (x, y) => {
  const prevBoardState = { ...board }; // Step 1: Capture current board snapshot (backup)
  const newBoard = { ...board };
  // ...Execute frontend move logic...
  setBoard(newBoard); // Step 2: Optimistic update, let the user see the piece move first

  try {
    const response = await fetch('/api/move', { method: 'POST', ... }); // Step 3: Initiate asynchronous request
    const data = await response.json();
    
    if (data.status === 'success') {
      // Apply the AI's counter-move
    } else {
      // Step 4: Backend validation fails (e.g., session desynchronization), force rollback
      setBoard(prevBoardState); 
      alert("Synchronization error, the game has been automatically reset.");
    }
  } catch (error) {
    setBoard(prevBoardState); // Network error rollback
  }
};
```

**Communication Layer Implementation**: The system adopts a **RESTful architecture** based on **FastAPI**. The frontend React application serializes the player's operations into **JSON** payloads via the asynchronous **fetch** mechanism and sends them to the backend's `/api/move` route. After processing the A-B pruning search, the backend logic core encapsulates the AI's response into a standard response object and returns it. This architecture not only achieves decoupling of UI and logic but also paves the way for subsequent integration with **cloud GPU clusters** for deep learning inference (Phase 3).

## 4. Phase 3: Deep Learning & Neural Evaluation

In traditional game engines, static evaluation functions rely on human-preset weights, which appears logically rigid when dealing with highly dynamic Chinese chess formations. To solve this pain point, this project introduces an evaluation model based on **Convolutional Neural Networks (CNN)** in Phase 3, aiming to simulate the "big picture view" of human players through Feature Extraction.

### 4.1 Board Representation: From Logical Coordinates to Tensorization

Neural networks cannot directly understand the logical objects of chess pieces and must convert them into high-dimensional tensors. The system implements the "optic nerve" function through the `BoardConverter` class:

- **Input Dimensions**: Constructs a $14 \times 10 \times 9$ multidimensional tensor.
- **Feature Channels**: Splits the chessboard into 14 channels (corresponding to the 7 piece types for both Red and Black sides). Each channel is a binarized matrix marking the spatial distribution of a specific piece. This One-Hot Encoding approach preserves the **Spatial Locality** of the chessboard.

```Python
# In ChineseChessNNEvaluator.py, we map the chessboard into feature planes
tensor = np.zeros((14, 10, 9), dtype=np.float32)
# Iterate through the pieces, light up corresponding channels
for item in board.items.values():
    channel_idx = type_to_index[item.type_]
    if item.side == ChineseChessSide.UP: channel_idx += 7 # Black side channel offset
    tensor[channel_idx][loc.y][loc.x] = 1.0
```

### 4.2 Model Architecture: Convolutional Neural Network (ChessCNN)

The core of the evaluator is a customized convolutional architecture `ChessCNN`, used to extract deep strategic features:

- **Convolutional Layers**: Employs $3 \times 3$ convolution kernels for multi-layer scanning, used to identify cross-grid formation features such as "Double Cannons", "Linked Horses", and "Screen Horses".
- **Non-linear Activation**: Uses the **ReLU** activation function to introduce non-linear modeling capabilities, enabling the AI to recognize complex tactical combinations.
- **Decision Mapping**: Fully Connected Layers (FC Layers) integrate spatial features into a scalar output. The output is compressed into the $[-1, 1]$ interval via the **Tanh** function, representing the intuitive win probability for the Red or Black side under the current position.

### 4.3 Deep Analysis: Structural Completeness vs. Lack of Knowledge

Currently, the milestone of Phase 3 lies in the **successful transplantation of the neural architecture**. After integrating the `ChineseChessNNEvaluator`, the AI's decision-making logic underwent a qualitative change:

- **From Calculation to Perception**: The AI no longer solely relies on the depth searched by $Minimax$ but directly performs "board sensing" on the current state via `model.forward()`.
- **Cold Start Challenge**: The current neural network is in an "unenlightened" state. Because the neuron Weights are randomly initialized, the AI is currently in a state of "structural completeness but lacking knowledge".

Phase 1 and Phase 2 established the system's **physical logic** and **engineering pipeline**, while Phase 3 initially built the system's **cognitive architecture**. Pure search algorithms can only solve the problem of "making no mistakes", whereas deep learning evaluators can solve the problem of "winning the game". Currently, the system already possesses the capability to receive neural network instructions, closing the loop of full-stack interaction and model inference.

### 5. Retrospective & Reflection

During the development process, I had to face and document those representative technical bottlenecks:

#### **A. An Honest Retrospective on the 2022 Technology Gap**

Looking back at the initial design of 2022, I had envisioned deep learning structures like CNNs in my blog at that time. However, given my knowledge reserve as a sophomore then, without having systematically studied deep learning courses, I indeed felt a significant technical barrier when facing complex tensor representations and backpropagation algorithms. **Admitting my powerlessness back then is to better define my growth today;** the project at that time was more about completing the closed loop of engineering logic.

#### **B. The Horizon Effect and the Rigidity of Static Evaluation**

Traditional search algorithms are limited by search depth (usually 3-5 layers) and are prone to phenomena like "perpetual check" or infinite loops in endgames. This proves that relying solely on static evaluation functions (e.g., Rook = 90 points) cannot express complex dynamic formations.

<!-- tab: Problem Solving -->

### 6. Problem Solving

During development, I encountered two representative technical bottlenecks and broke through them one by one via architectural optimization:

#### **Problem A: State Desynchronization in Distributed Architecture**

- **Phenomenon Description**: In the "React frontend + Python backend" architecture, phenomena like "piece moves but backend judges it invalid" or "unable to continue the game after frontend refresh" frequently occurred.
- **Technical Pain Point**: The backend Python process is **Stateful**, maintaining the unique chessboard object in memory; whereas the frontend React is **declarative**, and page refreshes cause local state to clear. When the progress of the two ends is unsynchronized, the coordinates sent by the frontend might be an empty space in the backend logic, leading to `ModuleNotFoundError` or logic errors.
- **Solutions**:
  1. **Optimistic UI & Rollback**: The frontend executes the move animation first and synchronously initiates an asynchronous `fetch` request. If the backend returns `Error` (coordinates mismatch), the frontend utilizes the backed-up `prevBoardState` to instantaneously roll back the piece position, ensuring the screen seen by the user is always synchronized with the backend brain.
  2. **Instruction Lock Mechanism**: Introduces the `isAiThinking` state. Before the network request returns, it physically locks frontend interactions to prevent logic stacking caused by continuous user operations during AI calculation.
  3. **Game Uniqueness Verification**: Adds `piece_name` validation to the API return values to ensure the piece moved by the AI strictly matches the piece ID perceived by the frontend.

#### **Problem B: The Horizon Effect & Repetitive Loop of Traditional Search Algorithms**

- **Phenomenon Description**: The AI behaves "not smart enough" in advantageous situations, frequently making moves like "back-and-forth perpetual checks" or "ineffective time-wasting", unable to deliver a fatal blow, and even falling into infinite loops during the endgame phase.

- **Technical Pain Point**:
  1. **Horizon Effect**: Algorithms based on $Minimax$ combined with $Alpha\text{-}Beta$ pruning are limited by search depth (usually 3-5 layers). The AI can only see the maximum score within a few steps but cannot see deeper winning moves, leading it to believe that "repeated checking" is the best means to maintain the current high score.
  2. **Static Evaluation Function**: The existing evaluation function relies on manually defined static scores (e.g., Rook = 90, Horse = 40). This linear accumulation cannot express the changes in "momentum" in chess, and the AI lacks an intuitive perception of complex formations like "pinning" and "discovered attacks".
- **Solutions (Algorithm Evolution Path)**:
  1. **Introducing MCTS (Monte Carlo Tree Search)**: Breaking the limitation of fixed depth through massive random simulations (Rollouts), utilizing probability distributions to discover winning opportunities that only manifest in deeper searches.
  2. **Brain Transplantation (Neural Network Evaluator)**: This is the subsequent milestone of this project. I plan to replace hardcoded additions and subtractions via a **CNN (Convolutional Neural Network)**. Treating the chessboard as an image, letting the network automatically extract formation features like "Double Cannons" and "Cannon Behind Horse", thereby granting the AI a "big picture view" and "chess sense" akin to a human player.
  3. **Rule Constraint Penalties**: Adding historical state detection in the search tree, applying extremely high score penalties to recurring situations to force the AI to seek alternative paths.

"This 2022 requirement seemed like an era-spanning challenge at the time. It required developers, amidst the limitations of computing power and engineering, to not only replicate a half-century of game logic but also use neural networks to simulate that elusive 'intuition'."

#### Problem C: **Troubleshooting: The "Invisible" Hardware Power Bottleneck**

When deploying deep learning models in a Windows environment, I encountered missing power options due to **Modern Standby (S0)**. To maintain an ultra-low power standby experience, the operating system shielded core parameters like **PCI Express** and **Processor Power Management**.

**Technical Insight**: This shielding caused the underlying C++ operators of **PyTorch** to fail during the initialization routine of **`c10.dll`** because they couldn't instantaneously obtain sufficient voltage support.

**Resolution**:

1. **Registry Hack**: By modifying the `PlatformAoAcOverride` registry key, disabled **Modern Standby** to forcibly restore traditional ACPI advanced power management options.
2. **OS-Level Graphics Affinity**: Forcibly specified the Python interpreter to run in **High Performance** mode, bypassing system-level power-saving restrictions.

**Ultimate Solution: Creating an Isolated Conda Environment**

> Execute in the terminal to set up a sandbox dedicated to Phase 3 development:
>
> 1. **Create new environment (specifying Python 3.10)**:
>
>    ```Bash
>    conda create -n chess_ai python=3.10 -y
>    ```
>
> 2. **Activate environment**:
>
>    ```Bash
>    conda activate chess_ai
>    ```
>
> 3. **Install "CPU version" PyTorch (skipping GPU driver conflicts)**: *Since your current Phase 3 is mainly logic development and preliminary inference, the CPU version perfectly bypasses the 1114 error caused by graphics drivers.*
>
>    ```Bash
>    pip install torch torchvision torchaudio --index-url [https://download.pytorch.org/whl/cpu](https://download.pytorch.org/whl/cpu)
>    ```
>
> 4. **Install other necessary dependencies**:
>
>    ```Bash
>    pip install fastapi uvicorn numpy
>    ```

<!-- tab: Final Results -->

### 7. Final Deliverables

#### 7.1 Interactive Full-Stack Terminal

![Full-Stack Terminal](/images/chinese_chess_2022/frontend.png)

The current UI abandons redundant visual elements and returns to the purest monitoring big screen mode. In the frontend React page, the system introduces dynamic Depth and Branch Limit controllers. This design intuitively proves that the system architecture has achieved thorough decoupling: the frontend merely acts as a lightweight controlled view layer (View) and interaction engine, while the massive computing pressure of game tree generation, pruning validation, and state rollback has been perfectly stripped off and offloaded to the FastAPI backend cluster for processing.

#### 7.2 Algorithmic Visualization

The thinking process of traditional heuristic game engines is often a "black box". To break this opacity and completely solve the memory overflow bottleneck faced by frontend browsers when rendering hundreds of thousands of DOM nodes, I developed an exclusive `AIVisualizer` disk-logging engine in the backend.

![Dicision Tree](/images/chinese_chess_2022/CYX_20260507_114743/第5回合_Tree.png)

When the system performs computational deduction at extremely deep levels (e.g., Depth=5), the backend automatically utilizes `matplotlib` to render the physical overview of the entire Minimax decision tree and archives it offline. This not only frees up frontend performance but also preserves perfect experimental snapshots for future eXplainable AI (XAI) research:

- **Red Pruning (✂️ Pruned)**: Intuitively records the moments when the Alpha-Beta window successfully intercepts meaningless branches and cuts losses in time.
- **Yellow Cache (⚡ Cache Hit)**: This is visual evidence of the efficient operation of Zobrist hashing (transposition table) in Phase 2. It proves that during deep searches, the AI successfully "recalled" previously calculated overlapping subproblems through the 64-bit hash fingerprint, directly skipping massive amounts of repetitive calculations.

#### 7.3 Grad-CAM Heatmap

![Grad-CAM Heatmap](/images/chinese_chess_2022/CYX_20260507_114743/第5回合_Heatmap.png)

Besides traditional computational deduction, the system successfully injected Convolutional Neural Networks (CNN) in the Phase 3 stage. To intuitively demonstrate the AI's "chess sense" and "big picture view", the system generates Grad-CAM spatial attention heatmaps by extracting the gradients and feature maps from the model's final convolutional layer. This allows us to see as clearly as observing a human retina exactly which key defensive zones or potential killing paths the untrained/training AI model focuses its attention on under the current position.

#### 7.4 Backend Performance Logs

In the past when writing code, the console was either filled with errors or messy infinite loop prints. Now, when I finish a move on the frontend and watch the backend terminal cleanly spit out this running log, I truly feel a deep sense of reassurance.

```text
[Data Persistence] ✅ Turn 5 AI thought tree archived to: .../data/sessions/Player_20260507/Turn5_Tree.png
[Data Persistence] ✅ Turn 5 AI heatmap archived to: .../data/sessions/Player_20260507/Turn5_Heatmap.png
[System Monitor] The highest evaluation score for the next step is 85.00 / 100, calculation time: 1.42 seconds, evaluated positions 4521 times, cache used 1205 times (21.05%), hash collisions 0.
```

No need to bring up profound concepts; these few short lines of text prove two things to me:

1. The hash table (Zobrist Hashing) I wrote really worked. A 21% cache hit rate means it forcibly saved the AI one-fifth of its "blind calculation" time.
2. Traversing nearly 5,000 positions in less than 1.5 seconds shows the effort to rewrite the underlying data structures wasn't in vain. I finally don't have to watch the frontend browser freeze and crash due to computing power explosion anymore.

#### 7.5 Retrospective & Conclusion

Looking back at the initial homework submitted at the end of my sophomore year in 2022, the screen full of logic patches and the "frontend-backend state desynchronization" that I simply couldn't fix back then make me blush a little even now. At that time, I braced myself and wrote "this project introduces a neural network architecture" in the project report; actually, it wasn't because I had such a forward-looking vision, purely because it was a hard scoring requirement given by the teacher. To earn more participation points, I forcibly spouted a bunch of nonsense about tensors and backpropagation that I didn't even understand myself at the time.

Four years later, digging out this pile of code and rewriting it with modern full-stack technology is actually a process of "paying off debts" to the me who frantically patched up the final assignment back then.

There's no shame in admitting the limitations of my sophomore year and the embarrassment of coping with assignments. Looking at this clearly architected system now, which can draw a decision tree of hundreds of thousands of nodes and even use heatmaps to "see through" its thought process, I feel that the pitfalls of these four years were worth stepping into.

Although the current Phase 3 hasn't had the time to be fed with master chess records and remains a "clumsy child" that only blindly scores based on random weights, the foundation is finally built. That sophomore who ran away after submitting the final assignment and getting the grade can finally settle down now and slowly teach this AI how to win a real game of chess.
