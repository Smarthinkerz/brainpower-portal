import { useState, useMemo } from "react";
import { usePageMeta } from "@/hooks/usePageMeta";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Clock, DollarSign, ArrowLeft, ArrowRight, Check, Calendar, User, Mail, Phone, Building2, ChevronLeft, ChevronRight, Tag } from "lucide-react";
import { toast } from "sonner";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function formatPrice(cents: number): string {
  if (cents === 0) return "Free";
  return `$${(cents / 100).toFixed(0)}`;
}

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} minutes`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h} hr ${m} min` : `${h} hour`;
}

type Step = "types" | "calendar" | "form" | "confirm";

export default function BookingPage() {
  usePageMeta({
    title: "Book a Session — BrainPower AI",
    description: "Schedule a discovery call or product demo with the BrainPower AI team. Learn how our Decision Intelligence System can transform decision-making for you or your organisation.",
  });
  const [step, setStep] = useState<Step>("types");
  const [selectedTypeId, setSelectedTypeId] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [calMonth, setCalMonth] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });
  const [form, setForm] = useState({ bookerName: "", bookerEmail: "", bookerPhone: "", bookerCompany: "", notes: "", couponCode: "" });
  const [bookingResult, setBookingResult] = useState<{ bookingId: number; paymentRequired: boolean; amount: number } | null>(null);

  const { data: bookingTypes, isLoading: typesLoading } = trpc.booking.getBookingTypes.useQuery();
  const selectedType = bookingTypes?.find(t => t.id === selectedTypeId);

  const { data: availableSlots, isLoading: slotsLoading } = trpc.booking.getAvailableSlots.useQuery(
    { bookingTypeId: selectedTypeId!, date: selectedDate },
    { enabled: !!selectedTypeId && !!selectedDate }
  );

  const createBooking = trpc.booking.createBooking.useMutation({
    onSuccess: (data) => {
      setBookingResult(data);
      setStep("confirm");
    },
    onError: (err) => {
      toast.error("Booking failed", { description: err.message });
    },
  });

  // Build calendar days for current month view
  const calendarDays = useMemo(() => {
    const { year, month } = calMonth;
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let d = 1; d <= daysInMonth; d++) days.push(d);
    return days;
  }, [calMonth]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  function isDateDisabled(day: number): boolean {
    const d = new Date(calMonth.year, calMonth.month, day);
    return d < today;
  }

  function formatDateStr(day: number): string {
    const y = calMonth.year;
    const m = String(calMonth.month + 1).padStart(2, "0");
    const d = String(day).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

  function handleSelectDate(day: number) {
    if (isDateDisabled(day)) return;
    const dateStr = formatDateStr(day);
    setSelectedDate(dateStr);
    setSelectedTime("");
  }

  function handleSubmit() {
    if (!selectedTypeId || !selectedDate || !selectedTime) return;
    if (!form.bookerName || !form.bookerEmail) {
      toast.error("Please fill in your name and email");
      return;
    }
    createBooking.mutate({
      bookingTypeId: selectedTypeId,
      date: selectedDate,
      time: selectedTime,
      ...form,
    });
  }

  // ── Step: Session Types ───────────────────────────────────────────────────
  if (step === "types") {
    return (
      <div className="min-h-screen bg-[#0a0b1e] text-white">
        {/* Header */}
        <div className="border-b border-white/10 bg-[#0d0e24]">
          <div className="max-w-5xl mx-auto px-6 py-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-white font-bold text-lg">B</div>
            <div>
              <p className="text-xl font-bold text-white">BrainPower AI</p>
              <p className="text-sm text-slate-400">Decision Intelligence System</p>
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Left: About */}
          <div>
            <h1 className="text-2xl font-bold text-white mb-4">Book a Session</h1>
            <p className="text-slate-300 mb-6 leading-relaxed">
              <strong className="text-white">Brain Power AI</strong> is the world's first <strong className="text-cyan-400">Decision Intelligence System (DIS)</strong> — an AI co-pilot built to enhance human thinking, not just conversation. It's designed to help individuals and teams move from uncertainty to clarity by <strong className="text-white">simulating decisions, detecting cognitive biases, customizing intelligence layers, and retaining strategic memory that learns your goals.</strong>
            </p>
            <p className="text-slate-300 mb-6 leading-relaxed">
              Unlike ChatGPT and other AI assistants, which focus on generating text or answering questions, Brain Power AI is purpose-built for <strong className="text-white">strategic decision-making and execution planning.</strong>
            </p>
            {/* This block previously read "ROI Potential ... $2,500 Projected
              * ROI between 3.5x and 10x within 24-36 months". Nothing produced
              * those figures, and a projected return shown on a public page to
              * prospective investors is not merely a marketing claim. Replaced
              * with what the engine verifiably does. Sources: 10,000 default
              * iterations in simulation-engine.ts; the 8-entry validTypes list;
              * the 10-entry ADVISORS array; seeded RNG with
              * deterministicResultHash(), covered by 31 passing determinism and
              * invariant tests. */}
            <div className="bg-white/5 rounded-xl p-5 border border-white/10">
              <h3 className="font-semibold text-white mb-3">What the Engine Does</h3>
              <p className="text-slate-300 text-sm mb-3">Every figure the system reports is computed, never generated:</p>
              <ul className="text-slate-300 text-sm space-y-1 list-disc list-inside">
                <li><strong className="text-white">10,000</strong> seeded Monte Carlo iterations per decision, across <strong className="text-white">8</strong> probability distributions</li>
                <li><strong className="text-white">10</strong> advisory frameworks returning GO, NO-GO or CONDITIONAL-GO with a disagreement map</li>
                <li><strong className="text-white">Byte-identical output</strong> for identical inputs, held by 31 passing determinism and invariant tests</li>
                <li>A sufficiency gate that returns clarifying questions instead of a verdict when the input is too thin</li>
              </ul>
            </div>
          </div>

          {/* Right: Session types */}
          <div className="space-y-4">
            {typesLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-20 bg-white/5 rounded-xl animate-pulse" />
              ))
            ) : bookingTypes?.map(type => (
              <div
                key={type.id}
                className="bg-white/5 border border-white/10 rounded-xl p-5 hover:border-cyan-400/50 hover:bg-white/8 transition-all cursor-pointer group"
                onClick={() => { setSelectedTypeId(type.id); setStep("calendar"); }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-white group-hover:text-cyan-400 transition-colors">{type.name}</h3>
                    {type.description && <p className="text-sm text-slate-400 mt-1">{type.description}</p>}
                    <div className="flex items-center gap-4 mt-3">
                      <span className="flex items-center gap-1 text-sm text-slate-400">
                        <Clock className="w-4 h-4" />
                        {formatDuration(type.durationMinutes)}
                      </span>
                      {!type.isFree && (
                        <span className="flex items-center gap-1 text-sm text-slate-400">
                          <DollarSign className="w-4 h-4" />
                          {formatPrice(type.price)}
                        </span>
                      )}
                      {type.isFree && <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">Free</Badge>}
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="border-white/20 text-white hover:border-cyan-400 hover:text-cyan-400 ml-4 shrink-0">
                    View details <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── Step: Calendar ────────────────────────────────────────────────────────
  if (step === "calendar") {
    return (
      <div className="min-h-screen bg-[#0a0b1e] text-white">
        <div className="border-b border-white/10 bg-[#0d0e24]">
          <div className="max-w-5xl mx-auto px-6 py-4 flex items-center gap-4">
            <button onClick={() => setStep("types")} className="text-slate-400 hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-white font-bold">B</div>
            <div>
              <p className="text-lg font-bold text-white">BrainPower AI</p>
              <p className="text-sm text-slate-400">{selectedType?.name}</p>
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Session info */}
          <div>
            <h1 className="text-xl font-bold text-white mb-2">{selectedType?.name ?? "Book a Session"}</h1>
            {selectedType?.description && <p className="text-slate-400 mb-4">{selectedType.description}</p>}
            <div className="flex items-center gap-4 text-sm text-slate-400 mb-6">
              <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{formatDuration(selectedType?.durationMinutes ?? 0)}</span>
              {!selectedType?.isFree && <span className="flex items-center gap-1"><DollarSign className="w-4 h-4" />{formatPrice(selectedType?.price ?? 0)}</span>}
            </div>

            {/* Calendar */}
            <div className="bg-white/5 rounded-xl border border-white/10 p-5">
              <div className="flex items-center justify-between mb-4">
                <button onClick={() => setCalMonth(p => {
                  const d = new Date(p.year, p.month - 1, 1);
                  return { year: d.getFullYear(), month: d.getMonth() };
                })} className="p-1 hover:text-cyan-400 transition-colors text-slate-400">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="font-semibold text-white">{MONTHS[calMonth.month]} {calMonth.year}</span>
                <button onClick={() => setCalMonth(p => {
                  const d = new Date(p.year, p.month + 1, 1);
                  return { year: d.getFullYear(), month: d.getMonth() };
                })} className="p-1 hover:text-cyan-400 transition-colors text-slate-400">
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
              <div className="grid grid-cols-7 gap-1 mb-2">
                {DAYS.map(d => <div key={d} className="text-center text-xs text-slate-500 font-medium py-1">{d}</div>)}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((day, i) => {
                  if (!day) return <div key={i} />;
                  const dateStr = formatDateStr(day);
                  const disabled = isDateDisabled(day);
                  const selected = selectedDate === dateStr;
                  return (
                    <button
                      key={i}
                      onClick={() => handleSelectDate(day)}
                      disabled={disabled}
                      className={`
                        h-9 w-full rounded-lg text-sm font-medium transition-all
                        ${disabled ? "text-slate-700 cursor-not-allowed" : "hover:bg-cyan-400/20 hover:text-cyan-400 cursor-pointer"}
                        ${selected ? "bg-cyan-400 text-[#0a0b1e] hover:bg-cyan-400 hover:text-[#0a0b1e]" : "text-slate-300"}
                      `}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Time slots */}
          <div>
            {selectedDate ? (
              <>
                <h3 className="text-lg font-semibold text-white mb-4">
                  <Calendar className="w-5 h-5 inline mr-2 text-cyan-400" />
                  {new Date(selectedDate + "T12:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
                </h3>
                {slotsLoading ? (
                  <div className="grid grid-cols-3 gap-2">
                    {Array.from({ length: 9 }).map((_, i) => <div key={i} className="h-10 bg-white/5 rounded-lg animate-pulse" />)}
                  </div>
                ) : availableSlots && availableSlots.length > 0 ? (
                  <div className="grid grid-cols-3 gap-2">
                    {availableSlots.map(slot => {
                      const [h, m] = slot.split(":").map(Number);
                      const period = h >= 12 ? "PM" : "AM";
                      const displayH = h > 12 ? h - 12 : h === 0 ? 12 : h;
                      const label = `${displayH}:${String(m).padStart(2, "0")} ${period}`;
                      return (
                        <button
                          key={slot}
                          onClick={() => setSelectedTime(slot)}
                          className={`
                            py-2 px-3 rounded-lg text-sm font-medium border transition-all
                            ${selectedTime === slot
                              ? "bg-cyan-400 text-[#0a0b1e] border-cyan-400"
                              : "bg-white/5 border-white/10 text-slate-300 hover:border-cyan-400/50 hover:text-cyan-400"
                            }
                          `}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-10 text-slate-500">
                    <Calendar className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p>No available slots on this date.</p>
                    <p className="text-sm mt-1">Please select another date.</p>
                  </div>
                )}
                {selectedTime && (
                  <Button
                    onClick={() => setStep("form")}
                    className="mt-6 w-full bg-cyan-500 hover:bg-cyan-400 text-[#0a0b1e] font-semibold"
                  >
                    Continue <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                )}
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-500">
                <div className="text-center">
                  <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>Select a date to see available times</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── Step: Booking Form ────────────────────────────────────────────────────
  if (step === "form") {
    const [h, m] = selectedTime.split(":").map(Number);
    const period = h >= 12 ? "PM" : "AM";
    const displayH = h > 12 ? h - 12 : h === 0 ? 12 : h;
    const timeLabel = `${displayH}:${String(m).padStart(2, "0")} ${period}`;
    const dateLabel = new Date(selectedDate + "T12:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });

    return (
      <div className="min-h-screen bg-[#0a0b1e] text-white">
        <div className="border-b border-white/10 bg-[#0d0e24]">
          <div className="max-w-5xl mx-auto px-6 py-4 flex items-center gap-4">
            <button onClick={() => setStep("calendar")} className="text-slate-400 hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-white font-bold">B</div>
            <div>
              <p className="text-lg font-bold text-white">BrainPower AI</p>
              <p className="text-sm text-slate-400">{selectedType?.name}</p>
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Booking summary */}
          <div>
            <h2 className="text-xl font-bold text-white mb-6">Booking Summary</h2>
            <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-4">
              <div>
                <p className="text-slate-400 text-sm">Session</p>
                <p className="text-white font-semibold">{selectedType?.name}</p>
              </div>
              <div>
                <p className="text-slate-400 text-sm">Date & Time</p>
                <p className="text-white font-semibold">{dateLabel}</p>
                <p className="text-cyan-400">{timeLabel} (Asia/Muscat)</p>
              </div>
              <div>
                <p className="text-slate-400 text-sm">Duration</p>
                <p className="text-white font-semibold">{formatDuration(selectedType?.durationMinutes ?? 0)}</p>
              </div>
              <div className="border-t border-white/10 pt-4">
                <p className="text-slate-400 text-sm">Amount</p>
                <p className="text-2xl font-bold text-cyan-400">{formatPrice(selectedType?.price ?? 0)}</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <div>
            <h2 className="text-xl font-bold text-white mb-6">Your Details</h2>
            <div className="space-y-4">
              <div>
                <Label className="text-slate-300 mb-1.5 flex items-center gap-2"><User className="w-4 h-4" />Full Name *</Label>
                <Input
                  value={form.bookerName}
                  onChange={e => setForm(f => ({ ...f, bookerName: e.target.value }))}
                  placeholder="Your full name"
                  className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-cyan-400"
                />
              </div>
              <div>
                <Label className="text-slate-300 mb-1.5 flex items-center gap-2"><Mail className="w-4 h-4" />Email Address *</Label>
                <Input
                  type="email"
                  value={form.bookerEmail}
                  onChange={e => setForm(f => ({ ...f, bookerEmail: e.target.value }))}
                  placeholder="your@email.com"
                  className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-cyan-400"
                />
              </div>
              <div>
                <Label className="text-slate-300 mb-1.5 flex items-center gap-2"><Phone className="w-4 h-4" />Phone Number</Label>
                <Input
                  value={form.bookerPhone}
                  onChange={e => setForm(f => ({ ...f, bookerPhone: e.target.value }))}
                  placeholder="+968 ..."
                  className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-cyan-400"
                />
              </div>
              <div>
                <Label className="text-slate-300 mb-1.5 flex items-center gap-2"><Building2 className="w-4 h-4" />Company / Organisation</Label>
                <Input
                  value={form.bookerCompany}
                  onChange={e => setForm(f => ({ ...f, bookerCompany: e.target.value }))}
                  placeholder="Your company name"
                  className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-cyan-400"
                />
              </div>
              <div>
                <Label className="text-slate-300 mb-1.5">Notes / Questions</Label>
                <Textarea
                  value={form.notes}
                  onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  placeholder="Anything you'd like to discuss or prepare for..."
                  rows={3}
                  className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-cyan-400 resize-none"
                />
              </div>
              {!selectedType?.isFree && (
                <div>
                  <Label className="text-slate-300 mb-1.5 flex items-center gap-2"><Tag className="w-4 h-4" />Coupon Code</Label>
                  <Input
                    value={form.couponCode}
                    onChange={e => setForm(f => ({ ...f, couponCode: e.target.value }))}
                    placeholder="Enter coupon code"
                    className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-cyan-400 uppercase"
                  />
                </div>
              )}
              <Button
                onClick={handleSubmit}
                disabled={createBooking.isPending}
                className="w-full bg-cyan-500 hover:bg-cyan-400 text-[#0a0b1e] font-semibold py-3 mt-2"
              >
                {createBooking.isPending ? "Booking..." : selectedType?.isFree ? "Confirm Booking" : "Proceed to Payment"}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Step: Confirmation ────────────────────────────────────────────────────
  if (step === "confirm" && bookingResult) {
    const [h, m] = selectedTime.split(":").map(Number);
    const period = h >= 12 ? "PM" : "AM";
    const displayH = h > 12 ? h - 12 : h === 0 ? 12 : h;
    const timeLabel = `${displayH}:${String(m).padStart(2, "0")} ${period}`;
    const dateLabel = new Date(selectedDate + "T12:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });

    return (
      <div className="min-h-screen bg-[#0a0b1e] text-white flex items-center justify-center px-6">
        <div className="max-w-lg w-full text-center">
          <div className="w-20 h-20 rounded-full bg-green-500/20 border-2 border-green-400 flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-green-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-3">
            {bookingResult.paymentRequired ? "Booking Received!" : "Booking Confirmed!"}
          </h1>
          <p className="text-slate-400 mb-8">
            {bookingResult.paymentRequired
              ? "Your booking request has been received. Payment will be processed to confirm your slot."
              : "Your session has been confirmed. A confirmation has been logged for our records."}
          </p>

          <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-left space-y-3 mb-8">
            <div className="flex justify-between">
              <span className="text-slate-400">Session</span>
              <span className="text-white font-medium">{selectedType?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Date</span>
              <span className="text-white font-medium">{dateLabel}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Time</span>
              <span className="text-cyan-400 font-medium">{timeLabel} (Asia/Muscat)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Duration</span>
              <span className="text-white font-medium">{formatDuration(selectedType?.durationMinutes ?? 0)}</span>
            </div>
            {bookingResult.paymentRequired && (
              <div className="flex justify-between border-t border-white/10 pt-3">
                <span className="text-slate-400">Amount Due</span>
                <span className="text-cyan-400 font-bold text-lg">{formatPrice(bookingResult.amount)}</span>
              </div>
            )}
          </div>

          {bookingResult.paymentRequired && (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 mb-6 text-left">
              <p className="text-amber-400 text-sm font-medium mb-1">Payment Required</p>
              <p className="text-slate-400 text-sm">Tap Payment integration is coming soon. Our team will contact you at <strong className="text-white">{form.bookerEmail}</strong> to complete payment and confirm your booking.</p>
            </div>
          )}

          <div className="flex gap-3">
            <Button
              onClick={() => { setStep("types"); setSelectedTypeId(null); setSelectedDate(""); setSelectedTime(""); setForm({ bookerName: "", bookerEmail: "", bookerPhone: "", bookerCompany: "", notes: "", couponCode: "" }); setBookingResult(null); }}
              variant="outline"
              className="flex-1 border-white/20 text-white hover:border-cyan-400"
            >
              Book Another Session
            </Button>
            <Link href="/" className="flex-1">
              <Button className="w-full bg-cyan-500 hover:bg-cyan-400 text-[#0a0b1e] font-semibold">
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
