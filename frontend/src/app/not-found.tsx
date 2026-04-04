import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-8">
      <h1 className="text-4xl font-bold mb-4">Page non trouvée</h1>
      <p className="text-muted-foreground mb-8 text-center">
        Cette page n'existe pas ou n'a pas pu être chargée.<br />
        Essayez de double-cliquer sur les onglets dans la sidebar pour naviguer.
      </p>
      <Link 
        href="/dashboard" 
        className="px-6 py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors"
      >
        Retour au tableau de bord
      </Link>
    </div>
  );
}