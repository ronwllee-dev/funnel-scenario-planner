import AuthForm from "@/app/auth/auth-form";
import { authConfigMissingMessage } from "@/lib/auth";

export default function LoginPage() {
  return <AuthForm mode="login" configMessage={authConfigMissingMessage()} />;
}
