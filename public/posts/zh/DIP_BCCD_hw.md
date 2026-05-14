

<!-- tab: 项目背景 -->

### 作业1：图像透视变换

在图像处理中，透视变换是一种常用的几何变换方法，用于模拟人眼或相机在不同视角下观察同一平面物体时产生的形变效果。本作业要求读取一幅灰度图像，并对其应用透视变换，将任意四边形区域映射为一个正方形区域，从而校正图像的视角或实现特定的视觉效果。通过手动或自动选取四个对应点对，计算变换矩阵并应用插值方法生成变换后的图像，最终展示原始图像与透视变换结果的对比。该作业旨在帮助掌握透视变换的基本原理及其在图像几何校正中的实现方法。

### 作业2：直方图均衡化

直方图均衡化是一种经典的图像增强技术，主要用于提高图像的对比度，尤其是当图像的灰度分布集中在某一狭窄区间时。本作业要求读入一幅灰度图像，计算其灰度直方图，并通过累积分布函数对像素灰度进行重新映射，使得输出图像的灰度尽可能均匀分布在全部灰度级上。最终显示原始图像、其直方图、均衡化后的图像及其直方图。通过该作业，可以深入理解直方图均衡化在改善图像视觉效果中的作用及其数学原理。

### 作业3：图像分割

图像分割是将图像划分为若干具有特定语义或视觉特征的区域的过程，是图像分析与理解的基础。本作业要求读入一幅图像，并采用任意分割算法（建议使用K-means聚类或Mean Shift算法）对图像进行区域分割。K-means基于像素颜色或灰度特征进行聚类，而Mean Shift通过密度梯度上升寻找模式点，两者均可实现无监督的图像分割。作业最终需展示分割后的结果图像。该任务旨在训练实现典型分割算法并理解不同分割策略的适用场景。

### 项目作业：血液细胞检测

血液细胞检测是临床医学检验中的重要手段，不同种类细胞的数量与形态可为疾病诊断提供关键依据。本项目的目标是基于数字图像处理方法，对血液样本图像中的三类细胞——红细胞（RBC）、白细胞（WBC）和血小板（Platelets）——进行自动检测与区域标注。数据集采用公开的BCCD数据集，包含图像及其对应的标注真值。要求不使用神经网络方法，仅采用传统图像处理技术（如形态学操作、阈值分割、轮廓检测、形状特征分类等）实现细胞检测，并以三色框标注不同细胞类型，最终对照标注文件计算准确率。鼓励自行设计算法或改进已有方法，并在报告中明确说明代码中体现的改进部分。本任务旨在综合运用图像分割、特征提取与分类等传统图像处理技术，解决实际医学图像分析问题。

<!-- tab: 作业1：图像透视变换 -->

透视变换的核心是两个分式方程，它们描述了原图坐标 $(x, y)$ 如何映射到目标图坐标 $(x', y')$ ：  
$$
x' = \frac{a_1x + a_2y + a_3}{a_7x + a_8y + 1}
$$

$$
y' = \frac{a_4x + a_5y + a_6}{a_7x + a_8y + 1}
$$

由于这里有 8 个未知参数（$a_1$ 到 $a_8$），需要 **4 对对应点**（即文档中 A-A', B-B' 等 ）来列出 8 个线性方程进行求解。 先消除分式，转为线性形式

1. 对于 $x'$ 方向：$x'(a_7x + a_8y + 1) = a_1x + a_2y + a_3$
2. 对于 $y'$ 方向：$y'(a_7x + a_8y + 1) = a_4x + a_5y + a_6$

展开并整理，让含参数 $a_i$ 的项留在左边，常数项留在右边：

$$
a_1x + a_2y + a_3 - a_7xx' - a_8yx' = x'
$$

$$
a_4x + a_5y + a_6 - a_7xy' - a_8yy' = y'
$$

设有 4 组点 $(x_i, y_i) \to (x'_i, y'_i)$，其中 $i \in \{1, 2, 3, 4\}$，就可以把这 8 个方程写成矩阵形式 $\mathbf{A} \cdot \mathbf{h} = \mathbf{b}$：

$$
\begin{bmatrix} x_1 & y_1 & 1 & 0 & 0 & 0 & -x_1x'_1 & -y_1x'_1 \\ 0 & 0 & 0 & x_1 & y_1 & 1 & -x_1y'_1 & -y_1y'_1 \\ x_2 & y_2 & 1 & 0 & 0 & 0 & -x_2x'_2 & -y_2x'_2 \\ 0 & 0 & 0 & x_2 & y_2 & 1 & -x_2y'_2 & -y_2y'_2 \\ \vdots & \vdots & \vdots & \vdots & \vdots & \vdots & \vdots & \vdots \\ 0 & 0 & 0 & x_4 & y_4 & 1 & -x_4y'_4 & -y_4y'_4 \end{bmatrix} \begin{bmatrix} a_1 \\ a_2 \\ a_3 \\ a_4 \\ a_5 \\ a_6 \\ a_7 \\ a_8 \end{bmatrix} = \begin{bmatrix} x'_1 \\ y'_1 \\ x'_2 \\ y'_2 \\ x'_3 \\ y'_3 \\ x'_4 \\ y'_4 \end{bmatrix}
$$
之后就是求解和应用。在求解参数的代码实现时，可以通过使用线性代数库（如 Python 的 `numpy.linalg.solve`）来解出向量 $\mathbf{h}$。之后就是坐标映射，在有了这 8 个参数，就可以对图像中的任意像素进行变换。但是为了避免变换后的图像出现“空洞”或“锯齿”，考虑使用逆向映射（Inverse Mapping）遍历目标图像的每个点 $(x', y')$，算出它对应的原图位置 $(x, y)$，再通过插值（如双线性插值）获取颜色。

实现双线性插值（Bilinear Interpolation）是图像几何变换中的核心步骤。当通过透视变换公式计算出原图坐标 $(x, y)$ 时，得到的往往是小数（例如 $x=10.4, y=20.6$），而图像像素只存在于整数坐标上。双线性插值通过周围 4 个像素点的加权平均，计算出这个“虚构点”的灰度值。

### **1. 数学原理**

假设我们要计算点 $P(x, y)$ 的值，它周围的四个整数坐标点分别为：

- $Q_{11} = (\lfloor x \rfloor, \lfloor y \rfloor)$ —— 左上
- $Q_{21} = (\lceil x \rceil, \lfloor y \rfloor)$ —— 右上
- $Q_{12} = (\lfloor x \rfloor, \lceil y \rceil)$ —— 左下
- $Q_{22} = (\lceil x \rceil, \lceil y \rceil)$ —— 右下

双线性插值实际上是做了 **3 次线性插值**：

**第一步：在 $x$ 方向进行两次插值**

找到 $P$ 在水平方向投影到 $Q_{11}Q_{21}$ 和 $Q_{12}Q_{22}$ 连线上的两个临时点 $R_1$ 和 $R_2$：
$$
f(R_1) \approx \frac{x_2 - x}{x_2 - x_1} f(Q_{11}) + \frac{x - x_1}{x_2 - x_1} f(Q_{21})
$$

$$
f(R_2) \approx \frac{x_2 - x}{x_2 - x_1} f(Q_{12}) + \frac{x - x_1}{x_2 - x_1} f(Q_{22})
$$

**第二步：在 $y$ 方向进行一次插值**

利用 $R_1$ 和 $R_2$ 的结果，计算最终 $P$ 点的值：
$$
f(P) \approx \frac{y_2 - y}{y_2 - y_1} f(R_1) + \frac{y - y_1}{y_2 - y_1} f(R_2)
$$
由于在像素网格中，$x_2 - x_1 = 1$ 且 $y_2 - y_1 = 1$，公式可以简化为权重的直接相乘。

### **2. 算法实现步骤 (Python 逻辑)**

在实现透视变换的小作业时 ，代码逻辑应该是：  

1. **遍历目标图**的每一个像素点 $(x', y')$。

2. **逆向映射**：利用求得的 $a_1 \dots a_8$ 参数，反向计算其在原图中的坐标 $(x, y)$ 。  

3. **边界检查**：确保 $(x, y)$ 在原图范围内，否则设为黑色。

4. **计算权重**：

   - 令 $u = x - \lfloor x \rfloor$（水平偏移量）
   - 令 $v = y - \lfloor y \rfloor$（垂直偏移量）

5. **加权求和**：
   $$
   f(x, y) = (1-u)(1-v)f(Q_{11}) + u(1-v)f(Q_{21}) + (1-u)vf(Q_{12}) + uvf(Q_{22})
   $$

<div style="display: flex; align-items: center; gap: 10px;">
  <span>View my HW1 on GitHub</span>
  <a href="https://github.com/CheongYX/DIP_Blood-Cell-Detection/tree/main/DigitaImageProcess/HW1">
    <img src="https://img.shields.io/badge/GitHub-Repository-black?logo=github" alt="GitHub Repository" style="margin: 0;">
  </a>
</div>

### 结果展示：

<video src="/public/images/DigitalImageProcess/HW1.mp4" autoplay loop muted playsinline width="100%" class="rounded-xl"></video>

<!-- tab: 作业2：直方图均衡化 -->

假设图像的灰度级是连续变量：

- **$r$**：输入图像的灰度级，范围为 $[0, L-1]$（对于 8 位图像，$L=256$）。
- **$s$**：变换后的输出图像灰度级。
- **$T(r)$**：变换函数，即 $s = T(r)$。

为了保证变换后的图像不失真，变换函数 $T(r)$ 必须满足：

1. 在 $0 \le r \le L-1$ 范围内，$T(r)$ 是单调递增函数（保证原图的明暗次序不变）。
2. 当 $0 \le r \le L-1$ 时，$0 \le T(r) \le L-1$（保证输出值在合法灰度范围内）。

作业中目标是找到一个变换 $T(r)$，使得输出变量 $s$ 的概率密度函数 $p_s(s)$ 是均匀分布的。

根据概率论中随机变量变换的根本定理：

如果 $s = T(r)$，那么 $s$ 的概率密度函数 $p_s(s)$ 可以通过 $r$ 的概率密度函数 $p_r(r)$ 求得：
$$
p_s(s) = p_r(r) \left| \frac{dr}{ds} \right|
$$
由于作业要求希望输出是均匀分布，即在范围 $[0, L-1]$ 内概率处处相等：
$$
p_s(s) = \frac{1}{L-1}
$$
代入公式得：
$$
\frac{1}{L-1} = p_r(r) \left| \frac{dr}{ds} \right|
$$
两边对变量进行整理（由于 $T(r)$ 单调递增，微分项为正）：
$$
ds = (L-1) p_r(r) dr
$$
对等式两边进行积分：
$$
\int_0^s dw = (L-1) \int_0^r p_r(w) dw
$$

$$
s = T(r) = (L-1) \int_0^r p_r(w) dw
$$

**结论：** 变换函数 $T(r)$ 正是原图像灰度级累积分布函数（CDF）的倍数。

接下来就是离散型变量的推导。

在计算机处理中，像素值是离散的。我们需要将积分转换为求和。

1. 输入图像的直方图概率 (PDF)：
   $$
   p_r(r_k) = \frac{n_k}{MN}, \quad k = 0, 1, \dots, L-1
   $$
   其中 $n_k$ 是灰度级 $r_k$ 出现的次数，$MN$ 是总像素数。

2. 累积分布函数 (CDF)：

   通过累加求出到灰度级 $r_k$ 为止的概率和：
   $$
   CDF(r_k) = \sum_{j=0}^{k} p_r(r_j) = \sum_{j=0}^{k} \frac{n_j}{MN}
   $$

3. 映射公式：

   将 CDF 值映射回 $[0, L-1]$ 范围，并取整：
   $$
   s_k = \text{round} \left[ (L-1) \sum_{j=0}^{k} \frac{n_j}{MN} \right]
   $$

- **高概率区域（原图中像素很多的灰度段）**：其 CDF 曲线斜率很大。经过映射后，原本密集的灰度级会被“拉开”，占据更宽的灰度范围。
- **低概率区域（像素很少的灰度段）**：其 CDF 曲线平缓。映射后，这些灰度级会被“压缩”。

这种“损不足而补有余”的策略，会让图像的直方图在宏观上变得平坦，帮助提升视觉上的对比度。

<div style="display: flex; align-items: center; gap: 10px;">
  <span>View my HW2 on GitHub</span>
  <a href="https://github.com/CheongYX/DIP_Blood-Cell-Detection/tree/main/DigitaImageProcess/HW2">
    <img src="https://img.shields.io/badge/GitHub-Repository-black?logo=github" alt="GitHub Repository" style="margin: 0;">
  </a>
</div>

### 结果展示：

<video src="/public/images/DigitalImageProcess/HW2_2.mp4" autoplay loop muted playsinline width="100%" class="rounded-xl"></video>
<video src="/public/images/DigitalImageProcess/HW2_3.mp4" autoplay loop muted playsinline width="100%" class="rounded-xl"></video>

<!-- tab: 作业3：图像分割 -->

考虑到图像分割不仅是颜色的聚类，更是空间实体的提取，我决定放弃传统的一维灰度或三维 RGB 模型，构建一个五维特征空间。

为了消除光照梯度对背景分割的影响，我选择在 **CIELAB** 空间进行推导。在该空间中，亮度 $L$ 与色度 $a, b$ 是解耦的。

每个像素 $i$ 的原始特征表示为：
$$
\mathbf{f}_i = [L_i, a_i, b_i, x_i, y_i]^T
$$
由于坐标系 $(x, y)$ 的数值范围（通常为图像的长宽像素）远大于颜色值（$0-100$ 或 $-128-127$），我意识到如果不进行归一化，空间距离将完全主导聚类结果，导致图像被机械地切成方块。

为了解决这个问题，我引入了 **归一化算子** 和 **空间权重系数 $\lambda$**：

1. **颜色归一化**：将 $L, a, b$ 映射到 $[0, 1]$。
   $$
   L'_i = \frac{L_i}{100}, \quad a'_i = \frac{a_i + 128}{255}, \quad b'_i = \frac{b_i + 128}{255}
   $$

2. **空间归一化与加权**：将坐标映射到 $[0, 1]$ 并乘以 $\lambda$。
   $$
   x'_i = \lambda \cdot \frac{x_i}{W}, \quad y'_i = \lambda \cdot \frac{y_i}{H}
   $$

由此，我得到了最终用于推导的归一化 5D 特征向量：
$$
\mathbf{v}_i = [L'_i, a'_i, b'_i, x'_i, y'_i]^T
$$
为了实现最优分割，我将问题转化为一个最小化簇内误差平方和（SSE）的优化问题。我定义目标函数 $J$ 为所有像素点 $\mathbf{v}_i$ 到其所属类中心 $\boldsymbol{\mu}_j$ 的欧几里得距离平方之和：
$$
J = \sum_{j=1}^{K} \sum_{i \in S_j} \| \mathbf{v}_i - \boldsymbol{\mu}_j \|^2
$$
其中，$K$ 是聚类总数 ，$S_j$ 是第 $j$ 个簇的集合。  

由于 $J$ 的变量包括像素分配关系和中心点位置，我采用迭代优化的方式进行求解。在聚类中心 $\boldsymbol{\mu}_j$ 固定的情况下，为了使 $J$ 最小，对于每个像素 $i$，我必须寻找使其距离最小的 $j$。这在数学上体现为求偏导的离散化搜索：
$$
Label_i = \arg \min_{j} \left( \sum_{d=1}^{5} (v_{i,d} - \mu_{j,d})^2 \right)
$$
在像素归属关系 $S_j$ 固定的情况下，我需要求出使 $J$ 达到极小值的中心点 $\boldsymbol{\mu}_j$。我对 $J$ 关于 $\boldsymbol{\mu}_j$ 求偏导：
$$
\frac{\partial J}{\partial \boldsymbol{\mu}_j} = \frac{\partial}{\partial \boldsymbol{\mu}_j} \sum_{i \in S_j} (\mathbf{v}_i - \boldsymbol{\mu}_j)^T (\mathbf{v}_i - \boldsymbol{\mu}_j)
$$
利用矩阵微分规则 $\frac{\partial (x-a)^T(x-a)}{\partial a} = -2(x-a)$，得到：
$$
\frac{\partial J}{\partial \boldsymbol{\mu}_j} = -2 \sum_{i \in S_j} (\mathbf{v}_i - \boldsymbol{\mu}_j)
$$
令偏导数为 0 以求极值点：
$$
-2 \sum_{i \in S_j} (\mathbf{v}_i - \boldsymbol{\mu}_j) = 0
$$

$$
\sum_{i \in S_j} \mathbf{v}_i - \sum_{i \in S_j} \boldsymbol{\mu}_j = 0
$$

$$
\sum_{i \in S_j} \mathbf{v}_i = N_j \boldsymbol{\mu}_j
$$

最终解得：
$$
\boldsymbol{\mu}_j = \frac{1}{N_j} \sum_{i \in S_j} \mathbf{v}_i
$$
***结论**：新的聚类中心必须是当前簇内所有像素在 5D 空间中的算术平均值。*

之后为了实现老师案例中那种直观的“色彩标签”效果 ，我将最终收敛的 $K$ 个聚类标签映射到一个高对比度的离散调色板中。  输出像素颜色 $C_{out}$ 的逻辑如下：
$$
C_{out}(x, y) = \text{Palette}(Label_{x, y})
$$
这一步将复杂的连续图像信号转化为了具有语义意义的离散对象图。

### 总结

通过上述推导就会实现一个具备空间感知能力的分割模型：

- LAB 转换解决了光照梯度带来的分类破碎问题。
- 归一化 5D 特征平衡了色彩语义与空间距离。
- SSE 目标函数优化确保了分割结果在数学上的局部最优性。

<div style="display: flex; align-items: center; gap: 10px;">
  <span>View my HW3 on GitHub</span>
  <a href="https://github.com/CheongYX/DIP_Blood-Cell-Detection/tree/main/DigitaImageProcess/HW3">
    <img src="https://img.shields.io/badge/GitHub-Repository-black?logo=github" alt="GitHub Repository" style="margin: 0;">
  </a>
</div>

### 结果展示：

<video src="/public/images/DigitalImageProcess/HW3.mp4" autoplay loop muted playsinline width="100%" class="rounded-xl"></video>

<!-- tab: 项目作业: 血液细胞目标检测 -->

# 从理论到工程：基于多特征解耦的血液细胞目标检测

### 1. 初始设想：HW1-3 建立的“理想模型”与现实溃败

在本课程早期的 HW1 到 HW3 中，我系统学习了图像预处理、形态学滤波与阈值分割的基础理论。基于这些“教科书式”的经验，在面对 BCCD 血液细胞检测项目之初，我构思了一条极其线性的基线（Baseline）方案：**灰度化 $\rightarrow$ 全局/局部阈值分割 $\rightarrow$ 形态学开闭运算 $\rightarrow$ 连通域计算。**

当时我寄希望于大津法（Otsu's Method）能完美分离出所有的细胞实体。大津法的底层逻辑是最大化类间方差 $\sigma_B^2$：
$$
\sigma_B^2(k) = \omega_0(k)\omega_1(k)[\mu_0(k) - \mu_1(k)]^2
$$
然而，当我将这套在 HW1-3 中屡试不爽的数学模型应用到真实的 BCCD 医疗数据集中时，却遭遇了惨烈的“滑铁卢”（红细胞 F1-Score 不足 20%，血小板检出率为 0）。我很快发现了理想与现实的巨大鸿沟：

1. **多峰分布打破了 Otsu 的前提：** Otsu 算法假设图像直方图呈双峰分布（非黑即白）。但在真实的 Giemsa 染色涂片中，背景、红细胞（RBC）、白细胞核（WBC）与染色杂质构成了极其复杂的**多峰分布**，单一阈值 $k$ 根本无法实现精准切割。
2. **形态学粘连灾难：** 血液切片中的红细胞存在严重的“钱币状重叠（Overlapping）”，基于简单膨胀腐蚀的连通域检测会将一整团细胞识别为一个单一目标。

所以这时候我的得到的结果是这样的：
![FirstTimeAccuracy](/public/images/DigitalImageProcess/FirstTimeAccuracy.png)

### 2. 范式转换：从“全局分割”到“多维特征解耦”

大津法与后续尝试的分水岭算法（Watershed）的连续受挫，迫使我改变思路：既然单一数学模型无法兼容三种截然不同的细胞，我必须走向“特征驱动与解耦（Feature-Driven Decoupling）”。

我放弃了试图一次性解决所有问题的幻想，转而针对 WBC、RBC 和 Platelets 各自的物理与光学特性，从色彩、几何、空间拓扑三个维度建立了全新的数学验证流水线。

#### 2.1 血小板 (Platelets)：自底向上的形态学与色彩联合认证

在解决血小板漏检问题时，我最初仅依赖面积阈值（Area），却框出了海量的灰尘与噪点。为打破这一瓶颈，我编写了全量数据扫描脚本进行探索性数据分析（EDA），确定了血小板的真实面积边界。

更重要的是，我引入了基于等周定理（Isoperimetric Inequality）的圆度（Circularity）计算模型：
$$
C = \frac{4\pi S}{L^2}
$$
（其中 $S$ 为轮廓面积，$L$ 为轮廓周长）。通过设定 $0.45 < C < 1.4$ 的数学约束，配合凸度（Convexity）与 Solidity 校验，系统有效过滤了拉丝状杂质。随后，将候选区域映射回 HSV 空间进行色相均值（$\mu_H \in [110, 160]$）核验，最终将血小板的精准率从 0% 拉升至 32.53%。

#### 2.2 红细胞 (RBC)：解析几何标尺与 NMS 理性仲裁

为解决红细胞极其严重的粘连问题，我彻底抛弃了基于区域生长的分割法，转而寻求解析几何的帮助——引入霍夫圆变换（Hough Circle Transform）。其核心是将图像空间的边缘像素 $(x,y)$ 映射到参数空间 $(a,b,r)$ 中进行累加器投票：
$$
(x - a)^2 + (y - b)^2 = r^2
$$
为了精准设定参数空间中的搜索半径 $r$，我提取了全量 XML 标注中的 4155 个真实红细胞数据，通过 $r = \sqrt{S / \pi}$ 反推，得出 5%~95% 置信区间下的真实半径域为 $[45, 70]$ 像素。这一基于数据的“物理标尺”大幅收缩了参数搜索空间，极大减少了假阳性。

此外，霍夫变换在处理微小形变红细胞时易产生“多重同心圆”的冗余检测。为此，我引入了现代目标检测中的后处理技术——非极大值抑制（NMS, Non-Maximum Suppression）。基于交并比（Intersection over Union）的几何关系：
$$
IoU = \frac{Area(A \cap B)}{Area(A \cup B)}
$$
当两个候选框的 $IoU$ 超过设定阈值（0.3 或 0.4）时，系统保留置信度（即半径最接近典型值 57px）更高的候选框。霍夫圆变换负责高召回率的“提案”，NMS 负责高精度的“去重”，二者结合使得 RBC 的综合检测能力逼近了传统视觉算法的物理极限。

#### 2.3 白细胞 (WBC)：色彩锚点与空间拓扑排斥

白细胞特征最为稳定。在提取其紫蓝色核后，我利用膨胀算法构建了膨胀半径为 $R=30$ 的拓扑禁区（Halo Mask）。这一简单的空间逻辑计算，构建了完美的互斥机制，使得后续的 RBC 和 Platelets 检测能够自动免疫白细胞内部区域的干扰，确保了全系统逻辑的严密性。

### 3. 项目总结

从 HW1-3 的“线性调参”，到最终大作业基于数学推导的“多重特征解耦”，我深刻体会到：传统 DIP 算法的威力并不在于 API 的堆砌，而在于将目标的生物物理特性（大小、颜色、重叠度）精准翻译为计算机可执行的数学模型（方差、圆度、交并比）。面对复杂的真实世界数据，基于统计学先验（EDA）的条件约束，远比盲目寻找完美的全局算法更加稳健与可靠。

<div style="display: flex; align-items: center; gap: 10px;">
  <span>View my BCCD Project on GitHub</span>
  <a href="https://github.com/CheongYX/DIP_Blood-Cell-Detection/tree/main/DigitaImageProcess/ProjectBCCD">
    <img src="https://img.shields.io/badge/GitHub-Repository-black?logo=github" alt="GitHub Repository" style="margin: 0;">
  </a>
</div>

### 结果展示：

![结果展示](/public/images/DigitalImageProcess/final_result.png)