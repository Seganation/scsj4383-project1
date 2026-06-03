"use client";

import MiniSearch from "minisearch";

export interface ProductSearchItem {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  isFeatured?: boolean;
  createdAt?: string;
}

export interface SearchResult {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  isFeatured?: boolean;
  createdAt?: string;
  score: number;
  terms: string[];
  match: Record<string, string[]>;
}

export interface SearchOptions {
  fuzzy?: number;
  prefix?: boolean;
  boost?: Record<string, number>;
  filter?: (result: SearchResult) => boolean;
  combineWith?: "AND" | "OR";
  fields?: string[];
  limit?: number;
}

export class ProductSearchService {
  private miniSearch: MiniSearch<ProductSearchItem>;
  private products: ProductSearchItem[] = [];
  private isInitialized = false;

  constructor() {
    this.miniSearch = new MiniSearch({
      // Fields to index for full-text search
      fields: ["name", "description", "category"],

      // Fields to return with search results
      storeFields: [
        "id",
        "name",
        "description",
        "price",
        "images",
        "category",
        "isFeatured",
        "createdAt",
      ],

      // Search options
      searchOptions: {
        boost: {
          name: 3, // Boost name matches heavily
          category: 2, // Boost category matches moderately
          description: 1, // Normal boost for description
        },
        fuzzy: 0.2, // Enable fuzzy search with max edit distance
        prefix: true, // Enable prefix search
        combineWith: "OR", // Use OR to find products matching any terms
      },

      // Custom field extraction (handles nested fields if needed)
      extractField: (document, fieldName) => {
        return document[fieldName as keyof ProductSearchItem] as string;
      },

      // Custom tokenization - split on spaces, punctuation, and camelCase
      tokenize: (string) => {
        return string
          .toLowerCase()
          .replace(/[^\w\s]/g, " ") // Replace punctuation with spaces
          .replace(/([a-z])([A-Z])/g, "$1 $2") // Handle camelCase
          .split(/\s+/)
          .filter((token) => token.length > 0);
      },

      // Custom term processing - remove stop words and normalize
      processTerm: (term) => {
        const stopWords = new Set([
          "a",
          "an",
          "and",
          "are",
          "as",
          "at",
          "be",
          "by",
          "for",
          "from",
          "has",
          "he",
          "in",
          "is",
          "it",
          "its",
          "of",
          "on",
          "that",
          "the",
          "to",
          "was",
          "with",
          "will",
        ]);

        const normalizedTerm = term.toLowerCase().trim();

        // Filter out stop words and very short terms
        if (stopWords.has(normalizedTerm) || normalizedTerm.length < 2) {
          return null;
        }

        return normalizedTerm;
      },
    });
  }

  // Initialize the search index with products
  initialize(products: ProductSearchItem[]) {
    this.products = products;
    this.miniSearch.removeAll();
    this.miniSearch.addAll(products);
    this.isInitialized = true;
  }

  // Add products to the search index
  addProducts(products: ProductSearchItem[]) {
    this.products.push(...products);
    this.miniSearch.addAll(products);
    this.isInitialized = true;
  }

  // Remove a product from the search index
  removeProduct(productId: string) {
    this.miniSearch.discard(productId);
    this.products = this.products.filter((p) => p.id !== productId);
  }

  // Update a product in the search index
  updateProduct(product: ProductSearchItem) {
    this.removeProduct(product.id);
    this.miniSearch.add(product);
    this.products.push(product);
  }

  // Get all indexed products
  getAllProducts(): ProductSearchItem[] {
    return this.products;
  }

  // Check if the service is initialized
  isReady(): boolean {
    return this.isInitialized && this.products.length > 0;
  }

  // Perform a search with various options
  search(query: string, options: SearchOptions = {}): SearchResult[] {
    if (!this.isReady() || !query.trim()) {
      return [];
    }

    const {
      fuzzy = 0.2,
      prefix = true,
      boost = { name: 3, category: 2, description: 1 },
      filter,
      combineWith = "OR",
      fields,
      limit = 50,
    } = options;

    try {
      const searchOptions: any = {
        fuzzy,
        prefix,
        boost,
        combineWith,
      };

      if (fields && fields.length > 0) {
        searchOptions.fields = fields;
      }

      const rawResults = this.miniSearch.search(query, searchOptions);

      // Convert MiniSearch results to our SearchResult type
      let results: SearchResult[] = rawResults.map((result) => ({
        ...(result as any), // MiniSearch result contains all the stored fields
        score: result.score,
        terms: result.terms,
        match: result.match,
      }));

      // Apply custom filter if provided
      if (filter) {
        results = results.filter(filter);
      }

      // Limit results
      if (limit > 0) {
        results = results.slice(0, limit);
      }

      return results;
    } catch (error) {
      console.error("Search error:", error);
      return [];
    }
  }

  // Search by category
  searchByCategory(category: string, limit = 20): SearchResult[] {
    return this.search(category, {
      fields: ["category"],
      boost: { category: 5 },
      limit,
    });
  }

  // Get products by exact category match
  getProductsByCategory(category: string): ProductSearchItem[] {
    return this.products.filter(
      (product) => product.category.toLowerCase() === category.toLowerCase()
    );
  }

  // Search with semantic matching (searches across all fields with high relevance)
  semanticSearch(query: string, limit = 20): SearchResult[] {
    return this.search(query, {
      fuzzy: 0.3,
      prefix: true,
      boost: { name: 4, description: 2, category: 3 },
      combineWith: "OR",
      limit,
    });
  }

  // Search for exact matches first, then fuzzy matches
  bestMatchSearch(query: string, limit = 20): SearchResult[] {
    // First try exact matches
    const exactResults = this.search(query, {
      fuzzy: 0,
      prefix: true,
      boost: { name: 5, category: 3, description: 1 },
      limit: Math.floor(limit / 2),
    });

    if (exactResults.length >= limit) {
      return exactResults.slice(0, limit);
    }

    // Then add fuzzy matches, excluding already found items
    const exactIds = new Set(exactResults.map((r) => r.id));
    const fuzzyResults = this.search(query, {
      fuzzy: 0.3,
      prefix: true,
      boost: { name: 3, category: 2, description: 1 },
      filter: (result) => !exactIds.has(result.id),
      limit: limit - exactResults.length,
    });

    return [...exactResults, ...fuzzyResults];
  }

  // Get auto-suggestions for search queries
  getSuggestions(query: string, limit = 5): string[] {
    if (!this.isReady() || !query.trim()) {
      return [];
    }

    try {
      const suggestions = this.miniSearch.autoSuggest(query, {
        fuzzy: 0.2,
        prefix: true,
      });

      return suggestions
        .slice(0, limit)
        .map((suggestion) => suggestion.suggestion);
    } catch (error) {
      console.error("Suggestion error:", error);
      return [];
    }
  }

  // Get featured products
  getFeaturedProducts(): ProductSearchItem[] {
    return this.products.filter((product) => product.isFeatured);
  }

  // Get products by price range
  getProductsByPriceRange(
    minPrice: number,
    maxPrice: number
  ): ProductSearchItem[] {
    return this.products.filter(
      (product) => product.price >= minPrice && product.price <= maxPrice
    );
  }

  // Get similar products (based on category and price range)
  getSimilarProducts(
    product: ProductSearchItem,
    limit = 5
  ): ProductSearchItem[] {
    const priceRange = product.price * 0.3; // 30% price tolerance

    return this.products
      .filter(
        (p) =>
          p.id !== product.id &&
          p.category === product.category &&
          Math.abs(p.price - product.price) <= priceRange
      )
      .slice(0, limit);
  }

  // Get search statistics
  getStats() {
    // Filter and ensure categories are valid strings
    const validCategories = this.products
      .map((p) => p.category)
      .filter((cat): cat is string => typeof cat === "string" && cat.length > 0)
      .filter((cat, index, arr) => arr.indexOf(cat) === index); // Remove duplicates

    return {
      totalProducts: this.products.length,
      categories: validCategories,
      priceRange: {
        min: Math.min(...this.products.map((p) => p.price)),
        max: Math.max(...this.products.map((p) => p.price)),
      },
      featuredCount: this.products.filter((p) => p.isFeatured).length,
    };
  }
}

// Singleton instance
let searchService: ProductSearchService | null = null;

export const getSearchService = (): ProductSearchService => {
  if (!searchService) {
    searchService = new ProductSearchService();
  }
  return searchService;
};

// Helper function to convert API product to search item
export const convertToSearchItem = (product: any): ProductSearchItem => {
  // Ensure category is a valid string
  let category = "uncategorized";
  if (product.category) {
    if (typeof product.category === "string") {
      category = product.category.trim() || "uncategorized";
    } else if (typeof product.category === "object" && product.category.name) {
      category = String(product.category.name).trim() || "uncategorized";
    } else {
      category = String(product.category).trim() || "uncategorized";
    }
  }

  return {
    id: product.id,
    name: product.name,
    description: product.description || "",
    price: product.price,
    images: product.images || [],
    category,
    isFeatured: product.isFeatured || false,
    createdAt: product.createdAt,
  };
};
