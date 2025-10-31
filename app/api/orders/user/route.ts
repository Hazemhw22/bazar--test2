import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();

    console.log("Fetching orders for userId:", userId);

    // First, get the user profile to check both IDs
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("id, user_id")
      .eq("user_id", userId)
      .maybeSingle();

    console.log("User profile:", profile);

    // Try to fetch orders using auth user_id first
    let { data: orders, error } = await supabase
      .from("orders")
      .select(`
        id,
        order_number,
        total_amount,
        subtotal,
        delivery_cost,
        discount_percentage,
        customer_name,
        customer_phone,
        customer_email,
        customer_address,
        order_type,
        payment_method,
        status,
        created_at,
        updated_at,
        confirmed_at,
        completed_at,
        shop_id,
        delivery_company_id,
        assigned_driver_id,
        assigned_car_id,
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
            image_url,
            price
          )
        )
      `)
      .eq("customer_id", userId)
      .order("created_at", { ascending: false });

    console.log("Orders with auth user_id:", orders?.length || 0, "Error:", error?.message);

    // If no orders found with auth user_id and we have a profile, try with profile.id
    if ((!orders || orders.length === 0) && profile?.id && !error) {
      console.log("Trying with profile.id:", profile.id);
      const result = await supabase
        .from("orders")
        .select(`
          id,
          order_number,
          total_amount,
          subtotal,
          delivery_cost,
          discount_percentage,
          customer_name,
          customer_phone,
          customer_email,
          customer_address,
          order_type,
          payment_method,
          status,
          created_at,
          updated_at,
          confirmed_at,
          completed_at,
          shop_id,
          delivery_company_id,
          assigned_driver_id,
          assigned_car_id,
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
              image_url,
              price
            )
          )
        `)
        .eq("customer_id", profile.id)
        .order("created_at", { ascending: false });
      
      orders = result.data;
      error = result.error;
      console.log("Orders with profile.id:", orders?.length || 0, "Error:", error?.message);
    }

    if (error) {
      console.error("Orders fetch error:", error);
      return NextResponse.json(
        { error: "Failed to fetch orders", details: error.message },
        { status: 500 }
      );
    }

    console.log("Returning orders count:", orders?.length || 0);
    return NextResponse.json({ orders: orders || [] });
  } catch (error: any) {
    console.error("Error fetching user orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders", details: error?.message || "Unknown error" },
      { status: 500 }
    );
  }
}
