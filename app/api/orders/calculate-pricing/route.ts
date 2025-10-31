import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";

export async function POST(request: NextRequest) {
  try {
    const supabase = createServiceClient();
    const body = await request.json();

    const {
      shop_id,
      products,
      delivery_company_id,
      delivery_method_id,
      delivery_location_method_id,
      discount_percentage = 0,
      order_type
    } = body;

    // Validate required fields
    if (!shop_id || !products || products.length === 0) {
      return NextResponse.json(
        { error: "Missing required fields: shop_id and products" },
        { status: 400 }
      );
    }

    // Validate that the shop exists
    const { data: shop, error: shopError } = await supabase
      .from("shops")
      .select("id")
      .eq("id", shop_id)
      .single();

    if (shopError || !shop) {
      return NextResponse.json(
        { error: `Shop with ID ${shop_id} does not exist. Please ensure products are from a valid shop.` },
        { status: 400 }
      );
    }

    // Calculate subtotal from products
    let subtotal = 0;

    for (const orderProduct of products) {
      const { product_id, selected_features = [] } = orderProduct;

      // Fetch product details
      const { data: product, error: productError } = await supabase
        .from("products")
        .select("price, sale_price, onsale")
        .eq("id", product_id)
        .single();

      if (productError || !product) {
        return NextResponse.json(
          { error: `Product with ID ${product_id} not found` },
          { status: 404 }
        );
      }

      // Determine base price (use sale_price if onsale, otherwise regular price)
      const basePrice = product.onsale && product.sale_price 
        ? product.sale_price 
        : product.price;

      // Calculate features total
      let featuresTotal = 0;
      for (const feature of selected_features) {
        const { feature_id, value_id } = feature;

        // Fetch feature value price addition
        const { data: featureValue, error: featureError } = await supabase
          .from("products_features_values")
          .select("price_addition")
          .eq("id", value_id)
          .eq("feature_id", feature_id)
          .single();

        if (!featureError && featureValue) {
          featuresTotal += featureValue.price_addition || 0;
        }
      }

      // Item total = base price + features total
      const itemTotal = basePrice + featuresTotal;
      subtotal += itemTotal;
    }

    // Calculate delivery cost
    let delivery_cost = 0;

    if (order_type === "delivery" && delivery_method_id) {
      // Fetch delivery method price
      const { data: deliveryMethod, error: methodError } = await supabase
        .from("delivery_methods")
        .select("price_addition")
        .eq("id", delivery_method_id)
        .single();

      if (!methodError && deliveryMethod) {
        delivery_cost += deliveryMethod.price_addition || 0;
      }

      // If there's a location-specific price, add it
      if (delivery_location_method_id) {
        const { data: locationMethod, error: locationError } = await supabase
          .from("delivery_locations_methods")
          .select("price_addition")
          .eq("id", delivery_location_method_id)
          .single();

        if (!locationError && locationMethod) {
          delivery_cost += locationMethod.price_addition || 0;
        }
      }
    }

    // Apply discount
    const discountAmount = (subtotal * discount_percentage) / 100;
    const total_amount = subtotal - discountAmount + delivery_cost;

    return NextResponse.json({
      success: true,
      data: {
        subtotal: Number(subtotal.toFixed(2)),
        delivery_cost: Number(delivery_cost.toFixed(2)),
        discount_percentage,
        discount_amount: Number(discountAmount.toFixed(2)),
        total_amount: Number(total_amount.toFixed(2))
      }
    });
  } catch (error: any) {
    console.error("Error calculating pricing:", error);
    return NextResponse.json(
      { error: "Failed to calculate pricing", message: error.message },
      { status: 500 }
    );
  }
}
