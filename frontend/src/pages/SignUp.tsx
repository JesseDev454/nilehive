import type { ChangeEvent, FormEvent } from "react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ArrowRight, CheckCircle2, Loader2, ShieldCheck, Users } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
import { SiteFooter } from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { NhStudentId } from "@/components/NhStudentId";
import { useAuth } from "@/contexts/AuthContext";
import { getAllowedEmailDomainLabel, isAllowedEmailDomain } from "@/lib/env";
import { getUserFacingErrorMessage, uploadSignupReceipt } from "@/lib/api";
import { publicClubsQueryOptions } from "@/lib/publicClubsQuery";
import { isValidStudentId, STUDENT_ID_ERROR_MESSAGE } from "@/lib/studentId";

const REQUESTED_ROLES = [
  { value: "student", label: "Student" },
  { value: "advisor", label: "Advisor" }
] as const;
const STUDENT_TYPE_OPTIONS = [
  { value: "fresher", label: "Fresher" },
  { value: "returning", label: "Returning Student" }
] as const;

const MAX_RECEIPT_SIZE_BYTES = 5 * 1024 * 1024;

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
        return;
      }

      reject(new Error("Receipt upload data could not be read."));
    };

    reader.onerror = () => reject(new Error("Receipt upload data could not be read."));
    reader.readAsDataURL(file);
  });
}

export default function SignUp() {
  const { signUp, session, isLoading } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [requestedRole, setRequestedRole] = useState<(typeof REQUESTED_ROLES)[number]["value"]>("student");
  const [studentId, setStudentId] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [department, setDepartment] = useState("");
  const [studentType, setStudentType] = useState<(typeof STUDENT_TYPE_OPTIONS)[number]["value"]>("returning");
  const [joinReason, setJoinReason] = useState("");
  const [clubId, setClubId] = useState("");
  const [paymentAccountName, setPaymentAccountName] = useState("");
  const [paymentReference, setPaymentReference] = useState("");
  const [paymentPaidAt, setPaymentPaidAt] = useState("");
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofFileName, setProofFileName] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingReceipt, setIsUploadingReceipt] = useState(false);
  const [signupError, setSignupError] = useState<string | null>(null);
  const [pendingReceiptUpload, setPendingReceiptUpload] = useState<{
    userId: string;
    clubId: string;
    needsEmailConfirmation: boolean;
    email: string;
  } | null>(null);
  const {
    data: clubs = [],
    isLoading: isLoadingClubs,
    isError: clubsFailed,
    error: clubsError
  } = useQuery(publicClubsQueryOptions);

  if (!isLoading && session) {
    return <Navigate to="/" replace />;
  }

  function handleReceiptSelection(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;

    if (!file) {
      setProofFile(null);
      setProofFileName("");
      return;
    }

    if (file.size > MAX_RECEIPT_SIZE_BYTES) {
      const message = "Please upload a receipt image smaller than 5MB.";
      setSignupError(message);
      toast.error("Receipt upload blocked", { description: message });
      setProofFile(null);
      setProofFileName("");
      event.target.value = "";
      return;
    }

    if (!file.type.startsWith("image/")) {
      const message = "Only image receipts can be uploaded during signup.";
      setSignupError(message);
      toast.error("Receipt upload blocked", { description: message });
      setProofFile(null);
      setProofFileName("");
      event.target.value = "";
      return;
    }

    setSignupError(null);
    setProofFile(file);
    setProofFileName(file.name);
  }

  async function uploadRequiredReceipt(userId: string, selectedClubId: string) {
    if (!proofFile) {
      throw new Error("Please upload your payment receipt before completing signup.");
    }

    setIsUploadingReceipt(true);

    try {
      const fileDataUrl = await readFileAsDataUrl(proofFile);
      await uploadSignupReceipt({
        user_id: userId,
        club_id: selectedClubId,
        file_name: proofFile.name,
        content_type: proofFile.type,
        file_data_url: fileDataUrl
      });
    } finally {
      setIsUploadingReceipt(false);
    }
  }

  function finishSignup(needsEmailConfirmation: boolean, accountEmail: string) {
    setPendingReceiptUpload(null);

    if (needsEmailConfirmation) {
      toast.success("Verification email sent", {
        description: "Check your Nile University inbox, confirm your email, then sign in."
      });
      navigate(`/signup/confirm?email=${encodeURIComponent(accountEmail.trim().toLowerCase())}`, {
        replace: true
      });
      return;
    }

    toast.success("Account created", {
      description: "Your Club Services access is ready."
    });
    navigate("/", { replace: true });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setSignupError(null);

    if (!clubId) {
      const message = "Please select your club before creating an account.";
      setSignupError(message);
      toast.error("Signup failed", { description: message });
      setIsSubmitting(false);
      return;
    }

    if (!isAllowedEmailDomain(email)) {
      const message = `Please use your Nile University email address (${getAllowedEmailDomainLabel()}).`;
      setSignupError(message);
      toast.error("Signup failed", { description: message });
      setIsSubmitting(false);
      return;
    }

    if (requestedRole === "student" && studentId && !isValidStudentId(studentId)) {
      setSignupError(STUDENT_ID_ERROR_MESSAGE);
      toast.error("Signup failed", { description: STUDENT_ID_ERROR_MESSAGE });
      setIsSubmitting(false);
      return;
    }

    if (!phoneNumber.trim()) {
      const message = "Please add the WhatsApp phone number used for club communication.";
      setSignupError(message);
      toast.error("Signup failed", { description: message });
      setIsSubmitting(false);
      return;
    }

    if (!department.trim()) {
      const message = "Please add your department before creating an account.";
      setSignupError(message);
      toast.error("Signup failed", { description: message });
      setIsSubmitting(false);
      return;
    }

    if (requestedRole === "student" && (!paymentAccountName.trim() || !paymentReference.trim())) {
      const message = "Please add the payment name and transaction reference used for your club dues.";
      setSignupError(message);
      toast.error("Signup failed", { description: message });
      setIsSubmitting(false);
      return;
    }

    if (requestedRole === "student" && !proofFile) {
      const message = "Please upload your payment receipt before completing signup.";
      setSignupError(message);
      toast.error("Receipt required", { description: message });
      setIsSubmitting(false);
      return;
    }

    try {
      if (pendingReceiptUpload) {
        await uploadRequiredReceipt(pendingReceiptUpload.userId, pendingReceiptUpload.clubId);
        finishSignup(pendingReceiptUpload.needsEmailConfirmation, pendingReceiptUpload.email);
        return;
      }

      const selectedClub = clubs.find((club) => club.id === clubId);
      const result = await signUp({
        email,
        password,
        fullName,
        requestedRole,
        clubId,
        clubName: selectedClub?.name || "",
        studentId: requestedRole === "student" ? studentId : undefined,
        phoneNumber,
        department,
        studentType: requestedRole === "student" ? studentType : undefined,
        joinReason: requestedRole === "student" ? joinReason : undefined,
        paymentAccountName: requestedRole === "student" ? paymentAccountName : undefined,
        paymentReference: requestedRole === "student" ? paymentReference : undefined,
        paymentPaidAt: requestedRole === "student" ? paymentPaidAt || null : null,
        proofUrl: null
      });

      if (requestedRole === "student") {
        if (!result.userId) {
          throw new Error("Your account was created, but we could not attach the required receipt yet. Please try again.");
        }

        try {
          await uploadRequiredReceipt(result.userId, clubId);
        } catch (uploadError) {
          const message = getUserFacingErrorMessage(
            uploadError,
            "We created your account, but your receipt still needs to upload before signup can finish. Please retry now."
          );
          setPendingReceiptUpload({
            userId: result.userId,
            clubId,
            needsEmailConfirmation: result.needsEmailConfirmation,
            email: email.trim().toLowerCase()
          });
          setSignupError(message);
          toast.error("Receipt upload required", {
            description: message
          });
          return;
        }
      }

      finishSignup(result.needsEmailConfirmation, email);
    } catch (error) {
      const message = getUserFacingErrorMessage(error, "Please check the form and try again.");
      setSignupError(message);
      toast.error("Signup failed", {
        description: message
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-col bg-background text-foreground">
      <section className="mx-auto grid w-full max-w-7xl flex-1 gap-6 p-5 md:p-10 lg:grid-cols-[0.88fr_1.12fr] lg:items-start">
        <aside className="space-y-5 pt-2">
          <div>
            <BrandLogo
              size="lg"
              variant="plain"
              className="h-24 w-[22rem] max-w-full sm:h-28 sm:w-[24rem]"
            />
          </div>

          <div className="nh-card-dark p-7">
            <p className="nh-eyebrow text-primary-foreground/70">New Profile</p>
            <h2 className="mt-3 text-4xl font-black uppercase leading-none md:text-5xl">Join an official club workspace.</h2>
            <p className="mt-4 border-l-4 border-secondary pl-4 text-primary-foreground/80">
              Create your account, pick your club, and enter with the right access path for students or advisors.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="nh-card p-4">
              <ShieldCheck className="h-7 w-7 text-secondary" />
              <h3 className="mt-3 font-black uppercase">Official access</h3>
              <p className="mt-2 text-sm text-muted-foreground">Choose the user role that matches your real university access.</p>
            </div>
            <div className="nh-card p-4">
              <Users className="h-7 w-7 text-secondary" />
              <h3 className="mt-3 font-black uppercase">Club context</h3>
              <p className="mt-2 text-sm text-muted-foreground">Your first club choice helps route your first dues-backed membership request.</p>
            </div>
          </div>
        </aside>

        <form className="nh-card bg-card p-5 md:p-8" onSubmit={handleSubmit}>
          <div className="mb-6 border-b-2 border-foreground pb-5">
            <p className="nh-eyebrow">Account Creation</p>
            <h2 className="mt-2 text-3xl font-black uppercase md:text-4xl">Create Account</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Use your Nile University email. We create your Club Services profile during signup.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <Label className="font-black uppercase tracking-[0.12em]">User Role</Label>
              <Select value={requestedRole} onValueChange={(value) => setRequestedRole(value as (typeof REQUESTED_ROLES)[number]["value"])}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose your user role" />
                </SelectTrigger>
                <SelectContent>
                  {REQUESTED_ROLES.map((roleOption) => (
                    <SelectItem key={roleOption.value} value={roleOption.value}>
                      {roleOption.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="font-black uppercase tracking-[0.12em]">
                {requestedRole === "advisor" ? "Advising Club" : "Club Association"}
              </Label>
              <Select disabled={isLoadingClubs || clubsFailed || clubs.length === 0} value={clubId} onValueChange={setClubId}>
                <SelectTrigger className="border-2 border-input bg-card">
                  <SelectValue
                    placeholder={
                      isLoadingClubs
                        ? "Loading official clubs..."
                        : clubsFailed
                          ? "Club list unavailable"
                          : "Select primary club"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {clubs.map((club) => (
                    <SelectItem key={club.id} value={club.id}>
                      {club.name}{club.code ? ` (${club.code})` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {isLoadingClubs
                  ? "We are loading the official signup clubs."
                  : clubsFailed
                    ? (clubsError instanceof Error ? clubsError.message : "We could not load clubs right now. Please refresh and try again.")
                    : clubs.length === 0
                      ? "No clubs are available yet. Ask Club Services to add the official clubs for production."
                      : "Choose the club tied to your first access request."}
              </p>
            </div>

            <div className="space-y-2">
              <Label className="font-black uppercase tracking-[0.12em]" htmlFor="full-name">
                Full Name
              </Label>
              <Input
                id="full-name"
                placeholder="As it appears on your ID"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label className="font-black uppercase tracking-[0.12em]" htmlFor="phone-number">
                Phone Number (WhatsApp)
              </Label>
              <Input
                id="phone-number"
                placeholder="08000000000"
                value={phoneNumber}
                onChange={(event) => setPhoneNumber(event.target.value)}
                required
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label className="font-black uppercase tracking-[0.12em]" htmlFor="signup-email">
                Nile University Email
              </Label>
              <Input
                id="signup-email"
                placeholder="name@nileuniversity.edu.ng"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground">Allowed domain: {getAllowedEmailDomainLabel()}</p>
            </div>

            <div className="space-y-2">
              <Label className="font-black uppercase tracking-[0.12em]" htmlFor="department">
                Department
              </Label>
              <Input
                id="department"
                placeholder="Computer Science"
                value={department}
                onChange={(event) => setDepartment(event.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label className="font-black uppercase tracking-[0.12em]" htmlFor="signup-password">
                Password
              </Label>
              <Input
                id="signup-password"
                placeholder="Use 8+ characters"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                minLength={8}
              />
              <p className="text-xs text-muted-foreground">
                {requestedRole === "advisor"
                  ? "Advisor access is tied to the club you selected."
                  : "Club Services assigns presidents, and presidents choose executives after membership becomes active."}
              </p>
            </div>

            {requestedRole === "student" ? (
              <>
                <div className="space-y-2">
                  <Label className="font-black uppercase tracking-[0.12em]" htmlFor="student-id">
                    Student ID (If You Have Gotten It)
                  </Label>
                  <NhStudentId id="student-id" value={studentId} onChange={setStudentId} required={false} />
                </div>
                <div className="space-y-2">
                  <Label className="font-black uppercase tracking-[0.12em]">Which One Are You?</Label>
                  <Select value={studentType} onValueChange={(value) => setStudentType(value as (typeof STUDENT_TYPE_OPTIONS)[number]["value"])}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose student type" />
                    </SelectTrigger>
                    <SelectContent>
                      {STUDENT_TYPE_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3 md:col-span-2">
                  <div className="rounded-2xl border-2 border-foreground bg-primary/10 p-4">
                    <p className="font-black uppercase">Club dues summary</p>
                    <p className="mt-2 text-sm text-muted-foreground">Bank: Providus Bank</p>
                    <p className="text-sm text-muted-foreground">Account Number: 1305861314</p>
                    <p className="text-sm text-muted-foreground">Account Name: Nile Arts &amp; Creative Hub</p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Freshers pay N10,000. Returning students pay N5,000.
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="font-black uppercase tracking-[0.12em]" htmlFor="payment-account-name">
                    Name On Account Used
                  </Label>
                  <Input
                    id="payment-account-name"
                    value={paymentAccountName}
                    onChange={(event) => setPaymentAccountName(event.target.value)}
                    placeholder="As shown on the payment account"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label className="font-black uppercase tracking-[0.12em]" htmlFor="payment-reference">
                    Payment Reference / Transaction ID
                  </Label>
                  <Input
                    id="payment-reference"
                    value={paymentReference}
                    onChange={(event) => setPaymentReference(event.target.value)}
                    placeholder="Bank transfer reference"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label className="font-black uppercase tracking-[0.12em]" htmlFor="payment-date">
                    Payment Date (Optional)
                  </Label>
                  <Input
                    id="payment-date"
                    type="date"
                    value={paymentPaidAt}
                    onChange={(event) => setPaymentPaidAt(event.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="font-black uppercase tracking-[0.12em]" htmlFor="proof-upload">
                    Upload Receipt
                  </Label>
                  <Input
                    id="proof-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleReceiptSelection}
                    disabled={isSubmitting || isUploadingReceipt}
                  />
                  {proofFileName ? (
                    <p className="text-xs text-muted-foreground">Selected: {proofFileName}</p>
                  ) : (
                    <p className="text-xs text-muted-foreground">Upload an image of the payment receipt to complete signup.</p>
                  )}
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label className="font-black uppercase tracking-[0.12em]" htmlFor="join-reason">
                    Why Did You Join This Club? (Optional)
                  </Label>
                  <Textarea
                    id="join-reason"
                    placeholder="Tell the club what drew you in."
                    value={joinReason}
                    onChange={(event) => setJoinReason(event.target.value)}
                    rows={3}
                  />
                </div>

              </>
            ) : null}
          </div>

          {signupError && (
            <div className="mt-6 border-2 border-destructive bg-destructive/10 p-4 text-sm font-bold text-destructive">
              {signupError}
            </div>
          )}

          <div className="mt-8 space-y-4">
            <Button className="h-14 w-full" disabled={isSubmitting || isUploadingReceipt} type="submit">
              {isSubmitting ? (
                <>
                  {isUploadingReceipt ? <Loader2 className="h-5 w-5 animate-spin" /> : null}
                  {isUploadingReceipt
                    ? "Uploading receipt..."
                    : pendingReceiptUpload
                      ? "Retrying receipt upload..."
                      : "Creating account..."}
                </>
              ) : (
                <>
                  {pendingReceiptUpload ? "Retry receipt upload" : "Complete registration"}
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </Button>

            <div className="flex items-start gap-3 border-2 border-foreground bg-muted p-4 text-sm">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-secondary" />
              <p>
                {requestedRole === "advisor"
                  ? "Advisor signup uses your Nile email and club choice without asking for a student ID."
                  : "Students use their Nile email, pick their first club, attach payment details, and the dues record is prepared automatically."}
              </p>
            </div>

            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link className="font-black text-foreground underline underline-offset-4" to="/login">
                Sign in
              </Link>
            </p>
          </div>
        </form>
      </section>
      <SiteFooter />
    </main>
  );
}
