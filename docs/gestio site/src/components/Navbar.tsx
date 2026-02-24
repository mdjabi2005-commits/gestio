import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import GestioLogo from "./GestioLogo";
import { Download, Menu, X } from "lucide-react";

const navLinks = [
	{ label: "Fonctionnalités", page: "/", anchor: "fonctionnalites" },
	{ label: "Sécurité", page: "/", anchor: "securite" },
	{ label: "Aperçu", page: "/", anchor: "captures" },
	{ label: "Guides", page: "/guides", anchor: null },
	{ label: "FAQ", page: "/faq", anchor: null },
];

const scrollToAnchor = (anchor: string) => {
  requestAnimationFrame(() => {
    const el = document.getElementById(anchor);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  });
};

const Navbar = () => {
	const [open, setOpen] = useState(false);
	const location = useLocation();
	const navigate = useNavigate();

	const handleAnchor = (page: string, anchor: string, closeMobile = false) => {
		if (closeMobile) setOpen(false);

		if (location.pathname !== page) {
			// On change de page → on passe l'ancre en state, Index.tsx s'en charge
			navigate(page, { state: { anchor } });
		} else {
			// Déjà sur la bonne page → scroll direct
			scrollToAnchor(anchor);
		}
	};

	const isActive = (page: string) => location.pathname === page;

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
								{l.anchor ? (
									<button
										onClick={() => handleAnchor(l.page, l.anchor!)}
										className={`transition-colors text-[0.9375rem] font-medium bg-transparent border-none cursor-pointer p-0 ${
											isActive(l.page)
												? "text-primary"
												: "text-muted-foreground hover:text-primary"
										}`}
									>
										{l.label}
									</button>
								) : (
									<Link
										to={l.page}
										className={`transition-colors text-[0.9375rem] font-medium no-underline ${
											isActive(l.page)
												? "text-primary"
												: "text-muted-foreground hover:text-primary"
										}`}
									>
										{l.label}
									</Link>
								)}
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

					{navLinks.map((l) =>
						l.anchor ? (
							<button
								key={l.label}
								onClick={() => handleAnchor(l.page, l.anchor!, true)}
								className="text-2xl font-semibold text-foreground bg-transparent border-none cursor-pointer"
							>
								{l.label}
							</button>
						) : (
							<Link
								key={l.label}
								to={l.page}
								onClick={() => setOpen(false)}
								className="text-2xl font-semibold text-foreground no-underline"
							>
								{l.label}
							</Link>
						)
					)}

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
