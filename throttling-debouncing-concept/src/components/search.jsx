import React, { useMemo, useState } from "react";
import { searchMeals } from "../api/mealApi";
import { debounce } from "../helpers/debounce";
import "./Search.css"; // 👈 import CSS

const Search = () => {
  const [query, setQuery] = useState("");
  const [meals, setMeals] = useState([]);

  const initSearchApiRequest = useMemo(() => {
    return debounce(async (q) => {
      if (!q.trim()) {
        setMeals([]);
        return;
      }
      const results = await searchMeals(q);
      setMeals(results);
    }, 500);
  }, []);

  const onChangeQuery = (e) => {
    const q = e.target.value;
    setQuery(q);
    initSearchApiRequest(q);
  };

  return (
    <div className="search-container">
      <h1 className="title">🍽️ Meal Finder</h1>

      <form className="search-form">
        <label htmlFor="meal-search" className="search-label">
          Search meals:
        </label>
        <input
          id="meal-search"
          name="meal-search"
          type="text"
          value={query}
          onChange={onChangeQuery}
          placeholder="Type a meal name..."
          className="search-input"
        />
      </form>

      <ul className="meal-list">
        {meals.length === 0 && query && (
          <li className="no-results">No meals found 😞</li>
        )}
        {meals.map((meal) => (
          <li key={meal.idMeal} className="meal-card">
            <img
              src={meal.strMealThumb}
              alt={meal.strMeal}
              className="meal-thumb"
            />
            <h3>{meal.strMeal}</h3>
            <p>{meal.strArea} • {meal.strCategory}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Search;


