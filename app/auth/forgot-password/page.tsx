import AuthForm from "@/app/auth/auth-form";
import { authConfigMissingMessage } from "@/lib/auth";

export default function ForgotPasswordPage() {
  return <AuthForm mode="forgot" configMessage={authConfigMissingMessage()} />;
}
