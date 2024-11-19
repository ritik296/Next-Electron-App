'use client'
import Link from "next/link";
import { useEffect, useState } from "react";
import { useSelector, useDispatch } from 'react-redux';
import { increment, decrement } from '@/store';

export default function Home() {
  const count = useSelector((state) => state.counter.value);
  const dispatch = useDispatch();
  const [updateStatus, setUpdateStatus] = useState("Idle");

  let electron;
  useEffect(()=>{
    electron = window.electron;
  }, [])
  useEffect(() =>  {
    electron?.ipcRenderer.on('pong', (e, data) => {
      Notification.requestPermission().then((result) => {
        new Notification('Notification from next app', {
          body: "Pong recived"
        })
      })
    })
  }, [])

  // useEffect(() => {
  //   const updater = window.updater;
  //   if (updater) {
  //     updater.onStatusChange((status) => setUpdateStatus(status));
  //   }
  // }, []);
  
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-8 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <p>Update Status: {updateStatus}</p>
      <h1 className="">Home Page</h1>
      <Link href='/about'>About</Link>
      <Link href='/contact'>Contact</Link>
      <button className="bg-teal-600 py-2 px-4 text-white rounded-md" onClick={() => electron.ipcRenderer.send("ping", "Hello")}>Ping</button>
      <div style={{ textAlign: 'center', padding: '20px' }}>
        <h1>Counter: {count}</h1>
        <br />
        <button className="bg-blue-600 py-2 px-4 text-white rounded-md mr-4" onClick={() => dispatch(increment())}>Increment</button>
        <button className="bg-red-600 py-2 px-4 text-white rounded-md" onClick={() => dispatch(decrement())}>Decrement</button>
      </div>
    </div>
  );
}
