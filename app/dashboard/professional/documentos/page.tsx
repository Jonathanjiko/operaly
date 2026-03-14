"use client"

import { useState } from "react"
import { 
  FileText, 
  Upload, 
  Search, 
  Filter, 
  Grid3X3, 
  List, 
  MoreVertical,
  Download,
  Trash2,
  Eye,
  FolderOpen,
  FileSpreadsheet,
  FileImage,
  File,
  Plus,
  Sparkles,
  MessageSquare
} from "lucide-react"
import { Button } from "@/components/ui/button"

const documents = [
  { id: 1, name: "Contrato-Cliente-2024-001.pdf", type: "pdf", size: "2.4 MB", date: "12 Mar 2024", client: "María García", analyzed: true },
  { id: 2, name: "Análisis-Financiero-Q1.xlsx", type: "excel", size: "1.8 MB", date: "10 Mar 2024", client: "Carlos López", analyzed: true },
  { id: 3, name: "Propuesta-Comercial.docx", type: "word", size: "540 KB", date: "8 Mar 2024", client: "Ana Martínez", analyzed: false },
  { id: 4, name: "Acta-Reunión-Marzo.pdf", type: "pdf", size: "320 KB", date: "5 Mar 2024", client: null, analyzed: true },
  { id: 5, name: "Evidencia-Fotográfica.jpg", type: "image", size: "4.2 MB", date: "3 Mar 2024", client: "Pedro Sánchez", analyzed: false },
  { id: 6, name: "Reporte-Mensual.pdf", type: "pdf", size: "1.1 MB", date: "1 Mar 2024", client: null, analyzed: true },
]

const folders = [
  { id: 1, name: "Contratos", count: 24, color: "#3B82F6" },
  { id: 2, name: "Facturas", count: 56, color: "#34D399" },
  { id: 3, name: "Propuestas", count: 12, color: "#F59E0B" },
  { id: 4, name: "Reportes", count: 18, color: "#7C3AED" },
]

const getFileIcon = (type: string) => {
  switch (type) {
    case "pdf": return <FileText className="w-6 h-6 text-[#EF4444]" />
    case "excel": return <FileSpreadsheet className="w-6 h-6 text-[#34D399]" />
    case "word": return <FileText className="w-6 h-6 text-[#3B82F6]" />
    case "image": return <FileImage className="w-6 h-6 text-[#7C3AED]" />
    default: return <File className="w-6 h-6 text-muted-foreground" />
  }
}

export default function DocumentsPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("list")
  const [searchQuery, setSearchQuery] = useState("")

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#0F1F63]">Documentos</h1>
          <p className="text-muted-foreground mt-1">
            Gestiona y analiza tus documentos con Sofía
          </p>
        </div>
        <Button className="rounded-xl bg-gradient-to-r from-[#3B82F6] to-[#06B6D4] text-white">
          <Upload className="w-4 h-4 mr-2" />
          Subir documento
        </Button>
      </div>

      {/* Sofia analysis hint */}
      <div className="bg-gradient-to-r from-[#7C3AED]/5 via-[#3B82F6]/5 to-[#06B6D4]/5 rounded-2xl border border-[#7C3AED]/20 p-5">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#7C3AED] to-[#3B82F6] flex items-center justify-center shrink-0">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-[#0F1F63]">Análisis inteligente con Sofía</h3>
            <p className="text-sm text-muted-foreground">
              Sube tus documentos y pregúntale a Sofía cualquier cosa sobre ellos. Puede resumir, extraer datos y responder preguntas.
            </p>
          </div>
          <Button variant="outline" className="rounded-xl hidden md:flex">
            <MessageSquare className="w-4 h-4 mr-2" />
            Preguntar a Sofía
          </Button>
        </div>
      </div>

      {/* Folders */}
      <div>
        <h3 className="text-sm font-medium text-muted-foreground mb-4">Carpetas</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {folders.map((folder) => (
            <button 
              key={folder.id}
              className="flex items-center gap-3 p-4 rounded-xl bg-card border border-border hover:shadow-md hover:border-[#3B82F6]/30 transition-all text-left"
            >
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${folder.color}15` }}
              >
                <FolderOpen className="w-5 h-5" style={{ color: folder.color }} />
              </div>
              <div>
                <p className="font-medium text-foreground">{folder.name}</p>
                <p className="text-sm text-muted-foreground">{folder.count} archivos</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Search and filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar documentos..."
            className="w-full h-11 pl-10 pr-4 rounded-xl border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20 focus:border-[#3B82F6]"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="rounded-xl">
            <Filter className="w-4 h-4 mr-2" />
            Filtros
          </Button>
          <div className="flex items-center border border-border rounded-xl overflow-hidden">
            <button
              onClick={() => setViewMode("list")}
              className={`p-2.5 ${viewMode === "list" ? "bg-secondary" : "hover:bg-secondary/50"}`}
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2.5 ${viewMode === "grid" ? "bg-secondary" : "hover:bg-secondary/50"}`}
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Documents list */}
      {viewMode === "list" ? (
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-muted-foreground border-b border-border">
                <th className="p-4 font-medium">Nombre</th>
                <th className="p-4 font-medium hidden md:table-cell">Cliente</th>
                <th className="p-4 font-medium hidden lg:table-cell">Tamaño</th>
                <th className="p-4 font-medium hidden md:table-cell">Fecha</th>
                <th className="p-4 font-medium">Estado</th>
                <th className="p-4 font-medium w-12"></th>
              </tr>
            </thead>
            <tbody>
              {documents.map((doc) => (
                <tr key={doc.id} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-secondary/50 flex items-center justify-center">
                        {getFileIcon(doc.type)}
                      </div>
                      <span className="font-medium text-foreground">{doc.name}</span>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-muted-foreground hidden md:table-cell">
                    {doc.client || "—"}
                  </td>
                  <td className="p-4 text-sm text-muted-foreground hidden lg:table-cell">{doc.size}</td>
                  <td className="p-4 text-sm text-muted-foreground hidden md:table-cell">{doc.date}</td>
                  <td className="p-4">
                    {doc.analyzed ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#7C3AED]/10 text-[#7C3AED] text-xs font-medium">
                        <Sparkles className="w-3 h-3" />
                        Analizado
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full bg-secondary text-muted-foreground text-xs font-medium">
                        Sin analizar
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
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {documents.map((doc) => (
            <div key={doc.id} className="bg-card rounded-xl border border-border p-4 hover:shadow-md hover:border-[#3B82F6]/30 transition-all">
              <div className="aspect-square rounded-lg bg-secondary/50 flex items-center justify-center mb-4">
                {getFileIcon(doc.type)}
              </div>
              <p className="font-medium text-foreground text-sm truncate">{doc.name}</p>
              <p className="text-xs text-muted-foreground mt-1">{doc.size} • {doc.date}</p>
              {doc.analyzed && (
                <span className="inline-flex items-center gap-1 mt-2 text-xs text-[#7C3AED]">
                  <Sparkles className="w-3 h-3" />
                  Analizado
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
