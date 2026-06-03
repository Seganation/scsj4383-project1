"use client";

import { useSession } from "@/app/lib/auth-client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import {
  Camera,
  ShieldCheck,
  ShieldAlert,
  Loader2,
  ArrowUpRight,
  Lock,
  X,
} from "lucide-react";
import { PageShell } from "@/components/storefront/PageShell";

function SimpleDialog({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: (v: boolean) => void;
  children: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/70 backdrop-blur-sm p-6">
      <div className="relative w-full max-w-lg border border-ink/15 bg-paper p-8">
        <button
          onClick={() => onClose(false)}
          aria-label="Close"
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center text-steel hover:text-ink"
        >
          <X className="h-4 w-4" />
        </button>
        {children}
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const { data: session, isPending, error } = useSession();
  const user = session?.user;
  const needsProfileMerge =
    (user as any)?.needsProfileMerge || (session as any)?.needsProfileMerge || false;
  const googleProfile =
    (user as any)?.googleProfile || (session as any)?.googleProfile || {};
  const googleProfileImage = googleProfile.picture || "";
  const googleFirstName = googleProfile.given_name || "";
  const googleLastName = googleProfile.family_name || "";

  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [orderCount, setOrderCount] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [firstName, setFirstName] = useState(user?.firstName ?? "");
  const [lastName, setLastName] = useState(user?.lastName ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showMergeModal, setShowMergeModal] = useState(needsProfileMerge);
  const [selectedAvatar, setSelectedAvatar] = useState<"current" | "google">("current");
  const [selectedName, setSelectedName] = useState<"current" | "google">("current");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user?.id) {
      fetch(`/api/orders/by-user/${user.id}`)
        .then((r) => r.json())
        .then((o) => setOrderCount(o.length))
        .catch(() => setOrderCount(null));
    }
  }, [user?.id]);

  const colorIcon = (e: string) =>
    `https://avatar.vercel.sh/${encodeURIComponent(e)}?size=256&colors=1E4AC3,0E2E7A,4A7DFF,C0CCE5,2A3A57`;

  const handleAvatarClick = () => fileInputRef.current?.click();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload-avatar", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to upload avatar");
      await fetch("/api/user/update-profile-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: data.url }),
      });
      toast.success("Profile image updated");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to update avatar");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await fetch("/api/user/update-profile-info", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName, email }),
      });
      toast.success("Profile updated");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to update");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSendOtp = async () => {
    try {
      await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user?.email, type: "password-reset" }),
      });
      toast.success("OTP sent to your email");
    } catch (err: any) {
      toast.error(err.message || "Failed to send OTP");
    }
  };

  const handleChangePassword = async () => {
    if (!otp || !newPassword || newPassword !== confirmNewPassword) {
      toast.error("Please fill all fields and confirm password");
      return;
    }
    try {
      await fetch("/api/auth/set-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: newPassword, otp }),
      });
      toast.success("Password changed");
      setShowPasswordForm(false);
      setOtp("");
      setNewPassword("");
      setConfirmNewPassword("");
    } catch (err: any) {
      toast.error(err.message || "Failed to change password");
    }
  };

  const handleMergeSubmit = async () => {
    setIsSubmitting(true);
    try {
      await fetch("/api/user/merge-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatar: selectedAvatar, name: selectedName }),
      });
      toast.success("Profile updated");
      setShowMergeModal(false);
      window.location.reload();
    } catch {
      toast.error("Failed to update");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isPending) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-paper">
        <Loader2 className="h-8 w-8 animate-spin text-copper" />
      </div>
    );
  }

  if (error || !user) {
    return (
      <PageShell
        section="§ — Access denied"
        title="Sign-in required"
        lede="You need to be signed in to view this profile."
      >
        <Link href="/sign-in" className="btn-ink">
          Sign in
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </PageShell>
    );
  }

  const avatarSrc = user.image ?? colorIcon(user?.email || "");

  return (
    <>
      {showMergeModal && (
        <SimpleDialog open={showMergeModal} onClose={setShowMergeModal}>
          <div className="eyebrow-copper">§ Merge Google profile</div>
          <h2 className="display mt-3 text-2xl text-ink">Pick what to keep.</h2>
          <div className="mt-6 grid grid-cols-2 gap-5">
            <MergeOption
              label="Current"
              image={avatarSrc}
              active={selectedAvatar === "current"}
              onClick={() => setSelectedAvatar("current")}
            />
            <MergeOption
              label="Google"
              image={googleProfileImage || colorIcon(googleProfile.email || "")}
              active={selectedAvatar === "google"}
              onClick={() => setSelectedAvatar("google")}
            />
          </div>
          <div className="mt-6 grid grid-cols-2 gap-5">
            <button
              onClick={() => setSelectedName("current")}
              className={`border p-4 text-left ${selectedName === "current" ? "border-copper bg-copper/5" : "border-ink/20 hover:border-ink"}`}
            >
              <div className="eyebrow !text-steel">Current name</div>
              <div className="mt-1 font-display text-lg font-semibold text-ink">
                {user.firstName} {user.lastName}
              </div>
            </button>
            <button
              onClick={() => setSelectedName("google")}
              className={`border p-4 text-left ${selectedName === "google" ? "border-copper bg-copper/5" : "border-ink/20 hover:border-ink"}`}
            >
              <div className="eyebrow !text-steel">Google name</div>
              <div className="mt-1 font-display text-lg font-semibold text-ink">
                {googleFirstName} {googleLastName}
              </div>
            </button>
          </div>
          <button
            onClick={handleMergeSubmit}
            disabled={isSubmitting}
            className="btn-ink mt-8 w-full"
          >
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            Save merge
          </button>
        </SimpleDialog>
      )}

      <PageShell
        section="§ 10 — Your file"
        breadcrumbs={[{ name: "Home", href: "/" }, { name: "Profile" }]}
        title={
          <>
            The <span className="italic text-copper">back-of-house.</span>
          </>
        }
        lede="Edit your details, change your password, and jump to your order logbook."
      >
        <div className="grid grid-cols-12 gap-8">
          {/* Sidebar identity card */}
          <aside className="col-span-12 lg:col-span-4">
            <div className="sticky top-28 border border-ink/15 bg-paper-dim">
              <div className="relative flex flex-col items-center gap-4 border-b border-ink/10 p-8">
                <div className="relative">
                  <div className="relative h-28 w-28 overflow-hidden border border-ink bg-ink">
                    <Image
                      src={avatarSrc}
                      alt={user.firstName || user.name || "User"}
                      fill
                      sizes="112px"
                      className="object-cover"
                    />
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    style={{ display: "none" }}
                    onChange={handleFileChange}
                  />
                  <button
                    onClick={handleAvatarClick}
                    disabled={isUploading}
                    aria-label="Change avatar"
                    className="absolute -bottom-2 -right-2 flex h-9 w-9 items-center justify-center border border-copper bg-copper text-paper transition-colors hover:bg-ink hover:border-ink"
                  >
                    {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
                  </button>
                </div>
                <div className="text-center">
                  <div className="font-display text-xl font-semibold text-ink">
                    {user.firstName || user.name} {user.lastName || ""}
                  </div>
                  <div className="mt-1 font-mono text-[0.72rem] uppercase tracking-[0.14em] text-steel-light">
                    {user.email}
                  </div>
                </div>
                <div className="flex items-center gap-2 font-mono text-[0.68rem] uppercase tracking-[0.14em]">
                  {user.emailVerified ? (
                    <>
                      <ShieldCheck className="h-3.5 w-3.5 text-copper" />
                      <span className="text-copper">Email verified</span>
                    </>
                  ) : (
                    <>
                      <ShieldAlert className="h-3.5 w-3.5 text-ember" />
                      <span className="text-ember">Email not verified</span>
                    </>
                  )}
                </div>
              </div>
              <div className="p-6">
                <div className="eyebrow-copper">Activity</div>
                <div className="mt-4 flex items-baseline justify-between">
                  <span className="font-mono text-[0.75rem] uppercase tracking-[0.14em] text-steel-light">
                    Orders placed
                  </span>
                  <span className="font-display text-2xl font-semibold tabular-nums text-ink">
                    {orderCount !== null ? String(orderCount).padStart(2, "0") : "—"}
                  </span>
                </div>
                <Link href="/my-orders" className="btn-ghost mt-6 w-full border-ink/30">
                  View my orders
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </aside>

          {/* Main fields */}
          <section className="col-span-12 lg:col-span-8 space-y-8">
            <div className="border border-ink/15 bg-paper">
              <header className="flex items-center justify-between border-b border-ink/10 bg-paper-dim px-6 py-4">
                <div className="eyebrow-copper">§ 01 — Personal details</div>
              </header>
              <div className="grid grid-cols-1 gap-5 p-6 md:grid-cols-2 md:p-8">
                <div>
                  <label htmlFor="firstName" className="field-label">First name</label>
                  <input
                    id="firstName"
                    className="field-input"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="field-label">Last name</label>
                  <input
                    id="lastName"
                    className="field-input"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </div>
                <div className="md:col-span-2">
                  <label htmlFor="email" className="field-label">Email</label>
                  <input
                    id="email"
                    type="email"
                    className="field-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="md:col-span-2">
                  <button onClick={handleSave} disabled={isSaving} className="btn-ink w-full">
                    {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                    Save changes
                  </button>
                </div>
              </div>
            </div>

            <div className="border border-ink/15 bg-paper">
              <header className="flex items-center justify-between border-b border-ink/10 bg-paper-dim px-6 py-4">
                <div className="eyebrow-copper">§ 02 — Password & security</div>
                <Lock className="h-4 w-4 text-steel-light" />
              </header>
              <div className="p-6 md:p-8">
                {!showPasswordForm ? (
                  <button
                    onClick={() => setShowPasswordForm(true)}
                    className="btn-ghost border-ink/30"
                  >
                    Change password
                  </button>
                ) : (
                  <div className="space-y-4">
                    <button onClick={handleSendOtp} className="btn-ghost border-ink/30">
                      Send OTP to email
                    </button>
                    <div>
                      <label className="field-label">OTP</label>
                      <input className="field-input" value={otp} onChange={(e) => setOtp(e.target.value)} />
                    </div>
                    <div>
                      <label className="field-label">New password</label>
                      <input
                        type="password"
                        className="field-input"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="field-label">Confirm new password</label>
                      <input
                        type="password"
                        className="field-input"
                        value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                      />
                    </div>
                    <div className="flex gap-3">
                      <button onClick={handleChangePassword} className="btn-ink flex-1">
                        Change password
                      </button>
                      <button
                        onClick={() => setShowPasswordForm(false)}
                        className="btn-ghost border-ink/30 flex-1"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>
      </PageShell>
    </>
  );
}

function MergeOption({
  label,
  image,
  active,
  onClick,
}: {
  label: string;
  image: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-3 border p-4 transition-colors ${
        active ? "border-copper bg-copper/5" : "border-ink/20 hover:border-ink"
      }`}
    >
      <div className="relative h-20 w-20 overflow-hidden border border-ink">
        <Image src={image} alt={label} fill sizes="80px" className="object-cover" />
      </div>
      <span className="font-mono text-[0.72rem] uppercase tracking-[0.14em] text-ink">
        {label}
      </span>
    </button>
  );
}
