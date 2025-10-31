import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";

export async function POST(request: NextRequest) {
  try {
    const supabase = createServiceClient();
    const body = await request.json();

    const {
      shop_id,
      customer_id,
      customer_name,
      customer_phone,
      customer_email,
      customer_address,
      order_type,
      payment_method,
      subtotal,
      delivery_cost,
      discount_percentage = 0,
      total_amount,
      delivery_company_id,
      delivery_method_id,
      delivery_location_method_id,
      delivery_notes,
      products
    } = body;

    // Validate required fields
    const missingFields = [];
    if (!shop_id) missingFields.push('shop_id');
    if (!customer_name) missingFields.push('customer_name');
    if (!order_type) missingFields.push('order_type');
    if (!payment_method) missingFields.push('payment_method');
    if (!products || products.length === 0) missingFields.push('products');
    if (subtotal === undefined || subtotal === null) missingFields.push('subtotal');
    if (total_amount === undefined || total_amount === null) missingFields.push('total_amount');
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: "Missing required fields", missing: missingFields },
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
        { error: `Shop with ID ${shop_id} does not exist` },
        { status: 400 }
      );
    }

    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Prepare order data - only include optional foreign keys if they exist
    const orderData: any = {
      order_number: orderNumber,
      shop_id,
      customer_name,
      customer_phone,
      customer_email,
      customer_address,
      order_type,
      payment_method,
      status: "pending",
      subtotal,
      delivery_cost: delivery_cost || 0,
      discount_percentage,
      total_amount
    };

    // Only add customer_id if it exists (for authenticated users)
    if (customer_id) {
      orderData.customer_id = customer_id;
    }

    // Only add delivery_company_id if it exists
    if (delivery_company_id) {
      orderData.delivery_company_id = delivery_company_id;
    }

    // Create the order
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert(orderData)
      .select()
      .single();

    if (orderError) {
      console.error("Error creating order:", orderError);
      return NextResponse.json(
        { error: "Failed to create order", message: orderError.message },
        { status: 500 }
      );
    }

    // Create order products
    const orderProducts = [];
    for (const orderProduct of products) {
      const { product_id, selected_features = [] } = orderProduct;

      // Fetch product details
      const { data: product, error: productError } = await supabase
        .from("products")
        .select("name, price, sale_price, onsale")
        .eq("id", product_id)
        .single();

      if (productError || !product) {
        console.error(`Product ${product_id} not found:`, productError);
        continue;
      }

      // Determine base price
      const unitPrice = product.price;
      const salePrice = product.onsale && product.sale_price ? product.sale_price : null;
      const finalUnitPrice = salePrice || unitPrice;

      // Calculate features total
      let featuresTotal = 0;
      const processedFeatures = [];

      for (const feature of selected_features) {
        const { feature_id, value_id } = feature;

        // Fetch feature details
        const { data: featureData } = await supabase
          .from("products_features")
          .select("name")
          .eq("id", feature_id)
          .single();

        // Fetch feature value details
        const { data: featureValue } = await supabase
          .from("products_features_values")
          .select("name, price_addition")
          .eq("id", value_id)
          .single();

        if (featureData && featureValue) {
          const priceAddition = featureValue.price_addition || 0;
          featuresTotal += priceAddition;

          processedFeatures.push({
            feature_id,
            feature_name: featureData.name,
            value_id,
            value_name: featureValue.name,
            price_addition: priceAddition
          });
        }
      }

      const itemTotal = finalUnitPrice + featuresTotal;

      // Insert order product
      const { data: orderProductData, error: orderProductError } = await supabase
        .from("orders_products")
        .insert({
          order_id: order.id,
          product_id,
          product_name: product.name,
          unit_price: unitPrice,
          sale_price: salePrice,
          final_unit_price: finalUnitPrice,
          selected_features: processedFeatures,
          features_total: featuresTotal,
          item_total: itemTotal
        })
        .select()
        .single();

      if (!orderProductError && orderProductData) {
        orderProducts.push(orderProductData);
      }
    }

    // Create delivery record if it's a delivery order and has valid delivery company/method
    if (order_type === "delivery" && delivery_company_id && delivery_method_id) {
      const { error: deliveryError } = await supabase
        .from("orders_delivery")
        .insert({
          order_id: order.id,
          delivery_company_id,
          delivery_method_id,
          delivery_location_method_id,
          method_price: delivery_cost || 0,
          location_price: 0,
          total_delivery_cost: delivery_cost || 0,
          delivery_address: customer_address,
          delivery_notes
        });

      if (deliveryError) {
        console.error("Error creating delivery record:", deliveryError);
        // Don't fail the order if delivery record fails
      }
    }

    // Create initial order status
    const { error: statusError } = await supabase
      .from("orders_status")
      .insert({
        order_id: order.id,
        status: "pending",
        changed_by: customer_id,
        notes: "Order created"
      });

    if (statusError) {
      console.error("Error creating order status:", statusError);
    }

    return NextResponse.json({
      success: true,
      data: {
        ...order,
        products: orderProducts
      }
    });
  } catch (error: any) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { error: "Failed to create order", message: error.message },
      { status: 500 }
    );
  }
}
