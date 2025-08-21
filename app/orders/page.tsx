import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Button } from "../../components/ui/button"

export default function OrdersPage() {
  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Your Orders</h1>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Order #12345</CardTitle>
            <p className="text-sm text-muted-foreground">Placed on May 15, 2025</p>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 items-start">
              <div className="w-full md:w-1/4 relative h-[120px]">
                <Image
                  src="/placeholder.svg?height=120&width=120"
                  alt="Product"
                  fill
                  style={{ objectFit: "contain" }}
                  className="rounded-md border"
                  priority
                />
              </div>
              <div className="flex-1">
                <h3 className="font-medium">Product 1</h3>
                <p className="text-sm text-muted-foreground">Store 1</p>
                <p className="mt-2 font-medium">$75.00</p>
                <div className="mt-4 flex gap-2">
                  <Button variant="outline" size="sm">
                    Track Order
                  </Button>
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </div>
              </div>
              <div className="w-full md:w-auto mt-4 md:mt-0">
                <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-green-50 text-green-700 border-green-200">
                  Delivered
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Order #12346</CardTitle>
            <p className="text-sm text-muted-foreground">Placed on May 18, 2025</p>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 items-start">
              <div className="w-full md:w-1/4 relative h-[120px]">
                <Image
                  src="/placeholder.svg?height=120&width=120"
                  alt="Product"
                  fill
                  style={{ objectFit: "contain" }}
                  className="rounded-md border"
                  priority
                />
              </div>
              <div className="flex-1">
                <h3 className="font-medium">Product 2</h3>
                <p className="text-sm text-muted-foreground">Store 2</p>
                <p className="mt-2 font-medium">$85.00</p>
                <div className="mt-4 flex gap-2">
                  <Button variant="outline" size="sm">
                    Track Order
                  </Button>
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </div>
              </div>
              <div className="w-full md:w-auto mt-4 md:mt-0">
                <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-yellow-50 text-yellow-700 border-yellow-200">
                  In Transit
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
