import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import {
  Calendar, Users, CreditCard, Tag, Star, LayoutDashboard,
  Clock, Plus, Copy, Check, Mail, Phone, Video, ExternalLink,
  Building2, BookOpen, Settings, ArrowLeft, RefreshCw, Search,
} from "lucide-react";
import { toast } from "sonner";
import { Link } from "wouter";

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "bookings", label: "Bookings", icon: Calendar },
  { id: "booking-types", label: "Booking Types", icon: BookOpen },
  { id: "availability", label: "Availability", icon: Clock },
  { id: "contacts", label: "Contacts", icon: Users },
  { id: "coupons", label: "Coupons", icon: Tag },
  { id: "reviews", label: "Reviews", icon: Star },
  { id: "settings", label: "Settings", icon: Settings },
];

const DAYS_OF_WEEK = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  confirmed: "bg-green-500/20 text-green-400 border-green-500/30",
  cancelled: "bg-red-500/20 text-red-400 border-red-500/30",
  completed: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  no_show: "bg-slate-500/20 text-slate-400 border-slate-500/30",
};

function formatPrice(cents: number): string {
  if (cents === 0) return "Free";
  return `$${(cents / 100).toFixed(0)}`;
}

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h} hr`;
}

function formatDateTime(ts: Date | string | number): string {
  return new Date(ts).toLocaleString("en-US", {
    month: "short", day: "numeric", year: "numeric",
    hour: "numeric", minute: "2-digit",
  });
}

// ── Dashboard Overview ────────────────────────────────────────────────────────
function DashboardPanel() {
  const { data: stats } = trpc.booking.admin.getDashboardStats.useQuery();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-1">Dashboard</h2>
        <p className="text-slate-400">Overview of your booking activity</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Bookings", value: stats?.total ?? 0, icon: Calendar, color: "text-cyan-400" },
          { label: "Confirmed", value: stats?.confirmed ?? 0, icon: Check, color: "text-green-400" },
          { label: "Pending", value: stats?.pending ?? 0, icon: Clock, color: "text-yellow-400" },
          { label: "Revenue", value: formatPrice(stats?.revenue ?? 0), icon: CreditCard, color: "text-purple-400" },
        ].map(stat => (
          <Card key={stat.label} className="bg-white/5 border-white/10">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-slate-400 text-sm">{stat.label}</span>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-5">
            <p className="text-slate-400 text-sm mb-1">Total Contacts</p>
            <p className="text-2xl font-bold text-cyan-400">{stats?.totalContacts ?? 0}</p>
          </CardContent>
        </Card>
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-5">
            <p className="text-slate-400 text-sm mb-1">Total Reviews</p>
            <p className="text-2xl font-bold text-yellow-400">{stats?.totalReviews ?? 0}</p>
          </CardContent>
        </Card>
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-5">
            <p className="text-slate-400 text-sm mb-1">Avg Rating</p>
            <p className="text-2xl font-bold text-yellow-400">
              {stats?.avgRating ? `★ ${stats.avgRating}` : "—"}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ── Bookings Panel ────────────────────────────────────────────────────────────
function BookingsPanel() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const { data: bookings, isLoading, refetch } = trpc.booking.admin.getBookings.useQuery({ limit: 200 });
  const updateStatus = trpc.booking.admin.updateBookingStatus.useMutation({
    onSuccess: () => { refetch(); toast.success("Status updated"); },
  });
  const sendFollowUp = trpc.booking.admin.sendFollowUpEmail.useMutation({
    onSuccess: (data) => {
      if (data.success) toast.success(`Follow-up email sent to ${data.email}`);
      else toast.error(data.reason ?? "Follow-up template disabled");
    },
    onError: (e) => toast.error(e.message),
  });
  const updateMeetingLink = trpc.booking.admin.updateMeetingLink.useMutation({
    onSuccess: () => { refetch(); toast.success("Meeting link saved"); },
    onError: (e) => toast.error(e.message),
  });
  const [editingLinkId, setEditingLinkId] = useState<number | null>(null);
  const [linkInput, setLinkInput] = useState("");

  const filtered = (bookings ?? []).filter(b => {
    const matchSearch = !search ||
      b.bookerName.toLowerCase().includes(search.toLowerCase()) ||
      b.bookerEmail.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || b.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Bookings</h2>
          <p className="text-slate-400">{filtered.length} booking{filtered.length !== 1 ? "s" : ""}</p>
        </div>
        <Button onClick={() => refetch()} variant="outline" size="sm" className="border-white/20 text-white">
          <RefreshCw className="w-4 h-4 mr-2" />Refresh
        </Button>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-slate-500"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40 bg-white/5 border-white/10 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
            <SelectItem value="no_show">No Show</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 bg-white/5 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-500">
          <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>No bookings found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(b => (
            <Card key={b.id} className="bg-white/5 border-white/10 hover:border-white/20 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <p className="text-white font-semibold">{b.bookerName}</p>
                      <Badge className={STATUS_COLORS[b.status] ?? ""}>{b.status}</Badge>
                    </div>
                    <p className="text-slate-400 text-sm">
                      {b.bookerEmail}{b.bookerPhone ? ` · ${b.bookerPhone}` : ""}
                    </p>
                    <p className="text-slate-400 text-sm mt-1">
                      <span className="text-cyan-400">{b.bookingTypeName ?? "Session"}</span>
                      {" · "}{formatDateTime(b.scheduledAt)}
                      {" · "}{b.durationMinutes} min
                    </p>
                    {b.notes && <p className="text-slate-500 text-xs mt-1 truncate">{b.notes}</p>}
                    {/* Meeting link display */}
                    {b.meetingLink && editingLinkId !== b.id && (
                      <div className="flex items-center gap-1.5 mt-1">
                        <Video className="w-3 h-3 text-green-400 shrink-0" />
                        <a href={b.meetingLink} target="_blank" rel="noopener noreferrer"
                          className="text-green-400 text-xs hover:underline truncate max-w-[260px]">
                          {b.meetingLink}
                        </a>
                        <ExternalLink className="w-3 h-3 text-green-400 shrink-0" />
                      </div>
                    )}
                    {/* Inline meeting link editor */}
                    {editingLinkId === b.id && (
                      <div className="flex items-center gap-2 mt-2">
                        <Input
                          value={linkInput}
                          onChange={e => setLinkInput(e.target.value)}
                          placeholder="https://meet.google.com/..."
                          className="h-7 text-xs bg-white/5 border-white/10 text-white placeholder:text-slate-500 flex-1"
                          autoFocus
                          onKeyDown={e => {
                            if (e.key === "Enter") {
                              updateMeetingLink.mutate({ bookingId: b.id, meetingLink: linkInput || null });
                              setEditingLinkId(null);
                            }
                            if (e.key === "Escape") setEditingLinkId(null);
                          }}
                        />
                        <Button size="sm" className="h-7 text-xs bg-green-600 hover:bg-green-500"
                          onClick={() => { updateMeetingLink.mutate({ bookingId: b.id, meetingLink: linkInput || null }); setEditingLinkId(null); }}>
                          Save
                        </Button>
                        <Button size="sm" variant="outline" className="h-7 text-xs border-white/20 text-white"
                          onClick={() => setEditingLinkId(null)}>Cancel</Button>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <p className="text-white font-semibold">{formatPrice(b.paymentAmount ?? 0)}</p>
                    {(b.status === "confirmed" || b.status === "pending") && (
                      <Button
                        onClick={() => { setEditingLinkId(b.id); setLinkInput(b.meetingLink ?? ""); }}
                        variant="outline"
                        size="sm"
                        className={`h-7 text-xs ${b.meetingLink ? "border-green-500/40 text-green-400 hover:bg-green-500/10" : "border-white/20 text-slate-400 hover:bg-white/5"}`}
                      >
                        <Video className="w-3 h-3 mr-1" />{b.meetingLink ? "Edit Link" : "Set Link"}
                      </Button>
                    )}
                    {b.status === "completed" && (
                      <Button
                        onClick={() => sendFollowUp.mutate({ bookingId: b.id })}
                        disabled={sendFollowUp.isPending}
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs border-cyan-500/40 text-cyan-400 hover:bg-cyan-500/10"
                      >
                        <Mail className="w-3 h-3 mr-1" />Follow-up
                      </Button>
                    )}
                    <Select
                      value={b.status}
                      onValueChange={val =>
                        updateStatus.mutate({
                          bookingId: b.id,
                          status: val as "pending" | "confirmed" | "cancelled" | "completed" | "no_show",
                        })
                      }
                    >
                      <SelectTrigger className="w-32 h-7 text-xs bg-white/5 border-white/10 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="confirmed">Confirmed</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                        <SelectItem value="no_show">No Show</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Booking Types Panel ───────────────────────────────────────────────────────
function BookingTypesPanel() {
  const { data: types, isLoading, refetch } = trpc.booking.admin.getBookingTypes.useQuery();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: "", description: "", durationMinutes: 30, price: 0, isFree: true, color: "#06b6d4",
  });
  const [copied, setCopied] = useState<number | null>(null);

  const createType = trpc.booking.admin.createBookingType.useMutation({
    onSuccess: () => {
      refetch();
      setOpen(false);
      toast.success("Booking type created");
      setForm({ name: "", description: "", durationMinutes: 30, price: 0, isFree: true, color: "#06b6d4" });
    },
    onError: (e) => toast.error(e.message),
  });

  function copyLink(id: number) {
    navigator.clipboard.writeText(`${window.location.origin}/book`);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Booking Types</h2>
          <p className="text-slate-400">Manage your session offerings</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-cyan-500 hover:bg-cyan-400 text-[#0a0b1e] font-semibold">
              <Plus className="w-4 h-4 mr-2" />New Type
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[#0d0e24] border-white/10 text-white max-w-md">
            <DialogHeader>
              <DialogTitle className="text-white">Create Booking Type</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              <div>
                <Label className="text-slate-300 mb-1.5">Name *</Label>
                <Input
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. 30 Minute Meeting"
                  className="bg-white/5 border-white/10 text-white placeholder:text-slate-500"
                />
              </div>
              <div>
                <Label className="text-slate-300 mb-1.5">Description</Label>
                <Textarea
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  rows={2}
                  className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 resize-none"
                />
              </div>
              <div>
                <Label className="text-slate-300 mb-1.5">Duration (minutes)</Label>
                <Input
                  type="number"
                  value={form.durationMinutes}
                  onChange={e => setForm(f => ({ ...f, durationMinutes: parseInt(e.target.value) || 30 }))}
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
              <div className="flex items-center gap-3">
                <Switch
                  checked={form.isFree}
                  onCheckedChange={v => setForm(f => ({ ...f, isFree: v }))}
                />
                <Label className="text-slate-300">Free session</Label>
              </div>
              {!form.isFree && (
                <div>
                  <Label className="text-slate-300 mb-1.5">Price (cents, e.g. 6000 = $60)</Label>
                  <Input
                    type="number"
                    value={form.price}
                    onChange={e => setForm(f => ({ ...f, price: parseInt(e.target.value) || 0 }))}
                    className="bg-white/5 border-white/10 text-white"
                  />
                </div>
              )}
              <Button
                onClick={() => createType.mutate(form)}
                disabled={createType.isPending || !form.name}
                className="w-full bg-cyan-500 hover:bg-cyan-400 text-[#0a0b1e] font-semibold"
              >
                {createType.isPending ? "Creating..." : "Create Booking Type"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-20 bg-white/5 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {(types ?? []).map(t => (
            <Card key={t.id} className="bg-white/5 border-white/10">
              <CardContent className="p-5 flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: t.color ?? "#06b6d4" }} />
                    <h3 className="text-white font-semibold">{t.name}</h3>
                    {t.isFree
                      ? <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">Free</Badge>
                      : <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 text-xs">{formatPrice(t.price)}</Badge>
                    }
                    {!t.isActive && (
                      <Badge className="bg-slate-500/20 text-slate-400 border-slate-500/30 text-xs">Inactive</Badge>
                    )}
                  </div>
                  {t.description && <p className="text-slate-400 text-sm ml-6">{t.description}</p>}
                  <div className="flex items-center gap-4 mt-2 ml-6">
                    <span className="text-slate-500 text-xs flex items-center gap-1">
                      <Clock className="w-3 h-3" />{formatDuration(t.durationMinutes)}
                    </span>
                  </div>
                </div>
                <Button
                  onClick={() => copyLink(t.id)}
                  variant="outline"
                  size="sm"
                  className="border-white/20 text-white hover:border-cyan-400 shrink-0"
                >
                  {copied === t.id
                    ? <><Check className="w-4 h-4 mr-1 text-green-400" />Copied</>
                    : <><Copy className="w-4 h-4 mr-1" />Copy link</>
                  }
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Availability Panel ────────────────────────────────────────────────────────
function AvailabilityPanel() {
  const { data: avail, isLoading, refetch } = trpc.booking.admin.getAvailability.useQuery();
  const updateSlot = trpc.booking.admin.updateAvailabilitySlot.useMutation({
    onSuccess: () => { refetch(); },
  });

  const [edits, setEdits] = useState<Record<number, { enabled: boolean; start: string; end: string }>>({});

  function getSlotState(slot: { id: number; isAvailable: boolean; startTime: string; endTime: string }) {
    return edits[slot.id] ?? { enabled: slot.isAvailable, start: slot.startTime, end: slot.endTime };
  }

  function handleSave() {
    if (!avail) return;
    Promise.all(
      avail.slots.map(slot => {
        const state = getSlotState(slot);
        return updateSlot.mutateAsync({
          slotId: slot.id,
          isAvailable: state.enabled,
          startTime: state.start,
          endTime: state.end,
        });
      })
    ).then(() => toast.success("Schedule saved")).catch(e => toast.error(e.message));
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Availability</h2>
          <p className="text-slate-400">Set your weekly schedule</p>
        </div>
        <Button onClick={handleSave} disabled={updateSlot.isPending} className="bg-cyan-500 hover:bg-cyan-400 text-[#0a0b1e] font-semibold">
          {updateSlot.isPending ? "Saving..." : "Save Schedule"}
        </Button>
      </div>

      {isLoading ? (
        <div className="h-64 bg-white/5 rounded-xl animate-pulse" />
      ) : !avail ? (
        <p className="text-slate-500 text-center py-12">No availability schedule found.</p>
      ) : (
        <Card className="bg-white/5 border-white/10">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <CardTitle className="text-white text-base">{avail.schedule.name}</CardTitle>
              <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30 text-xs">Default</Badge>
            </div>
            <p className="text-slate-500 text-sm">{avail.schedule.timezone}</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {avail.slots.map(slot => {
                const state = getSlotState(slot);
                return (
                  <div key={slot.id} className="flex items-center gap-4 py-3 border-b border-white/5 last:border-0">
                    <div className="w-28">
                      <p className={`text-sm font-medium ${state.enabled ? "text-white" : "text-slate-500"}`}>
                        {DAYS_OF_WEEK[slot.dayOfWeek]}
                      </p>
                    </div>
                    {state.enabled ? (
                      <>
                        <Input
                          type="time"
                          value={state.start}
                          onChange={e => setEdits(ed => ({ ...ed, [slot.id]: { ...state, start: e.target.value } }))}
                          className="w-32 bg-white/5 border-white/10 text-white text-sm h-8"
                        />
                        <span className="text-slate-500">–</span>
                        <Input
                          type="time"
                          value={state.end}
                          onChange={e => setEdits(ed => ({ ...ed, [slot.id]: { ...state, end: e.target.value } }))}
                          className="w-32 bg-white/5 border-white/10 text-white text-sm h-8"
                        />
                        <Button
                          onClick={() => setEdits(ed => ({ ...ed, [slot.id]: { ...state, enabled: false } }))}
                          variant="ghost"
                          size="sm"
                          className="text-slate-500 hover:text-red-400 ml-auto"
                        >
                          Remove
                        </Button>
                      </>
                    ) : (
                      <>
                        <span className="text-slate-500 italic text-sm flex-1">Unavailable</span>
                        <Button
                          onClick={() => setEdits(ed => ({ ...ed, [slot.id]: { ...state, enabled: true } }))}
                          variant="ghost"
                          size="sm"
                          className="text-slate-500 hover:text-cyan-400 ml-auto"
                        >
                          + Add hours
                        </Button>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ── Contacts Panel ────────────────────────────────────────────────────────────
function ContactsPanel() {
  const [search, setSearch] = useState("");
  const { data: contacts, isLoading } = trpc.booking.admin.getContacts.useQuery();

  const filtered = (contacts ?? []).filter(c =>
    !search ||
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-1">Contacts</h2>
        <p className="text-slate-400">{filtered.length} contact{filtered.length !== 1 ? "s" : ""}</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <Input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search contacts..."
          className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-slate-500"
        />
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 bg-white/5 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-500">
          <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>No contacts yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(c => (
            <Card key={c.id} className="bg-white/5 border-white/10">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                  {c.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium">{c.name}</p>
                  <div className="flex items-center gap-3 text-slate-400 text-sm flex-wrap">
                    <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{c.email}</span>
                    {c.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{c.phone}</span>}
                    {c.company && <span className="flex items-center gap-1"><Building2 className="w-3 h-3" />{c.company}</span>}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-slate-400 text-sm">{c.totalBookings ?? 0} booking{(c.totalBookings ?? 0) !== 1 ? "s" : ""}</p>
                  {c.lastBookedAt && (
                    <p className="text-slate-500 text-xs">{formatDateTime(c.lastBookedAt)}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Coupons Panel ─────────────────────────────────────────────────────────────
function CouponsPanel() {
  const { data: coupons, isLoading, refetch } = trpc.booking.admin.getCoupons.useQuery();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    code: "",
    discountType: "percentage" as "percentage" | "fixed",
    discountValue: 10,
    maxUses: 0,
    expiresAt: "",
  });

  const createCoupon = trpc.booking.admin.createCoupon.useMutation({
    onSuccess: () => {
      refetch();
      setOpen(false);
      toast.success("Coupon created");
      setForm({ code: "", discountType: "percentage", discountValue: 10, maxUses: 0, expiresAt: "" });
    },
    onError: (e) => toast.error(e.message),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Coupons</h2>
          <p className="text-slate-400">Discount codes for your sessions</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-cyan-500 hover:bg-cyan-400 text-[#0a0b1e] font-semibold">
              <Plus className="w-4 h-4 mr-2" />New Coupon
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[#0d0e24] border-white/10 text-white max-w-md">
            <DialogHeader>
              <DialogTitle className="text-white">Create Coupon</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              <div>
                <Label className="text-slate-300 mb-1.5">Code *</Label>
                <Input
                  value={form.code}
                  onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
                  placeholder="e.g. INVESTOR20"
                  className="bg-white/5 border-white/10 text-white placeholder:text-slate-500"
                />
              </div>
              <div>
                <Label className="text-slate-300 mb-1.5">Discount Type</Label>
                <Select
                  value={form.discountType}
                  onValueChange={v => setForm(f => ({ ...f, discountType: v as "percentage" | "fixed" }))}
                >
                  <SelectTrigger className="bg-white/5 border-white/10 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage (%)</SelectItem>
                    <SelectItem value="fixed">Fixed Amount ($)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-slate-300 mb-1.5">Discount Value</Label>
                <Input
                  type="number"
                  value={form.discountValue}
                  onChange={e => setForm(f => ({ ...f, discountValue: parseFloat(e.target.value) || 0 }))}
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
              <div>
                <Label className="text-slate-300 mb-1.5">Max Uses (0 = unlimited)</Label>
                <Input
                  type="number"
                  value={form.maxUses}
                  onChange={e => setForm(f => ({ ...f, maxUses: parseInt(e.target.value) || 0 }))}
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
              <div>
                <Label className="text-slate-300 mb-1.5">Expiry Date (optional)</Label>
                <Input
                  type="date"
                  value={form.expiresAt}
                  onChange={e => setForm(f => ({ ...f, expiresAt: e.target.value }))}
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
              <Button
                onClick={() => createCoupon.mutate({
                  ...form,
                  maxUses: form.maxUses || undefined,
                  expiresAt: form.expiresAt ? new Date(form.expiresAt).getTime() : undefined,
                })}
                disabled={createCoupon.isPending || !form.code}
                className="w-full bg-cyan-500 hover:bg-cyan-400 text-[#0a0b1e] font-semibold"
              >
                {createCoupon.isPending ? "Creating..." : "Create Coupon"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-16 bg-white/5 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (coupons ?? []).length === 0 ? (
        <div className="text-center py-16 text-slate-500">
          <Tag className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>No coupons yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {(coupons ?? []).map(c => (
            <Card key={c.id} className="bg-white/5 border-white/10">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <code className="text-cyan-400 font-mono font-bold">{c.code}</code>
                    <Badge className={c.isActive
                      ? "bg-green-500/20 text-green-400 border-green-500/30 text-xs"
                      : "bg-slate-500/20 text-slate-400 border-slate-500/30 text-xs"
                    }>
                      {c.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <p className="text-slate-400 text-sm">
                    {c.discountType === "percentage" ? `${c.discountValue}% off` : `$${c.discountValue} off`}
                    {c.maxUses ? ` · ${c.usesCount ?? 0}/${c.maxUses} uses` : ` · ${c.usesCount ?? 0} uses`}
                    {c.expiresAt ? ` · Expires ${new Date(c.expiresAt).toLocaleDateString()}` : ""}
                  </p>
                </div>
                <Button
                  onClick={() => { navigator.clipboard.writeText(c.code); toast.success("Code copied!"); }}
                  variant="ghost"
                  size="sm"
                  className="text-slate-400 hover:text-cyan-400"
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Reviews Panel ─────────────────────────────────────────────────────────────
function ReviewsPanel() {
  const { data: reviews, isLoading } = trpc.booking.admin.getReviews.useQuery();

  const avg = reviews && reviews.length > 0
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-1">Reviews</h2>
        {avg && <p className="text-slate-400">Average rating: <span className="text-yellow-400 font-semibold">★ {avg}</span></p>}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-20 bg-white/5 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (reviews ?? []).length === 0 ? (
        <div className="text-center py-16 text-slate-500">
          <Star className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>No reviews yet</p>
          <p className="text-sm mt-1">Reviews appear automatically after completed bookings.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {(reviews ?? []).map(r => (
            <Card key={r.id} className="bg-white/5 border-white/10">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-white font-medium">{r.bookerName}</p>
                    <p className="text-slate-400 text-sm">{r.bookerEmail}</p>
                    {r.bookingTypeName && (
                      <p className="text-cyan-400 text-xs mt-0.5">{r.bookingTypeName}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${i < r.rating ? "text-yellow-400 fill-yellow-400" : "text-slate-600"}`}
                      />
                    ))}
                  </div>
                </div>
                {r.comment && <p className="text-slate-300 text-sm">{r.comment}</p>}
                <p className="text-slate-500 text-xs mt-2">{formatDateTime(r.createdAt)}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Bulk Follow-up Card ──────────────────────────────────────────────────────
function BulkFollowUpCard() {
  const sendBulk = trpc.booking.admin.sendBulkFollowUpEmails.useMutation({
    onSuccess: (data) => {
      toast.success(`Sent ${data.sent} follow-up email${data.sent !== 1 ? "s" : ""} out of ${data.total} completed bookings`);
    },
    onError: (e) => toast.error(e.message),
  });

  return (
    <Card className="bg-white/5 border-white/10">
      <CardHeader>
        <CardTitle className="text-white text-lg flex items-center gap-2">
          <Mail className="w-5 h-5 text-cyan-400" />
          Automated Follow-up Emails
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-slate-400 text-sm mb-4">
          Send a follow-up email to all contacts with <strong className="text-white">completed</strong> bookings.
          This uses the <em>booking_followup</em> email template. Individual follow-ups can also be sent
          from the Bookings panel using the <strong className="text-cyan-400">Follow-up</strong> button on each completed booking.
        </p>
        <div className="flex items-center gap-3">
          <Button
            onClick={() => sendBulk.mutate()}
            disabled={sendBulk.isPending}
            className="bg-cyan-500 hover:bg-cyan-400 text-[#0a0b1e] font-semibold"
          >
            {sendBulk.isPending ? "Sending..." : "Send Bulk Follow-ups"}
          </Button>
          {sendBulk.data && (
            <p className="text-slate-400 text-sm">
              Last run: {sendBulk.data.sent}/{sendBulk.data.total} emails sent
            </p>
          )}
        </div>
        <p className="text-slate-500 text-xs mt-3">
          Note: Emails require a <strong>RESEND_API_KEY</strong> environment variable to be configured.
          Without it, emails are logged to the server console only.
        </p>
      </CardContent>
    </Card>
  );
}

// ── Settings Panel ────────────────────────────────────────────────────────────
function SettingsPanel() {
  const { data: templates, refetch: refetchTemplates } = trpc.booking.admin.getEmailTemplates.useQuery();
  const updateTemplate = trpc.booking.admin.updateEmailTemplate.useMutation({
    onSuccess: () => { refetchTemplates(); toast.success("Template saved"); },
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-1">Settings</h2>
        <p className="text-slate-400">Configure your booking system</p>
      </div>

      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white text-lg flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-cyan-400" />
            Payment Gateway
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
            <p className="text-amber-400 font-medium mb-1">Tap Payment — Ready to Activate</p>
            <p className="text-slate-400 text-sm mb-3">
              Provide your Tap Payment API keys to enable automatic payment collection for paid sessions.
            </p>
            <div className="space-y-3">
              <div>
                <Label className="text-slate-300 mb-1.5">Tap Publishable Key</Label>
                <Input
                  placeholder="pk_live_..."
                  className="bg-white/5 border-white/10 text-white placeholder:text-slate-500"
                  disabled
                />
              </div>
              <div>
                <Label className="text-slate-300 mb-1.5">Tap Secret Key</Label>
                <Input
                  type="password"
                  placeholder="sk_live_..."
                  className="bg-white/5 border-white/10 text-white placeholder:text-slate-500"
                  disabled
                />
              </div>
              <p className="text-slate-500 text-xs">
                Contact your admin to add Tap API keys to the environment configuration.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white text-lg flex items-center gap-2">
            <Mail className="w-5 h-5 text-cyan-400" />
            Email Templates
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {(templates ?? []).map(t => (
            <div key={t.id} className="border border-white/10 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium capitalize">{t.triggerEvent.replace(/_/g, " ")}</p>
                  <p className="text-slate-500 text-xs mt-0.5">{t.subject}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 text-sm">Active</span>
                  <Switch
                    checked={t.isActive}
                    onCheckedChange={v => updateTemplate.mutate({ id: t.id, isActive: v })}
                  />
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <BulkFollowUpCard />

      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white text-lg">Booking Page</CardTitle>
        </CardHeader>
        <CardContent>
          <Label className="text-slate-300 mb-1.5">Public Booking URL</Label>
          <div className="flex gap-2">
            <Input
              value={`${typeof window !== "undefined" ? window.location.origin : ""}/book`}
              readOnly
              className="bg-white/5 border-white/10 text-slate-400"
            />
            <Button
              onClick={() => {
                navigator.clipboard.writeText(`${window.location.origin}/book`);
                toast.success("URL copied!");
              }}
              variant="outline"
              className="border-white/20 text-white shrink-0"
            >
              <Copy className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Main Layout ───────────────────────────────────────────────────────────────
export default function BookingAdmin() {
  const [activePanel, setActivePanel] = useState("dashboard");

  const panels: Record<string, React.ReactNode> = {
    dashboard: <DashboardPanel />,
    bookings: <BookingsPanel />,
    "booking-types": <BookingTypesPanel />,
    availability: <AvailabilityPanel />,
    contacts: <ContactsPanel />,
    coupons: <CouponsPanel />,
    reviews: <ReviewsPanel />,
    settings: <SettingsPanel />,
  };

  return (
    <div className="min-h-screen bg-[#0a0b1e] flex">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 bg-[#0d0e24] border-r border-white/10 flex flex-col">
        <div className="p-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-white font-bold text-sm">
              B
            </div>
            <div>
              <p className="text-white text-sm font-semibold">BrainPower AI</p>
              <p className="text-slate-500 text-xs">Booking Admin</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              onClick={() => setActivePanel(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activePanel === item.id
                  ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <item.icon className="w-4 h-4 shrink-0" />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-3 border-t border-white/10 space-y-1">
          <Link href="/book">
            <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-all">
              <Calendar className="w-4 h-4 shrink-0" />
              View Booking Page
            </button>
          </Link>
          <Link href="/admin">
            <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-all">
              <ArrowLeft className="w-4 h-4 shrink-0" />
              Back to Admin
            </button>
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto p-8">
          {panels[activePanel]}
        </div>
      </main>
    </div>
  );
}
