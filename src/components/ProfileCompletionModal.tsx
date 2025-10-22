import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import LocationSelector from "@/components/LocationSelector";
import { hasWards } from "@/lib/locationData";

interface ProfileCompletionModalProps {
  isOpen: boolean;
  initialData: Partial<{
    firstName: string;
    lastName: string;
    email: string;
    county: string;
    constituency: string;
    ward: string;
    gender: string;
    phoneNumber: string;
    dateOfBirth: string;
  }> | null;
  onComplete: (data: any) => void;
  onClose: () => void;
}


export default function ProfileCompletionModal({ isOpen, initialData, onComplete, onClose }: ProfileCompletionModalProps) {
  const [form, setForm] = useState({
    firstName: initialData?.firstName || "",
    lastName: initialData?.lastName || "",
    county: initialData?.county || "",
    constituency: initialData?.constituency || "",
    ward: initialData?.ward || "",
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
        ward: initialData?.ward || "",
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
        ward: "",
        gender: "",
        phoneNumber: "",
        dateOfBirth: "",
      });
    }
  }, [initialData]);

  const handleChange = (field: string, value: string) => {
    setForm(prev => {
      const newForm = { ...prev, [field]: value };
      if (field === 'county') {
        newForm.constituency = "";
        newForm.ward = "";
      } else if (field === 'constituency') {
        newForm.ward = "";
      }
      return newForm;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Validate required fields
    if (!form.firstName || !form.lastName || !form.county || !form.constituency || !form.gender || !form.phoneNumber || !form.dateOfBirth || (hasWards(form.county) && !form.ward)) {
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
              <LocationSelector
                selectedCounty={form.county}
                selectedConstituency={form.constituency}
                selectedWard={form.ward}
                onCountyChange={(county) => handleChange("county", county)}
                onConstituencyChange={(constituency) => handleChange("constituency", constituency)}
                onWardChange={(ward) => handleChange("ward", ward)}
              />
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