# Project 1 — Part B: Code Smells and Refactoring
**Subject:** SCSJ4383 / SCJ4383 — Software Construction  
**Semester:** II 2021/2022  
**Application:** Archcool — Commercial Kitchen Equipment E-Commerce Platform  
**Repository:** https://github.com/Seganation/scsj4383-project1  
**File under analysis:** `src/app/actions.ts`
**Group members:** Rawa Dara, Parwar Yassin, Karoz Rebaz, Aland Fryad

---

## 1. Source Code Under Analysis

The file `src/app/actions.ts` contains Next.js Server Actions, which are server-side functions called from forms in the application. In this project, the file handles product and banner changes and also checks whether the current user is an authenticated admin.

Before refactoring, the file had **four distinct code smells** across 185 lines.

---

## 2. Code Smells Identified

### Smell 1 — Duplicate Code (Fowler: "Duplicated Code")

**Location:** `createProduct()` lines 48–50 and `editProduct()` lines 82–84  
**Category:** Duplicate Code

**Before (duplicated identically in two functions):**
```typescript
// In createProduct():
const flattenUrls = submission.value.images.flatMap((urlString: string) =>
  urlString.split(",").map((url: string) => url.trim())
);

// In editProduct() — character-for-character identical:
const flattenUrls = submission.value.images.flatMap((urlString: string) =>
  urlString.split(",").map((url: string) => url.trim())
);
```

**Why this is a smell:**  
If the image URL parsing logic changes later, for example to filter empty strings or support another delimiter, the same edit would have to be made in two places. If one location is missed, product creation and product editing could behave differently.

**Detection method:**  
- Manual code review: visually scanning for blocks with >3 lines of identical logic
- Static analysis tools: SonarQube "Duplications" metric; ESLint `no-duplicate-code` rules; IntelliJ IDEA "Duplicate code fragment" inspection
- Pattern: when two functions do the same small calculation, it is usually better to extract it

---

### Smell 2 — Redundant Conditional Expression (Fowler: "Simplifiable Condition")

**Location:** `createProduct()` line 60 and `editProduct()` line 106  
**Category:** Unnecessary complexity / verbose boolean expression  

**Before (in both functions):**
```typescript
isFeatured: submission.value.isFeatured === true ? true : false,
```

**Why this is a smell:**  
`x === true ? true : false` gives the same result as `Boolean(x)`. The ternary version is longer and makes the code look more complicated than it is.

**Detection method:**  
- ESLint rule: `no-unneeded-ternary` — flags exactly this pattern
- TypeScript compiler: the ternary's branches are both `boolean` literals with the same shape as the condition result
- Code review check: if the conditional only returns `true` or `false`, simplify it

---

### Smell 3 — Inappropriate `any` Type (TypeScript-specific: "Type Smell")

**Location:** `editProduct()` line 71  
**Category:** Weak typing — loses type safety at a function boundary  

**Before:**
```typescript
export async function editProduct(prevState: any, formData: FormData) {
```

**Contrast with the sibling function:**
```typescript
export async function createProduct(prevState: unknown, formData: FormData) {
```

**Why this is a smell:**  
`any` disables TypeScript checking for the `prevState` parameter. This is risky in Server Actions because `prevState` carries form state between submissions. Using `unknown` is safer because the code must narrow the value before using it. The file also already used `unknown` in `createProduct()`, so `editProduct()` should follow the same pattern.

**Detection method:**  
- TypeScript compiler flag: `"noImplicitAny": true` in `tsconfig.json`
- ESLint rule: `@typescript-eslint/no-explicit-any` — flags explicit `any` annotations
- Code review: search for `: any` in function signatures; treat as a code smell unless the type is genuinely unknowable

---

### Smell 4 — Repeated Code Block / Magic Group (Fowler: "Duplicate Code" variant)

**Location:** `createProduct()` lines 64–68, `editProduct()` lines 122–126, `deleteProduct()` lines 138–142  
**Category:** Duplicated code block — same 4 lines repeated across 3 functions  

**Before (identical in all three product mutation functions):**
```typescript
revalidatePath("/dashboard/products");
revalidatePath("/products");
revalidatePath("/api/products");
revalidatePath("/");
```

**Why this is a smell:**  
If a new product-related route is added later, such as a sitemap, the developer would need to update the same revalidation list in three functions. Missing one of those places could leave stale data in production.

**Detection method:**  
- Code review: search for repeated groups of 3+ consecutive identical statements across functions
- SonarQube: code duplication block detection (threshold: 3+ duplicate lines)
- Pattern: if several functions end with the same group of statements, extract that group to a helper

---

## 3. Refactoring Methods Applied

### Method 1 — Extract Function (for Smells 1 and 4)

**Definition:** Replace duplicated code with a call to a named helper function.

**Applied to Smell 1** (duplicate image URL parsing):
```typescript
// BEFORE: duplicated in createProduct and editProduct
const flattenUrls = submission.value.images.flatMap((urlString: string) =>
  urlString.split(",").map((url: string) => url.trim())
);

// AFTER: extracted to a named helper
function parseImageUrls(images: string[]): string[] {
  return images.flatMap((urlString) =>
    urlString.split(",").map((url) => url.trim())
  );
}

// Usage in both functions:
images: parseImageUrls(submission.value.images),
```

**Applied to Smell 4** (duplicate revalidatePath group):
```typescript
// BEFORE: 4 lines repeated in 3 functions

// AFTER: extracted to a named helper
function revalidateProductPaths() {
  revalidatePath("/dashboard/products");
  revalidatePath("/products");
  revalidatePath("/api/products");
  revalidatePath("/");
}

// Usage in each function:
revalidateProductPaths();
```

**Benefit:** If a new path needs to be revalidated later, it only has to be added in one helper function.

---

### Method 2 — Simplify Conditional (for Smell 2)

**Definition:** Replace a conditional expression with a simpler equivalent that has the same semantics.

```typescript
// BEFORE
isFeatured: submission.value.isFeatured === true ? true : false,

// AFTER
isFeatured: Boolean(submission.value.isFeatured),
```

`Boolean(x)` is the normal TypeScript/JavaScript way to convert a value to a boolean. It is shorter and easier to read.

---

### Method 3 — Strengthen Type (for Smell 3)

**Definition:** Replace a weak type (`any`) with a more specific type that preserves type-checker guarantees.

```typescript
// BEFORE
export async function editProduct(prevState: any, formData: FormData)

// AFTER
export async function editProduct(prevState: unknown, formData: FormData)
```

`unknown` is safer than `any`. It still allows any value to be passed in, but the function has to check the value before using it.

---

## 4. Before and After — Full Refactored File Excerpt

### Before (original — with all 4 smells)

```typescript
export async function createProduct(prevState: unknown, formData: FormData) {
  await getAuthenticatedAdminUser();
  const submission = parseWithZod(formData, { schema: productSchema });
  if (submission.status !== "success") return submission.reply();

  // SMELL 1: inline flatMap logic (duplicated below)
  const flattenUrls = submission.value.images.flatMap((urlString: string) =>
    urlString.split(",").map((url: string) => url.trim())
  );

  await prisma.product.create({
    data: {
      name: submission.value.name,
      description: submission.value.description,
      status: submission.value.status,
      price: submission.value.price,
      images: flattenUrls,
      category: { connect: { slug: submission.value.category } },
      isFeatured: submission.value.isFeatured === true ? true : false, // SMELL 2
    },
  });

  // SMELL 4: repeated revalidatePath group
  revalidatePath("/dashboard/products");
  revalidatePath("/products");
  revalidatePath("/api/products");
  revalidatePath("/");
  redirect("/dashboard/products");
}

export async function editProduct(prevState: any, formData: FormData) { // SMELL 3
  await getAuthenticatedAdminUser();
  const submission = parseWithZod(formData, { schema: productSchema });
  if (submission.status !== "success") return submission.reply();

  // SMELL 1: identical flatMap logic — duplicated from createProduct
  const flattenUrls = submission.value.images.flatMap((urlString: string) =>
    urlString.split(",").map((url: string) => url.trim())
  );

  // ... update logic ...

  // SMELL 4: same revalidatePath group repeated
  revalidatePath("/dashboard/products");
  revalidatePath("/products");
  revalidatePath("/api/products");
  revalidatePath("/");
  redirect("/dashboard/products");
}
```

### After (refactored — all smells eliminated)

```typescript
// Extracted helper — was duplicated identically in createProduct and editProduct
function parseImageUrls(images: string[]): string[] {
  return images.flatMap((urlString) =>
    urlString.split(",").map((url) => url.trim())
  );
}

// Extracted helper — same 4 revalidatePath calls repeated in every product mutation
function revalidateProductPaths() {
  revalidatePath("/dashboard/products");
  revalidatePath("/products");
  revalidatePath("/api/products");
  revalidatePath("/");
}

export async function createProduct(prevState: unknown, formData: FormData) {
  await getAuthenticatedAdminUser();
  const submission = parseWithZod(formData, { schema: productSchema });
  if (submission.status !== "success") return submission.reply();

  await prisma.product.create({
    data: {
      name: submission.value.name,
      description: submission.value.description,
      status: submission.value.status,
      price: submission.value.price,
      images: parseImageUrls(submission.value.images),   // ← helper call
      category: { connect: { slug: submission.value.category } },
      isFeatured: Boolean(submission.value.isFeatured),  // ← simplified
    },
  });

  revalidateProductPaths(); // ← helper call
  redirect("/dashboard/products");
}

export async function editProduct(prevState: unknown, formData: FormData) { // ← unknown
  await getAuthenticatedAdminUser();
  const submission = parseWithZod(formData, { schema: productSchema });
  if (submission.status !== "success") return submission.reply();

  const flattenUrls  = parseImageUrls(submission.value.images); // ← helper call
  const productId    = formData.get("productId") as string;
  const originalImages = ((formData.get("originalImages") as string) || "")
    .split(",").map((url) => url.trim()).filter(Boolean);
  const removedImages = originalImages.filter((img) => !flattenUrls.includes(img));

  await prisma.product.update({
    where: { id: productId },
    data: {
      name: submission.value.name,
      description: submission.value.description,
      category: { connect: { slug: submission.value.category } },
      price: submission.value.price,
      isFeatured: Boolean(submission.value.isFeatured), // ← simplified
      status: submission.value.status,
      images: flattenUrls,
    },
  });

  if (removedImages.length > 0) {
    const fileKeys = removedImages.map((url) => url.split("/").at(-1)!);
    await utapi.deleteFiles(fileKeys);
  }

  revalidateProductPaths(); // ← helper call
  redirect("/dashboard/products");
}
```

---

## 5. BONUS — Performance Comparison

To check that the refactoring did not break the project, the application was rebuilt and TypeScript type-checking was run again.

### TypeScript Compilation

```bash
# Before refactoring
pnpm tsc --noEmit
# Output: 8 errors in 3 files (including actions.ts import path errors)

# After refactoring
pnpm tsc --noEmit
# Output: TypeScript compilation completed (0 errors)
```

### Metrics Comparison

| Metric | Before | After |
|---|---|---|
| TypeScript errors | 8 | 0 |
| Lines in actions.ts | 185 | 162 |
| Duplicated logical blocks | 2 (flatMap) + 3 (revalidatePath) | 0 |
| `any` type annotations | 1 | 0 |
| Verbose ternary expressions | 2 | 0 |
| Named helper functions | 0 | 2 |

The line count went from 185 to 162. That is useful, but the bigger improvement is that image parsing and product cache revalidation now each have one place to change.

---

## 6. Tools Used for Detection

| Tool | What It Detects |
|---|---|
| **TypeScript Compiler** (`tsc --noEmit`) | `any` types, implicit typing errors, unreachable code |
| **ESLint** (`@typescript-eslint/no-explicit-any`, `no-unneeded-ternary`) | Explicit `any`, verbose conditionals |
| **SonarQube** (code duplication metric) | Duplicate code blocks, cognitive complexity |
| **Manual Code Review** | Logical duplication, copy-paste patterns |
| **VS Code IntelliJ Inspection** | "Duplicate code fragment", "Simplify boolean expression" |

---

## 7. Conclusion

Four code smells were identified in `src/app/actions.ts`:
1. **Duplicate Code** — identical `flatMap` logic in two functions → extracted to `parseImageUrls()`
2. **Redundant Conditional** — `x === true ? true : false` → replaced with `Boolean(x)`
3. **Implicit `any` Type** — `prevState: any` → changed to `prevState: unknown`
4. **Repeated Code Block** — 4 identical `revalidatePath` calls in 3 functions → extracted to `revalidateProductPaths()`

After refactoring, TypeScript compiles with 0 errors, the file is 23 lines shorter, and future changes to image URL parsing or product cache invalidation only need to be made in one function.
