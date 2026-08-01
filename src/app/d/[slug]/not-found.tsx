export default function ProposalNotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-6 py-12 text-center">
      <div className="max-w-sm">
        <p className="font-serif text-5xl" aria-hidden="true">
          💌
        </p>
        <h1 className="mt-6 font-serif text-3xl text-bordeaux-600">Cette lettre est introuvable</h1>
        <p className="mt-3 text-sm leading-relaxed text-ink-400">
          Le lien est peut-être incomplet, ou l&apos;invitation a été supprimée. Vérifiez l&apos;adresse
          auprès de la personne qui vous l&apos;a envoyée.
        </p>
      </div>
    </main>
  );
}
