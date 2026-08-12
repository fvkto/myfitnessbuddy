import React, { useState } from "react";
import { FoodItem, MealType, SavedRecipe, LoggedFood } from "../types";
import { ChefHat, Plus, Trash2, Utensils, Check, Sparkles, X, BookOpen } from "lucide-react";

interface RecipesViewProps {
  foodDatabase: FoodItem[];
  savedRecipes: SavedRecipe[];
  onSaveRecipe: (recipe: SavedRecipe) => void;
  onDeleteRecipe: (recipeId: string) => void;
  onAddMultipleFoods: (foods: Omit<LoggedFood, "id">[]) => void;
}

export const RecipesView: React.FC<RecipesViewProps> = ({
  foodDatabase,
  savedRecipes,
  onSaveRecipe,
  onDeleteRecipe,
  onAddMultipleFoods,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [recipeTitle, setRecipeTitle] = useState("");
  const [recipeDesc, setRecipeDesc] = useState("");
  const [selectedMealType, setSelectedMealType] = useState<MealType>("lunch");

  // Ingredients builder state
  const [selectedIngredients, setSelectedIngredients] = useState<
    { food: FoodItem; amountServings: number }[]
  >([]);

  const [selectedFoodId, setSelectedFoodId] = useState<string>(foodDatabase[0]?.id || "");
  const [foodServings, setFoodServings] = useState<number>(1);

  const handleAddIngredient = () => {
    const food = foodDatabase.find((f) => f.id === selectedFoodId);
    if (!food) return;

    setSelectedIngredients([
      ...selectedIngredients,
      { food, amountServings: foodServings },
    ]);

    setFoodServings(1);
  };

  const handleRemoveIngredient = (index: number) => {
    setSelectedIngredients(selectedIngredients.filter((_, i) => i !== index));
  };

  // Recipe totals
  const totalCalories = selectedIngredients.reduce(
    (acc, item) => acc + Math.round(item.food.calories * item.amountServings),
    0
  );
  const totalProtein = selectedIngredients.reduce(
    (acc, item) => acc + item.food.protein * item.amountServings,
    0
  );
  const totalCarbs = selectedIngredients.reduce(
    (acc, item) => acc + item.food.carbs * item.amountServings,
    0
  );
  const totalFat = selectedIngredients.reduce(
    (acc, item) => acc + item.food.fat * item.amountServings,
    0
  );

  const handleCreateRecipeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipeTitle || selectedIngredients.length === 0) return;

    const newRecipe: SavedRecipe = {
      id: `rec-${Date.now()}`,
      title: recipeTitle,
      description: recipeDesc,
      servings: 1,
      ingredients: selectedIngredients,
      totalCalories,
      totalProtein: Number(totalProtein.toFixed(1)),
      totalCarbs: Number(totalCarbs.toFixed(1)),
      totalFat: Number(totalFat.toFixed(1)),
    };

    onSaveRecipe(newRecipe);
    setIsModalOpen(false);
    setRecipeTitle("");
    setRecipeDesc("");
    setSelectedIngredients([]);
  };

  const handleLogRecipeToDiary = (recipe: SavedRecipe, mealType: MealType) => {
    const loggedItems: Omit<LoggedFood, "id">[] = recipe.ingredients.map((ing) => ({
      foodId: ing.food.id,
      name: `${ing.food.name} (na receita: ${recipe.title})`,
      mealType,
      servings: ing.amountServings,
      servingSize: ing.food.servingSize,
      calories: Math.round(ing.food.calories * ing.amountServings),
      protein: Number((ing.food.protein * ing.amountServings).toFixed(1)),
      carbs: Number((ing.food.carbs * ing.amountServings).toFixed(1)),
      fat: Number((ing.food.fat * ing.amountServings).toFixed(1)),
    }));

    onAddMultipleFoods(loggedItems);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            Minhas Receitas & Refeições Salvas
          </span>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">
            Banco de Receitas
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Combine ingredientes frequentes em receitas para registrar com 1 clique.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-2xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all shrink-0"
        >
          <ChefHat className="w-4 h-4" />
          <span>+ Criar Nova Receita</span>
        </button>
      </div>

      {/* Recipes List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {savedRecipes.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
            <ChefHat className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-600 dark:text-slate-300">
              Nenhuma receita salva ainda.
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              Crie receitas para agilizar seu diário alimentar diário!
            </p>
          </div>
        ) : (
          savedRecipes.map((recipe) => (
            <div
              key={recipe.id}
              className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    {recipe.title}
                  </h3>
                  {recipe.description && (
                    <p className="text-xs text-slate-500 mt-0.5">{recipe.description}</p>
                  )}
                </div>

                <button
                  onClick={() => onDeleteRecipe(recipe.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Macro Pills */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800 grid grid-cols-4 gap-1 text-center font-bold text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 font-normal block">Calorias</span>
                  <span className="text-blue-600">{recipe.totalCalories} kcal</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-normal block">Proteína</span>
                  <span className="text-slate-800 dark:text-slate-200">{recipe.totalProtein}g</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-normal block">Carboidrato</span>
                  <span className="text-slate-800 dark:text-slate-200">{recipe.totalCarbs}g</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-normal block">Gordura</span>
                  <span className="text-slate-800 dark:text-slate-200">{recipe.totalFat}g</span>
                </div>
              </div>

              {/* Ingredients summary */}
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Ingredientes ({recipe.ingredients.length}):
                </span>
                <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-0.5">
                  {recipe.ingredients.map((ing, i) => (
                    <li key={i}>
                      &bull; {ing.food.name} ({ing.amountServings}x {ing.food.servingSize})
                    </li>
                  ))}
                </ul>
              </div>

              {/* Quick Log Buttons */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">Registrar no:</span>
                <div className="flex gap-1.5">
                  {(["breakfast", "lunch", "dinner", "snacks"] as MealType[]).map((m) => (
                    <button
                      key={m}
                      onClick={() => handleLogRecipeToDiary(recipe, m)}
                      className="px-2.5 py-1 text-[10px] font-bold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-600 hover:text-white transition-all border border-blue-200 dark:border-blue-800"
                    >
                      {m === "breakfast" ? "Café" : m === "lunch" ? "Almoço" : m === "dinner" ? "Jantar" : "Lanche"}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Recipe Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden p-6 space-y-5">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                Criar Nova Receita
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRecipeSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Nome da Receita *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Shake Anabólico Pós-Treino"
                  value={recipeTitle}
                  onChange={(e) => setRecipeTitle(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Descrição (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ex: Leite desnatado + Whey + Banana + Aveia"
                  value={recipeDesc}
                  onChange={(e) => setRecipeDesc(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                />
              </div>

              {/* Add Ingredients Picker */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
                <label className="text-xs font-bold text-slate-900 dark:text-white block">
                  Adicionar Ingrediente do Banco:
                </label>

                <div className="flex gap-2">
                  <select
                    value={selectedFoodId}
                    onChange={(e) => setSelectedFoodId(e.target.value)}
                    className="flex-1 p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
                  >
                    {foodDatabase.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name} ({f.calories} kcal)
                      </option>
                    ))}
                  </select>

                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    value={foodServings}
                    onChange={(e) => setFoodServings(parseFloat(e.target.value) || 1)}
                    className="w-16 p-2 text-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
                  />

                  <button
                    type="button"
                    onClick={handleAddIngredient}
                    className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Added Ingredients list */}
              {selectedIngredients.length > 0 && (
                <div className="space-y-1.5 max-h-36 overflow-y-auto">
                  {selectedIngredients.map((ing, i) => (
                    <div
                      key={i}
                      className="p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs flex justify-between items-center"
                    >
                      <span>
                        {ing.food.name} ({ing.amountServings}x)
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveIngredient(i)}
                        className="text-rose-500 hover:underline"
                      >
                        Remover
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <button
                type="submit"
                disabled={selectedIngredients.length === 0}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20"
              >
                Salvar Receita ({totalCalories} kcal Total)
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
