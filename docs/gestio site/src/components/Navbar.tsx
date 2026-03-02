import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import GestioLogo from "./GestioLogo";
import { Download, Menu, X } from "lucide-react";

const navLinks = [
	{ label: "Fonctionnalités", to: "/fonctionnalites" },
	{ label: "Sécurité", to: "/securite" },
	{ label: "Aperçu", to: "/apercu" },
	{ label: "Guides", to: "/guides" },
	{ label: "FAQ", to: "/faq" },
];

const Navbar = () => {
	const [open, setOpen] = useState(false);
	const location = useLocation();

	const isActive = (path: string) => location.pathname === path;

	return (
		<>
			<nav className="fixed top-0 left-0 right-0 z-50 glass-nav border-b border-border">
				<div className="container flex items-center justify-between h-[72px]">
					{/* Logo */}
					<Link
						to="/"
						className="flex items-center gap-3 text-2xl font-bold text-foreground no-underline"
					>
						<GestioLogo />
						Gestio
					</Link>

					{/* Desktop nav */}
					<ul className="hidden md:flex gap-8 list-none m-0 p-0">
						{navLinks.map((l) => (
							<li key={l.label}>
								<Link
									to={l.to}
									className={`transition-colors text-[0.9375rem] font-medium no-underline ${isActive(l.to)
										? "text-primary"
										: "text-muted-foreground hover:text-primary"
										}`}
								>
									{l.label}
								</Link>
							</li>
						))}
					</ul>

					{/* CTA Télécharger */}
					<Link
						to="/telecharger"
						className="hidden md:inline-flex items-center gap-2 bg-gradient-primary text-primary-foreground px-6 py-2.5 rounded-lg font-semibold text-[0.9375rem] hover:-translate-y-0.5 hover:shadow-primary-hover transition-all no-underline"
					>
						<Download className="w-4 h-4" />
						Télécharger
					</Link>

					{/* Burger mobile */}
					<button
						className="md:hidden p-2"
						onClick={() => setOpen(true)}
						aria-label="Ouvrir le menu"
					>
						<Menu className="w-7 h-7 text-foreground" />
					</button>
				</div>
			</nav>

			{/* Mobile overlay */}
			{open && (
				<div className="fixed inset-0 z-[999] bg-background/[0.98] backdrop-blur-sm flex flex-col items-center justify-center gap-8">
					<button
						className="absolute top-6 right-6"
						onClick={() => setOpen(false)}
						aria-label="Fermer le menu"
					>
						<X className="w-8 h-8 text-foreground" />
					</button>

					{navLinks.map((l) => (
						<Link
							key={l.label}
							to={l.to}
							onClick={() => setOpen(false)}
							className={`text-2xl font-semibold no-underline ${isActive(l.to) ? "text-primary" : "text-foreground"
								}`}
						>
							{l.label}
						</Link>
					))}

					<Link
						to="/telecharger"
						onClick={() => setOpen(false)}
						className="inline-flex items-center gap-2 bg-gradient-primary text-primary-foreground px-8 py-4 rounded-xl font-semibold no-underline"
					>
						<Download className="w-5 h-5" />
						Télécharger
					</Link>
				</div>
			)}
		</>
	);
};

export default Navbar;


