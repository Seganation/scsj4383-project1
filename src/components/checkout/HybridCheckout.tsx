"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { useSession } from "@/app/lib/auth-client";
import { toast } from "react-hot-toast";
import {
  ShoppingBag,
  User,
  CreditCard,
  MapPin,
  Mail,
  Phone,
} from "lucide-react";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

interface ShippingAddress {
  fullName: string;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

interface HybridCheckoutProps {
  cartItems: CartItem[];
  onCheckoutComplete?: (orderId: string) => void;
}

export function HybridCheckout({
  cartItems,
  onCheckoutComplete,
}: HybridCheckoutProps) {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [checkoutType, setCheckoutType] = useState<"guest" | "user">(
    session?.user ? "user" : "guest"
  );
  const [createAccount, setCreateAccount] = useState(false);

  // Shipping address state
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    fullName: "",
    email: session?.user?.email || "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "US",
  });

  // User addresses (if logged in)
  const [userAddresses, setUserAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("new");

  // Calculate totals
  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  // Shipping is not calculated here; see alert below
  const shipping = 0;
  const tax = 0;
  const total = subtotal;

  // Load user addresses if logged in
  useEffect(() => {
    if (session?.user) {
      fetchUserAddresses();
    }
  }, [session]);

  // Prefill address if user is logged in and has a default address
  useEffect(() => {
    if (session?.user) {
      setShippingAddress((prev) => ({
        ...prev,
        fullName:
          session.user.firstName && session.user.lastName
            ? `${session.user.firstName} ${session.user.lastName}`
            : session.user.name || "",
        email: session.user.email || "",
      }));
    }
  }, [session]);

  const fetchUserAddresses = async () => {
    try {
      const response = await fetch("/api/user/addresses");
      if (response.ok) {
        const addresses = await response.json();
        setUserAddresses(addresses);

        // Auto-select default address
        const defaultAddress = addresses.find((addr: any) => addr.isDefault);
        if (defaultAddress) {
          setSelectedAddressId(defaultAddress.id);
          setShippingAddress({
            fullName: defaultAddress.fullName,
            email: session?.user?.email || defaultAddress.email || "",
            phone: defaultAddress.phone || "",
            addressLine1: defaultAddress.addressLine1,
            addressLine2: defaultAddress.addressLine2 || "",
            city: defaultAddress.city,
            state: defaultAddress.state || "",
            postalCode: defaultAddress.postalCode,
            country: defaultAddress.country,
          });
        }
      }
    } catch (error) {
      console.error("Error fetching addresses:", error);
    }
  };

  const handleAddressSelect = (addressId: string) => {
    setSelectedAddressId(addressId);

    if (addressId === "new") {
      // Reset to new address
      setShippingAddress({
        fullName:
          session?.user?.firstName && session?.user?.lastName
            ? `${session.user.firstName} ${session.user.lastName}`
            : session?.user?.name || "",
        email: session?.user?.email || "",
        phone: "",
        addressLine1: "",
        addressLine2: "",
        city: "",
        state: "",
        postalCode: "",
        country: "US",
      });
    } else {
      // Use selected address
      const selectedAddress = userAddresses.find(
        (addr) => addr.id === addressId
      );
      if (selectedAddress) {
        setShippingAddress({
          fullName: selectedAddress.fullName,
          email: session?.user?.email || selectedAddress.email || "",
          phone: selectedAddress.phone || "",
          addressLine1: selectedAddress.addressLine1,
          addressLine2: selectedAddress.addressLine2 || "",
          city: selectedAddress.city,
          state: selectedAddress.state || "",
          postalCode: selectedAddress.postalCode,
          country: selectedAddress.country,
        });
      }
    }
  };

  const validateForm = () => {
    const required = [
      "fullName",
      "email",
      "addressLine1",
      "city",
      "postalCode",
      "country",
    ];
    const missing = required.filter(
      (field) => !shippingAddress[field as keyof ShippingAddress]
    );

    if (missing.length > 0) {
      toast.error(`Please fill in: ${missing.join(", ")}`);
      return false;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(shippingAddress.email)) {
      toast.error("Please enter a valid email address");
      return false;
    }

    // Postal code validation (basic)
    if (
      shippingAddress.country === "US" &&
      !/^\d{5}(-\d{4})?$/.test(shippingAddress.postalCode)
    ) {
      toast.error("Please enter a valid US zip code");
      return false;
    }

    return true;
  };

  const handleCheckout = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      // Prepare checkout data
      const checkoutData = {
        items: cartItems.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
        })),
        shippingAddress,
        isGuest: checkoutType === "guest",
        createAccount: checkoutType === "guest" ? createAccount : false,
        selectedAddressId:
          session?.user && selectedAddressId !== "new"
            ? selectedAddressId
            : null,
      };

      const response = await fetch("/api/checkout/hybrid", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(checkoutData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Checkout failed");
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL received");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error(error instanceof Error ? error.message : "Checkout failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Checkout</h1>
        <p className="text-gray-600">Complete your order securely</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Checkout Form */}
        <div className="space-y-6">
          {!session?.user && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Account Options
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs
                  value={checkoutType}
                  onValueChange={(value) =>
                    setCheckoutType(value as "guest" | "user")
                  }
                >
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="guest">Guest Checkout</TabsTrigger>
                    <TabsTrigger value="user">Sign In</TabsTrigger>
                  </TabsList>

                  <TabsContent value="guest" className="mt-4">
                    <div className="space-y-4">
                      <p className="text-sm text-gray-600">
                        Check out quickly without creating an account
                      </p>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="create-account"
                          checked={createAccount}
                          onCheckedChange={checked => setCreateAccount(checked === true)}
                        />
                        <Label htmlFor="create-account" className="text-sm">
                          Create an account for order tracking and faster future
                          checkouts
                        </Label>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="user" className="mt-4">
                    <div className="space-y-4">
                      <p className="text-sm text-gray-600">
                        Sign in to use saved addresses and track your orders
                      </p>
                      <Button
                        onClick={() =>
                          (window.location.href = "/auth/email-auth")
                        }
                        className="w-full"
                      >
                        Sign In / Create Account
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          )}

          {/* Shipping Address */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Shipping Address
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Address Selection for Logged-in Users */}
              {session?.user && userAddresses.length > 0 && (
                <div className="space-y-3">
                  <Label>Select Address</Label>
                  <RadioGroup
                    value={selectedAddressId}
                    onValueChange={handleAddressSelect}
                  >
                    {userAddresses.map((address) => (
                      <div
                        key={address.id}
                        className="flex items-center space-x-2"
                      >
                        <RadioGroupItem value={address.id} id={address.id} />
                        <Label
                          htmlFor={address.id}
                          className="flex-1 cursor-pointer"
                        >
                          <div className="p-3 border rounded-lg">
                            <div className="font-medium">
                              {address.fullName}
                            </div>
                            <div className="text-sm text-gray-600">
                              {address.addressLine1}
                              {address.addressLine2 &&
                                `, ${address.addressLine2}`}
                            </div>
                            <div className="text-sm text-gray-600">
                              {address.city}, {address.state}{" "}
                              {address.postalCode}
                            </div>
                            {address.isDefault && (
                              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                Default
                              </span>
                            )}
                          </div>
                        </Label>
                      </div>
                    ))}
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="new" id="new-address" />
                      <Label htmlFor="new-address" className="cursor-pointer">
                        Use new address
                      </Label>
                    </div>
                  </RadioGroup>
                  <Separator />
                </div>
              )}

              {/* Address Form */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input
                    id="fullName"
                    value={shippingAddress.fullName}
                    onChange={(e) =>
                      setShippingAddress((prev) => ({
                        ...prev,
                        fullName: e.target.value,
                      }))
                    }
                    placeholder="John Doe"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={shippingAddress.email}
                    onChange={(e) =>
                      setShippingAddress((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                    placeholder="john@example.com"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={shippingAddress.phone}
                    onChange={(e) =>
                      setShippingAddress((prev) => ({
                        ...prev,
                        phone: e.target.value,
                      }))
                    }
                    placeholder="+1 (555) 123-4567"
                  />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="addressLine1">Address Line 1 *</Label>
                  <Input
                    id="addressLine1"
                    value={shippingAddress.addressLine1}
                    onChange={(e) =>
                      setShippingAddress((prev) => ({
                        ...prev,
                        addressLine1: e.target.value,
                      }))
                    }
                    placeholder="123 Main Street"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="addressLine2">Address Line 2</Label>
                  <Input
                    id="addressLine2"
                    value={shippingAddress.addressLine2}
                    onChange={(e) =>
                      setShippingAddress((prev) => ({
                        ...prev,
                        addressLine2: e.target.value,
                      }))
                    }
                    placeholder="Apt, suite, unit, building, floor, etc."
                  />
                </div>

                <div>
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    value={shippingAddress.city}
                    onChange={(e) =>
                      setShippingAddress((prev) => ({
                        ...prev,
                        city: e.target.value,
                      }))
                    }
                    placeholder="New York"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="state">State/Province</Label>
                  <Input
                    id="state"
                    value={shippingAddress.state}
                    onChange={(e) =>
                      setShippingAddress((prev) => ({
                        ...prev,
                        state: e.target.value,
                      }))
                    }
                    placeholder="NY"
                  />
                </div>

                <div>
                  <Label htmlFor="postalCode">Postal Code *</Label>
                  <Input
                    id="postalCode"
                    value={shippingAddress.postalCode}
                    onChange={(e) =>
                      setShippingAddress((prev) => ({
                        ...prev,
                        postalCode: e.target.value,
                      }))
                    }
                    placeholder="10001"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="country">Country *</Label>
                  <select
                    id="country"
                    value={shippingAddress.country}
                    onChange={(e) =>
                      setShippingAddress((prev) => ({
                        ...prev,
                        country: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  >
                    <option value="US">United States</option>
                    <option value="CA">Canada</option>
                    <option value="UK">United Kingdom</option>
                    <option value="AU">Australia</option>
                  </select>
                </div>
              </div>

              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Shipping:</strong> Standard delivery (2-4 business
                  days) - $15.00
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Order Summary */}
        <div className="space-y-6">
          {/* VAT/Shipping Alert */}
          <div className="p-4 mb-2 bg-yellow-50 border border-yellow-300 rounded-lg">
            <p className="text-sm text-yellow-900 font-medium">
              <strong>Important:</strong> All product prices include VAT. <br />
              <span className="block mt-1">
                <strong>Shipping is not included</strong> and will be paid separately on delivery. Shipping costs vary by location and are not shown here.
              </span>
            </p>
          </div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5" />
                Order Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Cart Items */}
              <div className="space-y-3">
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-center"
                  >
                    <div className="flex-1">
                      <div className="font-medium">{item.name}</div>
                      <div className="text-sm text-gray-600">
                        Qty: {item.quantity}
                      </div>
                    </div>
                    <div className="font-medium">
                      £{item.price * item.quantity}
                    </div>
                  </div>
                ))}
              </div>

              <Separator />

              {/* Pricing Breakdown */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>£{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>—</span>
                </div>
                <div className="flex justify-between">
                  <span>VAT</span>
                  <span>Included</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>£{total.toFixed(2)}</span>
                </div>
              </div>

              <Button
                onClick={handleCheckout}
                disabled={isLoading || cartItems.length === 0}
                className="w-full"
                size="lg"
              >
                {isLoading ? (
                  "Processing..."
                ) : (
                  <>
                    <CreditCard className="w-4 h-4 mr-2" />
                    Complete Order
                  </>
                )}
              </Button>

              <div className="text-xs text-gray-500 text-center">
                Your payment information is processed securely by Stripe
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
