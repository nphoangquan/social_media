import { SignIn } from "@clerk/nextjs";
import AuthCard from "@/components/auth/AuthCard";
import { authAppearance } from "@/components/auth/authAppearance";

export default function Page() {
  return (
    <AuthCard 
      title="Introvertia"
      description="Đăng nhập vào tài khoản"
    >
      <div className="px-7 py-8 animate-scaleIn">
        <SignIn 
          appearance={authAppearance}
          routing="path"
          path="/sign-in"
          signUpUrl="/sign-up"
        />
      </div>
    </AuthCard>
  );
}