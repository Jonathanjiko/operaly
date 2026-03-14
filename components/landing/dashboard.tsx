"use client"

import { MessageSquare, Users, Calendar, TrendingUp, Bell, Settings, LayoutDashboard, ShoppingBag, Bot, Search, ChevronRight, ArrowUpRight, Sparkles } from "lucide-react"

export function Dashboard() {
  return (
    <section id="dashboard" className="py-24 md:py-32 overflow-hidden relative">
      {/* Background with subtle gradient mesh */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0F1F63]/[0.02] via-transparent to-[#3B82F6]/[0.03]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-[#3B82F6]/5 to-transparent rounded-full blur-3xl" />
      
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative">
        {/* Section header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-[#34D399]/10 to-[#06B6D4]/10 text-[#34D399] text-sm font-semibold mb-4 border border-[#34D399]/20">
            <Sparkles className="w-3.5 h-3.5" />
            Panel de Control
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#0F1F63] text-balance">
            Mira cómo funciona Operaly
          </h2>
          <p className="mt-4 text-lg text-muted-foreground text-pretty">
            Un panel simple e inteligente para gestionar clientes, ventas, agenda y conversaciones desde un solo lugar.
          </p>
        </div>

        {/* Dashboard mockup */}
        <div className="relative max-w-6xl mx-auto perspective-1000">
          {/* Multiple glow layers for depth */}
          <div className="absolute -inset-4 bg-gradient-to-r from-[#3B82F6]/30 via-[#06B6D4]/20 to-[#34D399]/30 rounded-[2rem] blur-3xl opacity-60" />
          <div className="absolute -inset-1 bg-gradient-to-r from-[#3B82F6]/10 to-[#06B6D4]/10 rounded-[2rem] blur-xl" />
          
          {/* Main dashboard card with glass effect */}
          <div className="relative bg-white/80 dark:bg-card/80 backdrop-blur-xl rounded-2xl border border-white/20 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.14)] overflow-hidden">
            {/* Premium browser header */}
            <div className="px-4 py-3 border-b border-black/5 bg-gradient-to-r from-[#f8f9fa] to-[#f1f3f4]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-[#ff5f57] shadow-inner" />
                    <div className="w-3 h-3 rounded-full bg-[#febc2e] shadow-inner" />
                    <div className="w-3 h-3 rounded-full bg-[#28c840] shadow-inner" />
                  </div>
                  <div className="hidden sm:flex items-center ml-4 px-4 py-1.5 rounded-lg bg-white border border-black/5 shadow-sm">
                    <Search className="w-3.5 h-3.5 text-muted-foreground mr-2" />
                    <span className="text-sm text-muted-foreground">app.operaly.com/dashboard</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#3B82F6] to-[#06B6D4] flex items-center justify-center">
                    <span className="text-[10px] text-white font-medium">JD</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Dashboard content */}
            <div className="flex min-h-[520px]">
              {/* Sidebar with glass effect */}
              <div className="hidden md:flex flex-col w-60 border-r border-black/5 bg-gradient-to-b from-[#fafbfc] to-white p-4">
                <div className="flex items-center gap-3 mb-8 px-2">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#3B82F6] via-[#06B6D4] to-[#34D399] flex items-center justify-center shadow-lg shadow-[#3B82F6]/20">
                    <span className="text-white font-bold text-sm">O</span>
                  </div>
                  <div>
                    <span className="font-semibold text-[#0F1F63]">Operaly</span>
                    <div className="text-[10px] text-muted-foreground">Business Pro</div>
                  </div>
                </div>
                
                <nav className="space-y-1 flex-1">
                  {[
                    { icon: LayoutDashboard, label: "Resumen", active: true },
                    { icon: Users, label: "Clientes", active: false, badge: "234" },
                    { icon: MessageSquare, label: "Conversaciones", active: false, badge: "12" },
                    { icon: ShoppingBag, label: "Ventas", active: false },
                    { icon: Calendar, label: "Agenda", active: false },
                    { icon: Bell, label: "Recordatorios", active: false, badge: "3" },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className={`group flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                        item.active 
                          ? "bg-gradient-to-r from-[#3B82F6] to-[#06B6D4] text-white shadow-lg shadow-[#3B82F6]/25" 
                          : "text-[#0F1F63]/70 hover:bg-[#0F1F63]/5"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon className="w-4 h-4" />
                        {item.label}
                      </div>
                      {item.badge && !item.active && (
                        <span className="px-2 py-0.5 rounded-full bg-[#3B82F6]/10 text-[#3B82F6] text-xs font-medium">
                          {item.badge}
                        </span>
                      )}
                    </div>
                  ))}
                </nav>

                <div className="mt-auto pt-4 border-t border-black/5">
                  <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#0F1F63]/5 cursor-pointer transition-all">
                    <Settings className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Configuración</span>
                  </div>
                </div>
              </div>

              {/* Main content area */}
              <div className="flex-1 p-6 bg-gradient-to-br from-[#fafbfc] to-white">
                {/* Header with greeting */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-semibold text-[#0F1F63]">Buenos días, Juan</h3>
                    <p className="text-sm text-muted-foreground">Aquí está el resumen de tu negocio</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#34D399]/10 text-[#34D399] text-xs font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#34D399] animate-pulse" />
                      Sofía activa
                    </span>
                  </div>
                </div>

                {/* Premium stats cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  {[
                    { icon: Users, label: "Clientes activos", value: "234", change: "+12%", color: "#34D399", gradient: "from-[#34D399] to-[#06B6D4]" },
                    { icon: MessageSquare, label: "Conversaciones hoy", value: "47", change: "+23%", color: "#3B82F6", gradient: "from-[#3B82F6] to-[#7C3AED]" },
                    { icon: ShoppingBag, label: "Ventas del mes", value: "$4,250", change: "+18%", color: "#06B6D4", gradient: "from-[#06B6D4] to-[#34D399]" },
                    { icon: TrendingUp, label: "Tasa de conversión", value: "24%", change: "+5%", color: "#7C3AED", gradient: "from-[#7C3AED] to-[#3B82F6]" },
                  ].map((stat) => (
                    <div 
                      key={stat.label} 
                      className="group relative p-4 rounded-2xl bg-white border border-black/5 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden"
                    >
                      {/* Subtle gradient overlay on hover */}
                      <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-[0.03] transition-opacity`} />
                      
                      <div className="relative">
                        <div className="flex items-center justify-between mb-3">
                          <div 
                            className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-lg`}
                            style={{ boxShadow: `0 8px 16px -4px ${stat.color}40` }}
                          >
                            <stat.icon className="w-5 h-5 text-white" />
                          </div>
                          <span className="flex items-center gap-0.5 text-xs font-medium text-[#34D399]">
                            <ArrowUpRight className="w-3 h-3" />
                            {stat.change}
                          </span>
                        </div>
                        <div className="text-2xl font-bold text-[#0F1F63]">{stat.value}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">{stat.label}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="grid lg:grid-cols-5 gap-6">
                  {/* Activity chart - takes 3 columns */}
                  <div className="lg:col-span-3 rounded-2xl bg-white border border-black/5 shadow-sm p-5">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <div className="text-sm font-semibold text-[#0F1F63]">Actividad semanal</div>
                        <div className="text-xs text-muted-foreground">Conversaciones e interacciones</div>
                      </div>
                      <div className="flex items-center gap-4 text-xs">
                        <span className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-gradient-to-r from-[#3B82F6] to-[#06B6D4]" />
                          Conversaciones
                        </span>
                        <span className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-[#34D399]" />
                          Ventas
                        </span>
                      </div>
                    </div>
                    <div className="h-40 flex items-end justify-around gap-3">
                      {[
                        { day: "Lun", conv: 45, sales: 20 },
                        { day: "Mar", conv: 68, sales: 35 },
                        { day: "Mié", conv: 52, sales: 28 },
                        { day: "Jue", conv: 85, sales: 45 },
                        { day: "Vie", conv: 60, sales: 32 },
                        { day: "Sáb", conv: 95, sales: 55 },
                        { day: "Dom", conv: 75, sales: 40 },
                      ].map((bar) => (
                        <div key={bar.day} className="flex-1 flex flex-col items-center gap-2">
                          <div className="w-full flex items-end justify-center gap-1 h-32">
                            <div
                              className="w-3 rounded-full bg-gradient-to-t from-[#3B82F6] to-[#06B6D4] transition-all duration-500"
                              style={{ height: `${bar.conv}%` }}
                            />
                            <div
                              className="w-3 rounded-full bg-[#34D399] transition-all duration-500"
                              style={{ height: `${bar.sales}%` }}
                            />
                          </div>
                          <span className="text-[11px] text-muted-foreground font-medium">{bar.day}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* WhatsApp preview - takes 2 columns */}
                  <div className="lg:col-span-2 rounded-2xl bg-gradient-to-br from-[#0F1F63] via-[#1a2d7c] to-[#0F1F63] p-5 text-white relative overflow-hidden">
                    {/* Decorative elements */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#3B82F6]/20 to-transparent rounded-full blur-2xl" />
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-[#34D399]/20 to-transparent rounded-full blur-2xl" />
                    
                    <div className="relative">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-[#25D366] flex items-center justify-center shadow-lg shadow-[#25D366]/30">
                            <MessageSquare className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <div className="text-sm font-medium">WhatsApp Business</div>
                            <div className="text-[10px] text-white/50">En línea</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-white/10 text-[10px]">
                          <Bot className="w-3 h-3" />
                          Sofía
                        </div>
                      </div>

                      {/* Omnichannel icons */}
                      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/10">
                        <span className="text-[10px] text-white/50 mr-1">Canales:</span>
                        <div className="w-6 h-6 rounded-full bg-[#25D366] flex items-center justify-center" title="WhatsApp">
                          <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                          </svg>
                        </div>
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#E4405F] to-[#C13584] flex items-center justify-center" title="Instagram">
                          <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                          </svg>
                        </div>
                        <div className="w-6 h-6 rounded-full bg-[#1877F2] flex items-center justify-center" title="Facebook Messenger">
                          <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 0C5.373 0 0 4.974 0 11.111c0 3.498 1.744 6.614 4.469 8.654V24l4.088-2.242c1.092.3 2.246.464 3.443.464 6.627 0 12-4.975 12-11.111S18.627 0 12 0zm1.191 14.963l-3.055-3.26-5.963 3.26L10.732 8l3.131 3.259L19.752 8l-6.561 6.963z"/>
                          </svg>
                        </div>
                        <div className="w-6 h-6 rounded-full bg-black flex items-center justify-center" title="TikTok">
                          <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
                          </svg>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex justify-start">
                          <div className="bg-white/10 backdrop-blur-sm rounded-2xl rounded-tl-sm px-4 py-2.5 max-w-[85%]">
                            <p className="text-sm">Hola, quiero reservar una cita para mañana a las 3pm</p>
                            <span className="text-[10px] text-white/40 mt-1 block">10:32</span>
                          </div>
                        </div>
                        
                        <div className="flex justify-end">
                          <div className="bg-gradient-to-r from-[#3B82F6] to-[#06B6D4] rounded-2xl rounded-tr-sm px-4 py-2.5 max-w-[85%] shadow-lg shadow-[#3B82F6]/20">
                            <p className="text-sm">¡Hola! Claro, tengo disponibilidad mañana a las 3pm. ¿Te confirmo la cita?</p>
                            <span className="text-[10px] text-white/60 mt-1 block">10:32 - Sofía</span>
                          </div>
                        </div>
                        
                        <div className="flex justify-start">
                          <div className="bg-white/10 backdrop-blur-sm rounded-2xl rounded-tl-sm px-4 py-2.5">
                            <p className="text-sm">Sí, por favor</p>
                            <span className="text-[10px] text-white/40 mt-1 block">10:33</span>
                          </div>
                        </div>

                        <div className="flex justify-end">
                          <div className="bg-gradient-to-r from-[#34D399] to-[#06B6D4] rounded-2xl rounded-tr-sm px-4 py-2.5 max-w-[85%] shadow-lg shadow-[#34D399]/20">
                            <p className="text-sm">¡Perfecto! Tu cita está confirmada para mañana a las 3pm. Te enviaré un recordatorio.</p>
                            <span className="text-[10px] text-white/60 mt-1 block">10:33 - Sofía</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent activity with premium styling */}
                <div className="mt-6 rounded-2xl bg-white border border-black/5 shadow-sm p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-sm font-semibold text-[#0F1F63]">Actividad reciente</div>
                    <button className="flex items-center gap-1 text-xs text-[#3B82F6] font-medium hover:underline">
                      Ver todo <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="space-y-2">
                    {[
                      { name: "María García", action: "Nueva reserva agendada", time: "hace 2 min", gradient: "from-[#34D399] to-[#06B6D4]" },
                      { name: "Carlos López", action: "Consulta sobre precios", time: "hace 5 min", gradient: "from-[#3B82F6] to-[#7C3AED]" },
                      { name: "Ana Martínez", action: "Pago confirmado - $120", time: "hace 8 min", gradient: "from-[#06B6D4] to-[#34D399]" },
                    ].map((activity) => (
                      <div key={activity.name} className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#0F1F63]/[0.02] transition-colors cursor-pointer group">
                        <div 
                          className={`w-10 h-10 rounded-full bg-gradient-to-br ${activity.gradient} flex items-center justify-center text-white font-medium text-sm shadow-lg`}
                        >
                          {activity.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-[#0F1F63] truncate">{activity.name}</div>
                          <div className="text-xs text-muted-foreground truncate">{activity.action}</div>
                        </div>
                        <div className="text-xs text-muted-foreground whitespace-nowrap">{activity.time}</div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Note with premium styling */}
        <div className="text-center mt-10">
          <p className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[#3B82F6]/5 to-[#06B6D4]/5 text-muted-foreground text-sm border border-[#3B82F6]/10">
            <Bot className="w-4 h-4 text-[#3B82F6]" />
            Sofía trabaja contigo y con tus clientes directamente desde WhatsApp
          </p>
        </div>
      </div>
    </section>
  )
}
