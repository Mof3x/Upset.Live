import "../../pages/CorePages.css";

// `title` is the small heading above the options ("Filter by" unless given).
export default function CategoryNav({ label, title = "Filter by", categories, activeCategory, onChange }) {
  if (categories.length < 2) return null;

  return (
    <nav className="category-nav" aria-label={label}>
      <p className="category-nav__label">{title}</p>
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
