"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Address {
  id: string;
  label: string;
  fullName: string;
  phone?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

interface AddressFormProps {
  userAddresses: Address[];
  onAddressSelect: (address: Address | "new") => void;
  onNewAddressSubmit: (addressData: Omit<Address, "id" | "isDefault">) => void;
  selectedAddressId?: string;
}

export function AddressForm({
  userAddresses,
  onAddressSelect,
  onNewAddressSubmit,
  selectedAddressId,
}: AddressFormProps) {
  const [isNewAddress, setIsNewAddress] = useState(userAddresses.length === 0);
  const [formData, setFormData] = useState({
    label: "",
    fullName: "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "US",
  });

  const handleAddressSelection = (value: string) => {
    if (value === "new") {
      setIsNewAddress(true);
      onAddressSelect("new");
    } else {
      const selectedAddress = userAddresses.find((addr) => addr.id === value);
      if (selectedAddress) {
        setIsNewAddress(false);
        onAddressSelect(selectedAddress);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNewAddressSubmit(formData);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Shipping Address</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {userAddresses.length > 0 && (
          <div>
            <Label>Choose Address</Label>
            <Select
              onValueChange={handleAddressSelection}
              defaultValue={selectedAddressId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select an address or add new" />
              </SelectTrigger>
              <SelectContent>
                {userAddresses.map((address) => (
                  <SelectItem key={address.id} value={address.id}>
                    <div className="flex flex-col">
                      <span className="font-medium">{address.label}</span>
                      <span className="text-sm text-muted-foreground">
                        {address.fullName}, {address.city}
                      </span>
                    </div>
                  </SelectItem>
                ))}
                <SelectItem value="new">+ Add New Address</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {isNewAddress && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="label">Address Label</Label>
                <Input
                  id="label"
                  placeholder="Home, Work, etc."
                  value={formData.label}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, label: e.target.value }))
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  placeholder="John Doe"
                  value={formData.fullName}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      fullName: e.target.value,
                    }))
                  }
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                placeholder="+1 (555) 123-4567"
                value={formData.phone}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, phone: e.target.value }))
                }
              />
            </div>

            <div>
              <Label htmlFor="addressLine1">Address Line 1</Label>
              <Input
                id="addressLine1"
                placeholder="123 Main Street"
                value={formData.addressLine1}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    addressLine1: e.target.value,
                  }))
                }
                required
              />
            </div>

            <div>
              <Label htmlFor="addressLine2">Address Line 2 (Optional)</Label>
              <Input
                id="addressLine2"
                placeholder="Apt, Suite, Unit, etc."
                value={formData.addressLine2}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    addressLine2: e.target.value,
                  }))
                }
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  placeholder="New York"
                  value={formData.city}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, city: e.target.value }))
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  placeholder="NY"
                  value={formData.state}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, state: e.target.value }))
                  }
                />
              </div>
              <div>
                <Label htmlFor="postalCode">Postal Code</Label>
                <Input
                  id="postalCode"
                  placeholder="10001"
                  value={formData.postalCode}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      postalCode: e.target.value,
                    }))
                  }
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="country">Country</Label>
              <Select
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, country: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="US">United States</SelectItem>
                  <SelectItem value="CA">Canada</SelectItem>
                  <SelectItem value="UK">United Kingdom</SelectItem>
                  <SelectItem value="AU">Australia</SelectItem>
                  {/* Add more countries as needed */}
                </SelectContent>
              </Select>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
