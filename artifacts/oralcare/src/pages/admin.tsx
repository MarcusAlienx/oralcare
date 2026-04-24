import { useState } from "react";
import { Link } from "wouter";
import { 
  useGetAdminStats, 
  useListLeads, 
  useUpdateLeadStatus 
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Users, Phone, Calendar, ArrowLeft, Activity, MessageSquare, Target } from "lucide-react";

export default function Admin() {
  const { data: stats, isLoading: statsLoading } = useGetAdminStats();
  const { data: leads, isLoading: leadsLoading } = useListLeads();
  const updateStatus = useUpdateLeadStatus();

  const handleStatusChange = (id: number, newStatus: string) => {
    updateStatus.mutate({ id, data: { status: newStatus } });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "nuevo": return "bg-blue-100 text-blue-800";
      case "contactado": return "bg-yellow-100 text-yellow-800";
      case "cita_agendada": return "bg-purple-100 text-purple-800";
      case "completado": return "bg-green-100 text-green-800";
      default: return "bg-slate-100 text-slate-800";
    }
  };

  const formatStatus = (status: string) => {
    return status.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase());
  };

  if (statsLoading || leadsLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50"><Activity className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  const maxVisits = stats?.visitsLast7Days?.reduce((max, d) => Math.max(max, d.count), 1) || 1;

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <Link href="/" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-primary mb-4 transition-colors">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver al sitio
            </Link>
            <h1 className="text-3xl font-serif font-bold text-slate-900">Panel de Control</h1>
            <p className="text-slate-600">A&E OralCare - Resumen de actividad</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">Leads Totales</CardTitle>
              <Users className="w-4 h-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalLeads || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">Leads Hoy</CardTitle>
              <Target className="w-4 h-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{stats?.newLeadsToday || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">Visitas Totales</CardTitle>
              <Activity className="w-4 h-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalVisits || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">Visitas Hoy</CardTitle>
              <Activity className="w-4 h-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-secondary">{stats?.visitsToday || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">Chats</CardTitle>
              <MessageSquare className="w-4 h-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalConversations || 0}</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Chart */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Visitas (Últimos 7 días)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[200px] flex items-end gap-2 pt-4">
                {stats?.visitsLast7Days?.map((day, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                    <div 
                      className="w-full bg-primary/20 rounded-t-sm group-hover:bg-primary transition-colors relative"
                      style={{ height: `${Math.max((day.count / maxVisits) * 100, 5)}%` }}
                    >
                      <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-medium text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity">
                        {day.count}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500 truncate w-full text-center">
                      {format(new Date(day.date), "EEE", { locale: es })}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Leads Table */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Gestión de Leads</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-slate-500 uppercase bg-slate-50">
                    <tr>
                      <th className="px-4 py-3 rounded-tl-lg">Contacto</th>
                      <th className="px-4 py-3">Servicio / Mensaje</th>
                      <th className="px-4 py-3">Fecha</th>
                      <th className="px-4 py-3 rounded-tr-lg">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leads?.map((lead) => (
                      <tr key={lead.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                        <td className="px-4 py-4">
                          <div className="font-medium text-slate-900">{lead.name}</div>
                          <div className="flex items-center gap-3 text-slate-500 mt-1 text-xs">
                            <a href={`tel:${lead.phone}`} className="flex items-center gap-1 hover:text-primary">
                              <Phone className="w-3 h-3" /> {lead.phone}
                            </a>
                          </div>
                        </td>
                        <td className="px-4 py-4 max-w-[200px]">
                          <Badge variant="outline" className="mb-1">{lead.service || "General"}</Badge>
                          {lead.message && (
                            <p className="text-xs text-slate-500 truncate" title={lead.message}>
                              {lead.message}
                            </p>
                          )}
                        </td>
                        <td className="px-4 py-4 text-slate-500">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {format(new Date(lead.createdAt), "dd MMM yyyy", { locale: es })}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <Select 
                            defaultValue={lead.status} 
                            onValueChange={(val) => handleStatusChange(lead.id, val)}
                          >
                            <SelectTrigger className={`h-8 border-0 ${getStatusColor(lead.status)}`}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="nuevo">Nuevo</SelectItem>
                              <SelectItem value="contactado">Contactado</SelectItem>
                              <SelectItem value="cita_agendada">Cita Agendada</SelectItem>
                              <SelectItem value="completado">Completado</SelectItem>
                            </SelectContent>
                          </Select>
                        </td>
                      </tr>
                    ))}
                    {(!leads || leads.length === 0) && (
                      <tr>
                        <td colSpan={4} className="px-4 py-8 text-center text-slate-500">
                          No hay leads registrados aún.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}