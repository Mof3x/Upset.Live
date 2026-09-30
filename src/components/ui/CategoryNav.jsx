import "../../pages/CorePages.css";

export default function CategoryNav({ label, categories, activeCategory, onChange }) {
  if (categories.length < 2) return null;

  return (
    <nav className="category-nav" aria-label={label}>
      <p className="category-nav__label">Filter by</p>
      <div className="category-nav__options">
        {categories.map((category) => (
          <button
            className="category-nav__option"
            type="button"
            key={category}
            aria-pressed={activeCategory === category}
            onClick={() => onChange(category)}
          >
            {category}
          </button>
        ))}
      </div>
    </nav>
  );
}
