import { Link } from 'react-router-dom';
import './Breadcrumbs.css';

function Breadcrumbs({ items }) {
  if (!items || items.length === 0) return null;

  return (
    <nav className="gc-breadcrumbs" aria-label="Breadcrumb">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <span key={index} className="gc-breadcrumb-item">
            {isLast ? (
              <span className="gc-breadcrumb-current">{item.label}</span>
            ) : (
              <>
                <Link to={item.path} className="gc-breadcrumb-link">
                  {item.label}
                </Link>
                <span className="gc-breadcrumb-separator">/</span>
              </>
            )}
          </span>
        );
      })}
    </nav>
  );
}

export default Breadcrumbs;
