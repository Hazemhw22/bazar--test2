"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Breadcrumbs } from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import StorefrontIcon from "@mui/icons-material/Storefront";
import CategoryIcon from "@mui/icons-material/Category";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import InfoIcon from "@mui/icons-material/Info";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

// خريطة الأيقونات حسب المسار
const iconMap: Record<string, React.ReactNode> = {
  shops: <StorefrontIcon fontSize="small" className="mr-1" />,
  categories: <CategoryIcon fontSize="small" className="mr-1" />,
  products: <ShoppingBagIcon fontSize="small" className="mr-1" />,
  about: <InfoIcon fontSize="small" className="mr-1" />,
};

const BreadcrumbsNav = () => {
  const pathname = usePathname();
  const [dynamicLabels, setDynamicLabels] = useState<Record<string, string>>(
    {}
  );

  useEffect(() => {
    const segments = pathname.split("/").filter(Boolean);

    // جلب اسم المنتج الحقيقي
    if (segments[0] === "products" && segments[1]) {
      const id = segments[1];
      supabase
        .from("products")
        .select("title")
        .eq("id", id)
        .single()
        .then(({ data }) => {
          if (data?.title) {
            setDynamicLabels((prev) => ({
              ...prev,
              [id]: data.title,
            }));
          }
        });
    }
    // جلب اسم المتجر الحقيقي
    if (segments[0] === "shops" && segments[1]) {
      const id = segments[1];
      supabase
        .from("shops")
        .select("shop_name")
        .eq("id", id)
        .single()
        .then(({ data }) => {
          if (data?.shop_name) {
            setDynamicLabels((prev) => ({
              ...prev,
              [id]: data.shop_name,
            }));
          }
        });
    }
    // جلب اسم التصنيف الحقيقي
    if (segments[0] === "categories" && segments[1]) {
      const id = segments[1];
      supabase
        .from("categories")
        .select("title")
        .eq("id", id)
        .single()
        .then(({ data }) => {
          if (data?.title) {
            setDynamicLabels((prev) => ({
              ...prev,
              [id]: data.title,
            }));
          }
        });
    }
  }, [pathname]);

  if (pathname === "/") return null;

  const segments = pathname.split("/").filter(Boolean);

  const breadcrumbs = segments.map((segment, i) => {
    const href = "/" + segments.slice(0, i + 1).join("/");
    const isLast = i === segments.length - 1;

    // إذا كان segment عبارة عن id (رقم)، استبدله بالاسم الديناميكي إذا توفر
    const isId = /^\d+$/.test(segment);
    let label = decodeURIComponent(
      segment.charAt(0).toUpperCase() + segment.slice(1)
    );
    if (isId && dynamicLabels[segment]) {
      label = dynamicLabels[segment];
    }

    // أضف أيقونة إذا كان المسار معرف في iconMap
    const icon =
      iconMap[segments[i]] || (i > 0 && iconMap[segments[i - 1]]) || null;

    return isLast ? (
      <span
        key={href}
        className="flex items-center text-sm font-medium text-muted-foreground dark:text-gray-300"
      >
        {icon}
        {label}
      </span>
    ) : (
      <Link
        key={href}
        href={href}
        className="flex items-center text-sm text-gray-500 dark:text-gray-400 hover:underline"
      >
        {icon}
        {label}
      </Link>
    );
  });

  return (
    <div className="w-full py-3 flex justify-center">
      <div className="max-w-5xl w-full px-4">
        <Breadcrumbs
          separator={<NavigateNextIcon fontSize="small" />}
          aria-label="breadcrumb"
          classes={{ separator: "text-gray-400 dark:text-gray-500" }}
        >
          <Link
            href="/"
            className="flex items-center text-sm text-gray-500 dark:text-gray-400 hover:underline"
          >
            <HomeIcon fontSize="small" className="mr-1" />
            Home
          </Link>
          {breadcrumbs}
        </Breadcrumbs>
      </div>
    </div>
  );
};

export default BreadcrumbsNav;
