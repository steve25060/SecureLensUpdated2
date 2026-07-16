import AuthLayout from "@/components/auth/AuthLayout";
import RegisterForm from "@/components/auth/RegisterForm";

export default function RegisterPage() {
  return (
    <AuthLayout
      title="Create Account"
      subtitle="Start securing your applications with a modern security intelligence platform."
    >
      <RegisterForm />
    </AuthLayout>
  );
}
