---

**Title: From Zero to Hero: A Complete Guide to Convolution – Multiplication, Dot Product, and Convolution**

*Date: 2026-07-08*

*Categories: [Deep Learning]*

---

> A complete beginner's guide to convolution. No advanced math background required – just a willingness to follow along step by step.

---

## Preface: Why This Blog Exists

If you search "convolution" online, you'll see a scary formula:

$$
y[n] = \sum_{k=-\infty}^{\infty} x[k] \cdot h[n-k]
$$

And then you're lost.

What is this formula really saying? Why do you flip one sequence? Why do you slide it? Where does that `-1` come from?

**The goal of this blog is simple: help you understand convolution without looking at formulas first. Then when you go back to the formula, you'll realize it's just describing something very natural.**

After reading this, you'll fully understand:
- The difference between multiplication, dot product, and convolution
- What each step of convolution actually does
- Why we flip and why we slide
- Why the output length is `len(a) + len(b) - 1`
- What convolution is used for in the real world

---

## Chapter 1: It All Starts with "Multiplication"

### 1.1 Ordinary Multiplication: The Simplest Thing

We all learned multiplication as kids:

$$
3 \times 4 = 12
$$

Two **numbers** (mathematically called "scalars") multiplied together to produce a **number**.

**Key characteristics:**
- Operands: number × number
- Result: a single number
- No direction, no order (3×4 = 4×3)
- Meaning: scaling (enlarging or shrinking a quantity)

**Real-life examples:**
- \$10/lb × 3 lbs = \$30 (total price)
- 5m × 4m = 20m² (area)
- Enlarging an image by 2×

This is the simplest operation, and the foundation of everything else.

### 1.2 The Concept of Arrays and Vectors

Before we talk about dot products, we need to understand one concept: **vectors** (also called "arrays" or "sequences").

A vector is just **an ordered list of numbers**:

$$
\mathbf{a} = [1, 2, 3]
$$

This list has **order** – position 0 is 1, position 1 is 2, position 2 is 3.

Why emphasize order? Because the operations you're about to see depend heavily on it.

---

## Chapter 2: Dot Product – One-Time Similarity Detection

### 2.1 How to Compute the Dot Product

The rule for dot product: **multiply corresponding positions, then sum everything up.**

Given two vectors:
$$
\mathbf{a} = [1, 2, 3], \quad \mathbf{b} = [4, 5, 6]
$$

Their dot product is:
$$
\mathbf{a} \cdot \mathbf{b} = 1 \times 4 + 2 \times 5 + 3 \times 6 = 4 + 10 + 18 = 32
$$

**Critical condition: both vectors must have the same length** – otherwise you can't multiply corresponding positions.

### 2.2 Geometric Meaning of the Dot Product

Geometrically, the dot product measures **how much two vectors point in the same direction**:

- Dot product > 0: roughly the same direction (angle < 90°)
- Dot product = 0: perpendicular (angle = 90°)
- Dot product < 0: opposite directions (angle > 90°)

Simply put: **the larger the dot product, the more similar the two vectors are.**

### 2.3 Use Cases for Dot Product

| Scenario | Specific Application |
|----------|----------------------|
| Machine Learning | Computing similarity between feature vectors (e.g., recommendation systems) |
| Physics | Computing work: Work = Force Vector · Displacement Vector |
| Computer Graphics | Calculating lighting, determining if a surface faces a light source |
| Signal Processing | Determining if two signals are correlated |

### 2.4 Characteristics of Dot Product

- **Two vectors → one number** (information is "compressed")
- **Computed only once**, no sliding
- Measures **overall** similarity, not "where" the similarity occurs

---

## Chapter 3: Convolution – Local, Sliding Similarity Detection

### 3.1 The Core Problem: Limitations of Dot Product

The dot product has a "flaw": it only gives you one number.

If you ask me: "How similar are vector a and vector b?" – the dot product can answer.

But if you ask: "At every position in vector a, how similar is the local patch to vector b?" – the dot product can't answer.

**Convolution solves exactly this: it doesn't ask "how similar overall", it asks "how similar at each position".**

### 3.2 The Four-Word Mantra of Convolution

Convolution is just four steps:

> **Flip → Slide → Multiply → Add**

- **Flip**: Reverse one of the sequences
- **Slide**: Move from the far left to the far right
- **Multiply**: At each stop, multiply corresponding positions
- **Add**: Sum up the products

### 3.3 Complete Step-by-Step Example (The Most Important Section)

Let:
- Input sequence \( x = [1, 2, 3] \) (length 3)
- Kernel \( h = [4, 5] \) (length 2)

We want to compute \( x * h \) ("x convolved with h").

**Step 0: Flip the kernel**

```text
h original = [4, 5]
After flip = [5, 4]
```

**Slide 1: Align to the far left (one position outside)**

```text
Position:   -1    0    1    2
            [5]  [4]          ← flipped kernel
                 [1]  [2]  [3] ← input x

Only overlaps with the number 1
Compute: 5×0 + 4×1 = 4
Result[0] = 4
```

**Slide 2: Shift right by 1**

```text
Position:   -1    0    1    2
                 [5]  [4]     ← flipped kernel
                 [1]  [2]  [3] ← input x

Overlaps with numbers 1 and 2
Compute: 5×1 + 4×2 = 5 + 8 = 13
Result[1] = 13
```

**Slide 3: Shift right by 1 more**

```text
Position:   -1    0    1    2
                      [5]  [4] ← flipped kernel
                 [1]  [2]  [3] ← input x

Overlaps with numbers 2 and 3
Compute: 5×2 + 4×3 = 10 + 12 = 22
Result[2] = 22
```

**Slide 4: Shift right by 1 more (far right)**

```text
Position:   -1    0    1    2
                           [5] [4] ← flipped kernel
                 [1]  [2]  [3]    ← input x

Only overlaps with the number 3
Compute: 5×3 + 4×0 = 15
Result[3] = 15
```

**Final result:**

$$
x * h = [4, 13, 22, 15]
$$

### 3.4 Observation: What's Happening at Each Step

Notice the overlap pattern at each slide:

| Slide | Overlapping positions | Result |
|-------|----------------------|--------|
| Slide 1 | 1 position overlaps | 4 |
| Slide 2 | 2 positions overlap | 13 |
| Slide 3 | 2 positions overlap | 22 |
| Slide 4 | 1 position overlaps | 15 |

**Overlap count pattern: 1 → 2 → 2 → 1**

Each output number is the result of "multiply corresponding positions and sum" at that particular overlap position.

---

## Chapter 4: Why is the Output Length len(a) + len(b) - 1?

This is the most frequently asked question by beginners. Let's understand it in three ways.

### 4.1 Way 1: Count the Slide Positions

The kernel `h` slides from the far left (only 1 position overlapping) to the far right (only 1 position overlapping). How many positions does it stop at?

```text
Slide 1: [ ] [ ]          ← 1 position overlap
            1   2   3

Slide 2:     [ ] [ ]       ← 2 positions overlap
            1   2   3

Slide 3:         [ ] [ ]   ← 2 positions overlap
            1   2   3

Slide 4:             [ ] [ ] ← 1 position overlap
            1   2   3
```

That's **4** positions in total.

Formula: `3 + 2 - 1 = 4`

### 4.2 Way 2: Index Range

- `x` index range: `0, 1, 2` (3 values)
- `h` index range: `0, 1` (2 values)

In the convolution formula $ y[n] = \sum_k x[k] \cdot h[n-k] $:

- Minimum value of `n`: `0`
- Maximum value of `n`: `(3-1) + (2-1) = 2 + 1 = 3`

So `n` goes from `0` to `3` – that's **4** values.

### 4.3 Way 3: Building Blocks Overlap

Imagine two blocks:

```text
x:    [1] [2] [3]      ← length 3
h:    [4] [5]          ← length 2
```

Slide `h` from the left of `x` to the right, counting how many positions have overlap:

- From "just touching" to "just separating"
- Valid positions = `3 + 2 - 1 = 4`

### 4.4 Extending to N Sequences

If you have N sequences to convolve, the universal formula is:

$$
\text{Output Length} = \left( \sum_{i=1}^{N} L_i \right) - N + 1
$$

Where $ L_i $ is the length of the i-th sequence.

Verify:
- 2 sequences: \( L_1 + L_2 - 1 \) ✓
- 3 sequences: \( L_1 + L_2 + L_3 - 2 \) ✓
- 4 sequences: \( L_1 + L_2 + L_3 + L_4 - 3 \) ✓

**Pattern: each additional sequence subtracts one more 1.**

---

## Chapter 5: Why Do We Flip?

You may have noticed: before computing convolution, we flipped `h`.

**Why flip?**

The clearest answer comes from the field of **signal processing**.

### 5.1 Causality

In signal processing, a system can only respond to **past** inputs, not future ones.

Suppose a system has this "memory":

- Current input influence: h[0]
- 1 second ago input influence: h[1]
- 2 seconds ago input influence: h[2]

To compute "current output", you need:
- Current input × h[0]
- 1 second ago input × h[1]
- 2 seconds ago input × h[2]

**Flipping ensures: the last element of the kernel corresponds to the furthest past, and the first element corresponds to the present.**

Without flipping (that's "cross-correlation"), the first element would correspond to the present – which would mean the system is "looking into the future" – physically impossible.

### 5.2 Deep Learning's "Cheat"

In deep learning's Convolutional Neural Networks (CNNs), many implementations **don't flip** – they just do "slide → multiply → add" (which is actually cross-correlation).

But it's still called "convolution" – this is a historical artifact. Since flipping doesn't affect the network's learning ability (the network can adjust weights on its own), people took the shortcut.

**Strictly speaking: what deep learning calls "convolution" is actually "cross-correlation".**

---

## Chapter 6: Why Do We Slide?

This is the key question for understanding the significance of convolution.

### 6.1 The Problem Without Sliding

Without sliding, you can only compare "overall" similarity – which is just the dot product!

```python
# No sliding = one dot product
similarity = sum(x[i] * h[i] for i in range(len(h)))
# Result: a single number, only tells "how similar overall"
```

### 6.2 The Meaning of Sliding

Sliding = asking "how similar is my template to *this position*?" at **every position** individually.

```python
# With sliding = compute at every position
for position in range(len(x) - len(h) + 1):
    score = sum(x[position+i] * h[i] for i in range(len(h)))
    results.append(score)
# Result: a sequence of numbers, tells "how similar at each position"
```

### 6.3 Three Core Functions of Sliding

**Function 1: Local Similarity Detection**

At each slide position, the convolution result is "the matching score between this position and the template". Every number in the output sequence is a score for "how much this position resembles the template".

**Function 2: Preserves Location Information**

Dot product loses order information – it only tells "how similar overall". Convolution tells you "where the similarity is".

**Function 3: Implements Causal Progression (Signal Processing View)**

In signal processing, convolution computes a system's output:

> Current output = sum of (past inputs × corresponding system response weights)

Sliding = time is flowing, the system is "looking back at history".

### 6.4 Everyday Analogy

**Scenario: Finding "apple" in song lyrics**

```text
Lyrics = "I love to eat apples and bananas"
Template = "apple"
```

Without sliding: only look at first two words "I love" → not "apple" → conclusion: not found ❌

With sliding:

```text
Position 1: "I love" → no match
Position 2: "love to" → no match
Position 3: "to eat" → no match
Position 4: "eat apples" → no match
Position 5: "apples" → match! ✓ found it at position 5
Position 6: "and" → no match
...
```

**The meaning of sliding: I don't need to know where "apple" is – I let the template walk through the entire song and find all positions that resemble it.**

---

## Chapter 7: Comparison Summary

### 7.1 Core Comparison Table

| Dimension | Multiplication | Dot Product | Convolution |
|-----------|---------------|-------------|-------------|
| Operands | number × number | vector · vector | sequence * sequence |
| Length requirement | none | must be equal | can be unequal |
| Flip required? | no | no | **must flip one** |
| Slide required? | no | no | **must slide** |
| Computation count | 1 multiplication | multiple multiplications + 1 sum | multiple slides, each with multiplications + sum |
| Result type | a number | a number | a **new sequence** |
| Result length | 1 | 1 | len(a)+len(b)-1 |
| Core meaning | scaling | overall similarity | local matching / system response |
| Commutative? | yes | yes | yes |

### 7.2 Plain English Distinction

> **Multiplication**: number × number = number (scaling)  
> **Dot Product**: vector · vector = number (overall similarity)  
> **Convolution**: sequence * sequence = sequence (local similarity at each position)

### 7.3 Relationship Diagram

```text
         number × number = number  ← Multiplication (simplest)
              ↓
         vector · vector = number  ← Dot Product (one-time multiply + sum)
              ↓
         sequence * sequence = sequence  ← Convolution (slide many times, dot product each time)
```

**The essence of convolution: repeat the "dot product" operation many times (once per slide), and line up all the results.**

---

## Chapter 8: Real-World Applications

### 8.1 Image Processing (CNN)

In Convolutional Neural Networks, a small "kernel" (e.g., 3×3) slides across the entire image to extract features like edges, textures, and shapes.

- Image: `224 × 224 × 3` (RGB three channels)
- Kernel: `3 × 3 × 3`
- Each slide computes one dot product
- Result: a "feature map" (recording "how prominent this feature is at each position")

### 8.2 Audio Processing (Reverb/Echo)

```python
# Adding echo to audio
echo_signal = original_audio * room_impulse_response
```

The room impulse response records "how sound bounces around the room". Convolution combines "sound" with "room characteristics" to produce "sound with echo".

### 8.3 Signal Denoising

A "low-pass filter" (smoothing kernel) convolved with the original signal averages out high-frequency noise, making the signal smoother.

### 8.4 Probability Theory

The probability distribution of the sum of two independent random variables = the convolution of their individual probability distributions.

### 8.5 Computer Vision

- Edge detection (Sobel operator)
- Image blurring (average filtering)
- Image sharpening
- Feature extraction

### 8.6 Moving Average (Stock Analysis)

Sliding windows averaging stock prices to smooth out short-term fluctuations and reveal long-term trends – this is essentially convolution (though without flipping).

---

## Chapter 9: Common Misconceptions

### ❌ Misconception 1: "Convolution is multiplication"

**Wrong!** Convolution = flip + slide + multiply + add – it's a **four-step combination**, not just multiplication.

### ❌ Misconception 2: "Dot product and convolution are the same"

**Wrong!** Dot product is computed **once**, convolution slides and computes **many times**. Convolution results in a sequence; dot product results in a single number.

### ❌ Misconception 3: "Convolution doesn't need flipping"

**Wrong!** Strictly speaking, without flipping it's called **Cross-correlation**, not convolution. What deep learning calls "convolution" is actually cross-correlation.

### ❌ Misconception 4: "Convolution outputs a single number"

**Wrong!** Convolution outputs a **sequence**, longer than both input sequences.

### ❌ Misconception 5: "The output length formula is just len(a)+len(b)-1"

**True but incomplete.** That's only for two sequences. For N sequences, the formula is \( (\sum L_i) - N + 1 \).

## Chapter 10: Remember It with an Everyday Analogy

Imagine you're a **chef**:

| Operation | Everyday Analogy |
|-----------|-------------------|
| **Multiplication** | 1 egg × 3 = 3 eggs (just scaling up the quantity) |
| **Dot Product** | Your "taste preference" (sweet 5, spicy 3) × dish's "flavor profile" (sweet 4, spicy 6) → total match score = 5×4+3×6=38 points (**overall fit**) |
| **Convolution** | Using a small "flavor probe" (template) to **slide across** an entire dish, taking a bite at each position and recording "how good this local patch tastes", producing a "flavor distribution map" (**flavor at each position**) |

## Chapter 11: FAQ

**Q1: Is convolution commutative?**

Yes. \( a * b = b * a \). (Though the flip direction changes.)

**Q2: Is convolution associative?**

Yes. \( (a * b) * c = a * (b * c) \).

**Q3: Is convolution distributive?**

Yes. \( a * (b + c) = a * b + a * c \).

**Q4: Why doesn't deep learning flip for convolution?**

Because in deep learning, the kernel weights are "learned" – flipping or not flipping doesn't affect the network's representational power, so people take the shortcut. Strictly speaking, it's "cross-correlation".

**Q5: What is stride in convolution?**

Stride = how many positions the kernel moves to the right each slide. In the examples above, stride = 1. With stride = 2, the kernel "jumps", producing a shorter output.

**Q6: What is padding?**

Padding = adding zeros to both ends of the input sequence. This keeps the output length the same as the input length, or preserves edge information.

**Q7: How do you calculate 2D convolution output size?**

Image $ H \times W $, kernel $ Kh \times Kw $, stride 1, no padding:

$$
\text{Output Height} = H - Kh + 1, \quad \text{Output Width} = W - Kw + 1
$$

## Conclusion

If you've read this far – congratulations! You now fully understand convolution.

We started from the simplest "multiplication" and step by step arrived at convolution. You now know:

- Multiplication is scaling
- Dot product is "one-time overall similarity"
- Convolution is "sliding local similarity detection"

The core idea of convolution is actually very simple:

> **Use a "template" to "visit" every position in the entire signal, recording how well each position matches.**

Next time you see that scary formula:

$$
y[n] = \sum_{k=-\infty}^{\infty} x[k] \cdot h[n-k]
$$

You'll know: it's just describing "flip → slide → multiply → add".

**Math formulas are just translating natural language into symbolic language. Now you speak both languages.** 😊

## Appendix: English-Chinese Terminology

| English | 中文 |
|---------|------|
| Multiplication | 乘法 |
| Scalar | 标量 |
| Vector | 向量 |
| Dot Product / Inner Product | 内积 / 点积 |
| Convolution | 卷积 |
| Kernel / Filter | 卷积核 / 滤波器 |
| Flip / Reverse | 翻转 |
| Slide | 滑动 |
| Stride | 步长 |
| Padding | 填充 |
| Cross-correlation | 互相关 |
| Input Sequence | 输入序列 |
| Output Sequence | 输出序列 |
| Feature Map | 特征图 |
| Convolutional Neural Network (CNN) | 卷积神经网络 |

---

*If you found this helpful, feel free to share it with others struggling with convolution.*

*Questions or suggestions? Leave a comment below!*
