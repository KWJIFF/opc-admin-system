import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface PageShellProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
  actions?: React.ReactNode;
  children: React.ReactNode;
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.02,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 400,
      damping: 30,
    },
  },
};

export { containerVariants, itemVariants };

export default function PageShell({ title, description, icon, action, actions, children }: PageShellProps) {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* Page Header */}
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          {icon && (
            <div className="p-2.5 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 text-primary ring-1 ring-primary/10">
              {icon}
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">{title}</h1>
            {description && (
              <p className="text-[13px] text-muted-foreground mt-0.5">{description}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {actions}
          {action && (
            <Button
              onClick={action.onClick}
              className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-md shadow-primary/15 hover:shadow-lg hover:shadow-primary/20 btn-press rounded-xl h-9 px-4 text-[13px] font-medium"
            >
              <Plus className="h-4 w-4 mr-1" />
              {action.label}
            </Button>
          )}
        </div>
      </motion.div>
      {children}
    </motion.div>
  );
}
