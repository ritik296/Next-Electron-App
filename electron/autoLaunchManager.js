import AutoLaunch from 'auto-launch';

const appLauncher = new AutoLaunch({
  name: 'NextJSElectron', 
  path: process.execPath, 
});

export const enableAutoLaunch = async () => {
  try {
    await appLauncher.enable();
    console.log("Auto-launch enabled.");
    return { success: true, enabled: true };
  } catch (error) {
    console.error("Error enabling auto-launch:", error);
    return { success: false, error: error.message };
  }
};

export const disableAutoLaunch = async () => {
  try {
    await appLauncher.disable();
    console.log("Auto-launch disabled.");
    return { success: true, enabled: false };
  } catch (error) {
    console.error("Error disabling auto-launch:", error);
    return { success: false, error: error.message };
  }
};

export const isAutoLaunchEnabled = async () => {
  try {
    const isEnabled = await appLauncher.isEnabled();
    console.log("Auto-launch status:", isEnabled);
    return { success: true, enabled: isEnabled };
  } catch (error) {
    console.error("Error checking auto-launch status:", error);
    return { success: false, error: error.message };
  }
};

