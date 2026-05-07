---
title: 中国象棋博弈系统的混合架构实现
layout: project
date: "2022-08-22"
catogories: Python
tags: React, Vite, TailwindCSS, Minimax, Alpha-Beta Pruning, Monte Carlo Tree Search (MCTS), Zobrist Hashing
---

<!-- tab: 项目背景 -->

### 1. 研究背景与动机 (Abstract & Background)

中国象棋（Xiangqi）作为典型的非完备信息博弈向完备信息博弈过渡的代表，其状态空间复杂度高达 $10^{150}$。自图灵（Alan Turing）提出博弈机设想以来，棋类引擎一直被视为人工智能领域的“果蝇”。

本项目源于 2022 年《人工智能》本科课程实践，其核心目标是构建一个能够覆盖人工智能三大主流范式的实验平台：符号主义（Symbolic AI）的启发式搜索、连接主义（Connectionism）的神经网络评估，以及进化计算（Evolutionary Computing）的参数优化。2026 年，项目通过 React 现代前端技术栈与 FastAPI 高性能异步后端进行了重构。本研究不仅关注算法的最优解，更深入探讨了在分布式全栈架构下，如何处理异构系统间的状态一致性（State Consistency）以及传统启发式算法在复杂残局中的策略性瓶颈。

<!-- tab: 技术实现 -->

### 2. 第一阶段技术实现：规则引擎与实体建模 (Phase 1: Rule Engine & Data Structures)

#### **2.1 数据结构构造 (Data Structures)**

系统未采用简单的二维数组，而是构建了双向映射的复合结构，以支持 $O(1)$ 复杂度的位置查询与回溯：

- **Grid-Matrix (棋盘网格)**：$9 \times 10$ 矩阵，存储棋子对象引用，用于空间位置的合法性校验。
- **Item-Location Mapping (实体映射)**：存储 `Item_ID` 到坐标的映射，优化了 Alpha-Beta 搜索中频繁的“模拟走子”与“状态恢复”操作。
- **Action Stack (动作栈)**：记录所有历史 `MoveAction`（包含起点、终点及被捕获实体），这是实现后悔棋逻辑与 Zobrist 增量更新的基础。

```python
# 初始化棋盘容器
self.grids = [[None for w in range(self.width)] for h in range(self.height)]
self.items = {}      # item_id -> item 实体
self.locations = {}  # item_id -> Location(x, y) 坐标映射

# O(1) 复杂度的走子与回溯逻辑
def run(self, item, from_, to_, captured_item):
    if captured_item:
        self.capture_chess(captured_item, to_) # 记录捕获状态
    self.move_chess(item, to_) # 更新 grids 与 locations

def roll_back(self, item, from_, to_, captured_item):
    self.move_chess(item, from_) # 坐标复位
    if captured_item:
        self.reset_chess(captured_item, to_) # 恢复被捕获实体
```

#### **2.2 规则逻辑实现 (Rule Generation)**

通过抽象基类定义 `getPossibleMoveActions` 接口，针对不同兵种实现特定的几何约束。例如，在实现“馬走日”时，系统加入了逻辑栅栏（Blocking check）检测，即“绊马脚”判定；在“将/帅”判定中，除了九宫格限制外，还引入了“飞将”（面对面直接攻击）的特殊合法性校验。

```python
elif item.type_ == ChineseChessType.MA:
    # 定义马的八个潜在跳跃方向及对应的“马脚”位置
    MA_TWO_MOVES = [[up, up_left], [up, up_right], [down, down_left], ...]
    for two_moves in MA_TWO_MOVES:
        loc = two_moves[0](orign_loc) # 第一步：到达“马脚”位置
        # 逻辑栅栏检测：若马脚位置有棋子，则该方向路径被阻断
        if in_board(loc) and board.get_chess(loc) is None:
            loc = two_moves[1](loc) # 第二步：到达目标“日”字落点
            if in_board(loc):
                add_move_action(loc) # 校验通过，生成 MoveAction
```

### 3. 第二阶段技术实现：全栈架构与启发式博弈 (Phase 2: Full-stack & Heuristic Search)

#### **3.1 搜索算法：Alpha-Beta 剪枝与置换表**

后端决策大脑采用了带有 **Alpha-Beta 剪枝** 的 **Minimax 极大极小搜索算法**。

- **剪枝逻辑**：通过设置动态的 $[\alpha, \beta]$ 窗口，当某一分支的评估值超出当前界限时立即截断搜索，显著降低了搜索树的指数爆炸风险。

```python
def search(self, board, lock, key, side, search_level, threshold_max=1):
    actions = getAllPossibleMoveActions(board, side) # 生成所有合法动作
    max_score = 0
    
    for action in actions:
        board.run(...) # 模拟走子
        # 递归搜索：计算对手在下一层的最佳响应
        score = 1 - self.search(board, ..., 1 - max_score)[1]
        board.roll_back(...) # 状态恢复

        if score > max_score:
            max_score = score
            max_score_action = action
        
        # Alpha-Beta 剪枝：若当前分支得分已超过阈值，直接截断后续搜索
        if max_score >= threshold_max:
            return (max_score_action, max_score)
```

- **Zobrist Hashing & Transposition Table**：为了解决搜索过程中的“重叠子问题”，系统实现了基于 Zobrist 散列的置换表。通过随机生成的 64 位整数为每个棋盘状态生成唯一指纹，缓存已搜索深度。它通过位运算 $XOR$ 增量更新棋盘指纹，避免了对相同局面的重复评估：

```python
def gen_key_for_action(self, previous_lock, previous_key, action):
    # 利用异或(XOR)运算的自反性，仅更新变动位置的哈希值
    id_from = self.get_id(action.item, action.from_)
    id_to = self.get_id(action.item, action.to_)
    
    # 移出原位、移入新位、处理被捕获棋子
    previous_key = previous_key ^ self.key_list[id_from] ^ self.key_list[id_to]
    if action.captured_item:
        id_captured = self.get_id(action.captured_item, action.to_)
        previous_key = previous_key ^ self.key_list[id_captured]
    return (previous_lock, previous_key)
```

#### **3.2 全栈通信与状态同步策略**

项目采用了 **RESTful API** 进行前后端通信，并针对分布式环境下特有的异步特性设计了同步方案：

- **Stateless vs. Stateful 冲突解决**：后端 FastAPI 维护长连接下的游戏上下文，前端 React 采用受控组件模型。通过 Pydantic 规范化数据模型，确保坐标系（Coordinate System）在 JSON 序列化过程中不发生极性反转。
- **乐观 UI 更新机制**：前端在发起网络请求前预先移动棋子，若后端校验失败（如 session 超时或非法走子），通过状态回滚（State Rollback）确保视图与逻辑核的高度一致。

```python
const handleSquareClick = async (x, y) => {
  const prevBoardState = { ...board }; // 步骤1：捕获当前棋盘快照（备份）
  const newBoard = { ...board };
  // ...执行前端走子逻辑...
  setBoard(newBoard); // 步骤2：乐观更新，先让用户看到棋子移动

  try {
    const response = await fetch('/api/move', { method: 'POST', ... }); // 步骤3：发起异步请求
    const data = await response.json();
    
    if (data.status === 'success') {
      // 应用 AI 的反击步骤
    } else {
      // 步骤4：后端校验失败（如 session 失步），强制回滚
      setBoard(prevBoardState); 
      alert("同步异常，已自动复位对局。");
    }
  } catch (error) {
    setBoard(prevBoardState); // 网络异常回滚
  }
};
```

**通信层实现**：系统采用了基于 **FastAPI** 的 **RESTful 架构**。前端 React 应用通过异步 **fetch** 机制，将玩家的操作序列化为 **JSON** 报文，发送至后端的 `/api/move` 路由。后端逻辑核在处理完 A-B 剪枝搜索后，将 AI 的响应封装为标准的响应对象返回。这种架构不仅实现了 UI 与逻辑的解耦，也为后续接入 **云端 GPU 集群** 进行深度学习推理（Phase 3）铺平了道路。

## 4. 第三阶段技术实现：深度学习驱动的评估器重构 (Phase 3: Deep Learning & Neural Evaluation)

在传统的博弈引擎中，静态评估函数依赖于人类预设的权值，这在处理具备高度动态性的中国象棋阵型时显现出逻辑上的死板。为解决这一痛点，本项目在 Phase 3 引入了基于 **卷积神经网络（CNN）** 的评估模型，旨在通过特征提取（Feature Extraction）模拟人类棋手的“大局观”。

### 4.1 棋盘表征：从逻辑坐标到张量（Tensorization）

神经网络无法直接理解棋子的逻辑对象，必须将其转化为高维张量。系统通过 `BoardConverter` 类实现“视神经”功能：

- **输入维度**：构建了一个 $14 \times 10 \times 9$ 的多维张量。
- **特征平面（Channels）**：将棋盘拆分为 14 个通道（对应红黑双方各 7 种兵种）。每个通道是一个二值化矩阵，标记特定棋子的空间分布。这种独热编码（One-Hot Encoding）的方式保留了棋盘的**空间局部性（Spatial Locality）**。

```python
# 在 ChineseChessNNEvaluator.py 中，我们将棋盘映射为特征平面
tensor = np.zeros((14, 10, 9), dtype=np.float32)
# 遍历棋子，点亮对应通道
for item in board.items.values():
    channel_idx = type_to_index[item.type_]
    if item.side == ChineseChessSide.UP: channel_idx += 7 # 黑方通道偏移
    tensor[channel_idx][loc.y][loc.x] = 1.0
```

### 4.2 模型架构：卷积神经网络（ChessCNN）

评估器的核心是一个定制的卷积架构 `ChessCNN`，用于提取深层策略特征：

- **卷积层（Convolutional Layers）**：采用 $3 \times 3$ 的卷积核进行多层扫描，用于识别如“重炮”、“连环马”、“屏风马”等跨越多个格子的阵型特征。
- **非线性激活（Non-linear Activation）**：使用 **ReLU** 激活函数引入非线性建模能力，使 AI 能识别复杂的战术组合。
- **决策映射**：全连接层（FC Layers）将空间特征整合为一个标量输出。输出经过 **Tanh** 函数压缩至 $[-1, 1]$ 区间，代表当前局面下红方或黑方的获胜概率直觉。

### 4.3 深度分析：结构完备性与权重的缺失 (Structural vs. Knowledge)

目前 Phase 3 的里程碑在于**成功移植了神经架构**。在 `ChineseChessNNEvaluator` 接入后，AI 的决策逻辑发生了质变：

- **从计算到感知**：AI 不再单纯依赖 $Minimax$ 搜索到的深度，而是通过 `model.forward()` 直接对当前状态进行“盘面感应”。
- **冷启动挑战**：当前的神经网络属于“未启蒙”状态。由于神经元权重（Weights）是随机初始化的，AI 目前处于一种“结构完备但缺乏知识”的状态。

Phase 1 与 Phase 2 确立了系统的**物理逻辑**与**工程链路**，而 Phase 3 则初步搭建了系统的**认知架构**。单纯的搜索算法只能解决“不犯错”的问题，而深度学习评估器才能解决“赢棋”的问题。目前系统已具备接收神经网络指令的能力，解决了全栈交互与模型推理的闭环。

### 5. 局限性与反思 (Retrospective & Reflection)

在开发过程中，我必须正视并记录那些具有代表性的技术瓶颈：

#### **A. 对 2022 年技术断层的诚实回溯**

回看 2022 年的初版设计，当时我在博客中曾设想过 CNN 等深度学习结构。然而，以大二学生当时的知识储备，尚未系统研习深度学习相关课程，面对复杂的张量表征与反向传播算法，确实感到了显著的技术壁垒。**承认当时的无力，是为了更好地定义今日的成长,** 当时的项目更多是完成了工程逻辑的闭环.

#### **B. “地平线效应”与静态评估的僵化**

传统搜索算法受限于搜索深度（通常为 3-5 层），容易出现“长将”或残局死循环的现象。这证明了单纯依赖静态评估函数（如：車 = 90 分）无法表达复杂的动态阵型。

<div style="display: flex; align-items: center; gap: 10px;">
  <span>View my Chinese Chess AI project on GitHub</span>
  <a href="https://github.com/CheongYX/ChineseChessAI-Phase3">
    <img src="https://img.shields.io/badge/GitHub-Repository-black?logo=github" alt="GitHub Repository" style="margin: 0;">
  </a>
</div>

<!-- tab: 问题解决 -->

### 6. 问题解决 (Problem Solving)

在开发过程中，我遇到了两个具有代表性的技术瓶颈，并通过架构优化逐一击破：

#### **问题 A：分布式架构下的前后端状态失步 (State Desynchronization)**

- **现象描述**：在“React 前端 + Python 后端”的架构中，经常出现“棋子位移但在后端判定无效”或“前端刷新后无法继续对局”的现象。
- **技术痛点**：后端 Python 进程是**有状态的（Stateful）**，它在内存中维护着唯一的棋盘对象；而前端 React 是**声明式的**，页面刷新会导致本地状态清空。当两端进度不统一时，前端发送的坐标在后端逻辑中可能是一片空地，导致 `ModuleNotFoundError` 或逻辑报错。
- **解决方案**：
  1. **乐观更新与强制回滚 (Optimistic UI & Rollback)**：前端先执行走子动画，同步发起异步 `fetch` 请求。若后端返回 `Error`（坐标不匹配），前端利用备份的 `prevBoardState` 瞬时回滚棋子位置，确保用户看到的画面永远与后端大脑同步。
  2. **指令锁机制**：引入 `isAiThinking` 状态。在网络请求未返回前，物理性锁定前端交互，防止用户在 AI 计算期间连续操作导致的逻辑堆叠。
  3. **对局唯一性验证**：在 API 返回值中加入 `piece_name` 校验，确保 AI 移动的棋子与前端感知的棋子 ID 严格一致。

#### **问题 B：传统搜索算法的“近视效应”与策略循环 (The Horizon Effect & Repetitive Loop)**

- **现象描述**：AI 在优势局下表现得“不够聪明”，频繁出现“来回长将”或“无效耗时”的走法，无法形成致命一击，甚至在残局阶段陷入死循环。

<video src="/images/chinese_chess_2022/RepetitiveLoop.mp4" autoplay loop muted playsinline width="100%" class="rounded-xl"></video>

- **技术痛点**：
  1. **地平线效应 (Horizon Effect)**：基于 $Minimax$ 结合 $Alpha\text{-}Beta$ 剪枝的算法，受限于搜索深度（通常为 3-5 层）。AI 只能看到数步之内的得分极大值，却看不见更深层面的杀招，导致它认为“反复将军”是维持当前高分的最佳手段。
  2. **评估函数静态化**：现有的评估函数依赖于人工定义的静态分值（如：車 = 90，马 = 40）。这种线性累加无法表达象棋中“势”的变化，AI 缺乏对“牵制”、“闪击”等复杂阵型的感知直觉。
- **解决方案 (算法进化路径)**：
  1. **引入 MCTS（蒙特卡洛树搜索）**：通过大量随机模拟（Rollout）来打破固定深度的限制，利用概率分布发现那些在深层搜索中才能体现的胜机。
  2. **大脑移植（神经网络评估器）**：这是本项目后续的里程碑。我计划通过 **CNN（卷积神经网络）** 替换硬编码的加减法。将棋盘视为图像，让网络自动提取“重炮”、“马后炮”等阵型特征，从而赋予 AI 一种类似人类棋手的“大局观”和“棋感”。
  3. **规则约束惩罚**：在搜索树中加入历史状态检测，对重复出现的局面给予极高的分数惩罚，强制 AI 寻求变化的路径。

“2022 年的这份需求，在当时看来是跨越时代的挑战。它要求开发者在算力与工程的局限中，不仅要复现半个世纪的博弈逻辑，还要用神经网络去模拟那难以捉摸的‘直觉’。”

#### 问题C: **解决“隐形”的硬件性能瓶颈 (Troubleshooting: The "Invisible" Power Bottleneck)**

在 Windows 环境下部署深度学习模型时，遇到了由于 **Modern Standby (S0)** 导致的电源选项缺失问题。操作系统为了维持极低功耗的待机体验，屏蔽了 **PCI Express** 和 **Processor Power Management** 等核心参数。

**Technical Insight (技术洞察)**： 这种屏蔽导致 **PyTorch** 的底层 C++ 算子在初始化 **`c10.dll`** 时，因为无法瞬时获取足够的电压支持而导致初始化例程失败。

**Resolution (解决方案)**：

1. **Registry Hack**: 通过修改 `PlatformAoAcOverride` 注册表项，禁用 **Modern Standby**，强制恢复传统的 ACPI 高级电源管理选项。
2. **OS-Level Graphics Affinity**: 强制指定 Python 解释器在 **High Performance** 模式下运行，绕过系统级的节能限制。

 **终极解决方案：创建纯净的 Conda 实验环境 (Isolated Environment)**

> 在终端执行建立一个专门用于 Phase 3 开发的沙盒：
>
> 1. **创建新环境 (指定 Python 3.10)**：
>
>    ```Bash
>    conda create -n chess_ai python=3.10 -y
>    ```
>
> 2. **激活环境**：
>
>    ```Bash
>    conda activate chess_ai
>    ```
>
> 3. **安装“CPU版”PyTorch (跳过 GPU 驱动冲突)**： *因为你目前的 Phase 3 主要是逻辑开发和初步推理，CPU 版能完美绕过显卡驱动导致的 1114 错误。*
>
>    ```Bash
>    pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cpu
>    ```
>
> 4. **安装其余必要依赖**：
>
>    ```Bash
>    pip install fastapi uvicorn numpy
>    ```

<!-- tab: 最终成果 -->



### 7. 最终成果 (Final Deliverables)

#### 7.1 极简而稳健的全栈对弈终端 (Interactive Full-Stack Terminal)

![对弈页面](/images/chinese_chess_2022/frontend.png)

当前的 UI 摒弃了冗余的视觉元素，回归到最纯粹的监控大屏模式。在前端 React 页面中，系统引入了动态的深度 (Depth)与宽度 (Branch Limit)控制器。这一设计直观地证明了系统架构实现了彻底的解耦：前端仅仅作为一个轻量级的受控视图层（View）与交互引擎，而庞大的博弈树生成、剪枝校验以及状态回溯等高并发算力压力，已经被完美剥离并下放到了 FastAPI 后端集群中处理。

#### 7.2 算法的具象化：决策树离线日志 (Algorithmic Visualization)

传统启发式博弈引擎的思考过程往往是一个“黑盒”。为了打破这种不透明性，并彻底解决前端浏览器在渲染数十万个 DOM 节点时面临的内存溢出瓶颈，我在后端开发了专属的 `AIVisualizer` 落盘引擎。

![决策树](/images/chinese_chess_2022/CYX_20260507_114743/第5回合_Tree.png)

当系统在极深层级（如 Depth=5）进行算力推演时，后端会自动利用 `matplotlib` 渲染出整个 Minimax 决策树的物理全貌并离线归档。这不仅解放了前端性能，更为未来的可解释性 AI（XAI）研究留存了完美的实验快照：

- **红色的剪枝 (✂️ Pruned)**：直观地记录了 Alpha-Beta 窗口成功拦截无意义分支、及时止损的瞬间。
- **黄色的缓存 (⚡ Cache Hit)**：这是 Phase 2 中 Zobrist 散列（置换表）高效运转的视觉证据。它证明了 AI 在深层搜索时，成功通过 64 位哈希指纹“回忆”起了曾经计算过的重叠子问题，直接跳过了海量的重复计算。

#### 7.3 认知的具象化：CNN 视网膜特征捕获 (Grad-CAM Heatmap)

![热力图](/images/chinese_chess_2022/CYX_20260507_114743/第5回合_Heatmap.png)

除了传统的算力推演，系统在 Phase 3 阶段成功注入了卷积神经网络（CNN）。为了直观展现 AI 的“棋感”与“大局观”，系统通过提取模型最后一次卷积层的梯度与特征图，生成了 Grad-CAM 空间注意力热力图。这使得我们能够像观测人类视网膜一样，清晰地看到未训练/训练中的 AI 模型在当前局面下，究竟将注意力集中在了棋盘的哪些关键防区或潜在的杀招路径上。

#### 7.4 终于能看的后台数据 (Backend Performance Logs)

以前写代码，控制台里要么是满屏的报错，要么是乱七八糟的死循环打印。现在，当我在前端走完一步棋，看着后端的终端干干净净地吐出这行运行日志时，真的是满满的踏实感。

```text
[数据落盘] ✅ 第 5 回合 AI 思考树已存档至: .../data/sessions/Player_20260507/第5回合_Tree.png
[数据落盘] ✅ 第 5 回合 AI 热力图已存档至: .../data/sessions/Player_20260507/第5回合_Heatmap.png
[系统监控] 下一步最高的评估分数为 85.00 / 100，计算用时：1.42秒，评估局面 4521 次，使用缓存 1205 次(21.05%)，哈希冲突 0 次。
```

不用扯什么高深的概念，这短短几行字对我来说就证明了两件事：

1. 我写的哈希表（Zobrist Hashing）是真的管用了。21% 的缓存命中率，意味着它硬生生帮 AI 省下了五分之一的“瞎算”时间。

2. 不到 1.5 秒能遍历完快 5000 个局面，说明底层数据结构重写的力气没白费。终于不用再看前端浏览器因为算力爆炸而直接卡死崩溃了。

#### 7.5 结语：一场迟到了四年的重构 (Retrospective & Conclusion)

回看 2022 年大二期末交上去的那个初版作业，满屏的逻辑补丁和当时根本搞不定的“前后端状态失步”，让我现在看都觉得有点脸红。当时在项目报告里硬着头皮写着“本项目引入了神经网络架构”，其实根本不是因为我有多超前的眼光，纯粹是因为那是老师给的硬性得分条件。为了多拿点平时分，我硬生生扯了一通当时连我自己都不明白的张量和反向传播。

时隔四年，用现在的全栈技术把这坨代码重新翻出来重写，其实就是一个给当年那个疯狂给期末作业打补丁的自己“还债”的过程。

承认大二时的局限和为了应付作业的窘迫没什么丢人的。看着现在这个架构清晰、能把几十万节点的决策树画出来、甚至能用热力图“透视”出脑回路的系统，我觉得这四年的坑没白踩。

虽然现在的 Phase 3 还没来得及喂给它大师棋谱，它依然还是个只会按随机权重胡乱打分的“笨小孩”。但无论如何，底座终于搭好了。当年那个交完期末作业、拿了分数就跑路的大二学生，现在终于可以安下心来，慢慢教这个 AI 怎么去赢下一盘真正的象棋了。
