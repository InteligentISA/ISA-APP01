import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface ProfileCompletionModalProps {
  isOpen: boolean;
  initialData: Partial<{
    firstName: string;
    lastName: string;
    email: string;
    county: string;
    constituency: string;
    gender: string;
    phoneNumber: string;
    dateOfBirth: string;
  }> | null;
  onComplete: (data: any) => void;
  onClose: () => void;
}

const counties = [
  "Nairobi", "Mombasa", "Kisumu", "Kiambu", "Nakuru", "Machakos", "Kakamega", "Bungoma", "Uasin Gishu", "Nyeri"
];

const constituencies = {
  Nairobi: ["Westlands", "Lang'ata", "Starehe", "Dagoretti North", "Dagoretti South", "Kasarani", "Embakasi North", "Embakasi South", "Embakasi Central", "Embakasi East", "Embakasi West", "Makadara", "Kamukunji", "Kibra", "Ruaraka", "Roysambu", "Kasarani", "Mathare"],
  Mombasa: ["Kisauni", "Likoni", "Mvita", "Changamwe", "Jomvu", "Nyali"],
  Kisumu: ["Kisumu Central", "Kisumu East", "Kisumu West", "Seme", "Nyando", "Muhoroni", "Nyakach"],
  Kiambu: ["Kiambu", "Kiambaa", "Kabete", "Kikuyu", "Limuru", "Lari", "Gatundu North", "Gatundu South", "Juja", "Thika Town", "Ruiru", "Githunguri"],
  Nakuru: ["Nakuru Town East", "Nakuru Town West", "Naivasha", "Gilgil", "Subukia", "Bahati", "Rongai", "Njoro", "Molo", "Kuresoi North", "Kuresoi South"]
};

export default function ProfileCompletionModal({ isOpen, initialData, onComplete, onClose }: ProfileCompletionModalProps) {
  const [form, setForm] = useState({
    firstName: initialData?.firstName || "",
    lastName: initialData?.lastName || "",
    county: initialData?.county || "",
    constituency: initialData?.constituency || "",
    gender: initialData?.gender || "",
    phoneNumber: initialData?.phoneNumber || "",
    dateOfBirth: initialData?.dateOfBirth || "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Update form when initialData changes
  useEffect(() => {
    if (initialData) {
      setForm({
        firstName: initialData?.firstName || "",
        lastName: initialData?.lastName || "",
        county: initialData?.county || "",
        constituency: initialData?.constituency || "",
        gender: initialData?.gender || "",
        phoneNumber: initialData?.phoneNumber || "",
        dateOfBirth: initialData?.dateOfBirth || "",
      });
    } else {
      // Reset form if initialData is null
      setForm({
        firstName: "",
        lastName: "",
        county: "",
        constituency: "",
        gender: "",
        phoneNumber: "",
        dateOfBirth: "",
      });
    }
  }, [initialData]);

  const handleChange = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (field === "county") setForm(prev => ({ ...prev, constituency: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Validate required fields
    if (!form.firstName || !form.lastName || !form.county || !form.constituency || !form.gender || !form.phoneNumber || !form.dateOfBirth) {
      toast({ title: "Missing Fields", description: "Please fill all required fields.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    onComplete(form);
    setIsLoading(false);
  };

  if (!isOpen || !initialData) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="light">
        <Card className="w-full max-w-lg bg-white max-h-[90vh] overflow-y-auto">
          <CardHeader className="text-center relative">
            <CardTitle className="text-2xl font-bold text-gray-900">Complete Your Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                placeholder="First Name"
                value={form.firstName}
                onChange={e => handleChange("firstName", e.target.value)}
                required
              />
              <Input
                placeholder="Last Name"
                value={form.lastName}
                onChange={e => handleChange("lastName", e.target.value)}
                required
              />
              <Select value={form.county} onValueChange={v => handleChange("county", v)} required>
                <SelectTrigger><SelectValue placeholder="Select County" /></SelectTrigger>
                <SelectContent>
                  {counties.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
              {form.county && (
                <Select value={form.constituency} onValueChange={v => handleChange("constituency", v)} required>
                  <SelectTrigger><SelectValue placeholder="Select Constituency" /></SelectTrigger>
                  <SelectContent>
                    {(constituencies[form.county as keyof typeof constituencies] || []).map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              )}
              <Select value={form.gender} onValueChange={v => handleChange("gender", v)} required>
                <SelectTrigger><SelectValue placeholder="Select Gender" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                  <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                </SelectContent>
              </Select>
              <Input
                type="date"
                placeholder="Date of Birth"
                value={form.dateOfBirth}
                onChange={e => handleChange("dateOfBirth", e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                required
              />
              <Input
                placeholder="Phone Number"
                value={form.phoneNumber}
                onChange={e => handleChange("phoneNumber", e.target.value)}
                required
              />
              <Button type="submit" className="w-full" disabled={isLoading}>{isLoading ? "Saving..." : "Continue"}</Button>
              <Button type="button" variant="ghost" className="w-full" onClick={onClose}>Cancel</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 