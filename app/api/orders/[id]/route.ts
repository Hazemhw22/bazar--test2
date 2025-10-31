import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServiceClient();
    const orderId = params.id;

    // Fetch order with all related data using service role (bypasses RLS)
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
      .eq("id", orderId)
      .single();

    if (error || !order) {
      console.error("Order fetch error:", error);
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    // Debug: Log the order structure
    console.log("Order fetched:", JSON.stringify(order, null, 2));
    console.log("Orders products:", order.orders_products);
    if (order.orders_products && order.orders_products.length > 0) {
      console.log("First product:", order.orders_products[0]);
      console.log("First product.products:", order.orders_products[0].products);
    }

    return NextResponse.json({ order });
  } catch (error) {
    console.error("Error fetching order:", error);
    return NextResponse.json(
      { error: "Failed to fetch order" },
      { status: 500 }
    );
  }
}
