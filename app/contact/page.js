'use client';
import { useEffect, useState } from 'react';
import Link from "next/link"

export default function Contact() {
    const [state, setState] = useState(null);

    useEffect(() => {
        window.electron.ipcRenderer.send('redux-current-state')
    }, [])
    useEffect(() => {
        window.counter.subscribeToState((updatedState) => {
            console.log(updatedState)
            setState(updatedState?.counter?.value);
        });
    }, [])
    function handleIncrement() {
        window.counter.dispatchAction({ type: 'counter/increment' });
    }
    function handleDecrement() {
        window.counter.dispatchAction({ type: 'counter/decrement' });
    }
    return (
        <div className="">
            <h1 className="">Contant Page</h1>
            <div>
                <h1>Electron-Redux State: {state || 0}</h1>
                <br />
                <button className="bg-blue-600 py-2 px-4 text-white rounded-md mr-4" onClick={handleIncrement}>Increment</button>
                <button className="bg-red-600 py-2 px-4 text-white rounded-md" onClick={handleDecrement}>Decrement</button>
            </div>
            <br/>
            <Link href='/'>Home</Link>
        </div>
    )
}