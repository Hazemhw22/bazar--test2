import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { createClient } from "@supabase/supabase-js";

export async function GET(request: NextRequest) {
  try {
    const supabase = createServiceClient();
    
    // Get user ID from query params (passed from client)
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Fetch latest order for user using service role (bypasses RLS)
    const { data: order, error } = await supabase
      .from("orders")
      .select(`
        id,
        order_number,
        total_amount,
        subtotal,
        delivery_cost,
        customer_address,
        order_type,
        payment_method,
        status,
        created_at,
        shops:shop_id (
          id,
          name,
          logo_url
        ),
        orders_products (
          id,
          product_name,
          final_unit_price,
          item_total,
          product_id,
          products:product_id (
            id,
            name,
            image_url
          )
        )
      `)
      .eq("customer_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error("Error fetching latest order:", error);
      return NextResponse.json(
        { error: "Failed to fetch order" },
        { status: 500 }
      );
    }

    if (!order) {
      return NextResponse.json(
        { error: "No orders found" },
        { status: 404 }
      );
    }

    // Debug: Log the order structure
    console.log("Latest order fetched:", JSON.stringify(order, null, 2));
    console.log("Orders products:", order.orders_products);
    if (order.orders_products && order.orders_products.length > 0) {
      console.log("First product:", order.orders_products[0]);
      console.log("First product.products:", order.orders_products[0].products);
    }

    return NextResponse.json({ order });
  } catch (error) {
    console.error("Error fetching latest order:", error);
    return NextResponse.json(
      { error: "Failed to fetch order" },
      { status: 500 }
    );
  }
}
