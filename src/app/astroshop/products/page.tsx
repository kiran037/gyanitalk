"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Star,
  TrendingUp,
  Package,
  X,
} from "lucide-react";
import { PageHeader } from "@/components/adminUI/PageHeader";
import { Button } from "@/components/adminUI/Button";
import { SearchInput } from "@/components/adminUI/SearchInput";
import { ActionModal } from "@/components/adminUI/ActionModal";
import { useToast } from "@/components/Toast/ToastProvider";
import { avatar } from "@/lib/images";
import Link from "next/link";

interface Product {
  id: string;
  name: string;
  description: string | null;
  productImage: string;
  amount: number;
  is_feature: boolean;
  bestseller: boolean;
  isActive: boolean;
  product_category: {
    id: string;
    name: string;
  };
  _count: {
    order_requests: number;
  };
}

interface Category {
  id: string;
  name: string;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [filterActive, setFilterActive] = useState<string>("");
  const [filterFeatured, setFilterFeatured] = useState<string>("");
  const [filterBestseller, setFilterBestseller] = useState<string>("");
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 0,
  });
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const addToast = useToast();

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [search, selectedCategory, filterActive, filterFeatured, filterBestseller, sortBy, sortOrder, currentPage]);

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/astroshop/categories?limit=100");
      const data = await response.json();
      if (data.success) {
        setCategories(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch categories");
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "12",
        sortBy,
        sortOrder,
      });

      if (search) params.append("search", search);
      if (selectedCategory) params.append("categoryId", selectedCategory);
      if (filterActive) params.append("isActive", filterActive);
      if (filterFeatured) params.append("isFeatured", filterFeatured);
      if (filterBestseller) params.append("bestseller", filterBestseller);

      const response = await fetch(`/api/astroshop/products?${params}`);
      const data = await response.json();

      if (data.success) {
        setProducts(data.data);
        setPagination(data.pagination);
      }
    } catch (error) {
      addToast("error", "Error", "Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (product: Product) => {
    try {
      const response = await fetch(`/api/astroshop/products/${product.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isActive: !product.isActive,
          modifiedBy: 1,
        }),
      });

      if (response.ok) {
        addToast("success", "Success", "Product status updated");
        fetchProducts();
      }
    } catch (error) {
      addToast("error", "Error", "Failed to update status");
    }
  };

  const handleDelete = async () => {
    if (!deletingProduct) return;

    setSubmitting(true);
    try {
      const response = await fetch(`/api/astroshop/products/${deletingProduct.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        addToast("success", "Success", "Product deleted successfully");
        setIsDeleteModalOpen(false);
        setDeletingProduct(null);
        fetchProducts();
      } else {
        addToast("error", "Error", "Failed to delete product");
      }
    } catch (error) {
      addToast("error", "Error", "Failed to delete product");
    } finally {
      setSubmitting(false);
    }
  };

  const openDeleteModal = (product: Product) => {
    setDeletingProduct(product);
    setIsDeleteModalOpen(true);
  };

  const clearFilters = () => {
    setSearch("");
    setSelectedCategory("");
    setFilterActive("");
    setFilterFeatured("");
    setFilterBestseller("");
  };

  const hasActiveFilters = search || selectedCategory || filterActive || filterFeatured || filterBestseller;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="w-full mx-auto space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <PageHeader
            title="Products"
            subtitle="Manage your product catalog"
            badge={{ text: `${pagination.total} Products`, variant: "purple" }}
            actions={
              <Link href="/astroshop/products/create">
                <Button icon={<Plus className="w-4 h-4" />}>
                  Add Product
                </Button>
              </Link>
            }
          />
        </motion.div>

        {/* Compact Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {/* Search and Quick Filters */}
          <div className="flex flex-wrap gap-3 items-center">
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Search products..."
              className="flex-1 min-w-[200px]"
            />

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/50 transition-all"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={filterActive}
              onChange={(e) => setFilterActive(e.target.value)}
              className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/50 transition-all"
            >
              <option value="">All Status</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>

            {/* Sort */}
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [newSortBy, newSortOrder] = e.target.value.split("-");
                setSortBy(newSortBy);
                setSortOrder(newSortOrder);
              }}
              className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/50 transition-all"
            >
              <option value="created_at-desc">Latest First</option>
              <option value="created_at-asc">Oldest First</option>
              <option value="amount-asc">Price: Low to High</option>
              <option value="amount-desc">Price: High to Low</option>
              <option value="name-asc">Name: A-Z</option>
              <option value="name-desc">Name: Z-A</option>
            </select>
          </div>

          {/* Tag Filters */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilterFeatured(filterFeatured === "true" ? "" : "true")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filterFeatured === "true"
                  ? "bg-gradient-to-r from-[#FF6B35] to-[#FFB347] text-white shadow-md"
                  : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-[#FF6B35]"
              }`}
            >
              <Star className="w-3 h-3 inline mr-1" />
              Featured
            </button>
            <button
              onClick={() => setFilterBestseller(filterBestseller === "true" ? "" : "true")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filterBestseller === "true"
                  ? "bg-purple-500 text-white shadow-md"
                  : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-purple-500"
              }`}
            >
              <TrendingUp className="w-3 h-3 inline mr-1" />
              Bestseller
            </button>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
              >
                <X className="w-3 h-3 inline mr-1" />
                Clear Filters
              </button>
            )}
          </div>
        </motion.div>

        {/* Products Grid */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-4 animate-pulse">
                <div className="flex gap-4">
                  <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-lg flex-shrink-0"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-3"></div>
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-12 text-center border border-gray-200 dark:border-gray-700">
            <Package className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No Products Found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Try adjusting your filters or create a new product
            </p>
            <Link href="/astroshop/products/create">
              <Button>Create Product</Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10">
              {products.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group"
                >
                  {/* Large Product Image */}
                  <div className="relative h-64 overflow-hidden bg-gray-100 dark:bg-gray-900">
                    <img
                      src={avatar(product.productImage)}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    
                    {/* Overlay Badges */}
                    <div className="absolute top-4 left-4 flex gap-2">
                      {product.is_feature && (
                        <div className="px-3 py-1.5 bg-gradient-to-r from-[#FF6B35] to-[#FFB347] backdrop-blur-sm rounded-full text-white text-xs font-semibold flex items-center gap-1.5 shadow-lg">
                          <Star className="w-3.5 h-3.5 fill-white" />
                          Featured
                        </div>
                      )}
                      {product.bestseller && (
                        <div className="px-3 py-1.5 bg-purple-500/90 backdrop-blur-sm rounded-full text-white text-xs font-semibold flex items-center gap-1.5 shadow-lg">
                          <TrendingUp className="w-3.5 h-3.5" />
                          Bestseller
                        </div>
                      )}
                    </div>

                    {/* Active Status Toggle */}
                    <button
                      onClick={() => handleToggleActive(product)}
                      className="absolute top-4 right-4 p-2.5 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full hover:bg-white dark:hover:bg-gray-800 transition-all shadow-lg"
                    >
                      {product.isActive ? (
                        <Eye className="w-5 h-5 text-green-600" />
                      ) : (
                        <EyeOff className="w-5 h-5 text-gray-400" />
                      )}
                    </button>

                    {/* Category Badge */}
                    <div className="absolute bottom-4 left-4">
                      <span className="px-3 py-1 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full text-xs font-medium text-gray-700 dark:text-gray-300 shadow-lg">
                        {product.product_category.name}
                      </span>
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="p-5">
                    <div className="mb-3">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1 line-clamp-1">
                        {product.name}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {product._count.order_requests} orders
                      </p>
                    </div>

                    {/* Price and Actions */}
                    <div className="flex items-center justify-between">
                      <div className="text-2xl font-bold bg-gradient-to-r from-[#FF6B35] to-[#FFB347] bg-clip-text text-transparent">
                        ₹{product.amount}
                      </div>
                      <div className="flex gap-2">
                        <Link href={`/astroshop/products/${product.id}`}>
                          <button className="p-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                            <Edit className="w-4 h-4" />
                          </button>
                        </Link>
                        <button
                          onClick={() => openDeleteModal(product)}
                          className="p-2.5 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-center items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => prev - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                {Array.from({ length: Math.min(pagination.totalPages, 5) }, (_, i) => {
                  let pageNum;
                  if (pagination.totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= pagination.totalPages - 2) {
                    pageNum = pagination.totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "primary" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  disabled={currentPage === pagination.totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <ActionModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeletingProduct(null);
        }}
        onConfirm={handleDelete}
        title="Delete Product"
        message={`Are you sure you want to delete "${deletingProduct?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
        loading={submitting}
      />
    </div>
  );
}