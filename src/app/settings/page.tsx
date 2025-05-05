import LeftMenu from "@/components/leftMenu/LeftMenu";
import RightMenu from "@/components/rightMenu/RightMenu";
import SyncAvatarButton from "@/components/rightMenu/SyncAvatarButton";
import { User } from "lucide-react";

const SettingsPage = () => {  
  return (  
    <div className="flex gap-6 pt-6">
      <div className="hidden xl:block w-[20%]">
        <LeftMenu type="home" />
      </div>
      
      <div className="w-full lg:w-[70%] xl:w-[50%]">
        <div className="p-6 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm rounded-2xl shadow-lg dark:shadow-zinc-800/20 border border-zinc-100/50 dark:border-zinc-800/50">
          <h1 className="text-2xl font-semibold text-zinc-800 dark:text-zinc-100 mb-6">Settings</h1>
          
          {/* Avatar Sync Section */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <User className="w-5 h-5 text-emerald-500" />
              <h2 className="text-lg font-medium text-zinc-800 dark:text-zinc-200">Profile Avatar</h2>
            </div>
            
            <div className="pl-7">
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
                If your profile avatar doesn&apos;t update after changing it in Clerk, you can manually sync it using the button below.
              </p>
              
              <SyncAvatarButton />
            </div>
          </div>
          
          {/* Additional settings sections can be added here - Có thể thêm 1 số setting khác ở đây*/}
        </div>
      </div>
      
      <div className="hidden lg:block w-[30%]">
        <RightMenu />
      </div>
    </div>
  );
}  

export default SettingsPage;