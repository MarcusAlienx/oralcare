import { useEffect, useState } from "react";
import { Link } from "wouter";
import {
  useGetAdminStats,
  useListLeads,
  useUpdateLeadStatus,
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Users, Phone, Calendar, ArrowLeft, Activity, MessageSquare, Target } from "lucide-react";

type Patient = {
  id: number;
  name: string;
  email?: string | null;
  phone: string;
  notes?: string | null;
  createdAt: string;
};

type Appointment = {
  id: number;
  patient_id: number;
  service?: string | null;
  scheduled_at: string;
  status: string;
  notes?: string | null;
  createdAt: string;
};

export default function Admin() {
  const [token, setToken] = useState<string | null>(
    typeof window !== "undefined" ? window.localStorage.getItem("oralcare_admin_token") : null,
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loadingPatients, setLoadingPatients] = useState(false);
  const [loadingAppointments, setLoadingAppointments] = useState(false);

  const { data: stats, isLoading: statsLoading } = useGetAdminStats({
    query: {
      queryKey: ["adminStats"],
      enabled: !!token,
    },
  });
  const { data: leads, isLoading: leadsLoading } = useListLeads({
    query: {
      queryKey: ["leads"],
      enabled: !!token,
    },
  });
  const updateStatus = useUpdateLeadStatus();

  const authHeaders: Record<string, string> = token
    ? { Authorization: `Bearer ${token}` }
    : {};

  const fetchPatients = async () => {
    setLoadingPatients(true);
    try {
      const headers = new Headers({
        "Content-Type": "application/json",
        ...authHeaders,
      });
      const res = await fetch("/api/patients", {
        headers,
      });
      if (!res.ok) {
        throw new Error("No se pudieron cargar los pacientes.");
      }
      setPatients(await res.json());
    } finally {
      setLoadingPatients(false);
    }
  };

  const fetchAppointments = async () => {
    setLoadingAppointments(true);
    try {
      const headers = new Headers({
        "Content-Type": "application/json",
        ...authHeaders,
      });
      const res = await fetch("/api/appointments", {
        headers,
      });
      if (!res.ok) {
        throw new Error("No se pudieron cargar las citas.");
      }
      setAppointments(await res.json());
    } finally {
      setLoadingAppointments(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchPatients();
      fetchAppointments();
    }
  }, [token]);

  const handleStatusChange = (id: number, newStatus: string) => {
    updateStatus.mutate({ id, data: { status: newStatus } });
  };

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoginError(null);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorPayload = await response.json().catch(() => null);
        throw new Error(errorPayload?.error || "Login failed");
      }

      const result = await response.json();
      window.localStorage.setItem("oralcare_admin_token", result.token);
      setToken(result.token);
      setEmail("");
      setPassword("");
    } catch (error: any) {
      setLoginError(error?.message || "No se pudo iniciar sesión.");
    }
  };

  const handleLogout = () => {
    window.localStorage.removeItem("oralcare_admin_token");
    setToken(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "nuevo":
        return "bg-blue-100 text-blue-800";
      case "contactado":
        return "bg-yellow-100 text-yellow-800";
      case "cita_agendada":
        return "bg-purple-100 text-purple-800";
      case "completado":
        return "bg-green-100 text-green-800";
      default:
        return "bg-slate-100 text-slate-800";
    }
  };

  const formatStatus = (status: string) => {
    return status.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <Card className="w-full max-w-lg">
          <CardHeader>
            <CardTitle>Acceso Doctores</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">Correo</label>
                <input
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2"
                  type="email"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Contraseña</label>
                <input
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2"
                  type="password"
                  required
                />
              </div>
              {loginError && <p className="text-sm text-red-600">{loginError}</p>}
              <button type="submit" className="w-full rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark">
                Iniciar sesión
              </button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (statsLoading || leadsLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50"><Activity className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  const maxVisits = stats?.visitsLast7Days?.reduce((max, d) => Math.max(max, d.count), 1) || 1;

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <Link href="/" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-primary mb-4 transition-colors">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver al sitio
            </Link>
            <h1 className="text-3xl font-serif font-bold text-slate-900">Panel de Control</h1>
            <p className="text-slate-600">A&E OralCare - Resumen de actividad</p>
          </div>
          <button
            onClick={handleLogout}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Cerrar sesión
          </button>
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
              <Users className="w-4 h-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalVisits || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">Conversaciones</CardTitle>
              <Calendar className="w-4 h-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-secondary">{stats?.totalConversations || 0}</div>
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

        <div className="grid lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Pacientes Recientes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {patients?.slice(0, 8).map((patient) => (
                  <div key={patient.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="font-semibold text-slate-900">{patient.name}</p>
                        <p className="text-xs text-slate-500">{patient.phone}</p>
                      </div>
                      <Badge variant="outline">{format(new Date(patient.createdAt), "dd MMM yyyy", { locale: es })}</Badge>
                    </div>
                    {patient.notes && <p className="mt-2 text-sm text-slate-600 truncate">{patient.notes}</p>}
                  </div>
                ))}
                {(!patients || patients.length === 0) && (
                  <p className="text-sm text-slate-500">No hay pacientes registrados aún.</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Citas próximas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {appointments?.slice(0, 8).map((appointment) => (
                  <div key={appointment.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="font-semibold text-slate-900">{appointment.service || "Consulta"}</p>
                        <p className="text-xs text-slate-500">{format(new Date(appointment.scheduled_at), "dd MMM yyyy HH:mm", { locale: es })}</p>
                      </div>
                      <Badge variant="outline">{formatStatus(appointment.status)}</Badge>
                    </div>
                    <p className="mt-2 text-sm text-slate-600 truncate">{appointment.notes || "Sin notas"}</p>
                  </div>
                ))}
                {(!appointments || appointments.length === 0) && (
                  <p className="text-sm text-slate-500">No hay citas programadas aún.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}