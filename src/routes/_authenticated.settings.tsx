import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/shared";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Smartphone, Store, Bell, Globe, Shield, Plus, Trash2, CheckCircle2, Star, Send, Building2, CreditCard, Radio } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({ meta: [{ title: "Settings — KaliPOS" }, { name: "description", content: "Shop, M-Pesa, branches and preferences." }] }),
  component: Settings,
});

export type MpesaChannelType = "till" | "paybill" | "send_money";

export type MpesaChannel = {
  id: string;
  type: MpesaChannelType;
  name: string;
  number: string;
  accountRef?: string;
  recipientName?: string;
  isDefault: boolean;
  active: boolean;
};

const initialChannels: MpesaChannel[] = [
  {
    id: "ch-1",
    type: "till",
    name: "Kato's Kitchen — Main Till",
    number: "174379",
    isDefault: true,
    active: true,
  },
  {
    id: "ch-2",
    type: "paybill",
    name: "Kato's Kitchen — Main Paybill",
    number: "400200",
    accountRef: "KATO01",
    isDefault: false,
    active: true,
  },
  {
    id: "ch-3",
    type: "send_money",
    name: "Owner Direct M-Pesa (Send Money)",
    number: "0712 345 678",
    recipientName: "Kato Joseph",
    isDefault: false,
    active: true,
  },
  {
    id: "ch-4",
    type: "till",
    name: "Delivery & Rider Till",
    number: "988021",
    isDefault: false,
    active: true,
  },
];

function Settings() {
  const [channels, setChannels] = useState<MpesaChannel[]>(initialChannels);
  const [activeTab, setActiveTab] = useState<"all" | MpesaChannelType>("all");
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  // New channel form state
  const [newType, setNewType] = useState<MpesaChannelType>("till");
  const [newName, setNewName] = useState("");
  const [newNumber, setNewNumber] = useState("");
  const [newAccountRef, setNewAccountRef] = useState("");
  const [newRecipientName, setNewRecipientName] = useState("");
  const [newIsDefault, setNewIsDefault] = useState(false);

  const filteredChannels = channels.filter(
    (c) => activeTab === "all" || c.type === activeTab
  );

  const handleSetDefault = (id: string) => {
    setChannels((prev) =>
      prev.map((c) => ({
        ...c,
        isDefault: c.id === id,
      }))
    );
    const target = channels.find((c) => c.id === id);
    toast.success("Default channel updated", {
      description: `${target?.name} set as primary POS payment destination.`,
    });
  };

  const handleToggleActive = (id: string) => {
    setChannels((prev) =>
      prev.map((c) => (c.id === id ? { ...c, active: !c.active } : c))
    );
  };

  const handleDeleteChannel = (id: string) => {
    const target = channels.find((c) => c.id === id);
    if (target?.isDefault) {
      toast.error("Cannot delete default channel", {
        description: "Set another channel as default before removing this one.",
      });
      return;
    }
    setChannels((prev) => prev.filter((c) => c.id !== id));
    toast.success("Channel removed", { description: target?.name });
  };

  const handleAddChannel = () => {
    if (!newName.trim() || !newNumber.trim()) {
      toast.error("Validation error", {
        description: "Please provide both a label name and a Till/Paybill/Phone number.",
      });
      return;
    }

    const newId = `ch-${Date.now()}`;
    const newChan: MpesaChannel = {
      id: newId,
      type: newType,
      name: newName.trim(),
      number: newNumber.trim(),
      accountRef: newType === "paybill" ? newAccountRef.trim() : undefined,
      recipientName: newType === "send_money" ? newRecipientName.trim() : undefined,
      isDefault: newIsDefault,
      active: true,
    };

    setChannels((prev) => {
      let list = newIsDefault ? prev.map((c) => ({ ...c, isDefault: false })) : [...prev];
      return [...list, newChan];
    });

    toast.success("M-Pesa Destination Added 📱", {
      description: `Added ${newName} (${newType === "till" ? "Till Number" : newType === "paybill" ? "Paybill" : "Send Money"})`,
    });

    // Reset form
    setNewName("");
    setNewNumber("");
    setNewAccountRef("");
    setNewRecipientName("");
    setNewIsDefault(false);
    setAddDialogOpen(false);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-3xl mx-auto">
      <PageHeader title="Settings" subtitle="Shop preferences, M-Pesa channels, and notifications." />

      <Card className="p-5 shadow-soft">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 rounded-xl bg-primary-soft text-primary grid place-items-center">
            <Store className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold">Shop details</h3>
            <p className="text-xs text-muted-foreground">Visible on customer receipts</p>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="space-y-1.5"><Label>Restaurant name</Label><Input defaultValue="Kato's Kitchen" /></div>
          <div className="space-y-1.5"><Label>KRA PIN</Label><Input defaultValue="P051234567X" /></div>
          <div className="space-y-1.5 sm:col-span-2"><Label>Address</Label><Input defaultValue="Ngong Road, Nairobi" /></div>
        </div>
      </Card>

      {/* M-PESA INTEGRATION & CHANNELS SECTION */}
      <Card className="p-5 shadow-soft border-mpesa/30 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-mpesa/15 text-mpesa grid place-items-center shrink-0">
              <Smartphone className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">M-Pesa Payment Destinations</h3>
                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[11px]">
                  Connected
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Manage your Till Numbers (Buy Goods), Paybills, and Send Money (Phone Numbers) for customer checkouts.
              </p>
            </div>
          </div>

          <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-mpesa hover:bg-mpesa/90 text-white border-0 shrink-0">
                <Plus className="h-4 w-4 mr-1.5" /> Add M-Pesa Channel
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Smartphone className="h-5 w-5 text-mpesa" /> Add M-Pesa Channel
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="space-y-1.5">
                  <Label>Channel Type</Label>
                  <Select value={newType} onValueChange={(v: MpesaChannelType) => setNewType(v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="till">
                        <div className="flex items-center gap-2">
                          <Radio className="h-4 w-4 text-emerald-600" />
                          <span>Till Number (Buy Goods & Services)</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="paybill">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-blue-600" />
                          <span>Paybill (Business Paybill)</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="send_money">
                        <div className="flex items-center gap-2">
                          <Send className="h-4 w-4 text-purple-600" />
                          <span>Send Money (Personal Phone Number)</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label>Channel Label Name</Label>
                  <Input
                    placeholder={
                      newType === "till"
                        ? "e.g. Kato Kitchen Main Till"
                        : newType === "paybill"
                        ? "e.g. Kato Business Paybill"
                        : "e.g. Owner Phone (Send Money)"
                    }
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label>
                    {newType === "till"
                      ? "Till Number"
                      : newType === "paybill"
                      ? "Paybill Number"
                      : "M-Pesa Phone Number"}
                  </Label>
                  <Input
                    placeholder={
                      newType === "till"
                        ? "e.g. 174379"
                        : newType === "paybill"
                        ? "e.g. 400200"
                        : "e.g. 0712 345 678"
                    }
                    value={newNumber}
                    onChange={(e) => setNewNumber(e.target.value)}
                  />
                </div>

                {newType === "paybill" && (
                  <div className="space-y-1.5">
                    <Label>Account Reference / Number</Label>
                    <Input
                      placeholder="e.g. KATO01 or SHOP"
                      value={newAccountRef}
                      onChange={(e) => setNewAccountRef(e.target.value)}
                    />
                  </div>
                )}

                {newType === "send_money" && (
                  <div className="space-y-1.5">
                    <Label>Recipient Name (for customer verification)</Label>
                    <Input
                      placeholder="e.g. Kato Joseph"
                      value={newRecipientName}
                      onChange={(e) => setNewRecipientName(e.target.value)}
                    />
                  </div>
                )}

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="isDefaultCheck"
                    checked={newIsDefault}
                    onChange={(e) => setNewIsDefault(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-mpesa focus:ring-mpesa"
                  />
                  <Label htmlFor="isDefaultCheck" className="text-xs font-normal cursor-pointer">
                    Set as default channel for POS checkout
                  </Label>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button className="bg-mpesa hover:bg-mpesa/90 text-white border-0" onClick={handleAddChannel}>
                  Save Channel
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setActiveTab("all")}
            className={cn(
              "px-3 py-1 rounded-full text-xs font-medium transition-colors",
              activeTab === "all" ? "bg-mpesa text-white" : "bg-muted hover:bg-muted/80 text-muted-foreground"
            )}
          >
            All Channels ({channels.length})
          </button>
          <button
            onClick={() => setActiveTab("till")}
            className={cn(
              "px-3 py-1 rounded-full text-xs font-medium transition-colors",
              activeTab === "till" ? "bg-emerald-600 text-white" : "bg-muted hover:bg-muted/80 text-muted-foreground"
            )}
          >
            Till Numbers ({channels.filter((c) => c.type === "till").length})
          </button>
          <button
            onClick={() => setActiveTab("paybill")}
            className={cn(
              "px-3 py-1 rounded-full text-xs font-medium transition-colors",
              activeTab === "paybill" ? "bg-blue-600 text-white" : "bg-muted hover:bg-muted/80 text-muted-foreground"
            )}
          >
            Paybill ({channels.filter((c) => c.type === "paybill").length})
          </button>
          <button
            onClick={() => setActiveTab("send_money")}
            className={cn(
              "px-3 py-1 rounded-full text-xs font-medium transition-colors",
              activeTab === "send_money" ? "bg-purple-600 text-white" : "bg-muted hover:bg-muted/80 text-muted-foreground"
            )}
          >
            Send Money ({channels.filter((c) => c.type === "send_money").length})
          </button>
        </div>

        {/* Channels List */}
        <div className="space-y-2.5">
          {filteredChannels.map((c) => (
            <div
              key={c.id}
              className={cn(
                "flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl border transition-all",
                c.isDefault
                  ? "border-mpesa/60 bg-mpesa/5 dark:bg-mpesa/10"
                  : "bg-card hover:border-border/80"
              )}
            >
              <div className="flex items-start gap-3 min-w-0">
                <div
                  className={cn(
                    "h-9 w-9 rounded-lg grid place-items-center shrink-0 mt-0.5",
                    c.type === "till"
                      ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                      : c.type === "paybill"
                      ? "bg-blue-500/15 text-blue-600 dark:text-blue-400"
                      : "bg-purple-500/15 text-purple-600 dark:text-purple-400"
                  )}
                >
                  {c.type === "till" ? (
                    <Radio className="h-4 w-4" />
                  ) : c.type === "paybill" ? (
                    <Building2 className="h-4 w-4" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm">{c.name}</span>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[10px] py-0 px-2 uppercase tracking-wide font-semibold",
                        c.type === "till"
                          ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20"
                          : c.type === "paybill"
                          ? "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20"
                          : "bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/20"
                      )}
                    >
                      {c.type === "till"
                        ? "Till (Buy Goods)"
                        : c.type === "paybill"
                        ? "Paybill"
                        : "Send Money (P2P)"}
                    </Badge>

                    {c.isDefault && (
                      <Badge className="bg-mpesa text-white text-[10px] py-0 px-2 gap-1 border-0">
                        <Star className="h-3 w-3 fill-white" /> Primary POS Default
                      </Badge>
                    )}
                  </div>

                  <div className="text-xs text-muted-foreground mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                    <span>
                      <strong>
                        {c.type === "till" ? "Till #" : c.type === "paybill" ? "Paybill #" : "Phone #"}
                      </strong>{" "}
                      {c.number}
                    </span>
                    {c.accountRef && (
                      <span>
                        <strong>Acc Ref:</strong> {c.accountRef}
                      </span>
                    )}
                    {c.recipientName && (
                      <span>
                        <strong>Recipient:</strong> {c.recipientName}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                {!c.isDefault && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 text-xs text-muted-foreground hover:text-foreground"
                    onClick={() => handleSetDefault(c.id)}
                  >
                    <Star className="h-3.5 w-3.5 mr-1" /> Make Default
                  </Button>
                )}

                <div className="flex items-center gap-1.5 border-l pl-2">
                  <Switch
                    checked={c.active}
                    onCheckedChange={() => handleToggleActive(c.id)}
                    title={c.active ? "Active" : "Inactive"}
                  />
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => handleDeleteChannel(c.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between pt-3 border-t text-xs">
          <div className="space-y-0.5">
            <div className="font-medium text-foreground">Auto-Reconcile STK & C2B Callbacks</div>
            <div className="text-muted-foreground">Automatically match M-Pesa notifications to registered orders</div>
          </div>
          <Switch defaultChecked />
        </div>
      </Card>

      <Card className="p-5 shadow-soft">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 rounded-xl bg-primary-soft text-primary grid place-items-center"><Bell className="h-5 w-5" /></div>
          <div><h3 className="font-semibold">Notifications</h3><p className="text-xs text-muted-foreground">What we ping you about</p></div>
        </div>
        {[
          ["Live sales notifications", true],
          ["Low stock alerts", true],
          ["Daily profit summary (8 PM)", true],
          ["Refund approval requests", true],
          ["Marketing tips from KaliPOS", false],
        ].map(([label, on]) => (
          <div key={label as string} className="flex items-center justify-between py-2.5 border-b last:border-0">
            <span className="text-sm">{label}</span>
            <Switch defaultChecked={on as boolean} />
          </div>
        ))}
      </Card>

      <Card className="p-5 shadow-soft">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 rounded-xl bg-primary-soft text-primary grid place-items-center"><Globe className="h-5 w-5" /></div>
          <div><h3 className="font-semibold">Language & region</h3><p className="text-xs text-muted-foreground">Kenya 🇰🇪 · KES · English / Kiswahili</p></div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex-1">English</Button>
          <Button variant="outline" size="sm" className="flex-1">Kiswahili</Button>
        </div>
      </Card>

      <div className="flex justify-end">
        <Button
          className="gradient-primary border-0"
          onClick={() => toast.success("Settings saved successfully", { description: "M-Pesa payment channels updated." })}
        >
          <Shield className="h-4 w-4 mr-1.5" /> Save changes
        </Button>
      </div>
    </div>
  );
}

