<!-- tab: Project Background -->

### Homework 1: Image Perspective Transformation

In image processing, perspective transformation is a commonly used geometric transformation method that simulates the deformation effect when the human eye or a camera observes a planar object from different viewpoints. This assignment requires reading a grayscale image, applying a perspective transformation to map an arbitrary quadrilateral region to a square region, thereby correcting the image perspective or achieving specific visual effects. By manually or automatically selecting four pairs of corresponding points, calculating the transformation matrix, and applying interpolation methods to generate the transformed image, the final output should show the original image alongside the perspective-transformed result. This assignment aims to help master the fundamental principles of perspective transformation and its implementation in image geometric correction.

### Homework 2: Histogram Equalization

Histogram equalization is a classic image enhancement technique primarily used to improve image contrast, especially when the grayscale distribution of an image is concentrated in a narrow range. This assignment requires reading a grayscale image, computing its grayscale histogram, and remapping pixel intensities using the cumulative distribution function so that the output image's grayscale levels are as uniformly distributed as possible across the entire range. The final output should display the original image, its histogram, the equalized image, and its histogram. Through this assignment, you can gain a deep understanding of the role of histogram equalization in improving image visual quality and its mathematical principles.

### Homework 3: Image Segmentation

Image segmentation is the process of partitioning an image into regions with specific semantic or visual characteristics and serves as the foundation for image analysis and understanding. This assignment requires reading an image and applying any segmentation algorithm (K-means clustering or Mean Shift algorithm is recommended) for region segmentation. K-means clusters pixels based on color or grayscale features, while Mean Shift finds mode points through density gradient ascent; both can achieve unsupervised image segmentation. The final output should display the segmented result image. This task aims to train the implementation of typical segmentation algorithms and understand the applicable scenarios of different segmentation strategies.

### Project: Blood Cell Detection

Blood cell detection is an important tool in clinical medical testing. The count and morphology of different cell types provide critical evidence for disease diagnosis. The goal of this project is to automatically detect and annotate three types of cells—Red Blood Cells (RBC), White Blood Cells (WBC), and Platelets—in blood sample images using digital image processing methods. The dataset used is the publicly available BCCD dataset, which includes images and their corresponding ground truth annotations. Neural network methods are not allowed; only traditional image processing techniques (e.g., morphological operations, threshold segmentation, contour detection, shape-based classification, etc.) should be used for cell detection. Different cell types should be annotated with three-colored bounding boxes, and the final accuracy should be calculated against the annotation files. You are encouraged to design your own algorithms or improve existing methods and clearly indicate the improvements in the code within the report. This task aims to comprehensively apply traditional image processing techniques such as image segmentation, feature extraction, and classification to solve real-world medical image analysis problems.

<!-- tab: Homework 1: Image Perspective Transformation -->

The core of perspective transformation consists of two fractional equations that describe how the original image coordinates $(x, y)$ map to the target image coordinates $(x', y')$:
$$
x' = \frac{a_1x + a_2y + a_3}{a_7x + a_8y + 1}
$$

$$
y' = \frac{a_4x + a_5y + a_6}{a_7x + a_8y + 1}
$$

Since there are 8 unknown parameters ($a_1$ through $a_8$), **4 pairs of corresponding points** (i.e., A-A', B-B', etc. as mentioned in the document) are needed to formulate 8 linear equations for the solution. First, eliminate the fractions to convert them into linear form:

1. For the $x'$ direction: $x'(a_7x + a_8y + 1) = a_1x + a_2y + a_3$
2. For the $y'$ direction: $y'(a_7x + a_8y + 1) = a_4x + a_5y + a_6$

Expand and rearrange so that terms containing the parameters $a_i$ remain on the left side and constant terms on the right side:

$$
a_1x + a_2y + a_3 - a_7xx' - a_8yx' = x'
$$

$$
a_4x + a_5y + a_6 - a_7xy' - a_8yy' = y'
$$

Given 4 point pairs $(x_i, y_i) \to (x'_i, y'_i)$, where $i \in \{1, 2, 3, 4\}$, these 8 equations can be written in matrix form $\mathbf{A} \cdot \mathbf{h} = \mathbf{b}$:

$$
\begin{bmatrix} x_1 & y_1 & 1 & 0 & 0 & 0 & -x_1x'_1 & -y_1x'_1 \\ 0 & 0 & 0 & x_1 & y_1 & 1 & -x_1y'_1 & -y_1y'_1 \\ x_2 & y_2 & 1 & 0 & 0 & 0 & -x_2x'_2 & -y_2x'_2 \\ 0 & 0 & 0 & x_2 & y_2 & 1 & -x_2y'_2 & -y_2y'_2 \\ \vdots & \vdots & \vdots & \vdots & \vdots & \vdots & \vdots & \vdots \\ 0 & 0 & 0 & x_4 & y_4 & 1 & -x_4y'_4 & -y_4y'_4 \end{bmatrix} \begin{bmatrix} a_1 \\ a_2 \\ a_3 \\ a_4 \\ a_5 \\ a_6 \\ a_7 \\ a_8 \end{bmatrix} = \begin{bmatrix} x'_1 \\ y'_1 \\ x'_2 \\ y'_2 \\ x'_3 \\ y'_3 \\ x'_4 \\ y'_4 \end{bmatrix}
$$
The next steps are solving and applying. When implementing the parameter solving in code, a linear algebra library (such as Python's `numpy.linalg.solve`) can be used to solve for the vector $\mathbf{h}$. After obtaining these 8 parameters, any pixel in the image can be transformed. However, to avoid "holes" or "aliasing" in the transformed image, inverse mapping is used: traverse each point $(x', y')$ in the target image, compute its corresponding original image position $(x, y)$, and then obtain the color through interpolation (e.g., bilinear interpolation).

Implementing bilinear interpolation is a core step in image geometric transformations. When the perspective transformation formula yields original image coordinates $(x, y)$ that are often fractional (e.g., $x=10.4, y=20.6$), while image pixels exist only at integer coordinates, bilinear interpolation computes the grayscale value of this "virtual point" by taking a weighted average of the four surrounding integer-coordinate pixels.

### **1. Mathematical Principle**

Suppose we want to compute the value of point $P(x, y)$. The four surrounding integer-coordinate points are:

- $Q_{11} = (\lfloor x \rfloor, \lfloor y \rfloor)$ — top-left
- $Q_{21} = (\lceil x \rceil, \lfloor y \rfloor)$ — top-right
- $Q_{12} = (\lfloor x \rfloor, \lceil y \rceil)$ — bottom-left
- $Q_{22} = (\lceil x \rceil, \lceil y \rceil)$ — bottom-right

Bilinear interpolation essentially performs **3 linear interpolations**:

**Step 1: Perform two interpolations in the $x$ direction**

Find the two temporary points $R_1$ and $R_2$ where $P$ projects onto the lines connecting $Q_{11}Q_{21}$ and $Q_{12}Q_{22}$ horizontally:
$$
f(R_1) \approx \frac{x_2 - x}{x_2 - x_1} f(Q_{11}) + \frac{x - x_1}{x_2 - x_1} f(Q_{21})
$$

$$
f(R_2) \approx \frac{x_2 - x}{x_2 - x_1} f(Q_{12}) + \frac{x - x_1}{x_2 - x_1} f(Q_{22})
$$

**Step 2: Perform one interpolation in the $y$ direction**

Using the results of $R_1$ and $R_2$, compute the final value at point $P$:
$$
f(P) \approx \frac{y_2 - y}{y_2 - y_1} f(R_1) + \frac{y - y_1}{y_2 - y_1} f(R_2)
$$
Since in the pixel grid $x_2 - x_1 = 1$ and $y_2 - y_1 = 1$, the formula simplifies to direct multiplication of weights.

### **2. Algorithm Implementation Steps (Python Logic)**

When implementing the small perspective transformation assignment, the code logic should be:

1. **Traverse each pixel point $(x', y')$ in the target image**.

2. **Inverse mapping**: Use the obtained parameters $a_1 \dots a_8$ to compute its corresponding coordinate $(x, y)$ in the original image.

3. **Boundary check**: Ensure $(x, y)$ is within the original image boundaries; otherwise, set it to black.

4. **Compute weights**:

   - Let $u = x - \lfloor x \rfloor$ (horizontal offset)
   - Let $v = y - \lfloor y \rfloor$ (vertical offset)

5. **Weighted summation**:
   $$
   f(x, y) = (1-u)(1-v)f(Q_{11}) + u(1-v)f(Q_{21}) + (1-u)vf(Q_{12}) + uvf(Q_{22})
   $$

<div style="display: flex; align-items: center; gap: 10px;">
  <span>View my HW1 on GitHub</span>
  <a href="https://github.com/CheongYX/DIP_Blood-Cell-Detection/tree/main/DigitaImageProcess/HW1">
    <img src="https://img.shields.io/badge/GitHub-Repository-black?logo=github" alt="GitHub Repository" style="margin: 0;">
  </a>
</div>

### Results:

<video src="/images/DigitalImageProcess/HW1.mp4" autoplay loop muted playsinline width="100%" class="rounded-xl"></video>

<!-- tab: Homework 2: Histogram Equalization -->

Assume the grayscale levels of the image are continuous variables:

- **$r$**: Input image grayscale level, range $[0, L-1]$ (for 8-bit images, $L=256$).
- **$s$**: Output image grayscale level after transformation.
- **$T(r)$**: Transformation function, i.e., $s = T(r)$.

To ensure the transformed image is not distorted, the transformation function $T(r)$ must satisfy:

1. Within the range $0 \le r \le L-1$, $T(r)$ is monotonically increasing (to preserve the original brightness order).
2. When $0 \le r \le L-1$, $0 \le T(r) \le L-1$ (to ensure output values are within the legal grayscale range).

The goal of this assignment is to find a transformation $T(r)$ such that the probability density function $p_s(s)$ of the output variable $s$ is uniformly distributed.

According to the fundamental theorem of random variable transformation in probability theory:

If $s = T(r)$, then the probability density function $p_s(s)$ of $s$ can be derived from the probability density function $p_r(r)$ of $r$:
$$
p_s(s) = p_r(r) \left| \frac{dr}{ds} \right|
$$
Since the assignment requires the output to be uniformly distributed over the range $[0, L-1]$:
$$
p_s(s) = \frac{1}{L-1}
$$
Substituting into the formula:
$$
\frac{1}{L-1} = p_r(r) \left| \frac{dr}{ds} \right|
$$
Rearranging (since $T(r)$ is monotonically increasing, the differential term is positive):
$$
ds = (L-1) p_r(r) dr
$$
Integrating both sides:
$$
\int_0^s dw = (L-1) \int_0^r p_r(w) dw
$$

$$
s = T(r) = (L-1) \int_0^r p_r(w) dw
$$

**Conclusion:** The transformation function $T(r)$ is exactly the scaled cumulative distribution function (CDF) of the original image's grayscale levels.

Next is the derivation for discrete variables.

In computer processing, pixel values are discrete. We need to convert the integral into a summation.

1. Input image histogram probability (PDF):
   $$
   p_r(r_k) = \frac{n_k}{MN}, \quad k = 0, 1, \dots, L-1
   $$
   where $n_k$ is the number of occurrences of grayscale level $r_k$, and $MN$ is the total number of pixels.

2. Cumulative distribution function (CDF):

   Compute the cumulative probability up to grayscale level $r_k$:
   $$
   CDF(r_k) = \sum_{j=0}^{k} p_r(r_j) = \sum_{j=0}^{k} \frac{n_j}{MN}
   $$

3. Mapping formula:

   Map the CDF values back to the $[0, L-1]$ range and round:
   $$
   s_k = \text{round} \left[ (L-1) \sum_{j=0}^{k} \frac{n_j}{MN} \right]
   $$

- **High-probability regions (grayscale ranges with many pixels)**: The CDF curve has a steep slope. After mapping, the originally dense grayscale levels are "stretched" to occupy a wider grayscale range.
- **Low-probability regions (grayscale ranges with few pixels)**: The CDF curve is flat. After mapping, these grayscale levels are "compressed."

This strategy of "taking from the rich and giving to the poor" makes the image histogram become flat at a macro level, helping to improve visual contrast.

<div style="display: flex; align-items: center; gap: 10px;">
  <span>View my HW2 on GitHub</span>
  <a href="https://github.com/CheongYX/DIP_Blood-Cell-Detection/tree/main/DigitaImageProcess/HW2">
    <img src="https://img.shields.io/badge/GitHub-Repository-black?logo=github" alt="GitHub Repository" style="margin: 0;">
  </a>
</div>

### Results:

<video src="/images/DigitalImageProcess/HW2_2.mp4" autoplay loop muted playsinline width="100%" class="rounded-xl"></video>
<video src="/images/DigitalImageProcess/HW2_3.mp4" autoplay loop muted playsinline width="100%" class="rounded-xl"></video>

<!-- tab: Homework 3: Image Segmentation -->

Considering that image segmentation is not just color clustering but also the extraction of spatial entities, I decided to abandon the traditional one-dimensional grayscale or three-dimensional RGB models and construct a five-dimensional feature space.

To eliminate the influence of lighting gradients on background segmentation, I chose to derive the solution in the **CIELAB** space. In this space, luminosity $L$ is decoupled from chrominance $a, b$.

The original feature representation for each pixel $i$ is:
$$
\mathbf{f}_i = [L_i, a_i, b_i, x_i, y_i]^T
$$
Since the numerical range of the coordinates $(x, y)$ (typically the pixel width and height of the image) is much larger than the color values ($0-100$ or $-128-127$), I realized that without normalization, the spatial distance would completely dominate the clustering results, leading to the image being mechanically cut into blocks.

To solve this problem, I introduced a **normalization operator** and a **spatial weight coefficient $\lambda$**:

1. **Color normalization**: Map $L, a, b$ to $[0, 1]$.
   $$
   L'_i = \frac{L_i}{100}, \quad a'_i = \frac{a_i + 128}{255}, \quad b'_i = \frac{b_i + 128}{255}
   $$

2. **Spatial normalization and weighting**: Map coordinates to $[0, 1]$ and multiply by $\lambda$.
   $$
   x'_i = \lambda \cdot \frac{x_i}{W}, \quad y'_i = \lambda \cdot \frac{y_i}{H}
   $$

Thus, I obtained the normalized 5D feature vector used for the derivation:
$$
\mathbf{v}_i = [L'_i, a'_i, b'_i, x'_i, y'_i]^T
$$
To achieve optimal segmentation, I transformed the problem into an optimization problem of minimizing the sum of squared errors (SSE) within clusters. I defined the objective function $J$ as the sum of squared Euclidean distances from all pixel points $\mathbf{v}_i$ to their respective cluster centers $\boldsymbol{\mu}_j$:
$$
J = \sum_{j=1}^{K} \sum_{i \in S_j} \| \mathbf{v}_i - \boldsymbol{\mu}_j \|^2
$$
where $K$ is the total number of clusters and $S_j$ is the set of points in the $j$-th cluster.

Since the variables of $J$ include pixel assignments and center positions, I used an iterative optimization approach. With the cluster centers $\boldsymbol{\mu}_j$ fixed, to minimize $J$, for each pixel $i$, I must find the $j$ that minimizes its distance. This is mathematically expressed as a discrete search for the partial derivative:
$$
Label_i = \arg \min_{j} \left( \sum_{d=1}^{5} (v_{i,d} - \mu_{j,d})^2 \right)
$$
With the pixel assignments $S_j$ fixed, I need to find the center points $\boldsymbol{\mu}_j$ that minimize $J$. I take the partial derivative of $J$ with respect to $\boldsymbol{\mu}_j$:
$$
\frac{\partial J}{\partial \boldsymbol{\mu}_j} = \frac{\partial}{\partial \boldsymbol{\mu}_j} \sum_{i \in S_j} (\mathbf{v}_i - \boldsymbol{\mu}_j)^T (\mathbf{v}_i - \boldsymbol{\mu}_j)
$$
Using the matrix differentiation rule $\frac{\partial (x-a)^T(x-a)}{\partial a} = -2(x-a)$, we obtain:
$$
\frac{\partial J}{\partial \boldsymbol{\mu}_j} = -2 \sum_{i \in S_j} (\mathbf{v}_i - \boldsymbol{\mu}_j)
$$
Set the partial derivative to zero to find the extremum point:
$$
-2 \sum_{i \in S_j} (\mathbf{v}_i - \boldsymbol{\mu}_j) = 0
$$

$$
\sum_{i \in S_j} \mathbf{v}_i - \sum_{i \in S_j} \boldsymbol{\mu}_j = 0
$$

$$
\sum_{i \in S_j} \mathbf{v}_i = N_j \boldsymbol{\mu}_j
$$

Finally, solving yields:
$$
\boldsymbol{\mu}_j = \frac{1}{N_j} \sum_{i \in S_j} \mathbf{v}_i
$$
***Conclusion**: The new cluster center must be the arithmetic mean, in the 5D space, of all pixels within the current cluster.*

Later, to achieve the intuitive "color label" effect as shown in the instructor's examples, I mapped the final converged $K$ cluster labels to a high-contrast discrete color palette. The logic for output pixel color $C_{out}$ is:
$$
C_{out}(x, y) = \text{Palette}(Label_{x, y})
$$
This step converts the complex continuous image signal into a semantically meaningful discrete object map.

### Summary

Through the above derivation, a segmentation model with spatial awareness is implemented:

- LAB conversion solves the fragmentation problem caused by lighting gradients.
- Normalized 5D features balance color semantics and spatial distance.
- SSE objective function optimization ensures mathematically local optimality of the segmentation results.

<div style="display: flex; align-items: center; gap: 10px;">
  <span>View my HW3 on GitHub</span>
  <a href="https://github.com/CheongYX/DIP_Blood-Cell-Detection/tree/main/DigitaImageProcess/HW3">
    <img src="https://img.shields.io/badge/GitHub-Repository-black?logo=github" alt="GitHub Repository" style="margin: 0;">
  </a>
</div>

### Results:

<video src="/images/DigitalImageProcess/HW3.mp4" autoplay loop muted playsinline width="100%" class="rounded-xl"></video>

<!-- tab: Project: Blood Cell Target Detection -->

# From Theory to Engineering: Blood Cell Target Detection Based on Multi-Feature Decoupling

### 1. Initial Conception: The "Ideal Model" from HW1-3 and Its Real-World Collapse

In the early homeworks HW1 through HW3, I systematically learned the basic theories of image preprocessing, morphological filtering, and threshold segmentation. Based on this "textbook-like" experience, at the beginning of the BCCD blood cell detection project, I conceived a highly linear baseline solution: **Grayscale $\rightarrow$ Global/Local Threshold Segmentation $\rightarrow$ Morphological Opening/Closing Operations $\rightarrow$ Connected Component Calculation.**

At the time, I hoped that Otsu's Method would perfectly separate all cell entities. The underlying logic of Otsu's Method is to maximize the between-class variance $\sigma_B^2$:
$$
\sigma_B^2(k) = \omega_0(k)\omega_1(k)[\mu_0(k) - \mu_1(k)]^2
$$
However, when I applied this mathematical model, which had been consistently successful in HW1-3, to the real-world BCCD medical dataset, I encountered a disastrous "Waterloo" (RBC F1-Score below 20%, platelet detection rate 0%). I quickly discovered the huge gap between ideal and reality:

1. **Multimodal distribution breaks Otsu's assumption:** The Otsu algorithm assumes that the image histogram has a bimodal distribution (black and white). But in a real-world Giemsa-stained smear, the background, red blood cells (RBC), white blood cell nuclei (WBC), and staining impurities constitute a highly complex **multimodal distribution**, making it impossible for a single threshold $k$ to achieve precise segmentation.
2. **Morphological adhesion disaster:** Red blood cells in blood smears exhibit severe "rouleaux formation (overlapping)." Connected component detection based on simple dilation and erosion would recognize an entire cluster of cells as a single target.

So at that time, the results I obtained looked like this:
![FirstTimeAccuracy](/images/DigitalImageProcess/FirstTimeAccuracy.png)

### 2. Paradigm Shift: From "Global Segmentation" to "Multi-dimensional Feature Decoupling"

The continuous setbacks with Otsu's Method and the subsequent attempts with the Watershed algorithm forced me to change my approach: Since no single mathematical model can accommodate three distinctly different cell types, I had to move toward "feature-driven decoupling."

I abandoned the illusion of trying to solve everything at once and instead targeted the physical and optical characteristics of WBCs, RBCs, and Platelets, establishing a new mathematical validation pipeline from three dimensions: color, geometry, and spatial topology.

#### 2.1 Platelets: Bottom-up Morphological and Color Joint Authentication

When solving the problem of missed platelet detection, I initially relied solely on area thresholding, which flagged a large number of dust particles and noise. To break through this bottleneck, I wrote a full-data scanning script for exploratory data analysis (EDA) to determine the true area boundaries of platelets.

More importantly, I introduced a circularity calculation model based on the isoperimetric inequality:
$$
C = \frac{4\pi S}{L^2}
$$
(where $S$ is the contour area and $L$ is the contour perimeter). By setting a mathematical constraint of $0.45 < C < 1.4$, combined with convexity and solidity checks, the system effectively filtered out filamentous impurities. Subsequently, the candidate regions were mapped back to the HSV space for hue mean ($\mu_H \in [110, 160]$) verification, ultimately raising platelet precision from 0% to 32.53%.

#### 2.2 Red Blood Cells (RBC): Analytical Geometry Ruler and NMS Rational Arbitration

To solve the extremely severe adhesion problem of RBCs, I completely abandoned segmentation methods based on region growing and instead sought help from analytical geometry—introducing the Hough Circle Transform. Its core is to map edge pixels $(x,y)$ in the image space to the parameter space $(a,b,r)$ for accumulator voting:
$$
(x - a)^2 + (y - b)^2 = r^2
$$
To accurately set the search radius $r$ in the parameter space, I extracted 4155 real RBC data points from the full XML annotations and, through $r = \sqrt{S / \pi}$, derived the true radius range under the 5%-95% confidence interval as $[45, 70]$ pixels. This data-based "physical ruler" significantly reduced the parameter search space, greatly minimizing false positives.

Additionally, when dealing with slightly deformed RBCs, the Hough transform tends to produce redundant "concentric circle" detections. To address this, I introduced a post-processing technique from modern object detection—Non-Maximum Suppression (NMS). Based on the geometric relationship of Intersection over Union (IoU):
$$
IoU = \frac{Area(A \cap B)}{Area(A \cup B)}
$$
When the $IoU$ of two candidate bounding boxes exceeds a set threshold (0.3 or 0.4), the system retains the candidate with higher confidence (i.e., the one whose radius is closest to the typical value of 57px). The Hough Circle Transform is responsible for high-recall "proposals," while NMS is responsible for high-precision "deduplication." The combination of the two pushed the comprehensive detection capability of RBCs to the physical limits of traditional vision algorithms.

#### 2.3 White Blood Cells (WBC): Color Anchor and Spatial Topological Exclusion

WBCs have the most stable characteristics. After extracting their purplish-blue nuclei, I used a dilation algorithm to construct a topological exclusion zone (Halo Mask) with a dilation radius of $R=30$. This simple spatial logical computation created a perfect mutual exclusion mechanism, enabling subsequent RBC and platelet detection to automatically avoid interference from regions inside WBCs, ensuring the logical rigor of the entire system.

### 3. Project Summary

From the "linear parameter tuning" of HW1-3 to the final project's "multi-feature decoupling" based on mathematical derivation, I deeply realized that the power of traditional DIP algorithms does not lie in the piling up of APIs, but in accurately translating the biophysical characteristics of targets (size, color, degree of overlap) into computer-executable mathematical models (variance, circularity, IoU). When faced with complex real-world data, conditional constraints based on statistical priors (EDA) are far more robust and reliable than blindly searching for a perfect global algorithm.

<div style="display: flex; align-items: center; gap: 10px;">
  <span>View my BCCD Project on GitHub</span>
  <a href="https://github.com/CheongYX/DIP_Blood-Cell-Detection/tree/main/DigitaImageProcess/ProjectBCCD">
    <img src="https://img.shields.io/badge/GitHub-Repository-black?logo=github" alt="GitHub Repository" style="margin: 0;">
  </a>
</div>

### Results:

![Result Display](/images/DigitalImageProcess/final_result.png)