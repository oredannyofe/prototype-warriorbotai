export async function getConsent(): Promise<boolean> {
  try { const v = await import('@react-native-async-storage/async-storage');
    const s = await v.default.getItem('consented');
    return s === 'yes';
  } catch { return false; }
}

export async function setConsent(val: boolean): Promise<void> {
  try { const v = await import('@react-native-async-storage/async-storage');
    if (val) await v.default.setItem('consented', 'yes'); else await v.default.removeItem('consented');
  } catch {}
}
