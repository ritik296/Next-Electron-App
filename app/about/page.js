'use client'
import { useEffect, useState } from "react"
import Link from "next/link"


export default function About() {
    const [electron, setElectron] = useState(null)
    useEffect(() => {
      setElectron(window.electron)
    }, [])
    return (
        <div>
            <h1 className="">About Page</h1>
            <p className="">Home Dir: {electron?.homeDir}</p>
            <p className="">Os Version: {electron?.osVersion}</p>
            <p className="">Arch: {electron?.arch}</p>

            <br />
            <Link href='/'>Home</Link>
        </div>
    )
}