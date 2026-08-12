import React, { useState } from "react";
import { FoodItem, MealType, LoggedFood } from "../types";
import { Search, Plus, X, Camera, Sparkles, Check, ChevronRight } from "lucide-react";

interface FoodSearchModalProps {
  isOpen: boolean;
  mealType: MealType;
  foodDatabase: FoodItem[];
  onClose: () => void;
  onAddFood: (loggedFood: Omit<LoggedFood, "id">) => void;
  onSaveCustomFood: (food: FoodItem) => void;
  onOpenAIScanner: () => void;
}

export const FoodSearchModal: React.FC<FoodSearchModalProps> = ({
  isOpen,
  mealType,
  foodDatabase,
  onClose,
  onAddFood,
  onSaveCustomFood,
  onOpenAIScanner,
}) => {
  if (!isOpen) return null;

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("Todos");
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [servingsMultiplier, setServingsMultiplier] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<"search" | "create">("search");

  // Custom food state
  const [customName, setCustomName] = useState("");
  const [customBrand, setCustomBrand] = useState("");
  const [customServing, setCustomServing] = useState("1 porção (100g)");
  const [customCalories, setCustomCalories] = useState("");
  const [customProtein, setCustomProtein] = useState("");
  const [customCarbs, setCustomCarbs] = useState("");
  const [customFat, setCustomFat] = useState("");
  const [customFiber, setCustomFiber] = useState("");

  const categories = ["Todos", "Grãos & Cereais", "Carnes & Aves", "Frutas", "Laticínios", "Pães", "Snacks"];

  const mealNames: Record<MealType, string> = {
    breakfast: "Café da Manhã",
    lunch: "Almoço",
    dinner: "Jantar",
    snacks: "Lanches",
  };

  const filteredFoods = foodDatabase.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.brand && item.brand.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCat = selectedCategory === "Todos" || item.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const handleConfirmAddFood = () => {
    if (!selectedFood) return;

    const logged: Omit<LoggedFood, "id"> = {
      foodId: selectedFood.id,
      name: selectedFood.name,
      brand: selectedFood.brand,
      mealType: mealType,
      servings: servingsMultiplier,
      servingSize: selectedFood.servingSize,
      calories: Math.round(selectedFood.calories * servingsMultiplier),
      protein: Number((selectedFood.protein * servingsMultiplier).toFixed(1)),
      carbs: Number((selectedFood.carbs * servingsMultiplier).toFixed(1)),
      fat: Number((selectedFood.fat * servingsMultiplier).toFixed(1)),
      fiber: selectedFood.fiber ? Number((selectedFood.fiber * servingsMultiplier).toFixed(1)) : 0,
    };

    onAddFood(logged);
    setSelectedFood(null);
    setServingsMultiplier(1);
    onClose();
  };

  const handleCreateCustomFoodSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName || !customCalories) return;

    const newFood: FoodItem = {
      id: `custom-${Date.now()}`,
      name: customName,
      brand: customBrand || "Personalizado",
      servingSize: customServing || "1 porção (100g)",
      servingWeightGrams: 100,
      calories: Number(customCalories),
      protein: Number(customProtein) || 0,
      carbs: Number(customCarbs) || 0,
      fat: Number(customFat) || 0,
      fiber: Number(customFiber) || 0,
      isCustom: true,
    };

    onSaveCustomFood(newFood);
    setSelectedFood(newFood);
    setActiveTab("search");
    // Clear form
    setCustomName("");
    setCustomBrand("");
    setCustomCalories("");
    setCustomProtein("");
    setCustomCarbs("");
    setCustomFat("");
    setCustomFiber("");
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              Adicionando ao {mealNames[mealType]}
            </span>
            <h2 className="text-lg font-black text-slate-900 dark:text-white">
              Buscar Alimento
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Top Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 px-5 pt-3 gap-6 bg-white dark:bg-slate-900">
          <button
            onClick={() => setActiveTab("search")}
            className={`pb-3 text-xs font-bold border-b-2 transition-colors ${
              activeTab === "search"
                ? "border-blue-600 text-blue-600 dark:text-blue-400"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            Banco de Alimentos
          </button>
          <button
            onClick={() => setActiveTab("create")}
            className={`pb-3 text-xs font-bold border-b-2 transition-colors ${
              activeTab === "create"
                ? "border-blue-600 text-blue-600 dark:text-blue-400"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            + Criar Alimento
          </button>
          <button
            onClick={() => {
              onClose();
              onOpenAIScanner();
            }}
            className="pb-3 text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center space-x-1 ml-auto"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Usar Scanner IA</span>
          </button>
        </div>

        {activeTab === "search" ? (
          <>
            {/* Search Input & Category Filters */}
            <div className="p-4 space-y-3 bg-slate-50/50 dark:bg-slate-800/20 border-b border-slate-100 dark:border-slate-800">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Busque por pão, arroz, frango, marcas..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
              </div>

              {/* Category tags */}
              <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar pb-1">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1 rounded-full text-[11px] font-bold whitespace-nowrap transition-all ${
                      selectedCategory === cat
                        ? "bg-blue-600 text-white shadow-2xs"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Selected Food Detail / Portion Adjuster */}
            {selectedFood ? (
              <div className="p-5 bg-blue-50/60 dark:bg-blue-950/30 border-b border-blue-200 dark:border-blue-800 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">
                      Item Selecionado
                    </span>
                    <h3 className="text-base font-black text-slate-900 dark:text-white">
                      {selectedFood.name}
                    </h3>
                    <p className="text-xs text-slate-500">
                      Porção Padrão: {selectedFood.servingSize}
                    </p>
                  </div>

                  <button
                    onClick={() => setSelectedFood(null)}
                    className="text-xs text-slate-400 hover:text-slate-600 underline"
                  >
                    Trocar item
                  </button>
                </div>

                {/* Portion Multiplier Slider / Number */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Multiplicador de Porção:
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        step="0.1"
                        min="0.1"
                        max="10"
                        value={servingsMultiplier}
                        onChange={(e) => setServingsMultiplier(Math.max(0.1, parseFloat(e.target.value) || 1))}
                        className="w-20 px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold text-center"
                      />
                      <span className="text-xs text-slate-500">porção(ões)</span>
                    </div>
                  </div>

                  {/* Calculated Macros Preview */}
                  <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-blue-100 dark:border-blue-900 text-xs grid grid-cols-4 gap-1 text-center font-bold">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-normal">Kcal</span>
                      <span className="text-blue-600">{Math.round(selectedFood.calories * servingsMultiplier)}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-normal">Prot</span>
                      <span className="text-slate-800 dark:text-slate-200">{Number((selectedFood.protein * servingsMultiplier).toFixed(1))}g</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-normal">Carb</span>
                      <span className="text-slate-800 dark:text-slate-200">{Number((selectedFood.carbs * servingsMultiplier).toFixed(1))}g</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-normal">Gord</span>
                      <span className="text-slate-800 dark:text-slate-200">{Number((selectedFood.fat * servingsMultiplier).toFixed(1))}g</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleConfirmAddFood}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-xs shadow-md shadow-blue-500/20 flex items-center justify-center space-x-2 transition-all"
                >
                  <Check className="w-4 h-4" />
                  <span>Adicionar ao {mealNames[mealType]}</span>
                </button>
              </div>
            ) : null}

            {/* Food List */}
            <div className="overflow-y-auto flex-1 divide-y divide-slate-100 dark:divide-slate-800 p-2">
              {filteredFoods.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-xs text-slate-500">Nenhum alimento encontrado para "{searchQuery}".</p>
                  <button
                    onClick={() => setActiveTab("create")}
                    className="mt-2 text-xs font-bold text-blue-600 hover:underline"
                  >
                    + Criar este alimento manualmente
                  </button>
                </div>
              ) : (
                filteredFoods.map((food) => (
                  <button
                    key={food.id}
                    onClick={() => {
                      setSelectedFood(food);
                      setServingsMultiplier(1);
                    }}
                    className={`w-full p-3.5 text-left flex items-center justify-between rounded-xl hover:bg-blue-50/50 dark:hover:bg-slate-800/60 transition-colors ${
                      selectedFood?.id === food.id ? "bg-blue-50 dark:bg-blue-950/40 border border-blue-200" : ""
                    }`}
                  >
                    <div>
                      <span className="text-xs font-bold text-slate-900 dark:text-white block">
                        {food.name} {food.brand ? `(${food.brand})` : ""}
                      </span>
                      <span className="text-[11px] text-slate-400 block mt-0.5">
                        Porção: {food.servingSize} &bull; P: {food.protein}g | C: {food.carbs}g | G: {food.fat}g
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-black text-slate-800 dark:text-slate-200">
                        {food.calories} kcal
                      </span>
                      <ChevronRight className="w-4 h-4 text-slate-300" />
                    </div>
                  </button>
                ))
              )}
            </div>
          </>
        ) : (
          /* Custom Food Creation Form */
          <form onSubmit={handleCreateCustomFoodSubmit} className="p-5 overflow-y-auto space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Cadastrar Novo Alimento no Seu Banco
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Nome do Alimento *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Panqueca de Whey e Banana"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Marca / Origem (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ex: Caseira / Growth"
                  value={customBrand}
                  onChange={(e) => setCustomBrand(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Tamanho da Porção
                </label>
                <input
                  type="text"
                  placeholder="Ex: 1 unidade (100g)"
                  value={customServing}
                  onChange={(e) => setCustomServing(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Calorias (kcal) *
                </label>
                <input
                  type="number"
                  required
                  placeholder="Ex: 250"
                  value={customCalories}
                  onChange={(e) => setCustomCalories(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div>
                <label className="text-[11px] font-bold text-blue-600 block mb-1">Proteínas (g)</label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="0"
                  value={customProtein}
                  onChange={(e) => setCustomProtein(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-amber-600 block mb-1">Carboidratos (g)</label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="0"
                  value={customCarbs}
                  onChange={(e) => setCustomCarbs(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-rose-600 block mb-1">Gorduras (g)</label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="0"
                  value={customFat}
                  onChange={(e) => setCustomFat(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-emerald-600 block mb-1">Fibras (g)</label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="0"
                  value={customFiber}
                  onChange={(e) => setCustomFiber(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 mt-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-xs shadow-md shadow-blue-500/20"
            >
              Salvar Alimento Personalizado
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
