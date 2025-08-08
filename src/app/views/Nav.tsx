import { NavLink } from "react-router-dom";

const navItems = [
  { path: "/dashboard", label: "Dashboard" },
  { path: "/products", label: "Products" },
  { path: "/orders", label: "Orders" },
  { path: "/settings", label: "Settings" },
  { path: "/shop-setup", label: "Shop Setup" },
];

export function Nav() {
  return (
    <nav className="nav">
      <ul>
        {navItems.map((item) => (
          <li key={item.path}>
            <NavLink
              to={item.path}
              className={({ isActive }) =>
                isActive ? "nav-link active" : "nav-link"
              }
            >
              {item.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
