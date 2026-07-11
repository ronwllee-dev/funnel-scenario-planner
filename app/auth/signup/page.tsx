import AuthForm from "@/app/auth/auth-form";
import { authConfigMissingMessage } from "@/lib/auth";

export default function SignupPage() {
  return <AuthForm mode="signup" configMessage={authConfigMissingMessage()} />;
}
