import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCategories } from "@/hooks/useTransactions";
import { useWorkspaceStore } from "@/stores/workspaceStore";
import { SearchInput } from "@/shared/ui/SearchInput";
import { renderCategoryIcon } from "@/utils/icons";
import { ArrowLeft, Clock, Grid, ArrowRight } from "lucide-react";
import { cn } from "@/utils/styles";
import type { Category } from "@/types/entities";

// Static mapping of beautiful, premium subcategories for core ledger categories
export const subcategoryMap: Record<string, string[]> = {
  // Expense subcategories
  Food: ["Groceries", "Restaurants", "Coffee & Drinks", "Fast Food", "Supermarket"],
  Transport: ["Gas & Fuel", "Uber & Taxis", "Public Transit", "Car Maintenance", "Parking"],
  Shopping: ["Clothing", "Electronics", "Home Goods", "Gifts", "Personal Care"],
  Rent: ["Monthly Rent", "Security Deposit", "Renter Insurance"],
  Utilities: ["Electricity", "Water & Trash", "Internet & Wifi", "Mobile Phone", "Streaming Services"],
  Leisure: ["Movies & Concerts", "Sports & Gym", "Hobbies", "Travel & Hotels", "Books & Education"],
  
  // Income subcategories
  Salary: ["Full-time Job", "Part-time Job", "Overtime Pay", "Commission"],
  Freelance: ["Web Development", "Design Consulting", "Writing & Content", "Tutoring"],
  Investment: ["Stock Dividends", "Savings Interest", "Crypto Capital Gains", "Real Estate Rent"],
  Bonus: ["Annual Bonus", "Performance Reward", "Referral Credits"],
  Gift: ["Birthday Cash", "Holiday Gift", "Government Subsidy"],
};

interface CategoryPickerProps {
  type: "expense" | "income";
  selectedId?: string;
  onSelect: (category: Category, subcategory?: string) => void;
  onBack: () => void;
}

export const CategoryPicker: React.FC<CategoryPickerProps> = ({
  type,
  selectedId,
  onSelect,
  onBack,
}) => {
  const { data: categories = [], isLoading } = useCategories();
  const currentWorkspace = useWorkspaceStore((state) => state.currentWorkspace);
  const workspaceId = currentWorkspace?.id;
  
  const [search, setSearch] = useState("");
  // Track currently selected parent category for subcategory slide-in panel
  const [activeParent, setActiveParent] = useState<Category | null>(null);

  // 1. Search filter matching: matches Category names OR Subcategory names!
  const filteredCategories = useMemo(() => {
    return categories.filter((cat) => {
      if (cat.type !== type || cat.deleted_at) return false;
      
      const matchParent = cat.name.toLowerCase().includes(search.toLowerCase());
      
      // Check if any subcategory matches the query
      const subcategories = subcategoryMap[cat.name] || [];
      const matchSub = subcategories.some((sub) =>
        sub.toLowerCase().includes(search.toLowerCase())
      );
      
      return matchParent || matchSub;
    });
  }, [categories, type, search]);

  // 2. Fetch recently used category selections from localStorage
  const recentCategories = useMemo(() => {
    if (!workspaceId) return [];
    try {
      const key = `money-mate-recent-categories-${workspaceId}`;
      const recentIds = JSON.parse(localStorage.getItem(key) || "[]") as string[];
      return recentIds
        .map((id) => categories.find((cat) => cat.id === id))
        .filter((cat): cat is Category => !!cat && cat.type === type && !cat.deleted_at)
        .slice(0, 3);
    } catch {
      return [];
    }
  }, [categories, type, workspaceId]);

  const handleCategoryClick = (cat: Category) => {
    const subs = subcategoryMap[cat.name] || [];
    if (subs.length > 0) {
      // Show subcategory selection panel
      setActiveParent(cat);
    } else {
      // Select immediately if no subcategories exist
      onSelect(cat);
    }
  };

  const handleSubcategorySelect = (subcategory: string) => {
    if (activeParent) {
      onSelect(activeParent, subcategory);
    }
  };

  const handleSelectParentDirectly = () => {
    if (activeParent) {
      onSelect(activeParent);
    }
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      <AnimatePresence mode="wait">
        
        {/* PANEL A: Subcategory Selection Pane */}
        {activeParent ? (
          <motion.div
            key="subcategories"
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 20, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="space-y-4 flex flex-col h-full"
          >
            {/* Header row */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setActiveParent(null)}
                className="p-1 rounded-full hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors cursor-pointer touch-target flex items-center justify-center"
                aria-label="Go back to category grid"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              <div className="min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block leading-none">
                  {activeParent.name} subcategories
                </span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar space-y-4 pb-6">
              {/* Option to select parent category directly with no subcategory description */}
              <button
                type="button"
                onClick={handleSelectParentDirectly}
                className="w-full flex items-center justify-between p-3.5 border border-border/40 hover:border-primary/50 bg-card rounded-xl text-left cursor-pointer transition-all active:scale-[0.98] select-none"
              >
                <div className="flex items-center space-x-3.5">
                  <div
                    className="h-8 w-8 rounded-full flex items-center justify-center text-white"
                    style={{ backgroundColor: activeParent.color || "#71717a" }}
                  >
                    {renderCategoryIcon(activeParent.icon, "h-4 w-4")}
                  </div>
                  <div>
                    <p className="text-xs font-bold leading-tight">
                      Use General "{activeParent.name}"
                    </p>
                    <p className="text-[9px] text-muted-foreground mt-0.5 leading-none font-bold uppercase">
                      Select without description
                    </p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground/40" />
              </button>

              {/* Grid list of subcategories */}
              <div className="space-y-2 pt-1">
                <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground px-0.5">
                  Tap to auto-fill Payee/Merchant
                </span>
                
                <div className="grid grid-cols-2 gap-2">
                  {(subcategoryMap[activeParent.name] || []).map((sub) => (
                    <button
                      key={sub}
                      type="button"
                      onClick={() => handleSubcategorySelect(sub)}
                      className="py-3.5 px-3 border border-border/30 hover:border-primary bg-card/60 active:bg-secondary/20 rounded-xl text-left cursor-pointer transition-all active:scale-[0.98] flex flex-col justify-between select-none space-y-2 h-[76px]"
                    >
                      <span className="text-[11px] font-bold leading-tight text-foreground truncate">
                        {sub}
                      </span>
                      <span className="text-[8px] font-bold uppercase tracking-widest text-primary/75">
                        SELECT & AUTO-FILL
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          
          /* PANEL B: Parent Categories Grid View */
          <motion.div
            key="categories"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -20, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="space-y-4 flex flex-col h-full"
          >
            {/* Header Row */}
            <div className="flex items-center space-x-2">
              <button
                onClick={onBack}
                className="p-1 rounded-full hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors cursor-pointer touch-target flex items-center justify-center"
                aria-label="Go back to form"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Select Category
              </span>
            </div>

            {/* Search Input */}
            <SearchInput
              placeholder={`Search ${type} categories & subcategories...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onClear={() => setSearch("")}
              className="text-xs py-2 bg-secondary/35 border-border/40 focus:border-primary/50"
            />

            {isLoading ? (
              <div className="flex-1 flex items-center justify-center py-12">
                <div className="h-5 w-5 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto no-scrollbar space-y-5">
                {/* Recently Used Section */}
                {recentCategories.length > 0 && !search && (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-1.5 px-0.5 text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">
                        Recently Used
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {recentCategories.map((cat) => {
                        const isSelected = selectedId === cat.id;
                        const catColor = cat.color || "#71717a";
                        
                        return (
                          <button
                            key={`recent-${cat.id}`}
                            onClick={() => handleCategoryClick(cat)}
                            className={cn(
                              "py-3 px-2 border rounded-xl text-xs font-semibold cursor-pointer select-none transition-all active:scale-95 text-center flex flex-col items-center space-y-1.5 justify-center",
                              isSelected
                                ? "bg-primary/10 border-primary text-primary font-bold shadow-premium-sm"
                                : "border-border/40 bg-card text-muted-foreground hover:bg-secondary/40 hover:text-foreground"
                            )}
                          >
                            <div
                              className="h-7 w-7 rounded-full flex items-center justify-center text-white"
                              style={{ backgroundColor: isSelected ? "var(--color-primary)" : catColor }}
                            >
                              {renderCategoryIcon(cat.icon, "h-3.5 w-3.5")}
                            </div>
                            <span className="truncate w-full text-[11px] font-medium leading-none">
                              {cat.name}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Master Grid Categories */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-1.5 px-0.5 text-muted-foreground">
                    <Grid className="h-3 w-3" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">
                      {search ? "Search Results" : "All Categories"}
                    </span>
                  </div>
                  {filteredCategories.length === 0 ? (
                    <div className="text-center py-6">
                      <p className="text-xs text-muted-foreground">No categories match.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-2 pb-6">
                      {filteredCategories.map((cat) => {
                        const isSelected = selectedId === cat.id;
                        const catColor = cat.color || "#71717a";

                        return (
                          <button
                            key={cat.id}
                            onClick={() => handleCategoryClick(cat)}
                            className={cn(
                              "py-3.5 px-2 border rounded-xl text-xs font-semibold cursor-pointer select-none transition-all active:scale-95 text-center flex flex-col items-center space-y-1.5 justify-center",
                              isSelected
                                ? "bg-primary/10 border-primary text-primary font-bold shadow-premium-sm"
                                : "border-border/40 bg-card text-muted-foreground hover:bg-secondary/40 hover:text-foreground"
                            )}
                          >
                            <div
                              className="h-7 w-7 rounded-full flex items-center justify-center text-white transition-transform duration-200"
                              style={{ backgroundColor: isSelected ? "var(--color-primary)" : catColor }}
                            >
                              {renderCategoryIcon(cat.icon, "h-3.5 w-3.5")}
                            </div>
                            <span className="truncate w-full text-[11px] font-medium leading-none">
                              {cat.name}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
export default CategoryPicker;
