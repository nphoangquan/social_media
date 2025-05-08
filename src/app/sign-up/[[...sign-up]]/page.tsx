import { SignUp } from "@clerk/nextjs";
import AuthCard from "@/components/auth/AuthCard";
import { authAppearance } from "@/components/auth/authAppearance";

export default function Page() {
  return (
    <AuthCard 
      title="Introvertia"
      description="Tạo tài khoản"
    >
      <div className="px-7 py-8 animate-scaleIn">
        <SignUp 
          appearance={authAppearance}
          routing="path"
          path="/sign-up"
          signInUrl="/sign-in"
        />
      </div>
    </AuthCard>
  );
}