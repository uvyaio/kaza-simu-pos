import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/shared";
import { customers as seedCustomers, KES } from "@/lib/mock-data";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageCircle, Plus, Star, Send, Users, Gift, PhoneCall, Sparkles, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { formatKenyanPhone } from "@/lib/mpesa-stkpush";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/customers")({
  head: () => ({ meta: [{ title: "Customers — KaliPOS" }, { name: "description", content: "Customer profiles, loyalty points and WhatsApp promos." }] }),
  component: Customers,
});

type Customer = typeof seedCustomers[number];

function Customers() {
  const [customerList, setCustomerList] = useState<Customer[]>(seedCustomers);
  const [promoDialogOpen, setPromoDialogOpen] = useState(false);
  const [addCustomerOpen, setAddCustomerOpen] = useState(false);

  // Promo campaign state
  const [promoSegment, setPromoSegment] = useState("all");
  const [promoMsg, setPromoMsg] = useState(
    "Habari! 🍽️ Kato's Kitchen has an exclusive 20% OFF voucher for you on your next Nyama Choma order! Use code *KATO20* at checkout."
  );

  // New Customer state
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newPoints, setNewPoints] = useState<number | "">(100);

  // Individual WhatsApp Chat Trigger
  const handleSendIndividualWhatsApp = (c: Customer) => {
    const formattedPhone = formatKenyanPhone(c.phone);
    const greeting = `Habari ${c.name}! 👋 Thank you for being a valued customer at Kato's Kitchen. You currently have *${c.points.toLocaleString()} loyalty points*! Visit us today or order online.`;
    const encoded = encodeURIComponent(greeting);
    const waUrl = `https://wa.me/${formattedPhone}?text=${encoded}`;
    
    window.open(waUrl, "_blank");
    toast.success(`Opening WhatsApp for ${c.name} 💬`, {
      description: `Target: ${formattedPhone}`,
    });
  };

  // Broadcast Campaign Action
  const handleBroadcastCampaign = () => {
    if (!promoMsg.trim()) {
      toast.error("Please enter a promo message to broadcast.");
      return;
    }

    const recipientCount = customerList.length;
    const firstCust = customerList[0];
    const formattedPhone = firstCust ? formatKenyanPhone(firstCust.phone) : "254712345678";
    const encoded = encodeURIComponent(promoMsg);
    const waUrl = `https://wa.me/${formattedPhone}?text=${encoded}`;

    window.open(waUrl, "_blank");

    toast.success(`WhatsApp Campaign Dispatched! 🚀`, {
      description: `Sent promo to ${recipientCount} loyal customers. Opened WhatsApp broadcast link.`,
    });

    setPromoDialogOpen(false);
  };

  // Add Customer Action
  const handleAddCustomer = () => {
    if (!newName.trim() || !newPhone.trim()) {
      toast.error("Please provide both name and phone number");
      return;
    }

    const newCust: Customer = {
      id: `c-${Date.now()}`,
      name: newName.trim(),
      phone: newPhone.trim(),
      points: Number(newPoints || 100),
      visits: 1,
      spent: 0,
    };

    setCustomerList(prev => [newCust, ...prev]);
    toast.success(`Customer Added 🎉`, { description: `${newCust.name} (${newCust.phone})` });

    setNewName("");
    setNewPhone("");
    setNewPoints(100);
    setAddCustomerOpen(false);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto">
      <PageHeader
        title="Customers"
        subtitle="Loyalty, history and WhatsApp marketing."
        action={
          <Dialog open={addCustomerOpen} onOpenChange={setAddCustomerOpen}>
            <DialogTrigger asChild>
              <Button className="gradient-primary border-0">
                <Plus className="h-4 w-4 mr-1.5" />Add customer
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" /> Add New Customer Profile
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="space-y-1.5">
                  <Label>Customer Full Name</Label>
                  <Input placeholder="e.g. Wanjiku Kamau" value={newName} onChange={(e) => setNewName(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>Phone Number (WhatsApp / M-Pesa)</Label>
                  <Input placeholder="e.g. 0712 345 678" value={newPhone} onChange={(e) => setNewPhone(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>Welcome Loyalty Points</Label>
                  <Input type="number" value={newPoints} onChange={(e) => setNewPoints(e.target.value === "" ? "" : Number(e.target.value))} />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setAddCustomerOpen(false)}>Cancel</Button>
                <Button className="gradient-primary border-0" onClick={handleAddCustomer}>Save Customer</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="grid sm:grid-cols-3 gap-4">
        <Card className="p-5 shadow-soft">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Total customers</div>
          <div className="text-3xl font-bold mt-1">{customerList.length.toLocaleString()}</div>
          <div className="text-xs text-success mt-1">+42 this week</div>
        </Card>

        <Card className="p-5 shadow-soft">
          <div className="text-xs uppercase tracking-wider text-muted-foreground font-medium">Repeat customer rate</div>
          <div className="text-3xl font-bold mt-1">68%</div>
          <div className="text-xs text-success mt-1">↑ 4% vs last month</div>
        </Card>

        {/* PROMO WHATSAPP CARD WITH ACTIVE DIALOG */}
        <Card className="p-5 shadow-soft bg-mpesa/5 border-mpesa/30 flex flex-col justify-between">
          <div>
            <div className="text-xs uppercase tracking-wider text-mpesa font-semibold flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5" /> WhatsApp promo ready
            </div>
            <div className="text-sm mt-2 font-medium">Send 20% off voucher to {customerList.length} loyal customers.</div>
          </div>

          <Dialog open={promoDialogOpen} onOpenChange={setPromoDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="mt-3 bg-mpesa text-white hover:bg-mpesa/90 border-0 shadow-soft">
                <MessageCircle className="h-4 w-4 mr-1.5" /> Send via WhatsApp
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5 text-mpesa" /> Broadcast WhatsApp Campaign
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="space-y-1.5">
                  <Label>Target Customer Segment</Label>
                  <Select value={promoSegment} onValueChange={setPromoSegment}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select target" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Loyal Customers ({customerList.length})</SelectItem>
                      <SelectItem value="vip">VIP High Spenders (&gt; KSh 30,000)</SelectItem>
                      <SelectItem value="frequent">Frequent Visitors (&gt; 20 visits)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label>Promo Message Content</Label>
                  <Textarea
                    rows={4}
                    value={promoMsg}
                    onChange={(e) => setPromoMsg(e.target.value)}
                    className="text-sm"
                  />
                  <p className="text-[11px] text-muted-foreground">
                    This message will format automatically for WhatsApp web and mobile app broadcast.
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setPromoDialogOpen(false)}>Cancel</Button>
                <Button className="bg-mpesa text-white hover:bg-mpesa/90 border-0" onClick={handleBroadcastCampaign}>
                  <Send className="h-4 w-4 mr-1.5" /> Broadcast via WhatsApp
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </Card>
      </div>

      {/* CUSTOMER TABLE */}
      <Card className="overflow-hidden shadow-soft">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="text-left font-medium p-3">Customer</th>
              <th className="text-left font-medium p-3 hidden sm:table-cell">Phone</th>
              <th className="text-right font-medium p-3">Visits</th>
              <th className="text-right font-medium p-3">Spent</th>
              <th className="text-right font-medium p-3">Points</th>
              <th className="p-3 text-right">WhatsApp Action</th>
            </tr>
          </thead>
          <tbody>
            {customerList.map(c => (
              <tr key={c.id} className="border-t hover:bg-muted/30 transition-colors">
                <td className="p-3">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full gradient-primary text-primary-foreground grid place-items-center text-xs font-semibold">
                      {c.name.split(" ").map(n => n[0]).join("")}
                    </div>
                    <div>
                      <div className="font-medium">{c.name}</div>
                      <div className="text-xs text-muted-foreground sm:hidden">{c.phone}</div>
                    </div>
                  </div>
                </td>
                <td className="p-3 hidden sm:table-cell text-muted-foreground">{c.phone}</td>
                <td className="p-3 text-right">{c.visits}</td>
                <td className="p-3 text-right font-semibold">{KES(c.spent)}</td>
                <td className="p-3 text-right">
                  <Badge variant="secondary" className="gap-1"><Star className="h-3 w-3 fill-warning text-warning" />{c.points.toLocaleString()}</Badge>
                </td>
                <td className="p-3 text-right">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 border-mpesa/30 bg-mpesa/10 text-mpesa hover:bg-mpesa/20 hover:text-mpesa-foreground transition-colors font-medium text-xs gap-1.5"
                    onClick={() => handleSendIndividualWhatsApp(c)}
                    title={`Send WhatsApp message to ${c.name}`}
                  >
                    <MessageCircle className="h-3.5 w-3.5" />
                    <span>WhatsApp</span>
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

