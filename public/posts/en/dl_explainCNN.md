title: 3. From Convolution to CNN: How One Kernel Becomes an Entire Network
date: 2026-08-21 11:52:38
categories: [Deep Learning]
description: 

---



> A guide that takes you from "knowing how to compute convolution" to "understanding CNNs." No advanced math required—just a willingness to follow along step by step.

## Preface: Where We Are Now

In the previous article, we completely demystified convolution:

> **Convolution = flip a kernel, slide it across the entire signal, compute an inner product at each stop, and line up all the results.**

We worked through a complete hand-computed example with a 1D sequence, seeing every step of "flip → slide → multiply → add."

But one question may have crossed your mind:

**"In the real world, is one kernel enough?"**

If I want to recognize the handwritten digit "5," is a "vertical edge detection kernel" sufficient? Clearly not. "5" contains vertical lines, horizontal lines, and curves—relying on a single kernel is like seeing the world with one eye; you only get part of the picture.

**In a real CNN, there isn't just one kernel—there are dozens, even hundreds, working simultaneously.**

But let's not jump straight to hundreds of kernels. We'll take it one step at a time.

## Chapter 1: From 1D to 2D

### 1.1 Why Do We Need 2D Convolution?

In the previous article, we worked with 1D sequences:

```text
x = [1, 2, 3]
h = [4, 5]
x * h = [4, 13, 22, 15]
```

But real-world data is rarely one-dimensional:

- **Images** are 2D (height × width)
- **Color images** are 3D (height × width × channels)
- **Videos** are 4D (time × height × width × channels)

So we need to upgrade "1D convolution" to "2D convolution."

### 1.2 How 2D Convolution Works

The mantra for 1D convolution is:

> **Flip → Slide → Multiply → Add**

The mantra for 2D convolution adds just one more word:

> **Flip → Slide → Multiply → Add → Fill**

What does the extra "Fill" mean?

In 1D convolution, each slide produces **one number**, and we arrange them in a line in order.

In 2D convolution, each slide also produces **one number**, but we **fill** it into a 2D grid according to its position.

**The essence hasn't changed: each slide is still one inner product. The only difference is that the sliding direction has gone from one to two (left-to-right + top-to-bottom).**

### 1.3 Hands-On Experience: One Kernel Sliding Over an Image

Instead of describing it with words, let's let you operate it yourself.

> **The demo below shows a 3×3 convolution kernel sliding over an image of the handwritten digit "5."**
>
> Every red-highlighted window you see is the current position of the kernel. The formula breakdown panel in the lower right shows the 9 multiplications and 1 summation at that position.

<div align="center" style="margin: 2rem 0;">
  <iframe 
    src="/demos/en/DeepLearning/CNN1.html" 
    width="100%" 
    height="700px" 
    style="border: 1px solid #e2e8f0; border-radius: 12px; box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1); background: #ffffff;" 
    title="Interactive Demo"
  ></iframe>
  <p align="center" style="font-size: 0.9em; color: #64748b; margin-top: 0.5rem;">👆 An interactive module (supports mouse/touch)</p>
</div>


**Instructions:**

- Click **"Auto Play"** to watch the complete process of the kernel sliding from the top-left to the bottom-right
- Drag the **progress bar** to jump to any position and closely observe the computation at a specific window
- Pay attention to the **formula breakdown panel** in the lower right—it lists all 9 multiplications at each step

**Key Observations:**

| Kernel Position                | What You See in the Lower Right                              |
| ------------------------------ | ------------------------------------------------------------ |
| On the background (all black)  | All pixel values are 0 → total score is 0                    |
| On the edge of the handwriting | Left pixel is dark, right pixel is bright (or vice versa) → kernel detects "change" → high score |
| Inside the handwriting         | Little change between left and right pixels → low score or 0 |

**What Is This Kernel Looking For?**

The kernel used in the current demo is:

```text
[-1,  2, -1]
[-1,  2, -1]
[-1,  2, -1]
```

This is a **vertical edge detection kernel**.

Its logic is:

- The left column (`-1`) and right column (`-1`) are "penalized"
- The middle column (`2`) is "rewarded"
- If the image has a **left-to-right change** in the horizontal direction, the score will be high

**In plain terms: this kernel is looking for "vertical lines."**

You can verify this in the demo:

- Drag the progress bar to the left edge of the "5" → the score is high (positive, red)
- Drag the progress bar to the right edge of the "5" → the score is very low (negative, blue)
- Drag the progress bar to a completely blank area → the score is 0 (gray)

**One kernel can only detect one type of feature. To recognize the entire digit "5," we need many types of kernels.**

## Chapter 2: One Kernel Is Not Enough—The "Multiple Detectives" Strategy

### 2.1 A Question: How Many Features Do You Actually Need?

Imagine you want to describe a person:

| Feature Type | Specific Description                   |
| ------------ | -------------------------------------- |
| Appearance   | Tall, short, fat, thin                 |
| Color        | Hair color, eye color, skin tone       |
| Details      | Wearing glasses, has a beard           |
| Style        | What they're wearing, their expression |

**Describing a person with just one feature is not enough.** You need many features to distinguish this person from others.

Recognizing digits is the same:

| Digit | Features Needed                         |
| ----- | --------------------------------------- |
| "1"   | Vertical line                           |
| "5"   | Vertical line + horizontal line + curve |
| "8"   | Two loops (upper curve + lower curve)   |
| "0"   | One large loop (complete curve)         |

**One kernel = one feature.** To recognize 10 digits, you need at least dozens of features.

### 2.2 CNN's Solution: Parallel Convolution

CNN's approach is very simple:

> **Have dozens of different kernels slide over the same image simultaneously. Each kernel is responsible for detecting one type of feature.**

Suppose you have 32 kernels:

- Kernel 1: detects "diagonal from top-left to bottom-right"
- Kernel 2: detects "diagonal from top-right to bottom-left"
- Kernel 3: detects "vertical edges"
- Kernel 4: detects "horizontal edges"
- Kernel 5: detects "45-degree angles"
- ...
- Kernel 32: detects "a specific curved shape"

Each kernel slides over the same image and produces its own "feature map."

**32 kernels → 32 feature maps → 32 different "perspectives" of the image.**

### 2.3 Why This Is So Effective

The problem with a single kernel:

```text
Single kernel detection → only looks for "vertical lines"
                        → both "1" and "5" have vertical lines → can't distinguish them ❌
```

Multi-kernel detection:

```text
Multi-kernel detection → Kernel A looks for "vertical lines" → both have ✓
                        → Kernel B looks for "horizontal lines" → "1" doesn't, "5" does ✓✓
                        → Kernel C looks for "curves" → "1" doesn't, "5" does ✓✓
                        → Combined judgment → "5" matches A+B+C → recognition successful! ✅
```

**One kernel gives you only one "clue." Multiple kernels give you a "clue list."**

## Chapter 3: From "Feature Maps" to "Verdict"—The Complete CNN Pipeline

Now you know:

1. Convolution kernels sliding over an image → produce feature maps
2. Multiple kernels working in parallel → produce multiple feature maps

But CNN's work isn't finished yet. After the feature maps are produced, several more steps are needed to reach the final classification result.

**The complete CNN inference pipeline:**

```text
Input image → [Convolutional Layer] → Feature maps → [Pooling Layer] → Compressed feature maps → [Flatten] → 1D vector → [Fully Connected Layer] → Class probabilities
```

Looks a bit complex? Don't worry—we'll use a **detective solving a case** analogy to understand it.

### 3.1 The Investigation Pipeline

Imagine you're solving a case (recognizing a digit):

| Stage       | Detective Analogy                                            | CNN Counterpart       |
| ----------- | ------------------------------------------------------------ | --------------------- |
| **Stage 1** | Crime scene: receive a blurry photo (raw pixels)             | Input Layer           |
| **Stage 2** | Dispatch 32 detectives, each with a "feature detector"       | Convolutional Layer   |
| **Stage 3** | Compile and compress all clue reports, remove insignificant details | Pooling Layer         |
| **Stage 4** | Write all clues into one long report (flatten)               | Flatten               |
| **Stage 5** | Hand over to the "jury" (fully connected layer) for comprehensive judgment | Fully Connected Layer |
| **Stage 6** | Jury votes and announces the final verdict                   | Softmax Output        |

Now you can experience this complete pipeline firsthand:

> **The demo below shows the complete inference pipeline of a CNN, from "input image" to "final output."**
>
> Click "Start Inference" and you'll see the data flowing layer by layer, with each layer doing specific work.

<div align="center" style="margin: 2rem 0;">
  <iframe 
    src="/demos/en/DeepLearning/CNN2.html" 
    width="100%" 
    height="700px" 
    style="border: 1px solid #e2e8f0; border-radius: 12px; box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1); background: #ffffff;" 
    title="Interactive Demo"
  ></iframe>
  <p align="center" style="font-size: 0.9em; color: #64748b; margin-top: 0.5rem;">👆 An interactive module (supports mouse/touch)</p>
</div>


**Instructions:**

- Click **"Start Inference"** to observe the complete process from "raw image" to "final classification"
- When each stage card expands, **pause for a few seconds** to observe what's happening
- Notice the division of labor among the "detectives"—different colored feature maps indicate different kernels looking for different features
- The final bar chart shows the probability distribution across digits 0-9

### 3.2 What Each Step of the Pipeline Does

**Stage 1: Receiving Raw Pixels**

The input is a handwritten digit image (14×14 grayscale). Pixel values range from 0 (white) to 255 (black).

At this stage, the network only "sees" a bunch of numbers—it doesn't yet know what these numbers represent.

**Stage 2: Multiple Detectives Looking for Clues in Parallel (Convolutional Layer)**

32 convolution kernels slide over the image simultaneously. Each kernel detects a specific visual pattern:

| Detective Code | Feature Detected | Activation Condition                    |
| -------------- | ---------------- | --------------------------------------- |
| Detective A    | Vertical edges   | There are vertical lines in the image   |
| Detective B    | Horizontal edges | There are horizontal lines in the image |
| Detective C    | Curves           | There are curved shapes in the image    |
| Detective D... | ...              | ...                                     |

Each detective produces a "feature map"—a map that records "how prominent this feature is at each position in the image."

**Stage 3: Clue Compression (Pooling Layer)**

The feature maps are large (12×12 = 144 values). But much of the information at many positions isn't critical—details like "this feature is slightly noticeable in the top-left corner" aren't that important.

The pooling layer does something very simple: **compress each 2×2 region into 1 number** (usually taking the maximum value).

```text
Before compression: 2×2 = 4 numbers
After compression: 1 number (the largest one)
```

This halves the feature map size directly (12×12 → 6×6), drastically reducing the computational load for subsequent steps.

> **Why compress?**
>
> - Reduces computation (faster)
> - Prevents overfitting (more robust)
> - Makes the model focus on "whether a feature exists" rather than "the exact position of the feature" (better generalization)

**Stage 4: Clue Packaging (Flatten)**

Now we have 32 feature maps of size 6×6. This is still "3D" data (32 layers × 6 rows × 6 columns).

The fully connected layer (Stage 5) requires 1D input, so we need to **flatten all the numbers into one long sequence**.

```text
32 × 6 × 6 = 1152 numbers
After flattening: a 1D vector of length 1152
```

This process is called **Flatten**.

**Stage 5: Jury Comprehensive Judgment (Fully Connected Layer)**

The 1152 "clues" are passed to the "jury"—a fully connected layer.

Each neuron in the fully connected layer **integrates all clues** and gives its own judgment:

- Neuron 0: "I think the probability this is digit 0 is..."
- Neuron 1: "I think the probability this is digit 1 is..."
- ...
- Neuron 9: "I think the probability this is digit 9 is..."

Each neuron has its own "judgment logic" (weights). Some clues are important for judging "5" (e.g., "does it have a curve?"), while others are less important.

**Stage 6: Final Verdict (Softmax)**

The 10 jurors each give scores, but the scores may vary widely (e.g., 3 points, -2 points, 15 points...).

**Softmax** converts these scores into **probabilities**—percentages that sum to 1:

- Digit 0: 1%
- Digit 1: 0%
- Digit 2: 4%
- ...
- Digit 5: 98% ✅
- Digit 6: 5%
- ...

> **"The probability of digit 5 is 98%!" — Case solved!**

## Chapter 4: What Does CNN "Learning" Actually Mean?

You may have noticed that throughout this process, I've repeatedly mentioned the word "weights":

- The values in the convolution kernel (`[-1, 2, -1]`) are **weights**
- The judgment logic of neurons in the fully connected layer is also **weights**

**Where do these weights come from?**

The answer: **they're not designed by humans—the network learns them on its own.**

### 4.1 Designed vs. Learned

|             | Hand-Designed Kernel                       | Learned Kernel                       |
| ----------- | ------------------------------------------ | ------------------------------------ |
| Example     | Vertical edge detection kernel `[-1,2,-1]` | Any arbitrary combination of numbers |
| Designed by | Engineer manually inputs them              | Network "figures out" from data      |
| Effect      | Interpretable, but limited                 | Hard to interpret, but more powerful |

**The kernel in the CNN1 demo is "hand-designed"** (vertical edge detection)—so you can understand "what the kernel is doing."

**Real CNNs use "learned" kernels**—the network finds the optimal numerical combinations on its own, and we usually can't intuitively understand what each kernel is detecting (this is the "black box" problem).

### 4.2 The Learning Process: Backpropagation (One-Sentence Version)

CNN's learning process can be simplified into three steps:

1. **Forward propagation**: Feed an image into the network and get a prediction (e.g., "80% is 3")
2. **Compute loss**: Compare the prediction with the correct answer (should be "5") and calculate how far off it is
3. **Backpropagation**: Pass the "error" backward and adjust the weights at each layer so the next prediction is more accurate

Repeat this process tens of thousands of times. The weights gradually optimize, and the network's accuracy keeps improving.

> This is the meaning of "deep" in "deep learning"—the network is deep (many layers), and the weights in every layer are **automatically learned** from data.

## Chapter 5: Summary of CNN's Core Capabilities

### 5.1 Three Core Capabilities

| Capability                 | How It's Achieved                                            | Why It Matters                                               |
| -------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| **Feature Extraction**     | Convolution kernels slide over the image, extracting local features | No need to manually design features—the network finds them itself |
| **Translation Invariance** | The same kernel slides across the entire image, detecting features no matter where they are | Digit "5" written off-center or tilted can still be recognized |
| **Hierarchical Features**  | Shallow layers detect simple features (edges), deeper layers combine them into complex features (shapes, objects) | From "pixels" to "semantics," abstracting layer by layer     |

### 5.2 A Picture Is Worth a Thousand Words

```text
[14×14 pixels]
     ↓
[Convolutional Layer + Pooling Layer] × N  ← Repeated feature extraction
     ↓
[Feature Maps]                              ← Abstracted representation
     ↓
[Flatten]                                   ← Flatten
     ↓
[Fully Connected Layer]                     ← Comprehensive judgment
     ↓
[10 probabilities]                          ← Final classification
```

**The essence of CNN: step by step, convert "raw pixels" into "abstract features," then use those features for classification.**

## Chapter 6: FAQ

**Q1: The kernel in CNN1 is hand-designed. Are kernels in real CNNs also hand-designed?**

No. Kernels in real CNNs are **randomly initialized** and then **automatically learn** appropriate values through training data. We usually cannot intuitively understand what each kernel is detecting.

**Q2: Is the pooling layer mandatory?**

Not mandatory, but almost all CNNs use it. The pooling layer reduces computation, prevents overfitting, and makes the model less sensitive to "small positional shifts."

**Q3: Why is CNN better suited for images than ordinary neural networks?**

Ordinary neural networks (fully connected layers) treat all pixels "equally" and don't consider "relationships between adjacent pixels." CNNs, through "local connectivity" and "weight sharing," are naturally suited for **spatial data** like images.

**Q4: Can CNNs handle color images?**

Yes. Color images have three RGB channels (red, green, blue). The input shape becomes `H × W × 3`, and the convolution kernel becomes `K × K × 3` (depth of 3). The process is exactly the same as with grayscale images—just three times more multiplications at each position.

**Q5: In CNN1, the output is 12×12. Why is it 6×6 in CNN2?**

CNN2 includes a pooling layer. The pooling layer compresses each 2×2 region into 1 number, so 12×12 becomes 6×6.

## Chapter 7: The Path You've Traveled

Looking back at these three articles, you've walked this path:

```text
Article 1: Multiplication → Inner Product
           Number × Number → Vector · Vector (one-time overall similarity)

Article 2: Inner Product → Convolution
           Vector · Vector → Sequence * Sequence (sliding local similarity detection)

Article 3: Convolution → CNN
           One kernel → multiple kernels in parallel → complete CNN pipeline
```

You now know:

| Concept                  | Your Understanding                                           |
| ------------------------ | ------------------------------------------------------------ |
| Multiplication           | Scaling of numbers                                           |
| Inner Product            | Multiply corresponding positions and sum = overall similarity |
| Convolution              | Sliding inner product = local similarity at each position    |
| Feature Map              | An "activation map" produced by a convolution kernel sliding over an entire image |
| Multi-Kernel Parallelism | Multiple kernels working simultaneously to detect multiple features |
| Pooling                  | Compressing feature maps to reduce computation               |
| Flatten                  | Flattening multi-dimensional feature maps into a 1D vector   |
| Fully Connected Layer    | Integrating all clues to make a final judgment               |
| CNN                      | An automatic extractor from pixels to features               |

## Conclusion

Three articles, from multiplication to CNN—we've traveled the complete path from "the simplest operation" to "the foundation of modern computer vision."

You might still feel that CNN looks a bit complex—with convolutional layers, pooling layers, fully connected layers, and all kinds of hyperparameters (stride, padding, number of kernels...).

But always remember this one thing:

> **The core of CNN is only one thing: using a "template" to "visit" every position in the signal.**
>
> Everything else (pooling, fully connected layers, multi-kernel parallelism) is just "scaffolding" around this core—they help this core idea work better.

**Convolution kernels: from 1 to 32, then to 512. From 1D to 2D, then to 3D. From hand-designed to learned.**

But the essence has never changed.

---

*If you found these three articles helpful, feel free to share them with friends who are struggling with convolution and CNNs.*

*If you have any questions or suggestions, feel free to leave a comment below.*

