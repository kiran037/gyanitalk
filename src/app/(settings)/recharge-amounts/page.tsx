"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { getrechargeamount, createrechargeamount, updaterechargeamount } from "./fetch"

type Recharge = {
  id: number
  amount: number
  cashback?: number | null
}

export default function RechargePage() {
  const { toast } = useToast()
  const [items, setItems] = useState<Recharge[]>([])
  const [loading, setLoading] = useState(true)

  // Form for creating
  const [newAmount, setNewAmount] = useState("")
  const [newCashback, setNewCashback] = useState("")

  // Editing state
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editAmount, setEditAmount] = useState("")
  const [editCashback, setEditCashback] = useState("")

  const load = async () => {
    setLoading(true)
    const res = await getrechargeamount()
    setItems(res.rechargeamount)
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  const handleCreate = async () => {
    const res = await createrechargeamount({
      amount: parseInt(newAmount, 10),
      cashback: newCashback ? parseInt(newCashback, 10) : undefined,
    })
    if (res.status) {
      toast({ title: "Success", description: "Recharge amount added" })
      setNewAmount("")
      setNewCashback("")
      load()
    } else {
      toast({ title: "Error", description: res.message, variant: "destructive" })
    }
  }

  const handleUpdate = async (id: number) => {
    const res = await updaterechargeamount(id, {
      amount: parseInt(editAmount, 10),
      cashback: editCashback ? parseInt(editCashback, 10) : undefined,
    })
    if (res.status) {
      toast({ title: "Updated", description: "Recharge amount updated" })
      setEditingId(null)
      load()
    } else {
      toast({ title: "Error", description: res.message, variant: "destructive" })
    }
  }

  if (loading) return <p className="p-4">Loading...</p>

  return (
    <main className="container py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Recharge Amounts</h1>

      {/* Add Form */}
      <Card className="mb-8 shadow-lg border border-border rounded-xl bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
        <CardHeader>
          <CardTitle className="text-lg">Add New Recharge</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <div>
            <Label>Amount</Label>
            <Input
              type="number"
              value={newAmount}
              onChange={(e) => setNewAmount(e.target.value)}
              placeholder="Enter recharge amount"
            />
          </div>
          <div>
            <Label>Cashback</Label>
            <Input
              type="number"
              value={newCashback}
              onChange={(e) => setNewCashback(e.target.value)}
              placeholder="Enter cashback (optional)"
            />
          </div>
          <Button onClick={handleCreate} className="self-end mt-2">Add Recharge</Button>
        </CardContent>
      </Card>

      {/* Grid of Cards */}
      <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {items.map((item) => {
          const isEditing = editingId === item.id
          return (
            <Card
              key={item.id}
              className="shadow-md hover:shadow-xl transition-shadow rounded-xl border border-border bg-white dark:bg-slate-900"
            >
              <CardHeader>
                <CardTitle className="text-lg">Recharge #{item.id}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {isEditing ? (
                  <>
                    <div>
                      <Label>Amount</Label>
                      <Input
                        type="number"
                        value={editAmount}
                        onChange={(e) => setEditAmount(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Cashback</Label>
                      <Input
                        type="number"
                        value={editCashback}
                        onChange={(e) => setEditCashback(e.target.value)}
                      />
                    </div>
                    <div className="flex gap-2 justify-end">
                      <Button variant="outline" size="sm" onClick={() => setEditingId(null)}>Cancel</Button>
                      <Button size="sm" onClick={() => handleUpdate(item.id)}>Save</Button>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="text-sm">
                      <span className="font-semibold">Amount:</span> ₹{item.amount}
                    </p>
                    <p className="text-sm">
                      <span className="font-semibold">Cashback:</span> {item.cashback ? `₹${item.cashback}` : "—"}
                    </p>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        setEditingId(item.id)
                        setEditAmount(item.amount.toString())
                        setEditCashback(item.cashback?.toString() || "")
                      }}
                    >
                      Edit
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </main>
  )
}
