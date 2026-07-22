import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  containerClassName?: string;
}

function SearchInput({
  className,
  containerClassName,
  ...props
}: SearchInputProps) {
  return (
    <div className={cn("relative group", containerClassName)}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-brand-muted group-focus-within:text-brand-primary transition-colors" />
      <input
        type="text"
        className={cn(
          "bg-bg-subtle border border-border-card rounded-xl pl-9 pr-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-brand-primary/50 transition-all placeholder:text-text-muted",
          className,
        )}
        {...props}
      />
    </div>
  );
}

export { SearchInput };
