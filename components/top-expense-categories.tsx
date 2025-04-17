import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { fetchTopExpenseCategories } from "@/lib/data"

export async function TopExpenseCategories() {
  const categories = await fetchTopExpenseCategories()

  // Find the highest amount for percentage calculation
  const maxAmount = categories.length > 0 ? Math.max(...categories.map((cat) => cat.amount)) : 0

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Expense Categories</CardTitle>
      </CardHeader>
      <CardContent>
        {categories.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No expense data available</p>
        ) : (
          <div className="space-y-4">
            {categories.map((category) => (
              <div key={category.category} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{category.category}</span>
                  <span className="text-sm text-muted-foreground">
                    {new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                      maximumFractionDigits: 0,
                    }).format(category.amount)}
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-muted">
                  <div
                    className="h-2 rounded-full bg-primary"
                    style={{ width: `${(category.amount / maxAmount) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
