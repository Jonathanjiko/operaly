import { NextResponse } from "next/server"
import { OPERLAY_PLANS } from "@/lib/plans"

export const dynamic = "force-dynamic"

export async function GET() {
  return NextResponse.json({
    plans: [
      { code: "trial", name: "Trial", price_pen: 0, price_usd: 0, duration_days: 7 },
      ...OPERLAY_PLANS.filter((plan) => plan.code !== "trial").map((plan) => ({
        code: plan.code,
        name: plan.name,
        price_pen: plan.price,
        price_usd: plan.price / 5,
        per: "mes",
      })),
    ],
  })
}
