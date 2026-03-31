import Link from "next/link"

export function FinalCTA() {
  return (
    <section className="py-28 text-center px-6">
      <div className="max-w-3xl mx-auto">

        <h2 className="text-4xl font-bold mb-6">
          Si sigues organizándote solo,
          <br /> vas a seguir perdiendo tiempo.
        </h2>

        <p className="text-muted-foreground mb-10">
          Deja que Operaly piense, recuerde y ejecute por ti.
        </p>

        <Link
          href="/register"
          className="px-8 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-purple-500 text-white font-semibold shadow-lg"
        >
          Empezar ahora
        </Link>

      </div>
    </section>
  )
}
