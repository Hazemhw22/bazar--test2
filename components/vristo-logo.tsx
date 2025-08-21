import type React from "react";
import Image from "next/image";
import clsx from "clsx";

interface VristoLogoProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: number; // يتحكم في حجم الشعار (الصورة + النص)
}

export function VristoLogo({
  size = 60, // حجم افتراضي متوسط
  className,
  ...props
}: VristoLogoProps) {

  return (
    <div
      className={clsx("flex items-center gap-2", className)}
      style={{ height: size }}
      {...props}
    >
      <Image src="/pazar.png" alt="Logo" width={size} height={size} priority />
      
    </div>
  );
}
