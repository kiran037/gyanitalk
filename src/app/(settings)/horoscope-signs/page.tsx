"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { gethororscope, updatehororscope } from "./fetch"
import { uploadImage } from "@/upload"



const buildImgSrc = (val?: string) => {
    if (!val) return "/placeholder.svg"
    return `${process.env.NEXT_PUBLIC_BASEURL}${val}`
}

export default function DefaultProfilesPage() {
    const { toast } = useToast()
    const [profiles, setProfiles] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    const [editingId, setEditingId] = useState<number | null>(null)
    const [editFile, setEditFile] = useState<File | null>(null)
    const [preview, setPreview] = useState<string | null>(null)
    const [uploadBusy, setUploadBusy] = useState(false)

    const load = async () => {
        setLoading(true)
        const res = await gethororscope()
        setProfiles(res.hororscope)
        setLoading(false)
    }

    useEffect(() => {
        load()
    }, [])

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        setEditFile(file)
        setPreview(URL.createObjectURL(file))
    }

    const handleUpdate = async (id: number) => {
        try {
            setUploadBusy(true)
            const profileUrl = await uploadImage(editFile!, "images");
            const res = await updatehororscope(id, profileUrl.path)
            if (res.status) {
                toast({ title: "Updated", description: "Profile updated" })
                setEditingId(null)
                setEditFile(null)
                setPreview(null)
                load()
            } else {
                toast({ title: "Error", description: res.message || "Update failed", variant: "destructive" })
            }
        } finally {
            setUploadBusy(false)
        }
    }

    if (loading) return <p>Loading...</p>

    return (
        <main className="container py-8">
            <h1 className="text-2xl font-bold mb-6">HoroScope Signs</h1>

            <div className="grid gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                {profiles.map((p) => {
                    const isEditing = editingId === p.id
                    const imgSrc = isEditing ? preview || buildImgSrc(p.image) : buildImgSrc(p.image)

                    return (
                        <Card key={p.id} className="flex  flex-col items-center p-4 border rounded-lg bg-white shadow hover:shadow-md transition-shadow duration-200 ">
                            <img
                                src={imgSrc}
                                alt={p.name}
                                className="h-20 w-20 object-cover rounded-md"
                            />

                            <div className="mt-2 text-sm font-medium text-center">{isEditing ? "Edit Profile" : p.name}</div>

                            {isEditing ? (
                                <div className="mt-2 w-full space-y-2">
                                    <Input type="file" accept="image/*" onChange={handleFileChange} />
                                    <div className="flex justify-between gap-2">
                                        <Button size="sm" variant="outline" onClick={() => { setEditingId(null); setPreview(null) }}>
                                            Cancel
                                        </Button>
                                        <Button size="sm" onClick={() => handleUpdate(p.id)} disabled={uploadBusy}>
                                            {uploadBusy ? "Saving..." : "Save"}
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <Button
                                    size="sm"
                                    variant="secondary"
                                    className="mt-2"
                                    onClick={() => {
                                        setEditingId(p.id)
                                        setPreview(null)
                                    }}
                                >
                                    Change
                                </Button>
                            )}
                        </Card>
                    )
                })}
            </div>
        </main>
    )
}
