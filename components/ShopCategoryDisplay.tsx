'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';

interface ShopCategoryDisplayProps {
  shopCategoryId?: number | null;
}

// مكون عرض كاتيجوري المتجر
export default function ShopCategoryDisplay({ shopCategoryId }: ShopCategoryDisplayProps) {
  const [shopCategory, setShopCategory] = useState<any>(null);
  
  useEffect(() => {
    if (shopCategoryId) {
      const fetchShopCategory = async () => {
        try {
          const { data } = await supabase
            .from('shops_categories')
            .select('*')
            .eq('id', shopCategoryId)
            .single();
          if (data) setShopCategory(data);
        } catch (error: unknown) {
          console.error('Error fetching shop category:', error);
        }
      };
      fetchShopCategory();
    }
  }, [shopCategoryId]);
  
  if (!shopCategory) return null;
  
  return (
    <div>
      <span className="inline-flex items-center gap-3 px-4 py-2 rounded-full text-sm font-medium bg-gradient-to-br from-indigo-700 to-indigo-500 text-white shadow-lg ring-2 ring-indigo-400/50 transition-transform hover:scale-[1.02]">
        {shopCategory.image_url ? (
          <div className="w-6 h-6 rounded-full overflow-hidden flex-shrink-0">
            <Image
              src={shopCategory.image_url}
              alt={shopCategory.name}
              width={24}
              height={24}
              className="object-cover w-full h-full"
            />
          </div>
        ) : (
          <span className="text-sm">🏦</span>
        )}
        <span className="font-semibold">{shopCategory.name}</span>
      </span>
    </div>
  );
}
