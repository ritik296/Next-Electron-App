'use client'
import { useEffect, useState } from "react"

export default function UpdateNotificationBar() {
	const [updateAvailable, setUpdateAvailable] = useState(false);
	const [appVersion, setAppVersion] = useState("");

	useEffect(() => {
		// Listen for update events
		window.electron.ipcRenderer.on("update-available", () => {
			setUpdateAvailable(true);
		});

		// Fetch the current version
		window.electron.ipcRenderer.send("get-version");
		window.electron.ipcRenderer.on("app-version", (event, version) => {
			setAppVersion(version);
		});

		return () => {
			window.electron.ipcRenderer.removeAllListeners("update-available");
			window.electron.ipcRenderer.removeAllListeners("app-version");
		};
	}, []);

	const handleUpdate = () => {
		window.electron.ipcRenderer.send("apply-update");
	};
	return (<>
		{updateAvailable && (
			<div className="fixed top-0 left-0 w-full bg-yellow-300 text-black py-1 px-4 shadow-lg flex justify-between items-center z-50">
				<span className="font-medium">
					A new update is available! Current version: {appVersion}
				</span>
				<button
					onClick={handleUpdate}
					className="bg-black text-white px-2 py-1 text-xs rounded-md hover:bg-gray-800 transition"
				>
					Update Now
				</button>
			</div>
		)}
	</>
	)
}