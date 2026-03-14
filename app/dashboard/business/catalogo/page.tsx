"use client"

import { useState } from "react"
import { 
  Package, 
  Plus, 
  Search, 
  Filter,
  MoreVertical,
  Grid3X3,
  List,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Tag,
  DollarSign,
  Image as ImageIcon
} from "lucide-react"
import { Button } from "@/components/ui/button"

const products = [
  { 
    id: 1, 
    name: "Hamburguesa Clásica", 
    description: "Carne 200g, queso, lechuga, tomate, cebolla",
    price: 25.00,
    category: "Hamburguesas",
    stock: null,
    active: true,
    image: "/api/placeholder/200/200"
  },
  { 
    id: 2, 
    name: "Pizza Familiar", 
    description: "Pizza 16 pulgadas, hasta 4 ingredientes",
    price: 65.00,
    category: "Pizzas",
    stock: null,
    active: true,
    image: "/api/placeholder/200/200"
  },
  { 
    id: 3, 
    name: "Combo Familiar", 
    description: "2 hamburguesas + papas grandes + 2 bebidas",
    price: 55.00,
    category: "Combos",
    stock: null,
    active: true,
    image: "/api/placeholder/200/200"
  },
  { 
    id: 4, 
    name: "Alitas BBQ x12", 
    description: "12 alitas bañadas en salsa BBQ",
    price: 35.00,
    category: "Entradas",
    stock: 15,
    active: true,
    image: "/api/placeholder/200/200"
  },
  { 
    id: 5, 
    name: "Ensalada César", 
    description: "Lechuga romana, pollo, crutones, aderezo césar",
    price: 28.00,
    category: "Ensaladas",
    stock: null,
    active: false,
    image: "/api/placeholder/200/200"
  },
]

const categories = [
  { id: "all", label: "Todos", count: 45 },
  { id: "hamburguesas", label: "Hamburguesas", count: 8 },
  { id: "pizzas", label: "Pizzas", count: 12 },
  { id: "combos", label: "Combos", count: 6 },
  { id: "entradas", label: "Entradas", count: 10 },
  { id: "bebidas", label: "Bebidas", count: 9 },
]

export default function CatalogPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#0F1F63]">Catálogo</h1>
          <p className="text-muted-foreground mt-1">
            Gestiona tus productos y servicios
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="rounded-xl">
            <Tag className="w-4 h-4 mr-2" />
            Categorías
          </Button>
          <Button className="rounded-xl bg-gradient-to-r from-[#34D399] to-[#06B6D4] text-white">
            <Plus className="w-4 h-4 mr-2" />
            Nuevo producto
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total productos", value: "45", icon: Package, color: "#34D399" },
          { label: "Categorías", value: "6", icon: Tag, color: "#3B82F6" },
          { label: "Precio promedio", value: "$38.50", icon: DollarSign, color: "#F59E0B" },
          { label: "Productos activos", value: "42", icon: Eye, color: "#7C3AED" },
        ].map((stat) => (
          <div key={stat.label} className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${stat.color}15` }}
              >
                <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
              </div>
              <div>
                <p className="text-xl font-bold text-[#0F1F63]">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Categories filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedCategory === category.id
                ? "bg-[#34D399] text-white"
                : "bg-secondary text-muted-foreground hover:text-foreground"
            }`}
          >
            {category.label} ({category.count})
          </button>
        ))}
      </div>

      {/* Search and view mode */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar productos..."
            className="w-full h-11 pl-10 pr-4 rounded-xl border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-[#34D399]/20 focus:border-[#34D399]"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="rounded-xl">
            <Filter className="w-4 h-4 mr-2" />
            Filtros
          </Button>
          <div className="flex items-center border border-border rounded-xl overflow-hidden">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2.5 ${viewMode === "grid" ? "bg-secondary" : "hover:bg-secondary/50"}`}
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2.5 ${viewMode === "list" ? "bg-secondary" : "hover:bg-secondary/50"}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Products grid/list */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((product) => (
            <div 
              key={product.id}
              className={`bg-card rounded-xl border border-border overflow-hidden hover:shadow-md transition-all group ${
                !product.active ? "opacity-60" : ""
              }`}
            >
              {/* Product image */}
              <div className="aspect-square bg-secondary/50 relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <ImageIcon className="w-12 h-12 text-muted-foreground/30" />
                </div>
                {/* Overlay actions */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button className="p-2 rounded-lg bg-white/90 hover:bg-white">
                    <Edit className="w-4 h-4 text-[#0F1F63]" />
                  </button>
                  <button className="p-2 rounded-lg bg-white/90 hover:bg-white">
                    {product.active ? (
                      <EyeOff className="w-4 h-4 text-[#0F1F63]" />
                    ) : (
                      <Eye className="w-4 h-4 text-[#0F1F63]" />
                    )}
                  </button>
                </div>
                {/* Status badge */}
                {!product.active && (
                  <div className="absolute top-2 right-2 px-2 py-1 rounded-full bg-[#9CA3AF] text-white text-xs font-medium">
                    Oculto
                  </div>
                )}
              </div>
              {/* Product info */}
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <span className="text-xs font-medium text-[#34D399] bg-[#34D399]/10 px-2 py-0.5 rounded-full">
                    {product.category}
                  </span>
                  {product.stock !== null && (
                    <span className="text-xs text-muted-foreground">
                      Stock: {product.stock}
                    </span>
                  )}
                </div>
                <h3 className="font-semibold text-foreground mb-1">{product.name}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{product.description}</p>
                <p className="text-lg font-bold text-[#0F1F63]">${product.price.toFixed(2)}</p>
              </div>
            </div>
          ))}
          
          {/* Add product card */}
          <button className="aspect-[4/5] rounded-xl border-2 border-dashed border-border hover:border-[#34D399]/50 hover:bg-[#34D399]/5 transition-colors flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-[#34D399]">
            <Plus className="w-8 h-8" />
            <span className="text-sm font-medium">Agregar producto</span>
          </button>
        </div>
      ) : (
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-muted-foreground border-b border-border">
                <th className="p-4 font-medium">Producto</th>
                <th className="p-4 font-medium hidden md:table-cell">Categoría</th>
                <th className="p-4 font-medium">Precio</th>
                <th className="p-4 font-medium hidden lg:table-cell">Stock</th>
                <th className="p-4 font-medium">Estado</th>
                <th className="p-4 font-medium w-12"></th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-secondary/50 flex items-center justify-center">
                        <ImageIcon className="w-6 h-6 text-muted-foreground/30" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{product.name}</p>
                        <p className="text-sm text-muted-foreground line-clamp-1">{product.description}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 hidden md:table-cell">
                    <span className="text-xs font-medium text-[#34D399] bg-[#34D399]/10 px-2 py-1 rounded-full">
                      {product.category}
                    </span>
                  </td>
                  <td className="p-4 font-semibold text-[#0F1F63]">
                    ${product.price.toFixed(2)}
                  </td>
                  <td className="p-4 text-sm text-muted-foreground hidden lg:table-cell">
                    {product.stock !== null ? product.stock : "—"}
                  </td>
                  <td className="p-4">
                    {product.active ? (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-[#34D399]">
                        <Eye className="w-3 h-3" />
                        Activo
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground">
                        <EyeOff className="w-3 h-3" />
                        Oculto
                      </span>
                    )}
                  </td>
                  <td className="p-4">
                    <button className="p-2 rounded-lg hover:bg-secondary">
                      <MoreVertical className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
