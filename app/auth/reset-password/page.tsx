import AuthForm from "@/app/auth/auth-form";
import { authConfigMissingMessage } from "@/lib/auth";

export default function ResetPasswordPage() {
  return <AuthForm mode="reset" configMessage={authConfigMissingMessage()} />;
}
