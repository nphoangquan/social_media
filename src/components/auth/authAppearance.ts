import { Appearance } from "@clerk/types";

export const authAppearance: Appearance = {
  elements: {
    formButtonPrimary: 
      "bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-medium py-3 rounded-lg relative overflow-hidden shadow-lg shadow-emerald-500/20 transition-all duration-300 transform hover:scale-[1.01]",
    card: "shadow-none border-none bg-transparent p-0",
    headerTitle: "text-xl font-semibold text-card-foreground hidden",
    headerSubtitle: "text-muted-foreground hidden",
    socialButtonsBlockButton: 
      "border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-all duration-300 shadow-sm text-sm font-medium rounded-lg py-2.5",
    socialButtonsBlockButtonText: "text-zinc-800 dark:text-zinc-200 font-medium",
    socialButtonsBlockButtonArrow: "text-zinc-500 dark:text-zinc-400",
    socialButtonsIconButton: 
      "border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-all duration-300 shadow-sm text-zinc-800 dark:text-zinc-200 rounded-lg",
    formFieldLabel: "text-zinc-800 dark:text-zinc-200 font-medium text-sm mb-1.5",
    formFieldInput: 
      "bg-zinc-800/50 border border-zinc-700 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 rounded-lg shadow-sm py-3 px-4 text-sm transition-all duration-300 text-white",
    footerActionText: "text-zinc-500 dark:text-zinc-400",
    footerActionLink: "text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-medium transition-colors",
    identityPreviewText: "text-zinc-800 dark:text-zinc-200",
    identityPreviewEditButton: "text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300",
    dividerLine: "bg-zinc-200 dark:bg-zinc-700",
    dividerText: "text-zinc-500 dark:text-zinc-400 font-medium text-sm px-3",
    formFieldAction: "text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-medium",
    otpCodeFieldInput: 
      "bg-zinc-800/50 border border-zinc-700 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 rounded-lg shadow-sm p-3 text-center text-white",
    formResendCodeLink: "text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-medium",
    navbar: "hidden",
    navbarButtons: "hidden",
    logoBox: "hidden",
    logoImage: "hidden",
    header: "pt-0",
    main: "gap-4",
    form: "gap-5",
    footer: "text-zinc-400 mt-4 pb-0",
    formButtonReset: 
      "text-zinc-600 dark:text-zinc-300 hover:text-zinc-700 dark:hover:text-zinc-100 border border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 font-medium text-sm py-3 rounded-lg transition-all duration-300",
    formFieldInputShowPasswordButton: "text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200",
    formFieldWarningText: "text-amber-600 dark:text-amber-400 text-sm",
    formFieldErrorText: "text-rose-600 dark:text-rose-400 text-sm",
    footerCard: "bg-transparent dark:bg-transparent border-t border-zinc-200 dark:border-zinc-800/50 rounded-b-xl",
    rootBox: "rounded-xl overflow-hidden",
  },
  layout: {
    socialButtonsVariant: "iconButton",
    socialButtonsPlacement: "bottom",
    showOptionalFields: false,
  },
  variables: {
    colorPrimary: "#10b981",
    colorText: "#ffffff",
    colorTextSecondary: "#a1a1aa",
    colorBackground: "#18181b",
    colorDanger: "#e11d48",
    colorSuccess: "#10b981",
    colorWarning: "#f59e0b",
    fontFamily: "Inter, system-ui, sans-serif",
    borderRadius: "0.5rem",
    spacingUnit: "1rem",
  }
}; 